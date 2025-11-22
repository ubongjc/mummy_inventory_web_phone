// Export bookings API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';
import { exportBookingsToCSV, exportToExcel } from '@/app/lib/export';

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has access to export feature (Premium feature)
    if (user.plan === 'free') {
      return NextResponse.json(
        {
          error: 'Export feature is only available for Pro and Business plans',
          upgrade_required: true,
        },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv'; // csv, excel
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Build query
    const where: any = {
      userId: user.id,
    };

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    if (status) {
      where.status = status;
    }

    // Fetch bookings with related data
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            item: {
              select: {
                name: true,
                unit: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Generate export based on format
    let blob: Blob;
    let filename: string;
    let contentType: string;

    if (format === 'excel') {
      blob = exportToExcel(
        bookings.map(b => ({
          ...b,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
        'bookings.xlsx'
      );
      filename = `bookings_${new Date().toISOString().split('T')[0]}.xlsx`;
      contentType = 'application/vnd.ms-excel';
    } else {
      blob = exportBookingsToCSV(bookings);
      filename = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
      contentType = 'text/csv';
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error exporting bookings:', error);
    return NextResponse.json(
      { error: 'Failed to export bookings' },
      { status: 500 }
    );
  }
}
