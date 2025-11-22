// Export items/inventory API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';
import { exportItemsToCSV, exportToExcel } from '@/app/lib/export';

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
      select: { id: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.plan === 'free') {
      return NextResponse.json(
        {
          error: 'Export feature is only available for Pro and Business plans',
          upgrade_required: true,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';

    const items = await prisma.item.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    let blob: Blob;
    let filename: string;
    let contentType: string;

    if (format === 'excel') {
      blob = exportToExcel(
        items.map(i => ({
          ...i,
          price: i.price ? Number(i.price) : null,
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        })),
        'items.xlsx'
      );
      filename = `inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
      contentType = 'application/vnd.ms-excel';
    } else {
      blob = exportItemsToCSV(items);
      filename = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
      contentType = 'text/csv';
    }

    const buffer = Buffer.from(await blob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error exporting items:', error);
    return NextResponse.json(
      { error: 'Failed to export items' },
      { status: 500 }
    );
  }
}
