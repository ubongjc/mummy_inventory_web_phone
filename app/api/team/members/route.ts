// Team members management API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';

// GET - List team members (authenticated)
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

    // Fetch team members
    const members = await prisma.teamMember.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        memberEmail: true,
        memberName: true,
        role: true,
        permissions: true,
        status: true,
        invitedAt: true,
        acceptedAt: true,
        lastActiveAt: true,
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// PATCH - Update team member (authenticated)
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { memberId, role, status, permissions } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Verify member belongs to this user
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.userId !== user.id) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (role && ['admin', 'manager', 'staff', 'viewer'].includes(role)) {
      updateData.role = role;

      // Update permissions based on role if not custom
      if (!permissions) {
        const rolePermissions = {
          admin: {
            viewDashboard: true,
            manageBookings: true,
            manageItems: true,
            manageCustomers: true,
            viewReports: true,
            manageSettings: true,
            manageTeam: true,
          },
          manager: {
            viewDashboard: true,
            manageBookings: true,
            manageItems: true,
            manageCustomers: true,
            viewReports: true,
            manageSettings: false,
            manageTeam: false,
          },
          staff: {
            viewDashboard: true,
            manageBookings: true,
            manageItems: false,
            manageCustomers: true,
            viewReports: false,
            manageSettings: false,
            manageTeam: false,
          },
          viewer: {
            viewDashboard: true,
            manageBookings: false,
            manageItems: false,
            manageCustomers: false,
            viewReports: true,
            manageSettings: false,
            manageTeam: false,
          },
        };
        updateData.permissions = rolePermissions[role as keyof typeof rolePermissions];
      }
    }

    if (permissions) {
      updateData.permissions = permissions;
    }

    if (status && ['active', 'suspended'].includes(status)) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
    }

    // Update member
    const updatedMember = await prisma.$transaction(async (tx) => {
      const updated = await tx.teamMember.update({
        where: { id: memberId },
        data: updateData,
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          actorId: user.id,
          actorEmail: session.user.email!,
          action: 'updated',
          entity: 'team_member',
          entityId: memberId,
          details: updateData,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      member: {
        id: updatedMember.id,
        role: updatedMember.role,
        status: updatedMember.status,
        permissions: updatedMember.permissions,
      },
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

// DELETE - Remove team member (authenticated)
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Verify member belongs to this user and get details
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.userId !== user.id) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Remove member and log activity
    await prisma.$transaction(async (tx) => {
      await tx.teamMember.delete({
        where: { id: memberId },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          actorId: user.id,
          actorEmail: session.user.email!,
          action: 'removed',
          entity: 'team_member',
          entityId: memberId,
          details: {
            email: member.memberEmail,
            role: member.role,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
}
