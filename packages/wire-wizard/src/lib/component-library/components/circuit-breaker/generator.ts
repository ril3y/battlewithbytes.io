/**
 * Circuit Breaker SVG Generator
 *
 * Generates SVG markup for a resettable circuit breaker with realistic appearance.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface CircuitBreakerConfig {
  rating?: number;
  state?: 'on' | 'off' | 'tripped';
  bodyColor?: string;
  leverColor?: string;
  showRating?: boolean;
  voltage?: number;
}

const DEFAULT_CONFIG: Required<CircuitBreakerConfig> = {
  rating: 20,
  state: 'on',
  bodyColor: '#1a1a1a',
  leverColor: '#e74c3c',
  showRating: true,
  voltage: 12,
};

const WIDTH = 50;
const HEIGHT = 90;

export function getDimensions(config: CircuitBreakerConfig = {}): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: CircuitBreakerConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const centerX = WIDTH / 2;

  // Lever position based on state
  let leverAngle = 0;
  let leverColor = c.leverColor;
  let stateText = 'ON';

  switch (c.state) {
    case 'on':
      leverAngle = -15;
      stateText = 'ON';
      break;
    case 'off':
      leverAngle = 15;
      stateText = 'OFF';
      break;
    case 'tripped':
      leverAngle = 0;
      leverColor = '#f39c12';
      stateText = 'TRIP';
      break;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <!-- Body gradient -->
        <linearGradient id="body-${uniqueId}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#333"/>
          <stop offset="50%" stop-color="${c.bodyColor}"/>
          <stop offset="100%" stop-color="#333"/>
        </linearGradient>
        <!-- Terminal gradient -->
        <linearGradient id="term-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e0d0b0"/>
          <stop offset="50%" stop-color="#d4a574"/>
          <stop offset="100%" stop-color="#a08060"/>
        </linearGradient>
        <!-- Lever gradient -->
        <linearGradient id="lever-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${leverColor}"/>
          <stop offset="100%" stop-color="${leverColor}aa"/>
        </linearGradient>
      </defs>

      <!-- Top terminal (LINE) -->
      <rect x="${centerX - 8}" y="0" width="16" height="15" rx="2"
            fill="url(#term-${uniqueId})" stroke="#aa8855" stroke-width="0.5"/>
      <circle cx="${centerX}" cy="7" r="2.5" fill="#886633"/>
      <text x="${centerX}" y="22" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="6" fill="#888">LINE</text>

      <!-- Main body -->
      <rect x="5" y="25" width="40" height="45" rx="3"
            fill="url(#body-${uniqueId})" stroke="#111" stroke-width="1"/>

      <!-- Body texture lines -->
      <line x1="8" y1="30" x2="42" y2="30" stroke="#333" stroke-width="0.5"/>
      <line x1="8" y1="65" x2="42" y2="65" stroke="#333" stroke-width="0.5"/>

      <!-- Lever slot -->
      <rect x="15" y="38" width="20" height="20" rx="2"
            fill="#222" stroke="#111" stroke-width="0.5"/>

      <!-- Toggle lever -->
      <g transform="rotate(${leverAngle}, ${centerX}, 48)">
        <rect x="${centerX - 5}" y="35" width="10" height="20" rx="2"
              fill="url(#lever-${uniqueId})" stroke="${leverColor}88" stroke-width="0.5"/>
        <!-- Lever grip line -->
        <line x1="${centerX - 3}" y1="40" x2="${centerX + 3}" y2="40"
              stroke="${leverColor}66" stroke-width="1"/>
      </g>

      <!-- State indicator window -->
      <rect x="35" y="42" width="8" height="12" rx="1"
            fill="#222" stroke="#333" stroke-width="0.5"/>
      <text x="39" y="51" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="5" fill="${c.state === 'on' ? '#2ecc71' : c.state === 'tripped' ? '#f39c12' : '#888'}">
        ${stateText}
      </text>

      <!-- Bottom terminal (LOAD) -->
      <rect x="${centerX - 8}" y="75" width="16" height="15" rx="2"
            fill="url(#term-${uniqueId})" stroke="#aa8855" stroke-width="0.5"/>
      <circle cx="${centerX}" cy="83" r="2.5" fill="#886633"/>
      <text x="${centerX}" y="73" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="6" fill="#888">LOAD</text>

      ${c.showRating ? `
      <!-- Rating label -->
      <text x="${centerX}" y="62" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#888">
        ${c.rating}A
      </text>
      ` : ''}
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'line',
      label: 'LINE',
      x: centerX,
      y: 0,
      type: 'power',
      color: '#d4a574',
      shape: 'circle',
      radius: 6,
      description: 'Line (input) terminal',
    },
    {
      id: 'load',
      label: 'LOAD',
      x: centerX,
      y: HEIGHT,
      type: 'power',
      color: '#d4a574',
      shape: 'circle',
      radius: 6,
      description: 'Load (output) terminal',
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
