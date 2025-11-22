// Public page viewing and inquiry submission

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';
import { NotificationService } from '@/app/lib/notifications';

// GET - View public page by slug (no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { slug } = params;

    const publicPage = await prisma.publicPage.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            businessName: true,
            settings: {
              select: {
                businessName: true,
                currency: true,
                currencySymbol: true,
              },
            },
          },
        },
      },
    });

    if (!publicPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    if (!publicPage.isActive) {
      return NextResponse.json({ error: 'Page is not active' }, { status: 404 });
    }

    // Get items from itemsJson
    const itemIds = (publicPage.itemsJson as Array<{ itemId: string; displayName: string }>).map(
      (item) => item.itemId
    );

    const items = await prisma.item.findMany({
      where: {
        userId: publicPage.userId,
        id: { in: itemIds },
      },
      select: {
        id: true,
        name: true,
        unit: true,
        totalQuantity: true,
        price: true,
        notes: true,
      },
    });

    return NextResponse.json({
      publicPage: {
        title: publicPage.title,
        phonePublic: publicPage.phonePublic,
        emailPublic: publicPage.emailPublic,
        businessName:
          publicPage.user.settings?.businessName ||
          publicPage.user.businessName ||
          'Rental Business',
        currency: publicPage.user.settings?.currencySymbol || '$',
      },
      items,
    });
  } catch (error) {
    console.error('Error fetching public page:', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

// POST - Submit inquiry (no auth required)
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { slug } = params;

    const publicPage = await prisma.publicPage.findUnique({
      where: { slug },
    });

    if (!publicPage || !publicPage.isActive) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone, email, message, startDate, endDate } = body;

    // Validation
    if (!name || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json({ error: 'Valid name is required (2-100 characters)' }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Either email or phone is required' }, { status: 400 });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 254) {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
      }
    }

    if (phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
        return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
      }
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    if (start < new Date()) {
      return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 });
    }

    // Validate message length (if provided)
    if (message && message.length > 1000) {
      return NextResponse.json({ error: 'Message is too long (max 1000 characters)' }, { status: 400 });
    }

    // Create inquiry
    const inquiry = await prisma.publicInquiry.create({
      data: {
        publicPageId: publicPage.id,
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        message: message?.trim() || null,
        startDate: start,
        endDate: end,
        status: 'new',
      },
    });

    // Send notification to business owner
    try {
      await NotificationService.sendNewInquiry(
        publicPage.userId,
        inquiry.id,
        name.trim(),
        email?.trim() || null,
        phone?.trim() || null,
        start,
        end,
        message?.trim() || null
      );
    } catch (notificationError) {
      // Log error but don't fail the request
      console.error('Failed to send inquiry notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully! We will contact you soon.',
      inquiryId: inquiry.id,
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
