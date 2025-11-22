// Notification settings API - Premium feature

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';

// GET - Fetch user's notification preferences
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for premium subscription (optional for now, can be enforced later)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // Get or create notification preferences
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: user.id },
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      preferences,
      isPremium: subscription?.plan !== 'free',
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT - Update notification preferences
export async function PUT(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();

    // Input validation - ensure boolean values
    const validBooleanFields = [
      'newInquiryEmail',
      'newInquirySms',
      'overduePaymentEmail',
      'overduePaymentSms',
      'lowStockEmail',
      'lowStockSms',
      'upcomingBookingEmail',
      'upcomingBookingSms',
      'bookingConfirmedEmail',
      'bookingConfirmedSms',
      'customerRentalReminderEmail',
      'customerRentalReminderSms',
      'customerReturnReminderEmail',
      'customerReturnReminderSms',
      'customerPaymentReminderEmail',
      'customerPaymentReminderSms',
    ];

    // Validate that only expected fields are being updated
    const updateData: any = {};
    for (const field of validBooleanFields) {
      if (field in body) {
        if (typeof body[field] !== 'boolean') {
          return NextResponse.json(
            { error: `Invalid value for ${field}. Must be boolean.` },
            { status: 400 }
          );
        }
        updateData[field] = body[field];
      }
    }

    // Validate reminderHoursBefore (must be positive integer, max 168 hours = 7 days)
    if ('reminderHoursBefore' in body) {
      const hours = parseInt(body.reminderHoursBefore, 10);
      if (isNaN(hours) || hours < 1 || hours > 168) {
        return NextResponse.json(
          { error: 'reminderHoursBefore must be between 1 and 168 hours' },
          { status: 400 }
        );
      }
      updateData.reminderHoursBefore = hours;
    }

    // Validate smsProviderPhone (E.164 format)
    if ('smsProviderPhone' in body) {
      const phone = body.smsProviderPhone;
      if (phone !== null && phone !== '') {
        // Basic E.164 validation: starts with +, followed by 1-15 digits
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        if (!e164Regex.test(phone)) {
          return NextResponse.json(
            { error: 'Invalid phone number format. Must be E.164 format (e.g., +2348012345678)' },
            { status: 400 }
          );
        }
        updateData.smsProviderPhone = phone;
      } else {
        updateData.smsProviderPhone = null;
      }
    }

    // Upsert notification preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData,
      },
    });

    console.log(`Notification preferences updated for user ${user.id}`);

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
