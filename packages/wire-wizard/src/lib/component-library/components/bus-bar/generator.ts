/**
 * Bus Bar SVG Generator
 *
 * Generates photorealistic SVG markup for configurable bus bars.
 * Creates a detailed top-down technical view of a power distribution bus bar
 * with metallic appearance, realistic screw terminals, and proper labeling.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import {
  lightenColor,
  darkenColor,
} from '../../utils/colorUtils';
import {
  metallicGradient,
  edgeGradient,
  highlightGradient,
  countersinkGradient,
  screwGradientDefs,
  phillipsScrew,
  wrapSvg,
  textLabel,
} from '../../utils/svgUtils';

export interface BusBarConfig {
  id?: string; // Block ID for scoping SVG definitions
  numberOfLugs?: number;
  screwsPerLug?: number;
  barColor?: string;
  color?: string; // Standard block color property
  lugSpacing?: number;
}

const DEFAULT_CONFIG: Required<BusBarConfig> = {
  id: '',
  numberOfLugs: 4,
  screwsPerLug: 2,
  barColor: '#c0c0c0',
  color: '#c0c0c0',
  lugSpacing: 50,
};

/**
 * Calculate bus bar dimensions for a given configuration
 */
export function getDimensions(config: BusBarConfig = {}): { width: number; height: number } {
  const { numberOfLugs, lugSpacing } = { ...DEFAULT_CONFIG, ...config };
  const marginLeft = 25;
  const marginRight = 25;
  const width = marginLeft + marginRight + (numberOfLugs * lugSpacing);
  const height = 90;
  return { width, height };
}

/**
 * Generate the bus bar component
 */
export function generate(config: BusBarConfig = {}): GeneratorResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  // Prioritize barColor from component config if available (Component Modal), then block color (Sidebar), then default
  const barColor = config.barColor || config.color || DEFAULT_CONFIG.barColor;
  const { numberOfLugs, screwsPerLug, lugSpacing } = mergedConfig;
  const suffix = config.id ? `-${config.id}` : '';

  // Validate inputs
  if (numberOfLugs < 2 || numberOfLugs > 12) {
    throw new Error('Number of lugs must be between 2 and 12');
  }
  if (screwsPerLug < 1 || screwsPerLug > 3) {
    throw new Error('Screws per lug must be between 1 and 3');
  }

  // Calculate dimensions
  const { width, height } = getDimensions(mergedConfig);
  const marginLeft = 25;
  const marginRight = 25;
  const barBodyHeight = 36;
  const barBodyY = 22;

  // Lug dimensions
  const lugWidth = screwsPerLug === 3 ? 32 : 26;
  const lugHeight = 28;
  const screwRadius = 4.5;
  const mountingHoleRadius = 5;
  const mountingHoleY = barBodyY + barBodyHeight / 2;

  // Build definitions
  const defs = generateDefs(barColor, suffix);

  // Build content
  let content = '';

  // Main bus bar body
  content += `
  <rect x="${marginLeft - 5}" y="${barBodyY}"
        width="${width - marginLeft - marginRight + 10}" height="${barBodyHeight}"
        fill="url(#bar-metal-gradient${suffix})" stroke="url(#bar-edge-gradient${suffix})"
        stroke-width="1.5" rx="3" />
  <rect x="${marginLeft - 4}" y="${barBodyY + 1}"
        width="${width - marginLeft - marginRight + 8}" height="6"
        fill="url(#bar-highlight${suffix})" rx="2" opacity="0.6" />`;

  // Mounting holes (using shared countersink gradient if possible, or scoped)
  // mountingHole utility uses a specific ID "countersink-gradient".
  // To scope it, I'd need to update mountingHole utility or manually inline it.
  // For now, let's assume countersink is generic gray/black and shared is OK if colors match.
  // But generateDefs creates countersink based on barColor!
  // So I should scope it. But mountingHole func doesn't accept ID.
  // I will manually recreate mounting holes or ignore scoping for them if they are small/dark enough.
  // Actually, countersink is derived from barColor.
  // I'll manually implement mounting hole to use scoped ID.

  const mHole = (x: number, y: number) => `
  <g>
    <circle cx="${x}" cy="${y}" r="${mountingHoleRadius + 2}" fill="url(#countersink-gradient${suffix})" opacity="0.5" />
    <circle cx="${x}" cy="${y}" r="${mountingHoleRadius}" fill="#2a2a2a" stroke="#1a1a1a" stroke-width="1" />
    <circle cx="${x}" cy="${y}" r="${mountingHoleRadius - 2}" fill="#1a1a1a" />
  </g>`;

  content += mHole(marginLeft - 10, mountingHoleY);
  content += mHole(width - marginRight + 10, mountingHoleY);

  // Draw lugs with screw terminals
  const lugStartX = marginLeft + lugSpacing / 2;
  const lugCenterY = barBodyY + barBodyHeight / 2;

  for (let i = 0; i < numberOfLugs; i++) {
    const lugX = lugStartX + i * lugSpacing;
    const lugNumber = i + 1;

    // Lug base
    content += `
    <rect x="${lugX - lugWidth / 2}" y="${lugCenterY - lugHeight / 2}"
          width="${lugWidth}" height="${lugHeight}"
          fill="url(#lug-gradient${suffix})" stroke="url(#lug-edge-gradient${suffix})"
          stroke-width="1" rx="2" />
    <rect x="${lugX - lugWidth / 2 + 1}" y="${lugCenterY - lugHeight / 2 + 1}"
          width="${lugWidth - 2}" height="4"
          fill="url(#lug-highlight${suffix})" rx="1" opacity="0.5" />`;

    // Screw terminals
    content += drawScrews(lugX, lugCenterY, lugNumber, screwsPerLug, screwRadius);

    // Lug number label
    content += textLabel(lugX, barBodyY + barBodyHeight + 16, String(lugNumber), {
      fontSize: 10,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fill: '#2c3e50',
      bold: true,
    });
  }

  // Generate connection points
  const connectionPoints = generateConnectionPoints(numberOfLugs, lugStartX, lugSpacing, lugCenterY, barColor);

  return {
    svg: wrapSvg(content, width, height, defs),
    dimensions: { width, height },
    connectionPoints,
  };
}

/**
 * Generate gradient definitions
 */
function generateDefs(barColor: string, suffix: string): string {
  const lugBaseColor = darkenColor(barColor, 8);
  const lugHighlight = lightenColor(lugBaseColor, 25);
  const lugShadow = darkenColor(lugBaseColor, 20);

  return `
    ${metallicGradient(`bar-metal-gradient${suffix}`, barColor, 'vertical')}
    ${edgeGradient(`bar-edge-gradient${suffix}`, barColor)}
    ${highlightGradient(`bar-highlight${suffix}`, barColor)}
    ${countersinkGradient(`countersink-gradient${suffix}`, darkenColor(barColor, 25))}
    ${screwGradientDefs()}

    <!-- Lug base gradient -->
    <linearGradient id="lug-gradient${suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${lugHighlight};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${lugBaseColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${lugShadow};stop-opacity:1" />
    </linearGradient>

    <!-- Lug edge gradient -->
    <linearGradient id="lug-edge-gradient${suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${lugShadow};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${darkenColor(lugBaseColor, 30)};stop-opacity:1" />
    </linearGradient>

    <!-- Lug bevel highlight -->
    <linearGradient id="lug-highlight${suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:${lugHighlight};stop-opacity:0" />
    </linearGradient>`;
}

/**
 * Draw screws for a single lug
 */
function drawScrews(
  lugX: number,
  lugY: number,
  lugNumber: number,
  screwsPerLug: number,
  screwRadius: number
): string {
  let screwSVG = '';

  if (screwsPerLug === 1) {
    screwSVG += phillipsScrew(lugX, lugY, screwRadius, `lug-${lugNumber}-screw-1`);
  } else if (screwsPerLug === 2) {
    const spacing = 7;
    screwSVG += phillipsScrew(lugX - spacing, lugY, screwRadius, `lug-${lugNumber}-screw-1`);
    screwSVG += phillipsScrew(lugX + spacing, lugY, screwRadius, `lug-${lugNumber}-screw-2`);
  } else if (screwsPerLug === 3) {
    const spacing = 9;
    screwSVG += phillipsScrew(lugX - spacing, lugY, screwRadius, `lug-${lugNumber}-screw-1`);
    screwSVG += phillipsScrew(lugX, lugY, screwRadius, `lug-${lugNumber}-screw-2`);
    screwSVG += phillipsScrew(lugX + spacing, lugY, screwRadius, `lug-${lugNumber}-screw-3`);
  }

  return screwSVG;
}

/**
 * Generate connection points for the bus bar
 */
function generateConnectionPoints(
  numberOfLugs: number,
  lugStartX: number,
  lugSpacing: number,
  lugCenterY: number,
  color: string
): ConnectionPointDefinition[] {
  const points: ConnectionPointDefinition[] = [];

  for (let i = 0; i < numberOfLugs; i++) {
    const lugX = lugStartX + i * lugSpacing;
    points.push({
      id: `lug-${i + 1}`,
      label: `Lug ${i + 1}`,
      x: lugX,
      y: lugCenterY,
      type: 'power',
      shape: 'circle',
      radius: 6,
      color: color,
    });
  }

  return points;
}

// Default export for auto-discovery
export default {
  generate,
  getDimensions,
};
