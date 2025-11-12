import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rentalId } = await params;
    const body = await request.json();

    // Validate rental exists
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        payments: true,
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      );
    }

    // Validate payment doesn't exceed total price
    if (rental.totalPrice) {
      const totalPaid = (rental.advancePayment || 0) +
                        (rental.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);
      const remainingBalance = rental.totalPrice - totalPaid;

      if (body.amount > remainingBalance) {
        return NextResponse.json(
          {
            error: "Payment exceeds remaining balance",
            totalPrice: rental.totalPrice,
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
        rentalId,
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
