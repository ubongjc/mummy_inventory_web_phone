// Priority support contact API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';
import { NotificationService } from '@/app/lib/notifications';

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@verysimpleinventory.com';
const SUPPORT_WHATSAPP = process.env.SUPPORT_WHATSAPP || '+1234567890'; // Configure in .env

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, plan: true, email: true, businessName: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine support level based on plan
    const supportLevel = user.plan === 'free' ? 'standard' : 'priority';

    const supportInfo = {
      level: supportLevel,
      email: SUPPORT_EMAIL,
      whatsapp: user.plan !== 'free' ? SUPPORT_WHATSAPP : null,
      responseTime: {
        free: '24-48 hours',
        pro: '4-8 hours',
        business: '1-2 hours',
      }[user.plan] || '24-48 hours',
      channels: {
        email: {
          available: true,
          address: SUPPORT_EMAIL,
          description: 'Send us an email and we\'ll get back to you soon',
        },
        whatsapp: {
          available: user.plan !== 'free',
          number: user.plan !== 'free' ? SUPPORT_WHATSAPP : null,
          description: user.plan !== 'free'
            ? 'Get instant support via WhatsApp (Premium feature)'
            : 'Upgrade to Pro or Business plan for WhatsApp support',
        },
        phone: {
          available: user.plan === 'business',
          number: user.plan === 'business' ? SUPPORT_WHATSAPP : null,
          description: user.plan === 'business'
            ? 'Priority phone support (Business plan)'
            : 'Upgrade to Business plan for phone support',
        },
      },
      features: {
        free: [
          'Email support',
          'Knowledge base access',
          'Community forum',
        ],
        pro: [
          'Priority email support',
          'WhatsApp support',
          'Video tutorials',
          'Priority bug fixes',
        ],
        business: [
          'Priority email support',
          'WhatsApp support',
          'Phone support',
          'Dedicated account manager',
          'Custom training',
          'API support',
        ],
      }[user.plan] || [],
    };

    return NextResponse.json(supportInfo);
  } catch (error) {
    console.error('Error fetching support info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support info' },
      { status: 500 }
    );
  }
}

// POST - Submit support request
export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        plan: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { subject, message, category, priority } = body;

    // Validation
    if (!subject || subject.trim().length < 3) {
      return NextResponse.json(
        { error: 'Subject is required (minimum 3 characters)' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message is required (minimum 10 characters)' },
        { status: 400 }
      );
    }

    // Save support request to database (optional - you can create a SupportTicket model)
    // For now, we'll just send an email to support

    const supportLevel = user.plan === 'free' ? 'STANDARD' : 'PRIORITY';
    const userName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.businessName || user.email;

    // Send support request email
    const emailSubject = `[${supportLevel}] ${subject}`;
    const emailBody = `
Support Request from ${userName}

User Email: ${user.email}
Plan: ${user.plan.toUpperCase()}
Business: ${user.businessName || 'N/A'}
Category: ${category || 'General'}
Priority: ${priority || 'Normal'}

---

${message}

---

User ID: ${user.id}
Submitted: ${new Date().toISOString()}
    `.trim();

    try {
      await NotificationService.sendEmail(
        SUPPORT_EMAIL,
        emailSubject,
        emailBody,
        `<pre>${emailBody.replace(/\n/g, '<br>')}</pre>`
      );

      // Send confirmation to user
      const confirmationSubject = `Support Request Received - ${subject}`;
      const confirmationBody = `
Hi ${userName},

Thank you for contacting VerySimple Inventory Support!

We've received your support request:
Subject: ${subject}
Priority: ${supportLevel}

Our team will review your request and respond within:
${
  user.plan === 'business'
    ? '1-2 hours'
    : user.plan === 'pro'
    ? '4-8 hours'
    : '24-48 hours'
}

If you need immediate assistance:
${user.plan !== 'free' ? `- WhatsApp: ${SUPPORT_WHATSAPP}\n` : ''}${
        user.plan === 'business' ? `- Phone: ${SUPPORT_WHATSAPP}\n` : ''
      }
Thank you for your patience!

Best regards,
VerySimple Inventory Support Team
      `.trim();

      await NotificationService.sendEmail(
        user.email,
        confirmationSubject,
        confirmationBody,
        `<pre>${confirmationBody.replace(/\n/g, '<br>')}</pre>`
      );
    } catch (emailError) {
      console.error('Failed to send support email:', emailError);
      return NextResponse.json(
        {
          error: 'Failed to send support request. Please try again or email us directly at ' + SUPPORT_EMAIL,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Support request submitted successfully',
      ticketId: `TICKET-${user.id.substring(0, 8)}-${Date.now()}`,
      estimatedResponseTime:
        user.plan === 'business'
          ? '1-2 hours'
          : user.plan === 'pro'
          ? '4-8 hours'
          : '24-48 hours',
    });
  } catch (error) {
    console.error('Error submitting support request:', error);
    return NextResponse.json(
      { error: 'Failed to submit support request' },
      { status: 500 }
    );
  }
}
