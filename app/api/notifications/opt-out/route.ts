// Customer notification opt-out API (CAN-SPAM compliance)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';

// POST - Opt-out customer from notifications
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { customerId, optOutEmail, optOutSms } = body;

    // Input validation
    if (!customerId || typeof customerId !== 'string') {
      return NextResponse.json(
        { error: 'Valid customerId is required' },
        { status: 400 }
      );
    }

    // Validate boolean values
    if (optOutEmail !== undefined && typeof optOutEmail !== 'boolean') {
      return NextResponse.json(
        { error: 'optOutEmail must be a boolean' },
        { status: 400 }
      );
    }

    if (optOutSms !== undefined && typeof optOutSms !== 'boolean') {
      return NextResponse.json(
        { error: 'optOutSms must be a boolean' },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Upsert opt-out record
    const optOut = await prisma.customerNotificationOptOut.upsert({
      where: { customerId },
      update: {
        ...(optOutEmail !== undefined && { optOutEmail }),
        ...(optOutSms !== undefined && { optOutSms }),
        optOutDate: new Date(),
      },
      create: {
        customerId,
        optOutEmail: optOutEmail ?? false,
        optOutSms: optOutSms ?? false,
      },
    });

    console.log(`Customer ${customerId} updated opt-out preferences:`, {
      optOutEmail: optOut.optOutEmail,
      optOutSms: optOut.optOutSms,
    });

    return NextResponse.json({
      success: true,
      message: 'Opt-out preferences updated successfully',
      optOut: {
        optOutEmail: optOut.optOutEmail,
        optOutSms: optOut.optOutSms,
      },
    });
  } catch (error) {
    console.error('Error updating opt-out preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update opt-out preferences' },
      { status: 500 }
    );
  }
}

// GET - Get customer's opt-out status (requires customerId query param)
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

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId query parameter is required' },
        { status: 400 }
      );
    }

    // Get opt-out record
    const optOut = await prisma.customerNotificationOptOut.findUnique({
      where: { customerId },
    });

    return NextResponse.json({
      optOutEmail: optOut?.optOutEmail ?? false,
      optOutSms: optOut?.optOutSms ?? false,
      optOutDate: optOut?.optOutDate ?? null,
    });
  } catch (error) {
    console.error('Error fetching opt-out status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opt-out status' },
      { status: 500 }
    );
  }
}
