/**
 * Wire Junction / Splice SVG Generator
 *
 * Generates SVG markup for wire junction points:
 * - T-junction (3-way splice)
 * - Y-junction (3-way split)
 * - Inline splice (2-way connection)
 * - Tap (branch off main wire)
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface WireJunctionConfig {
  type?: 'T' | 'Y' | 'inline' | 'tap';
  wireColor?: string;
  dotColor?: string;
  dotSize?: number;
  showSolder?: boolean;
}

const DEFAULT_CONFIG: Required<WireJunctionConfig> = {
  type: 'T',
  wireColor: '#333333',
  dotColor: '#c0c0c0',
  dotSize: 6,
  showSolder: true,
};

const WIDTH = 50;
const HEIGHT = 50;

export function getDimensions(config: WireJunctionConfig = {}): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: WireJunctionConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  const wireWidth = 3;

  let wires = '';
  let connectionPoints: ConnectionPointDefinition[] = [];

  switch (c.type) {
    case 'T':
      // T-junction: horizontal line with vertical branch down
      wires = `
        <!-- Horizontal wire -->
        <line x1="0" y1="${centerY}" x2="${WIDTH}" y2="${centerY}"
              stroke="${c.wireColor}" stroke-width="${wireWidth}" stroke-linecap="round"/>
        <!-- Vertical branch -->
        <line x1="${centerX}" y1="${centerY}" x2="${centerX}" y2="${HEIGHT}"
              stroke="${c.wireColor}" stroke-width="${wireWidth}" stroke-linecap="round"/>
      `;
      connectionPoints = [
        { id: 'left', label: 'Left', x: 0, y: centerY, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Left connection' },
        { id: 'right', label: 'Right', x: WIDTH, y: centerY, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Right connection' },
        { id: 'branch', label: 'Branch', x: centerX, y: HEIGHT, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Branch connection' },
      ];
      break;

    case 'Y':
      // Y-junction: one input splits to two outputs
      wires = `
        <!-- Input wire from left -->
        <line x1="0" y1="${centerY}" x2="${centerX}" y2="${centerY}"
              stroke="${c.wireColor}" stroke-width="${wireWidth}" stroke-linecap="round"/>
        <!-- Upper branch -->
        <line x1="${centerX}" y1="${centerY}" x2="${WIDTH}" y2="10"
              stroke="${c.wireColor}" stroke-width="${wireWidth}" stroke-linecap="round"/>
        <!-- Lower branch -->
        <line x1="${centerX}" y1="${centerY}" x2="${WIDTH}" y2="40"
              stroke="${c.wireColor}" stroke-width="${wireWidth}" stroke-linecap="round"/>
      `;
      connectionPoints = [
        { id: 'input', label: 'Input', x: 0, y: centerY, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Input connection' },
        { id: 'output1', label: 'Out 1', x: WIDTH, y: 10, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Output 1' },
        { id: 'output2', label: 'Out 2', x: WIDTH, y: 40, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Output 2' },
      ];
      break;

    case 'inline':
      // Inline splice: simple 2-point connection
      wires = `
        <!-- Horizontal wire through center -->
        <line x1="0" y1="${centerY}" x2="${WIDTH}" y2="${centerY}"
              stroke="${c.wireColor}" stroke-width="${wireWidth}" stroke-linecap="round"/>
      `;
      connectionPoints = [
        { id: 'wire1', label: 'Wire 1', x: 0, y: centerY, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Wire 1 connection' },
        { id: 'wire2', label: 'Wire 2', x: WIDTH, y: centerY, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Wire 2 connection' },
      ];
      break;

    case 'tap':
      // Tap: horizontal main wire with perpendicular tap up
      wires = `
        <!-- Main horizontal wire -->
        <line x1="0" y1="${centerY}" x2="${WIDTH}" y2="${centerY}"
              stroke="${c.wireColor}" stroke-width="${wireWidth}" stroke-linecap="round"/>
        <!-- Tap wire going up -->
        <line x1="${centerX}" y1="${centerY}" x2="${centerX}" y2="0"
              stroke="${c.wireColor}" stroke-width="${wireWidth}" stroke-linecap="round"/>
      `;
      connectionPoints = [
        { id: 'main-in', label: 'Main In', x: 0, y: centerY, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Main wire input' },
        { id: 'main-out', label: 'Main Out', x: WIDTH, y: centerY, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Main wire output' },
        { id: 'tap', label: 'Tap', x: centerX, y: 0, type: 'power', color: c.wireColor, shape: 'circle', radius: 4, description: 'Tap connection' },
      ];
      break;
  }

  // Junction dot (solder point)
  const junctionDot = c.showSolder ? `
    <defs>
      <radialGradient id="solder-${uniqueId}" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stop-color="#e0e0e0"/>
        <stop offset="100%" stop-color="${c.dotColor}"/>
      </radialGradient>
    </defs>
    <circle cx="${centerX}" cy="${centerY}" r="${c.dotSize}"
            fill="url(#solder-${uniqueId})" stroke="#888" stroke-width="0.5"/>
  ` : `
    <circle cx="${centerX}" cy="${centerY}" r="${c.dotSize - 1}"
            fill="${c.dotColor}" stroke="${c.wireColor}" stroke-width="1"/>
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      ${wires}
      ${junctionDot}
    </svg>
  `;

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
