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
      settings = await prisma.settings.create({
        data: {
          userId: session.user.id
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    secureLog("[ERROR] Failed to fetch settings", { error: error.message });
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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

    // Get or create settings for this user
    let settings = await prisma.settings.findUnique({
      where: { userId: session.user.id }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          ...validated,
          userId: session.user.id
        },
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: validated,
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
