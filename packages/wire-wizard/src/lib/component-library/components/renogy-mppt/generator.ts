/**
 * Renogy Rover MPPT Solar Charge Controller SVG Generator
 *
 * Generates SVG markup for a Renogy Rover MPPT charge controller.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface RenogyMPPTConfig {
  amperage?: number;
  bodyColor?: string;
  accentColor?: string;
}

const DEFAULT_CONFIG: Required<RenogyMPPTConfig> = {
  amperage: 10,
  bodyColor: '#d0d0d0',
  accentColor: '#00ccff',
};

const WIDTH = 180;
const HEIGHT = 180;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: RenogyMPPTConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };

  const uniqueId = Math.random().toString(36).substring(2, 9);

  // Generate heat sink fins
  let fins = '';
  for (let i = 0; i < 13; i++) {
    const y = i * 5;
    fins += `<rect x="0" y="${y}" width="120" height="2" fill="#888"/>`;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="body-gradient-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#b0b0b0"/>
          <stop offset="20%" stop-color="${c.bodyColor}"/>
          <stop offset="80%" stop-color="${c.bodyColor}"/>
          <stop offset="100%" stop-color="#b0b0b0"/>
        </linearGradient>
      </defs>

      <!-- Mounting Backplate -->
      <rect x="0" y="20" width="180" height="140" fill="#1a1a1a" rx="5"/>

      <!-- Terminals (Left Side - PV) -->
      <g transform="translate(5, 100)">
        <rect x="0" y="0" width="30" height="50" rx="3" fill="#111"/>
        <circle cx="15" cy="15" r="6" fill="#333" stroke="#555" stroke-width="2"/>
        <text x="15" y="19" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">+</text>
        <circle cx="15" cy="40" r="6" fill="#333" stroke="#555" stroke-width="2"/>
        <text x="15" y="44" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">-</text>
      </g>

      <!-- Terminals (Right Side - BATT) -->
      <g transform="translate(145, 100)">
        <rect x="0" y="0" width="30" height="50" rx="3" fill="#111"/>
        <circle cx="15" cy="15" r="6" fill="#333" stroke="#555" stroke-width="2"/>
        <text x="15" y="19" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">+</text>
        <circle cx="15" cy="40" r="6" fill="#333" stroke="#555" stroke-width="2"/>
        <text x="15" y="44" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">-</text>
      </g>

      <!-- Main Body -->
      <rect x="30" y="0" width="120" height="180" fill="url(#body-gradient-${uniqueId})" rx="5"/>

      <!-- Top Curved Design -->
      <path d="M30 10 H150 Q150 0 120 0 H60 Q30 0 30 10 Z" fill="#b0b0b0"/>
      <circle cx="50" cy="5" r="2" fill="#333"/>
      <circle cx="130" cy="5" r="2" fill="#333"/>

      <!-- Heat Sink Fins -->
      <g transform="translate(30, 110)">
        ${fins}
      </g>

      <!-- Face Plate -->
      <rect x="30" y="20" width="120" height="85" fill="#a0a0b0"/>

      <!-- Logo and Text -->
      <text x="90" y="45" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="12" fill="#fff">RENOGY</text>
      <text x="90" y="60" text-anchor="middle" font-family="Arial" font-size="10" fill="${c.accentColor}" letter-spacing="1">ROVER BOOST</text>
      <text x="90" y="75" text-anchor="middle" font-family="Arial" font-size="7" fill="#fff" opacity="0.8">${c.amperage}A SOLAR CHARGE CONTROLLER</text>

      <!-- Side labels -->
      <text x="20" y="95" text-anchor="middle" font-family="Arial" font-size="8" fill="#888">PV</text>
      <text x="160" y="95" text-anchor="middle" font-family="Arial" font-size="8" fill="#888">BATT</text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'pv-pos',
      label: 'PV+',
      x: 20,
      y: 115,
      type: 'power',
      shape: 'circle',
      radius: 6,
    },
    {
      id: 'pv-neg',
      label: 'PV-',
      x: 20,
      y: 140,
      type: 'ground',
      shape: 'circle',
      radius: 6,
    },
    {
      id: 'batt-pos',
      label: 'BATT+',
      x: 160,
      y: 115,
      type: 'power',
      shape: 'circle',
      radius: 6,
    },
    {
      id: 'batt-neg',
      label: 'BATT-',
      x: 160,
      y: 140,
      type: 'ground',
      shape: 'circle',
      radius: 6,
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
