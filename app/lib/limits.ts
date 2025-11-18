/**
 * Limit Checking Functions
 * These functions check if a user has reached their plan limits
 */

import { prisma } from './prisma';
import { PLAN_LIMITS, getUserPlanType, type PlanType } from './planLimits';

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  planType: PlanType;
  message?: string;
}

/**
 * Get user's subscription and plan type
 */
async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Pass isPremium flag to allow admin overrides and testing
  const planType = getUserPlanType(user.subscription, user.isPremium);
  return { planType, subscription: user.subscription };
}

/**
 * Check if user can add more items
 */
export async function checkItemLimit(userId: string): Promise<LimitCheckResult> {
  const { planType } = await getUserSubscription(userId);
  const limit = PLAN_LIMITS[planType].items;

  const currentCount = await prisma.item.count({
    where: { userId },
  });

  const allowed = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed,
    current: currentCount,
    limit,
    remaining,
    planType,
    message: allowed
      ? undefined
      : `You've reached your plan limit of ${limit} items. Upgrade to Premium for unlimited items.`,
  };
}

/**
 * Check if user can add more customers
 */
export async function checkCustomerLimit(userId: string): Promise<LimitCheckResult> {
  const { planType } = await getUserSubscription(userId);
  const limit = PLAN_LIMITS[planType].customers;

  const currentCount = await prisma.customer.count({
    where: { userId },
  });

  const allowed = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed,
    current: currentCount,
    limit,
    remaining,
    planType,
    message: allowed
      ? undefined
      : `You've reached your plan limit of ${limit} customers. Upgrade to Premium for unlimited customers.`,
  };
}

/**
 * Check if user can add more active bookings (CONFIRMED + OUT status)
 */
export async function checkActiveBookingLimit(userId: string): Promise<LimitCheckResult> {
  const { planType } = await getUserSubscription(userId);
  const limit = PLAN_LIMITS[planType].activeBookings;

  const currentCount = await prisma.booking.count({
    where: {
      userId,
      status: {
        in: ['CONFIRMED', 'OUT'],
      },
    },
  });

  const allowed = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed,
    current: currentCount,
    limit,
    remaining,
    planType,
    message: allowed
      ? undefined
      : `You've reached your plan limit of ${limit} active bookings. Upgrade to Premium for unlimited bookings.`,
  };
}

/**
 * Check if user can add more bookings this month
 */
export async function checkMonthlyBookingLimit(userId: string): Promise<LimitCheckResult> {
  const { planType } = await getUserSubscription(userId);
  const limit = PLAN_LIMITS[planType].monthlyBookings;

  // Get start and end of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const currentCount = await prisma.booking.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const allowed = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed,
    current: currentCount,
    limit,
    remaining,
    planType,
    message: allowed
      ? undefined
      : `You've reached your plan limit of ${limit} bookings per month. Upgrade to Premium for unlimited bookings.`,
  };
}

/**
 * Get the date cutoff for booking history based on plan
 */
export async function getBookingHistoryCutoff(userId: string): Promise<Date | null> {
  const { planType } = await getUserSubscription(userId);
  const monthsLimit = PLAN_LIMITS[planType].bookingHistoryMonths;

  // null means unlimited
  if (monthsLimit === null) {
    return null;
  }

  // Calculate cutoff date
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - monthsLimit);

  return cutoff;
}

/**
 * Check if user can upload photos
 */
export async function checkPhotoUploadLimit(userId: string): Promise<{ allowed: boolean; limit: number; planType: PlanType; message?: string }> {
  const { planType } = await getUserSubscription(userId);
  const limit = PLAN_LIMITS[planType].photosPerItem;

  const allowed = limit > 0;

  return {
    allowed,
    limit,
    planType,
    message: allowed
      ? undefined
      : 'Photo uploads are not available on the free plan. Upgrade to Premium to add up to 5 photos per item.',
  };
}

/**
 * Check if user can export data
 */
export async function checkDataExportAccess(userId: string): Promise<{ allowed: boolean; planType: PlanType; message?: string }> {
  const { planType } = await getUserSubscription(userId);
  const allowed = PLAN_LIMITS[planType].dataExports;

  return {
    allowed,
    planType,
    message: allowed
      ? undefined
      : 'Data export is not available on the free plan. Upgrade to Premium to export your data to Excel/CSV.',
  };
}

/**
 * Check if user can access public booking page
 */
export async function checkPublicPageAccess(userId: string): Promise<{ allowed: boolean; planType: PlanType; message?: string }> {
  const { planType } = await getUserSubscription(userId);
  const allowed = PLAN_LIMITS[planType].publicBookingPage;

  return {
    allowed,
    planType,
    message: allowed
      ? undefined
      : 'Public booking page is not available on the free plan. Upgrade to Premium to allow customers to book online.',
  };
}

/**
 * Get all current usage stats for a user
 */
export async function getUserUsageStats(userId: string) {
  const { planType } = await getUserSubscription(userId);

  // Get counts in parallel
  const [itemCount, customerCount, activeBookingCount, monthlyBookingCount] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.customer.count({ where: { userId } }),
    prisma.booking.count({
      where: {
        userId,
        status: { in: ['CONFIRMED', 'OUT'] },
      },
    }),
    (async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return prisma.booking.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
    })(),
  ]);

  const limits = PLAN_LIMITS[planType];

  return {
    planType,
    items: {
      current: itemCount,
      limit: limits.items,
      remaining: Math.max(0, limits.items - itemCount),
      percentage: limits.items === Infinity ? 0 : (itemCount / limits.items) * 100,
    },
    customers: {
      current: customerCount,
      limit: limits.customers,
      remaining: Math.max(0, limits.customers - customerCount),
      percentage: limits.customers === Infinity ? 0 : (customerCount / limits.customers) * 100,
    },
    activeBookings: {
      current: activeBookingCount,
      limit: limits.activeBookings,
      remaining: Math.max(0, limits.activeBookings - activeBookingCount),
      percentage: limits.activeBookings === Infinity ? 0 : (activeBookingCount / limits.activeBookings) * 100,
    },
    monthlyBookings: {
      current: monthlyBookingCount,
      limit: limits.monthlyBookings,
      remaining: Math.max(0, limits.monthlyBookings - monthlyBookingCount),
      percentage: limits.monthlyBookings === Infinity ? 0 : (monthlyBookingCount / limits.monthlyBookings) * 100,
    },
  };
}
