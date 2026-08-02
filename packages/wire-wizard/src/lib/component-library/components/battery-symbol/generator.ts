/**
 * Battery Symbol SVG Generator
 *
 * Generates SVG markup for a generic battery symbol with configurable cell count.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface BatterySymbolConfig {
  cellCount?: number;
  voltage?: number;
  orientation?: 'vertical' | 'horizontal';
  showVoltageLabel?: boolean;
  positiveColor?: string;
  negativeColor?: string;
}

const DEFAULT_CONFIG: Required<BatterySymbolConfig> = {
  cellCount: 1,
  voltage: 12,
  orientation: 'vertical',
  showVoltageLabel: true,
  positiveColor: '#cc0000',
  negativeColor: '#333333',
};

const BASE_WIDTH = 50;
const CELL_HEIGHT = 20;
const MIN_HEIGHT = 50;

export function getDimensions(config: BatterySymbolConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };
  const cellHeight = Math.max(MIN_HEIGHT, 30 + c.cellCount * CELL_HEIGHT);

  if (c.orientation === 'horizontal') {
    return { width: cellHeight, height: BASE_WIDTH };
  }
  return { width: BASE_WIDTH, height: cellHeight };
}

export function generate(config: BatterySymbolConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };

  const { width, height } = getDimensions(c);
  const centerX = width / 2;

  // Build cells
  let cells = '';
  const cellStartY = 15;
  const cellSpacing = CELL_HEIGHT;

  for (let i = 0; i < c.cellCount; i++) {
    const y = cellStartY + i * cellSpacing;
    // Long line (positive plate)
    cells += `
      <line x1="10" y1="${y}" x2="40" y2="${y}"
            stroke="#333" stroke-width="3" stroke-linecap="round"/>
    `;
    // Short line (negative plate)
    cells += `
      <line x1="17" y1="${y + 8}" x2="33" y2="${y + 8}"
            stroke="#333" stroke-width="3" stroke-linecap="round"/>
    `;
  }

  // Wire connections
  const topY = 0;
  const bottomY = cellStartY + (c.cellCount - 1) * cellSpacing + 8 + 10;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <!-- Positive terminal wire -->
      <line x1="${centerX}" y1="${topY}" x2="${centerX}" y2="${cellStartY}"
            stroke="#333" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Battery cells -->
      ${cells}

      <!-- Negative terminal wire -->
      <line x1="${centerX}" y1="${cellStartY + (c.cellCount - 1) * cellSpacing + 8}"
            x2="${centerX}" y2="${bottomY}"
            stroke="#333" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Positive marker -->
      <text x="${centerX + 18}" y="12" text-anchor="start"
            font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${c.positiveColor}">+</text>

      <!-- Negative marker -->
      <text x="${centerX + 18}" y="${bottomY - 2}" text-anchor="start"
            font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${c.negativeColor}">-</text>

      ${c.showVoltageLabel ? `
      <!-- Voltage label -->
      <text x="${centerX}" y="${height - 2}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#666">
        ${c.voltage}V
      </text>
      ` : ''}
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'positive',
      label: '+',
      x: centerX,
      y: 0,
      type: 'power',
      color: c.positiveColor,
      shape: 'circle',
      radius: 5,
      description: 'Positive terminal',
    },
    {
      id: 'negative',
      label: '-',
      x: centerX,
      y: bottomY,
      type: 'ground',
      color: c.negativeColor,
      shape: 'circle',
      radius: 5,
      description: 'Negative terminal',
    },
  ];

  return {
    svg,
    dimensions: { width, height },
    connectionPoints,
  };
}

export default { generate, getDimensions };
