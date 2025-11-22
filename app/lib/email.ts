import { Resend } from 'resend';

// Check for email configuration
if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured. Email features will be disabled.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 * Fails gracefully if email is not configured
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  // If Resend is not configured, log and skip
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] Skipping email send - RESEND_API_KEY not configured:', {
      to,
      subject,
    });
    return { success: false, messageId: null, skipped: true };
  }

  if (!process.env.EMAIL_FROM_ADDRESS) {
    console.error('[EMAIL] EMAIL_FROM_ADDRESS not configured');
    return { success: false, messageId: null, error: 'Email sender not configured' };
  }

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
      return { success: false, messageId: null, error: error.message };
    }

    console.log('[EMAIL] Message sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('[EMAIL] Send error:', error);
    return { success: false, messageId: null, error: error.message || 'Failed to send email' };
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

/**
 * Premium Feature: Send booking reminder (upcoming rental)
 */
export async function sendUpcomingReminderEmail(
  to: string,
  customerName: string,
  bookingReference: string,
  startDate: Date,
  items: string[]
) {
  const formattedDate = startDate.toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemsList = items.map((item) => `<li>${item}</li>`).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Upcoming Rental Reminder</h2>
      <p>Hi ${customerName},</p>
      <p>This is a friendly reminder that your rental is coming up soon!</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
        <p><strong>Start Date:</strong> ${formattedDate}</p>
        <p><strong>Items:</strong></p>
        <ul>${itemsList}</ul>
      </div>
      <p>If you have any questions, please contact us.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Reminder: Your rental starts on ${formattedDate}`,
    html,
  });
}

/**
 * Premium Feature: Send return reminder
 */
export async function sendReturnReminderEmail(
  to: string,
  customerName: string,
  bookingReference: string,
  endDate: Date,
  items: string[]
) {
  const formattedDate = endDate.toLocaleDateString('en-NG');
  const itemsList = items.map((item) => `<li>${item}</li>`).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Return Reminder</h2>
      <p>Hi ${customerName},</p>
      <p>Your rental period has ended. Please return the following items:</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
        <p><strong>End Date:</strong> ${formattedDate}</p>
        <ul>${itemsList}</ul>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Reminder: Please return your rental items`,
    html,
  });
}

/**
 * Premium Feature: Send payment reminder
 */
export async function sendPaymentReminderEmail(
  to: string,
  customerName: string,
  bookingReference: string,
  dueDate: Date,
  amountDue: number
) {
  const formattedDate = dueDate.toLocaleDateString('en-NG');
  const formattedAmount = `₦${amountDue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Payment Reminder</h2>
      <p>Hi ${customerName},</p>
      <p>This is a reminder that you have an outstanding payment due.</p>
      <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
        <p><strong>Due Date:</strong> ${formattedDate}</p>
        <p><strong>Amount Due:</strong> ${formattedAmount}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Payment Reminder: ${formattedAmount} due ${formattedDate}`,
    html,
  });
}

/**
 * Premium Feature: Send payment receipt
 */
export async function sendPaymentReceiptEmail(
  to: string,
  customerName: string,
  bookingReference: string,
  amount: number,
  paymentDate: Date
) {
  const formattedDate = paymentDate.toLocaleDateString('en-NG');
  const formattedAmount = `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Payment Receipt</h2>
      <p>Hi ${customerName},</p>
      <p>Thank you for your payment! Here are the details:</p>
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
        <p><strong>Amount Paid:</strong> ${formattedAmount}</p>
        <p><strong>Payment Date:</strong> ${formattedDate}</p>
      </div>
      <p>This email serves as your receipt.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Payment Receipt - ${formattedAmount}`,
    html,
  });
}

/**
 * Premium Feature: Send inquiry notification to owner
 */
export async function sendInquiryNotificationEmail(
  to: string,
  ownerName: string,
  inquiryDetails: {
    name: string;
    email: string;
    phone: string;
    message: string;
    startDate: Date;
    endDate: Date;
  }
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Rental Inquiry</h2>
      <p>Hi ${ownerName},</p>
      <p>You have received a new inquiry from your public booking page!</p>
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Customer Name:</strong> ${inquiryDetails.name}</p>
        <p><strong>Email:</strong> ${inquiryDetails.email}</p>
        <p><strong>Phone:</strong> ${inquiryDetails.phone}</p>
        <p><strong>Rental Period:</strong> ${inquiryDetails.startDate.toLocaleDateString('en-NG')} to ${inquiryDetails.endDate.toLocaleDateString('en-NG')}</p>
        ${inquiryDetails.message ? `<p><strong>Message:</strong><br/>${inquiryDetails.message}</p>` : ''}
      </div>
      <p>Log in to your dashboard to respond and create a booking.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `New Rental Inquiry from ${inquiryDetails.name}`,
    html,
  });
}
