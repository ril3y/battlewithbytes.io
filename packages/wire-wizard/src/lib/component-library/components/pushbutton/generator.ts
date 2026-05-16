/**
 * Pushbutton Switch SVG Generator
 *
 * Generates SVG markup for a momentary pushbutton switch with realistic appearance.
 * Supports normally-open (NO) and normally-closed (NC) configurations.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface PushbuttonConfig {
  type?: 'NO' | 'NC';
  buttonColor?: string;
  bezelColor?: string;
  isPressed?: boolean;
  label?: string;
  showLabel?: boolean;
}

const DEFAULT_CONFIG: Required<PushbuttonConfig> = {
  type: 'NO',
  buttonColor: '#3498db',
  bezelColor: '#c0c0c0',
  isPressed: false,
  label: '',
  showLabel: false,
};

const WIDTH = 60;
const HEIGHT = 80;

export function getDimensions(config: PushbuttonConfig = {}): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: PushbuttonConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const centerX = WIDTH / 2;
  const buttonRadius = 20;
  const bezelRadius = 25;
  const buttonY = 30;

  // Button depression effect
  const buttonOffset = c.isPressed ? 3 : 0;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <!-- Bezel gradient (metallic) -->
        <radialGradient id="bezel-${uniqueId}" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stop-color="#e8e8e8"/>
          <stop offset="70%" stop-color="${c.bezelColor}"/>
          <stop offset="100%" stop-color="#888"/>
        </radialGradient>
        <!-- Button gradient -->
        <radialGradient id="button-${uniqueId}" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stop-color="${c.buttonColor}"/>
          <stop offset="100%" stop-color="${c.buttonColor}aa"/>
        </radialGradient>
        <!-- Button highlight -->
        <radialGradient id="highlight-${uniqueId}" cx="0.3" cy="0.3" r="0.5">
          <stop offset="0%" stop-color="#ffffff88"/>
          <stop offset="100%" stop-color="#ffffff00"/>
        </radialGradient>
        <!-- Shadow for depth -->
        <filter id="shadow-${uniqueId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- Mounting base -->
      <rect x="10" y="${buttonY + 20}" width="40" height="8" rx="2"
            fill="#444" stroke="#333" stroke-width="0.5"/>

      <!-- Bezel ring -->
      <circle cx="${centerX}" cy="${buttonY}" r="${bezelRadius}"
              fill="url(#bezel-${uniqueId})" stroke="#666" stroke-width="1"
              filter="url(#shadow-${uniqueId})"/>

      <!-- Inner bezel ring -->
      <circle cx="${centerX}" cy="${buttonY}" r="${bezelRadius - 3}"
              fill="none" stroke="#999" stroke-width="1"/>

      <!-- Button shadow (when not pressed) -->
      ${!c.isPressed ? `
      <ellipse cx="${centerX}" cy="${buttonY + 2}" rx="${buttonRadius - 2}" ry="6"
               fill="#00000033"/>
      ` : ''}

      <!-- Button cap -->
      <circle cx="${centerX}" cy="${buttonY + buttonOffset}" r="${buttonRadius}"
              fill="url(#button-${uniqueId})" stroke="${c.buttonColor}88" stroke-width="1"/>

      <!-- Button highlight -->
      <circle cx="${centerX - 5}" cy="${buttonY + buttonOffset - 5}" r="${buttonRadius - 5}"
              fill="url(#highlight-${uniqueId})"/>

      <!-- Button label -->
      ${c.showLabel && c.label ? `
      <text x="${centerX}" y="${buttonY + buttonOffset + 4}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#fff">
        ${c.label}
      </text>
      ` : ''}

      <!-- Terminal blocks at bottom -->
      <rect x="15" y="60" width="12" height="15" rx="1"
            fill="#d4a574" stroke="#aa8855" stroke-width="0.5"/>
      <circle cx="21" cy="65" r="2" fill="#886633"/>

      <rect x="33" y="60" width="12" height="15" rx="1"
            fill="#d4a574" stroke="#aa8855" stroke-width="0.5"/>
      <circle cx="39" cy="65" r="2" fill="#886633"/>

      <!-- Type indicator -->
      <text x="${centerX}" y="${HEIGHT - 2}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="7" fill="#888">
        ${c.type}
      </text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'term1',
      label: 'T1',
      x: 21,
      y: HEIGHT,
      type: 'power',
      color: '#d4a574',
      shape: 'circle',
      radius: 5,
      description: c.type === 'NO' ? 'Common terminal' : 'NC terminal 1',
    },
    {
      id: 'term2',
      label: 'T2',
      x: 39,
      y: HEIGHT,
      type: 'power',
      color: '#d4a574',
      shape: 'circle',
      radius: 5,
      description: c.type === 'NO' ? 'NO terminal' : 'NC terminal 2',
    },
  ];

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
