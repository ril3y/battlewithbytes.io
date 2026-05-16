/**
 * Ground Symbol SVG Generator
 *
 * Generates SVG markup for electrical ground symbols:
 * - Earth ground (standard 3-line symbol)
 * - Chassis ground (chassis frame symbol)
 * - Signal ground (triangle symbol)
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface GroundSymbolConfig {
  variant?: 'earth' | 'chassis' | 'signal';
  color?: string;
  showLabel?: boolean;
  labelText?: string;
}

const DEFAULT_CONFIG: Required<GroundSymbolConfig> = {
  variant: 'earth',
  color: '#333333',
  showLabel: false,
  labelText: 'GND',
};

const WIDTH = 40;
const HEIGHT = 50;

export function getDimensions(config: GroundSymbolConfig = {}): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: GroundSymbolConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const centerX = WIDTH / 2;
  const strokeWidth = 2.5;

  let groundSymbol = '';

  switch (c.variant) {
    case 'earth':
      // Standard earth ground: 3 horizontal lines decreasing in width
      groundSymbol = `
        <!-- Vertical stem -->
        <line x1="${centerX}" y1="0" x2="${centerX}" y2="20"
              stroke="${c.color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        <!-- Top line (widest) -->
        <line x1="5" y1="20" x2="35" y2="20"
              stroke="${c.color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        <!-- Middle line -->
        <line x1="10" y1="28" x2="30" y2="28"
              stroke="${c.color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        <!-- Bottom line (narrowest) -->
        <line x1="15" y1="36" x2="25" y2="36"
              stroke="${c.color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
      `;
      break;

    case 'chassis':
      // Chassis ground: frame-like symbol
      groundSymbol = `
        <!-- Vertical stem -->
        <line x1="${centerX}" y1="0" x2="${centerX}" y2="18"
              stroke="${c.color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        <!-- Chassis frame -->
        <path d="M 8 18 L 8 38 L 32 38 L 32 18 Z"
              fill="none" stroke="${c.color}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
        <!-- Diagonal lines inside frame -->
        <line x1="8" y1="38" x2="20" y2="26" stroke="${c.color}" stroke-width="1.5"/>
        <line x1="20" y1="38" x2="32" y2="26" stroke="${c.color}" stroke-width="1.5"/>
      `;
      break;

    case 'signal':
      // Signal ground: downward triangle
      groundSymbol = `
        <!-- Vertical stem -->
        <line x1="${centerX}" y1="0" x2="${centerX}" y2="15"
              stroke="${c.color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        <!-- Triangle -->
        <path d="M 8 15 L ${centerX} 38 L 32 15 Z"
              fill="none" stroke="${c.color}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
      `;
      break;
  }

  // Optional label
  const label = c.showLabel ? `
    <text x="${centerX}" y="48" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="${c.color}">
      ${c.labelText}
    </text>
  ` : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      ${groundSymbol}
      ${label}
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'gnd',
      label: 'GND',
      x: centerX,
      y: 0,
      type: 'ground',
      color: c.color,
      shape: 'circle',
      radius: 5,
      description: 'Ground connection point',
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
