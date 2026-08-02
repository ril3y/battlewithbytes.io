/**
 * Battery Disconnect Switch SVG Generator
 *
 * Generates SVG markup for a rotary battery disconnect/isolator switch
 * with realistic 3D appearance.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface BatteryDisconnectConfig {
  position?: 'on' | 'off';
  amperage?: number;
  bodyColor?: string;
  handleColor?: string;
  showIndicator?: boolean;
}

const DEFAULT_CONFIG: Required<BatteryDisconnectConfig> = {
  position: 'off',
  amperage: 200,
  bodyColor: '#2d3436',
  handleColor: '#e74c3c',
  showIndicator: true,
};

const WIDTH = 80;
const HEIGHT = 100;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: BatteryDisconnectConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const centerX = WIDTH / 2;
  const isOn = c.position === 'on';
  const handleRotation = isOn ? 45 : -45;  // ON points right, OFF points left

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <!-- Body gradient -->
        <linearGradient id="body-${uniqueId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#444"/>
          <stop offset="50%" stop-color="${c.bodyColor}"/>
          <stop offset="100%" stop-color="#1a1a1a"/>
        </linearGradient>
        <!-- Metal base gradient -->
        <linearGradient id="base-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#888"/>
          <stop offset="50%" stop-color="#666"/>
          <stop offset="100%" stop-color="#444"/>
        </linearGradient>
        <!-- Handle gradient -->
        <linearGradient id="handle-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c.handleColor}"/>
          <stop offset="50%" stop-color="${c.handleColor}dd"/>
          <stop offset="100%" stop-color="${c.handleColor}99"/>
        </linearGradient>
        <!-- Rotary head gradient -->
        <radialGradient id="head-${uniqueId}" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stop-color="#555"/>
          <stop offset="100%" stop-color="#222"/>
        </radialGradient>
      </defs>

      <!-- Main body -->
      <rect x="10" y="5" width="60" height="70" rx="4"
            fill="url(#body-${uniqueId})" stroke="#111" stroke-width="2"/>

      <!-- Rotary head -->
      <ellipse cx="${centerX}" cy="35" rx="22" ry="8"
               fill="url(#head-${uniqueId})" stroke="#111" stroke-width="1"/>

      <!-- Position markings -->
      <text x="15" y="32" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#666">OFF</text>
      <text x="58" y="32" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#2ecc71">ON</text>

      <!-- Handle (rotates based on position) -->
      <g transform="rotate(${handleRotation}, ${centerX}, 35)">
        <rect x="${centerX - 5}" y="15" width="10" height="28" rx="2"
              fill="url(#handle-${uniqueId})" stroke="${c.handleColor}88" stroke-width="1"/>
        <!-- Handle grip lines -->
        <line x1="${centerX - 3}" y1="19" x2="${centerX + 3}" y2="19" stroke="${c.handleColor}66" stroke-width="1"/>
        <line x1="${centerX - 3}" y1="24" x2="${centerX + 3}" y2="24" stroke="${c.handleColor}66" stroke-width="1"/>
        <line x1="${centerX - 3}" y1="29" x2="${centerX + 3}" y2="29" stroke="${c.handleColor}66" stroke-width="1"/>
      </g>

      <!-- Rating label (centered on body) -->
      <text x="${centerX}" y="62" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#888">
        ${c.amperage}A
      </text>

      <!-- Mounting base -->
      <rect x="5" y="75" width="70" height="10" rx="2"
            fill="url(#base-${uniqueId})" stroke="#444" stroke-width="1"/>

      ${c.showIndicator ? `
      <!-- Position indicator LED (centered on grey bar) -->
      <circle cx="${centerX}" cy="80" r="3"
              fill="${isOn ? '#2ecc71' : '#e74c3c'}" stroke="#666" stroke-width="0.5"/>
      ` : ''}
    </svg>
  `;

  // Connection points at the ends of the grey mounting bar (grid-aligned)
  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'bat',
      label: 'BAT',
      x: 15,
      y: 80,  // On the left side of mounting bar
      type: 'power',
      color: '#cc0000',
      shape: 'circle',
      radius: 4,
      description: 'Battery input terminal',
    },
    {
      id: 'load',
      label: 'LOAD',
      x: 65,
      y: 80,  // On the right side of mounting bar
      type: 'power',
      color: '#ff6600',
      shape: 'circle',
      radius: 4,
      description: 'Load output terminal',
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
