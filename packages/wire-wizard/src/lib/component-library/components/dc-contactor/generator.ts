/**
 * DC Contactor SVG Generator
 *
 * High-current DC contactor (MZJ style). 2 main power studs + 2 coil control terminals.
 * Native viewBox 160×200. `flipHorizontal` mirrors the body and lugs left↔right
 * (text in the body label reads backwards in flipped mode). Scale is handled
 * generically by the component-library registry — see `withScale` in
 * `component-library/index.ts`.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface DCContactorConfig {
  modelLabel?: string;
  coilVoltage?: number;
  currentRating?: number;
  capColor?: string;
  bodyColor?: string;
  flipHorizontal?: boolean;
}

const DEFAULT_CONFIG: Required<DCContactorConfig> = {
  modelLabel: 'MZJ-600A',
  coilVoltage: 48,
  currentRating: 600,
  capColor: '#e6a030',
  bodyColor: '#c0c8d0',
  flipHorizontal: false,
};

const NATIVE_W = 160;
const NATIVE_H = 200;

export function getDimensions(): { width: number; height: number } {
  return { width: NATIVE_W, height: NATIVE_H };
}

export function generate(config: DCContactorConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const flip = c.flipHorizontal;
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const capDark = adjustBrightness(c.capColor, -20);
  const capLight = adjustBrightness(c.capColor, 20);
  const bodyDark = adjustBrightness(c.bodyColor, -15);
  const bodyLight = adjustBrightness(c.bodyColor, 15);

  const W = NATIVE_W;
  const H = NATIVE_H;

  // Optional horizontal flip wrapper.
  const transform = flip ? `translate(${NATIVE_W}, 0) scale(-1, 1)` : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="cap-grad-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${capLight}"/>
          <stop offset="50%" stop-color="${c.capColor}"/>
          <stop offset="100%" stop-color="${capDark}"/>
        </linearGradient>
        <linearGradient id="body-grad-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${bodyDark}"/>
          <stop offset="30%" stop-color="${bodyLight}"/>
          <stop offset="70%" stop-color="${bodyLight}"/>
          <stop offset="100%" stop-color="${bodyDark}"/>
        </linearGradient>
        <radialGradient id="stud-grad-${uniqueId}" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#b8b8b8"/>
          <stop offset="100%" stop-color="#808080"/>
        </radialGradient>
        <linearGradient id="nut-grad-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d0d0d0"/>
          <stop offset="50%" stop-color="#909090"/>
          <stop offset="100%" stop-color="#606060"/>
        </linearGradient>
      </defs>

      <g${transform ? ` transform="${transform}"` : ''}>
        <!-- Mounting bracket (behind body) -->
        <path d="M 25 100 L 15 100 L 15 160 L 25 160 L 25 155 L 20 155 L 20 105 L 25 105 Z"
              fill="#888" stroke="#666" stroke-width="1"/>
        <path d="M 135 100 L 145 100 L 145 160 L 135 160 L 135 155 L 140 155 L 140 105 L 135 105 Z"
              fill="#888" stroke="#666" stroke-width="1"/>

        <!-- Mounting holes -->
        <circle cx="17" cy="130" r="4" fill="#444"/>
        <circle cx="143" cy="130" r="4" fill="#444"/>

        <!-- Main cylindrical body (silver/metal) -->
        <rect x="30" y="80" width="100" height="110" rx="5"
              fill="url(#body-grad-${uniqueId})" stroke="#888" stroke-width="1"/>

        <!-- Body ridges -->
        <line x1="30" y1="95" x2="130" y2="95" stroke="#999" stroke-width="0.5"/>
        <line x1="30" y1="175" x2="130" y2="175" stroke="#999" stroke-width="0.5"/>

        <!-- Label area -->
        <rect x="40" y="105" width="80" height="60" rx="2" fill="#f8f8f8" stroke="#ccc" stroke-width="1"/>
        <text x="80" y="120" text-anchor="middle" font-family="Arial" font-size="7" fill="#333">DC contactor</text>
        <text x="80" y="132" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#000">${escapeXml(c.modelLabel)}</text>
        <text x="80" y="145" text-anchor="middle" font-family="Arial" font-size="6" fill="#555">Coil: ${c.coilVoltage}V DC</text>
        <text x="80" y="155" text-anchor="middle" font-family="Arial" font-size="6" fill="#555">Rated: ${c.currentRating}A</text>

        <!-- Orange top cap (dome shape) -->
        <ellipse cx="80" cy="75" rx="55" ry="12" fill="${capDark}" stroke="#b8862a" stroke-width="1"/>
        <rect x="25" y="50" width="110" height="25" rx="3" fill="url(#cap-grad-${uniqueId})" stroke="#b8862a" stroke-width="1"/>
        <ellipse cx="80" cy="50" rx="55" ry="12" fill="url(#cap-grad-${uniqueId})" stroke="#b8862a" stroke-width="1"/>

        <!-- Dome top -->
        <ellipse cx="80" cy="35" rx="30" ry="15" fill="url(#cap-grad-${uniqueId})" stroke="#b8862a" stroke-width="1"/>
        <ellipse cx="80" cy="35" rx="20" ry="8" fill="${capLight}" opacity="0.4"/>

        <!-- Main Power Studs (top - high current) -->
        <g transform="translate(40, 20)">
          <rect x="-4" y="0" width="8" height="25" fill="url(#stud-grad-${uniqueId})" stroke="#666" stroke-width="0.5"/>
          <polygon points="-8,8 8,8 6,2 -6,2" fill="url(#nut-grad-${uniqueId})" stroke="#555" stroke-width="0.5"/>
          <circle cx="0" cy="0" r="4" fill="url(#stud-grad-${uniqueId})" stroke="#666" stroke-width="0.5"/>
        </g>
        <g transform="translate(120, 20)">
          <rect x="-4" y="0" width="8" height="25" fill="url(#stud-grad-${uniqueId})" stroke="#666" stroke-width="0.5"/>
          <polygon points="-8,8 8,8 6,2 -6,2" fill="url(#nut-grad-${uniqueId})" stroke="#555" stroke-width="0.5"/>
          <circle cx="0" cy="0" r="4" fill="url(#stud-grad-${uniqueId})" stroke="#666" stroke-width="0.5"/>
        </g>

        <!-- Coil Terminals -->
        <g transform="translate(35, 55)">
          <rect x="-3" y="-10" width="6" height="15" fill="url(#stud-grad-${uniqueId})" stroke="#666" stroke-width="0.5"/>
          <polygon points="-5,-5 5,-5 4,-9 -4,-9" fill="url(#nut-grad-${uniqueId})" stroke="#555" stroke-width="0.5"/>
          <text x="0" y="12" text-anchor="middle" font-size="6" fill="#333">A1</text>
        </g>
        <g transform="translate(125, 55)">
          <rect x="-3" y="-10" width="6" height="15" fill="url(#stud-grad-${uniqueId})" stroke="#666" stroke-width="0.5"/>
          <polygon points="-5,-5 5,-5 4,-9 -4,-9" fill="url(#nut-grad-${uniqueId})" stroke="#555" stroke-width="0.5"/>
          <text x="0" y="12" text-anchor="middle" font-size="6" fill="#333">A2</text>
        </g>

        <!-- Bottom cap/base -->
        <ellipse cx="80" cy="190" rx="25" ry="8" fill="#333" stroke="#222" stroke-width="1"/>
        <rect x="55" y="180" width="50" height="10" fill="#333" stroke="#222" stroke-width="1"/>
      </g>
    </svg>
  `;

  // Native connection-point positions; mirror x when flipped.
  const px = (nx: number) => (flip ? NATIVE_W - nx : nx);
  const py = (ny: number) => ny;

  // When flipped, the LEFT lug visually corresponds to MAIN 2 / A2.
  const main1Label = flip ? 'MAIN 2' : 'MAIN 1';
  const main2Label = flip ? 'MAIN 1' : 'MAIN 2';
  const a1Label = flip ? 'A2' : 'A1';
  const a2Label = flip ? 'A1' : 'A2';

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'main-1',
      label: main1Label,
      x: px(40),
      y: py(20),
      type: 'power',
      shape: 'circle',
      radius: 6,
    },
    {
      id: 'main-2',
      label: main2Label,
      x: px(120),
      y: py(20),
      type: 'power',
      shape: 'circle',
      radius: 6,
    },
    {
      id: 'coil-a1',
      label: a1Label,
      x: px(35),
      y: py(45),
      type: 'signal',
      shape: 'circle',
      radius: 4,
    },
    {
      id: 'coil-a2',
      label: a2Label,
      x: px(125),
      y: py(45),
      type: 'signal',
      shape: 'circle',
      radius: 4,
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

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default { generate, getDimensions };
