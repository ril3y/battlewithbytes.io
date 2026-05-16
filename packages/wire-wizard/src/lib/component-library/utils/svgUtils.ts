/**
 * SVG Utilities for Component Generation
 *
 * Shared SVG building blocks and patterns used by component generators.
 * These utilities help create consistent, professional-looking components.
 */

import { lightenColor, darkenColor, withAlpha } from './colorUtils';

// ============================================================================
// Gradient Generators
// ============================================================================

/**
 * Generate a metallic linear gradient definition.
 * Creates a realistic metal appearance with highlights and shadows.
 *
 * @param id - Unique gradient ID
 * @param baseColor - Base metal color
 * @param direction - Gradient direction ('vertical' | 'horizontal')
 * @returns SVG linearGradient element string
 */
export function metallicGradient(
  id: string,
  baseColor: string,
  direction: 'vertical' | 'horizontal' = 'vertical'
): string {
  const highlight = lightenColor(baseColor, 35);
  const midLight = lightenColor(baseColor, 15);
  const midDark = darkenColor(baseColor, 15);
  const shadow = darkenColor(baseColor, 25);

  const coords = direction === 'vertical'
    ? 'x1="0%" y1="0%" x2="0%" y2="100%"'
    : 'x1="0%" y1="0%" x2="100%" y2="0%"';

  return `
    <linearGradient id="${id}" ${coords}>
      <stop offset="0%" style="stop-color:${highlight};stop-opacity:1" />
      <stop offset="15%" style="stop-color:${midLight};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${baseColor};stop-opacity:1" />
      <stop offset="85%" style="stop-color:${midDark};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${shadow};stop-opacity:1" />
    </linearGradient>`;
}

/**
 * Generate a radial gradient for screw heads.
 *
 * @param id - Unique gradient ID
 * @param baseColor - Base screw color (default steel)
 * @returns SVG radialGradient element string
 */
export function screwHeadGradient(id: string, baseColor: string = '#c8c8c8'): string {
  return `
    <radialGradient id="${id}">
      <stop offset="0%" style="stop-color:${lightenColor(baseColor, 20)};stop-opacity:1" />
      <stop offset="40%" style="stop-color:${baseColor};stop-opacity:1" />
      <stop offset="70%" style="stop-color:${darkenColor(baseColor, 20)};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${darkenColor(baseColor, 40)};stop-opacity:1" />
    </radialGradient>`;
}

/**
 * Generate an edge/border gradient for 3D appearance.
 *
 * @param id - Unique gradient ID
 * @param baseColor - Base color
 * @returns SVG linearGradient element string
 */
export function edgeGradient(id: string, baseColor: string): string {
  const shadow = darkenColor(baseColor, 35);
  const edge = darkenColor(baseColor, 45);

  return `
    <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${shadow};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${edge};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${shadow};stop-opacity:1" />
    </linearGradient>`;
}

/**
 * Generate a highlight gradient for top surfaces.
 *
 * @param id - Unique gradient ID
 * @param baseColor - Base color for fade
 * @returns SVG linearGradient element string
 */
export function highlightGradient(id: string, baseColor: string): string {
  return `
    <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${lightenColor(baseColor, 35)};stop-opacity:0" />
    </linearGradient>`;
}

/**
 * Generate a countersink gradient for mounting holes.
 *
 * @param id - Unique gradient ID
 * @param shadowColor - Shadow color around hole
 * @returns SVG radialGradient element string
 */
export function countersinkGradient(id: string, shadowColor: string): string {
  const edge = darkenColor(shadowColor, 10);

  return `
    <radialGradient id="${id}">
      <stop offset="0%" style="stop-color:${shadowColor};stop-opacity:0" />
      <stop offset="70%" style="stop-color:${shadowColor};stop-opacity:0.5" />
      <stop offset="100%" style="stop-color:${edge};stop-opacity:0.8" />
    </radialGradient>`;
}

// ============================================================================
// Shape Generators
// ============================================================================

/**
 * Generate a realistic Phillips head screw.
 *
 * @param x - Center X position
 * @param y - Center Y position
 * @param radius - Screw head radius
 * @param id - Optional unique ID
 * @returns SVG group element string
 */
export function phillipsScrew(
  x: number,
  y: number,
  radius: number = 4.5,
  id?: string
): string {
  const recessRadius = radius * 0.55;
  const crossLength = radius * 0.9;
  const crossWidth = 1.2;
  const groupId = id ? ` id="${id}"` : '';

  return `
  <g${groupId}>
    <!-- Outer head with metallic gradient -->
    <circle cx="${x}" cy="${y}" r="${radius}" fill="url(#screw-head-gradient)" stroke="#656565" stroke-width="0.8" />
    <!-- Inner recess shadow -->
    <circle cx="${x}" cy="${y}" r="${recessRadius}" fill="url(#screw-recess-gradient)" />
    <!-- Phillips cross - vertical -->
    <line x1="${x}" y1="${y - crossLength / 2}" x2="${x}" y2="${y + crossLength / 2}"
          stroke="#3a3a3a" stroke-width="${crossWidth}" stroke-linecap="round" />
    <!-- Phillips cross - horizontal -->
    <line x1="${x - crossLength / 2}" y1="${y}" x2="${x + crossLength / 2}" y2="${y}"
          stroke="#3a3a3a" stroke-width="${crossWidth}" stroke-linecap="round" />
  </g>`;
}

/**
 * Generate a mounting hole with countersink appearance.
 *
 * @param x - Center X position
 * @param y - Center Y position
 * @param radius - Hole radius
 * @returns SVG group element string
 */
export function mountingHole(x: number, y: number, radius: number = 5): string {
  return `
  <g>
    <circle cx="${x}" cy="${y}" r="${radius + 2}" fill="url(#countersink-gradient)" opacity="0.5" />
    <circle cx="${x}" cy="${y}" r="${radius}" fill="#2a2a2a" stroke="#1a1a1a" stroke-width="1" />
    <circle cx="${x}" cy="${y}" r="${radius - 2}" fill="#1a1a1a" />
  </g>`;
}

/**
 * Generate a hex bolt head (side view).
 *
 * @param x - Top-left X position
 * @param y - Top-left Y position
 * @param width - Bolt head width
 * @param height - Bolt head height
 * @param color - Bolt color
 * @returns SVG group element string
 */
export function hexBoltSideView(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): string {
  const washerH = 3;
  const washerW = width + 4;
  const washerX = x - 2;
  const washerY = y + height - washerH;
  const headH = height - washerH - 2;

  return `
  <g>
    <!-- Washer -->
    <rect x="${washerX}" y="${washerY}" width="${washerW}" height="${washerH}" rx="1"
          fill="${lightenColor(color, 10)}" stroke="${darkenColor(color, 30)}" stroke-width="0.5"/>
    <rect x="${washerX}" y="${washerY}" width="${washerW}" height="${washerH / 2}"
          fill="${withAlpha('#ffffff', 0.4)}"/>

    <!-- Bolt Stem -->
    <rect x="${x + width / 2 - 4}" y="${y + headH}" width="8" height="3"
          fill="${darkenColor(color, 10)}"/>

    <!-- Bolt Head Main Body -->
    <rect x="${x}" y="${y}" width="${width}" height="${headH}"
          fill="url(#stud-gradient)" stroke="${darkenColor(color, 30)}" stroke-width="0.5"/>

    <!-- Facet lines (implies hex shape) -->
    <line x1="${x + width / 4}" y1="${y}" x2="${x + width / 4}" y2="${y + headH}"
          stroke="${withAlpha('#000000', 0.1)}" stroke-width="1"/>
    <line x1="${x + width * 3 / 4}" y1="${y}" x2="${x + width * 3 / 4}" y2="${y + headH}"
          stroke="${withAlpha('#000000', 0.1)}" stroke-width="1"/>

    <!-- Top Highlight -->
    <rect x="${x + 1}" y="${y + 1}" width="${width - 2}" height="${headH / 3}"
          fill="${withAlpha('#ffffff', 0.5)}"/>

    <!-- Top Surface (Ellipse) -->
    <ellipse cx="${x + width / 2}" cy="${y}" rx="${width / 2}" ry="${width / 6}"
             fill="${lightenColor(color, 20)}" stroke="${darkenColor(color, 30)}" stroke-width="0.5"/>
  </g>`;
}

/**
 * Generate a brass/copper terminal block.
 *
 * @param x - Top-left X position
 * @param y - Top-left Y position
 * @param width - Block width
 * @param height - Block height
 * @param color - Block color
 * @returns SVG group element string
 */
export function terminalBlock(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): string {
  return `
  <g>
    <!-- Deep shadow -->
    <rect x="${x + 2}" y="${y + 2}" width="${width}" height="${height}" rx="1"
          fill="${withAlpha('#000000', 0.4)}"/>
    <!-- Main body -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="1"
          fill="url(#block-gradient)" stroke="${darkenColor(color, 40)}" stroke-width="1"/>
    <!-- Top highlight edge -->
    <line x1="${x + 1}" y1="${y + 1}" x2="${x + width - 1}" y2="${y + 1}"
          stroke="${withAlpha('#ffffff', 0.6)}" stroke-width="1"/>
    <!-- Side highlight -->
    <line x1="${x + 1}" y1="${y + 1}" x2="${x + 1}" y2="${y + height - 1}"
          stroke="${withAlpha('#ffffff', 0.4)}" stroke-width="1"/>
  </g>`;
}

/**
 * Generate resistive strips (for shunt resistors).
 *
 * @param x - Starting X position
 * @param y - Starting Y position
 * @param width - Strip width
 * @param height - Total height for all strips
 * @param count - Number of strips
 * @returns SVG group element string
 */
export function resistiveStrips(
  x: number,
  y: number,
  width: number,
  height: number,
  count: number = 5
): string {
  let strips = '';
  const stripH = height / count;

  for (let i = 0; i < count; i++) {
    const sy = y + i * stripH;
    strips += `
      <rect x="${x}" y="${sy + 1}" width="${width}" height="${stripH - 2}" fill="url(#strip-gradient)"/>
      <rect x="${x}" y="${sy + 2}" width="${width}" height="${(stripH - 2) / 2}" fill="${withAlpha('#ffffff', 0.3)}"/>`;
  }

  return `<g>${strips}</g>`;
}

// ============================================================================
// Common Definitions
// ============================================================================

/**
 * Standard screw head gradients used across components.
 * Include these in your defs section when using phillipsScrew().
 */
export function screwGradientDefs(): string {
  return `
    <!-- Screw head metallic gradient (radial) -->
    <radialGradient id="screw-head-gradient">
      <stop offset="0%" style="stop-color:#e8e8e8;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#c8c8c8;stop-opacity:1" />
      <stop offset="70%" style="stop-color:#a0a0a0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#707070;stop-opacity:1" />
    </radialGradient>
    <!-- Screw recess shadow -->
    <radialGradient id="screw-recess-gradient">
      <stop offset="0%" style="stop-color:#505050;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#808080;stop-opacity:1" />
    </radialGradient>`;
}

/**
 * Standard resistive strip gradient.
 * Include in defs when using resistiveStrips().
 */
export function stripGradientDefs(): string {
  return `
    <!-- Resistive strip gradient -->
    <linearGradient id="strip-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#999"/>
      <stop offset="50%" style="stop-color:#777"/>
      <stop offset="100%" style="stop-color:#666"/>
    </linearGradient>`;
}

/**
 * Generate common block/terminal gradients for a given color.
 *
 * @param color - Base terminal color
 * @returns SVG defs string with block-gradient, stud-gradient, etc.
 */
export function terminalGradientDefs(color: string): string {
  const highlight = lightenColor(color, 30);
  const shadow = darkenColor(color, 25);

  return `
    <!-- Terminal block gradient -->
    <linearGradient id="block-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${highlight}"/>
      <stop offset="30%" style="stop-color:${color}"/>
      <stop offset="70%" style="stop-color:${darkenColor(color, 15)}"/>
      <stop offset="100%" style="stop-color:${shadow}"/>
    </linearGradient>

    <!-- Hex stud gradient -->
    <linearGradient id="stud-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${lightenColor(color, 35)}"/>
      <stop offset="25%" style="stop-color:${highlight}"/>
      <stop offset="50%" style="stop-color:${color}"/>
      <stop offset="75%" style="stop-color:${darkenColor(color, 20)}"/>
      <stop offset="100%" style="stop-color:${shadow}"/>
    </linearGradient>`;
}

// ============================================================================
// SVG Wrapper Utilities
// ============================================================================

/**
 * Wrap content in a complete SVG element.
 *
 * @param content - SVG content (without outer svg tags)
 * @param width - ViewBox width
 * @param height - ViewBox height
 * @param defs - Optional defs content
 * @returns Complete SVG string
 */
export function wrapSvg(
  content: string,
  width: number,
  height: number,
  defs?: string
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${defs ? `<defs>${defs}</defs>` : ''}
  ${content}
</svg>`;
}

/**
 * Create a text label with standard styling.
 *
 * @param x - X position
 * @param y - Y position
 * @param text - Label text
 * @param options - Styling options
 * @returns SVG text element string
 */
export function textLabel(
  x: number,
  y: number,
  text: string,
  options: {
    anchor?: 'start' | 'middle' | 'end';
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    bold?: boolean;
  } = {}
): string {
  const {
    anchor = 'middle',
    fontSize = 10,
    fontFamily = 'monospace',
    fill = '#888',
    bold = false,
  } = options;

  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${fontFamily}"
          font-size="${fontSize}"${bold ? ' font-weight="bold"' : ''} fill="${fill}">${text}</text>`;
}
