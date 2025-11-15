import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { secureLog } from "@/app/lib/security";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        logoUrl: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    secureLog("[ERROR] Failed to fetch user profile", { error: error.message });
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessName, logoUrl, firstName, lastName } = body;

    // Validate inputs
    if (businessName && (businessName.length < 2 || businessName.length > 100)) {
      return NextResponse.json(
        { error: "Business name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (logoUrl && logoUrl.length > 500) {
      return NextResponse.json(
        { error: "Logo URL is too long" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (businessName !== undefined) {
      updateData.businessName = businessName || null;
    }
    if (logoUrl !== undefined) {
      updateData.logoUrl = logoUrl || null;
    }
    if (firstName !== undefined) {
      updateData.firstName = firstName || null;
    }
    if (lastName !== undefined) {
      updateData.lastName = lastName || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        logoUrl: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    secureLog("[ERROR] Failed to update user profile", { error: error.message });
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
