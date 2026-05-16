/**
 * LED Headlight SVG Generator
 *
 * Generates SVG markup for an LED headlight with halo ring.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface LEDHeadlightConfig {
  haloColor?: string;
  housingColor?: string;
  ledCount?: number;
}

const DEFAULT_CONFIG: Required<LEDHeadlightConfig> = {
  haloColor: '#ff7700',
  housingColor: '#2a2a2a',
  ledCount: 5,
};

const WIDTH = 120;
const HEIGHT = 80;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: LEDHeadlightConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };

  const uniqueId = Math.random().toString(36).substring(2, 9);

  // Generate LED modules
  const ledWidth = 5;
  const ledSpacing = 9;
  const startX = 60 - ((c.ledCount - 1) * ledSpacing) / 2;

  let ledModules = '';
  for (let i = 0; i < c.ledCount; i++) {
    const x = startX + i * ledSpacing - ledWidth / 2;
    ledModules += `
      <rect x="${x}" y="32" width="${ledWidth}" height="16" fill="#3a3a3a" stroke="#2a2a2a" stroke-width="0.5" rx="1"/>
      <rect x="${x + 1}" y="34" width="3" height="4" fill="#ffff88" opacity="0.4"/>
      <rect x="${x + 1}" y="40" width="3" height="4" fill="#ffff88" opacity="0.4"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="orange-glow-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ff9933"/>
          <stop offset="50%" stop-color="${c.haloColor}"/>
          <stop offset="100%" stop-color="#cc5500"/>
        </linearGradient>
        <linearGradient id="lens-gradient-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e8e8e8"/>
          <stop offset="50%" stop-color="#d0d0d0"/>
          <stop offset="100%" stop-color="#b8b8b8"/>
        </linearGradient>
        <linearGradient id="housing-gradient-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4a4a4a"/>
          <stop offset="100%" stop-color="${c.housingColor}"/>
        </linearGradient>
      </defs>

      <!-- Main housing -->
      <rect x="10" y="10" width="100" height="60" fill="url(#housing-gradient-${uniqueId})" stroke="#1a1a1a" stroke-width="2" rx="12"/>

      <!-- Orange LED halo ring -->
      <rect x="15" y="15" width="90" height="50" fill="none" stroke="url(#orange-glow-${uniqueId})" stroke-width="6" rx="10" opacity="0.9"/>

      <!-- Inner accent -->
      <rect x="18" y="18" width="84" height="44" fill="none" stroke="#ffaa44" stroke-width="2" rx="8" opacity="0.6"/>

      <!-- Clear lens center -->
      <ellipse cx="60" cy="40" rx="32" ry="18" fill="url(#lens-gradient-${uniqueId})" stroke="#999" stroke-width="1" opacity="0.8"/>

      <!-- LED array -->
      <g opacity="0.7">
        ${ledModules}
      </g>

      <!-- Wire 1: Blue (DRL) -->
      <line x1="30" y1="70" x2="30" y2="80" stroke="#0066cc" stroke-width="3" stroke-linecap="round"/>
      <circle cx="30" cy="80" r="2" fill="#0066cc"/>

      <!-- Wire 2: Red (Main) -->
      <line x1="50" y1="70" x2="50" y2="80" stroke="#cc0000" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="80" r="2" fill="#cc0000"/>

      <!-- Wire 3: Black (Ground) -->
      <line x1="70" y1="70" x2="70" y2="80" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="70" cy="80" r="2" fill="#1a1a1a"/>

      <!-- Wire 4: Green (Turn) -->
      <line x1="90" y1="70" x2="90" y2="80" stroke="#00aa00" stroke-width="3" stroke-linecap="round"/>
      <circle cx="90" cy="80" r="2" fill="#00aa00"/>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'drl',
      label: 'BLUE (DRL)',
      x: 30,
      y: 80,
      type: 'power',
      shape: 'circle',
      radius: 4,
      color: '#0066cc',
    },
    {
      id: 'main',
      label: 'RED (MAIN)',
      x: 50,
      y: 80,
      type: 'power',
      shape: 'circle',
      radius: 4,
      color: '#cc0000',
    },
    {
      id: 'ground',
      label: 'BLACK (GND)',
      x: 70,
      y: 80,
      type: 'ground',
      shape: 'circle',
      radius: 4,
      color: '#000000',
    },
    {
      id: 'turn',
      label: 'GREEN (TURN)',
      x: 90,
      y: 80,
      type: 'signal',
      shape: 'circle',
      radius: 4,
      color: '#00aa00',
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
