/**
 * Ring Terminal / Lug SVG Generator
 *
 * Generates SVG markup for a crimp ring terminal with realistic appearance.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface RingTerminalConfig {
  wireGauge?: number;
  studSize?: number;
  insulation?: 'bare' | 'vinyl' | 'heat-shrink' | 'nylon';
  insulationColor?: string;
  material?: 'copper' | 'tinned';
  orientation?: 'horizontal' | 'vertical';
}

const DEFAULT_CONFIG: Required<RingTerminalConfig> = {
  wireGauge: 10,
  studSize: 8,
  insulation: 'vinyl',
  insulationColor: '#3498db',
  material: 'tinned',
  orientation: 'horizontal',
};

const WIDTH = 60;
const HEIGHT = 35;

export function getDimensions(config: RingTerminalConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };
  if (c.orientation === 'vertical') {
    return { width: HEIGHT, height: WIDTH };
  }
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: RingTerminalConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  // Material colors
  const metalColor = c.material === 'copper' ? '#b87333' : '#c0c0c0';
  const metalHighlight = c.material === 'copper' ? '#d4956a' : '#e0e0e0';
  const metalShadow = c.material === 'copper' ? '#8b5a2b' : '#888888';

  // Ring dimensions based on stud size
  const ringOuterRadius = Math.max(10, c.studSize + 4);
  const ringInnerRadius = Math.max(4, c.studSize / 2);
  const ringCenterX = ringOuterRadius + 5;
  const centerY = HEIGHT / 2;

  // Barrel dimensions based on wire gauge
  const barrelWidth = Math.max(20, 30 - c.wireGauge);
  const barrelHeight = Math.max(8, 16 - c.wireGauge / 2);
  const barrelStartX = ringCenterX + ringOuterRadius - 2;

  // Insulation sleeve
  const hasInsulation = c.insulation !== 'bare';
  const sleeveStartX = barrelStartX + barrelWidth * 0.3;
  const sleeveWidth = barrelWidth * 0.7 + 8;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <!-- Metal gradient -->
        <linearGradient id="metal-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${metalHighlight}"/>
          <stop offset="50%" stop-color="${metalColor}"/>
          <stop offset="100%" stop-color="${metalShadow}"/>
        </linearGradient>
        <!-- Ring gradient (radial for 3D effect) -->
        <radialGradient id="ring-${uniqueId}" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stop-color="${metalHighlight}"/>
          <stop offset="100%" stop-color="${metalColor}"/>
        </radialGradient>
        <!-- Insulation gradient -->
        <linearGradient id="insulation-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c.insulationColor}"/>
          <stop offset="50%" stop-color="${c.insulationColor}"/>
          <stop offset="100%" stop-color="${c.insulationColor}88"/>
        </linearGradient>
      </defs>

      <!-- Crimp barrel (metal part) -->
      <rect x="${barrelStartX}" y="${centerY - barrelHeight / 2}"
            width="${barrelWidth}" height="${barrelHeight}" rx="2"
            fill="url(#metal-${uniqueId})" stroke="${metalShadow}" stroke-width="0.5"/>

      <!-- Crimp lines on barrel -->
      <line x1="${barrelStartX + 4}" y1="${centerY - barrelHeight / 2 + 2}"
            x2="${barrelStartX + 4}" y2="${centerY + barrelHeight / 2 - 2}"
            stroke="${metalShadow}" stroke-width="0.5"/>
      <line x1="${barrelStartX + 8}" y1="${centerY - barrelHeight / 2 + 2}"
            x2="${barrelStartX + 8}" y2="${centerY + barrelHeight / 2 - 2}"
            stroke="${metalShadow}" stroke-width="0.5"/>

      ${hasInsulation ? `
      <!-- Insulation sleeve -->
      <rect x="${sleeveStartX}" y="${centerY - barrelHeight / 2 - 2}"
            width="${sleeveWidth}" height="${barrelHeight + 4}" rx="3"
            fill="url(#insulation-${uniqueId})" stroke="${c.insulationColor}88" stroke-width="0.5"/>
      ` : ''}

      <!-- Ring lug (outer) -->
      <circle cx="${ringCenterX}" cy="${centerY}" r="${ringOuterRadius}"
              fill="url(#ring-${uniqueId})" stroke="${metalShadow}" stroke-width="1"/>

      <!-- Ring hole (inner) -->
      <circle cx="${ringCenterX}" cy="${centerY}" r="${ringInnerRadius}"
              fill="#333" stroke="${metalShadow}" stroke-width="0.5"/>

      <!-- Ring hole highlight -->
      <circle cx="${ringCenterX - 1}" cy="${centerY - 1}" r="${ringInnerRadius - 1}"
              fill="none" stroke="#555" stroke-width="0.5"/>

      <!-- Size label -->
      <text x="${WIDTH / 2}" y="${HEIGHT - 3}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="6" fill="#888">
        ${c.wireGauge}AWG / M${c.studSize}
      </text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'ring',
      label: 'Ring',
      x: ringCenterX,
      y: centerY,
      type: 'power',
      color: metalColor,
      shape: 'ring',
      radius: ringInnerRadius,
      description: `Ring terminal for M${c.studSize} stud`,
    },
    {
      id: 'wire',
      label: 'Wire',
      x: WIDTH,
      y: centerY,
      type: 'power',
      color: hasInsulation ? c.insulationColor : metalColor,
      shape: 'circle',
      radius: 4,
      description: `${c.wireGauge} AWG wire connection`,
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
