// Enhanced notification service with email templates and SMS providers

import { prisma } from '@/app/lib/prisma';
import nodemailer from 'nodemailer';
import {
  rentalReminderTemplate,
  returnReminderTemplate,
  paymentReminderTemplate,
  bookingConfirmationTemplate,
  newInquiryTemplate,
  rentalRequestApprovalTemplate,
  rentalRequestDenialTemplate,
  paymentConfirmedTemplate,
  teamInvitationTemplate,
  EmailTemplateData,
} from './email-templates';

export type NotificationType =
  | 'new_inquiry'
  | 'overdue_payment'
  | 'low_stock'
  | 'upcoming_booking'
  | 'booking_confirmed'
  | 'rental_reminder'
  | 'return_reminder'
  | 'payment_reminder';

export type NotificationChannel = 'email' | 'sms';

interface NotificationOptions {
  userId: string;
  customerId?: string;
  bookingId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  message?: string;
  html?: string;
}

/**
 * Main notification service with email templates and SMS provider integration
 */
export class NotificationService {
  /**
   * Send a notification (email or SMS)
   */
  static async send(options: NotificationOptions): Promise<boolean> {
    const { userId, customerId, bookingId, type, channel, recipient, subject, message, html } = options;

    try {
      // Check if customer has opted out
      if (customerId) {
        const optOut = await prisma.customerNotificationOptOut.findUnique({
          where: { customerId },
        });

        if (optOut) {
          if (channel === 'email' && optOut.optOutEmail) {
            console.log(`Customer ${customerId} has opted out of email notifications`);
            await this.logNotification(userId, customerId, bookingId, type, channel, recipient, 'skipped', 'Customer opted out');
            return false;
          }
          if (channel === 'sms' && optOut.optOutSms) {
            console.log(`Customer ${customerId} has opted out of SMS notifications`);
            await this.logNotification(userId, customerId, bookingId, type, channel, recipient, 'skipped', 'Customer opted out');
            return false;
          }
        }
      }

      // Send based on channel
      let success = false;
      let errorMessage: string | undefined;

      if (channel === 'email') {
        const result = await this.sendEmail(recipient, subject || 'Notification', message || '', html);
        success = result.success;
        errorMessage = result.error;
      } else if (channel === 'sms') {
        const result = await this.sendSMS(recipient, message || '');
        success = result.success;
        errorMessage = result.error;
      }

      // Log notification
      await this.logNotification(
        userId,
        customerId,
        bookingId,
        type,
        channel,
        recipient,
        success ? 'sent' : 'failed',
        errorMessage
      );

      return success;
    } catch (error) {
      console.error('Error sending notification:', error);
      await this.logNotification(
        userId,
        customerId,
        bookingId,
        type,
        channel,
        recipient,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  /**
   * Send email with professional templates
   */
  private static async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check for SendGrid API key (preferred)
      const sendGridApiKey = process.env.SENDGRID_API_KEY;
      if (sendGridApiKey) {
        return await this.sendEmailViaSendGrid(to, subject, text, html || `<p>${text.replace(/\n/g, '<br>')}</p>`);
      }

      // Fallback to SMTP (Gmail, etc.)
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);

      if (!emailUser || !emailPass) {
        console.warn('Email credentials not configured. Skipping email send.');
        return { success: false, error: 'Email not configured' };
      }

      const transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Very Simple Inventory'}" <${emailUser}>`,
        to,
        subject,
        text,
        html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
      });

      console.log(`Email sent successfully to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email via SendGrid API
   */
  private static async sendEmailViaSendGrid(
    to: string,
    subject: string,
    text: string,
    html: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const sendGridApiKey = process.env.SENDGRID_API_KEY;
      const fromEmail = process.env.EMAIL_USER || 'noreply@verysimpleinventory.com';
      const fromName = process.env.EMAIL_FROM_NAME || 'Very Simple Inventory';

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject,
            },
          ],
          from: {
            email: fromEmail,
            name: fromName,
          },
          content: [
            {
              type: 'text/plain',
              value: text,
            },
            {
              type: 'text/html',
              value: html,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SendGrid error:', errorText);
        return { success: false, error: `SendGrid error: ${response.status}` };
      }

      console.log(`Email sent via SendGrid to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send SMS with Twilio or Africa's Talking
   */
  private static async sendSMS(
    to: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const smsProvider = process.env.SMS_PROVIDER?.toLowerCase(); // 'twilio' | 'africastalking'

      if (!smsProvider) {
        console.warn('SMS provider not configured. Skipping SMS send.');
        return { success: false, error: 'SMS not configured' };
      }

      if (smsProvider === 'twilio') {
        return await this.sendSMSViaTwilio(to, message);
      } else if (smsProvider === 'africastalking') {
        return await this.sendSMSViaAfricasTalking(to, message);
      } else {
        return { success: false, error: `Unknown SMS provider: ${smsProvider}` };
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send SMS via Twilio
   */
  private static async sendSMSViaTwilio(
    to: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromPhone = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromPhone) {
        return { success: false, error: 'Twilio credentials not configured' };
      }

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: to,
            From: fromPhone,
            Body: message,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Twilio error:', errorData);
        return { success: false, error: errorData.message || `Twilio error: ${response.status}` };
      }

      console.log(`SMS sent via Twilio to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send SMS via Africa's Talking
   */
  private static async sendSMSViaAfricasTalking(
    to: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const apiKey = process.env.AFRICASTALKING_API_KEY;
      const username = process.env.AFRICASTALKING_USERNAME;
      const from = process.env.AFRICASTALKING_FROM; // Optional sender ID

      if (!apiKey || !username) {
        return { success: false, error: "Africa's Talking credentials not configured" };
      }

      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'apiKey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          username,
          to,
          message,
          ...(from && { from }),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.SMSMessageData?.Recipients[0]?.status !== 'Success') {
        console.error("Africa's Talking error:", data);
        return { success: false, error: data.SMSMessageData?.Message || 'SMS send failed' };
      }

      console.log(`SMS sent via Africa's Talking to ${to}`);
      return { success: true };
    } catch (error) {
      console.error("Error sending SMS via Africa's Talking:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Log notification to database
   */
  private static async logNotification(
    userId: string,
    customerId: string | undefined,
    bookingId: string | undefined,
    notificationType: string,
    channel: string,
    recipient: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      await prisma.notificationLog.create({
        data: {
          userId,
          customerId,
          bookingId,
          notificationType,
          channel,
          recipient,
          status,
          errorMessage,
        },
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Get business details for templates
   */
  private static async getBusinessDetails(userId: string): Promise<{
    businessName: string;
    businessEmail?: string;
    businessPhone?: string;
    currency: string;
  }> {
    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessName: true, email: true },
    });

    return {
      businessName: user?.businessName || settings?.businessName || 'Very Simple Inventory',
      businessEmail: settings?.businessEmail || user?.email,
      businessPhone: settings?.businessPhone || undefined,
      currency: settings?.currencySymbol || '$',
    };
  }

  /**
   * Send customer rental reminder with professional template
   */
  static async sendRentalReminder(
    userId: string,
    customerId: string,
    bookingId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    startDate: Date,
    endDate: Date,
    items: string[],
    bookingReference?: string
  ): Promise<void> {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) return;

    const business = await this.getBusinessDetails(userId);

    const templateData: EmailTemplateData = {
      businessName: business.businessName,
      businessEmail: business.businessEmail,
      businessPhone: business.businessPhone,
      customerName,
      customerEmail: customerEmail || '',
      bookingReference,
      startDate: startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      items,
      optOutUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/opt-out?customerId=${customerId}&optOutEmail=true`,
    };

    // Send email reminder if enabled
    if (preferences.customerRentalReminderEmail && customerEmail) {
      const emailContent = rentalReminderTemplate(templateData);
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'rental_reminder',
        channel: 'email',
        recipient: customerEmail,
        subject: emailContent.subject,
        message: emailContent.text,
        html: emailContent.html,
      });
    }

    // Send SMS reminder if enabled
    if (preferences.customerRentalReminderSms && customerPhone) {
      const smsMessage = `Hi ${customerName}! Reminder: Your rental starts ${startDate.toLocaleDateString()}. Items: ${items.join(', ')}. - ${business.businessName}`;
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'rental_reminder',
        channel: 'sms',
        recipient: customerPhone,
        message: smsMessage,
      });
    }
  }

  /**
   * Send customer return reminder with professional template
   */
  static async sendReturnReminder(
    userId: string,
    customerId: string,
    bookingId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    endDate: Date,
    items: string[],
    bookingReference?: string
  ): Promise<void> {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) return;

    const business = await this.getBusinessDetails(userId);

    const templateData: EmailTemplateData = {
      businessName: business.businessName,
      businessEmail: business.businessEmail,
      businessPhone: business.businessPhone,
      customerName,
      customerEmail: customerEmail || '',
      bookingReference,
      endDate: endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      items,
      optOutUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/opt-out?customerId=${customerId}&optOutEmail=true`,
    };

    // Send email reminder if enabled
    if (preferences.customerReturnReminderEmail && customerEmail) {
      const emailContent = returnReminderTemplate(templateData);
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'return_reminder',
        channel: 'email',
        recipient: customerEmail,
        subject: emailContent.subject,
        message: emailContent.text,
        html: emailContent.html,
      });
    }

    // Send SMS reminder if enabled
    if (preferences.customerReturnReminderSms && customerPhone) {
      const smsMessage = `Hi ${customerName}! Reminder: Your rental is due for return on ${endDate.toLocaleDateString()}. Please return: ${items.join(', ')}. - ${business.businessName}`;
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'return_reminder',
        channel: 'sms',
        recipient: customerPhone,
        message: smsMessage,
      });
    }
  }

  /**
   * Send customer payment reminder with professional template
   */
  static async sendPaymentReminder(
    userId: string,
    customerId: string,
    bookingId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    amountDue: number,
    items: string[],
    bookingReference?: string
  ): Promise<void> {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) return;

    const business = await this.getBusinessDetails(userId);

    const templateData: EmailTemplateData = {
      businessName: business.businessName,
      businessEmail: business.businessEmail,
      businessPhone: business.businessPhone,
      customerName,
      customerEmail: customerEmail || '',
      bookingReference,
      amountDue: amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      currency: business.currency,
      items,
      optOutUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/opt-out?customerId=${customerId}&optOutEmail=true`,
    };

    // Send email reminder if enabled
    if (preferences.customerPaymentReminderEmail && customerEmail) {
      const emailContent = paymentReminderTemplate(templateData);
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'payment_reminder',
        channel: 'email',
        recipient: customerEmail,
        subject: emailContent.subject,
        message: emailContent.text,
        html: emailContent.html,
      });
    }

    // Send SMS reminder if enabled
    if (preferences.customerPaymentReminderSms && customerPhone) {
      const smsMessage = `Hi ${customerName}! Payment reminder: ${business.currency}${amountDue.toLocaleString()} due for booking ${bookingReference || bookingId.substring(0, 8)}. - ${business.businessName}`;
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'payment_reminder',
        channel: 'sms',
        recipient: customerPhone,
        message: smsMessage,
      });
    }
  }

  /**
   * Send booking confirmation with professional template
   */
  static async sendBookingConfirmation(
    userId: string,
    customerId: string,
    bookingId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    startDate: Date,
    endDate: Date,
    items: string[],
    totalAmount?: number,
    bookingReference?: string
  ): Promise<void> {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) return;

    const business = await this.getBusinessDetails(userId);

    const templateData: EmailTemplateData = {
      businessName: business.businessName,
      businessEmail: business.businessEmail,
      businessPhone: business.businessPhone,
      customerName,
      customerEmail: customerEmail || '',
      bookingReference,
      startDate: startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      items,
      amountDue: totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      currency: business.currency,
      optOutUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/opt-out?customerId=${customerId}&optOutEmail=true`,
    };

    // Send email confirmation if enabled
    if (preferences.bookingConfirmedEmail && customerEmail) {
      const emailContent = bookingConfirmationTemplate(templateData);
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'booking_confirmed',
        channel: 'email',
        recipient: customerEmail,
        subject: emailContent.subject,
        message: emailContent.text,
        html: emailContent.html,
      });
    }

    // Send SMS confirmation if enabled
    if (preferences.bookingConfirmedSms && customerPhone) {
      const smsMessage = `Hi ${customerName}! Your booking is confirmed. Ref: ${bookingReference || bookingId.substring(0, 8)}. ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}. - ${business.businessName}`;
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'booking_confirmed',
        channel: 'sms',
        recipient: customerPhone,
        message: smsMessage,
      });
    }
  }

  /**
   * Send new inquiry notification to business owner
   */
  static async sendNewInquiry(
    userId: string,
    inquiryId: string,
    inquirerName: string,
    inquirerEmail: string | null,
    inquirerPhone: string | null,
    startDate: Date,
    endDate: Date,
    inquiryMessage: string | null
  ): Promise<void> {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) return;

    const business = await this.getBusinessDetails(userId);

    const templateData: EmailTemplateData & { inquiryMessage?: string } = {
      businessName: business.businessName,
      businessEmail: business.businessEmail,
      businessPhone: business.businessPhone,
      customerName: inquirerName,
      customerEmail: inquirerEmail || '',
      startDate: startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      inquiryMessage: inquiryMessage || '',
    };

    // Send email notification to business owner if enabled
    if (preferences.newInquiryEmail && business.businessEmail) {
      const emailContent = newInquiryTemplate(templateData);
      await this.send({
        userId,
        type: 'new_inquiry',
        channel: 'email',
        recipient: business.businessEmail,
        subject: emailContent.subject,
        message: emailContent.text,
        html: emailContent.html,
      });
    }

    // Send SMS notification to business owner if enabled
    if (preferences.newInquirySms && business.businessPhone) {
      const contactInfo = inquirerPhone || inquirerEmail || 'No contact provided';
      const smsMessage = `New rental inquiry from ${inquirerName}! ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}. Contact: ${contactInfo}. Check your dashboard for details.`;
      await this.send({
        userId,
        type: 'new_inquiry',
        channel: 'sms',
        recipient: business.businessPhone,
        message: smsMessage,
      });
    }
  }

  /**
   * Send rental request approval notification to customer
   */
  static async sendRentalRequestApproval(
    userId: string,
    inquiryId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    startDate: Date,
    endDate: Date,
    items: string[],
    totalAmount?: number,
    paymentLinkUrl?: string
  ): Promise<void> {
    const business = await this.getBusinessDetails(userId);

    const templateData: EmailTemplateData & { paymentLinkUrl?: string } = {
      businessName: business.businessName,
      businessEmail: business.businessEmail,
      businessPhone: business.businessPhone,
      customerName,
      customerEmail: customerEmail || '',
      bookingReference: inquiryId.substring(0, 8).toUpperCase(),
      startDate: startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      items,
      amountDue: totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      currency: business.currency,
      paymentLinkUrl,
    };

    // Send email notification if customer has email
    if (customerEmail) {
      const emailContent = rentalRequestApprovalTemplate(templateData);
      await this.send({
        userId,
        type: 'booking_confirmed',
        channel: 'email',
        recipient: customerEmail,
        subject: emailContent.subject,
        message: emailContent.text,
        html: emailContent.html,
      });
    }

    // Send SMS notification if customer has phone
    if (customerPhone) {
      const smsMessage = `Good news! Your rental request has been approved by ${business.businessName}. ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}. ${paymentLinkUrl ? `Pay here: ${paymentLinkUrl}` : 'We will contact you shortly.'}`;
      await this.send({
        userId,
        type: 'booking_confirmed',
        channel: 'sms',
        recipient: customerPhone,
        message: smsMessage,
      });
    }
  }

  /**
   * Send rental request denial notification to customer
   */
  static async sendRentalRequestDenial(
    userId: string,
    inquiryId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    startDate: Date,
    endDate: Date,
    denialReason?: string
  ): Promise<void> {
    const business = await this.getBusinessDetails(userId);

    const templateData: EmailTemplateData & { denialReason?: string } = {
      businessName: business.businessName,
      businessEmail: business.businessEmail,
      businessPhone: business.businessPhone,
      customerName,
      customerEmail: customerEmail || '',
      bookingReference: inquiryId.substring(0, 8).toUpperCase(),
      startDate: startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      denialReason,
    };

    // Send email notification if customer has email
    if (customerEmail) {
      const emailContent = rentalRequestDenialTemplate(templateData);
      await this.send({
        userId,
        type: 'booking_confirmed',
        channel: 'email',
        recipient: customerEmail,
        subject: emailContent.subject,
        message: emailContent.text,
        html: emailContent.html,
      });
    }

    // Send SMS notification if customer has phone
    if (customerPhone) {
      const defaultReason = 'Your booking request could not be fulfilled at this time.';
      const smsMessage = `Update from ${business.businessName}: ${denialReason || defaultReason} Please contact us if you have questions.`;
      await this.send({
        userId,
        type: 'booking_confirmed',
        channel: 'sms',
        recipient: customerPhone,
        message: smsMessage,
      });
    }
  }

  /**
   * Send payment confirmation notification to customer
   */
  static async sendPaymentConfirmed(
    userId: string,
    inquiryId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    startDate: Date,
    endDate: Date,
    items: string[],
    totalAmount?: number
  ): Promise<void> {
    const business = await this.getBusinessDetails(userId);

    const templateData: EmailTemplateData = {
      businessName: business.businessName,
      businessEmail: business.businessEmail,
      businessPhone: business.businessPhone,
      customerName,
      customerEmail: customerEmail || '',
      bookingReference: inquiryId.substring(0, 8).toUpperCase(),
      startDate: startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      items,
      amountDue: totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      currency: business.currency,
    };

    // Send email notification if customer has email
    if (customerEmail) {
      const emailContent = paymentConfirmedTemplate(templateData);
      await this.send({
        userId,
        type: 'booking_confirmed',
        channel: 'email',
        recipient: customerEmail,
        subject: emailContent.subject,
        message: emailContent.text,
        html: emailContent.html,
      });
    }

    // Send SMS notification if customer has phone
    if (customerPhone) {
      const smsMessage = `Payment confirmed! Your booking with ${business.businessName} is fully confirmed. Ref: ${inquiryId.substring(0, 8).toUpperCase()}. ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}.`;
      await this.send({
        userId,
        type: 'booking_confirmed',
        channel: 'sms',
        recipient: customerPhone,
        message: smsMessage,
      });
    }
  }

  /**
   * Send team invitation email
   */
  static async sendTeamInvitation(
    inviterName: string,
    businessName: string,
    inviteeEmail: string,
    role: string,
    invitationUrl: string
  ): Promise<boolean> {
    const templateData = {
      businessName,
      businessEmail: undefined,
      businessPhone: undefined,
      customerName: '',
      customerEmail: inviteeEmail,
      inviterName,
      role,
      invitationUrl,
    };

    const emailContent = teamInvitationTemplate(templateData);

    try {
      const result = await this.sendEmail(
        inviteeEmail,
        emailContent.subject,
        emailContent.text,
        emailContent.html
      );
      return result.success;
    } catch (error) {
      console.error('Error sending team invitation:', error);
      return false;
    }
  }
}
