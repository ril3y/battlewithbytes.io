/**
 * Flyback Diode SVG Generator
 *
 * Inline ring-terminal diode assembly — wired across a DC contactor's coil to
 * suppress the flyback voltage spike when the coil de-energizes.
 *
 * Native viewBox 120×26. Scale is applied generically by the registry wrapper
 * (see `withScale` in component-library/index.ts).
 *
 * Layout: [ring lug] -- [shrink] -- [diode body w/ cathode band] -- [shrink] -- [ring lug]
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import { darkenColor, lightenColor } from '../../utils/colorUtils';

export interface FlybackDiodeConfig {
  voltage?: number;
  current?: number;
  cathodeOnRight?: boolean;
  diodeBodyColor?: string;
  terminalColor?: string;
  studSize?: 'M6' | 'M8' | 'M10';
  showValue?: boolean;
}

const DEFAULT_CONFIG: Required<FlybackDiodeConfig> = {
  voltage: 600,
  current: 6,
  cathodeOnRight: true,
  diodeBodyColor: '#1a1a1a',
  terminalColor: '#cc0000',
  studSize: 'M8',
  showValue: true,
};

const W = 120;
const H = 26;

function studHoleRadius(studSize: 'M6' | 'M8' | 'M10'): number {
  return studSize === 'M6' ? 1.8 : studSize === 'M8' ? 2.3 : 2.8;
}

export function getDimensions(): { width: number; height: number } {
  return { width: W, height: H };
}

export function generate(config: FlybackDiodeConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const id = Math.random().toString(36).substring(2, 9);

  const bodyLight = lightenColor(c.diodeBodyColor, 18);
  const bodyDark = darkenColor(c.diodeBodyColor, 35);
  const shrinkDark = darkenColor(c.terminalColor, 30);
  const shrinkLight = lightenColor(c.terminalColor, 15);

  const leftRingCx = 8;
  const rightRingCx = 112;
  const studR = studHoleRadius(c.studSize);

  // Cathode band placement on the body.
  const bandX = c.cathodeOnRight ? 67 : 49;

  const valueLabel = `${c.voltage}V ${c.current}A`;

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
          <stop offset="50%" stop-color="${c.diodeBodyColor}"/>
          <stop offset="100%" stop-color="${bodyDark}"/>
        </linearGradient>
      </defs>

      <!-- LEFT RING TERMINAL -->
      <circle cx="${leftRingCx}" cy="13" r="7" fill="url(#ring-grad-${id})" stroke="#666" stroke-width="0.4"/>
      <circle cx="${leftRingCx}" cy="13" r="${studR}" fill="#1a1a1a" stroke="#444" stroke-width="0.3"/>
      <rect x="13" y="9.5" width="7" height="7" fill="url(#ring-grad-${id})" stroke="#666" stroke-width="0.3"/>

      <!-- LEFT HEAT SHRINK -->
      <rect x="18" y="9" width="18" height="8" rx="2" fill="url(#shrink-grad-${id})" stroke="${shrinkDark}" stroke-width="0.4"/>

      <!-- Visible lead between shrink and diode body -->
      <line x1="36" y1="13" x2="46" y2="13" stroke="#a8a8a8" stroke-width="0.9"/>

      <!-- DIODE BODY -->
      <ellipse cx="46" cy="13" rx="2" ry="5" fill="url(#body-grad-${id})" stroke="${bodyDark}" stroke-width="0.4"/>
      <rect x="46" y="8" width="28" height="10" fill="url(#body-grad-${id})" stroke="${bodyDark}" stroke-width="0.4"/>
      <ellipse cx="74" cy="13" rx="2" ry="5" fill="url(#body-grad-${id})" stroke="${bodyDark}" stroke-width="0.4"/>

      <!-- Cathode band -->
      <rect x="${bandX}" y="8" width="3" height="10" fill="#e8e8e8" stroke="#bbb" stroke-width="0.25"/>

      ${c.showValue ? `<text x="60" y="6" text-anchor="middle" font-family="Arial" font-size="4.5" fill="#aaa">${escapeXml(valueLabel)}</text>` : ''}

      <!-- Visible lead between diode and right shrink -->
      <line x1="74" y1="13" x2="84" y2="13" stroke="#a8a8a8" stroke-width="0.9"/>

      <!-- RIGHT HEAT SHRINK -->
      <rect x="84" y="9" width="18" height="8" rx="2" fill="url(#shrink-grad-${id})" stroke="${shrinkDark}" stroke-width="0.4"/>

      <!-- RIGHT RING TERMINAL -->
      <rect x="100" y="9.5" width="7" height="7" fill="url(#ring-grad-${id})" stroke="#666" stroke-width="0.3"/>
      <circle cx="${rightRingCx}" cy="13" r="7" fill="url(#ring-grad-${id})" stroke="#666" stroke-width="0.4"/>
      <circle cx="${rightRingCx}" cy="13" r="${studR}" fill="#1a1a1a" stroke="#444" stroke-width="0.3"/>
    </svg>
  `;

  const leftLabel = c.cathodeOnRight ? 'A' : 'K';
  const rightLabel = c.cathodeOnRight ? 'K' : 'A';

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'lug-left',
      label: leftLabel,
      x: leftRingCx,
      y: 13,
      type: 'power',
      shape: 'circle',
      color: '#ff8800',
      radius: 5,
      description: leftLabel === 'A' ? 'Anode' : 'Cathode',
    },
    {
      id: 'lug-right',
      label: rightLabel,
      x: rightRingCx,
      y: 13,
      type: 'power',
      shape: 'circle',
      color: '#ff8800',
      radius: 5,
      description: rightLabel === 'A' ? 'Anode' : 'Cathode',
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
