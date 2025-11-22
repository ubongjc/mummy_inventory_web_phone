// Team invitation acceptance API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';

// GET - Verify invitation token and get details (no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { token } = params;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            businessName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    if (invitation.used) {
      return NextResponse.json({ error: 'Invitation already used' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        businessName: invitation.user.businessName,
        businessEmail: invitation.user.email,
      },
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json({ error: 'Failed to verify invitation' }, { status: 500 });
  }
}

// POST - Accept invitation (requires auth)
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to accept an invitation' },
        { status: 401 }
      );
    }

    const { token } = params;

    // Fetch invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    if (invitation.used) {
      return NextResponse.json({ error: 'Invitation already used' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation is for a different email address' },
        { status: 403 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_memberEmail: {
          userId: invitation.userId,
          memberEmail: invitation.email,
        },
      },
    });

    if (existingMember) {
      // Mark invitation as used
      await prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { used: true },
      });

      return NextResponse.json(
        { error: 'You are already a team member' },
        { status: 400 }
      );
    }

    // Create team member and mark invitation as used in a transaction
    const teamMember = await prisma.$transaction(async (tx) => {
      // Mark invitation as used
      await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: { used: true },
      });

      // Create team member
      const member = await tx.teamMember.create({
        data: {
          userId: invitation.userId,
          memberEmail: invitation.email,
          memberName: session.user.name || null,
          role: invitation.role,
          permissions: invitation.permissions,
          status: 'active',
          acceptedAt: new Date(),
          lastActiveAt: new Date(),
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: invitation.userId,
          actorEmail: invitation.email,
          action: 'accepted_invitation',
          entity: 'team',
          entityId: member.id,
          details: {
            role: invitation.role,
          },
        },
      });

      return member;
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      teamMember: {
        id: teamMember.id,
        role: teamMember.role,
      },
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}
