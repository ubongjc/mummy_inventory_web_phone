import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth.config';
import { prisma } from '@/app/lib/prisma';

/**
 * DELETE /api/user/account
 * Permanently delete the user's account and ALL associated data
 * This action cannot be undone!
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete ALL user data in the correct order (respecting foreign key constraints)
    // Prisma will automatically handle cascade deletes for related records based on schema

    // The User model has onDelete: Cascade for all relations, so deleting the user
    // will automatically delete:
    // - Items
    // - Customers
    // - Bookings (which cascade deletes BookingItems and Payments)
    // - Settings
    // - Subscription
    // - PublicPage (which cascade deletes PublicInquiries)
    // - PasswordReset records

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account', details: error.message },
      { status: 500 }
    );
  }
}
