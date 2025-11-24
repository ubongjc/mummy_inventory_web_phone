import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { secureLog, sanitizeErrorResponse } from "@/app/lib/security";
import { Decimal } from "@prisma/client/runtime/library";

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

    // Validate payment doesn't exceed total price (using Decimal for precision)
    if (booking.totalPrice) {
      const totalPrice = new Decimal(booking.totalPrice.toString());
      const advancePayment = booking.advancePayment ? new Decimal(booking.advancePayment.toString()) : new Decimal(0);
      const paymentsTotal = booking.payments?.reduce(
        (sum: Decimal, p: any) => sum.plus(new Decimal(p.amount.toString())),
        new Decimal(0)
      ) || new Decimal(0);
      const totalPaid = advancePayment.plus(paymentsTotal);
      const remainingBalance = totalPrice.minus(totalPaid);

      if (new Decimal(body.amount).greaterThan(remainingBalance)) {
        return NextResponse.json(
          {
            error: "Payment exceeds remaining balance",
            totalPrice: totalPrice.toNumber(),
            totalPaid: totalPaid.toNumber(),
            remainingBalance: remainingBalance.toNumber(),
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
    return NextResponse.json(
      sanitizeErrorResponse(error, "Failed to create payment"),
      { status: 500 }
    );
  }
}
