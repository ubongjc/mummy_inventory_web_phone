// Rental requests management API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';

// GET - List all rental requests for authenticated user
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

    // Get user's public page
    const publicPage = await prisma.publicPage.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!publicPage) {
      return NextResponse.json({ requests: [] });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      publicPageId: publicPage.id,
    };

    if (status && ['pending', 'confirmed_without_payment', 'confirmed', 'cancelled'].includes(status)) {
      where.status = status;
    }

    // Fetch requests
    const requests = await prisma.publicInquiry.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        startDate: true,
        endDate: true,
        selectedItems: true,
        status: true,
        totalAmount: true,
        platformFee: true,
        paymentLinkUrl: true,
        denialReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching rental requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// PATCH - Update rental request (approve/deny)
export async function PATCH(req: NextRequest) {
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
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { requestId, action, denialReason, manualPaymentConfirmed } = body;

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    if (!action || !['approve', 'deny', 'confirm_payment'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Verify request belongs to user
    const request = await prisma.publicInquiry.findFirst({
      where: {
        id: requestId,
        page: {
          userId: user.id,
        },
      },
      include: {
        page: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    let updatedRequest;

    if (action === 'approve') {
      // Approve request - change status to confirmed_without_payment
      // TODO: Generate payment link here (Paystack/Stripe integration)

      updatedRequest = await prisma.publicInquiry.update({
        where: { id: requestId },
        data: {
          status: 'confirmed_without_payment',
          // paymentLinkUrl will be added when Paystack integration is complete
        },
      });

      // Send approval notification to customer
      try {
        const { NotificationService } = await import('@/app/lib/notifications');

        // Extract item names from selectedItems if available
        const items: string[] = [];
        if (request.selectedItems && Array.isArray(request.selectedItems)) {
          request.selectedItems.forEach((item: any) => {
            if (item.name) {
              items.push(`${item.name} (${item.quantity || 1})`);
            }
          });
        }

        await NotificationService.sendRentalRequestApproval(
          user.id,
          request.id,
          request.name,
          request.email,
          request.phone,
          request.startDate,
          request.endDate,
          items,
          request.totalAmount ? Number(request.totalAmount) : undefined,
          request.paymentLinkUrl || undefined
        );
      } catch (notificationError) {
        console.error('Failed to send approval notification:', notificationError);
        // Continue anyway - the approval is saved
      }

    } else if (action === 'deny') {
      // Deny request - change status to cancelled
      const reason = denialReason?.trim() || 'Your booking request could not be fulfilled at this time. We apologize for any inconvenience.';

      updatedRequest = await prisma.publicInquiry.update({
        where: { id: requestId },
        data: {
          status: 'cancelled',
          denialReason: reason,
        },
      });

      // Send denial notification to customer
      try {
        const { NotificationService } = await import('@/app/lib/notifications');

        await NotificationService.sendRentalRequestDenial(
          user.id,
          request.id,
          request.name,
          request.email,
          request.phone,
          request.startDate,
          request.endDate,
          reason
        );
      } catch (notificationError) {
        console.error('Failed to send denial notification:', notificationError);
        // Continue anyway - the denial is saved
      }

    } else if (action === 'confirm_payment') {
      // Manual payment confirmation - change status to confirmed
      if (request.status !== 'confirmed_without_payment') {
        return NextResponse.json(
          { error: 'Can only confirm payment for requests with confirmed_without_payment status' },
          { status: 400 }
        );
      }

      updatedRequest = await prisma.publicInquiry.update({
        where: { id: requestId },
        data: {
          status: 'confirmed',
        },
      });

      // Send payment confirmed notification to customer
      try {
        const { NotificationService } = await import('@/app/lib/notifications');

        // Extract item names from selectedItems if available
        const items: string[] = [];
        if (request.selectedItems && Array.isArray(request.selectedItems)) {
          request.selectedItems.forEach((item: any) => {
            if (item.name) {
              items.push(`${item.name} (${item.quantity || 1})`);
            }
          });
        }

        await NotificationService.sendPaymentConfirmed(
          user.id,
          request.id,
          request.name,
          request.email,
          request.phone,
          request.startDate,
          request.endDate,
          items,
          request.totalAmount ? Number(request.totalAmount) : undefined
        );
      } catch (notificationError) {
        console.error('Failed to send payment confirmed notification:', notificationError);
        // Continue anyway - the confirmation is saved
      }
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating rental request:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
