/**
 * Daly Smart BMS SVG Generator
 *
 * Generates SVG markup for a Daly Smart BMS.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface DalyBMSConfig {
  cellCount?: number;
  currentRating?: number;
  bodyColor?: string;
}

const DEFAULT_CONFIG: Required<DalyBMSConfig> = {
  cellCount: 4,
  currentRating: 100,
  bodyColor: '#cc0000',
};

const WIDTH = 290;
const HEIGHT = 140;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: DalyBMSConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };

  const uniqueId = Math.random().toString(36).substring(2, 9);

  // Generate balance connector pins based on cell count
  const balancePins = Math.min(c.cellCount + 1, 8);
  let balancePinElements = '';
  for (let i = 0; i < balancePins; i++) {
    const y = 45 + i * 10;
    balancePinElements += `<rect x="12" y="${y}" width="6" height="4" fill="#333"/>`;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="dalyRed-${uniqueId}" x1="0" y1="0" x2="0" y2="140">
          <stop offset="0%" stop-color="#ff3333"/>
          <stop offset="100%" stop-color="${c.bodyColor}"/>
        </linearGradient>
      </defs>

      <!-- Main Body (Red) -->
      <rect x="20" y="20" width="200" height="100" fill="url(#dalyRed-${uniqueId})" rx="5" stroke="#900" stroke-width="2"/>

      <!-- Left Side Interface (Balance Connector) -->
      <rect x="10" y="40" width="10" height="${balancePins * 10 + 10}" fill="#ddd" stroke="#999" rx="1"/>
      ${balancePinElements}

      <!-- Right Side Cable Exit Points -->
      <!-- P- Cable Exit (Top Right) -->
      <path d="M 220 30 L 290 30" stroke="#000" stroke-width="8" stroke-linecap="round"/>
      <text x="215" y="35" text-anchor="end" font-family="Arial" font-weight="bold" font-size="14" fill="#fff">P-</text>

      <!-- B- Cable Exit (Bottom Right) -->
      <path d="M 220 110 L 290 110" stroke="#0000ff" stroke-width="8" stroke-linecap="round"/>
      <text x="215" y="115" text-anchor="end" font-family="Arial" font-weight="bold" font-size="14" fill="#fff">B-</text>

      <!-- Fan 1 -->
      <circle cx="80" cy="70" r="35" fill="#111" stroke="#333" stroke-width="2"/>
      <text x="80" y="70" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Arial" font-size="10" font-weight="bold">DALY</text>
      <text x="80" y="82" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Arial" font-size="8">BMS</text>

      <!-- Fan 2 -->
      <circle cx="160" cy="70" r="35" fill="#111" stroke="#333" stroke-width="2"/>
      <text x="160" y="65" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Arial" font-size="10" font-weight="bold">${c.cellCount}S</text>
      <text x="160" y="77" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Arial" font-size="8">${c.currentRating}A</text>

      <!-- Bottom Interface Ports Removed -->
      <!-- "KEY" Label at Top -->
      <rect x="110" y="22" width="20" height="8" fill="#900" stroke="#fff" stroke-width="0.5"/>
      <text x="120" y="28" text-anchor="middle" font-family="Arial" font-size="6" fill="#fff">KEY</text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'p-minus',
      label: 'P-',
      x: 290,
      y: 30,
      type: 'power',
      shape: 'circle',
      radius: 4,
    },
    {
      id: 'b-minus',
      label: 'B-',
      x: 290,
      y: 110,
      type: 'power',
      shape: 'circle',
      radius: 4,
    },
    {
      id: 'balance',
      label: 'BAL',
      x: 10,
      y: 70,
      type: 'data',
      shape: 'rectangle',
      radius: 4,
    }
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
