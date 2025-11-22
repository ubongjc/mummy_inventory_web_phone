// Notification service for sending emails and SMS

import { prisma } from '@/app/lib/prisma';
import nodemailer from 'nodemailer';

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
  recipient: string; // email or phone number
  subject?: string; // for email
  message: string;
}

/**
 * Main notification service
 */
export class NotificationService {
  /**
   * Send a notification (email or SMS)
   */
  static async send(options: NotificationOptions): Promise<boolean> {
    const { userId, customerId, bookingId, type, channel, recipient, subject, message } = options;

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
        const result = await this.sendEmail(recipient, subject || 'Notification', message);
        success = result.success;
        errorMessage = result.error;
      } else if (channel === 'sms') {
        const result = await this.sendSMS(recipient, message);
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
   * Send email notification
   */
  private static async sendEmail(
    to: string,
    subject: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Configure email transporter (using environment variables)
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
        from: emailUser,
        to,
        subject,
        text: message,
        html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
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
   * Send SMS notification
   */
  private static async sendSMS(
    to: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // SMS provider configuration (Twilio, Africa's Talking, etc.)
      const smsProvider = process.env.SMS_PROVIDER; // 'twilio' | 'africastalking'
      const smsApiKey = process.env.SMS_API_KEY;

      if (!smsProvider || !smsApiKey) {
        console.warn('SMS provider not configured. Skipping SMS send.');
        return { success: false, error: 'SMS not configured' };
      }

      // For now, just log the SMS (implement actual provider integration later)
      console.log(`[SMS] To: ${to}, Message: ${message}`);
      console.log('SMS integration placeholder - implement provider-specific logic');

      // TODO: Implement actual SMS sending with Twilio or Africa's Talking
      // Example for Twilio:
      // const accountSid = process.env.TWILIO_ACCOUNT_SID;
      // const authToken = process.env.TWILIO_AUTH_TOKEN;
      // const client = require('twilio')(accountSid, authToken);
      // await client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: to
      // });

      return { success: true };
    } catch (error) {
      console.error('Error sending SMS:', error);
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
   * Send customer rental reminder
   */
  static async sendRentalReminder(
    userId: string,
    customerId: string,
    bookingId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    startDate: Date,
    items: string[]
  ): Promise<void> {
    // Get user's notification preferences
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) return;

    const message = `Hi ${customerName},\n\nThis is a reminder that your rental starts on ${startDate.toLocaleDateString()}.\n\nItems:\n${items.map((item) => `- ${item}`).join('\n')}\n\nThank you for your business!`;

    // Send email reminder if enabled
    if (preferences.customerRentalReminderEmail && customerEmail) {
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'rental_reminder',
        channel: 'email',
        recipient: customerEmail,
        subject: 'Rental Reminder - Upcoming Rental',
        message,
      });
    }

    // Send SMS reminder if enabled
    if (preferences.customerRentalReminderSms && customerPhone) {
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'rental_reminder',
        channel: 'sms',
        recipient: customerPhone,
        message,
      });
    }
  }

  /**
   * Send customer return reminder
   */
  static async sendReturnReminder(
    userId: string,
    customerId: string,
    bookingId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    endDate: Date,
    items: string[]
  ): Promise<void> {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) return;

    const message = `Hi ${customerName},\n\nThis is a reminder that your rental is due for return on ${endDate.toLocaleDateString()}.\n\nItems to return:\n${items.map((item) => `- ${item}`).join('\n')}\n\nPlease return the items on time. Thank you!`;

    // Send email reminder if enabled
    if (preferences.customerReturnReminderEmail && customerEmail) {
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'return_reminder',
        channel: 'email',
        recipient: customerEmail,
        subject: 'Return Reminder - Rental Due for Return',
        message,
      });
    }

    // Send SMS reminder if enabled
    if (preferences.customerReturnReminderSms && customerPhone) {
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'return_reminder',
        channel: 'sms',
        recipient: customerPhone,
        message,
      });
    }
  }

  /**
   * Send customer payment reminder
   */
  static async sendPaymentReminder(
    userId: string,
    customerId: string,
    bookingId: string,
    customerName: string,
    customerEmail: string | null,
    customerPhone: string | null,
    amountDue: number,
    currency: string
  ): Promise<void> {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) return;

    const message = `Hi ${customerName},\n\nThis is a reminder about your outstanding payment of ${currency}${amountDue.toLocaleString()} for booking #${bookingId.substring(0, 8)}.\n\nPlease make payment at your earliest convenience. Thank you!`;

    // Send email reminder if enabled
    if (preferences.customerPaymentReminderEmail && customerEmail) {
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'payment_reminder',
        channel: 'email',
        recipient: customerEmail,
        subject: 'Payment Reminder - Outstanding Balance',
        message,
      });
    }

    // Send SMS reminder if enabled
    if (preferences.customerPaymentReminderSms && customerPhone) {
      await this.send({
        userId,
        customerId,
        bookingId,
        type: 'payment_reminder',
        channel: 'sms',
        recipient: customerPhone,
        message,
      });
    }
  }
}
