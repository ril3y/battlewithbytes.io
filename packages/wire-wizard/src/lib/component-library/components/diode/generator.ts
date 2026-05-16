/**
 * Diode SVG Generator
 *
 * Generates SVG markup for various diode types:
 * - Standard rectifier diode
 * - LED (Light Emitting Diode)
 * - Zener diode
 * - Schottky diode
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface DiodeConfig {
  diodeType?: 'standard' | 'led' | 'zener' | 'schottky';
  bodyColor?: string;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
  ledColor?: string;
  ledGlow?: boolean;
}

const DEFAULT_CONFIG: Required<DiodeConfig> = {
  diodeType: 'standard',
  bodyColor: '#1a1a1a',
  showLabels: true,
  orientation: 'horizontal',
  ledColor: '#ff0000',
  ledGlow: true,
};

const WIDTH = 70;
const HEIGHT = 40;

export function getDimensions(config: DiodeConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };
  if (c.orientation === 'vertical') {
    return { width: HEIGHT, height: WIDTH };
  }
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: DiodeConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const centerY = HEIGHT / 2;
  const triangleSize = 16;
  const triangleX = 25;

  // Build the diode symbol based on type
  let cathodeBar = '';
  let specialElements = '';

  switch (c.diodeType) {
    case 'zener':
      // Zener has bent ends on the cathode bar
      cathodeBar = `
        <path d="M ${triangleX + triangleSize} ${centerY - 12}
                 L ${triangleX + triangleSize - 4} ${centerY - 12}
                 L ${triangleX + triangleSize} ${centerY - 8}
                 L ${triangleX + triangleSize} ${centerY + 8}
                 L ${triangleX + triangleSize + 4} ${centerY + 12}
                 L ${triangleX + triangleSize} ${centerY + 12}"
              fill="none" stroke="${c.bodyColor}" stroke-width="2.5" stroke-linecap="round"/>
      `;
      break;

    case 'schottky':
      // Schottky has S-shaped ends
      cathodeBar = `
        <path d="M ${triangleX + triangleSize - 3} ${centerY - 10}
                 L ${triangleX + triangleSize - 3} ${centerY - 12}
                 L ${triangleX + triangleSize} ${centerY - 12}
                 L ${triangleX + triangleSize} ${centerY + 12}
                 L ${triangleX + triangleSize + 3} ${centerY + 12}
                 L ${triangleX + triangleSize + 3} ${centerY + 10}"
              fill="none" stroke="${c.bodyColor}" stroke-width="2.5" stroke-linecap="round"/>
      `;
      break;

    case 'led':
      // LED has emission arrows
      cathodeBar = `
        <line x1="${triangleX + triangleSize}" y1="${centerY - 12}"
              x2="${triangleX + triangleSize}" y2="${centerY + 12}"
              stroke="${c.bodyColor}" stroke-width="2.5" stroke-linecap="round"/>
      `;
      // Emission arrows
      specialElements = `
        <defs>
          ${c.ledGlow ? `
          <filter id="led-glow-${uniqueId}" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
            <feFlood flood-color="${c.ledColor}" flood-opacity="0.5"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          ` : ''}
        </defs>
        <!-- Emission arrows -->
        <g ${c.ledGlow ? `filter="url(#led-glow-${uniqueId})"` : ''}>
          <line x1="${triangleX + 5}" y1="${centerY - 15}"
                x2="${triangleX + 15}" y2="${centerY - 22}"
                stroke="${c.ledColor}" stroke-width="1.5"/>
          <path d="M ${triangleX + 12} ${centerY - 25} L ${triangleX + 15} ${centerY - 22} L ${triangleX + 11} ${centerY - 21}"
                fill="${c.ledColor}" stroke="none"/>

          <line x1="${triangleX + 10}" y1="${centerY - 12}"
                x2="${triangleX + 20}" y2="${centerY - 19}"
                stroke="${c.ledColor}" stroke-width="1.5"/>
          <path d="M ${triangleX + 17} ${centerY - 22} L ${triangleX + 20} ${centerY - 19} L ${triangleX + 16} ${centerY - 18}"
                fill="${c.ledColor}" stroke="none"/>
        </g>
      `;
      break;

    default:
      // Standard diode - simple vertical bar
      cathodeBar = `
        <line x1="${triangleX + triangleSize}" y1="${centerY - 12}"
              x2="${triangleX + triangleSize}" y2="${centerY + 12}"
              stroke="${c.bodyColor}" stroke-width="2.5" stroke-linecap="round"/>
      `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      ${specialElements}

      <!-- Anode wire -->
      <line x1="0" y1="${centerY}" x2="${triangleX}" y2="${centerY}"
            stroke="${c.bodyColor}" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Triangle (pointing right toward cathode) -->
      <path d="M ${triangleX} ${centerY - 12}
               L ${triangleX + triangleSize} ${centerY}
               L ${triangleX} ${centerY + 12} Z"
            fill="${c.diodeType === 'led' ? c.ledColor : c.bodyColor}"
            stroke="${c.bodyColor}" stroke-width="1"/>

      <!-- Cathode bar -->
      ${cathodeBar}

      <!-- Cathode wire -->
      <line x1="${triangleX + triangleSize}" y1="${centerY}" x2="${WIDTH}" y2="${centerY}"
            stroke="${c.bodyColor}" stroke-width="2.5" stroke-linecap="round"/>

      ${c.showLabels ? `
      <!-- Anode label -->
      <text x="8" y="${centerY + 18}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#888">A</text>
      <!-- Cathode label -->
      <text x="${WIDTH - 8}" y="${centerY + 18}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#888">K</text>
      ` : ''}

      <!-- Type label -->
      <text x="${WIDTH / 2}" y="${HEIGHT - 2}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="7" fill="#666">
        ${c.diodeType.toUpperCase()}
      </text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'anode',
      label: 'A',
      x: 0,
      y: centerY,
      type: 'power',
      color: c.diodeType === 'led' ? c.ledColor : '#888',
      shape: 'circle',
      radius: 4,
      description: 'Anode (positive)',
    },
    {
      id: 'cathode',
      label: 'K',
      x: WIDTH,
      y: centerY,
      type: 'power',
      color: '#888',
      shape: 'circle',
      radius: 4,
      description: 'Cathode (negative)',
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
