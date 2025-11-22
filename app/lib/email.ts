import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'VerySimple Inventory'} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('[EMAIL] Send error:', error);
      throw new Error('Failed to send email');
    }

    console.log('[EMAIL] Message sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[EMAIL] Send error:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send email verification email
 */
export async function sendEmailVerification(email: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
            font-weight: bold;
          }
          h1 {
            color: #1f2937;
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          p {
            color: #4b5563;
            margin: 0 0 20px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: linear-gradient(135deg, #5568d3 0%, #653a8a 100%);
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .info {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info p {
            margin: 0;
            color: #1e40af;
            font-size: 14px;
          }
          .link-backup {
            background: #f3f4f6;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">VSI</div>
            <h1>Verify Your Email</h1>
            <p>Welcome to VerySimple Inventory!</p>
          </div>

          <p>Hello,</p>

          <p>Thank you for signing up! To get started with VerySimple Inventory, please verify your email address by clicking the button below:</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>

          <div class="info">
            <p><strong>This link never expires</strong> - you can verify your email at any time.</p>
          </div>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <div class="link-backup">
            ${verificationUrl}
          </div>

          <p>Once verified, you'll have full access to all features including inventory management, booking tracking, and customer management.</p>

          <p>If you didn't create an account, you can safely ignore this email.</p>

          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} VerySimple Inventory. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Verify Your Email

Hello,

Thank you for signing up for VerySimple Inventory! To get started, please verify your email address by clicking the link below:

${verificationUrl}

This link never expires - you can verify your email at any time.

Once verified, you'll have full access to all features including inventory management, booking tracking, and customer management.

If you didn't create an account, you can safely ignore this email.

This is an automated email, please do not reply.
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - VerySimple Inventory',
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
            font-weight: bold;
          }
          h1 {
            color: #1f2937;
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          p {
            color: #4b5563;
            margin: 0 0 20px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: linear-gradient(135deg, #5568d3 0%, #653a8a 100%);
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
          }
          .link-backup {
            background: #f3f4f6;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">VSI</div>
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password</p>
          </div>

          <p>Hello,</p>

          <p>You recently requested to reset your password for your VerySimple Inventory account. Click the button below to reset it:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <div class="warning">
            <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
          </div>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <div class="link-backup">
            ${resetUrl}
          </div>

          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} VerySimple Inventory. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Reset Your Password

Hello,

You recently requested to reset your password for your VerySimple Inventory account.

Click this link to reset it (expires in 1 hour):
${resetUrl}

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

This is an automated email, please do not reply.
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - VerySimple Inventory',
    html,
    text,
  });
}
