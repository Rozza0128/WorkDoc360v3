import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.warn("TWILIO environment variables not set. SMS functionality will be disabled.");
}

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

interface SMSParams {
  to: string; // Phone number in E.164 format (+44...)
  body: string;
}

export async function sendSMS(params: SMSParams): Promise<boolean> {
  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('Twilio not configured - SMS not sent');
    return false;
  }

  try {
    await client.messages.create({
      body: params.body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: params.to
    });
    return true;
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return false;
  }
}

// UK Construction-specific SMS templates
export async function sendCSCSExpirySMS(
  phoneNumber: string,
  recipientName: string,
  cardNumber: string,
  expiryDate: string,
  companyName: string
): Promise<boolean> {
  const message = `URGENT: ${recipientName}, your CSCS card ${cardNumber} expires ${expiryDate}. Renew now to avoid site access issues. - ${companyName}`;
  
  return await sendSMS({
    to: phoneNumber,
    body: message
  });
}

export async function sendToolboxTalkReminderSMS(
  phoneNumber: string,
  recipientName: string,
  companyName: string,
  siteName?: string
): Promise<boolean> {
  const siteInfo = siteName ? ` at ${siteName}` : '';
  const message = `REMINDER: ${recipientName}, daily toolbox talk required${siteInfo}. Please conduct safety briefing ASAP. HSE compliance essential. - ${companyName}`;
  
  return await sendSMS({
    to: phoneNumber,
    body: message
  });
}

export async function sendRiskAssessmentDueSMS(
  phoneNumber: string,
  recipientName: string,
  assessmentTitle: string,
  dueDate: string,
  companyName: string
): Promise<boolean> {
  const message = `REMINDER: ${recipientName}, risk assessment "${assessmentTitle}" review due ${dueDate}. Update required for CDM compliance. - ${companyName}`;
  
  return await sendSMS({
    to: phoneNumber,
    body: message
  });
}

export async function sendEmergencySiteSMS(
  phoneNumber: string,
  recipientName: string,
  emergencyType: string,
  siteName: string,
  companyName: string
): Promise<boolean> {
  const message = `EMERGENCY: ${emergencyType} at ${siteName}. ${recipientName}, follow emergency procedures immediately. Report to site manager. - ${companyName}`;
  
  return await sendSMS({
    to: phoneNumber,
    body: message
  });
}

export async function sendSiteAccessDeniedSMS(
  phoneNumber: string,
  recipientName: string,
  siteName: string,
  reason: string,
  companyName: string
): Promise<boolean> {
  const message = `ACCESS DENIED: ${recipientName}, entry to ${siteName} refused. Reason: ${reason}. Contact site manager for clearance. - ${companyName}`;
  
  return await sendSMS({
    to: phoneNumber,
    body: message
  });
}

export async function sendComplianceAlertSMS(
  phoneNumber: string,
  recipientName: string,
  alertType: string,
  actionRequired: string,
  companyName: string
): Promise<boolean> {
  const message = `COMPLIANCE ALERT: ${recipientName}, ${alertType} issue identified. Action required: ${actionRequired}. Contact compliance team. - ${companyName}`;
  
  return await sendSMS({
    to: phoneNumber,
    body: message
  });
}

export async function sendTwoFactorCodeSMS(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  const message = `Your WorkDoc360 verification code is: ${code}. This code expires in 10 minutes. Do not share this code.`;
  
  return await sendSMS({
    to: phoneNumber,
    body: message
  });
}

export async function sendWelcomeSMS(
  phoneNumber: string,
  recipientName: string,
  companyName: string
): Promise<boolean> {
  const message = `Welcome to WorkDoc360, ${recipientName}! Your ${companyName} account is now active. Stay compliant and safe on site.`;
  
  return await sendSMS({
    to: phoneNumber,
    body: message
  });
}

// Utility function to format UK phone numbers to E.164 format
export function formatUKPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Handle different UK phone number formats
  if (digitsOnly.startsWith('44')) {
    return `+${digitsOnly}`;
  } else if (digitsOnly.startsWith('0')) {
    return `+44${digitsOnly.substring(1)}`;
  } else if (digitsOnly.length === 10) {
    return `+44${digitsOnly}`;
  }
  
  // If already in correct format or unknown format, return as is
  return phoneNumber.startsWith('+') ? phoneNumber : `+44${digitsOnly}`;
}