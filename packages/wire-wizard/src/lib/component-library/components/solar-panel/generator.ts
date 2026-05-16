/**
 * Solar Panel SVG Generator
 *
 * Generates a photorealistic solar panel (PV module) with configurable
 * power rating and voltage.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import {
  lightenColor,
  darkenColor,
} from '../../utils/colorUtils';
import {
  wrapSvg,
  textLabel,
} from '../../utils/svgUtils';

export interface SolarPanelConfig {
  power?: number;    // Watts
  voltage?: number;  // Volts (Vmpp)
  cellColor?: string;
  frameColor?: string;
}

const DEFAULT_CONFIG: Required<SolarPanelConfig> = {
  power: 100,
  voltage: 12,
  cellColor: '#1e3799', // Royal blue
  frameColor: '#bdc3c7', // Silver/Aluminum
};

// Dimensions
const WIDTH = 120;
const HEIGHT = 180;

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: SolarPanelConfig = {}): GeneratorResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { power, voltage, cellColor, frameColor } = mergedConfig;

  // Generate Defs
  const defs = `
    <linearGradient id="cell-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${lightenColor(cellColor, 20)}"/>
      <stop offset="100%" style="stop-color:${darkenColor(cellColor, 10)}"/>
    </linearGradient>
  `;

  let content = '';

  // Frame
  content += `
    <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="2" fill="${frameColor}" stroke="${darkenColor(frameColor, 20)}" stroke-width="2"/>
  `;

  // Inner Cell Area
  const margin = 5;
  const innerWidth = WIDTH - (margin * 2);
  // Full height cells

  // Cells background
  content += `
    <rect x="${margin}" y="${margin}" width="${innerWidth}" height="${HEIGHT - margin * 2}" fill="url(#cell-gradient)"/>
  `;

  // Grid lines
  // 3 columns, 4 rows roughly
  content += `
    <g stroke="rgba(255,255,255,0.2)" stroke-width="1">
      <!-- Horizontal lines -->
      <line x1="${margin}" y1="${HEIGHT / 4}" x2="${WIDTH - margin}" y2="${HEIGHT / 4}" />
      <line x1="${margin}" y1="${HEIGHT / 2}" x2="${WIDTH - margin}" y2="${HEIGHT / 2}" />
      <line x1="${margin}" y1="${HEIGHT * 0.75}" x2="${WIDTH - margin}" y2="${HEIGHT * 0.75}" />
      
      <!-- Vertical lines -->
      <line x1="${WIDTH / 3}" y1="${margin}" x2="${WIDTH / 3}" y2="${HEIGHT - margin}" />
      <line x1="${WIDTH * 0.66}" y1="${margin}" x2="${WIDTH * 0.66}" y2="${HEIGHT - margin}" />
    </g>
  `;

  // Junction Box / Label Area (near bottom)
  content += `
    <rect x="${WIDTH / 2 - 30}" y="${HEIGHT - 40}" width="60" height="25" rx="2" fill="rgba(0,0,0,0.7)"/>
  `;

  content += textLabel(WIDTH / 2, HEIGHT - 32, `${power}W Solar`, {
    fontSize: 10,
    fill: '#fff',
    bold: true
  });

  content += textLabel(WIDTH / 2, HEIGHT - 20, `${voltage}V System`, {
    fontSize: 9,
    fill: '#ccc'
  });

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'pos',
      label: 'PV+',
      x: 30,
      y: HEIGHT,
      type: 'power',
      color: '#cc0000',
      shape: 'circle',
      radius: 6,
      voltage: voltage,
      labelOffsetY: 10
    },
    {
      id: 'neg',
      label: 'PV-',
      x: 90,
      y: HEIGHT,
      type: 'power',
      color: '#000000',
      shape: 'circle',
      radius: 6,
      voltage: 0,
      labelOffsetY: 10
    }
  ];

  return {
    svg: wrapSvg(content, WIDTH, HEIGHT, defs),
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints
  };
}
