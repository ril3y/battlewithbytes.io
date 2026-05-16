/**
 * Anderson Connector (SB Series) SVG Generator
 *
 * Generates SVG markup for Anderson SB-series power connectors
 * with realistic appearance and standard color coding.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface AndersonConnectorConfig {
  size?: 'SB50' | 'SB175' | 'SB350';
  housingColor?: string;
  voltage?: 12 | 24 | 36 | 48;
  showLabel?: boolean;
  gender?: 'plug' | 'receptacle';
}

// Standard Anderson color codes by voltage
const VOLTAGE_COLORS: Record<number, string> = {
  12: '#e74c3c',  // Red
  24: '#95a5a6',  // Gray
  36: '#f1c40f',  // Yellow
  48: '#3498db',  // Blue
};

const SIZES = {
  SB50: { width: 60, height: 50, terminalWidth: 8, terminalSpacing: 20 },
  SB175: { width: 75, height: 60, terminalWidth: 12, terminalSpacing: 28 },
  SB350: { width: 95, height: 75, terminalWidth: 16, terminalSpacing: 36 },
};

const DEFAULT_CONFIG: Required<AndersonConnectorConfig> = {
  size: 'SB175',
  housingColor: '',  // Will use voltage-based color if empty
  voltage: 48,
  showLabel: true,
  gender: 'plug',
};

export function getDimensions(config: AndersonConnectorConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };
  const size = SIZES[c.size];
  return { width: size.width, height: size.height };
}

export function generate(config: AndersonConnectorConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const size = SIZES[c.size];
  const { width, height, terminalWidth, terminalSpacing } = size;
  const centerX = width / 2;
  const centerY = height / 2;

  // Determine housing color
  const housingColor = c.housingColor || VOLTAGE_COLORS[c.voltage] || VOLTAGE_COLORS[48];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <!-- Housing gradient -->
        <linearGradient id="housing-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${housingColor}"/>
          <stop offset="50%" stop-color="${housingColor}dd"/>
          <stop offset="100%" stop-color="${housingColor}aa"/>
        </linearGradient>
        <!-- Terminal gradient (silver/nickel plated) -->
        <linearGradient id="term-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e0e0e0"/>
          <stop offset="50%" stop-color="#c0c0c0"/>
          <stop offset="100%" stop-color="#888"/>
        </linearGradient>
        <!-- Socket interior -->
        <radialGradient id="socket-${uniqueId}" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#555"/>
          <stop offset="100%" stop-color="#222"/>
        </radialGradient>
      </defs>

      <!-- Main housing body -->
      <rect x="5" y="5" width="${width - 10}" height="${height - 10}" rx="5"
            fill="url(#housing-${uniqueId})" stroke="${housingColor}88" stroke-width="2"/>

      <!-- Locking tab at top -->
      <rect x="${centerX - 8}" y="2" width="16" height="8" rx="2"
            fill="${housingColor}" stroke="${housingColor}88" stroke-width="1"/>
      <rect x="${centerX - 4}" y="4" width="8" height="4" rx="1"
            fill="${housingColor}88"/>

      <!-- Face recess -->
      <rect x="10" y="15" width="${width - 20}" height="${height - 30}" rx="3"
            fill="${housingColor}cc" stroke="${housingColor}66" stroke-width="1"/>

      <!-- Terminal channels -->
      ${c.gender === 'plug' ? `
      <!-- Blade terminals (plug) -->
      <rect x="${centerX - terminalSpacing / 2 - terminalWidth / 2}" y="${centerY - 12}"
            width="${terminalWidth}" height="24" rx="1"
            fill="url(#term-${uniqueId})" stroke="#888" stroke-width="1"/>
      <rect x="${centerX + terminalSpacing / 2 - terminalWidth / 2}" y="${centerY - 12}"
            width="${terminalWidth}" height="24" rx="1"
            fill="url(#term-${uniqueId})" stroke="#888" stroke-width="1"/>
      ` : `
      <!-- Socket openings (receptacle) -->
      <rect x="${centerX - terminalSpacing / 2 - terminalWidth / 2 - 2}" y="${centerY - 14}"
            width="${terminalWidth + 4}" height="28" rx="2"
            fill="url(#socket-${uniqueId})" stroke="#333" stroke-width="1"/>
      <rect x="${centerX + terminalSpacing / 2 - terminalWidth / 2 - 2}" y="${centerY - 14}"
            width="${terminalWidth + 4}" height="28" rx="2"
            fill="url(#socket-${uniqueId})" stroke="#333" stroke-width="1"/>
      `}

      <!-- Polarity markings -->
      <text x="${centerX - terminalSpacing / 2}" y="${centerY - 18}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="${size.width > 70 ? 12 : 10}" font-weight="bold" fill="#fff">+</text>
      <text x="${centerX + terminalSpacing / 2}" y="${centerY - 18}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="${size.width > 70 ? 14 : 12}" font-weight="bold" fill="#fff">-</text>

      ${c.showLabel ? `
      <!-- Size and voltage label -->
      <text x="${centerX}" y="${height - 8}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#fff">
        ${c.size} ${c.voltage}V
      </text>
      ` : ''}

      <!-- Anderson logo placeholder (simplified) -->
      <text x="${centerX}" y="${height - 18}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="6" fill="#ffffff88">
        ANDERSON
      </text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'positive',
      label: '+',
      x: centerX - terminalSpacing / 2,
      y: centerY,
      type: 'power',
      color: '#cc0000',
      shape: 'blade',
      radius: terminalWidth / 2,
      description: 'Positive terminal',
    },
    {
      id: 'negative',
      label: '-',
      x: centerX + terminalSpacing / 2,
      y: centerY,
      type: 'ground',
      color: '#333333',
      shape: 'blade',
      radius: terminalWidth / 2,
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
