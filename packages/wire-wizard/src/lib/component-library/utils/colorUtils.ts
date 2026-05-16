/**
 * Color Utilities for SVG Generation
 *
 * Shared color manipulation functions used by component generators.
 * These functions are used to create realistic metallic gradients,
 * shadows, highlights, and other visual effects.
 */

/**
 * Lighten a hex color by a percentage.
 * Moves the color toward white.
 *
 * @param hex - Hex color string (with or without #)
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened hex color string with #
 *
 * @example
 * lightenColor('#c0c0c0', 30) // Returns '#d9d9d9'
 * lightenColor('d4a574', 25)  // Returns '#e0be9a'
 */
export function lightenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Lighten each component toward 255
  const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  // Convert back to hex
  return '#' +
    newR.toString(16).padStart(2, '0') +
    newG.toString(16).padStart(2, '0') +
    newB.toString(16).padStart(2, '0');
}

/**
 * Darken a hex color by a percentage.
 * Moves the color toward black.
 *
 * @param hex - Hex color string (with or without #)
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color string with #
 *
 * @example
 * darkenColor('#c0c0c0', 25) // Returns '#909090'
 * darkenColor('d4a574', 40)  // Returns '#7f6346'
 */
export function darkenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken each component toward 0
  const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
  const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
  const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));

  // Convert back to hex
  return '#' +
    newR.toString(16).padStart(2, '0') +
    newG.toString(16).padStart(2, '0') +
    newB.toString(16).padStart(2, '0');
}

/**
 * Parse a hex color string into RGB components.
 *
 * @param hex - Hex color string (with or without #)
 * @returns Object with r, g, b components (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

/**
 * Convert RGB components to hex color string.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Hex color string with #
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' +
    Math.round(r).toString(16).padStart(2, '0') +
    Math.round(g).toString(16).padStart(2, '0') +
    Math.round(b).toString(16).padStart(2, '0');
}

/**
 * Mix two colors together by a given ratio.
 *
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @param ratio - Mix ratio (0 = all color1, 1 = all color2)
 * @returns Mixed hex color string
 */
export function mixColors(color1: string, color2: string, ratio: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = rgb1.r + (rgb2.r - rgb1.r) * ratio;
  const g = rgb1.g + (rgb2.g - rgb1.g) * ratio;
  const b = rgb1.b + (rgb2.b - rgb1.b) * ratio;

  return rgbToHex(r, g, b);
}

/**
 * Create a color with adjusted alpha/opacity.
 *
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Standard metallic colors used in electrical components.
 */
export const METAL_COLORS = {
  /** Silver/aluminum appearance */
  silver: '#c0c0c0',
  /** Copper/brass appearance */
  copper: '#d4a574',
  /** Brass appearance */
  brass: '#d4a574',
  /** Gold plated appearance */
  gold: '#ffd700',
  /** Steel/chrome appearance */
  steel: '#888888',
  /** Dark gunmetal */
  gunmetal: '#2a3439',
} as const;

/**
 * Common insulation/plastic colors.
 */
export const INSULATION_COLORS = {
  /** Black plastic/rubber */
  black: '#1a1a1a',
  /** White plastic */
  white: '#f5f5f5',
  /** Red insulation */
  red: '#e74c3c',
  /** Blue insulation */
  blue: '#3498db',
  /** Yellow insulation */
  yellow: '#f1c40f',
  /** Green insulation */
  green: '#2ecc71',
} as const;
