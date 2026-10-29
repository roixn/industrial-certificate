import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = null;

function getTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  if (!transporter) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = port === 465;

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  return transporter;
}

/**
 * Send 6-Digit OTP Email to User
 * @param {{ to: string, name: string, otp: string }} options
 * @returns {Promise<{ sent: boolean, error?: string }>}
 */
export async function sendOtpEmail({ to, name, otp }) {
  const mailer = getTransporter();

  if (!mailer) {
    console.log('\n======================================================');
    console.log('[EMAIL NOTICE] SMTP credentials not yet provided in backend/.env');
    console.log(`To receive real emails on Gmail, set in backend/.env:`);
    console.log(`  SMTP_USER=your_gmail_address@gmail.com`);
    console.log(`  SMTP_PASS=your_google_app_password`);
    console.log(`Generated OTP for ${to}: ${otp}`);
    console.log('======================================================\n');
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    const from = process.env.EMAIL_FROM || `"Nexora Certification Authority" <${process.env.SMTP_USER}>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #0f1f38; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; color: #ffffff; }
          .header p { margin: 6px 0 0 0; font-size: 12px; color: #d4b140; text-transform: uppercase; letter-spacing: 1.5px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .greeting { font-size: 16px; font-weight: bold; margin-bottom: 12px; }
          .otp-card { background: #f1f5f9; border: 2px dashed #0f1f38; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f1f38; margin: 0; }
          .otp-expiry { font-size: 11px; color: #64748b; margin-top: 8px; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NEXORA INNOVATIONS</h1>
            <p>Industrial Training Certification Authority</p>
          </div>
          <div class="content">
            <div class="greeting">Hello, ${name || 'Administrator'}!</div>
            <p>You have requested a secure verification code to activate your administrative account on the <strong>Nexora Certificate Management & Verification Registry</strong>.</p>
            
            <div class="otp-card">
              <div class="otp-code">${otp}</div>
              <div class="otp-expiry">This OTP code is valid for exactly 10 minutes.</div>
            </div>

            <p style="font-size: 13px; color: #475569;">Please enter this code into the portal registration screen to complete your account activation and set your permanent password.</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">If you did not request this account registration, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            Nexora Innovations Pvt. Ltd. • Tower B, 4th Floor, Logix Cyber Park, Sector 62, Noida, UP 201309<br>
            Secure Administrative Access System • SHA-256 Tamper-Resistant Security
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await mailer.sendMail({
      from,
      to,
      subject: `Your Nexora Verification Code: ${otp}`,
      text: `Hello ${name || 'Administrator'},\n\nYour 6-digit verification code to activate your Nexora administrator account is: ${otp}\n\nThis code is valid for 10 minutes.\n\nNexora Innovations Pvt. Ltd.`,
      html: htmlContent,
    });

    console.log(`[EMAIL SUCCESS] OTP email successfully sent to ${to} (MessageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    return { sent: false, error: error.message };
  }
}
