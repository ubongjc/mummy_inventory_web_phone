import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { apiRateLimiter, getClientIp, applyRateLimit } from '@/app/lib/ratelimit';
import { sanitizeString } from '@/app/lib/security';
import { sendEmail } from '@/app/lib/email';
import { z } from 'zod';

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .min(3, 'Email must be at least 3 characters')
    .max(254, 'Email must be less than 254 characters')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  // Honeypot field to catch bots
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 3 contact form submissions per hour per IP
    const clientIp = getClientIp(request);
    const rateLimitResult = await applyRateLimit(apiRateLimiter, `contact:${clientIp}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many contact form submissions. Please try again in an hour.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '3',
            'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
            'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
          },
        }
      );
    }

    const body = await request.json();

    // Check honeypot field - if filled, it's likely a bot
    if (body.website) {
      console.log('[SECURITY] Honeypot triggered for contact form');
      // Return success to not alert the bot, but don't actually process
      return NextResponse.json(
        {
          success: true,
          message: "Your message has been received. We'll contact you soon!",
        },
        { status: 200 }
      );
    }

    // Validate input
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        { error: firstError.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = validationResult.data;

    // Sanitize inputs to prevent XSS
    const sanitizedData = {
      name: sanitizeString(name),
      email: sanitizeString(email.toLowerCase().trim()),
      phone: phone ? sanitizeString(phone) : '',
      subject: sanitizeString(subject),
      message: sanitizeString(message),
    };

    // Additional email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // Send email notification to support team
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@verysimpleinventory.com';

    try {
      // Only send email if Resend is configured
      if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM_ADDRESS) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #555; }
                .value { margin-top: 5px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>📧 New Contact Form Submission</h2>
                </div>

                <div class="field">
                  <div class="label">From:</div>
                  <div class="value">${sanitizedData.name}</div>
                </div>

                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${sanitizedData.email}</div>
                </div>

                ${
                  sanitizedData.phone
                    ? `<div class="field">
                  <div class="label">Phone:</div>
                  <div class="value">${sanitizedData.phone}</div>
                </div>`
                    : ''
                }

                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${sanitizedData.subject}</div>
                </div>

                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${sanitizedData.message.replace(/\n/g, '<br>')}</div>
                </div>

                <div class="footer">
                  <p>Submitted at: ${new Date().toLocaleString()}</p>
                  <p>Reply to: ${sanitizedData.email}</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const emailText = `
New Contact Form Submission

From: ${sanitizedData.name}
Email: ${sanitizedData.email}
${sanitizedData.phone ? `Phone: ${sanitizedData.phone}` : ''}
Subject: ${sanitizedData.subject}

Message:
${sanitizedData.message}

---
Submitted at: ${new Date().toLocaleString()}
Reply to: ${sanitizedData.email}
        `;

        await sendEmail({
          to: supportEmail,
          subject: `Contact Form: ${sanitizedData.subject}`,
          html: emailHtml,
          text: emailText,
        });

        console.log('[CONTACT] Email sent successfully to support team');
      } else {
        // Log to console if email is not configured
        console.log('[CONTACT] Email not configured. Contact form submission:', {
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          subject: sanitizedData.subject,
          message: sanitizedData.message,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (emailError) {
      // Log email error but still return success to user
      console.error('[CONTACT] Failed to send email notification:', emailError);
      // We don't want to fail the request just because email failed
      // The support team should monitor logs
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Thank you for contacting us! We'll respond within 24 hours.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CONTACT] Form processing error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
