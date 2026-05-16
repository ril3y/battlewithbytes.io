/**
 * Inline Fuse SVG Generator
 *
 * Generates SVG markup for a configurable inline fuse holder.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import { darkenColor } from '../../utils/colorUtils';
import { getFuseColor } from '../../utils/standardColors';

export interface InlineFuseConfig {
  amperage?: number;
  wireColor?: string;
}

const DEFAULT_CONFIG: Required<InlineFuseConfig> = {
  amperage: 10,
  wireColor: '#e74c3c',
};

// Fixed dimensions
const WIDTH = 100;
const HEIGHT = 40;

/**
 * Get inline fuse dimensions (fixed size)
 */
export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

/**
 * Generate the inline fuse component
 */
export function generate(config: InlineFuseConfig = {}): GeneratorResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { amperage, wireColor } = mergedConfig;

  const fuseColor = getFuseColor(amperage);
  const wireDark = darkenColor(wireColor, 20);
  const wireDarker = darkenColor(wireColor, 40);

  // Generate unique IDs to prevent gradient conflicts
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const bodyGradId = `fuse-body-gradient-${uniqueId}`;
  const wireGradId = `wire-gradient-${uniqueId}`;
  const glowId = `glow-${uniqueId}`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="${bodyGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#333;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#444;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#222;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="${wireGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${wireColor};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${wireDark};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${wireDarker};stop-opacity:1" />
        </linearGradient>
        <filter id="${glowId}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Wire Leads -->
      <rect x="0" y="18" width="30" height="4" rx="2" fill="url(#${wireGradId})" />
      <rect x="70" y="18" width="30" height="4" rx="2" fill="url(#${wireGradId})" />

      <!-- Fuse Holder Body -->
      <g transform="translate(25, 5)">
        <!-- Main Housing -->
        <rect x="0" y="5" width="50" height="20" rx="4" fill="url(#${bodyGradId})" stroke="#111" stroke-width="1" />

        <!-- Cap/Seal Left -->
        <rect x="-2" y="5" width="6" height="20" rx="2" fill="#111" />
        <!-- Cap/Seal Right -->
        <rect x="46" y="5" width="6" height="20" rx="2" fill="#111" />

        <!-- Center Window -->
        <rect x="15" y="8" width="20" height="14" rx="2" fill="#000" fill-opacity="0.6" stroke="#222" stroke-width="0.5" />

        <!-- The Fuse Element (Color coded) -->
        <rect x="17" y="10" width="16" height="10" rx="1" fill="${fuseColor}" stroke="#fff" stroke-width="0.5" stroke-opacity="0.3" filter="url(#${glowId})" />

        <!-- Label on top -->
        <text x="25" y="3" text-anchor="middle" font-family="Arial" font-size="6" fill="#888">${amperage}A</text>

        <!-- Ridges for grip -->
        <line x1="10" y1="6" x2="10" y2="24" stroke="#222" stroke-width="1" opacity="0.5" />
        <line x1="40" y1="6" x2="40" y2="24" stroke="#222" stroke-width="1" opacity="0.5" />
      </g>
    </svg>
  `;

  // Connection points
  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'fuse-in',
      label: 'IN',
      x: 0,
      y: 20,
      type: 'power',
      shape: 'circle',
      radius: 4,
    },
    {
      id: 'fuse-out',
      label: 'OUT',
      x: 100,
      y: 20,
      type: 'power',
      shape: 'circle',
      radius: 4,
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

// Default export for auto-discovery
export default {
  generate,
  getDimensions,
};
