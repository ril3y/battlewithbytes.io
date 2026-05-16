/**
 * Power Bus Bar SVG Generator
 *
 * Heavy-duty marine/automotive power distribution bus bar with hex-head studs
 * and an insulating base. Modeled after the common red-positive / black-negative
 * battery distribution bus bars used in DC systems.
 *
 * Top-down view: insulating base with mounting holes at each end, a silver
 * metal bus rail running down the middle, hex-nut studs along the rail, and
 * an optional translucent cover.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import { darkenColor, lightenColor } from '../../utils/colorUtils';

export interface PowerBusBarConfig {
  numberOfStuds?: number;
  studSize?: 'M6' | 'M8' | 'M10';
  baseColor?: string;
  currentRating?: number;
  showCover?: boolean;
  showLabel?: boolean;
}

const DEFAULT_CONFIG: Required<PowerBusBarConfig> = {
  numberOfStuds: 6,
  studSize: 'M8',
  baseColor: '#1a1a1a',
  currentRating: 250,
  showCover: false,
  showLabel: true,
};

const STUD_SPACING = 32;
const END_CAP_W = 22;
const HEIGHT = 56;
const RAIL_INSET_Y = 14;
const RAIL_HEIGHT = HEIGHT - RAIL_INSET_Y * 2;

function studHexRadius(size: 'M6' | 'M8' | 'M10'): number {
  return size === 'M6' ? 6 : size === 'M8' ? 7.5 : 9;
}

export function getDimensions(config: PowerBusBarConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };
  const studs = Math.max(2, Math.floor(c.numberOfStuds));
  const width = END_CAP_W * 2 + studs * STUD_SPACING;
  return { width, height: HEIGHT };
}

export function generate(config: PowerBusBarConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const studs = Math.max(2, Math.floor(c.numberOfStuds));
  const id = Math.random().toString(36).substring(2, 9);
  const { width, height } = getDimensions(c);

  const baseLight = lightenColor(c.baseColor, 18);
  const baseDark = darkenColor(c.baseColor, 35);
  const baseMid = darkenColor(c.baseColor, 8);
  const hexR = studHexRadius(c.studSize);

  // Default connection-point color: a brightened version of the base so it
  // pops on the silver rail and matches the base's intent (red base → red dots).
  const pointColor = isDarkColor(c.baseColor) ? '#ff5252' : lightenColor(c.baseColor, 30);

  let studsSvg = '';
  const connectionPoints: ConnectionPointDefinition[] = [];

  for (let i = 0; i < studs; i++) {
    const cx = END_CAP_W + i * STUD_SPACING + STUD_SPACING / 2;
    const cy = height / 2;

    // Hex nut (flat-top hexagon — top-down view of a hex bolt head)
    const hexPath = hexagonPath(cx, cy, hexR);
    studsSvg += `
      <!-- Stud washer base -->
      <circle cx="${cx}" cy="${cy}" r="${hexR + 1.5}" fill="#888" stroke="#5a5a5a" stroke-width="0.4"/>
      <!-- Hex nut -->
      <path d="${hexPath}" fill="url(#hex-grad-${id})" stroke="#444" stroke-width="0.5" stroke-linejoin="round"/>
      <!-- Stud thread peeking out of the nut -->
      <circle cx="${cx}" cy="${cy}" r="${hexR * 0.45}" fill="#cfcfcf" stroke="#5a5a5a" stroke-width="0.4"/>
      <circle cx="${cx}" cy="${cy}" r="${hexR * 0.45 - 1.5}" fill="#9a9a9a"/>
    `;

    connectionPoints.push({
      id: `stud-${i + 1}`,
      label: `S${i + 1}`,
      x: cx,
      y: cy,
      type: 'power',
      shape: 'circle',
      color: pointColor,
      radius: 4,
      currentRating: c.currentRating,
      description: `${c.studSize} stud`,
    });
  }

  // Translucent cover overlay (rectangle over the studs area when enabled)
  const coverSvg = c.showCover
    ? `
      <rect x="${END_CAP_W - 2}" y="${RAIL_INSET_Y - 4}" width="${width - END_CAP_W * 2 + 4}" height="${RAIL_HEIGHT + 8}" rx="3"
            fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.6"/>
      <rect x="${END_CAP_W - 2}" y="${RAIL_INSET_Y - 4}" width="${width - END_CAP_W * 2 + 4}" height="3" rx="1.5"
            fill="#ffffff" fill-opacity="0.25"/>
    `
    : '';

  const labelSvg = c.showLabel
    ? `
      <rect x="${width / 2 - 22}" y="${height - 9}" width="44" height="7" rx="1.5"
            fill="${baseDark}" stroke="${baseDark}" stroke-width="0.3"/>
      <text x="${width / 2}" y="${height - 3.5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" fill="${lightenColor(c.baseColor, 60)}">${c.currentRating}A · ${c.studSize}</text>
    `
    : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="base-grad-${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${baseLight}"/>
          <stop offset="50%" stop-color="${baseMid}"/>
          <stop offset="100%" stop-color="${baseDark}"/>
        </linearGradient>
        <linearGradient id="rail-grad-${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e8e8e8"/>
          <stop offset="50%" stop-color="#b8b8b8"/>
          <stop offset="100%" stop-color="#7a7a7a"/>
        </linearGradient>
        <radialGradient id="hex-grad-${id}" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stop-color="#f5f5f5"/>
          <stop offset="60%" stop-color="#bcbcbc"/>
          <stop offset="100%" stop-color="#7a7a7a"/>
        </radialGradient>
      </defs>

      <!-- Insulating base (rounded rectangle with mounting tabs at each end) -->
      <rect x="0" y="2" width="${width}" height="${height - 4}" rx="6" fill="url(#base-grad-${id})" stroke="${baseDark}" stroke-width="0.6"/>

      <!-- Mounting holes at each end -->
      <circle cx="${END_CAP_W / 2}" cy="${height / 2}" r="3.6" fill="#0a0a0a" stroke="${baseDark}" stroke-width="0.3"/>
      <circle cx="${width - END_CAP_W / 2}" cy="${height / 2}" r="3.6" fill="#0a0a0a" stroke="${baseDark}" stroke-width="0.3"/>

      <!-- Recess for the bus rail -->
      <rect x="${END_CAP_W - 2}" y="${RAIL_INSET_Y - 1}" width="${width - END_CAP_W * 2 + 4}" height="${RAIL_HEIGHT + 2}" rx="2.5"
            fill="${baseDark}" opacity="0.55"/>

      <!-- Metal bus rail -->
      <rect x="${END_CAP_W}" y="${RAIL_INSET_Y}" width="${width - END_CAP_W * 2}" height="${RAIL_HEIGHT}" rx="1.5"
            fill="url(#rail-grad-${id})" stroke="#5a5a5a" stroke-width="0.5"/>

      ${studsSvg}
      ${coverSvg}
      ${labelSvg}
    </svg>
  `;

  return { svg, dimensions: { width, height }, connectionPoints };
}

function hexagonPath(cx: number, cy: number, r: number): string {
  // Flat-top hexagon (looks more like a hex nut viewed from above)
  const points: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60° steps starting at 0 (right vertex)
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return points
    .map(([x, y], idx) => (idx === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : `L ${x.toFixed(2)} ${y.toFixed(2)}`))
    .join(' ') + ' Z';
}

function isDarkColor(hex: string): boolean {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return true;
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 0xff;
  const g = (v >> 8) & 0xff;
  const b = v & 0xff;
  // Perceived luminance — anything below ~140 considered dark.
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

export default { generate, getDimensions };
