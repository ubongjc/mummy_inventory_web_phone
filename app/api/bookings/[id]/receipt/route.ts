// Generate payment receipt for a booking

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get booking with all details
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
        payments: {
          orderBy: {
            paymentDate: 'asc',
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Calculate totals
    const totalPaid = booking.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()),
      0
    );

    const totalAmount = booking.totalPrice
      ? parseFloat(booking.totalPrice.toString())
      : 0;

    const balance = totalAmount - totalPaid;

    // Generate receipt data
    const receipt = {
      receiptNumber: `RCP-${booking.reference || booking.id.substring(0, 8).toUpperCase()}`,
      receiptDate: new Date().toISOString(),

      // Business Info
      business: {
        name: user.settings?.businessName || user.businessName || 'Rental Business',
        email: user.settings?.businessEmail || user.email,
        phone: user.settings?.businessPhone || '',
        address: user.settings?.businessAddress || '',
      },

      // Customer Info
      customer: {
        name: `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim() || booking.customer.name,
        email: booking.customer.email || '',
        phone: booking.customer.phone || '',
        address: booking.customer.address || '',
      },

      // Booking Info
      booking: {
        id: booking.id,
        reference: booking.reference || '',
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        status: booking.status,
      },

      // Items
      items: booking.items.map((item) => ({
        name: item.item.name,
        quantity: item.quantity,
        unit: item.item.unit,
        price: item.item.price ? parseFloat(item.item.price.toString()) : 0,
      })),

      // Financial Summary
      financial: {
        subtotal: totalAmount,
        totalAmount: totalAmount,
        totalPaid: totalPaid,
        balance: balance,
        currency: user.settings?.currency || 'NGN',
        currencySymbol: user.settings?.currencySymbol || '₦',
      },

      // Payment History
      payments: booking.payments.map((payment) => ({
        id: payment.id,
        amount: parseFloat(payment.amount.toString()),
        date: payment.paymentDate.toISOString(),
        notes: payment.notes || '',
      })),
    };

    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Receipt generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
