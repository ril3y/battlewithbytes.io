/**
 * DC-DC Converter SVG Generator
 *
 * Generates SVG markup for a step-down DC-DC converter with heat sink.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface DCDCConverterConfig {
  inputVoltage?: number;
  outputVoltage?: number;
  housingColor?: string;
  label?: string;
}

const DEFAULT_CONFIG: Required<DCDCConverterConfig> = {
  inputVoltage: 48,
  outputVoltage: 12,
  housingColor: '#2e5f9e',
  label: 'DC Converter',
};

// Native size — 50% larger than the original 120×80 so the component reads
// well alongside the contactor and isn't dwarfed at the default 100% scale.
const WIDTH = 180;
const HEIGHT = 120;
// All internal SVG coordinates were authored at the original 120×80 scale; we
// scale them up uniformly via a transform on the body group instead of
// rewriting every coord. Connection points are scaled in code below.
const NATIVE_SCALE = 1.5;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: DCDCConverterConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };

  const uniqueId = Math.random().toString(36).substring(2, 9);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="blue-housing-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4a90e2"/>
          <stop offset="50%" stop-color="${c.housingColor}"/>
          <stop offset="100%" stop-color="#1a3d6d"/>
        </linearGradient>
        <pattern id="heat-fins-${uniqueId}" x="0" y="0" width="4" height="60" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="2" height="60" fill="#3a7ac2"/>
          <rect x="2" y="0" width="2" height="60" fill="#2a5a9a"/>
        </pattern>
      </defs>
      <g transform="scale(${NATIVE_SCALE})">
      <!-- Main housing body -->
      <rect x="10" y="10" width="100" height="50" fill="url(#blue-housing-${uniqueId})" stroke="#1a3d6d" stroke-width="2" rx="3"/>

      <!-- Heat sink fins texture -->
      <rect x="12" y="12" width="96" height="46" fill="url(#heat-fins-${uniqueId})" opacity="0.6" rx="2"/>

      <!-- Top edge highlight -->
      <rect x="12" y="12" width="96" height="4" fill="#5aa0f2" opacity="0.4" rx="2"/>

      <!-- Label area (dark inset) -->
      <rect x="35" y="20" width="50" height="14" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="1" rx="2"/>
      <text x="60" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" fill="#888" font-weight="bold">${c.label}</text>

      <!-- Voltage labels -->
      <text x="60" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" fill="#aaa">${c.inputVoltage}V → ${c.outputVoltage}V</text>

      <!-- Mounting screws -->
      <circle cx="20" cy="30" r="2" fill="#3a3a3a" stroke="#2a2a2a" stroke-width="0.5"/>
      <circle cx="100" cy="30" r="2" fill="#3a3a3a" stroke="#2a2a2a" stroke-width="0.5"/>

      <!-- Wire 1: Yellow - Input+ (X=20) -->
      <line x1="20" y1="60" x2="20" y2="80" stroke="#ffcc00" stroke-width="3" stroke-linecap="round"/>
      <circle cx="20" cy="80" r="2" fill="#ffcc00"/>

      <!-- Wire 2: Green - Switched Input (X=40) -->
      <line x1="40" y1="60" x2="40" y2="80" stroke="#00aa00" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="80" r="2" fill="#00aa00"/>

      <!-- Wire 3: Black - Ground (X=60) -->
      <line x1="60" y1="60" x2="60" y2="80" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="60" cy="80" r="2" fill="#1a1a1a"/>

      <!-- Wire 4: Red - Switched Output (X=80) -->
      <line x1="80" y1="60" x2="80" y2="80" stroke="#cc0000" stroke-width="3" stroke-linecap="round"/>
      <circle cx="80" cy="80" r="2" fill="#cc0000"/>

      <!-- Wire 5: Blue - Constant Output (X=100) -->
      <line x1="100" y1="60" x2="100" y2="80" stroke="#0066cc" stroke-width="3" stroke-linecap="round"/>
      <circle cx="100" cy="80" r="2" fill="#0066cc"/>
      </g>
    </svg>
  `;

  // Connection points are authored in the original 120×80 coord space and
  // scaled up to match the native 180×120 viewBox. Colors match the stubs
  // drawn above so the dots and labels visually flow into the wires.
  const s = NATIVE_SCALE;
  const connectionPoints: ConnectionPointDefinition[] = [
    { id: 'input-pos',    label: `${c.inputVoltage}V IN+`,    x: 20 * s,  y: 80 * s, type: 'power',  shape: 'circle', radius: 4, color: '#ffcc00' },
    { id: 'input-sw',     label: 'SW IN+',                    x: 40 * s,  y: 80 * s, type: 'power',  shape: 'circle', radius: 4, color: '#00aa00' },
    { id: 'ground',       label: 'GND',                       x: 60 * s,  y: 80 * s, type: 'ground', shape: 'circle', radius: 4, color: '#9aa0a6' },
    { id: 'output-sw',    label: `${c.outputVoltage}V SW`,    x: 80 * s,  y: 80 * s, type: 'power',  shape: 'circle', radius: 4, color: '#cc0000' },
    { id: 'output-const', label: `${c.outputVoltage}V CONST`, x: 100 * s, y: 80 * s, type: 'power',  shape: 'circle', radius: 4, color: '#0066cc' },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
