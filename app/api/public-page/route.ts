// Public booking page management API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';

// GET - Fetch user's public page settings
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const publicPage = await prisma.publicPage.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ publicPage });
  } catch (error) {
    console.error('Error fetching public page:', error);
    return NextResponse.json({ error: 'Failed to fetch public page' }, { status: 500 });
  }
}

// POST/PUT - Create or update public page
export async function POST(req: NextRequest) {
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
      select: { id: true, businessName: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { slug, title, phonePublic, emailPublic, itemIds, isActive, customMessage, contactMethods } = body;

    // Validate slug format (alphanumeric + hyphens only, 3-50 chars)
    if (slug) {
      const slugRegex = /^[a-z0-9-]{3,50}$/;
      if (!slugRegex.test(slug)) {
        return NextResponse.json(
          { error: 'Invalid slug. Use lowercase letters, numbers, and hyphens (3-50 characters)' },
          { status: 400 }
        );
      }

      // Check if slug is already taken by another user
      const existingPage = await prisma.publicPage.findUnique({
        where: { slug },
      });

      if (existingPage && existingPage.userId !== user.id) {
        return NextResponse.json({ error: 'Slug already taken' }, { status: 400 });
      }
    }

    // Validate items (get from database)
    let itemsJson: Array<{ itemId: string; displayName: string }> = [];
    if (itemIds && Array.isArray(itemIds)) {
      const items = await prisma.item.findMany({
        where: {
          userId: user.id,
          id: { in: itemIds },
        },
        select: {
          id: true,
          name: true,
        },
      });

      itemsJson = items.map((item) => ({
        itemId: item.id,
        displayName: item.name,
      }));
    }

    // Upsert public page
    const publicPage = await prisma.publicPage.upsert({
      where: { userId: user.id },
      update: {
        ...(slug && { slug }),
        ...(title && { title }),
        phonePublic: phonePublic || null,
        emailPublic: emailPublic || null,
        ...(itemIds && { itemsJson }),
        ...(typeof isActive === 'boolean' && { isActive }),
        customMessage: customMessage || null,
        ...(contactMethods && { contactMethods }),
      },
      create: {
        userId: user.id,
        slug: slug || `${user.id.substring(0, 8)}-rentals`,
        title: title || `${user.businessName || 'Our'} Rentals`,
        phonePublic: phonePublic || null,
        emailPublic: emailPublic || null,
        itemsJson,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        customMessage: customMessage || null,
        contactMethods: contactMethods || ['app'],
      },
    });

    return NextResponse.json({
      success: true,
      publicPage,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/${publicPage.slug}`,
    });
  } catch (error) {
    console.error('Error creating/updating public page:', error);
    return NextResponse.json({ error: 'Failed to save public page' }, { status: 500 });
  }
}
