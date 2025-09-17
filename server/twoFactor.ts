import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { sendEmail } from "./emailService";
import { sendTwoFactorCodeSMS, formatUKPhoneNumber } from "./smsService";

export interface TwoFactorSetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class TwoFactorService {
  // Generate a new 2FA secret and QR code for setup
  static async generateSetup(userId: string, userEmail: string): Promise<TwoFactorSetupResult> {
    const secret = speakeasy.generateSecret({
      name: `WorkDoc360 (${userEmail})`,
      issuer: "WorkDoc360",
      length: 32,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32!,
      qrCodeUrl,
      backupCodes,
    };
  }

  // Verify a TOTP code from authenticator app
  static verifyTOTP(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      token,
      encoding: "base32",
      window: 2, // Allow 2 time steps before/after for clock drift
    });
  }

  // Generate secure backup codes
  static generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString("hex").toUpperCase();
      codes.push(code.substring(0, 4) + "-" + code.substring(4));
    }
    return codes;
  }

  // Send email verification code
  static async sendEmailCode(userId: string, email: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in database
    await storage.createTwoFactorCode({
      userId,
      code,
      type: "email",
      expiresAt,
    });

    // Send email
    await sendEmail({
      to: email,
      from: "security@workdoc360.com",
      subject: "WorkDoc360 - Two-Factor Authentication Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">WorkDoc360 Security</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Two-Factor Authentication Code</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 25px;">
              Your verification code for WorkDoc360 is:
            </p>
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                This is an automated message from WorkDoc360. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return code;
  }

  // Send SMS verification code
  static async sendSMSCode(userId: string, phoneNumber: string): Promise<string> {
    const formattedPhone = formatUKPhoneNumber(phoneNumber);
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in database
    await storage.createTwoFactorCode({
      userId,
      code,
      type: "sms",
      expiresAt,
    });

    // Send SMS
    await sendTwoFactorCodeSMS(formattedPhone, code);

    return code;
  }

  // Verify email, SMS, or backup code
  static async verifyCode(userId: string, code: string, type: "email" | "sms" | "backup"): Promise<boolean> {
    if (type === "email" || type === "sms") {
      return await storage.verifyTwoFactorCode(userId, code, type);
    } else if (type === "backup") {
      return await storage.verifyBackupCode(userId, code);
    }
    return false;
  }

  // Enable 2FA for user
  static async enableTwoFactor(
    userId: string, 
    secret: string, 
    backupCodes: string[]
  ): Promise<void> {
    await storage.enableTwoFactor(userId, secret, backupCodes);
  }

  // Disable 2FA for user
  static async disableTwoFactor(userId: string): Promise<void> {
    await storage.disableTwoFactor(userId);
  }

  // Check if user has 2FA enabled
  static async isEnabled(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    return user?.twoFactorEnabled || false;
  }

  // Generate new backup codes
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const newCodes = this.generateBackupCodes();
    await storage.updateBackupCodes(userId, newCodes);
    return newCodes;
  }
}