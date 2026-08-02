/**
 * Brushless Hub Motor SVG Generator
 *
 * Generates SVG markup for a brushless hub motor with:
 * - Circular motor hub with mounting bolts
 * - Orange phase cable bundle
 * - 3 phase wires (Yellow/Blue/Green) splitting from bundle
 * - 3 harness connection points (future bus connection points)
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface HubMotorConfig {
  hubDiameter?: number;
  hubColor?: string;
  cableColor?: string;
  showBolts?: boolean;
  boltCount?: number;
  powerRating?: number;
  voltage?: number;
}

const DEFAULT_CONFIG: Required<HubMotorConfig> = {
  hubDiameter: 120,
  hubColor: '#1a1a1a',
  cableColor: '#ff6600',
  showBolts: true,
  boltCount: 6,
  powerRating: 3000,
  voltage: 48,
};

export function getDimensions(config: HubMotorConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };
  // Hub on left, cable extends right, splits at end
  const width = c.hubDiameter + 180;
  // Extra height for horizontal connector row below
  const height = Math.max(c.hubDiameter + 80, 180);
  return { width, height };
}

export function generate(config: HubMotorConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const { width, height } = getDimensions(c);

  const uniqueId = Math.random().toString(36).substring(2, 9);

  // Hub center position
  const hubCenterX = c.hubDiameter / 2 + 20;
  const hubCenterY = height / 2;
  const hubRadius = c.hubDiameter / 2;

  // Cable path coordinates
  const cableStartX = hubCenterX + hubRadius * 0.6;
  const cableStartY = hubCenterY;
  const cableMidX = hubCenterX + hubRadius + 40;
  const cableEndX = width - 80;
  const cableSplitX = cableEndX - 20;

  // Phase wire endpoints (where they split)
  const phaseSpacing = 25;

  // Generate mounting bolts around hub (like wheel rim lugs)
  let bolts = '';
  if (c.showBolts) {
    const boltRadius = hubRadius * 0.65; // Closer to center like rim mounting
    for (let i = 0; i < c.boltCount; i++) {
      const angle = (i / c.boltCount) * Math.PI * 2 - Math.PI / 2;
      const bx = hubCenterX + Math.cos(angle) * boltRadius;
      const by = hubCenterY + Math.sin(angle) * boltRadius;
      bolts += `
        <circle cx="${bx}" cy="${by}" r="5" fill="#888" stroke="#666" stroke-width="1"/>
        <circle cx="${bx}" cy="${by}" r="2.5" fill="#aaa"/>
        <circle cx="${bx}" cy="${by}" r="1" fill="#666"/>
      `;
    }
  }

  // Phase wire colors
  const phaseColors = {
    yellow: '#ffcc00',
    blue: '#0066ff',
    green: '#00cc66',
  };

  // Calculate phase wire end positions
  const yellowEndY = hubCenterY - phaseSpacing;
  const blueEndY = hubCenterY;
  const greenEndY = hubCenterY + phaseSpacing;

  // Harness connector positions (horizontal row below phase wires)
  const connectorY = greenEndY + 35;
  const connectorStartX = cableEndX - 40;
  const connectorSpacing = 30;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <!-- Hub gradient -->
        <radialGradient id="hubGrad-${uniqueId}" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stop-color="#444"/>
          <stop offset="100%" stop-color="${c.hubColor}"/>
        </radialGradient>

        <!-- Hub center gradient -->
        <radialGradient id="hubCenter-${uniqueId}" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stop-color="#666"/>
          <stop offset="100%" stop-color="#222"/>
        </radialGradient>

        <!-- Axle metal gradient -->
        <linearGradient id="axle-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#888"/>
          <stop offset="50%" stop-color="#444"/>
          <stop offset="100%" stop-color="#666"/>
        </linearGradient>

        <!-- Cable gradient for 3D effect -->
        <linearGradient id="cableGrad-${uniqueId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff8833"/>
          <stop offset="50%" stop-color="${c.cableColor}"/>
          <stop offset="100%" stop-color="#cc4400"/>
        </linearGradient>
      </defs>

      <!-- Hub Motor Outer Ring -->
      <circle cx="${hubCenterX}" cy="${hubCenterY}" r="${hubRadius}"
              fill="url(#hubGrad-${uniqueId})" stroke="#111" stroke-width="3"/>

      <!-- Hub Outer Rim -->
      <circle cx="${hubCenterX}" cy="${hubCenterY}" r="${hubRadius - 8}"
              fill="none" stroke="#333" stroke-width="2"/>

      <!-- Mounting Bolts -->
      ${bolts}

      <!-- Hub Center Plate -->
      <circle cx="${hubCenterX}" cy="${hubCenterY}" r="${hubRadius * 0.5}"
              fill="url(#hubCenter-${uniqueId})" stroke="#222" stroke-width="2"/>

      <!-- Center Axle -->
      <circle cx="${hubCenterX}" cy="${hubCenterY}" r="${hubRadius * 0.2}"
              fill="url(#axle-${uniqueId})" stroke="#333" stroke-width="1"/>
      <circle cx="${hubCenterX}" cy="${hubCenterY}" r="${hubRadius * 0.08}"
              fill="#222"/>

      <!-- Cable exit grommet on hub -->
      <ellipse cx="${cableStartX - 3}" cy="${cableStartY}" rx="10" ry="14"
               fill="#222" stroke="#111" stroke-width="1"/>

      <!-- Orange Phase Cable Bundle -->
      <path d="M ${cableStartX} ${cableStartY}
               Q ${cableMidX} ${hubCenterY - 10} ${cableSplitX - 5} ${hubCenterY}"
            fill="none" stroke="url(#cableGrad-${uniqueId})" stroke-width="16"
            stroke-linecap="round"/>

      <!-- Phase Wire Split Point (black wrap/tape) -->
      <rect x="${cableSplitX - 8}" y="${hubCenterY - 20}" width="16" height="40" rx="4"
            fill="#111" stroke="#000" stroke-width="1"/>

      <!-- Yellow Phase Wire (top) - ends at connection point -->
      <path d="M ${cableSplitX + 6} ${hubCenterY - 6}
               C ${cableSplitX + 30} ${hubCenterY - 6} ${cableSplitX + 35} ${yellowEndY} ${cableEndX} ${yellowEndY}"
            fill="none" stroke="${phaseColors.yellow}" stroke-width="5" stroke-linecap="round"/>

      <!-- Blue Phase Wire (middle) - ends at connection point -->
      <path d="M ${cableSplitX + 6} ${hubCenterY}
               L ${cableEndX} ${blueEndY}"
            fill="none" stroke="${phaseColors.blue}" stroke-width="5" stroke-linecap="round"/>

      <!-- Green Phase Wire (bottom) - ends at connection point -->
      <path d="M ${cableSplitX + 6} ${hubCenterY + 6}
               C ${cableSplitX + 30} ${hubCenterY + 6} ${cableSplitX + 35} ${greenEndY} ${cableEndX} ${greenEndY}"
            fill="none" stroke="${phaseColors.green}" stroke-width="5" stroke-linecap="round"/>

      <!-- Phase Connection Points (dots at end of wires) -->
      <!-- Yellow Terminal -->
      <circle cx="${cableEndX}" cy="${yellowEndY}" r="7" fill="${phaseColors.yellow}" stroke="#aa8800" stroke-width="2"/>

      <!-- Blue Terminal -->
      <circle cx="${cableEndX}" cy="${blueEndY}" r="7" fill="${phaseColors.blue}" stroke="#0044aa" stroke-width="2"/>

      <!-- Green Terminal -->
      <circle cx="${cableEndX}" cy="${greenEndY}" r="7" fill="${phaseColors.green}" stroke="#008844" stroke-width="2"/>

      <!-- Harness Connector Block (white plastic, horizontal) - future bus connection points -->
      <rect x="${connectorStartX - 10}" y="${connectorY - 12}" width="${connectorSpacing * 2 + 40}" height="24" rx="3"
            fill="#f5f5f5" stroke="#999" stroke-width="1"/>

      <!-- Connector Port 1 -->
      <rect x="${connectorStartX - 5}" y="${connectorY - 7}" width="14" height="14" rx="1"
            fill="#ddd" stroke="#aaa" stroke-width="0.5"/>

      <!-- Connector Port 2 -->
      <rect x="${connectorStartX + connectorSpacing - 5}" y="${connectorY - 7}" width="14" height="14" rx="1"
            fill="#ddd" stroke="#aaa" stroke-width="0.5"/>

      <!-- Connector Port 3 -->
      <rect x="${connectorStartX + connectorSpacing * 2 - 5}" y="${connectorY - 7}" width="14" height="14" rx="1"
            fill="#ddd" stroke="#aaa" stroke-width="0.5"/>

      <!-- Labels -->
      <text x="${hubCenterX}" y="${hubCenterY + hubRadius + 15}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#888">
        ${c.powerRating}W ${c.voltage}V
      </text>

      <!-- Phase Labels (to the right of dots) - U/V/W standard -->
      <text x="${cableEndX + 12}" y="${yellowEndY + 4}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#aa8800">U</text>
      <text x="${cableEndX + 12}" y="${blueEndY + 4}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0044aa">W</text>
      <text x="${cableEndX + 12}" y="${greenEndY + 4}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#008844">V</text>
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    // Phase wire connection points (exactly on terminal circles) - U/V/W standard
    {
      id: 'phase-u',
      label: 'Phase U (Yellow)',
      x: cableEndX,
      y: yellowEndY,
      type: 'power',
      color: phaseColors.yellow,
      shape: 'circle',
      radius: 7,
      description: 'Motor phase U connection',
    },
    {
      id: 'phase-w',
      label: 'Phase W (Blue)',
      x: cableEndX,
      y: blueEndY,
      type: 'power',
      color: phaseColors.blue,
      shape: 'circle',
      radius: 7,
      description: 'Motor phase W connection',
    },
    {
      id: 'phase-v',
      label: 'Phase V (Green)',
      x: cableEndX,
      y: greenEndY,
      type: 'power',
      color: phaseColors.green,
      shape: 'circle',
      radius: 7,
      description: 'Motor phase V connection',
    },
    // Harness connection points (horizontal row - future bus points)
    {
      id: 'harness-1',
      label: 'Harness 1',
      x: connectorStartX + 2,
      y: connectorY,
      type: 'signal',
      shape: 'rectangle',
      radius: 6,
      description: 'Hall sensor / harness connector 1',
    },
    {
      id: 'harness-2',
      label: 'Harness 2',
      x: connectorStartX + connectorSpacing + 2,
      y: connectorY,
      type: 'signal',
      shape: 'rectangle',
      radius: 6,
      description: 'Hall sensor / harness connector 2',
    },
    {
      id: 'harness-3',
      label: 'Harness 3',
      x: connectorStartX + connectorSpacing * 2 + 2,
      y: connectorY,
      type: 'signal',
      shape: 'rectangle',
      radius: 6,
      description: 'Hall sensor / harness connector 3',
    },
  ];

  return {
    svg,
    dimensions: { width, height },
    connectionPoints,
  };
}

export default { generate, getDimensions };
