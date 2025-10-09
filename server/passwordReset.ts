import { randomBytes } from "crypto";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, lt } from "drizzle-orm";

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export class PasswordResetService {
  // Generate a secure reset token
  static generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Create a password reset token (valid for 1 hour)
  static async createResetToken(email: string): Promise<{ success: boolean; token?: string; message: string }> {
    try {
      // Check if user exists
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        // For security, don't reveal if email exists
        return {
          success: true,
          message: "If an account with that email exists, a password reset link has been sent."
        };
      }

      const token = this.generateResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      // Delete any existing tokens for this user (using direct SQL for simplicity)
      await (db as any).execute(
        `DELETE FROM password_reset_tokens WHERE user_id = $1`,
        [user.id]
      );

      // Create new reset token (using direct SQL for simplicity)  
      await (db as any).execute(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES ($1, $2, $3, $4)`,
        [user.id, token, expiresAt, false]
      );

      return {
        success: true,
        token,
        message: "Password reset link has been sent to your email."
      };

    } catch (error) {
      console.error("Error creating reset token:", error);
      return {
        success: false,
        message: "Failed to process password reset request. Please try again."
      };
    }
  }

  // Verify and use a reset token
  static async verifyResetToken(token: string): Promise<{ valid: boolean; userId?: string; message: string }> {
    try {
      const result = await (db as any).execute(
        `SELECT id, user_id, token, expires_at, used FROM password_reset_tokens WHERE token = $1 LIMIT 1`,
        [token]
      );

      const resetToken: any = result && result.rows && result.rows[0];

      if (!resetToken) {
        return {
          valid: false,
          message: "Invalid or expired password reset link."
        };
      }

      if (resetToken.used) {
        return {
          valid: false,
          message: "This password reset link has already been used."
        };
      }

      const expiresAt = resetToken.expires_at ? new Date(resetToken.expires_at) : null;
      if (expiresAt && new Date() > expiresAt) {
        // Clean up expired token
        await (db as any).execute(
          `DELETE FROM password_reset_tokens WHERE id = $1`,
          [resetToken.id]
        );

        return {
          valid: false,
          message: "Password reset link has expired. Please request a new one."
        };
      }

      return {
        valid: true,
        userId: typeof resetToken.user_id === 'string' ? resetToken.user_id : String(resetToken.user_id),
        message: "Token is valid."
      };

    } catch (error) {
      console.error("Error verifying reset token:", error);
      return {
        valid: false,
        message: "Failed to verify reset token."
      };
    }
  }

  // Mark token as used and update password
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const verification = await this.verifyResetToken(token);

      if (!verification.valid || !verification.userId) {
        return {
          success: false,
          message: verification.message
        };
      }

      // Hash the new password
      const { hashPassword } = await import("./auth");
      const hashedPassword = await hashPassword(newPassword);

      // Update user's password
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, verification.userId));

      // Mark token as used
      await (db as any).execute(
        `UPDATE password_reset_tokens SET used = true WHERE token = $1`,
        [token]
      );

      // Clean up all tokens for this user
      await (db as any).execute(
        `DELETE FROM password_reset_tokens WHERE user_id = $1`,
        [verification.userId]
      );

      return {
        success: true,
        message: "Password has been successfully reset. You can now log in with your new password."
      };

    } catch (error) {
      console.error("Error resetting password:", error);
      return {
        success: false,
        message: "Failed to reset password. Please try again."
      };
    }
  }

  // Clean up expired tokens (can be run periodically)
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await (db as any).execute(
        `DELETE FROM password_reset_tokens WHERE expires_at < NOW()`
      );
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
    }
  }
}