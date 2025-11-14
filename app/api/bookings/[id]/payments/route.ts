import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { secureLog } from "@/app/lib/security";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await request.json();

    // Validate booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify booking belongs to current user (unless admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    if (!isAdmin && booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Validate payment doesn't exceed total price
    if (booking.totalPrice) {
      const totalPriceNum = Number(booking.totalPrice);
      const advancePaymentNum = booking.advancePayment ? Number(booking.advancePayment) : 0;
      const paymentsTotal = booking.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
      const totalPaid = advancePaymentNum + paymentsTotal;
      const remainingBalance = totalPriceNum - totalPaid;

      if (body.amount > remainingBalance) {
        return NextResponse.json(
          {
            error: "Payment exceeds remaining balance",
            totalPrice: totalPriceNum,
            totalPaid,
            remainingBalance,
            attemptedPayment: body.amount
          },
          { status: 400 }
        );
      }
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        bookingId: bookingId,
        amount: body.amount,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        notes: body.notes,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    secureLog("[ERROR] Failed to create payment", { error: error.message });
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
