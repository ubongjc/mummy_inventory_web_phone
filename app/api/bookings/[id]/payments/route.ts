import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();

    // Validate booking exists
    const booking = await prisma.rental.findUnique({
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
      const totalPaid = (booking.advancePayment || 0) +
                        (booking.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);
      const remainingBalance = booking.totalPrice - totalPaid;

      if (body.amount > remainingBalance) {
        return NextResponse.json(
          {
            error: "Payment exceeds remaining balance",
            totalPrice: booking.totalPrice,
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
        rentalId: bookingId,
        amount: body.amount,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        notes: body.notes,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
