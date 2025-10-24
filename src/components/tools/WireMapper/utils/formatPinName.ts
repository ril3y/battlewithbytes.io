/**
 * Removes row/column indicators from pin names
 * Strips patterns like (r0c0), (r2c5), etc. from pin display names
 *
 * @param pinName - The raw pin name that may contain row/col indicators
 * @returns Cleaned pin name without row/col indicators
 *
 * @example
 * cleanPinName("Pin 1 (r0c0)") // Returns "Pin 1"
 * cleanPinName("GND (r3c0)") // Returns "GND"
 * cleanPinName("VCC") // Returns "VCC"
 */
export function cleanPinName(pinName: string): string {
  if (!pinName) return pinName;

  // Remove patterns like (r0c0), (r2c5), etc.
  return pinName.replace(/\s*\(r\d+c\d+\)\s*$/i, '').trim();
}
