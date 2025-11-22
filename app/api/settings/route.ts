import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { updateSettingsSchema } from "@/app/lib/validation";
import { secureLog } from "@/app/lib/security";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create settings for this user
    let settings = await prisma.settings.findUnique({
      where: { userId: session.user.id }
    });

    if (!settings) {
      // Create default settings for this user
      // Copy businessName from User if it exists
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { businessName: true }
      });

      settings = await prisma.settings.create({
        data: {
          userId: session.user.id,
          businessName: user?.businessName || null
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[ERROR] Failed to fetch settings:", error);
    secureLog("[ERROR] Failed to fetch settings", { error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error.message },
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
    const validated = updateSettingsSchema.parse(body);

    // Remove null values from validated data (Prisma doesn't accept null, only undefined)
    const cleanedData = Object.fromEntries(
      Object.entries(validated).filter(([_, value]) => value !== null)
    );

    // Get existing settings for this user
    let settings = await prisma.settings.findUnique({
      where: { userId: session.user.id }
    });

    if (!settings) {
      // IMPORTANT: Preserve all user data when creating settings
      // This should rarely happen - only for new users
      secureLog("[WARNING] Creating new settings for existing user", { userId: session.user.id });
      settings = await prisma.settings.create({
        data: {
          ...cleanedData,
          userId: session.user.id
        },
      });
    } else {
      // Update only the fields that were sent (partial update)
      // This prevents accidentally resetting fields that weren't changed
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: cleanedData,
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    secureLog("[ERROR] Failed to update settings", { error: error.message });
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
