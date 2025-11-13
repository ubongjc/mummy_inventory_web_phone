import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { secureLog } from "@/app/lib/security";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();

    // Validate booking exists
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
