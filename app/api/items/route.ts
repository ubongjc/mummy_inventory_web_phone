import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { createItemSchema } from "@/app/lib/validation";
import { secureLog } from "@/app/lib/security";
import { checkItemLimit } from "@/app/lib/limits";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    const items = await prisma.item.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("[ERROR] Failed to fetch items:", error);
    secureLog("[ERROR] Failed to fetch items", { error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: "Failed to fetch items", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createItemSchema.parse(body);

    // Check if user has reached their item limit
    const limitCheck = await checkItemLimit(session.user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Item limit reached",
          details: limitCheck.message,
          current: limitCheck.current,
          limit: limitCheck.limit,
          planType: limitCheck.planType,
        },
        { status: 403 }
      );
    }

    // Check for duplicate item name for this user (case-insensitive)
    // The database will also enforce this via unique index, but we provide a better error message here
    const existingItems = await prisma.item.findMany({
      where: {
        userId: session.user.id,
        name: {
          mode: "insensitive",
          equals: validated.name,
        },
      },
    });

    if (existingItems.length > 0) {
      return NextResponse.json(
        {
          error: "Item already exists",
          details: `An item with the name "${validated.name}" already exists. Please use a different name.`,
        },
        { status: 409 } // Conflict status code
      );
    }

    const item = await prisma.item.create({
      data: {
        ...validated,
        userId: session.user.id, // Always set to current user
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    secureLog("[ERROR] Failed to create item", { error: error.message });
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    // Handle unique constraint violation from database
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Item already exists",
          details: `An item with this name already exists. Please use a different name.`,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
