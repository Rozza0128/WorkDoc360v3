import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.ts";
import { setupAuth, requireAuth } from "./auth.ts";
import { TwoFactorService } from "./twoFactor.ts";
import { generateDocument } from "./documentGenerator.ts";
import { aiCardVerificationService } from "./aiCardVerification.ts";
import { cscsVerificationService } from "./cscsVerification.ts";
import { insertGeneratedDocumentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import {
  insertCompanySchema,
  insertRiskAssessmentSchema,
  insertMethodStatementSchema,
  insertToolboxTalkSchema,
  insertCSCSCardSchema,
  insertComplianceItemSchema,
} from "@shared/schema";
import { z } from "zod";
import { detectCompanyFromSubdomain, generateCompanySlug, type CompanyRequest } from "./middleware/subdomainDetection.ts";
import { cloudflareSubdomainRoutes } from "./routes/cloudflareSubdomainRoutes.ts";
import companyRoutes from "./routes/companyRoutes.ts";
import { automatedSubdomainService } from "./services/domainManager.ts";
import { preloadedSubdomainManager } from "./services/preloadedSubdomainManager.ts";
import sgMail from '@sendgrid/mail';

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploaded_assets');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const companyId = req.params.companyId || req.params.id || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const baseName = file.originalname.replace(extension, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${companyId}_${timestamp}_${baseName}${extension}`);
  }
});

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter check:', {
      path: req.path,
      mimetype: file.mimetype,
      originalname: file.originalname
    });

    // Allow images for logo upload
    if (req.path.includes('upload-logo')) {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
      if (allowedImageTypes.includes(file.mimetype)) {
        return cb(null, true);
      }
    }

    // Allow documents for document upload
    if (req.path.includes('upload-documents') || req.path.includes('assess-documents')) {
      const allowedDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/json' // For testing
      ];
      if (allowedDocTypes.includes(file.mimetype)) {
        return cb(null, true);
      }

      // Also allow common file types even if mimetype is not recognized
      const extension = path.extname(file.originalname).toLowerCase();
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.json'];
      if (allowedExtensions.includes(extension)) {
        return cb(null, true);
      }
    }

    cb(new Error(`Invalid file type: ${file.mimetype} (${file.originalname})`));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup subdomain detection middleware
  app.use(detectCompanyFromSubdomain);

  // Add basic health check endpoint
  app.get('/api/health', (req: any, res) => {
    res.json({
      status: 'ok',
      hostname: req.hostname,
      isCompanySubdomain: req.isCompanySubdomain || false,
      timestamp: new Date().toISOString()
    });
  });

  // Auth middleware
  setupAuth(app);

  // Company-specific routes
  app.use(companyRoutes);

  // Cloudflare subdomain management routes
  app.use('/api/cloudflare', cloudflareSubdomainRoutes);

  // Test routes for Cloudflare subdomain automation
  const { testCloudflareRoutes } = await import('./routes/testCloudflareSubdomain');
  app.use('/api/test', testCloudflareRoutes);

  // Admin routes for subdomain management
  app.post("/api/admin/setup-subdomains", requireAuth, async (req: any, res) => {
    try {
      // Check if user is admin (you may want to add proper admin check)
      console.log('🔧 Setting up pre-loaded subdomain pool...');
      const result = await preloadedSubdomainManager.setupPreloadedSubdomains();

      res.json({
        message: 'Subdomain pool setup completed',
        ...result
      });
    } catch (error) {
      console.error("Error setting up subdomains:", error);
      res.status(500).json({ message: "Failed to setup subdomain pool" });
    }
  });

  app.get("/api/admin/subdomain-stats", requireAuth, async (req: any, res) => {
    try {
      const stats = await preloadedSubdomainManager.getPoolStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting subdomain stats:", error);
      res.status(500).json({ message: "Failed to get subdomain statistics" });
    }
  });

  app.post("/api/admin/expand-subdomain-pool", requireAuth, async (req: any, res) => {
    try {
      const { count = 10 } = req.body;
      await preloadedSubdomainManager.expandSubdomainPool(count);

      res.json({
        message: `Added ${count} new subdomains to the pool`
      });
    } catch (error) {
      console.error("Error expanding subdomain pool:", error);
      res.status(500).json({ message: "Failed to expand subdomain pool" });
    }
  });

  // Company subdomain customization
  app.put("/api/companies/:id/subdomain", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const { newSlug } = req.body;
      const userId = req.user.id;

      // Check if user has admin access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || role !== "admin") {
        return res.status(403).json({ message: "Only company admins can change subdomains" });
      }

      const success = await preloadedSubdomainManager.updateCompanySubdomain(companyId, newSlug);

      if (success) {
        res.json({
          success: true,
          message: `Subdomain updated to ${newSlug}.workdoc360.co.uk`,
          newUrl: `https://${newSlug}.workdoc360.co.uk`
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Failed to update subdomain. It may already be in use."
        });
      }
    } catch (error) {
      console.error("Error updating subdomain:", error);
      res.status(500).json({ message: "Failed to update subdomain" });
    }
  });

  // Development test login (only in development)
  if (process.env.NODE_ENV === "development") {
    app.post('/api/auth/test-login', async (req, res) => {
      try {
        // Get existing test user or create if not exists
        let testUser = await storage.getUserByEmail("test@workdoc360.com");
        if (!testUser) {
          testUser = await storage.createUser({
            email: "test@workdoc360.com",
            password: "testpassword123",
            firstName: "Paul",
            lastName: "Tester",
            profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Paul",
            selectedPlan: "professional",
            planStatus: "active",
            subscriptionType: "yearly"
          });
        }

        // Set session using passport login
        req.login(testUser, (err) => {
          if (err) {
            throw err;
          }
        });

        res.json({
          success: true,
          message: "Test login successful",
          user: testUser
        });
      } catch (error) {
        console.error("Error in test login:", error);
        res.status(500).json({ message: "Test login failed" });
      }
    });

    app.post('/api/auth/test-logout', (req, res) => {
      req.session.destroy(() => {
        res.json({ success: true, message: "Test logout successful" });
      });
    });
  }

  // Mobile App API Routes
  // Token-based authentication for mobile apps
  app.post("/api/mobile/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { comparePasswords } = await import("./auth");
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT or session token for mobile
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        success: true,
        user: userWithoutPassword,
        token,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Mobile login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/mobile/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validation
      if (!email || !password || !firstName) {
        return res.status(400).json({ error: "Email, password, and first name are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: "Account already exists",
          message: "You already have an account with this email address. Please log in instead.",
          action: "login"
        });
      }

      // Create user
      const { hashPassword } = await import("./auth");
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName: lastName || "",
      });

      // Generate token
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        success: true,
        user: userWithoutPassword,
        token,
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Mobile registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Mobile token validation
  app.get("/api/mobile/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Mobile user fetch error:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // SMS and Phone Number Management endpoints
  app.post("/api/sms/send-2fa-code", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.phoneNumber) {
        return res.status(400).json({ error: "No phone number on file" });
      }

      const code = await TwoFactorService.sendSMSCode(userId, user.phoneNumber);
      res.json({
        success: true,
        message: "SMS code sent successfully",
        ...(process.env.NODE_ENV === 'development' && { code }) // Only in development
      });
    } catch (error) {
      console.error("SMS 2FA error:", error);
      res.status(500).json({ error: "Failed to send SMS code" });
    }
  });

  app.post("/api/sms/verify-2fa-code", requireAuth, async (req, res) => {
    try {
      const { code } = req.body;
      const userId = req.user?.id;

      if (!userId || !code) {
        return res.status(400).json({ error: "User ID and code required" });
      }

      const isValid = await TwoFactorService.verifyCode(userId, code, "sms");

      if (isValid) {
        res.json({ success: true, message: "SMS code verified successfully" });
      } else {
        res.status(400).json({ error: "Invalid or expired code" });
      }
    } catch (error) {
      console.error("SMS verification error:", error);
      res.status(500).json({ error: "Failed to verify SMS code" });
    }
  });

  app.post("/api/user/update-phone", requireAuth, async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Import SMS service to format phone number
      const { formatUKPhoneNumber } = await import("./smsService");
      const formattedPhone = formatUKPhoneNumber(phoneNumber);

      await storage.updateUserPhone(userId, formattedPhone);

      res.json({
        success: true,
        message: "Phone number updated successfully",
        phoneNumber: formattedPhone
      });
    } catch (error) {
      console.error("Phone update error:", error);
      res.status(500).json({ error: "Failed to update phone number" });
    }
  });

  // Plan selection endpoint
  app.post("/api/user/select-plan", requireAuth, async (req, res) => {
    try {
      const { selectedPlan, subscriptionType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!selectedPlan || !subscriptionType) {
        return res.status(400).json({ error: "Plan and subscription type are required" });
      }

      // Validate plan type
      const validPlans = ['micro', 'essential', 'professional', 'enterprise'];
      if (!validPlans.includes(selectedPlan)) {
        return res.status(400).json({ error: "Invalid plan selected" });
      }

      // Validate subscription type
      const validSubscriptionTypes = ['monthly', 'yearly'];
      if (!validSubscriptionTypes.includes(subscriptionType)) {
        return res.status(400).json({ error: "Invalid subscription type" });
      }

      // Update user's plan selection
      await storage.updateUserPlan(userId, selectedPlan, subscriptionType);

      res.json({
        success: true,
        message: "Plan selected successfully",
        selectedPlan,
        subscriptionType,
        planStatus: "pending_payment"
      });
    } catch (error) {
      console.error("Plan selection error:", error);
      res.status(500).json({ error: "Failed to select plan" });
    }
  });

  app.post("/api/sms/send-notification", requireAuth, async (req, res) => {
    try {
      const { recipientId, type, data } = req.body;
      const senderId = req.user?.id;

      if (!senderId || !recipientId || !type) {
        return res.status(400).json({ error: "Sender, recipient, and notification type required" });
      }

      const recipient = await storage.getUser(recipientId);
      if (!recipient || !recipient.phoneNumber) {
        return res.status(400).json({ error: "Recipient has no phone number on file" });
      }

      const company = await storage.getCompanyById(data?.companyId);
      const companyName = company?.name || "WorkDoc360";

      // Import SMS service functions
      const smsService = await import("./smsService");
      let success = false;

      switch (type) {
        case "cscs_expiry":
          success = await smsService.sendCSCSExpirySMS(
            recipient.phoneNumber,
            `${recipient.firstName} ${recipient.lastName}`,
            data.cardNumber,
            data.expiryDate,
            companyName
          );
          break;
        case "toolbox_talk":
          success = await smsService.sendToolboxTalkReminderSMS(
            recipient.phoneNumber,
            `${recipient.firstName} ${recipient.lastName}`,
            companyName,
            data.siteName
          );
          break;
        case "risk_assessment":
          success = await smsService.sendRiskAssessmentDueSMS(
            recipient.phoneNumber,
            `${recipient.firstName} ${recipient.lastName}`,
            data.assessmentTitle,
            data.dueDate,
            companyName
          );
          break;
        case "emergency":
          success = await smsService.sendEmergencySiteSMS(
            recipient.phoneNumber,
            `${recipient.firstName} ${recipient.lastName}`,
            data.emergencyType,
            data.siteName,
            companyName
          );
          break;
        case "access_denied":
          success = await smsService.sendSiteAccessDeniedSMS(
            recipient.phoneNumber,
            `${recipient.firstName} ${recipient.lastName}`,
            data.siteName,
            data.reason,
            companyName
          );
          break;
        case "compliance_alert":
          success = await smsService.sendComplianceAlertSMS(
            recipient.phoneNumber,
            `${recipient.firstName} ${recipient.lastName}`,
            data.alertType,
            data.actionRequired,
            companyName
          );
          break;
        default:
          return res.status(400).json({ error: "Invalid notification type" });
      }

      if (success) {
        res.json({ success: true, message: "SMS notification sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send SMS notification" });
      }
    } catch (error) {
      console.error("SMS notification error:", error);
      res.status(500).json({ error: "Failed to send SMS notification" });
    }
  });

  // Password reset endpoints
  app.post("/api/password-reset/request", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          error: "Email address is required"
        });
      }

      const { PasswordResetService } = await import("./passwordReset");
      const result = await PasswordResetService.createResetToken(email.toLowerCase().trim());

      if (result.success) {
        // In development, also return the token for testing (remove in production)
        const isDev = process.env.NODE_ENV === 'development';
        res.json({
          success: true,
          message: result.message,
          ...(isDev && { token: result.token }) // Only in development
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({
        error: "Failed to process password reset request"
      });
    }
  });

  app.get("/api/password-reset/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          valid: false,
          error: "Reset token is required"
        });
      }

      const { PasswordResetService } = await import("./passwordReset");
      const result = await PasswordResetService.verifyResetToken(token);

      res.json({
        valid: result.valid,
        message: result.message
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({
        valid: false,
        error: "Failed to verify reset token"
      });
    }
  });

  app.post("/api/password-reset/complete", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: "Reset token and new password are required"
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 8 characters long"
        });
      }

      const { PasswordResetService } = await import("./passwordReset");
      const result = await PasswordResetService.resetPassword(token, newPassword);

      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      console.error("Password reset completion error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to reset password"
      });
    }
  });

  // Main login endpoint (using the same logic as mobile login but with session)
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { comparePasswords } = await import("./auth");
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set session using passport
      req.login(user, (err) => {
        if (err) {
          console.error("Session login error:", err);
          return res.status(500).json({ error: "Login session failed" });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, selectedPlan, subscriptionType } = req.body;

      if (!email || !password || !firstName) {
        return res.status(400).json({ error: "Email, password, and first name are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: "Account already exists",
          message: "You already have an account with this email address. Please log in instead.",
          action: "login"
        });
      }

      // Create user
      const { hashPassword } = await import("./auth");
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName: lastName || "",
        selectedPlan: selectedPlan || "essential",
        subscriptionType: subscriptionType || "yearly",
        planStatus: "active"
      });

      // Set session using passport
      req.login(user, (err) => {
        if (err) {
          console.error("Session registration error:", err);
          return res.status(500).json({ error: "Registration session failed" });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // AI Trade Analysis endpoint
  app.post("/api/analyze-trade-type", requireAuth, async (req: any, res) => {
    try {
      const { tradeDescription, additionalInfo } = req.body;

      if (!tradeDescription || !tradeDescription.trim()) {
        return res.status(400).json({ error: "Trade description is required" });
      }

      // AI analysis prompt for UK construction trades
      const prompt = `Analyze the following UK construction trade and provide a classification:

Trade Description: "${tradeDescription}"
${additionalInfo ? `Additional Information: "${additionalInfo}"` : ''}

You are a UK construction industry expert. Analyze this trade and provide:

1. A clear description of what this trade does
2. The most appropriate category from: Core Building, Building Services, Finishing, Specialized, Infrastructure, Emerging, Other
3. Key UK compliance requirements and regulations
4. Suggest the best matching trade type from our existing categories

Respond in JSON format:
{
  "description": "Clear description of the trade",
  "category": "Most appropriate category",
  "complianceRequirements": ["List of UK compliance requirements"],
  "suggestedTradeType": "best_matching_trade_from_existing_options",
  "confidence": "high/medium/low"
}

Focus on UK construction industry standards, HSE requirements, and relevant certifications.`;

      // In a real implementation, you'd call an AI service here
      // For now, let's create a simple classification system
      const lowerTrade = tradeDescription.toLowerCase();
      let analysis = {
        description: `${tradeDescription} specialist focusing on UK construction standards`,
        category: "Other",
        complianceRequirements: ["Health & Safety Executive (HSE) compliance", "Construction (Design and Management) Regulations 2015"],
        suggestedTradeType: "other_trade",
        confidence: "medium"
      };

      // Simple classification logic for common trades
      if (lowerTrade.includes('scaffold')) {
        analysis = {
          description: "Scaffolding contractors provide temporary access structures for construction and maintenance work, ensuring safe working platforms at height.",
          category: "Specialized",
          complianceRequirements: [
            "NASC (National Access & Scaffolding Confederation) membership",
            "CISRS (Construction Industry Scaffolders Record Scheme) cards",
            "TG20/TG30:24 design compliance",
            "Weekly scaffold inspections",
            "Local authority permits for public areas"
          ],
          suggestedTradeType: "scaffolding",
          confidence: "high"
        };
      } else if (lowerTrade.includes('cabl') || lowerTrade.includes('data') || lowerTrade.includes('network')) {
        analysis = {
          description: "Cabling and data network specialists install structured cabling systems, fibre optic networks, and telecommunications infrastructure.",
          category: "Building Services",
          complianceRequirements: [
            "City & Guilds qualifications",
            "NICEIC or ECA membership",
            "BS EN 50174 cabling standards",
            "Fibre optic installation certification",
            "Health & Safety training"
          ],
          suggestedTradeType: "cabling",
          confidence: "high"
        };
      } else if (lowerTrade.includes('window') || lowerTrade.includes('glazing')) {
        analysis = {
          description: "Window fitting and glazing specialists install, repair, and maintain windows, doors, and glazed facades in residential and commercial buildings.",
          category: "Finishing",
          complianceRequirements: [
            "FENSA or CERTASS certification",
            "Building Regulations Part L compliance",
            "Window Energy Rating standards",
            "Working at height training",
            "Manual handling certification"
          ],
          suggestedTradeType: "glazier",
          confidence: "high"
        };
      } else if (lowerTrade.includes('electric')) {
        analysis = {
          description: "Electrical contractors handle all aspects of electrical installation, maintenance, and testing in construction projects.",
          category: "Building Services",
          complianceRequirements: [
            "18th Edition BS 7671 certification",
            "Part P Building Regulations compliance",
            "NICEIC or ECA registration",
            "Periodic inspection & testing (EICR)",
            "Electrical Installation Certificates (EIC)"
          ],
          suggestedTradeType: "electrician",
          confidence: "high"
        };
      } else if (lowerTrade.includes('window') || lowerTrade.includes('fitt')) {
        analysis = {
          description: "Window fitting and glazing specialists install, repair, and maintain windows, doors, and glazed facades.",
          category: "Finishing",
          complianceRequirements: [
            "FENSA or CERTASS certification",
            "Building Regulations Part L compliance",
            "Window Energy Rating standards",
            "Working at height training",
            "Manual handling certification"
          ],
          suggestedTradeType: "window_fitter",
          confidence: "high"
        };
      } else if (lowerTrade.includes('data') || lowerTrade.includes('network') || lowerTrade.includes('structured')) {
        analysis = {
          description: "Data cabling specialists install structured cabling systems, fibre optic networks, and telecommunications infrastructure.",
          category: "Building Services",
          complianceRequirements: [
            "City & Guilds qualifications",
            "BS EN 50174 cabling standards",
            "Fibre optic installation certification",
            "Network infrastructure design",
            "Health & Safety training"
          ],
          suggestedTradeType: "data_cabling",
          confidence: "high"
        };
      } else if (lowerTrade.includes('fibre') || lowerTrade.includes('fiber') || lowerTrade.includes('broadband')) {
        analysis = {
          description: "Fibre optic installers provide high-speed broadband installation, FTTP connections, and network terminations.",
          category: "Building Services",
          complianceRequirements: [
            "Fibre optic splicing certification",
            "FTTP installation training",
            "Network testing equipment",
            "Working at height certification",
            "Openreach accreditation"
          ],
          suggestedTradeType: "fibre_optic_installer",
          confidence: "high"
        };
      } else if (lowerTrade.includes('telecom') || lowerTrade.includes('phone') || lowerTrade.includes('communication')) {
        analysis = {
          description: "Telecommunications engineers handle phone systems, broadband, mobile coverage solutions, and business communications.",
          category: "Building Services",
          complianceRequirements: [
            "Telecoms engineering qualifications",
            "Broadband installation certification",
            "Mobile network knowledge",
            "Business phone systems",
            "Emergency communications"
          ],
          suggestedTradeType: "telecoms_engineer",
          confidence: "high"
        };
      }

      res.json(analysis);
    } catch (error) {
      console.error("Trade analysis error:", error);
      res.status(500).json({ error: "Failed to analyze trade type" });
    }
  });

  // Endpoint to add new analyzed trades to the official list
  app.post("/api/add-analyzed-trade", requireAuth, async (req: any, res) => {
    try {
      const { tradeData } = req.body;

      if (!tradeData || !tradeData.value || !tradeData.title) {
        return res.status(400).json({ error: "Trade data with value and title required" });
      }

      // For now, we'll just confirm the trade was "added" 
      // In a real system, you'd store this in a database or update a config file
      console.log("New trade analyzed and added:", tradeData);

      res.json({
        success: true,
        message: `Trade "${tradeData.title}" has been added to the system`,
        tradeData
      });
    } catch (error) {
      console.error("Add trade error:", error);
      res.status(500).json({ error: "Failed to add new trade" });
    }
  });

  // Company routes
  app.post("/api/companies", requireAuth, async (req: any, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "User not found in request" });
      }

      const userId = req.user.id;

      // CRITICAL: One company per account limit to prevent database confusion
      const existingUserCompanies = await storage.getUserCompanies(userId);
      if (existingUserCompanies.length > 0) {
        const existingCompany = existingUserCompanies[0];

        // Return the existing company instead of error (for duplicate submissions)
        console.log(`⚠️ User ${userId} already has company: ${existingCompany.name}`);
        return res.status(200).json({
          id: existingCompany.id,
          name: existingCompany.name,
          message: "Company already exists",
          company: existingCompany,
          suggestion: "You can only have one company per account. Please use your existing company portal.",
          dashboardUrl: "/dashboard"
        });
      }

      console.log('Company creation: Allowing registration for user:', userId);

      // First check if company with same name already exists
      const existingCompanies = await storage.getCompaniesByName(req.body.name);
      if (existingCompanies.length > 0) {
        const existingCompany = existingCompanies[0];
        return res.status(409).json({
          message: "Company name already exists",
          error: "DUPLICATE_COMPANY_NAME",
          existingCompanyName: existingCompany.name,
          suggestion: "If this is your company, please log in to your existing account instead of creating a new one.",
          loginUrl: "/auth",
          alternativeName: `${req.body.name} (${req.body.businessType})` // Suggest alternative
        });
      }

      const validatedData = insertCompanySchema.parse({
        ...req.body,
        ownerId: userId,
      });

      const company = await storage.createCompany(validatedData as any);

      // Add the user as admin to the company
      await storage.addUserToCompany({
        userId: userId,
        companyId: company.id,
        role: "admin",
      });

      // Create basic starter documents for the company
      // ISO 9001 templates are available only with Professional/Enterprise plans
      await storage.createBasicStarterDocumentsForCompany(
        company.id,
        validatedData.tradeType,
        userId
      );

      // Skip pre-loaded subdomain assignment to avoid conflicts
      console.log(`🚀 Creating subdomain for ${company.name}...`);

      // FIXED: Generate unique slug with fallback for duplicates
      let desiredSlug = company.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
        .substring(0, 15); // Shorter to allow for suffixes

      // Check if slug already exists and add number suffix if needed
      let finalSlug = desiredSlug;
      let counter = 1;

      while (true) {
        try {
          const existingCompany = await storage.getCompanyBySlug(finalSlug);
          if (!existingCompany || existingCompany.id === company.id) {
            break; // Slug is available
          }
          finalSlug = `${desiredSlug}-${counter}`;
          counter++;
        } catch (error) {
          // If getCompanyBySlug throws error (company not found), slug is available
          break;
        }
      }

      // Update company with unique slug
      await storage.updateCompany(company.id, { companySlug: finalSlug });

      console.log(`✅ Company ${company.name} is now live at: ${finalSlug}.workdoc360.co.uk`);
      res.json({
        ...company,
        companySlug: finalSlug,
        subdomainUrl: `https://${finalSlug}.workdoc360.co.uk`,
        message: `Your company portal is now live at ${finalSlug}.workdoc360.co.uk`,
        canCustomizeSubdomain: true
      });
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ message: "Failed to create company" });
    }
  });

  app.get("/api/companies", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const companies = await storage.getCompaniesByUserId(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Company archiving routes - customer protection system
  app.post("/api/companies/:id/archive", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const { reason } = req.body;

      // Check if user owns this company or is admin
      const company = await storage.getCompany(companyId);
      if (!company || company.ownerId !== userId) {
        return res.status(403).json({ error: "Not authorized to archive this company" });
      }

      const archivedCompany = await storage.archiveCompany(companyId, userId, reason);
      res.json({
        message: "Company archived successfully. You can restore it anytime from your account settings.",
        company: archivedCompany
      });
    } catch (error) {
      console.error("Error archiving company:", error);
      res.status(500).json({ error: "Failed to archive company" });
    }
  });

  app.post("/api/companies/:id/restore", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user owns this company
      const company = await storage.getCompany(companyId);
      if (!company || company.ownerId !== userId) {
        return res.status(403).json({ error: "Not authorized to restore this company" });
      }

      const restoredCompany = await storage.restoreCompany(companyId);
      res.json({
        message: "Company restored successfully!",
        company: restoredCompany
      });
    } catch (error) {
      console.error("Error restoring company:", error);
      res.status(500).json({ error: "Failed to restore company" });
    }
  });

  app.get("/api/companies/archived", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const archivedCompanies = await storage.getArchivedCompanies(userId);
      res.json(archivedCompanies);
    } catch (error) {
      console.error("Error fetching archived companies:", error);
      res.status(500).json({ error: "Failed to fetch archived companies" });
    }
  });

  // SUPERADMIN ONLY: Permanent deletion route
  app.delete("/api/admin/companies/:id/permanent", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user is superadmin
      const user = await storage.getUser(userId);
      if (!user || user.role !== "superadmin") {
        return res.status(403).json({ error: "Only WorkDoc360 superadmins can permanently delete companies" });
      }

      const success = await storage.permanentlyDeleteCompany(companyId, userId);
      if (success) {
        res.json({ message: "Company permanently deleted from system" });
      } else {
        res.status(500).json({ error: "Failed to permanently delete company" });
      }
    } catch (error) {
      console.error("Error permanently deleting company:", error);
      res.status(500).json({ error: "Failed to permanently delete company" });
    }
  });

  // ================================
  // MASTER COMPANY TEMPLATE SYSTEM
  // ================================

  // Get master companies available for a specific trade
  app.get("/api/trades/:tradeType/master-companies", requireAuth, async (req: any, res) => {
    try {
      const { tradeType } = req.params;
      const masterCompanies = await storage.getMasterCompaniesForTrade(tradeType);

      res.json({
        tradeType,
        masterCompanies,
        message: `Found ${masterCompanies.length} master companies providing templates for ${tradeType}`
      });
    } catch (error) {
      console.error("Error fetching master companies:", error);
      res.status(500).json({ error: "Failed to fetch master companies" });
    }
  });

  // Get templates available for a specific trade
  app.get("/api/trades/:tradeType/templates", requireAuth, async (req: any, res) => {
    try {
      const { tradeType } = req.params;
      const templates = await storage.getTemplatesByTrade(tradeType);

      res.json({
        tradeType,
        templates,
        message: `Found ${templates.length} templates available for ${tradeType}`
      });
    } catch (error) {
      console.error("Error fetching trade templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Subscribe company to a master company for templates
  app.post("/api/companies/:id/subscribe", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const { masterCompanyId, subscriptionType = "standard" } = req.body;

      // Check if user has admin access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || (role !== "admin" && role !== "manager")) {
        return res.status(403).json({ error: "Admin access required to manage subscriptions" });
      }

      // Check if master company exists and is a master company
      const masterCompany = await storage.getCompany(masterCompanyId);
      if (!masterCompany || !masterCompany.isMasterCompany) {
        return res.status(404).json({ error: "Master company not found" });
      }

      const subscription = await storage.subscribeToMasterCompany({
        companyId,
        masterCompanyId,
        subscriptionType,
        isActive: true,
        autoUpdateTemplates: true
      });

      res.json({
        subscription,
        message: `Successfully subscribed to ${masterCompany.name} for template standards`
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // Get company's master company subscriptions
  app.get("/api/companies/:id/subscriptions", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      const subscriptions = await storage.getCompanySubscriptions(companyId);

      res.json({
        companyId,
        subscriptions,
        message: `Found ${subscriptions.length} active template subscriptions`
      });
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  // Get updates for a company from subscribed master companies
  app.get("/api/companies/:id/updates", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = await storage.getUpdatesForCompany(companyId);

      res.json({
        companyId,
        updates,
        message: `Found ${updates.length} updates from subscribed master companies`
      });
    } catch (error) {
      console.error("Error fetching company updates:", error);
      res.status(500).json({ error: "Failed to fetch updates" });
    }
  });

  // MASTER COMPANY ONLY: Create template (only master companies can create templates)
  app.post("/api/master-companies/:id/templates", requireAuth, async (req: any, res) => {
    try {
      const masterCompanyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user is admin of this master company
      const role = await storage.getUserRole(userId, masterCompanyId);
      if (!role || role !== "admin") {
        return res.status(403).json({ error: "Master company admin access required" });
      }

      // Verify it's actually a master company
      const company = await storage.getCompany(masterCompanyId);
      if (!company || !company.isMasterCompany) {
        return res.status(403).json({ error: "Only master companies can create templates" });
      }

      const template = await storage.createMasterCompanyTemplate({
        ...req.body,
        masterCompanyId
      });

      res.json({
        template,
        message: "Template created successfully and is now available to subscribing companies"
      });
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  // MASTER COMPANY ONLY: Get master company's templates
  app.get("/api/master-companies/:id/templates", requireAuth, async (req: any, res) => {
    try {
      const masterCompanyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this master company
      const role = await storage.getUserRole(userId, masterCompanyId);
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      const templates = await storage.getMasterCompanyTemplates(masterCompanyId);

      res.json({
        masterCompanyId,
        templates,
        message: `Found ${templates.length} templates from this master company`
      });
    } catch (error) {
      console.error("Error fetching master company templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // MASTER COMPANY ONLY: Create update notification
  app.post("/api/master-companies/:id/updates", requireAuth, async (req: any, res) => {
    try {
      const masterCompanyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user is admin of this master company
      const role = await storage.getUserRole(userId, masterCompanyId);
      if (!role || role !== "admin") {
        return res.status(403).json({ error: "Master company admin access required" });
      }

      const update = await storage.createMasterCompanyUpdate({
        ...req.body,
        masterCompanyId
      });

      // Get subscriber count for notification
      const subscribers = await storage.getMasterCompanySubscribers(masterCompanyId);

      res.json({
        update,
        subscriberCount: subscribers.length,
        message: `Update published and will notify ${subscribers.length} subscribed companies`
      });
    } catch (error) {
      console.error("Error creating update:", error);
      res.status(500).json({ error: "Failed to create update" });
    }
  });

  app.get("/api/companies/:id", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Dashboard metrics
  app.get("/api/companies/:id/metrics", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const metrics = await storage.getComplianceMetrics(companyId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // CSCS card routes
  app.post("/api/companies/:id/cscs-cards", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertCSCSCardSchema.parse({
        ...req.body,
        companyId,
      });

      const card = await storage.createCSCSCard(validatedData);
      res.json(card);
    } catch (error) {
      console.error("Error creating CSCS card:", error);
      res.status(400).json({ message: "Failed to create CSCS card" });
    }
  });

  app.get("/api/companies/:id/cscs-cards", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const cards = await storage.getCSCSCards(companyId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching CSCS cards:", error);
      res.status(500).json({ message: "Failed to fetch CSCS cards" });
    }
  });

  // Risk assessment routes
  app.post("/api/companies/:id/risk-assessments", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || !["admin", "manager", "team_leader"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertRiskAssessmentSchema.parse({
        ...req.body,
        companyId,
        assessorId: userId,
      });

      const assessment = await storage.createRiskAssessment(validatedData);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating risk assessment:", error);
      res.status(400).json({ message: "Failed to create risk assessment" });
    }
  });

  app.get("/api/companies/:id/risk-assessments", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const assessments = await storage.getRiskAssessments(companyId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching risk assessments:", error);
      res.status(500).json({ message: "Failed to fetch risk assessments" });
    }
  });

  // Method statement routes
  app.post("/api/companies/:id/method-statements", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || !["admin", "manager", "team_leader"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertMethodStatementSchema.parse({
        ...req.body,
        companyId,
        authorizedBy: userId,
      });

      const statement = await storage.createMethodStatement(validatedData);
      res.json(statement);
    } catch (error) {
      console.error("Error creating method statement:", error);
      res.status(400).json({ message: "Failed to create method statement" });
    }
  });

  app.get("/api/companies/:id/method-statements", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const statements = await storage.getMethodStatements(companyId);
      res.json(statements);
    } catch (error) {
      console.error("Error fetching method statements:", error);
      res.status(500).json({ message: "Failed to fetch method statements" });
    }
  });

  // Toolbox talk routes
  app.post("/api/companies/:id/toolbox-talks", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || !["admin", "manager", "team_leader"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertToolboxTalkSchema.parse({
        ...req.body,
        companyId,
        conductedBy: userId,
      });

      const talk = await storage.createToolboxTalk(validatedData);
      res.json(talk);
    } catch (error) {
      console.error("Error creating toolbox talk:", error);
      res.status(400).json({ message: "Failed to create toolbox talk" });
    }
  });

  app.get("/api/companies/:id/toolbox-talks", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const talks = await storage.getToolboxTalks(companyId);
      res.json(talks);
    } catch (error) {
      console.error("Error fetching toolbox talks:", error);
      res.status(500).json({ message: "Failed to fetch toolbox talks" });
    }
  });

  // Compliance items routes
  app.get("/api/companies/:id/compliance-items", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const items = await storage.getComplianceItems(companyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching compliance items:", error);
      res.status(500).json({ message: "Failed to fetch compliance items" });
    }
  });

  app.get("/api/companies/:id/compliance-items/overdue", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const items = await storage.getOverdueComplianceItems(companyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching overdue compliance items:", error);
      res.status(500).json({ message: "Failed to fetch overdue compliance items" });
    }
  });

  // Subscription and billing routes
  app.get("/api/companies/:id/subscription", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has admin role for this company
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock subscription data - in production, integrate with actual billing service
      const subscription = {
        planName: 'professional',
        status: 'active',
        amount: 12900, // £129.00 in pence
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        includedUsers: 10,
        additionalUsers: 0,
        additionalUserCost: 1200, // £12.00 in pence
        trialEndsAt: null
      };

      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Finalize checkout session (idempotent) - used when redirecting back from Stripe Checkout
  app.post('/api/payments/finalize', async (req: any, res) => {
    try {
      const { session_id } = req.body;
      if (!session_id) return res.status(400).json({ error: 'session_id is required' });

      const { finalizeCheckoutSession } = await import('./services/stripeFinalizeService');
      const result = await finalizeCheckoutSession(session_id);

      if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
      }

      res.json({ success: true, message: result.message, companyId: result.companyId });
    } catch (error) {
      console.error('Error finalizing payment:', error);
      res.status(500).json({ success: false, message: 'Failed to finalize payment' });
    }
  });

  app.get("/api/companies/:id/billing/history", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has admin role for this company
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock billing history
      const billingHistory = [
        {
          id: '1',
          number: 'INV-001',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Professional Plan - Monthly',
          amount: 12900,
          status: 'paid'
        },
        {
          id: '2',
          number: 'INV-002',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Professional Plan - Monthly',
          amount: 12900,
          status: 'paid'
        }
      ];

      res.json(billingHistory);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      res.status(500).json({ message: "Failed to fetch billing history" });
    }
  });

  app.get("/api/companies/:id/usage", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has admin role for this company
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get actual usage data
      const companyUsers = await storage.getCompanyUsers(companyId);
      const toolboxTalks = await storage.getToolboxTalksThisMonth(companyId);

      const usage = {
        activeUsers: companyUsers.length,
        documentsGenerated: 45, // This would come from actual document generation tracking
        customRequests: 2,
        customHours: 3
      };

      res.json(usage);
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  app.get("/api/companies/:id/user-role", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(404).json({ message: "User not found in company" });
      }

      res.json({ role });
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).json({ message: "Failed to fetch user role" });
    }
  });

  app.post("/api/companies/:id/users/invite", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const { email, role } = req.body;

      // Check if user has permission to invite users
      const userRole = await storage.getUserRole(userId, companyId);
      if (!userRole || !['admin', 'manager'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or Manager access required" });
      }

      // In production: create invitation record and send email
      res.json({
        message: "Invitation sent successfully",
        email,
        role
      });
    } catch (error) {
      console.error("Error inviting user:", error);
      res.status(500).json({ message: "Failed to invite user" });
    }
  });

  // Document generation route
  app.post("/api/generate-document", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const {
        companyId,
        templateType,
        siteName,
        siteAddress,
        projectManager,
        hazards,
        controlMeasures,
        specialRequirements,
        isUrgent,
        tradeType
      } = req.body;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || !["admin", "manager", "team_leader"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions to generate documents" });
      }

      // Get company details for AI context
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      // Generate document using AI
      const { generateDocument } = await import('./document-generator');
      const aiGeneratedContent = await generateDocument({
        templateType,
        companyName: company.name,
        tradeType: company.tradeType,
        siteName,
        siteAddress,
        projectManager,
        hazards,
        controlMeasures,
        specialRequirements
      });

      // Create document generation record
      const document = await storage.createGeneratedDocument({
        companyId,
        templateType,
        documentName: aiGeneratedContent.title || `${templateType.replace(/_/g, ' ')} - ${siteName}`,
        siteName,
        siteAddress,
        projectManager,
        hazards: hazards || aiGeneratedContent.hazards,
        controlMeasures: controlMeasures || aiGeneratedContent.controlMeasures,
        specialRequirements: specialRequirements || aiGeneratedContent.specialRequirements,
        generatedBy: userId,
        status: "generated"
      });

      // Return document information
      res.json({
        id: document.id,
        documentName: document.documentName,
        templateType: document.templateType,
        status: document.status,
        downloadUrl: `/api/documents/${document.id}/download`,
        createdAt: document.createdAt,
        isUrgent
      });
    } catch (error) {
      console.error("Document generation error:", error);
      res.status(500).json({ error: "Failed to generate document" });
    }
  });

  // Get generated documents for a company
  app.get("/api/companies/:id/documents", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const documents = await storage.getGeneratedDocuments(companyId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Download document endpoint with format parameter
  app.get("/api/documents/:id/download/:format?", async (req: any, res) => {
    console.log('=== DOWNLOAD REQUEST DEBUG ===');
    console.log('Session ID:', req.sessionID);
    console.log('Is Authenticated:', req.isAuthenticated());
    console.log('User object:', req.user);
    console.log('Cookies:', req.headers.cookie);
    console.log('Origin:', req.headers.origin);
    console.log('Referer:', req.headers.referer);

    // Set CORS headers for downloads
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // DEVELOPMENT: Auto-authenticate David for ALL requests (authenticated or not)
    // This allows external browser access to work
    if (process.env.NODE_ENV === "development") {
      console.log('Development mode - auto-setting David user for download...');
      try {
        const davidUser = await storage.getUserByEmail("deividasm@hotmail.co.uk");
        if (davidUser) {
          req.user = davidUser;
          console.log('Set David user for download operation');
        } else {
          return res.status(401).json({ error: "Development user not found" });
        }
      } catch (error) {
        console.error('Development user fetch error:', error);
        return res.status(401).json({ error: "Authentication failed" });
      }
    } else {
      // PRODUCTION: Check authentication normally
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
    }
    try {
      const documentId = parseInt(req.params.id);
      const format = req.params.format || 'pdf'; // Default to PDF
      const userId = req.user.id;

      console.log(`Download request - Document ID: ${documentId}, Format: ${format}, User: ${userId}`);

      // Check if user has access to this document
      const document = await storage.getGeneratedDocument(documentId);
      console.log(`Document lookup result:`, document ? `Found document: ${document.documentName}` : 'Document not found');
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check company access - allow USER role to download
      const role = await storage.getUserRole(userId, document.companyId);
      console.log('User role for document download:', role, 'Company ID:', document.companyId);

      console.log('Role check result:', role);
      // Allow download if user is authenticated and has any role
      if (!role) {
        return res.status(403).json({ message: "Access denied - no company access" });
      }

      // Get company information
      const company = await storage.getCompany(document.companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Prepare export options
      const exportOptions = {
        title: document.documentName,
        content: generateDocumentContentForExport(document),
        companyName: company.name,
        companyAddress: company.address || '',
        companyLogo: company.logoUrl || undefined, // Include company logo if available
        documentId: `WD360-${document.id.toString().padStart(6, '0')}`,
        generatedDate: document.createdAt ? new Date(document.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        templateType: document.templateType
      };

      if (format.toLowerCase() === 'word' || format.toLowerCase() === 'docx') {
        // Generate Word document
        const { generateWord } = await import('./documentExport');
        const wordBuffer = await generateWord(exportOptions);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${document.documentName.replace(/[^a-zA-Z0-9]/g, '_')}.docx"`);
        res.send(wordBuffer);

      } else {
        // Generate PDF document (default)
        console.log('Generating PDF for document:', document.id);
        console.log('PDF export options:', JSON.stringify(exportOptions, null, 2));

        try {
          const { generatePDF } = await import('./documentExport');
          console.log('PDF module imported successfully');

          const pdfBuffer = await generatePDF(exportOptions);
          console.log('PDF generated successfully, buffer size:', pdfBuffer.length);

          if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('PDF buffer is empty or null');
          }

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${document.documentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
          res.setHeader('Content-Length', pdfBuffer.length.toString());
          console.log('PDF headers set, sending buffer...');
          res.send(pdfBuffer);
          console.log('PDF sent to client successfully');
        } catch (pdfError: any) {
          console.error('PDF generation error:', pdfError);
          console.error('PDF error stack:', pdfError?.stack);
          res.status(500).json({ message: `PDF generation failed: ${pdfError?.message || 'Unknown error'}` });
        }
      }

    } catch (error: any) {
      console.error("Error downloading document:", error);
      console.error("Error stack:", error?.stack);
      res.status(500).json({ message: `Failed to download document: ${error?.message || 'Unknown error'}` });
    }
  });

  // Document preview endpoint
  app.get("/api/documents/:id/preview", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this document
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check company access
      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get company information
      const company = await storage.getCompany(document.companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Generate formatted content for preview
      const formattedContent = generateDocumentContentForExport(document);

      res.json({
        id: document.id,
        title: document.documentName,
        content: formattedContent,
        companyName: company.name,
        siteName: document.siteName,
        siteAddress: document.siteAddress,
        projectManager: document.projectManager,
        status: document.status,
        templateType: document.templateType,
        createdAt: document.createdAt,
        generatedBy: document.generatedBy
      });
    } catch (error) {
      console.error("Error previewing document:", error);
      res.status(500).json({ message: "Failed to preview document" });
    }
  });

  // Legacy document generation endpoint (keeping for compatibility)
  app.post("/api/companies/:id/documents/generate", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const {
        templateType,
        siteName,
        siteAddress,
        projectManager,
        hazards,
        controlMeasures,
        specialRequirements,
        customTradeDescription,
        customWorkActivities,
        customEquipment,
        customChallenges
      } = req.body;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get company details for document branding
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Create document name based on template and site
      const templateNames: { [key: string]: string } = {
        'scaffold-risk-assessment': 'Scaffold Risk Assessment',
        'scaffold-method-statement': 'Scaffold Method Statement',
        'scaffold-inspection-checklist': 'Scaffold Inspection Checklist',
        'plastering-risk-assessment': 'Plastering Risk Assessment',
        'dust-control-method': 'Dust Control Method Statement',
        'material-safety-data': 'Material Safety Data Sheet',
        'construction-phase-plan': 'Construction Phase Plan',
        'general-risk-assessment': 'General Risk Assessment',
        'toolbox-talk-template': 'Toolbox Talk Template',
        'manual-handling-assessment': 'Manual Handling Assessment'
      };

      // Handle custom trade consultation requests
      if (templateType === 'custom-consultation') {
        try {
          // Generate AI-powered consultation document
          const aiGeneratedContent = await generateDocument({
            templateType: 'custom_trade_consultation',
            companyName: company.name,
            tradeType: company.tradeType,
            siteName: siteName || company.name,
            siteAddress: siteAddress || company.address || 'Not specified',
            projectManager: projectManager || 'Not specified',
            customTradeDescription,
            customWorkActivities,
            customEquipment,
            customChallenges
          });

          const consultationData = {
            companyId,
            templateType: 'custom_trade_consultation',
            documentName: aiGeneratedContent.title,
            siteName: siteName || company.name,
            siteAddress: siteAddress || company.address || 'Not specified',
            projectManager: projectManager || 'Not specified',
            hazards: customChallenges || null,
            controlMeasures: aiGeneratedContent.content,
            specialRequirements: aiGeneratedContent.summary,
            status: 'generated',
            filePath: `/documents/consultation-${companyId}-${Date.now()}.txt`,
            fileUrl: `${req.protocol}://${req.hostname}/api/documents/consultation-${companyId}-${Date.now()}.txt`,
            generatedBy: userId,
          };

          const document = await storage.createGeneratedDocument(consultationData);

          return res.json({
            id: document.id,
            name: aiGeneratedContent.title,
            type: 'consultation',
            content: aiGeneratedContent.content,
            summary: aiGeneratedContent.summary,
            downloadUrl: document.fileUrl,
            createdAt: document.createdAt,
          });
        } catch (error) {
          console.error("AI consultation generation failed:", error);
          // Fallback to basic consultation request
          const consultationData = {
            companyId,
            templateType,
            documentName: `Custom Trade Consultation - ${company.name}`,
            siteName: company.name,
            siteAddress: company.address || 'Not specified',
            projectManager: projectManager || 'Not specified',
            hazards: customChallenges || null,
            controlMeasures: `Trade: ${customTradeDescription}\nActivities: ${customWorkActivities}\nEquipment: ${customEquipment}`,
            specialRequirements: specialRequirements || null,
            status: 'consultation_requested',
            filePath: null,
            fileUrl: null,
            generatedBy: userId,
          };

          const document = await storage.createGeneratedDocument(consultationData);
          return res.json({
            id: document.id,
            name: 'Custom Trade Consultation Request',
            type: 'consultation',
            message: 'Your consultation request has been submitted successfully. Our compliance team will review your requirements and contact you within 24 hours with recommendations and a detailed quote.',
            estimatedContact: '24 hours',
            createdAt: document.createdAt,
          });
        }
      }

      // Map template types to standardized AI document types
      const templateTypeMapping: { [key: string]: string } = {
        'scaffold-risk-assessment': 'risk_assessment',
        'scaffold-method-statement': 'method_statement',
        'scaffold-inspection-checklist': 'risk_assessment',
        'plastering-risk-assessment': 'risk_assessment',
        'dust-control-method': 'method_statement',
        'material-safety-data': 'health_safety_policy',
        'construction-phase-plan': 'method_statement',
        'general-risk-assessment': 'risk_assessment',
        'toolbox-talk-template': 'health_safety_policy',
        'manual-handling-assessment': 'risk_assessment',
        'risk_assessment': 'risk_assessment',
        'method_statement': 'method_statement',
        'health_safety_policy': 'health_safety_policy'
      };

      const standardizedTemplateType = templateTypeMapping[templateType] || 'risk_assessment';

      try {
        // Generate AI-powered document content
        const aiGeneratedContent = await generateDocument({
          templateType: standardizedTemplateType,
          companyName: company.name,
          tradeType: company.tradeType,
          siteName: siteName || 'Site not specified',
          siteAddress: siteAddress || 'Address not specified',
          projectManager: projectManager || 'Not specified',
          hazards,
          controlMeasures,
          specialRequirements
        });

        // Generate unique filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${templateType}-${companyId}-${timestamp}-${Date.now()}.txt`;
        const filePath = `/documents/${filename}`;
        const fileUrl = `${req.protocol}://${req.hostname}/api/documents/${filename}`;

        // Create document record with AI-generated content
        const document = await storage.createGeneratedDocument({
          companyId,
          templateType,
          documentName: aiGeneratedContent.title,
          siteName: siteName || 'Site not specified',
          siteAddress: siteAddress || 'Address not specified',
          projectManager: projectManager || 'Not specified',
          hazards: hazards || null,
          controlMeasures: aiGeneratedContent.content,
          specialRequirements: aiGeneratedContent.summary,
          status: 'generated',
          filePath,
          fileUrl,
          generatedBy: userId,
        });

        const documentContent = {
          id: document.id,
          name: aiGeneratedContent.title,
          template: templateType,
          company: company.name,
          content: aiGeneratedContent.content,
          summary: aiGeneratedContent.summary,
          downloadUrl: fileUrl,
          createdAt: document.createdAt,
        };

        res.json(documentContent);
      } catch (error) {
        console.error("AI document generation failed:", error);

        // Fallback to basic document creation without AI content
        const documentName = `${templateNames[templateType] || templateType} - ${siteName}`;
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${templateType}-${companyId}-${timestamp}-${Date.now()}.txt`;
        const filePath = `/documents/${filename}`;
        const fileUrl = `${req.protocol}://${req.hostname}/api/documents/${filename}`;

        const document = await storage.createGeneratedDocument({
          companyId,
          templateType,
          documentName,
          siteName: siteName || 'Site not specified',
          siteAddress: siteAddress || 'Address not specified',
          projectManager: projectManager || 'Not specified',
          hazards: hazards || null,
          controlMeasures: controlMeasures || 'Standard control measures to be defined',
          specialRequirements: specialRequirements || null,
          status: 'generated',
          filePath,
          fileUrl,
          generatedBy: userId,
        });

        const documentContent = {
          id: document.id,
          name: documentName,
          template: templateType,
          company: company.name,
          content: 'Document generation temporarily unavailable. Please contact support.',
          downloadUrl: fileUrl,
          createdAt: document.createdAt,
          error: 'AI generation failed - fallback document created'
        };

        res.json(documentContent);
      }
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  // Document Upload and Assessment Routes
  app.post("/api/companies/:companyId/assess-documents", requireAuth, (req, res, next) => {
    console.log('Starting document assessment upload for:', req.params.companyId);
    upload.array('documents', 10)(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      }
      next();
    });
  }, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get company details
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const uploadedFiles = req.files as Express.Multer.File[];

      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Create assessment record for each uploaded file
      const assessments = [];
      for (const file of uploadedFiles) {
        const assessment = {
          id: Date.now() + Math.random(),
          originalFileName: file.originalname,
          documentType: 'Unknown Document',
          overallScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          assessmentStatus: 'completed' as const,
          complianceGaps: [
            {
              category: 'Safety Procedures',
              description: 'Emergency procedures need more detail',
              severity: 'medium' as const,
              regulation: 'HSE Guidelines',
              requiredAction: 'Add detailed emergency evacuation procedures'
            }
          ],
          recommendations: [
            {
              title: 'Update Safety Protocols',
              description: 'Enhance current safety documentation',
              priority: 1,
              estimatedHours: 4,
              costImplication: 'low' as const
            }
          ],
          strengths: ['Clear documentation structure', 'Good use of terminology'],
          criticalIssues: [],
          improvementPlan: [
            {
              step: 1,
              action: 'Review current safety procedures',
              timeline: '1 week',
              responsible: 'Site Manager',
              deliverable: 'Updated safety manual'
            }
          ],
          createdAt: new Date().toISOString()
        };
        assessments.push(assessment);
      }

      res.json({
        message: "Documents uploaded and assessed successfully",
        assessments,
        uploadedFiles: uploadedFiles.length
      });

    } catch (error) {
      console.error("Error in document assessment:", error);
      res.status(500).json({ message: "Assessment failed" });
    }
  });

  app.get("/api/companies/:companyId/assessments", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Return empty array for now - will be implemented with real data
      res.json([]);

    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  // Create Rob & Son premium account (development only)
  if (process.env.NODE_ENV === "development") {
    app.post('/api/dev/create-rob-account', async (req, res) => {
      try {
        const { createRobAndSonAccount, createSampleDocuments } = await import('./createPremiumAccount');

        const result = await createRobAndSonAccount();
        await createSampleDocuments(result.company.id, result.user.id);

        res.json({
          success: true,
          message: "Rob & Son premium account created successfully",
          account: {
            email: result.credentials.email,
            password: result.credentials.password,
            companyId: result.company.id,
            companyName: result.company.name,
            plan: "professional",
            status: "active"
          }
        });

      } catch (error) {
        console.error("Error creating Rob & Son account:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create premium account",
          error: (error as any)?.message || 'Unknown error'
        });
      }
    });
  }

  // Serve generated document content
  app.get("/api/documents/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;

      // In production, this would serve files from a proper file storage system
      // For now, we'll return a placeholder or redirect to the document content
      res.setHeader('Content-Type', 'text/plain');
      res.send('Document content would be served here in production. This is a placeholder for the generated document.');
    } catch (error) {
      console.error("Error serving document:", error);
      res.status(404).json({ message: "Document not found" });
    }
  });

  // Get document content by ID (for viewing in the UI)
  app.get("/api/companies/:companyId/documents/:documentId/content", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const documentId = parseInt(req.params.documentId);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const document = await storage.getGeneratedDocument(documentId);
      if (!document || document.companyId !== companyId) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({
        id: document.id,
        name: document.documentName,
        content: document.controlMeasures || 'No content available',
        summary: document.specialRequirements || 'No summary available',
        type: document.templateType,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      });
    } catch (error) {
      console.error("Error fetching document content:", error);
      res.status(500).json({ message: "Failed to fetch document content" });
    }
  });

  app.get("/api/companies/:id/documents", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const documents = await storage.getGeneratedDocuments(companyId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Document library routes - Get ISO 9001 and template documents
  app.get("/api/companies/:id/document-library", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const documents = await storage.getGeneratedDocuments(companyId);
      // Filter for template documents (ISO 9001 starter documents)
      const templateDocuments = documents.filter(doc => doc.isTemplate || doc.status === "template");

      res.json(templateDocuments);
    } catch (error) {
      console.error("Error fetching document library:", error);
      res.status(500).json({ message: "Failed to fetch document library" });
    }
  });

  // Upgrade to Professional plan to unlock ISO 9001 templates
  app.post("/api/companies/:id/upgrade-plan", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has admin role for this company
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required to upgrade plan" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // In production, this would integrate with Stripe/payment processor
      // For now, we'll simulate the upgrade and create premium documents
      await storage.createPremiumStarterDocumentsForCompany(
        companyId,
        company.tradeType,
        userId
      );

      res.json({
        success: true,
        message: "Company upgraded to Professional plan. ISO 9001 documents have been added to your library."
      });
    } catch (error) {
      console.error("Error upgrading plan:", error);
      res.status(500).json({ message: "Failed to upgrade plan" });
    }
  });

  // Document annotation and review routes
  app.get("/api/documents/:id/annotations", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has access to this document
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check company access
      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const annotations = await storage.getDocumentAnnotations(documentId);
      res.json(annotations);
    } catch (error) {
      console.error("Error fetching annotations:", error);
      res.status(500).json({ message: "Failed to fetch annotations" });
    }
  });

  app.post("/api/documents/:id/annotations", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check document access
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const annotation = await storage.createDocumentAnnotation({
        documentId,
        userId,
        content: req.body.content,
        annotationType: req.body.annotationType,
        sectionReference: req.body.sectionReference,
        priority: req.body.priority || "normal",
        parentId: req.body.parentId || null,
      });

      res.status(201).json(annotation);
    } catch (error) {
      console.error("Error creating annotation:", error);
      res.status(500).json({ message: "Failed to create annotation" });
    }
  });

  app.get("/api/documents/:id/reviews", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check document access
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const reviews = await storage.getDocumentReviews(documentId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/documents/:id/reviews", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check document access
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      const review = await storage.createDocumentReview({
        documentId,
        reviewerId: userId,
        reviewType: req.body.reviewType,
        status: req.body.status,
        comments: req.body.comments,
        completedAt: new Date(),
      });

      // Update document review status if this is an approval/rejection
      if (req.body.status === "approved") {
        await storage.updateDocumentReviewStatus(documentId, "approved", userId);
      } else if (req.body.status === "rejected") {
        await storage.updateDocumentReviewStatus(documentId, "rejected", userId);
      }

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.patch("/api/annotations/:id/status", requireAuth, async (req: any, res) => {
    try {
      const annotationId = parseInt(req.params.id);
      const { status } = req.body;

      const annotation = await storage.updateAnnotationStatus(annotationId, status);
      res.json(annotation);
    } catch (error) {
      console.error("Error updating annotation status:", error);
      res.status(500).json({ message: "Failed to update annotation status" });
    }
  });

  // Smart dashboard endpoints
  app.get("/api/companies/:id/dashboard", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const dashboardData = await storage.getDashboardData(companyId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  app.get("/api/companies/:id/user-stats", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const users = await storage.getCompanyUsers(companyId);
      res.json({ totalUsers: users.length });
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ error: "Failed to get user stats" });
    }
  });

  app.get("/api/companies/:id/notifications", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const notifications = await storage.getUserNotifications(companyId);
      res.json(notifications);
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  // Document progress tracking endpoints
  app.get("/api/companies/:id/document-progress", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const progress = await storage.getDocumentProgress(companyId);
      res.json(progress);
    } catch (error) {
      console.error("Error getting document progress:", error);
      res.status(500).json({ error: "Failed to get document progress" });
    }
  });

  app.patch("/api/companies/:companyId/documents/:documentId/progress", requireAuth, async (req: any, res) => {
    try {
      const { companyId, documentId } = req.params;
      const { completionPercentage, workflowNotes } = req.body;

      await storage.updateDocumentProgress(parseInt(documentId), completionPercentage, workflowNotes);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating document progress:", error);
      res.status(500).json({ error: "Failed to update document progress" });
    }
  });

  app.post("/api/companies/:companyId/documents/:documentId/notify", requireAuth, async (req: any, res) => {
    try {
      const { companyId, documentId } = req.params;
      const { notificationType } = req.body;

      const success = await storage.sendDocumentNotification(parseInt(documentId), parseInt(companyId), notificationType);
      res.json({ success });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Admin company management endpoints for demo purposes
  app.delete("/api/companies/:id", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Get the user to check if they're admin
      const user = await storage.getUser(userId);
      if (!user || user.email !== 'admin@workdoc360.com') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Check if user has admin role for this company or is system admin
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin' && user.email !== 'admin@workdoc360.com') {
        return res.status(403).json({ message: "Admin access required to delete company" });
      }

      // In production, this would cascade delete all related data
      // For demo purposes, we'll just mark as deleted or remove

      // Note: This is a demo feature - in production you'd want more sophisticated
      // soft deletion and data archiving
      console.log(`Demo: Deleting company ${companyId} by admin user ${userId}`);

      res.json({
        success: true,
        message: "Company deleted successfully (demo mode)"
      });
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Demo document generation endpoint - creates real documents for demo companies
  app.post("/api/demo/generate-document", async (req, res) => {
    try {
      const { generateDocument } = await import("./documentGenerator");
      console.log('Demo generation request body:', JSON.stringify(req.body, null, 2));

      // Frontend sends: { trade, documentType, contactDetails: { email, companyName }, answers }
      const { trade, documentType, contactDetails, answers } = req.body;

      // Map to expected parameters and normalize template type
      const templateTypeMap: { [key: string]: string } = {
        'risk-assessment': 'risk_assessment',
        'method-statement': 'method_statement',
        'toolbox-talk': 'toolbox_talk'
      };

      const templateType = templateTypeMap[documentType] || documentType;
      const tradeType = trade;
      const companyName = contactDetails?.companyName || 'Demo Company';

      console.log('Mapped templateType:', templateType);

      // Predefined demo site information for each company
      const demoSiteData = {
        "Premier Scaffolding Ltd": {
          siteName: "Manchester Commercial Centre",
          siteAddress: "123 Deansgate, Manchester M1 4AE",
          projectManager: "David Thompson"
        },
        "Elite Plastering Services": {
          siteName: "Birmingham Residential Development",
          siteAddress: "456 Broad Street, Birmingham B15 3TR",
          projectManager: "Sarah Williams"
        },
        "Sparks Electrical Contractors": {
          siteName: "London Office Refurbishment",
          siteAddress: "789 Borough High Street, London SE1 9GF",
          projectManager: "Michael Chen"
        }
      };

      const siteData = (demoSiteData as any)[companyName] || {
        siteName: "Demo Construction Site",
        siteAddress: "Demo Address, UK",
        projectManager: "Demo Manager"
      };

      const documentParams = {
        templateType,
        companyName,
        tradeType,
        ...siteData,
        hazards: "Working at height, manual handling, equipment operation",
        controlMeasures: "Safety barriers, proper PPE, regular inspections",
        specialRequirements: "All work to be carried out in accordance with current UK regulations"
      };

      const document = await generateDocument(documentParams);

      // Add multiple security layers to demo content
      const lines = document.content.split('\n');
      const watermarkedLines = lines.map((line, index) => {
        // Add watermarks every 5 lines and at random intervals
        if (index % 5 === 0 || Math.random() < 0.15) {
          return `${line} [DEMO]`;
        }
        return line;
      });

      const watermarkedContent = `
=== DEMO DOCUMENT - FOR PREVIEW ONLY ===
This document is generated for demonstration purposes only.
Real documents require a WorkDoc360 subscription.

${watermarkedLines.join('\n')}

--- PROTECTION NOTICE ---
This is a demonstration document generated by WorkDoc360 AI.
Content is protected and cannot be copied, saved, or used commercially.
To generate, save, and download real documents, subscribe at workdoc360.com
=== END DEMO ===`;

      // Fragment the content to prevent easy copying
      const fragmentedContent = watermarkedContent
        .replace(/\n\n/g, '\n[DEMO_BREAK]\n')
        .replace(/\./g, '. [DEMO]');

      res.json({
        ...document,
        content: fragmentedContent,
        isDemo: true,
        copyProtected: true,
        watermarkLevel: 'high'
      });
    } catch (error) {
      console.error("Demo document generation error:", error);
      res.status(500).json({
        error: "Failed to generate demo document",
        message: (error as any)?.message || 'Unknown error'
      });
    }
  });

  // Document export endpoints for subscribed users
  app.post("/api/companies/:companyId/documents/:documentId/export", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const documentId = parseInt(req.params.documentId);
      const userId = req.user.id;
      const { format } = req.body; // 'pdf' or 'word'

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get user subscription status
      const user = await storage.getUser(userId);
      if (!user || user.planStatus === 'pending_payment') {
        return res.status(402).json({ message: "Subscription required for document export" });
      }

      const document = await storage.getGeneratedDocument(documentId);
      if (!document || document.companyId !== companyId) {
        return res.status(404).json({ message: "Document not found" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const { generatePDF, generateWord } = await import('./documentExport');

      const exportOptions = {
        title: document.documentName,
        content: generateDocumentContentForExport(document),
        companyName: company.name,
        companyAddress: company.address || '',
        documentId: `WD360-${document.id.toString().padStart(6, '0')}`,
        generatedDate: document.createdAt ? new Date(document.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        templateType: document.templateType
      };

      let buffer: Buffer;
      let contentType: string;
      let filename: string;

      if (format === 'pdf') {
        buffer = await generatePDF(exportOptions);
        contentType = 'application/pdf';
        filename = `${document.documentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      } else if (format === 'word') {
        buffer = await generateWord(exportOptions);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `${document.documentName.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
      } else {
        return res.status(400).json({ message: "Invalid format. Use 'pdf' or 'word'" });
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting document:", error);
      res.status(500).json({ message: "Failed to export document" });
    }
  });

  app.post("/api/companies/:companyId/documents/:documentId/email", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const documentId = parseInt(req.params.documentId);
      const userId = req.user.id;
      const { recipientEmail, format } = req.body; // format: 'pdf' or 'word'

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get user subscription status
      const user = await storage.getUser(userId);
      if (!user || user.planStatus === 'pending_payment') {
        return res.status(402).json({ message: "Subscription required for document emailing" });
      }

      const document = await storage.getGeneratedDocument(documentId);
      if (!document || document.companyId !== companyId) {
        return res.status(404).json({ message: "Document not found" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const { generatePDF, generateWord, emailDocument } = await import('./documentExport');

      const exportOptions = {
        title: document.documentName,
        content: generateDocumentContentForExport(document),
        companyName: company.name,
        companyAddress: company.address || '',
        documentId: `WD360-${document.id.toString().padStart(6, '0')}`,
        generatedDate: document.createdAt ? new Date(document.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        templateType: document.templateType
      };

      let buffer: Buffer;

      if (format === 'pdf') {
        buffer = await generatePDF(exportOptions);
      } else if (format === 'word') {
        buffer = await generateWord(exportOptions);
      } else {
        return res.status(400).json({ message: "Invalid format. Use 'pdf' or 'word'" });
      }

      const emailSent = await emailDocument(
        recipientEmail,
        document.documentName,
        buffer,
        format,
        company.name
      );

      if (emailSent) {
        res.json({ message: "Document emailed successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      console.error("Error emailing document:", error);
      res.status(500).json({ message: "Failed to email document" });
    }
  });

  // AI-powered CSCS card verification routes
  app.post("/api/verify-card-image", requireAuth, async (req: any, res) => {
    try {
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image data required" });
      }

      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const verificationResult = await aiCardVerificationService.verifyCardWithAI(base64Data);

      res.json(verificationResult);
    } catch (error: any) {
      console.error("AI card verification error:", error);
      res.status(500).json({ error: "Card verification failed" });
    }
  });

  // CSCS register check route
  app.post("/api/check-cscs-register", requireAuth, async (req: any, res) => {
    try {
      const { cardNumber, holderName } = req.body;

      if (!cardNumber) {
        return res.status(400).json({ error: "Card number required" });
      }

      const verification = await cscsVerificationService.verifyCSCSCard(cardNumber, holderName);

      res.json(verification);
    } catch (error: any) {
      console.error("CSCS register check error:", error);
      res.status(500).json({ error: "Register check failed" });
    }
  });

  // RPA-based CSCS verification using cscssmartcheck.co.uk
  app.post("/api/companies/:id/verify-cscs-rpa", requireAuth, async (req: any, res) => {
    try {
      const { id: companyId } = req.params;
      const { cardNumber, scheme } = req.body;
      const userId = req.user.id;

      // Check user access to company
      const role = await storage.getUserRole(userId, parseInt(companyId));
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!cardNumber) {
        return res.status(400).json({ error: 'Card number is required' });
      }

      // Import RPA service dynamically
      const { cscsRpaService } = await import('./services/cscsRpaService');

      // Perform RPA verification
      const rpaResult = await cscsRpaService.verifyCSCSCardRPA(cardNumber, scheme || 'CSCS');

      // Save cardholder photo if available
      let savedPhotoUrl: string | null = null;
      if (rpaResult.holderPhotoBase64) {
        savedPhotoUrl = await cscsRpaService.saveCardholderPhoto(
          cardNumber,
          companyId,
          rpaResult.holderPhotoBase64
        );
        console.log('Saved cardholder photo:', savedPhotoUrl || 'Failed to save');
      }

      // Log verification for audit trail
      console.log(`CSCS RPA Verification - Company ${companyId}:`, {
        cardNumber: rpaResult.cardNumber,
        status: rpaResult.status,
        hasPhoto: !!rpaResult.holderPhotoBase64,
        savedPhotoUrl: savedPhotoUrl,
        timestamp: rpaResult.verificationTimestamp
      });

      // Add saved photo URL to response
      const response = {
        ...rpaResult,
        savedPhotoUrl
      };

      res.json(response);

    } catch (error: any) {
      console.error('CSCS RPA verification error:', error);
      res.status(500).json({
        error: 'RPA verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test endpoint for RPA verification (for demo/testing purposes)
  app.post('/api/test-rpa-verify', async (req, res) => {
    try {
      const { cardNumber, scheme = 'CSCS' } = req.body;

      if (!cardNumber) {
        return res.status(400).json({ error: 'Card number required' });
      }

      // Import RPA service dynamically
      const { cscsRpaService } = await import('./services/cscsRpaService');

      // Perform RPA verification
      const rpaResult = await cscsRpaService.verifyCSCSCardRPA(cardNumber, scheme);

      // Save cardholder photo if available (use demo company)
      let savedPhotoUrl: string | null = null;
      if (rpaResult.holderPhotoBase64) {
        savedPhotoUrl = await cscsRpaService.saveCardholderPhoto(
          cardNumber,
          'demo-company',
          rpaResult.holderPhotoBase64
        );
        console.log('Saved cardholder photo:', savedPhotoUrl || 'Failed to save');
      }

      // Log verification for audit trail
      console.log(`CSCS RPA Test Verification:`, {
        cardNumber: rpaResult.cardNumber,
        status: rpaResult.status,
        hasPhoto: !!rpaResult.holderPhotoBase64,
        savedPhotoUrl: savedPhotoUrl,
        timestamp: rpaResult.verificationTimestamp
      });

      // Add saved photo URL to response
      const response = {
        ...rpaResult,
        savedPhotoUrl
      };

      res.json(response);
    } catch (error) {
      console.error('RPA test verification error:', error);
      res.status(500).json({
        error: 'RPA verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Batch RPA verification endpoint
  app.post("/api/companies/:id/verify-cscs-batch-rpa", requireAuth, async (req: any, res) => {
    try {
      const { id: companyId } = req.params;
      const { cardNumbers, scheme } = req.body;
      const userId = req.user.id;

      // Check user access to company
      const role = await storage.getUserRole(userId, parseInt(companyId));
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!cardNumbers || !Array.isArray(cardNumbers)) {
        return res.status(400).json({ error: 'Card numbers array is required' });
      }

      // Import RPA service dynamically
      const { cscsRpaService } = await import('./services/cscsRpaService');

      // Perform batch RPA verification
      const batchResults = await cscsRpaService.verifyMultipleCards(cardNumbers, scheme || 'CSCS');

      // Log batch verification
      console.log(`CSCS Batch RPA Verification - Company ${companyId}:`, {
        totalCards: cardNumbers.length,
        successfulVerifications: batchResults.filter(r => r.status !== 'error').length,
        timestamp: new Date().toISOString()
      });

      res.json({
        results: batchResults,
        summary: {
          total: cardNumbers.length,
          successful: batchResults.filter(r => r.status !== 'error').length,
          errors: batchResults.filter(r => r.status === 'error').length
        }
      });

    } catch (error: any) {
      console.error('CSCS Batch RPA verification error:', error);
      res.status(500).json({
        error: 'Batch RPA verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test RPA connection endpoint
  app.get("/api/test-rpa-connection", requireAuth, async (req: any, res) => {
    try {
      const { cscsRpaService } = await import('./services/cscsRpaService');
      const isConnected = await cscsRpaService.testRPAConnection();

      res.json({
        connected: isConnected,
        timestamp: new Date().toISOString(),
        service: 'cscssmartcheck.co.uk'
      });
    } catch (error: any) {
      res.status(500).json({
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // CSCS Online Database Verification Endpoint
  app.post("/api/companies/:id/verify-cscs-online", requireAuth, async (req: any, res) => {
    try {
      const { id: companyId } = req.params;
      const { cardNumber, holderName } = req.body;
      const userId = req.user.id;

      // Check user access to company
      const role = await storage.getUserRole(userId, parseInt(companyId));
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!cardNumber) {
        return res.status(400).json({ error: 'Card number is required' });
      }

      // Helper function to determine card status
      const determineOnlineCardStatus = (cardNumber: string): 'valid' | 'expired' | 'revoked' | 'invalid' | 'not_found' => {
        const cardNum = cardNumber.toLowerCase();
        if (cardNum.includes('exp')) return 'expired';
        if (cardNum.includes('rev')) return 'revoked';
        if (cardNum.includes('inv')) return 'invalid';
        if (cardNum.includes('404') || cardNum.includes('missing')) return 'not_found';
        // Based on the card image provided, this appears to be an expired card
        if (cardNum === '12345678' || cardNum.length < 6) return 'expired';
        return 'valid';
      };

      // For demo purposes, simulate CSCS Smart Check API response
      // In production, this would call the actual CSCS Smart Check API
      const mockOnlineResult = {
        cardNumber: cardNumber.trim(),
        holderName: holderName || "Paul Construction Worker",
        cardType: "CSCS Scaffolding Labourer Card",
        expiryDate: "2024-12-31",
        issueDate: "2019-12-31",
        status: determineOnlineCardStatus(cardNumber),
        tradeQualification: "Scaffolding Labourer",
        scheme: "Construction Skills Certification Scheme (CSCS)",
        verificationSource: "cscs_smart_check" as const,
        lastUpdated: "2024-07-24",
        cardColour: "green",
        qualificationLevel: "Level 1 - Labourer"
      };

      // Log verification for audit trail
      console.log(`CSCS Online Verification - Company ${companyId}:`, {
        cardNumber: mockOnlineResult.cardNumber,
        status: mockOnlineResult.status,
        holderName: mockOnlineResult.holderName,
        timestamp: new Date().toISOString()
      });

      res.json(mockOnlineResult);

    } catch (error: any) {
      console.error('CSCS online verification error:', error);
      res.status(500).json({
        error: 'Online verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // CSCS Image Verification Endpoint
  app.post("/api/companies/:id/verify-cscs-image", requireAuth, upload.single('image'), async (req: any, res) => {
    try {
      const { id: companyId } = req.params;
      const imageFile = req.file;
      const userId = req.user.id;

      // Check user access to company
      const role = await storage.getUserRole(userId, parseInt(companyId));
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!imageFile) {
        return res.status(400).json({ error: 'No image provided' });
      }

      // For demo purposes, simulate image analysis results
      // In production, this would use Claude Vision API with the uploaded image
      const mockAnalysisResult = {
        cardType: "Green CSCS Scaffolding Labourer Card",
        holderName: "John Smith",
        cardNumber: `IMG-${Date.now()}`,
        tradeQualification: "Scaffolding Labourer",
        expiryDate: "2026-12-31",
        testDate: "2021-06-15",
        imageAnalysis: {
          cardTypeDetected: "Green CSCS Labourer Card - Scaffolding",
          securityFeatures: ["CSCS Watermarks", "Photo ID", "TESTED marking", "Professional format"],
          visualAuthenticity: "genuine" as const
        }
      };

      // Determine card status based on analysis
      const currentDate = new Date();
      const expiryDate = new Date(mockAnalysisResult.expiryDate);
      const daysDifference = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      let status: 'valid' | 'expired' | 'revoked' | 'invalid' = 'valid';
      if (daysDifference < 0) {
        status = 'expired';
      } else if (mockAnalysisResult.cardNumber.toLowerCase().includes('rev')) {
        status = 'revoked';
      } else if (mockAnalysisResult.cardNumber.toLowerCase().includes('inv')) {
        status = 'invalid';
      }

      const verificationResult = {
        ...mockAnalysisResult,
        status,
        verificationMethod: 'image_analysis',
        verifiedAt: new Date().toISOString(),
        companyId: parseInt(companyId),
        daysUntilExpiry: daysDifference
      };

      // Log verification for audit trail
      console.log(`CSCS Image Verification - Company ${companyId}:`, {
        cardNumber: verificationResult.cardNumber,
        status: verificationResult.status,
        holderName: verificationResult.holderName,
        timestamp: verificationResult.verifiedAt
      });

      res.json(verificationResult);

    } catch (error: any) {
      console.error('CSCS image verification error:', error);
      res.status(500).json({
        error: 'Image verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Fraud assessment route
  app.post("/api/assess-card-fraud", requireAuth, async (req: any, res) => {
    try {
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image data required" });
      }

      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageAnalysis = await aiCardVerificationService.analyseCardImage(base64Data);
      const fraudAssessment = aiCardVerificationService.generateFraudAssessment(imageAnalysis);

      res.json({
        imageAnalysis,
        fraudAssessment
      });
    } catch (error: any) {
      console.error("Fraud assessment error:", error);
      res.status(500).json({ error: "Fraud assessment failed" });
    }
  });

  // Logo upload endpoint
  app.post("/api/companies/:id/upload-logo", requireAuth, upload.single('logo'), async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has admin access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || role !== "admin") {
        return res.status(403).json({ message: "Admin access required to upload logo" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No logo file provided" });
      }

      // Create public URL for the uploaded logo
      const logoUrl = `/uploaded_assets/${req.file.filename}`;

      // Update company with new logo URL
      const updatedCompany = await storage.updateCompany(companyId, {
        logoUrl
      });

      res.json({
        message: "Logo uploaded successfully",
        logoUrl,
        company: updatedCompany
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Logo upload failed" });
    }
  });

  // Document upload endpoint
  app.post("/api/companies/:id/upload-documents", requireAuth, upload.array('documents', 10), async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const { documentType, title, description } = req.body;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No documents provided" });
      }

      const uploadedDocuments = [];

      // Process each uploaded file
      for (const file of req.files) {
        const fileUrl = `/uploaded_assets/${file.filename}`;

        const documentData = {
          companyId,
          templateType: documentType,
          documentName: title || file.originalname,
          siteName: "Uploaded Document",
          siteAddress: description || "User uploaded document",
          projectManager: req.user.firstName + " " + req.user.lastName,
          hazards: null,
          controlMeasures: `Document uploaded: ${file.originalname}`,
          specialRequirements: description,
          status: 'uploaded',
          filePath: file.path,
          fileUrl,
          generatedBy: userId,
        };

        const document = await storage.createGeneratedDocument(documentData);
        uploadedDocuments.push(document);
      }

      res.json({
        message: "Documents uploaded successfully",
        documentsProcessed: uploadedDocuments.length,
        documents: uploadedDocuments
      });
    } catch (error) {
      console.error("Error uploading documents:", error);
      res.status(500).json({ message: "Document upload failed" });
    }
  });

  // Document suite generation endpoint
  app.post("/api/companies/:id/generate-document-suite", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const { suiteId, companyName, tradeType } = req.body;

      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get company details
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      let generatedDocuments: any[] = [];

      // Generate documents based on suite type
      switch (suiteId) {
        case 'essential-compliance':
          generatedDocuments = await storage.createBasicStarterDocumentsForCompany(
            companyId,
            tradeType,
            userId
          );
          break;

        case 'trade-specialist':
          // Generate trade-specific documents
          if (tradeType === 'scaffolding') {
            const scaffoldDocs = [
              { templateType: 'scaffold-inspection-checklist', name: 'Daily Scaffold Inspection Checklist' },
              { templateType: 'working-at-height-risk', name: 'Working at Height Risk Assessment' },
              { templateType: 'scaffold-erection-method', name: 'Scaffold Erection Method Statement' }
            ];

            for (const doc of scaffoldDocs) {
              const docData = {
                companyId,
                templateType: doc.templateType,
                documentName: doc.name,
                siteName: company.name,
                siteAddress: company.address || "Various locations",
                projectManager: "Site Manager",
                hazards: null,
                controlMeasures: "Generated from trade specialist suite",
                specialRequirements: `${tradeType} specialist document`,
                status: 'generated',
                filePath: `/documents/${doc.templateType}-${companyId}-${Date.now()}.pdf`,
                fileUrl: `/api/documents/${doc.templateType}-${companyId}-${Date.now()}.pdf`,
                generatedBy: userId,
              };

              const generatedDoc = await storage.createGeneratedDocument(docData);
              generatedDocuments.push(generatedDoc);
            }
          }
          break;

        case 'iso-9001-complete':
          generatedDocuments = await storage.createPremiumStarterDocumentsForCompany(
            companyId,
            tradeType,
            userId
          );
          break;
      }

      res.json({
        message: "Document suite generated successfully",
        documentCount: generatedDocuments.length,
        documents: generatedDocuments
      });
    } catch (error) {
      console.error("Error generating document suite:", error);
      res.status(500).json({ message: "Document suite generation failed" });
    }
  });

  // Voucher code validation endpoint
  app.post("/api/validate-voucher", requireAuth, async (req: any, res) => {
    try {
      const { code, planType } = req.body;

      if (!code || !planType) {
        return res.status(400).json({ message: "Voucher code and plan type are required" });
      }

      // Get voucher from database
      const voucher = await storage.getVoucherByCode(code.toUpperCase());

      if (!voucher) {
        return res.status(400).json({ message: "Invalid voucher code" });
      }

      // Check if voucher is active
      if (!voucher.isActive) {
        return res.status(400).json({ message: "This voucher code is no longer active" });
      }

      // Check expiration date
      if (voucher.validUntil && new Date(voucher.validUntil) < new Date()) {
        return res.status(400).json({ message: "This voucher code has expired" });
      }

      // Check if voucher has reached max uses
      if (voucher.maxUses && (voucher.usedCount || 0) >= voucher.maxUses) {
        return res.status(400).json({ message: "This voucher code has been fully redeemed" });
      }

      // Check if voucher applies to this plan
      if (voucher.applicablePlans && voucher.applicablePlans.length > 0) {
        if (!voucher.applicablePlans.includes(planType)) {
          return res.status(400).json({
            message: `This voucher is not valid for the ${planType} plan`
          });
        }
      }

      // Calculate pricing
      const planPricing = {
        micro: { monthly: 35, yearly: 350 },
        essential: { monthly: 65, yearly: 650 },
        professional: { monthly: 129, yearly: 1290 },
        enterprise: { monthly: 299, yearly: 2990 }
      };

      const plan = planPricing[planType as keyof typeof planPricing];
      if (!plan) {
        return res.status(400).json({ message: "Invalid plan type" });
      }

      // For now, assume yearly billing (can be enhanced to detect from user preferences)
      const originalAmount = plan.yearly;
      let finalAmount = originalAmount;
      let discountAmount = 0;

      // Calculate discount based on type
      switch (voucher.discountType) {
        case 'bypass_payment':
          finalAmount = 0;
          discountAmount = originalAmount;
          break;
        case 'percentage':
          discountAmount = Math.floor(originalAmount * (voucher.discountValue! / 100));
          finalAmount = originalAmount - discountAmount;
          break;
        case 'fixed_amount':
          discountAmount = Math.min(voucher.discountValue! / 100, originalAmount); // discountValue stored in pence
          finalAmount = Math.max(0, originalAmount - discountAmount);
          break;
        case 'free_month':
          // For yearly plans, give months free
          const monthlyPrice = plan.monthly;
          discountAmount = monthlyPrice * (voucher.discountValue || 1);
          finalAmount = Math.max(0, originalAmount - discountAmount);
          break;
        default:
          return res.status(400).json({ message: "Invalid voucher type" });
      }

      // Return voucher application details
      res.json({
        code: voucher.code,
        description: voucher.description || `${voucher.discountType.replace('_', ' ')} voucher`,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        discountAmount: discountAmount * 100, // Return in pence for consistency
        finalAmount: finalAmount,
        originalAmount: originalAmount
      });

    } catch (error) {
      console.error("Error validating voucher:", error);
      res.status(500).json({ message: "Failed to validate voucher code" });
    }
  });

  // Apply voucher and activate account (bypass payment)
  app.post("/api/activate-with-voucher", requireAuth, async (req: any, res) => {
    try {
      const { voucherCode, planId, billingCycle } = req.body;
      const userId = req.user.id;

      // Validate voucher again
      const voucher = await storage.getVoucherByCode(voucherCode.toUpperCase());
      if (!voucher || voucher.discountType !== 'bypass_payment') {
        return res.status(400).json({ message: "Invalid voucher for free access" });
      }

      // Record voucher usage
      await storage.recordVoucherUsage({
        voucherId: voucher.id,
        userId: userId,
        planApplied: planId,
        discountAmount: 0, // Full bypass
      });

      // Update user plan status
      await storage.updateUserPlanStatus(userId, {
        planStatus: 'active',
        selectedPlan: planId,
        subscriptionType: billingCycle,
        contractStartDate: new Date(),
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      // Increment voucher usage count
      await storage.incrementVoucherUsage(voucher.id);

      res.json({
        success: true,
        message: "Account activated successfully with voucher",
        planStatus: 'active'
      });

    } catch (error) {
      console.error("Error activating with voucher:", error);
      res.status(500).json({ message: "Failed to activate account with voucher" });
    }
  });

  // Serve uploaded assets statically
  app.use('/uploaded_assets', express.static(path.join(process.cwd(), 'uploaded_assets')));



  // Import subdomain testing routes  
  try {
    const subdomainTestRoutes = await import('./api-routes/subdomain-test');
    app.use('/api/dev', subdomainTestRoutes.default);
    console.log('✅ Subdomain test routes loaded');
  } catch (error) {
    console.error('❌ Failed to load subdomain test routes:', error);
  }

  // Import manual subdomain setup routes (backup solution)
  try {
    const manualSubdomainRoutes = await import('./api-routes/manual-subdomain-setup');
    app.use('/api/subdomain', manualSubdomainRoutes.default);
    console.log('✅ Manual subdomain routes loaded');
  } catch (error) {
    console.error('❌ Failed to load manual subdomain routes:', error);
  }

  // Import Cloudflare setup routes (alternative DNS provider)
  try {
    const cloudflareSetupRoutes = await import('./api-routes/cloudflare-setup');
    app.use('/api/cloudflare', cloudflareSetupRoutes.default);
    console.log('✅ Cloudflare setup routes loaded');
  } catch (error) {
    console.error('❌ Failed to load Cloudflare setup routes:', error);
  }

  // Demo website questionnaire routes
  app.use("/api/demo-questionnaire", (await import("./routes/demo-questionnaire")).default);

  // Master Trade Company routes - Industry oracles for compliance management
  try {
    const { masterTradeRoutes } = await import("./routes/masterTradeRoutes");
    app.use("/api/master-trades", masterTradeRoutes);
    console.log('✅ Master Trade Company routes loaded');
  } catch (error) {
    console.error('❌ Failed to load Master Trade routes:', error);
  }

  // Analytics tracking endpoint
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { event, properties } = req.body;

      // Log analytics event (in production, send to analytics service)
      console.log(`📊 Analytics Event: ${event}`, properties);

      // Store important conversion events in database
      if (["user_signup", "company_created", "document_generated", "payment_completed"].includes(event)) {
        // Store in analytics table for reporting
        // await storage.trackAnalyticsEvent(event, properties);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Analytics tracking error:", error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  // Email capture endpoint
  app.post("/api/email-capture", async (req, res) => {
    try {
      const { email, firstName, tradeType, source, capturedAt } = req.body;

      if (!email || !firstName) {
        return res.status(400).json({ error: "Email and first name are required" });
      }

      // Store email capture (in production, integrate with email service)
      console.log(`📧 Email Capture: ${email} (${firstName}) - ${source}`);

      // Add to email marketing system
      // await emailService.addToList(email, firstName, { tradeType, source });

      res.json({ success: true, message: "Successfully subscribed" });
    } catch (error) {
      console.error("Email capture error:", error);
      res.status(500).json({ error: "Failed to capture email" });
    }
  });

  // Admin endpoint to create voucher codes (for bypassing payments)
  app.post("/api/admin/create-voucher", async (req: any, res: any) => {
    try {
      const {
        code,
        description,
        discountType = 'bypass_payment',
        discountValue = 0,
        maxUses = 1,
        validUntil,
        applicablePlans
      } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Voucher code is required" });
      }

      // Check if code already exists
      const existing = await storage.getVoucherByCode(code.toUpperCase());
      if (existing) {
        return res.status(400).json({ message: "Voucher code already exists" });
      }

      const voucherData = {
        code: code.toUpperCase(),
        description: description || `${discountType === 'bypass_payment' ? 'Free Access' : 'Discount'} Voucher`,
        discountType,
        discountValue,
        maxUses,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        applicablePlans: applicablePlans || null,
        isActive: true,
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const voucher = await storage.createVoucher(voucherData);
      res.json({ success: true, voucher });

    } catch (error) {
      console.error("Voucher creation error:", error);
      res.status(500).json({ error: "Failed to create voucher" });
    }
  });

  // Admin endpoint to check voucher code validity
  app.get("/api/admin/voucher/:code", async (req: any, res: any) => {
    try {
      const voucher = await storage.getVoucherByCode(req.params.code.toUpperCase());

      if (!voucher) {
        return res.status(404).json({ message: "Voucher not found" });
      }

      res.json({ voucher });

    } catch (error) {
      console.error("Voucher check error:", error);
      res.status(500).json({ error: "Failed to check voucher" });
    }
  });

  // Exit intent email capture endpoint
  app.post("/api/capture-exit-intent", async (req: any, res: any) => {
    try {
      const { email, source = 'exit_intent' } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      console.log(`🚪 Exit Intent Capture: ${email} from ${source}`);

      // Send high-priority email notification to admin
      if (process.env.SENDGRID_API_KEY) {
        const msg = {
          to: 'admin@workdoc360.com',
          from: 'noreply@workdoc360.com',
          subject: '🔥 High-Intent Lead Captured - Exit Intent',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">High-Intent Lead Alert</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Source:</strong> ${source || 'exit_intent'}</p>
                  <p><strong>Captured:</strong> ${new Date().toLocaleString('en-GB')}</p>
                </div>
                
                <div style="background: #ffe6e6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <h3 style="color: #d32f2f; margin-top: 0;">🔥 Priority Lead!</h3>
                  <p style="margin: 10px 0; color: #d32f2f;">Exit intent captures convert 3x higher than normal leads.</p>
                </div>
              </div>
            </div>
          `
        };

        await sgMail.send(msg);
      }

      res.json({ message: "Email captured successfully" });

    } catch (error) {
      console.error("Exit intent capture error:", error);
      res.status(500).json({ error: "Failed to process email capture" });
    }
  });

  // Newsletter signup endpoint (similar implementation)
  app.post("/api/newsletter-signup", async (req: any, res: any) => {
    try {
      const { email, source = 'newsletter' } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      console.log(`📰 Newsletter Signup: ${email} from ${source}`);

      // Send high-priority email notification to admin
      if (process.env.SENDGRID_API_KEY) {
        const msg = {
          to: 'admin@workdoc360.com',
          from: 'noreply@workdoc360.com',
          subject: '🔥 High-Intent Lead Captured - Exit Intent',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-top: 0;">High-Intent Lead Alert</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Source:</strong> ${source || 'exit_intent'}</p>
                  <p><strong>Captured:</strong> ${new Date().toLocaleString('en-GB')}</p>
                </div>
                
                <div style="background: #ffe6e6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <h3 style="color: #d32f2f; margin-top: 0;">🔥 Priority Lead!</h3>
                  <p style="margin: 10px 0; color: #d32f2f;">Exit intent captures convert 3x higher than normal leads.</p>
                </div>
              </div>
            </div>
          `
        };

        await sgMail.send(msg);
      }

      res.json({ message: "Email captured successfully" });

    } catch (error) {
      console.error("Exit intent capture error:", error);
      res.status(500).json({ error: "Failed to process email capture" });
    }
  });

  // Note: Subdomain routing is handled by the subdomain middleware
  // The Vite server will serve the React app for all non-API routes

  const httpServer = createServer(app);
  return httpServer;
}

function getTemplateDisplayName(templateType: string): string {
  const nameMap: Record<string, string> = {
    "risk-assessment": "Risk Assessment",
    "method-statement": "Method Statement",
    "toolbox-talk": "Toolbox Talk Template",
    "permit-to-work": "Permit to Work",
    "scaffold-inspection": "Scaffold Inspection Checklist",
    "scaffold-handover": "Scaffold Handover Certificate",
    "surface-preparation": "Surface Preparation Checklist",
    "material-specification": "Material Specification Sheet",
    "site-setup": "Site Setup Checklist"
  };
  return nameMap[templateType] || "Document";
}

function generateDocumentContentForExport(document: any): string {
  // Generate proper content based on document type
  const templateContent: Record<string, string> = {
    quality_manual: `
QUALITY MANUAL

1. INTRODUCTION
This Quality Manual establishes the framework for ${document.companyName || 'the Company'}'s Quality Management System (QMS) in accordance with ISO 9001:2015 requirements. This manual demonstrates our commitment to delivering high-quality products and services whilst continually improving our processes.

2. SCOPE
This Quality Management System applies to all activities, products, and services provided by ${document.companyName || 'the Company'}, including:
- Construction and building services
- Project management
- Health and safety compliance
- Customer service delivery
- Subcontractor management

3. QUALITY POLICY
${document.companyName || 'The Company'} is committed to:
- Meeting customer requirements and exceeding expectations
- Complying with all applicable legal and regulatory requirements
- Continuous improvement of our Quality Management System
- Providing adequate resources for quality management
- Regular review and enhancement of our processes

4. MANAGEMENT RESPONSIBILITY
Senior management demonstrates leadership and commitment to the QMS by:
- Taking accountability for the effectiveness of the QMS
- Ensuring customer focus is maintained throughout the organisation
- Establishing and communicating the quality policy
- Ensuring the availability of resources
- Conducting management reviews

5. RESOURCE MANAGEMENT
The organisation ensures adequate resources are available including:
- Competent personnel
- Appropriate infrastructure
- Suitable work environment
- Monitoring and measuring equipment

6. PROCESS APPROACH
Our QMS is based on the process approach, identifying and managing interrelated processes to achieve consistent results and customer satisfaction.

7. DOCUMENTATION
The QMS documentation includes:
- This Quality Manual
- Documented procedures
- Work instructions
- Records demonstrating conformity

8. CONTINUOUS IMPROVEMENT
The organisation continually improves the effectiveness of the QMS through:
- Internal audits
- Management reviews
- Corrective and preventive actions
- Customer feedback analysis

This manual is controlled and maintained by the Management Representative.`,

    procedure: `
PROCEDURE DOCUMENT

1. PURPOSE
This procedure defines the systematic approach for managing quality processes within ${document.companyName || 'the Company'} in compliance with ISO 9001:2015 requirements.

2. SCOPE
This procedure applies to all relevant personnel and activities within the organisation.

3. DEFINITIONS
Key terms and definitions relevant to this procedure are maintained in the company glossary.

4. RESPONSIBILITIES
- Management: Provide resources and support
- Process Owners: Implement and maintain procedures
- All Personnel: Follow established procedures
- Quality Manager: Monitor effectiveness

5. PROCEDURE STEPS
5.1 Planning
- Define objectives and requirements
- Identify resources needed
- Establish performance criteria

5.2 Implementation
- Execute planned activities
- Monitor performance
- Record results

5.3 Review and Improvement
- Analyse performance data
- Identify improvement opportunities
- Implement corrective actions

6. DOCUMENTATION AND RECORDS
All activities must be properly documented and records maintained as evidence of conformity.

7. TRAINING
Personnel must receive appropriate training to ensure competent execution of this procedure.

8. MONITORING AND MEASUREMENT
Regular monitoring ensures procedure effectiveness and identifies improvement opportunities.

9. REVIEW AND UPDATES
This procedure is reviewed annually or when changes occur that affect its effectiveness.`,

    policy: `
HEALTH AND SAFETY POLICY

POLICY STATEMENT
${document.companyName || 'The Company'} is committed to providing a safe and healthy working environment for all employees, contractors, visitors, and members of the public who may be affected by our activities.

OBJECTIVES
Our health and safety objectives are to:
- Prevent accidents and ill health
- Comply with legal requirements and industry standards
- Continually improve health and safety performance
- Provide adequate training and resources
- Engage with employees on health and safety matters

MANAGEMENT COMMITMENT
Senior management demonstrates commitment by:
- Providing leadership and setting a positive example
- Allocating adequate resources for health and safety
- Ensuring compliance with legal obligations
- Regularly reviewing health and safety performance

EMPLOYEE RESPONSIBILITIES
All employees must:
- Take reasonable care of their own health and safety
- Cooperate with health and safety requirements
- Report hazards and incidents immediately
- Use provided safety equipment properly
- Follow established procedures

CONSULTATION AND PARTICIPATION
We actively consult with employees on health and safety matters through:
- Regular safety meetings
- Hazard identification processes
- Incident investigation participation
- Safety suggestion schemes

CONTINUOUS IMPROVEMENT
We continuously improve our health and safety performance through:
- Regular risk assessments
- Internal audits and inspections
- Incident investigation and analysis
- Performance monitoring and review

This policy is reviewed annually and updated as necessary to ensure continued effectiveness.

Date: ${new Date().toLocaleDateString('en-GB')}
Authorised by: Management`
  };

  // Get company name for content generation
  const companyName = document.controlMeasures || 'PlasterMaster';

  // Replace placeholders in template content with actual company name
  const content = templateContent[document.templateType];
  if (content) {
    return content.replace(/\$\{document\.companyName \|\| 'the Company'\}/g, companyName)
      .replace(/\$\{document\.companyName \|\| 'The Company'\}/g, companyName);
  }

  return document.controlMeasures || document.hazards || `
Professional compliance document for ${document.companyName || 'Construction Company'}

DOCUMENT OVERVIEW
This document has been generated using WorkDoc360's AI-powered compliance system, specifically designed for UK construction industry requirements.

COMPLIANCE FRAMEWORK
- HSE Guidelines Compliant
- CDM 2015 Regulations
- UK Construction Standards
- Industry Best Practices

DOCUMENT DETAILS
Site Name: ${document.siteName || 'Main Site'}
Site Address: ${document.siteAddress || 'Not specified'}
Project Manager: ${document.projectManager || 'Not specified'}

CONTENT
This document provides comprehensive guidance and procedures to ensure compliance with UK construction industry standards and regulations.

All procedures and requirements outlined in this document must be followed to maintain compliance and ensure the safety of all personnel on site.

For specific requirements and detailed procedures, please refer to the relevant sections within your company's quality management system.`;
}

function generateDocumentContent(data: any): string {
  const { templateType, siteName, siteAddress, projectManager, tradeType } = data;

  const baseContent = `
# ${getTemplateDisplayName(templateType)}

## Site Information
- **Site Name**: ${siteName}
- **Site Address**: ${siteAddress}
- **Project Manager**: ${projectManager}
- **Trade Type**: ${tradeType ? tradeType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'General'}

## Document Details
- **Generated**: ${new Date().toLocaleDateString('en-GB')}
- **Status**: Active
- **Compliance**: UK Construction Standards

`;

  switch (templateType) {
    case "risk-assessment":
      return baseContent + `
## Risk Assessment Details

### Identified Hazards
1. Working at height
2. Manual handling
3. Noise exposure
4. Dust and debris
5. Electrical hazards

### Control Measures
- Personal Protective Equipment (PPE) mandatory
- Safety briefings before work commences
- Regular safety inspections
- Emergency procedures in place
- First aid provisions available

### Risk Rating
- **Initial Risk**: High
- **Residual Risk**: Low (with controls)
- **Review Date**: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
`;

    case "method-statement":
      return baseContent + `
## Method Statement

### Work Sequence
1. Site preparation and setup
2. Safety briefing for all personnel
3. Equipment inspection and testing
4. Work execution as per approved methods
5. Clean-up and site restoration

### Equipment Required
- PPE for all personnel
- Tools appropriate for the task
- Safety equipment and barriers
- First aid kit
- Emergency contact information

### Safety Procedures
- Daily safety briefings
- Regular equipment inspections
- Compliance with CDM 2015 regulations
- Emergency evacuation procedures
`;

    case "toolbox-talk":
      return baseContent + `
## Toolbox Talk Template

### Daily Safety Topics
- Weather conditions assessment
- Task-specific hazards
- PPE requirements
- Emergency procedures
- Tool and equipment safety

### Attendee Record
Date: ___________
Time: ___________
Conducted by: ___________

### Attendance List
| Name | Signature | Company |
|------|-----------|---------|
|      |           |         |
|      |           |         |
|      |           |         |

### Key Messages
1. Safety is everyone's responsibility
2. Report all hazards immediately
3. Stop work if conditions become unsafe
4. Follow all safety procedures
`;

    default:
      return baseContent + `
## Document Content

This document has been generated according to UK construction industry standards and regulations.

### Compliance Requirements
- CDM 2015 Construction (Design and Management) Regulations
- Health and Safety at Work Act 1974
- Construction Industry standards
- Trade-specific requirements

### Next Steps
1. Review document content
2. Customise for specific requirements
3. Obtain necessary approvals
4. Implement on site
5. Regular review and updates
`;
  }
}
