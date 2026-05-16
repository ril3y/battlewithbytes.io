/**
 * XT60/XT90 Connector SVG Generator
 *
 * Generates SVG markup for XT-series power connectors with realistic appearance.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface XTConnectorConfig {
  size?: 'XT60' | 'XT90';
  gender?: 'male' | 'female';
  housingColor?: string;
  showRating?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const DEFAULT_CONFIG: Required<XTConnectorConfig> = {
  size: 'XT60',
  gender: 'male',
  housingColor: '#f1c40f',
  showRating: true,
  orientation: 'horizontal',
};

const SIZES = {
  XT60: { width: 55, height: 40, pinRadius: 4, spacing: 16 },
  XT90: { width: 70, height: 50, pinRadius: 6, spacing: 22 },
};

export function getDimensions(config: XTConnectorConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };
  const size = SIZES[c.size];
  return { width: size.width, height: size.height };
}

export function generate(config: XTConnectorConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const size = SIZES[c.size];
  const { width, height, pinRadius, spacing } = size;
  const centerX = width / 2;
  const centerY = height / 2;

  // Chamfer position for polarization key
  const chamferSize = 8;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <!-- Housing gradient -->
        <linearGradient id="housing-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c.housingColor}"/>
          <stop offset="50%" stop-color="${c.housingColor}ee"/>
          <stop offset="100%" stop-color="${c.housingColor}bb"/>
        </linearGradient>
        <!-- Pin gradient (gold plated) -->
        <radialGradient id="pin-${uniqueId}" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stop-color="#ffd700"/>
          <stop offset="100%" stop-color="#daa520"/>
        </radialGradient>
        <!-- Socket gradient (dark interior) -->
        <radialGradient id="socket-${uniqueId}" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#444"/>
          <stop offset="100%" stop-color="#222"/>
        </radialGradient>
      </defs>

      <!-- Housing body with chamfered corner (polarization) -->
      <path d="M 5 5
               L ${width - chamferSize - 5} 5
               L ${width - 5} ${chamferSize + 5}
               L ${width - 5} ${height - 5}
               L 5 ${height - 5}
               Z"
            fill="url(#housing-${uniqueId})" stroke="${c.housingColor}88" stroke-width="1.5"/>

      <!-- Chamfer indicator line -->
      <line x1="${width - chamferSize - 5}" y1="5"
            x2="${width - 5}" y2="${chamferSize + 5}"
            stroke="${c.housingColor}66" stroke-width="2"/>

      <!-- Face plate (slightly darker) -->
      <rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="2"
            fill="${c.housingColor}dd" stroke="${c.housingColor}88" stroke-width="0.5"/>

      <!-- Terminal openings/pins -->
      ${c.gender === 'male' ? `
      <!-- Male pins (protruding) -->
      <circle cx="${centerX - spacing / 2}" cy="${centerY}" r="${pinRadius}"
              fill="url(#pin-${uniqueId})" stroke="#b8860b" stroke-width="1"/>
      <circle cx="${centerX - spacing / 2}" cy="${centerY}" r="${pinRadius - 2}"
              fill="#ffd700" stroke="none"/>

      <circle cx="${centerX + spacing / 2}" cy="${centerY}" r="${pinRadius}"
              fill="url(#pin-${uniqueId})" stroke="#b8860b" stroke-width="1"/>
      <circle cx="${centerX + spacing / 2}" cy="${centerY}" r="${pinRadius - 2}"
              fill="#ffd700" stroke="none"/>
      ` : `
      <!-- Female sockets (recessed) -->
      <circle cx="${centerX - spacing / 2}" cy="${centerY}" r="${pinRadius + 1}"
              fill="url(#socket-${uniqueId})" stroke="#333" stroke-width="1"/>
      <circle cx="${centerX - spacing / 2}" cy="${centerY}" r="${pinRadius - 1}"
              fill="#111" stroke="none"/>

      <circle cx="${centerX + spacing / 2}" cy="${centerY}" r="${pinRadius + 1}"
              fill="url(#socket-${uniqueId})" stroke="#333" stroke-width="1"/>
      <circle cx="${centerX + spacing / 2}" cy="${centerY}" r="${pinRadius - 1}"
              fill="#111" stroke="none"/>
      `}

      <!-- Polarity markings -->
      <text x="${centerX - spacing / 2}" y="${centerY - pinRadius - 4}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#cc0000">+</text>
      <text x="${centerX + spacing / 2}" y="${centerY - pinRadius - 4}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#333">-</text>

      ${c.showRating ? `
      <!-- Size label -->
      <text x="${centerX}" y="${height - 3}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#886600">
        ${c.size}
      </text>
      ` : ''}

      <!-- Gender indicator -->
      <text x="3" y="${height - 3}" text-anchor="start"
            font-family="Arial, sans-serif" font-size="5" fill="#88660088">
        ${c.gender === 'male' ? 'M' : 'F'}
      </text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'positive',
      label: '+',
      x: centerX - spacing / 2,
      y: centerY,
      type: 'power',
      color: '#cc0000',
      shape: 'circle',
      radius: pinRadius,
      description: 'Positive terminal',
    },
    {
      id: 'negative',
      label: '-',
      x: centerX + spacing / 2,
      y: centerY,
      type: 'ground',
      color: '#333333',
      shape: 'circle',
      radius: pinRadius,
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
