/**
 * SPST Switch SVG Generator
 *
 * Generates SVG markup for a generic Single Pole Single Throw switch
 * with realistic 3D appearance.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface SPSTSwitchConfig {
  state?: 'open' | 'closed';
  bodyColor?: string;
  terminalColor?: string;
  leverColor?: string;
}

const DEFAULT_CONFIG: Required<SPSTSwitchConfig> = {
  state: 'open',
  bodyColor: '#2d3436',
  terminalColor: '#d4a574',
  leverColor: '#888888',
};

const WIDTH = 80;
const HEIGHT = 50;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: SPSTSwitchConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const centerY = HEIGHT / 2;
  const terminalRadius = 6;
  const leftTermX = 12;
  const rightTermX = WIDTH - 12;

  // Lever angle based on state
  const leverAngle = c.state === 'closed' ? 0 : -30;
  const pivotX = leftTermX + 8;
  const pivotY = centerY;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <!-- Terminal gradient -->
        <radialGradient id="term-${uniqueId}" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stop-color="#f0d0a0"/>
          <stop offset="100%" stop-color="${c.terminalColor}"/>
        </radialGradient>
        <!-- Lever gradient -->
        <linearGradient id="lever-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#aaa"/>
          <stop offset="50%" stop-color="${c.leverColor}"/>
          <stop offset="100%" stop-color="#666"/>
        </linearGradient>
        <!-- Body gradient -->
        <linearGradient id="body-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#444"/>
          <stop offset="100%" stop-color="${c.bodyColor}"/>
        </linearGradient>
      </defs>

      <!-- Switch body/base -->
      <rect x="5" y="15" width="70" height="20" rx="3"
            fill="url(#body-${uniqueId})" stroke="#222" stroke-width="1"/>

      <!-- Left terminal (pivot point) -->
      <circle cx="${leftTermX}" cy="${centerY}" r="${terminalRadius}"
              fill="url(#term-${uniqueId})" stroke="#aa8855" stroke-width="1"/>
      <circle cx="${leftTermX}" cy="${centerY}" r="2" fill="#886633"/>

      <!-- Right terminal (contact point) -->
      <circle cx="${rightTermX}" cy="${centerY}" r="${terminalRadius}"
              fill="url(#term-${uniqueId})" stroke="#aa8855" stroke-width="1"/>
      <circle cx="${rightTermX}" cy="${centerY}" r="2" fill="#886633"/>

      <!-- Fixed contact at right terminal -->
      <rect x="${rightTermX - 4}" y="${centerY - 3}" width="8" height="6" rx="1"
            fill="#c0c0c0" stroke="#888" stroke-width="0.5"/>

      <!-- Switch lever (rotates based on state) -->
      <g transform="rotate(${leverAngle}, ${pivotX}, ${pivotY})">
        <rect x="${pivotX}" y="${centerY - 3}" width="50" height="6" rx="2"
              fill="url(#lever-${uniqueId})" stroke="#555" stroke-width="0.5"/>
        <!-- Contact tip -->
        <circle cx="${pivotX + 48}" cy="${centerY}" r="4"
                fill="#e0e0e0" stroke="#888" stroke-width="0.5"/>
      </g>

      <!-- Pivot screw -->
      <circle cx="${pivotX}" cy="${centerY}" r="4" fill="#666" stroke="#444" stroke-width="0.5"/>
      <circle cx="${pivotX}" cy="${centerY}" r="2" fill="#888"/>

      <!-- State indicator -->
      <text x="${WIDTH / 2}" y="10" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="8" fill="#888">
        ${c.state === 'closed' ? 'ON' : 'OFF'}
      </text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'in',
      label: 'IN',
      x: 0,
      y: centerY,
      type: 'power',
      color: c.terminalColor,
      shape: 'circle',
      radius: 5,
      description: 'Input terminal',
    },
    {
      id: 'out',
      label: 'OUT',
      x: WIDTH,
      y: centerY,
      type: 'power',
      color: c.terminalColor,
      shape: 'circle',
      radius: 5,
      description: 'Output terminal',
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
