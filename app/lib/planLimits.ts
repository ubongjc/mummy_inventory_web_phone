/**
 * Plan Limits Configuration
 * Defines the limits and features available for each subscription plan
 */

export type PlanType = 'free' | 'premium';

export interface PlanLimits {
  // Inventory limits
  items: number;
  customers: number;
  activeBookings: number;
  monthlyBookings: number;

  // Time-based limits
  bookingHistoryMonths: number | null; // null = unlimited

  // Feature limits
  photosPerItem: number;
  dataExports: boolean;
  publicBookingPage: boolean;
  automatedNotifications: boolean;
  teamMembers: number;
  wholesaleSupplierConnection: boolean;

  // Support
  support: {
    email: boolean;
    priority: boolean;
    whatsapp: boolean;
  };
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    // Inventory limits
    items: 15,
    customers: 50,
    activeBookings: 15, // CONFIRMED + OUT status
    monthlyBookings: 25,

    // Time-based limits
    bookingHistoryMonths: 3, // Last 3 months only

    // Feature limits
    photosPerItem: 0,
    dataExports: false,
    publicBookingPage: false,
    automatedNotifications: false,
    teamMembers: 1,
    wholesaleSupplierConnection: false,

    // Support
    support: {
      email: true,
      priority: false,
      whatsapp: false,
    },
  },
  premium: {
    // Inventory limits
    items: Infinity,
    customers: Infinity,
    activeBookings: Infinity,
    monthlyBookings: Infinity,

    // Time-based limits
    bookingHistoryMonths: null, // Unlimited

    // Feature limits
    photosPerItem: 5,
    dataExports: true,
    publicBookingPage: true,
    automatedNotifications: true,
    teamMembers: 5,
    wholesaleSupplierConnection: true,

    // Support
    support: {
      email: true,
      priority: true,
      whatsapp: true,
    },
  },
};

/**
 * Feature descriptions for display purposes
 */
export const FEATURE_DESCRIPTIONS = {
  items: {
    name: 'Items (Inventory)',
    free: '15 items',
    premium: 'Unlimited',
    rationale: '15 items is enough for a micro-business (e.g., party supplies, camera gear) to test the system, but any serious rental operation will exceed this quickly.',
  },
  customers: {
    name: 'Customers',
    free: '50 customers',
    premium: 'Unlimited',
    rationale: '50 customers allows meaningful testing but limits growth. A successful rental business will hit this within 2-3 months.',
  },
  activeBookings: {
    name: 'Active Bookings',
    description: 'CONFIRMED + OUT status',
    free: '15 concurrent active bookings',
    premium: 'Unlimited',
    rationale: '15 concurrent rentals is small-scale. Once business picks up, they\'ll need premium.',
  },
  monthlyBookings: {
    name: 'Bookings Per Month',
    free: '25 bookings/month',
    premium: 'Unlimited',
    rationale: '~6 bookings per week shows the system works but creates clear upgrade pressure as business grows.',
  },
  bookingHistory: {
    name: 'Booking History Access',
    free: 'Last 3 months only',
    premium: 'Unlimited history',
    rationale: '3 months is enough for immediate needs, but businesses need historical data for tax, disputes, trends, year-over-year analysis.',
  },
  dataExports: {
    name: 'Data Export',
    free: 'Cannot export to Excel/CSV',
    premium: 'Full export capabilities',
    rationale: 'Serious businesses need data portability for accounting, reporting.',
  },
  photos: {
    name: 'Photos/Attachments',
    free: '0 photos per item',
    premium: '5 photos per item',
    rationale: 'Visual inventory is crucial for professional operations. This is a strong upgrade motivator.',
  },
  notifications: {
    name: 'SMS/Email Notifications',
    free: 'Manual only (no automated reminders)',
    premium: 'Automated booking confirmations, reminders, payment due notices',
    rationale: 'Automation saves huge time and appears professional.',
  },
  publicPage: {
    name: 'Public Booking Page',
    free: 'Not available',
    premium: 'Available',
    rationale: 'Allows customers to book directly online, reducing manual work.',
  },
  teamCollaboration: {
    name: 'Team Collaboration',
    free: '1 user account only',
    premium: 'Up to 5 staff/team member accounts',
    rationale: 'Growing businesses need multiple people accessing the system.',
  },
  support: {
    name: 'Customer Support',
    free: 'Email support only',
    premium: 'Priority email support (24 hour response) + WhatsApp support',
    rationale: 'In Nigeria, WhatsApp support is highly valued.',
  },
  wholesaleSuppliers: {
    name: 'Wholesale Supplier Connection',
    free: 'Not available',
    premium: 'Connect with wholesale suppliers for rental materials',
    rationale: 'Access to wholesale suppliers (chairs, tables, carpets, etc.) at cheaper prices helps grow your rental business.',
  },
};

/**
 * Helper to get user's plan type from subscription
 */
export function getUserPlanType(subscription: { status: string } | null): PlanType {
  if (!subscription) {
    return 'free';
  }

  // Check if subscription is active or trialing
  const isActive = ['active', 'trialing'].includes(subscription.status);
  return isActive ? 'premium' : 'free';
}

/**
 * Helper to check if a user has access to a specific feature
 */
export function hasFeatureAccess(planType: PlanType, feature: keyof PlanLimits): boolean {
  const limits = PLAN_LIMITS[planType];
  const featureValue = limits[feature];

  // For boolean features, return directly
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }

  // For numeric features, check if it's greater than 0
  if (typeof featureValue === 'number') {
    return featureValue > 0;
  }

  return true;
}

/**
 * Helper to get the limit value for a specific feature
 */
export function getFeatureLimit(planType: PlanType, feature: keyof PlanLimits): number | boolean | null {
  return PLAN_LIMITS[planType][feature] as number | boolean | null;
}
