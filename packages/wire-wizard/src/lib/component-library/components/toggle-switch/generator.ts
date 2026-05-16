/**
 * Toggle Switch SVG Generator
 *
 * Generates SVG markup for a simple toggle switch.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface ToggleSwitchConfig {
  bodyColor?: string;
  leverColor?: string;
  terminalColor?: string;
  isOn?: boolean;
}

const DEFAULT_CONFIG: Required<ToggleSwitchConfig> = {
  bodyColor: '#2a2a2a',
  leverColor: '#d32f2f',
  terminalColor: '#d4a574',
  isOn: false,
};

const WIDTH = 60;
const HEIGHT = 80;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: ToggleSwitchConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };

  const uniqueId = Math.random().toString(36).substring(2, 9);
  const termGradId = `terminal-grad-${uniqueId}`;

  // Lever angle based on state
  const leverEndY = c.isOn ? 25 : 15;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="${termGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${c.terminalColor}"/>
          <stop offset="100%" stop-color="#8b6f47"/>
        </linearGradient>
        <linearGradient id="lever-grad-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${c.leverColor}"/>
          <stop offset="100%" stop-color="#8b0000"/>
        </linearGradient>
      </defs>

      <!-- Switch base -->
      <rect x="10" y="30" width="40" height="40" fill="${c.bodyColor}" stroke="#1a1a1a" stroke-width="2" rx="3"/>

      <!-- Base plate detail -->
      <rect x="15" y="35" width="30" height="30" fill="#1a1a1a" stroke="#333" stroke-width="1" rx="2"/>

      <!-- Pivot point -->
      <circle cx="30" cy="50" r="4" fill="#333" stroke="#555" stroke-width="1"/>

      <!-- Switch lever -->
      <line x1="30" y1="50" x2="30" y2="${leverEndY}" stroke="#666" stroke-width="4" stroke-linecap="round"/>
      <circle cx="30" cy="12" r="6" fill="url(#lever-grad-${uniqueId})" stroke="#8b0000" stroke-width="1.5"/>

      <!-- Top terminal -->
      <circle cx="30" cy="5" r="4" fill="url(#${termGradId})" stroke="#8b6f47" stroke-width="1"/>

      <!-- Bottom terminal -->
      <circle cx="30" cy="75" r="4" fill="url(#${termGradId})" stroke="#8b6f47" stroke-width="1"/>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'top',
      label: 'TOP',
      x: 30,
      y: 5,
      type: 'power',
      shape: 'circle',
      radius: 4,
    },
    {
      id: 'bottom',
      label: 'BTM',
      x: 30,
      y: 75,
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
