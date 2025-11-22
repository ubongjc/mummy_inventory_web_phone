// Role-Based Access Control (RBAC) utilities

import { prisma } from '@/app/lib/prisma';

export interface UserPermissions {
  viewDashboard: boolean;
  manageBookings: boolean;
  manageItems: boolean;
  manageCustomers: boolean;
  viewReports: boolean;
  manageSettings: boolean;
  manageTeam: boolean;
}

export interface UserContext {
  userId: string;
  email: string;
  isOwner: boolean;
  role?: string;
  permissions: UserPermissions;
}

/**
 * Get user context with permissions
 * This checks if the user is the business owner or a team member
 */
export async function getUserContext(
  businessOwnerId: string,
  userEmail: string
): Promise<UserContext | null> {
  try {
    // Check if user is the business owner
    const owner = await prisma.user.findUnique({
      where: { id: businessOwnerId },
      select: { email: true },
    });

    if (!owner) {
      return null;
    }

    // If user is the owner, they have full permissions
    if (owner.email?.toLowerCase() === userEmail.toLowerCase()) {
      return {
        userId: businessOwnerId,
        email: userEmail,
        isOwner: true,
        role: 'owner',
        permissions: {
          viewDashboard: true,
          manageBookings: true,
          manageItems: true,
          manageCustomers: true,
          viewReports: true,
          manageSettings: true,
          manageTeam: true,
        },
      };
    }

    // Check if user is a team member
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_memberEmail: {
          userId: businessOwnerId,
          memberEmail: userEmail.toLowerCase(),
        },
      },
      select: {
        role: true,
        status: true,
        permissions: true,
      },
    });

    if (!teamMember) {
      return null; // Not authorized
    }

    if (teamMember.status !== 'active') {
      return null; // Suspended or inactive
    }

    return {
      userId: businessOwnerId,
      email: userEmail,
      isOwner: false,
      role: teamMember.role,
      permissions: teamMember.permissions as UserPermissions,
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userContext: UserContext,
  permission: keyof UserPermissions
): boolean {
  return userContext.permissions[permission] === true;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userContext: UserContext,
  permissions: Array<keyof UserPermissions>
): boolean {
  return permissions.some((permission) => hasPermission(userContext, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userContext: UserContext,
  permissions: Array<keyof UserPermissions>
): boolean {
  return permissions.every((permission) => hasPermission(userContext, permission));
}

/**
 * Require specific permission or throw error
 */
export function requirePermission(
  userContext: UserContext,
  permission: keyof UserPermissions
): void {
  if (!hasPermission(userContext, permission)) {
    throw new Error(`Permission denied: ${permission} required`);
  }
}

/**
 * Get permission error message
 */
export function getPermissionError(permission: keyof UserPermissions): string {
  const messages: Record<keyof UserPermissions, string> = {
    viewDashboard: 'You do not have permission to view the dashboard',
    manageBookings: 'You do not have permission to manage bookings',
    manageItems: 'You do not have permission to manage items',
    manageCustomers: 'You do not have permission to manage customers',
    viewReports: 'You do not have permission to view reports',
    manageSettings: 'You do not have permission to manage settings',
    manageTeam: 'You do not have permission to manage team members',
  };

  return messages[permission] || 'You do not have permission to perform this action';
}

/**
 * Log activity for audit trail
 */
export async function logActivity(
  userId: string,
  actorEmail: string,
  action: string,
  entity: string,
  entityId: string | null = null,
  details: any = null
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        actorEmail,
        action,
        entity,
        entityId,
        details,
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}
