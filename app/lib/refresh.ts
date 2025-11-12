/**
 * Cache refresh utilities for keeping data in sync across the app
 */

/**
 * Refresh all relevant data after a mutation
 * This ensures the calendar, lists, and drawers stay in sync
 */
export async function refreshAll() {
  // For now, we'll use router.refresh() approach
  // When SWR/React Query is added, this will batch mutate() calls

  if (typeof window !== "undefined") {
    // Client-side: trigger a full data refresh
    window.location.reload();
  }
}

/**
 * Generate cache keys for data fetching
 */
export const cacheKeys = {
  bookings: (start?: string, end?: string) =>
    start && end ? `bookings-${start}-${end}` : "bookings",
  dayData: (date: string) => `day-${date}`,
  items: () => "items",
  customers: () => "customers",
  settings: () => "settings",
};
