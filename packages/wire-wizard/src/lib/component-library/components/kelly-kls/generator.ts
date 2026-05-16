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

      <!-- J1 Connector (DJ7091Y-2.3-21, 9-pin) — bus port marker drawn by the canvas atop this rect -->
      <rect x="20" y="130" width="40" height="45" fill="#fff" stroke="#333" rx="2"/>
      <text x="40" y="127" text-anchor="middle" font-size="8" font-family="Arial">J1</text>

      <!-- J2 Connector (DJ7091Y-2.3-11, 9-pin) -->
      <rect x="70" y="130" width="40" height="45" fill="#fff" stroke="#333" rx="2"/>
      <text x="90" y="127" text-anchor="middle" font-size="8" font-family="Arial">J2</text>

      <!-- Hall Connector (DJ7061Y-2.3-11, 6-pin) — plugs directly into motor hall connector -->
      <rect x="120" y="130" width="30" height="45" fill="#fff" stroke="#333" rx="2"/>
      <text x="135" y="127" text-anchor="middle" font-size="8" font-family="Arial">Hall</text>
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
    // J1 (DJ7091Y-2.3-21) — 9-pin signal/power harness. Pin names from the
    // Kelly KLS-N manual. Hidden on the canvas; visible in the pinout drill-in.
    { id: 'j1-1', label: 'White FWD',         x: 30, y: 140, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 12, signalType: 'signal', color: '#ffffff', description: 'Forward switch' },
    { id: 'j1-2', label: 'Black GND',         x: 40, y: 140, type: 'ground', shape: 'circle', radius: 3, hidden: true, pinNumber: 6,  signalType: 'ground', color: '#000000', description: 'Ground' },
    { id: 'j1-3', label: 'Orange REV-SW',     x: 50, y: 140, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 14, signalType: 'signal', color: '#ff8800', description: 'Reverse switch' },
    { id: 'j1-4', label: 'Blue Relay',        x: 30, y: 150, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 9,  signalType: 'signal', color: '#3399ff', description: 'Main contactor relay coil' },
    { id: 'j1-5', label: 'Yellowish 12V Brk', x: 40, y: 150, type: 'power',  shape: 'circle', radius: 3, hidden: true, pinNumber: 25, signalType: 'power',  color: '#e6e600', voltage: 12, description: '12V brake switch' },
    { id: 'j1-6', label: 'Red 12V',           x: 50, y: 150, type: 'power',  shape: 'circle', radius: 3, hidden: true, pinNumber: 11, signalType: 'power',  color: '#ff0000', voltage: 12, description: '12V supply' },
    { id: 'j1-7', label: 'Pink PWR',          x: 30, y: 160, type: 'power',  shape: 'circle', radius: 3, hidden: true, pinNumber: 7,  signalType: 'power',  color: '#ff66cc', description: 'Power (KSI / key-switched ignition)' },
    { id: 'j1-8', label: 'Spare',             x: 40, y: 160, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 8,  signalType: 'signal' },
    { id: 'j1-9', label: 'Spare',             x: 50, y: 160, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 10, signalType: 'signal' },

    // J2 (DJ7091Y-2.3-11) — 9-pin throttle / brake-analog / meter harness
    { id: 'j2-1', label: 'Raddle Temp',     x: 80,  y: 140, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 1,  signalType: 'analog', description: 'Motor / controller temp sensor' },
    { id: 'j2-2', label: 'Green Throttle',  x: 90,  y: 140, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 3,  signalType: 'analog', color: '#00cc66', description: 'Throttle pot wiper' },
    { id: 'j2-3', label: 'Gray Foot_SW',    x: 100, y: 140, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 15, signalType: 'signal', color: '#999999', description: 'Foot pedal switch' },
    { id: 'j2-4', label: 'D-Gray Meter',    x: 80,  y: 150, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 8,  signalType: 'signal', color: '#666666', description: 'Speed/RPM meter output' },
    { id: 'j2-5', label: 'Black GND',       x: 90,  y: 150, type: 'ground', shape: 'circle', radius: 3, hidden: true, pinNumber: 20, signalType: 'ground', color: '#000000', description: 'Signal ground' },
    { id: 'j2-6', label: 'Brown Brake_AN',  x: 100, y: 150, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 2,  signalType: 'analog', color: '#8b4513', description: 'Analog brake input' },
    { id: 'j2-7', label: 'Purple 5V',       x: 80,  y: 160, type: 'power',  shape: 'circle', radius: 3, hidden: true, pinNumber: 4,  signalType: 'power',  color: '#9933ff', voltage: 5, description: '5V regulated supply for throttle pot' },
    { id: 'j2-8', label: 'Spare',           x: 90,  y: 160, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 5,  signalType: 'signal' },
    { id: 'j2-9', label: 'Spare',           x: 100, y: 160, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 6,  signalType: 'signal' },

    // Hall (DJ7061Y-2.3-11) — 6-pin hall-sensor connector. Plugs directly into the motor's hall connector.
    { id: 'hall-a',   label: 'Hall A',   x: 130, y: 140, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 1, signalType: 'signal', description: 'Hall A signal' },
    { id: 'hall-b',   label: 'Hall B',   x: 140, y: 140, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 2, signalType: 'signal', description: 'Hall B signal' },
    { id: 'hall-c',   label: 'Hall C',   x: 130, y: 150, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 3, signalType: 'signal', description: 'Hall C signal' },
    { id: 'hall-5v',  label: '+5V',      x: 140, y: 150, type: 'power',  shape: 'circle', radius: 3, hidden: true, pinNumber: 4, signalType: 'power',  color: '#ff0000', voltage: 5, description: 'Hall sensor supply' },
    { id: 'hall-gnd', label: 'GND',      x: 130, y: 160, type: 'ground', shape: 'circle', radius: 3, hidden: true, pinNumber: 5, signalType: 'ground', color: '#000000', description: 'Hall sensor ground' },
    { id: 'hall-tmp', label: 'Motor Tmp',x: 140, y: 160, type: 'signal', shape: 'circle', radius: 3, hidden: true, pinNumber: 6, signalType: 'analog', description: 'Motor temperature sensor' },

    // Bus ports — sit at the visual center of each connector rectangle on the
    // canvas. Wires attach here; the pinout drill-in view assigns each wire to an internal pin.
    {
      id: 'j1-bus',
      label: 'J1',
      x: 40,
      y: 152,
      type: 'signal',
      shape: 'circle',
      radius: 8,
      isBusPort: true,
      internalPinIds: ['j1-1', 'j1-2', 'j1-3', 'j1-4', 'j1-5', 'j1-6', 'j1-7', 'j1-8', 'j1-9'],
      description: 'DJ7091Y-2.3-21 — 9-pin signal/power harness (FWD/REV, relay, brake, KSI, 12V)',
    },
    {
      id: 'j2-bus',
      label: 'J2',
      x: 90,
      y: 152,
      type: 'signal',
      shape: 'circle',
      radius: 8,
      isBusPort: true,
      internalPinIds: ['j2-1', 'j2-2', 'j2-3', 'j2-4', 'j2-5', 'j2-6', 'j2-7', 'j2-8', 'j2-9'],
      description: 'DJ7091Y-2.3-11 — 9-pin throttle / brake-analog / meter harness',
    },
    {
      id: 'hall-bus',
      label: 'Hall',
      x: 135,
      y: 152,
      type: 'signal',
      shape: 'circle',
      radius: 8,
      isBusPort: true,
      internalPinIds: ['hall-a', 'hall-b', 'hall-c', 'hall-5v', 'hall-gnd', 'hall-tmp'],
      description: 'DJ7061Y-2.3-11 — plugs directly into motor hall connector',
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
