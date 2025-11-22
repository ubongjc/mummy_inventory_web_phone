// API route to export events to CSV or JSONL

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { hasFeature } from '@/app/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/events/export?format=csv|jsonl
 * Export events in requested format
 * Requires premium subscription
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check premium access
    const hasPremium = await hasFeature(user.id, 'events_near_you');
    if (!hasPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    // Get format parameter
    const format = request.nextUrl.searchParams.get('format') || 'csv';

    // Fetch all events
    const events = await prisma.nigerianEvent.findMany({
      orderBy: { dateStart: 'asc' },
    });

    if (format === 'jsonl') {
      // Export as JSONL (one JSON object per line)
      const jsonl = events.map((event) => JSON.stringify(event)).join('\n');

      return new NextResponse(jsonl, {
        headers: {
          'Content-Type': 'application/jsonlines',
          'Content-Disposition': 'attachment; filename=events.jsonl',
        },
      });
    } else if (format === 'csv') {
      // Export as CSV
      const headers = [
        'event_id',
        'event_type',
        'title',
        'date_start',
        'date_end',
        'location_raw',
        'location_state',
        'location_city_lga',
        'venue_name',
        'contact_name',
        'contact_role',
        'contact_phone',
        'contact_email',
        'organizer_org',
        'organizer_social',
        'source_platform',
        'source_url',
        'source_published_at',
        'extracted_at',
        'confidence',
        'notes',
      ];

      const csvRows = [headers.join(',')];

      for (const event of events) {
        const row = [
          event.eventId,
          event.eventType,
          `"${event.title.replace(/"/g, '""')}"`,
          event.dateStart.toISOString(),
          event.dateEnd?.toISOString() || '',
          event.locationRaw ? `"${event.locationRaw.replace(/"/g, '""')}"` : '',
          event.locationState || '',
          event.locationCityLga || '',
          event.venueName ? `"${event.venueName.replace(/"/g, '""')}"` : '',
          event.contactName || '',
          event.contactRole || '',
          event.contactPhone || '',
          event.contactEmail || '',
          event.organizerOrg || '',
          event.organizerSocial || '',
          event.sourcePlatform,
          event.sourceUrl,
          event.sourcePublishedAt?.toISOString() || '',
          event.extractedAt.toISOString(),
          event.confidence.toString(),
          event.notes ? `"${event.notes.replace(/"/g, '""')}"` : '',
        ];

        csvRows.push(row.join(','));
      }

      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=events.csv',
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid format. Use csv or jsonl' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exporting events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
