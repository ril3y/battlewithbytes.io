/**
 * Standard Colors for Electrical Components
 *
 * Industry-standard color codes for fuses, wire gauges, and other electrical components.
 */

/**
 * Standard automotive fuse colors by amperage rating.
 * Based on SAE J1284 / ISO 8820 standards.
 */
export const STANDARD_FUSE_COLORS: Record<number, { color: string; name: string }> = {
  1: { color: '#000000', name: 'Black' },
  2: { color: '#808080', name: 'Gray' },
  3: { color: '#9400D3', name: 'Violet' },
  5: { color: '#c4a77d', name: 'Tan' },
  7.5: { color: '#8B4513', name: 'Brown' },
  10: { color: '#e74c3c', name: 'Red' },
  15: { color: '#3498db', name: 'Blue' },
  20: { color: '#f1c40f', name: 'Yellow' },
  25: { color: '#ecf0f1', name: 'Clear/Natural' },
  30: { color: '#2ecc71', name: 'Green' },
  35: { color: '#9b59b6', name: 'Purple' },
  40: { color: '#e67e22', name: 'Orange' },
  50: { color: '#e74c3c', name: 'Red (Large)' },
  60: { color: '#f1c40f', name: 'Yellow (Large)' },
  70: { color: '#795548', name: 'Brown (Large)' },
  80: { color: '#ecf0f1', name: 'White' },
  100: { color: '#9b59b6', name: 'Purple (Maxi)' },
  120: { color: '#e67e22', name: 'Orange (Maxi)' },
};

/**
 * Get the standard color for a fuse rating.
 *
 * @param rating - Fuse amperage rating
 * @returns Hex color string
 */
export function getFuseColor(rating: number): string {
  return STANDARD_FUSE_COLORS[rating]?.color || '#888888';
}

/**
 * Get the color name for a fuse rating.
 *
 * @param rating - Fuse amperage rating
 * @returns Color name string
 */
export function getFuseColorName(rating: number): string {
  return STANDARD_FUSE_COLORS[rating]?.name || 'Unknown';
}

/**
 * Standard wire gauge colors (SAE J1128).
 */
export const WIRE_GAUGE_COLORS: Record<number, { color: string; name: string }> = {
  22: { color: '#808080', name: 'Gray' },
  20: { color: '#000080', name: 'Blue' },
  18: { color: '#008000', name: 'Green' },
  16: { color: '#800000', name: 'Brown' },
  14: { color: '#808000', name: 'Olive' },
  12: { color: '#FFD700', name: 'Yellow' },
  10: { color: '#FFA500', name: 'Orange' },
  8: { color: '#FF0000', name: 'Red' },
  6: { color: '#800080', name: 'Purple' },
  4: { color: '#000000', name: 'Black' },
  2: { color: '#C0C0C0', name: 'Silver' },
  0: { color: '#FFFFFF', name: 'White' },
};

/**
 * Common wire function colors.
 */
export const WIRE_FUNCTION_COLORS = {
  power: '#e74c3c',        // Red - positive power
  ground: '#000000',       // Black - ground
  ignition: '#f39c12',     // Orange - ignition switched
  accessory: '#f1c40f',    // Yellow - accessory
  signal: '#3498db',       // Blue - signal
  data: '#2ecc71',         // Green - data/CAN
  neutral: '#ecf0f1',      // White - neutral/return
} as const;
