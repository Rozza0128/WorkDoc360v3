import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from?: string; // optional, default applied by sendEmail
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const msg: any = {
      to: params.to,
      from: params.from ?? 'notifications@workdoc360.com',
      subject: params.subject,
    };
    if (params.text) msg.text = params.text;
    if (params.html) msg.html = params.html;
    await mailService.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// UK Construction-specific email templates
export async function sendCSCSExpiryReminder(
  recipientEmail: string,
  recipientName: string,
  cardNumber: string,
  expiryDate: string,
  companyName: string
): Promise<boolean> {
  const subject = `CSCS Card Expiry Reminder - ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563eb;">CSCS Card Renewal Required</h2>
        <p>Hello ${recipientName},</p>
        
        <p>Right then, your CSCS card needs sorting! Your card is due to expire soon:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <strong>Card Number:</strong> ${cardNumber}<br>
          <strong>Expiry Date:</strong> ${expiryDate}<br>
          <strong>Company:</strong> ${companyName}
        </div>
        
        <p>To avoid any issues on site, please renew your CSCS card before the expiry date. You can apply for renewal through the CITB website or contact your training provider.</p>
        
        <p><strong>Remember:</strong> You won't be able to work on most UK construction sites without a valid CSCS card!</p>
        
        <p>Cheers,<br>
        WorkDoc360 Compliance Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          This is an automated reminder from WorkDoc360. Please contact your site manager if you need assistance with CSCS card renewal.
        </div>
      </div>
    </div>
  `;

  const text = `
CSCS Card Renewal Required

Hello ${recipientName},

Your CSCS card is due to expire soon:

Card Number: ${cardNumber}
Expiry Date: ${expiryDate}
Company: ${companyName}

Please renew your CSCS card before the expiry date to avoid any issues on site.

Cheers,
WorkDoc360 Compliance Team
  `;

  return await sendEmail({
    to: recipientEmail,
    from: 'notifications@workdoc360.com', // You'll need to verify this domain with SendGrid
    subject,
    text,
    html
  });
}

export async function sendToolboxTalkReminder(
  recipientEmail: string,
  recipientName: string,
  companyName: string,
  siteName?: string
): Promise<boolean> {
  const subject = `Toolbox Talk Required - ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #dc2626;">Daily Toolbox Talk Required</h2>
        <p>Hello ${recipientName},</p>
        
        <p>Time to get the team together for today's safety briefing! A toolbox talk hasn't been recorded yet for:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <strong>Company:</strong> ${companyName}<br>
          ${siteName ? `<strong>Site:</strong> ${siteName}<br>` : ''}
          <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}
        </div>
        
        <p>Remember, daily toolbox talks are essential for:</p>
        <ul>
          <li>Keeping everyone safe on site</li>
          <li>Meeting HSE requirements</li>
          <li>Maintaining insurance compliance</li>
          <li>Preventing accidents and incidents</li>
        </ul>
        
        <p>Please conduct and record today's toolbox talk as soon as possible.</p>
        
        <p>Stay safe!<br>
        WorkDoc360 Compliance Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          This is an automated reminder from WorkDoc360. Daily toolbox talks are a legal requirement on UK construction sites.
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: recipientEmail,
    from: 'notifications@workdoc360.com',
    subject,
    text: `Daily Toolbox Talk Required - ${companyName}\n\nHello ${recipientName},\n\nA toolbox talk hasn't been recorded yet for today. Please conduct and record the daily safety briefing as soon as possible.\n\nStay safe!\nWorkDoc360 Compliance Team`,
    html
  });
}

export async function sendRiskAssessmentDueReminder(
  recipientEmail: string,
  recipientName: string,
  assessmentTitle: string,
  dueDate: string,
  companyName: string
): Promise<boolean> {
  const subject = `Risk Assessment Review Due - ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #f59e0b;">Risk Assessment Review Required</h2>
        <p>Hello ${recipientName},</p>
        
        <p>A risk assessment is due for review to keep your site compliant:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <strong>Assessment:</strong> ${assessmentTitle}<br>
          <strong>Review Due:</strong> ${dueDate}<br>
          <strong>Company:</strong> ${companyName}
        </div>
        
        <p>Regular risk assessment reviews are crucial for:</p>
        <ul>
          <li>Maintaining CDM 2015 compliance</li>
          <li>Ensuring current hazards are identified</li>
          <li>Keeping control measures up to date</li>
          <li>Meeting insurance requirements</li>
        </ul>
        
        <p>Please review and update this risk assessment promptly to maintain compliance.</p>
        
        <p>Cheers,<br>
        WorkDoc360 Compliance Team</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: recipientEmail,
    from: 'notifications@workdoc360.com',
    subject,
    text: `Risk Assessment Review Due - ${companyName}\n\nHello ${recipientName},\n\nRisk Assessment: ${assessmentTitle}\nReview Due: ${dueDate}\n\nPlease review and update this assessment to maintain compliance.\n\nCheers,\nWorkDoc360 Compliance Team`,
    html
  });
}