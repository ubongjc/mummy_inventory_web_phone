import { prisma } from "./prisma";

/**
 * Free Plan Limits (enforced server-side and client-side)
 */
export const FREE_LIMITS = {
  ITEMS: 15,
  CUSTOMERS: 50,
  ACTIVE_BOOKINGS: 15, // CONFIRMED + OUT status
  BOOKINGS_PER_MONTH: 25,
  HISTORY_MONTHS: 3, // Only show last 3 months
  PHOTOS_PER_ITEM: 0, // No photos on free plan
  TEAM_MEMBERS: 1, // Owner only
  LOCATIONS: 1,
} as const;

/**
 * Premium feature check - throws if user is not premium
 */
export async function requirePremium(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPremium: true,
      subscription: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!user?.isPremium) {
    throw new Error("Premium subscription required");
  }

  // Double-check subscription status
  if (
    !user.subscription?.status ||
    !["active", "trialing"].includes(user.subscription.status)
  ) {
    throw new Error("Active premium subscription required");
  }
}

/**
 * Check if user is premium (non-throwing)
 */
export async function isPremium(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPremium: true,
      subscription: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!user?.isPremium) {
    return false;
  }

  return (
    user.subscription?.status !== undefined &&
    ["active", "trialing"].includes(user.subscription.status)
  );
}

/**
 * Check item count limit
 */
export async function checkItemLimit(userId: string): Promise<{
  canAdd: boolean;
  currentCount: number;
  limit: number;
  isNearLimit: boolean;
}> {
  const premium = await isPremium(userId);

  if (premium) {
    // No limit for premium users
    const count = await prisma.item.count({ where: { userId } });
    return {
      canAdd: true,
      currentCount: count,
      limit: Infinity,
      isNearLimit: false,
    };
  }

  const currentCount = await prisma.item.count({ where: { userId } });
  const limit = FREE_LIMITS.ITEMS;

  return {
    canAdd: currentCount < limit,
    currentCount,
    limit,
    isNearLimit: currentCount >= limit * 0.8, // 80% threshold
  };
}

/**
 * Check customer count limit
 */
export async function checkCustomerLimit(userId: string): Promise<{
  canAdd: boolean;
  currentCount: number;
  limit: number;
  isNearLimit: boolean;
}> {
  const premium = await isPremium(userId);

  if (premium) {
    const count = await prisma.customer.count({ where: { userId } });
    return {
      canAdd: true,
      currentCount: count,
      limit: Infinity,
      isNearLimit: false,
    };
  }

  const currentCount = await prisma.customer.count({ where: { userId } });
  const limit = FREE_LIMITS.CUSTOMERS;

  return {
    canAdd: currentCount < limit,
    currentCount,
    limit,
    isNearLimit: currentCount >= limit * 0.8,
  };
}

/**
 * Check active booking limit (CONFIRMED + OUT status)
 */
export async function checkActiveBookingLimit(userId: string): Promise<{
  canAdd: boolean;
  currentCount: number;
  limit: number;
  isNearLimit: boolean;
}> {
  const premium = await isPremium(userId);

  if (premium) {
    const count = await prisma.booking.count({
      where: {
        userId,
        status: { in: ["CONFIRMED", "OUT"] },
      },
    });
    return {
      canAdd: true,
      currentCount: count,
      limit: Infinity,
      isNearLimit: false,
    };
  }

  const currentCount = await prisma.booking.count({
    where: {
      userId,
      status: { in: ["CONFIRMED", "OUT"] },
    },
  });
  const limit = FREE_LIMITS.ACTIVE_BOOKINGS;

  return {
    canAdd: currentCount < limit,
    currentCount,
    limit,
    isNearLimit: currentCount >= limit * 0.8,
  };
}

/**
 * Check monthly booking creation limit
 */
export async function checkMonthlyBookingLimit(userId: string): Promise<{
  canAdd: boolean;
  currentCount: number;
  limit: number;
  isNearLimit: boolean;
}> {
  const premium = await isPremium(userId);

  if (premium) {
    // Get count for display but no limit
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await prisma.booking.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });
    return {
      canAdd: true,
      currentCount: count,
      limit: Infinity,
      isNearLimit: false,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const currentCount = await prisma.booking.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  });
  const limit = FREE_LIMITS.BOOKINGS_PER_MONTH;

  return {
    canAdd: currentCount < limit,
    currentCount,
    limit,
    isNearLimit: currentCount >= limit * 0.8,
  };
}

/**
 * Get history cutoff date for free users (3 months back)
 */
export async function getHistoryCutoffDate(
  userId: string
): Promise<Date | null> {
  const premium = await isPremium(userId);

  if (premium) {
    return null; // No cutoff for premium
  }

  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - FREE_LIMITS.HISTORY_MONTHS);
  return cutoff;
}

/**
 * Check all limits at once (useful for dashboard display)
 */
export async function checkAllLimits(userId: string) {
  const [items, customers, activeBookings, monthlyBookings, premium] =
    await Promise.all([
      checkItemLimit(userId),
      checkCustomerLimit(userId),
      checkActiveBookingLimit(userId),
      checkMonthlyBookingLimit(userId),
      isPremium(userId),
    ]);

  return {
    isPremium: premium,
    items,
    customers,
    activeBookings,
    monthlyBookings,
  };
}

/**
 * Enforce item creation limit
 */
export async function enforceItemLimit(userId: string): Promise<void> {
  const check = await checkItemLimit(userId);
  if (!check.canAdd) {
    throw new Error(
      `Item limit reached. Free plan allows ${check.limit} items. Upgrade to Premium for unlimited items.`
    );
  }
}

/**
 * Enforce customer creation limit
 */
export async function enforceCustomerLimit(userId: string): Promise<void> {
  const check = await checkCustomerLimit(userId);
  if (!check.canAdd) {
    throw new Error(
      `Customer limit reached. Free plan allows ${check.limit} customers. Upgrade to Premium for unlimited customers.`
    );
  }
}

/**
 * Enforce active booking limit
 */
export async function enforceActiveBookingLimit(userId: string): Promise<void> {
  const check = await checkActiveBookingLimit(userId);
  if (!check.canAdd) {
    throw new Error(
      `Active booking limit reached. Free plan allows ${check.limit} active bookings. Upgrade to Premium for unlimited bookings.`
    );
  }
}

/**
 * Enforce monthly booking limit
 */
export async function enforceMonthlyBookingLimit(
  userId: string
): Promise<void> {
  const check = await checkMonthlyBookingLimit(userId);
  if (!check.canAdd) {
    throw new Error(
      `Monthly booking limit reached. Free plan allows ${check.limit} bookings per month. Upgrade to Premium for unlimited bookings.`
    );
  }
}

/**
 * Check if user can upload photos
 */
export async function canUploadPhotos(userId: string): Promise<boolean> {
  return await isPremium(userId);
}

/**
 * Role-based permission check for team collaboration
 */
export async function checkPermission(
  userId: string,
  action: "read" | "write" | "delete" | "admin"
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return false;
  }

  // OWNER can do everything
  if (user.role === "OWNER") {
    return true;
  }

  // ADMIN can read, write, delete
  if (user.role === "ADMIN") {
    return ["read", "write", "delete"].includes(action);
  }

  // MEMBER can only read and write
  if (user.role === "MEMBER") {
    return ["read", "write"].includes(action);
  }

  return false;
}

/**
 * Get effective user ID (owner ID for team members)
 */
export async function getEffectiveUserId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ownerId: true },
  });

  return user?.ownerId || userId;
}
