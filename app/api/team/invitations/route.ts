// Team invitation API - send and manage team invitations

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';
import crypto from 'crypto';
import { NotificationService } from '@/app/lib/notifications';

// GET - List pending invitations (authenticated)
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authenticate user
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

    // Fetch pending invitations
    const invitations = await prisma.teamInvitation.findMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

// POST - Send team invitation (authenticated)
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        businessName: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { email, role } = body;

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!role || !['admin', 'manager', 'staff', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, manager, staff, or viewer' },
        { status: 400 }
      );
    }

    // Cannot invite yourself
    if (email.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'You cannot invite yourself' },
        { status: 400 }
      );
    }

    // Check if already a team member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_memberEmail: {
          userId: user.id,
          memberEmail: email.toLowerCase(),
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'This email is already a team member' },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        userId: user.id,
        email: email.toLowerCase(),
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation is already pending for this email' },
        { status: 400 }
      );
    }

    // Define permissions based on role
    const permissions = {
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

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await prisma.teamInvitation.create({
      data: {
        userId: user.id,
        email: email.toLowerCase(),
        token,
        role,
        permissions: permissions[role as keyof typeof permissions],
        expiresAt,
      },
    });

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/team/accept/${token}`;

    try {
      const { NotificationService } = await import('@/app/lib/notifications');

      const inviterName = `${session.user.name || user.businessName || user.email}`;

      await NotificationService.sendTeamInvitation(
        inviterName,
        user.businessName || 'Your Business',
        email.toLowerCase(),
        role,
        invitationUrl
      );

      console.log(`Team invitation email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Continue anyway - the invitation is created, user can still share the URL manually
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitationUrl,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke invitation (authenticated)
export async function DELETE(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authenticate user
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
    const invitationId = searchParams.get('id');

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    // Delete invitation (only if it belongs to the user)
    const deleted = await prisma.teamInvitation.deleteMany({
      where: {
        id: invitationId,
        userId: user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking invitation:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invitation' },
      { status: 500 }
    );
  }
}
