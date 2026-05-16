// Dimensions
const GRID = 20;
const PADDING = 20;
const FUSE_WIDTH = 40;
const FUSE_HEIGHT = 15;
const SCREW_SIZE = 8;
const STUD_SIZE = 14;
const ROW_HEIGHT = 40; // 2 grid units
const NEG_BUS_HEIGHT = 40; // 2 grid units

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import { getFuseColor } from '../../utils/standardColors';
import { wrapSvg, textLabel } from '../../utils/svgUtils';

export interface FuseBlockConfig {
  numberOfFuses?: number;
  fuseRatings?: number[];
  layout?: 'single-row' | 'double-row';
  showRatings?: boolean;
}

const DEFAULT_CONFIG: Required<FuseBlockConfig> = {
  numberOfFuses: 6,
  fuseRatings: [10, 10, 15, 15, 20, 20],
  layout: 'double-row',
  showRatings: true,
};

/**
 * Calculate fuse block dimensions
 * Must snap to GRID size
 */
export function getDimensions(config: FuseBlockConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };

  const cols = 2;
  const rows = Math.ceil(c.numberOfFuses / cols);

  // Width: PADDING + Col1 (Fuse+Screw) + Col2 (Screw+Fuse) + PADDING
  // Let's make columns wide enough to fit fuse+screw and land on grid.
  // Col Width: 100 is good (5 grid units)
  const colWidth = 100;
  const gridWidth = cols * colWidth;

  // Use Math.max to clamp, but ensure multiple of GRID
  const calculatedWidth = PADDING + gridWidth + PADDING;
  // round up to nearest grid
  const width = Math.ceil(calculatedWidth / GRID) * GRID;

  // Height: Padding + NegBus + Grid + Studs
  // Grid starts at Y=80 (PADDING + NEG_BUS + GAP)
  const startY = PADDING + NEG_BUS_HEIGHT + 20;
  const calculatedHeight = startY + (rows * ROW_HEIGHT) + 60; // 60 for bottom studs
  const height = Math.ceil(calculatedHeight / GRID) * GRID;

  return { width, height };
}

/**
 * Helper to draw a Phillips screw head
 */
function drawScrew(x: number, y: number, r: number = SCREW_SIZE / 2, color: string = '#e0e0e0'): string {
  return `
    <g transform="translate(${x},${y})">
      <circle r="${r}" fill="${color}" stroke="#666" stroke-width="1"/>
      <path d="M -${r / 2} 0 L ${r / 2} 0 M 0 -${r / 2} L 0 ${r / 2}" stroke="#999" stroke-width="1.5" stroke-linecap="round"/>
      <circle r="${r}" fill="#fff" fill-opacity="0.2"/>
    </g>
  `;
}

/**
 * Helper to draw a Hex Nut/Stud
 */
function drawStud(x: number, y: number, r: number = STUD_SIZE / 2, color: string = '#e0e0e0'): string {
  return `
    <g transform="translate(${x},${y})">
      <circle r="${r}" fill="#999" stroke="#555" stroke-width="1"/>
      <path d="M -${r * 0.6} -${r * 0.3} L 0 -${r * 0.7} L ${r * 0.6} -${r * 0.3} L ${r * 0.6} ${r * 0.3} L 0 ${r * 0.7} L -${r * 0.6} ${r * 0.3} Z" fill="${color}" stroke="#666" stroke-width="1"/>
      <circle r="${r / 2.5}" fill="#bbb" stroke="#777" stroke-width="1"/>
    </g>
  `;
}

/**
 * Helper to draw Blade Fuse (Top View)
 */
function drawFuse(x: number, y: number, rating: number, width: number, height: number): string {
  const color = getFuseColor(rating);
  return `
    <g transform="translate(${x - width / 2}, ${y - height / 2})">
      <!-- Shadow -->
      <rect x="1" y="1" width="${width}" height="${height}" rx="2" fill="#000" fill-opacity="0.3"/>
      <!-- Body -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="2" fill="${color}" fill-opacity="0.9" stroke="#333" stroke-width="0.5"/>
      <!-- Metallic contacts -->
      <rect x="2" y="${height / 2 - 3}" width="6" height="6" fill="#ccc" rx="1"/>
      <rect x="${width - 8}" y="${height / 2 - 3}" width="6" height="6" fill="#ccc" rx="1"/>
      <!-- Text -->
      <text x="${width / 2}" y="${height / 2 + 3}" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="9" fill="#000" fill-opacity="0.7">${rating}</text>
    </g>
  `;
}

/**
 * Generate the fuse block component
 */
export function generate(config: FuseBlockConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const { width, height } = getDimensions(c);

  // Ensure ratings array covers all fuses
  const ratings = [...(c.fuseRatings || [])];
  while (ratings.length < c.numberOfFuses) {
    ratings.push(10);
  }

  const connectionPoints: ConnectionPointDefinition[] = [];
  let svgContent = '';

  const gradId = Math.random().toString(36).substring(7);
  svgContent += `
    <defs>
      <linearGradient id="body-grad-${gradId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#333"/>
        <stop offset="100%" stop-color="#111"/>
      </linearGradient>
    </defs>
  `;

  // 1. Main Housing
  svgContent += `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="8" fill="url(#body-grad-${gradId})" stroke="#000" stroke-width="2"/>`;

  // Mounting holes (inset 10px - not on grid but distinct)
  const holeOffset = 10;
  [[holeOffset, holeOffset], [width - holeOffset, holeOffset], [holeOffset, height - holeOffset], [width - holeOffset, height - holeOffset]].forEach(([hx, hy]) => {
    svgContent += `<circle cx="${hx}" cy="${hy}" r="4" fill="#000"/>`;
    svgContent += `<circle cx="${hx}" cy="${hy}" r="2" fill="#222"/>`;
  });

  // 2. Negative Bus Bar (Top) 
  // Align screws to GRID.
  const negYStr = PADDING + 20; // Y=40, on grid
  svgContent += `<text x="${width / 2}" y="${negYStr - 18}" text-anchor="middle" font-size="10" fill="#aaa" font-family="Arial">NEGATIVE BUS</text>`;

  // Bus plate
  svgContent += `<rect x="${PADDING}" y="${negYStr - 8}" width="${width - PADDING * 2}" height="16" rx="2" fill="#ccc"/>`;

  // Distribute screws on grid points
  // We want to center them.
  // Calculate total width of screws group using 20px spacing
  const totalScrewW = (c.numberOfFuses - 1) * 20;
  const startScrewX = (width - totalScrewW) / 2;

  // Snap startScrewX to nearest 20 if possible for perfect alignment.
  // If width is 240, center is 120. If 6 fuses, totalW = 100. Half=50. Start=70. 
  // 70 is not on 20px grid (20,40,60,80). It is on 10px.
  // Ideally we want 20px alignment if grid is 20px. 
  // If width is always multiple of 20, and count is even/odd...
  // Let's force startScrewX to be on 10px grid at least. 
  // Users can snap to 10px usually.

  for (let i = 0; i < c.numberOfFuses; i++) {
    const gx = startScrewX + (i * 20); // 20px spacing
    const gy = negYStr;

    svgContent += drawScrew(gx, gy, 5);

    connectionPoints.push({
      id: `gnd_out_${i}`,
      label: 'GND',
      x: gx,
      y: gy,
      type: 'power',
      shape: 'circle',
      radius: 4,
      color: '#000'
    });
  }

  // 3. Main Fuse Grid
  const startY = PADDING + NEG_BUS_HEIGHT + 20; // 20px gap
  const cols = 2;
  // Column centers
  const col1Center = width / 2 - 50;
  const col2Center = width / 2 + 50;

  for (let i = 0; i < c.numberOfFuses; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cy = startY + row * ROW_HEIGHT;

    // Left Col (0): [Screw] ... [Fuse]
    // Right Col (1): [Fuse] ... [Screw]
    // Screw on outside edge.

    let fuseX = 0;
    let screwX = 0;

    if (col === 0) { // Left
      fuseX = col1Center + 10;
      screwX = col1Center - 30;
    } else { // Right
      fuseX = col2Center - 10;
      screwX = col2Center + 30;
    }

    // Draw Fuse
    svgContent += drawFuse(fuseX, cy, ratings[i], FUSE_WIDTH, FUSE_HEIGHT);

    // Draw Output Screw
    svgContent += drawScrew(screwX, cy, 6);
    svgContent += `<text x="${screwX}" y="${cy + 15}" text-anchor="middle" font-size="9" fill="#ddd">OUT ${i + 1}</text>`;

    connectionPoints.push({
      id: `fuse_out_${i}`,
      label: `F${i + 1}`,
      x: screwX,
      y: cy,
      type: 'power',
      shape: 'circle',
      radius: 6,
      color: '#e74c3c'
    });

    // Connect trace
    svgContent += `<path d="M ${fuseX} ${cy} L ${screwX} ${cy}" stroke="#666" stroke-width="3" stroke-opacity="0.5"/>`;

    // Label overlap
    svgContent += `<text x="${fuseX}" y="${cy - 12}" text-anchor="middle" font-size="9" fill="#888">F${i + 1}</text>`;
  }

  // 4. Main Studs
  // Align to grid Y. 
  // If height is snapped to 20. 
  const studY = height - 40; // 2 grid units from bottom

  // Center X, spaced 60px apart (3 grid units)
  const mainGndX = width / 2 - 40;
  const mainPwrX = width / 2 + 40;

  // GND
  svgContent += drawStud(mainGndX, studY, 10, '#333');
  svgContent += `<text x="${mainGndX}" y="${studY + 22}" text-anchor="middle" font-size="11" fill="#bbb" font-weight="bold">MAIN -</text>`;

  // PWR
  svgContent += `<circle cx="${mainPwrX}" cy="${studY}" r="12" fill="#c0392b"/>`;
  svgContent += drawStud(mainPwrX, studY, 10, '#ddd');
  svgContent += `<text x="${mainPwrX}" y="${studY + 22}" text-anchor="middle" font-size="11" fill="#fff" font-weight="bold">MAIN +</text>`;

  connectionPoints.push({
    id: 'gnd_in',
    label: 'GND IN',
    x: mainGndX,
    y: studY,
    type: 'power',
    shape: 'circle',
    radius: 10,
    color: '#000'
  });

  connectionPoints.push({
    id: 'pwr_in',
    label: 'POS IN',
    x: mainPwrX,
    y: studY,
    type: 'power',
    shape: 'circle',
    radius: 10,
    color: '#c0392b'
  });

  return {
    svg: wrapSvg(svgContent, width, height),
    dimensions: { width, height },
    connectionPoints,
  };
}

export default { generate, getDimensions };
