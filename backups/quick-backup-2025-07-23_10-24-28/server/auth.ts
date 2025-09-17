import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Disable secure in development
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("User deserialization error:", error);
      done(null, false);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validation
      if (!email || !password || !firstName) {
        return res.status(400).json({ error: "Email, password, and first name are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName: lastName || "",
      });

      // Login the user
      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { password: _, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // Two-Factor Authentication routes
  app.post('/api/auth/2fa/setup', requireAuth, async (req: any, res) => {
    try {
      const { TwoFactorService } = await import("./twoFactor");
      const userId = req.user.id;
      const userEmail = req.user.email;
      
      const setupData = await TwoFactorService.generateSetup(userId, userEmail);
      res.json(setupData);
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });

  app.post('/api/auth/2fa/enable', requireAuth, async (req: any, res) => {
    try {
      const { TwoFactorService } = await import("./twoFactor");
      const userId = req.user.id;
      const { totpCode, emailCode, secret, backupCodes } = req.body;

      let isValid = false;

      if (totpCode && secret) {
        isValid = TwoFactorService.verifyTOTP(secret, totpCode);
      } else if (emailCode) {
        isValid = await TwoFactorService.verifyCode(userId, emailCode, "email");
      }

      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      if (secret && backupCodes) {
        await TwoFactorService.enableTwoFactor(userId, secret, backupCodes);
      }

      const updatedUser = await storage.getUser(userId);
      res.json({ message: "2FA enabled successfully", user: updatedUser });
    } catch (error) {
      console.error("2FA enable error:", error);
      res.status(500).json({ message: "Failed to enable 2FA" });
    }
  });

  app.post('/api/auth/2fa/disable', requireAuth, async (req: any, res) => {
    try {
      const { TwoFactorService } = await import("./twoFactor");
      const userId = req.user.id;
      await TwoFactorService.disableTwoFactor(userId);
      
      const updatedUser = await storage.getUser(userId);
      res.json({ message: "2FA disabled successfully", user: updatedUser });
    } catch (error) {
      console.error("2FA disable error:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });

  app.post('/api/auth/2fa/send-email', requireAuth, async (req: any, res) => {
    try {
      const { TwoFactorService } = await import("./twoFactor");
      const userId = req.user.id;
      const userEmail = req.user.email;
      
      await TwoFactorService.sendEmailCode(userId, userEmail);
      res.json({ message: "Email code sent successfully" });
    } catch (error) {
      console.error("2FA email error:", error);
      res.status(500).json({ message: "Failed to send email code" });
    }
  });

  app.post('/api/auth/2fa/send-login-code', async (req, res) => {
    try {
      const { TwoFactorService } = await import("./twoFactor");
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await TwoFactorService.sendEmailCode(user.id, email);
      res.json({ message: "Login code sent successfully" });
    } catch (error) {
      console.error("2FA login email error:", error);
      res.status(500).json({ message: "Failed to send login code" });
    }
  });

  app.post('/api/auth/2fa/verify-login', async (req, res) => {
    try {
      const { TwoFactorService } = await import("./twoFactor");
      const { email, type, code } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let isValid = false;

      switch (type) {
        case "totp":
          if (user.twoFactorSecret) {
            isValid = TwoFactorService.verifyTOTP(user.twoFactorSecret, code);
          }
          break;
        case "email":
          isValid = await TwoFactorService.verifyCode(user.id, code, "email");
          break;
        case "backup":
          isValid = await TwoFactorService.verifyCode(user.id, code, "backup");
          break;
      }

      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Log user in after successful 2FA verification
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json(user);
      });
    } catch (error) {
      console.error("2FA verify login error:", error);
      res.status(500).json({ message: "Failed to verify 2FA code" });
    }
  });
}

// Authentication middleware
export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}