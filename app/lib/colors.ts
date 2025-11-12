// Color palette for bookings
const BOOKING_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#ef4444', // red
  '#84cc16', // lime
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
  '#f43f5e', // rose
  '#22c55e', // green
  '#eab308', // yellow
  '#0ea5e9', // sky
];

/**
 * Get a random color from the palette
 */
export function getRandomBookingColor(): string {
  return BOOKING_COLORS[Math.floor(Math.random() * BOOKING_COLORS.length)];
}

/**
 * Get color for booking status (fallback if no custom color set)
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'OUT':
      return '#ef4444'; // red
    case 'RETURNED':
      return '#10b981'; // green
    case 'CANCELLED':
      return '#6b7280'; // gray
    case 'DRAFT':
      return '#f59e0b'; // amber
    default: // CONFIRMED
      return '#3b82f6'; // blue
  }
}
