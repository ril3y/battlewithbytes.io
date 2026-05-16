/**
 * Shared SVG Utilities for Component Generators
 *
 * Common utilities to reduce boilerplate across SVG generator files.
 */

/**
 * Generate a unique ID for SVG element references (gradients, filters, etc.)
 * Ensures no conflicts when multiple instances of the same component exist.
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Wrap SVG content with proper SVG element and attributes
 */
export function wrapSvg(
  content: string,
  width: number,
  height: number,
  options?: { defs?: string; viewBox?: string }
): string {
  const viewBox = options?.viewBox ?? `0 0 ${width} ${height}`;
  const defs = options?.defs ? `<defs>${options.defs}</defs>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">
    ${defs}
    ${content}
  </svg>`;
}

/**
 * Create a linear gradient definition
 */
export function createLinearGradient(
  id: string,
  stops: Array<{ offset: string; color: string }>,
  options?: {
    x1?: string;
    y1?: string;
    x2?: string;
    y2?: string;
  }
): string {
  const { x1 = '0', y1 = '0', x2 = '0', y2 = '1' } = options ?? {};
  const stopElements = stops
    .map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`)
    .join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopElements}</linearGradient>`;
}

/**
 * Create a radial gradient definition
 */
export function createRadialGradient(
  id: string,
  stops: Array<{ offset: string; color: string }>,
  options?: {
    cx?: string;
    cy?: string;
    r?: string;
  }
): string {
  const { cx = '0.5', cy = '0.5', r = '0.5' } = options ?? {};
  const stopElements = stops
    .map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`)
    .join('');
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stopElements}</radialGradient>`;
}

/**
 * Create a metallic gradient (common for terminals, connectors, screws)
 */
export function metallicGradient(id: string, baseColor = '#c0c0c0'): string {
  return createLinearGradient(id, [
    { offset: '0%', color: lightenColor(baseColor, 30) },
    { offset: '50%', color: baseColor },
    { offset: '100%', color: darkenColor(baseColor, 30) },
  ]);
}

/**
 * Create a brass/copper terminal gradient
 */
export function brassGradient(id: string): string {
  return createLinearGradient(id, [
    { offset: '0%', color: '#e0d0b0' },
    { offset: '50%', color: '#d4a574' },
    { offset: '100%', color: '#a08060' },
  ]);
}

/**
 * Create a dark housing gradient (common for component bodies)
 */
export function housingGradient(id: string, baseColor = '#1a1a1a'): string {
  return createLinearGradient(id, [
    { offset: '0%', color: '#333' },
    { offset: '50%', color: baseColor },
    { offset: '100%', color: '#111' },
  ]);
}

/**
 * Create a text label with consistent styling
 */
export function textLabel(
  text: string,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    fontWeight?: string;
    fill?: string;
    anchor?: 'start' | 'middle' | 'end';
    fontFamily?: string;
  }
): string {
  const {
    fontSize = 10,
    fontWeight = 'bold',
    fill = '#888',
    anchor = 'middle',
    fontFamily = 'Arial, sans-serif',
  } = options ?? {};

  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}">${text}</text>`;
}

/**
 * Create a Phillips screw head (common on electrical components)
 */
export function phillipsScrew(
  cx: number,
  cy: number,
  radius: number,
  options?: { headColor?: string; slotColor?: string }
): string {
  const { headColor = '#888', slotColor = '#555' } = options ?? {};
  const slotLen = radius * 0.7;

  return `
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${headColor}" stroke="#666" stroke-width="0.5"/>
    <line x1="${cx - slotLen}" y1="${cy}" x2="${cx + slotLen}" y2="${cy}" stroke="${slotColor}" stroke-width="1"/>
    <line x1="${cx}" y1="${cy - slotLen}" x2="${cx}" y2="${cy + slotLen}" stroke="${slotColor}" stroke-width="1"/>
  `;
}

/**
 * Lighten a hex color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

/**
 * Darken a hex color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

/**
 * Add alpha transparency to a hex color
 */
export function withAlpha(hex: string, alpha: number): string {
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.replace('#', '#') + alphaHex;
}

/**
 * Create a glow filter effect (common for LEDs, indicators)
 */
export function glowFilter(id: string, color: string, stdDeviation = 3): string {
  return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${stdDeviation}" result="blur"/>
      <feFlood flood-color="${color}" flood-opacity="0.6"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
}

/**
 * Create a wire/cable element
 */
export function wirePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options?: {
    color?: string;
    strokeWidth?: number;
    insulation?: boolean;
    insulationColor?: string;
  }
): string {
  const {
    color = '#cc0000',
    strokeWidth = 3,
    insulation = true,
    insulationColor = color,
  } = options ?? {};

  if (insulation) {
    return `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${insulationColor}" stroke-width="${strokeWidth + 2}" stroke-linecap="round"/>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
    `;
  }
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
}
