/**
 * Precharge Resistor SVG Generator
 *
 * Inline ring-terminal power resistor — wired across the main terminals of a DC
 * contactor to precharge motor controller capacitance before the contacts close.
 *
 * Native viewBox 140×30. Scale is applied generically by the registry wrapper
 * (see `withScale` in component-library/index.ts).
 *
 * Layout: [ring lug] -- [shrink] -- [body w/ bands] -- [shrink] -- [ring lug]
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import { darkenColor, lightenColor } from '../../utils/colorUtils';

export interface PrechargeResistorConfig {
  resistance?: number;
  wattage?: number;
  bodyColor?: string;
  terminalColor?: string;
  studSize?: 'M6' | 'M8' | 'M10';
  showValue?: boolean;
}

const DEFAULT_CONFIG: Required<PrechargeResistorConfig> = {
  resistance: 100,
  wattage: 25,
  bodyColor: '#5fa8c0',
  terminalColor: '#cc0000',
  studSize: 'M8',
  showValue: true,
};

const W = 140;
const H = 30;

// 4-band resistor color code (digits + multiplier + tolerance).
const DIGIT_COLORS = [
  '#1a1a1a', '#8b4513', '#e74c3c', '#e67e22', '#f1c40f',
  '#2ecc71', '#3498db', '#9b59b6', '#7f8c8d', '#ecf0f1',
];
const MULTIPLIER_COLORS: Record<number, string> = {
  [-2]: '#bdc3c7', [-1]: '#d4af37', [0]: '#1a1a1a', [1]: '#8b4513',
  [2]: '#e74c3c', [3]: '#e67e22', [4]: '#f1c40f', [5]: '#2ecc71',
};
const TOLERANCE_GOLD = '#d4af37';

function computeBandColors(resistance: number): [string, string, string, string] {
  if (!Number.isFinite(resistance) || resistance <= 0) {
    return [TOLERANCE_GOLD, '#1a1a1a', '#1a1a1a', TOLERANCE_GOLD];
  }
  let mag = Math.floor(Math.log10(resistance));
  let scaled = resistance / Math.pow(10, mag - 1);
  if (scaled < 10) {
    scaled *= 10;
    mag -= 1;
  }
  const d1 = Math.floor(scaled / 10) % 10;
  const d2 = Math.floor(scaled) % 10;
  const multExp = mag - 1;
  return [
    DIGIT_COLORS[d1] || '#1a1a1a',
    DIGIT_COLORS[d2] || '#1a1a1a',
    MULTIPLIER_COLORS[multExp] || '#1a1a1a',
    TOLERANCE_GOLD,
  ];
}

function studHoleRadius(studSize: 'M6' | 'M8' | 'M10'): number {
  return studSize === 'M6' ? 2 : studSize === 'M8' ? 2.5 : 3;
}

export function getDimensions(): { width: number; height: number } {
  return { width: W, height: H };
}

export function generate(config: PrechargeResistorConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const id = Math.random().toString(36).substring(2, 9);

  const bodyLight = lightenColor(c.bodyColor, 25);
  const bodyDark = darkenColor(c.bodyColor, 35);
  const shrinkDark = darkenColor(c.terminalColor, 30);
  const shrinkLight = lightenColor(c.terminalColor, 15);
  const [b1, b2, b3, b4] = computeBandColors(c.resistance);

  const leftRingCx = 9;
  const rightRingCx = 131;
  const studR = studHoleRadius(c.studSize);

  const valueLabel = `${c.resistance}Ω ${c.wattage}W`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <radialGradient id="ring-grad-${id}" cx="30%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#f7f7f7"/>
          <stop offset="55%" stop-color="#bcbcbc"/>
          <stop offset="100%" stop-color="#7a7a7a"/>
        </radialGradient>
        <linearGradient id="shrink-grad-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${shrinkLight}"/>
          <stop offset="50%" stop-color="${c.terminalColor}"/>
          <stop offset="100%" stop-color="${shrinkDark}"/>
        </linearGradient>
        <linearGradient id="body-grad-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${bodyLight}"/>
          <stop offset="50%" stop-color="${c.bodyColor}"/>
          <stop offset="100%" stop-color="${bodyDark}"/>
        </linearGradient>
      </defs>

      <!-- LEFT RING TERMINAL -->
      <circle cx="${leftRingCx}" cy="15" r="8" fill="url(#ring-grad-${id})" stroke="#666" stroke-width="0.4"/>
      <circle cx="${leftRingCx}" cy="15" r="${studR}" fill="#1a1a1a" stroke="#444" stroke-width="0.3"/>
      <rect x="14" y="11" width="9" height="8" fill="url(#ring-grad-${id})" stroke="#666" stroke-width="0.3"/>

      <!-- LEFT HEAT SHRINK -->
      <rect x="20" y="10" width="20" height="10" rx="2" fill="url(#shrink-grad-${id})" stroke="${shrinkDark}" stroke-width="0.4"/>

      <!-- Visible lead between shrink and body -->
      <line x1="40" y1="15" x2="48" y2="15" stroke="#a8a8a8" stroke-width="0.9"/>

      <!-- RESISTOR BODY -->
      <ellipse cx="48" cy="15" rx="2.5" ry="6.5" fill="url(#body-grad-${id})" stroke="${bodyDark}" stroke-width="0.4"/>
      <rect x="48" y="8.5" width="44" height="13" fill="url(#body-grad-${id})" stroke="${bodyDark}" stroke-width="0.4"/>
      <ellipse cx="92" cy="15" rx="2.5" ry="6.5" fill="url(#body-grad-${id})" stroke="${bodyDark}" stroke-width="0.4"/>

      <!-- Color bands -->
      <rect x="55" y="8.5" width="2" height="13" fill="${b1}"/>
      <rect x="62" y="8.5" width="2" height="13" fill="${b2}"/>
      <rect x="69" y="8.5" width="2" height="13" fill="${b3}"/>
      <rect x="85" y="8.5" width="2" height="13" fill="${b4}"/>

      ${c.showValue ? `<text x="70" y="6" text-anchor="middle" font-family="Arial" font-size="4.5" fill="#aaa">${escapeXml(valueLabel)}</text>` : ''}

      <!-- Visible lead between body and right shrink -->
      <line x1="92" y1="15" x2="100" y2="15" stroke="#a8a8a8" stroke-width="0.9"/>

      <!-- RIGHT HEAT SHRINK -->
      <rect x="100" y="10" width="20" height="10" rx="2" fill="url(#shrink-grad-${id})" stroke="${shrinkDark}" stroke-width="0.4"/>

      <!-- RIGHT RING TERMINAL -->
      <rect x="117" y="11" width="9" height="8" fill="url(#ring-grad-${id})" stroke="#666" stroke-width="0.3"/>
      <circle cx="${rightRingCx}" cy="15" r="8" fill="url(#ring-grad-${id})" stroke="#666" stroke-width="0.4"/>
      <circle cx="${rightRingCx}" cy="15" r="${studR}" fill="#1a1a1a" stroke="#444" stroke-width="0.3"/>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'lug-left',
      label: 'A',
      x: leftRingCx,
      y: 15,
      type: 'power',
      shape: 'circle',
      color: '#ff8800',
      radius: 5,
      description: `Ring terminal (${c.studSize})`,
    },
    {
      id: 'lug-right',
      label: 'B',
      x: rightRingCx,
      y: 15,
      type: 'power',
      shape: 'circle',
      color: '#ff8800',
      radius: 5,
      description: `Ring terminal (${c.studSize})`,
    },
  ];

  return {
    svg,
    dimensions: { width: W, height: H },
    connectionPoints,
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default { generate, getDimensions };
