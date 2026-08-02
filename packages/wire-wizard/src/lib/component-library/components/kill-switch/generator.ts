/**
 * Kill Switch / Emergency Stop SVG Generator
 *
 * Generates SVG markup for an emergency stop (E-Stop) mushroom button
 * with realistic 3D appearance and safety styling.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface KillSwitchConfig {
  type?: 'NO' | 'NC';
  isEngaged?: boolean;
  buttonColor?: string;
  showLabel?: boolean;
  labelText?: string;
}

const DEFAULT_CONFIG: Required<KillSwitchConfig> = {
  type: 'NC',
  isEngaged: false,
  buttonColor: '#e74c3c',
  showLabel: true,
  labelText: 'E-STOP',
};

const WIDTH = 80;
const HEIGHT = 100;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: KillSwitchConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const centerX = WIDTH / 2;
  const buttonY = 35;
  const buttonRadius = 25;

  // Button depression when engaged
  const buttonOffset = c.isEngaged ? 5 : 0;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <!-- Button gradient (mushroom dome) -->
        <radialGradient id="mushroom-${uniqueId}" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stop-color="${c.buttonColor}"/>
          <stop offset="70%" stop-color="${c.buttonColor}dd"/>
          <stop offset="100%" stop-color="${c.buttonColor}99"/>
        </radialGradient>
        <!-- Base yellow/black hazard -->
        <pattern id="hazard-${uniqueId}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="10" fill="#f1c40f"/>
          <rect x="5" width="5" height="10" fill="#1a1a1a"/>
        </pattern>
        <!-- Black base gradient -->
        <linearGradient id="base-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#444"/>
          <stop offset="100%" stop-color="#1a1a1a"/>
        </linearGradient>
        <!-- Shadow filter -->
        <filter id="shadow-${uniqueId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
      </defs>

      <!-- Mounting plate with hazard stripes -->
      <rect x="5" y="55" width="70" height="15" rx="2"
            fill="url(#hazard-${uniqueId})" stroke="#333" stroke-width="1"/>

      <!-- Black base ring -->
      <ellipse cx="${centerX}" cy="55" rx="30" ry="12"
               fill="url(#base-${uniqueId})" stroke="#111" stroke-width="2"/>

      <!-- Yellow caution ring -->
      <ellipse cx="${centerX}" cy="50" rx="28" ry="10"
               fill="#f1c40f" stroke="#d4ac0d" stroke-width="1"/>

      <!-- Inner black ring -->
      <ellipse cx="${centerX}" cy="${48 + buttonOffset}" rx="22" ry="8"
               fill="#1a1a1a" stroke="#111" stroke-width="1"/>

      <!-- Mushroom dome button -->
      <ellipse cx="${centerX}" cy="${buttonY + buttonOffset}" rx="${buttonRadius}" ry="${buttonRadius * 0.8}"
               fill="url(#mushroom-${uniqueId})" stroke="${c.buttonColor}88" stroke-width="1"
               filter="url(#shadow-${uniqueId})"/>

      <!-- Button top highlight -->
      <ellipse cx="${centerX - 8}" cy="${buttonY + buttonOffset - 8}" rx="12" ry="8"
               fill="#ffffff33"/>

      <!-- Button dome curve line -->
      <ellipse cx="${centerX}" cy="${buttonY + buttonOffset + 5}" rx="20" ry="6"
               fill="none" stroke="${c.buttonColor}66" stroke-width="1"/>

      ${c.showLabel ? `
      <!-- E-STOP label on button -->
      <text x="${centerX}" y="${buttonY + buttonOffset + 5}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#fff">
        ${c.labelText}
      </text>
      ` : ''}

      <!-- Terminal blocks at bottom -->
      <rect x="18" y="75" width="14" height="18" rx="1"
            fill="#d4a574" stroke="#aa8855" stroke-width="0.5"/>
      <circle cx="25" cy="81" r="2.5" fill="#886633"/>
      <text x="25" y="90" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" fill="#fff">1</text>

      <rect x="48" y="75" width="14" height="18" rx="1"
            fill="#d4a574" stroke="#aa8855" stroke-width="0.5"/>
      <circle cx="55" cy="81" r="2.5" fill="#886633"/>
      <text x="55" y="90" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" fill="#fff">2</text>

      <!-- Type indicator -->
      <text x="${centerX}" y="${HEIGHT - 2}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="8" fill="#888">
        ${c.type} - ${c.isEngaged ? 'ENGAGED' : 'READY'}
      </text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'nc1',
      label: 'NC1',
      x: 25,
      y: HEIGHT,
      type: 'power',
      color: '#d4a574',
      shape: 'circle',
      radius: 5,
      description: 'Normally Closed terminal 1',
    },
    {
      id: 'nc2',
      label: 'NC2',
      x: 55,
      y: HEIGHT,
      type: 'power',
      color: '#d4a574',
      shape: 'circle',
      radius: 5,
      description: 'Normally Closed terminal 2',
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
