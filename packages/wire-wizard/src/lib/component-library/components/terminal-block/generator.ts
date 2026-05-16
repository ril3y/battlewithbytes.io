/**
 * Terminal Block (Barrier Strip) SVG Generator
 *
 * Top-down view of a barrier-style terminal block with one or two rows of
 * Phillips-head screws, raised barrier walls between positions, and end-cap
 * mounting holes.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import { darkenColor, lightenColor } from '../../utils/colorUtils';

export interface TerminalBlockConfig {
  positions?: number;
  rows?: 1 | 2;
  bodyColor?: string;
  screwColor?: string;
  showPositionNumbers?: boolean;
  spacing?: number;
}

const DEFAULT_CONFIG: Required<TerminalBlockConfig> = {
  positions: 4,
  rows: 2,
  bodyColor: '#1a1a1a',
  screwColor: '#cfd2d6',
  showPositionNumbers: true,
  spacing: 22,
};

// Layout constants — top-down view.
const ROW_GAP = 18;          // vertical spacing between dual-row screw centers
const TOP_PAD = 12;
const BOTTOM_PAD = 12;
const END_CAP_W = 14;        // width of the wider end cap with mounting hole
const SCREW_R = 5;
const BARRIER_W = 2;

export function getDimensions(config: TerminalBlockConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };
  const positions = Math.max(2, Math.floor(c.positions));
  const rows = c.rows === 1 ? 1 : 2;
  const width = END_CAP_W * 2 + positions * c.spacing;
  const height = rows === 2 ? TOP_PAD + ROW_GAP + BOTTOM_PAD : TOP_PAD + BOTTOM_PAD + 6;
  return { width, height };
}

export function generate(config: TerminalBlockConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const positions = Math.max(2, Math.floor(c.positions));
  const rows = c.rows === 1 ? 1 : 2;
  const id = Math.random().toString(36).substring(2, 9);
  const { width, height } = getDimensions(c);

  const bodyLight = lightenColor(c.bodyColor, 18);
  const bodyDark = darkenColor(c.bodyColor, 35);
  const bodyMid = darkenColor(c.bodyColor, 10);
  const screwLight = lightenColor(c.screwColor, 12);
  const screwDark = darkenColor(c.screwColor, 30);

  const rowYs = rows === 2
    ? [TOP_PAD, TOP_PAD + ROW_GAP]
    : [Math.round(height / 2)];

  // Build screws + barriers.
  let positionsSvg = '';
  const connectionPoints: ConnectionPointDefinition[] = [];

  for (let i = 0; i < positions; i++) {
    const cx = END_CAP_W + i * c.spacing + c.spacing / 2;

    // Barrier between this position and the next (skipped on last position;
    // outer end caps draw their own walls).
    if (i < positions - 1) {
      const bx = END_CAP_W + (i + 1) * c.spacing - BARRIER_W / 2;
      positionsSvg += `
        <rect x="${bx}" y="2" width="${BARRIER_W}" height="${height - 4}" fill="${bodyDark}" stroke="${bodyDark}" stroke-width="0.3"/>
      `;
    }

    rowYs.forEach((cy, rowIdx) => {
      // Screw seat (slight indent on the body)
      positionsSvg += `
        <circle cx="${cx}" cy="${cy}" r="${SCREW_R + 1.2}" fill="${bodyDark}" />
        <!-- Phillips screw head -->
        <circle cx="${cx}" cy="${cy}" r="${SCREW_R}" fill="url(#screw-grad-${id})" stroke="${screwDark}" stroke-width="0.4"/>
        <!-- Phillips slot -->
        <line x1="${cx - SCREW_R + 1}" y1="${cy}" x2="${cx + SCREW_R - 1}" y2="${cy}" stroke="${screwDark}" stroke-width="0.9" stroke-linecap="round"/>
        <line x1="${cx}" y1="${cy - SCREW_R + 1}" x2="${cx}" y2="${cy + SCREW_R - 1}" stroke="${screwDark}" stroke-width="0.9" stroke-linecap="round"/>
      `;

      const pointIndex = rows === 2 ? i * 2 + rowIdx : i;
      const positionLabel = rows === 2 ? `${i + 1}${rowIdx === 0 ? 'A' : 'B'}` : `${i + 1}`;

      connectionPoints.push({
        id: `pos-${pointIndex + 1}`,
        label: positionLabel,
        x: cx,
        y: cy,
        type: 'power',
        shape: 'circle',
        radius: 4,
        description: rows === 2
          ? `Terminal ${i + 1} (${rowIdx === 0 ? 'top' : 'bottom'} row)`
          : `Terminal ${i + 1}`,
      });
    });

    // Position number along bottom edge
    if (c.showPositionNumbers) {
      positionsSvg += `
        <text x="${cx}" y="${height - 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" fill="${lightenColor(c.bodyColor, 50)}">${i + 1}</text>
      `;
    }
  }

  // End-cap mounting holes (one per row).
  let endCaps = '';
  rowYs.forEach((cy) => {
    endCaps += `
      <circle cx="${END_CAP_W / 2}" cy="${cy}" r="2.6" fill="#0a0a0a" stroke="${bodyDark}" stroke-width="0.3"/>
      <circle cx="${width - END_CAP_W / 2}" cy="${cy}" r="2.6" fill="#0a0a0a" stroke="${bodyDark}" stroke-width="0.3"/>
    `;
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="body-grad-${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${bodyLight}"/>
          <stop offset="50%" stop-color="${bodyMid}"/>
          <stop offset="100%" stop-color="${bodyDark}"/>
        </linearGradient>
        <radialGradient id="screw-grad-${id}" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="${screwLight}"/>
          <stop offset="60%" stop-color="${c.screwColor}"/>
          <stop offset="100%" stop-color="${screwDark}"/>
        </radialGradient>
      </defs>

      <!-- Main body -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="url(#body-grad-${id})" stroke="${bodyDark}" stroke-width="0.6"/>

      <!-- End cap recesses (slightly darker rectangles framing the mount holes) -->
      <rect x="0" y="0" width="${END_CAP_W}" height="${height}" fill="${bodyDark}" opacity="0.25"/>
      <rect x="${width - END_CAP_W}" y="0" width="${END_CAP_W}" height="${height}" fill="${bodyDark}" opacity="0.25"/>

      ${endCaps}
      ${positionsSvg}
    </svg>
  `;

  return { svg, dimensions: { width, height }, connectionPoints };
}

export default { generate, getDimensions };
