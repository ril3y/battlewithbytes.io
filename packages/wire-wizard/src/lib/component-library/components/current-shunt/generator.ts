/**
 * Current Shunt Resistor SVG Generator
 *
 * Generates photorealistic SVG markup for configurable current shunt resistors.
 * Creates a front-view showing two brass terminal blocks with hex studs on top
 * for high current connections and sense connections on the block faces,
 * connected by metallic resistive strips.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import {
  lightenColor,
  darkenColor,
} from '../../utils/colorUtils';
import {
  terminalGradientDefs,
  stripGradientDefs,
  terminalBlock,
  resistiveStrips,
  hexBoltSideView,
  wrapSvg,
  textLabel,
} from '../../utils/svgUtils';

export interface ShuntConfig {
  resistance?: number;
  currentRating?: number;
  blockColor?: string;
  baseColor?: string;
  showLabels?: boolean;
}

const DEFAULT_CONFIG: Required<ShuntConfig> = {
  resistance: 75,
  currentRating: 100,
  blockColor: '#d4a574',
  baseColor: '#1a1a1a',
  showLabels: true,
};

// Fixed dimensions
const WIDTH = 160;
const HEIGHT = 100;

/**
 * Get shunt dimensions (fixed size)
 */
export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

/**
 * Generate the shunt resistor component
 */
export function generate(config: ShuntConfig = {}): GeneratorResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { resistance, currentRating, blockColor, baseColor, showLabels } = mergedConfig;

  // Build definitions
  const defs = generateDefs(blockColor, baseColor);

  // Build content
  let content = '';

  // Black insulating base
  content += `
  <g transform="translate(0, 70)">
    <rect x="5" y="0" width="150" height="25" rx="2" fill="url(#base-gradient)" stroke="#000" stroke-width="1"/>
    <!-- Mounting holes -->
    <circle cx="20" cy="12.5" r="3.5" fill="#111" stroke="#333" stroke-width="0.5"/>
    <circle cx="140" cy="12.5" r="3.5" fill="#111" stroke="#333" stroke-width="0.5"/>
    <rect x="70" y="5" width="20" height="15" rx="2" fill="#050505" stroke="#333" stroke-width="0.5"/>
  </g>`;

  // Terminal blocks (Left and Right)
  // Left Block: x=15, w=50. Center = 40.
  content += terminalBlock(15, 30, 50, 40, blockColor);
  // Right Block: x=95, w=50. Center = 120.
  content += terminalBlock(95, 30, 50, 40, blockColor);

  // Resistive strips connecting the blocks
  content += resistiveStrips(65, 40, 30, 20, 5);

  // Top bolts (side view)
  // Left Bolt centered at x=40, width=20
  content += hexBoltSideView(30, 12, 20, 18, blockColor);
  // Right Bolt centered at x=120, width=20
  content += hexBoltSideView(110, 12, 20, 18, blockColor);

  // Sense Screws (Visual only, Connection Point logic handles interaction)
  // Positioned at y=60 to match connection point
  // Left Sense Screw (Center x=40)
  content += `
    <g>
      <circle cx="40" cy="60" r="5" fill="none" stroke="${darkenColor(blockColor, 30)}" stroke-width="0.5"/>
      <circle cx="40" cy="60" r="3.5" fill="url(#stud-gradient)" stroke="${darkenColor(blockColor, 40)}" stroke-width="0.5"/>
      <line x1="37.5" y1="60" x2="42.5" y2="60" stroke="${darkenColor(blockColor, 50)}" stroke-width="1"/>
    </g>`;

  // Right Sense Screw (Center x=120)
  content += `
    <g>
      <circle cx="120" cy="60" r="5" fill="none" stroke="${darkenColor(blockColor, 30)}" stroke-width="0.5"/>
      <circle cx="120" cy="60" r="3.5" fill="url(#stud-gradient)" stroke="${darkenColor(blockColor, 40)}" stroke-width="0.5"/>
      <line x1="117.5" y1="60" x2="122.5" y2="60" stroke="${darkenColor(blockColor, 50)}" stroke-width="1"/>
    </g>`;

  // Labels on base
  if (showLabels) {
    content += textLabel(40, 86, `${currentRating}A`, {
      fontSize: 9,
      fill: 'rgba(255,255,255,0.9)',
      bold: true,
    });

    const dropText = (resistance === 50 || resistance === 75) ? `${resistance}mV` : `${resistance}mΩ`;
    content += textLabel(120, 86, dropText, {
      fontSize: 9,
      fill: 'rgba(255,255,255,0.9)',
      bold: true,
    });
  }

  // Connection points
  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'pwr-in',
      label: 'PWR+',
      x: 40,
      y: 20,
      type: 'power',
      shape: 'circle',
      radius: 8,
    },
    {
      id: 'pwr-out',
      label: 'PWR-',
      x: 120,
      y: 20,
      type: 'power',
      shape: 'circle',
      radius: 8,
    },
    {
      id: 'sense-pos',
      label: 'S+',
      x: 40,
      y: 60,
      type: 'sense',
      shape: 'circle',
      radius: 4,
    },
    {
      id: 'sense-neg',
      label: 'S-',
      x: 120,
      y: 60,
      type: 'sense',
      shape: 'circle',
      radius: 4,
    },
  ];

  return {
    svg: wrapSvg(content, WIDTH, HEIGHT, defs),
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

/**
 * Generate gradient definitions
 */
function generateDefs(blockColor: string, baseColor: string): string {
  return `
    ${terminalGradientDefs(blockColor)}
    ${stripGradientDefs()}

    <!-- Base gradient -->
    <linearGradient id="base-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${lightenColor(baseColor, 30)}"/>
      <stop offset="50%" style="stop-color:${baseColor}"/>
      <stop offset="100%" style="stop-color:${darkenColor(baseColor, 10)}"/>
    </linearGradient>

    <!-- Sense point gradient -->
    <radialGradient id="sense-gradient">
      <stop offset="0%" style="stop-color:${lightenColor(blockColor, 20)}"/>
      <stop offset="70%" style="stop-color:${blockColor}"/>
      <stop offset="100%" style="stop-color:${darkenColor(blockColor, 25)}"/>
    </radialGradient>`;
}

// Default export for auto-discovery
export default {
  generate,
  getDimensions,
};
