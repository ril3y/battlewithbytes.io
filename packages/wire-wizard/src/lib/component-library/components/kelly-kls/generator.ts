/**
 * Kelly KLS Controller SVG Generator
 *
 * Generates SVG markup for a Kelly KLS motor controller.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface KellyKLSConfig {
  bodyColor?: string;
  voltage?: number;
  currentRating?: number;
}

const DEFAULT_CONFIG: Required<KellyKLSConfig> = {
  bodyColor: '#ccaa77',
  voltage: 48,
  currentRating: 200,
};

const WIDTH = 260;
const HEIGHT = 200;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: KellyKLSConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };

  const uniqueId = Math.random().toString(36).substring(2, 9);

  // Generate J1 connector pins (3x3)
  let j1Pins = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 30 + col * 10;
      const y = 140 + row * 10;
      j1Pins += `<circle cx="${x}" cy="${y}" r="3" fill="#666" stroke="#444" stroke-width="0.5"/>`;
    }
  }

  // Generate J2 connector pins (3x3)
  let j2Pins = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 80 + col * 10;
      const y = 140 + row * 10;
      j2Pins += `<circle cx="${x}" cy="${y}" r="3" fill="#666" stroke="#444" stroke-width="0.5"/>`;
    }
  }

  // Generate J3 connector pins (2x3)
  let j3Pins = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const x = 130 + col * 10;
      const y = 140 + row * 10;
      j3Pins += `<circle cx="${x}" cy="${y}" r="3" fill="#666" stroke="#444" stroke-width="0.5"/>`;
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="bodyColor-${uniqueId}" x1="0" y1="0" x2="0" y2="200">
          <stop offset="0%" stop-color="#eebb88"/>
          <stop offset="100%" stop-color="${c.bodyColor}"/>
        </linearGradient>
        <radialGradient id="metal-${uniqueId}" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#fff"/>
          <stop offset="100%" stop-color="#999"/>
        </radialGradient>
      </defs>

      <!-- Main Housing -->
      <rect x="10" y="10" width="240" height="180" rx="10" fill="url(#bodyColor-${uniqueId})" stroke="#554433" stroke-width="2"/>

      <!-- Corner Mounting Holes -->
      <circle cx="20" cy="20" r="4" fill="#333" stroke="#443322"/>
      <circle cx="240" cy="20" r="4" fill="#333" stroke="#443322"/>
      <circle cx="20" cy="180" r="4" fill="#333" stroke="#443322"/>
      <circle cx="240" cy="180" r="4" fill="#333" stroke="#443322"/>

      <!-- Logo -->
      <text x="180" y="40" font-family="Arial" font-weight="bold" font-size="14" fill="#332211">Kelly</text>
      <text x="180" y="55" font-family="Arial" font-size="10" fill="#554433">KLS ${c.voltage}V ${c.currentRating}A</text>

      <!-- B+ (Top Center) -->
      <circle cx="100" cy="50" r="14" fill="#111" stroke="#333" stroke-width="2"/>
      <circle cx="100" cy="50" r="9" fill="url(#metal-${uniqueId})"/>
      <text x="120" y="55" font-family="Arial" font-weight="bold" font-size="12" fill="#000">B+</text>

      <!-- Phase U -->
      <circle cx="60" cy="110" r="14" fill="#111" stroke="#333" stroke-width="2"/>
      <circle cx="60" cy="110" r="9" fill="url(#metal-${uniqueId})"/>
      <text x="55" y="90" font-family="Arial" font-weight="bold" font-size="12" fill="#000">U</text>

      <!-- Phase V -->
      <circle cx="130" cy="110" r="14" fill="#111" stroke="#333" stroke-width="2"/>
      <circle cx="130" cy="110" r="9" fill="url(#metal-${uniqueId})"/>
      <text x="125" y="90" font-family="Arial" font-weight="bold" font-size="12" fill="#000">V</text>

      <!-- Phase W -->
      <circle cx="200" cy="110" r="14" fill="#111" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="110" r="9" fill="url(#metal-${uniqueId})"/>
      <text x="195" y="90" font-family="Arial" font-weight="bold" font-size="12" fill="#000">W</text>

      <!-- B- -->
      <circle cx="200" cy="150" r="14" fill="#111" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="150" r="9" fill="url(#metal-${uniqueId})"/>
      <text x="220" y="155" font-family="Arial" font-weight="bold" font-size="12" fill="#000">B-</text>

      <!-- J1 Connector -->
      <rect x="20" y="130" width="40" height="45" fill="#fff" stroke="#333" rx="2"/>
      <text x="40" y="127" text-anchor="middle" font-size="8" font-family="Arial">J1</text>
      ${j1Pins}

      <!-- J2 Connector -->
      <rect x="70" y="130" width="40" height="45" fill="#fff" stroke="#333" rx="2"/>
      <text x="90" y="127" text-anchor="middle" font-size="8" font-family="Arial">J2</text>
      ${j2Pins}

      <!-- J3 Connector -->
      <rect x="120" y="130" width="30" height="45" fill="#fff" stroke="#333" rx="2"/>
      <text x="135" y="127" text-anchor="middle" font-size="8" font-family="Arial">J3</text>
      ${j3Pins}
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    // Power Studs
    {
      id: 'b-plus',
      label: 'B+',
      x: 100,
      y: 50,
      type: 'power',
      shape: 'circle',
      radius: 8,
    },
    {
      id: 'phase-u',
      label: 'U',
      x: 60,
      y: 110,
      type: 'power',
      shape: 'circle',
      radius: 8,
    },
    {
      id: 'phase-v',
      label: 'V',
      x: 130,
      y: 110,
      type: 'power',
      shape: 'circle',
      radius: 8,
    },
    {
      id: 'phase-w',
      label: 'W',
      x: 200,
      y: 110,
      type: 'power',
      shape: 'circle',
      radius: 8,
    },
    {
      id: 'b-minus',
      label: 'B-',
      x: 200,
      y: 150,
      type: 'ground',
      shape: 'circle',
      radius: 8,
    },
    // J1 Connector pins
    { id: 'j1-1', label: 'J1-1', x: 30, y: 140, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j1-2', label: 'J1-2', x: 40, y: 140, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j1-3', label: 'J1-3', x: 50, y: 140, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j1-4', label: 'J1-4', x: 30, y: 150, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j1-5', label: 'J1-5', x: 40, y: 150, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j1-6', label: 'J1-6', x: 50, y: 150, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j1-7', label: 'J1-7', x: 30, y: 160, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j1-8', label: 'J1-8', x: 40, y: 160, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j1-9', label: 'J1-9', x: 50, y: 160, type: 'signal', shape: 'circle', radius: 3 },
    // J2 Connector pins
    { id: 'j2-1', label: 'J2-1', x: 80, y: 140, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j2-2', label: 'J2-2', x: 90, y: 140, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j2-3', label: 'J2-3', x: 100, y: 140, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j2-4', label: 'J2-4', x: 80, y: 150, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j2-5', label: 'J2-5', x: 90, y: 150, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j2-6', label: 'J2-6', x: 100, y: 150, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j2-7', label: 'J2-7', x: 80, y: 160, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j2-8', label: 'J2-8', x: 90, y: 160, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j2-9', label: 'J2-9', x: 100, y: 160, type: 'signal', shape: 'circle', radius: 3 },
    // J3 Connector pins
    { id: 'j3-1', label: 'J3-1', x: 130, y: 140, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j3-2', label: 'J3-2', x: 140, y: 140, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j3-3', label: 'J3-3', x: 130, y: 150, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j3-4', label: 'J3-4', x: 140, y: 150, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j3-5', label: 'J3-5', x: 130, y: 160, type: 'signal', shape: 'circle', radius: 3 },
    { id: 'j3-6', label: 'J3-6', x: 140, y: 160, type: 'signal', shape: 'circle', radius: 3 },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
