// API route for fetching Nigerian events with search/filtering

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { hasFeature } from '@/app/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/events
 * Fetch events with optional filtering
 * Requires premium subscription
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check premium access
    const hasPremium = await hasFeature(user.id, 'events_near_you');
    if (!hasPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required to access Events Near You' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get('eventType');
    const locationState = searchParams.get('locationState');
    const searchQuery = searchParams.get('q');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build where clause
    const where: any = {};

    if (eventType) {
      where.eventType = eventType;
    }

    if (locationState) {
      where.locationState = locationState;
    }

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { locationRaw: { contains: searchQuery, mode: 'insensitive' } },
        { venueName: { contains: searchQuery, mode: 'insensitive' } },
        { contactName: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.dateStart = {};
      if (dateFrom) {
        where.dateStart.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.dateStart.lte = new Date(dateTo);
      }
    }

    // Fetch events with pagination
    const [events, totalCount] = await Promise.all([
      prisma.nigerianEvent.findMany({
        where,
        orderBy: { dateStart: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.nigerianEvent.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
