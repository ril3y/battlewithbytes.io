/**
 * Ignition Key Switch SVG Generator
 *
 * Generates SVG markup for an automotive ignition key switch.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface IgnitionKeySwitchConfig {
  housingColor?: string;
  cylinderColor?: string;
  terminalColor?: string;
  position?: 'off' | 'acc' | 'ign' | 'start';
}

const DEFAULT_CONFIG: Required<IgnitionKeySwitchConfig> = {
  housingColor: '#a0a0a0',
  cylinderColor: '#606060',
  terminalColor: '#d4a574',
  position: 'off',
};

const WIDTH = 100;
const HEIGHT = 100;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: IgnitionKeySwitchConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };

  const uniqueId = Math.random().toString(36).substring(2, 9);

  // Key slot rotation based on position
  const rotations: Record<string, number> = {
    'off': 0,
    'acc': 45,
    'ign': 90,
    'start': 135,
  };
  const keyRotation = rotations[c.position] || 0;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <radialGradient id="housing-metal-${uniqueId}">
          <stop offset="0%" stop-color="#c8c8c8"/>
          <stop offset="50%" stop-color="${c.housingColor}"/>
          <stop offset="100%" stop-color="#787878"/>
        </radialGradient>
        <radialGradient id="key-cylinder-${uniqueId}">
          <stop offset="0%" stop-color="#b8b8b8"/>
          <stop offset="40%" stop-color="#888888"/>
          <stop offset="80%" stop-color="${c.cylinderColor}"/>
          <stop offset="100%" stop-color="#4a4a4a"/>
        </radialGradient>
        <linearGradient id="terminal-grad-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${c.terminalColor}"/>
          <stop offset="50%" stop-color="#c89860"/>
          <stop offset="100%" stop-color="#a07850"/>
        </linearGradient>
      </defs>

      <!-- Outer housing -->
      <circle cx="50" cy="50" r="45" fill="url(#housing-metal-${uniqueId})" stroke="#4a4a4a" stroke-width="2"/>

      <!-- Inner ring detail -->
      <circle cx="50" cy="50" r="38" fill="none" stroke="#6a6a6a" stroke-width="1" opacity="0.5"/>

      <!-- Key cylinder bezel -->
      <circle cx="50" cy="50" r="28" fill="url(#key-cylinder-${uniqueId})" stroke="#3a3a3a" stroke-width="2"/>

      <!-- Inner key slot circle -->
      <circle cx="50" cy="50" r="22" fill="#787878" stroke="#4a4a4a" stroke-width="1"/>

      <!-- Key slot (rotates based on position) -->
      <g transform="rotate(${keyRotation}, 50, 50)">
        <rect x="48" y="38" width="4" height="24" fill="#2a2a2a" stroke="#1a1a1a" stroke-width="0.5" rx="1"/>
        <circle cx="50" cy="40" r="2" fill="#1a1a1a"/>
      </g>

      <!-- Position labels -->
      <text x="50" y="12" text-anchor="middle" font-size="6" fill="#666" font-family="Arial">BAT</text>
      <text x="92" y="52" text-anchor="middle" font-size="6" fill="#666" font-family="Arial">IGN</text>
      <text x="50" y="96" text-anchor="middle" font-size="6" fill="#666" font-family="Arial">ACC</text>
      <text x="8" y="52" text-anchor="middle" font-size="6" fill="#666" font-family="Arial">ST</text>

      <!-- Terminal connection points -->
      <!-- Battery terminal (top) -->
      <circle cx="50" cy="0" r="4" fill="url(#terminal-grad-${uniqueId})" stroke="#8a6a4a" stroke-width="1"/>
      <circle cx="50" cy="0" r="2" fill="#6a5a3a"/>

      <!-- Ignition terminal (right) -->
      <circle cx="100" cy="50" r="4" fill="url(#terminal-grad-${uniqueId})" stroke="#8a6a4a" stroke-width="1"/>
      <circle cx="100" cy="50" r="2" fill="#6a5a3a"/>

      <!-- Accessory terminal (bottom) -->
      <circle cx="50" cy="100" r="4" fill="url(#terminal-grad-${uniqueId})" stroke="#8a6a4a" stroke-width="1"/>
      <circle cx="50" cy="100" r="2" fill="#6a5a3a"/>

      <!-- Start terminal (left) -->
      <circle cx="0" cy="50" r="4" fill="url(#terminal-grad-${uniqueId})" stroke="#8a6a4a" stroke-width="1"/>
      <circle cx="0" cy="50" r="2" fill="#6a5a3a"/>

      <!-- Color indicators -->
      <circle cx="50" cy="0" r="3" fill="transparent" stroke="#ff9900" stroke-width="1.5"/>
      <circle cx="100" cy="50" r="3" fill="transparent" stroke="#ff0000" stroke-width="1.5"/>
      <circle cx="50" cy="100" r="3" fill="transparent" stroke="#00aa00" stroke-width="1.5"/>
      <circle cx="0" cy="50" r="3" fill="transparent" stroke="#0066cc" stroke-width="1.5"/>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'battery',
      label: 'BAT',
      x: 50,
      y: 0,
      type: 'power',
      shape: 'circle',
      radius: 4,
    },
    {
      id: 'ignition',
      label: 'IGN',
      x: 100,
      y: 50,
      type: 'power',
      shape: 'circle',
      radius: 4,
    },
    {
      id: 'accessory',
      label: 'ACC',
      x: 50,
      y: 100,
      type: 'power',
      shape: 'circle',
      radius: 4,
    },
    {
      id: 'start',
      label: 'START',
      x: 0,
      y: 50,
      type: 'power',
      shape: 'circle',
      radius: 4,
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
