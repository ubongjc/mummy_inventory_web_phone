/**
 * Calculate appropriate text color (black or white) based on background color
 * Uses relative luminance calculation for accessibility
 */

/**
 * Calculate relative luminance of a color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 */
function getLuminance(r: number, g: number, b: number): number {
  // Convert to 0-1 range
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse hex color to RGB
 * @param hex - Hex color string (e.g., "#3b82f6" or "3b82f6")
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, "");

  if (cleanHex.length !== 6) {
    return null;
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Determine if white or black text should be used on a given background color
 * @param bgHex - Background color in hex format (e.g., "#3b82f6")
 * @returns "#ffffff" for white text or "#000000" for black text
 */
export function textColorFor(bgHex: string): string {
  const rgb = hexToRgb(bgHex);

  if (!rgb) {
    // Default to white if we can't parse the color
    return "#ffffff";
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  // Use white text on dark backgrounds (luminance < 0.5)
  // Use black text on light backgrounds (luminance >= 0.5)
  return luminance >= 0.5 ? "#000000" : "#ffffff";
}
