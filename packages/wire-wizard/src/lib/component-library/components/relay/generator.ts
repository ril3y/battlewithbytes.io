/**
 * Configurable Relay SVG Generator
 *
 * Generates photorealistic SVG markup for automotive relays.
 * Supports 4-pin (SPST) and 5-pin (SPDT) configurations with standard Bosch terminal numbering.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import {
    lightenColor,
    darkenColor,
    withAlpha
} from '../../utils/colorUtils';
import {
    metallicGradient,
    wrapSvg,
    textLabel
} from '../../utils/svgUtils';

export interface RelayConfig {
    type?: '4-pin' | '5-pin'; // 4-pin (SPST) or 5-pin (SPDT)
    voltage?: number;         // 12V vs 24V (just for label)
    amperage?: number;        // Rating (e.g. 30A, 40A)
    bodyColor?: string;       // Default black
    showSchematic?: boolean;  // Draw schematic on top
    label?: string;           // Custom label (e.g. "FAN RELAY")
}

const DEFAULT_CONFIG: Required<RelayConfig> = {
    type: '5-pin',
    voltage: 12,
    amperage: 40,
    bodyColor: '#1a1a1a',
    showSchematic: true,
    label: 'RELAY',
};

// Dimensions
const WIDTH = 100;
const HEIGHT = 100;

export function getDimensions(): { width: number; height: number } {
    return { width: WIDTH, height: HEIGHT };
}

export function generate(config: RelayConfig = {}): GeneratorResult {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const { type, voltage, amperage, bodyColor, showSchematic, label } = mergedConfig;

    // Connection Points (Standard Bosch Numbering)
    // 30: Common (Power In)
    // 87: NO (Power Out)
    // 87a: NC (Power Out - 5-pin only)
    // 85: Coil Ground
    // 86: Coil Trigger

    // Geometry
    // Square body centered in 100x100
    // Body size 70x70, centered at (15, 15)
    // Terminals protrude from sides for easy wiring

    const defs = `
    ${metallicGradient('terminal-metal', '#c0c0c0', 'vertical')}
    <linearGradient id="body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${lightenColor(bodyColor, 20)}"/>
      <stop offset="50%" style="stop-color:${bodyColor}"/>
      <stop offset="100%" style="stop-color:${darkenColor(bodyColor, 10)}"/>
    </linearGradient>
    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="2" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;

    let content = '';

    // Draw Terminals first (so they are under the body)

    // Terminal 30 (Bottom)
    content += drawTerminal(50, 85, 'bottom');
    // Terminal 87 (Top)
    content += drawTerminal(50, 15, 'top');
    // Terminal 85 (Left)
    content += drawTerminal(15, 50, 'left');
    // Terminal 86 (Right)
    content += drawTerminal(85, 50, 'right');

    // Terminal 87a (Center - only for 5-pin)
    // Usually 87a is in the middle. We'll put it slightly offset or in standard position.
    // Standard Bosch: 30(Bot), 87(Top), 85(Left), 86(Right), 87a(Center)
    if (type === '5-pin') {
        // Put 87a slightly to the side or overlapping 87? 
        // In a flat diagram, 87a often sits in the middle.
        // Let's place it center but maybe visually distinct.
        // Ideally connection points shouldn't overlap.
        // Let's angle it or put it near 87.
        // Let's put 87a at top-left corner area to avoid overcrowding 87 (Top).
        // Actually, standard visual representation:
        // 30 Bottom, 87 Top, 85 Left, 86 Right. 87a Center.
        // But for wiring, center is hard to hit if schematic is there.
        // Let's put 87a at Top-Left (25, 25) ?
        content += drawTerminal(35, 35, 'center');
    }

    // Relay Body
    content += `
    <g filter="url(#drop-shadow)">
      <rect x="20" y="20" width="60" height="60" rx="4" fill="url(#body-gradient)" stroke="#000" stroke-width="1"/>
      <!-- Inner bevel/highlight -->
      <rect x="22" y="22" width="56" height="56" rx="3" fill="none" stroke="${withAlpha('#ffffff', 0.1)}" stroke-width="1"/>
    </g>
  `;

    // Schematic / Labels
    if (showSchematic) {
        // Basic Schematic Symbol on top
        content += `
        <!-- Schematic Lines -->
        <g stroke="#888" stroke-width="1.5" fill="none">
          <!-- Coil (85-86) -->
          <path d="M25 50 L35 50" /> <!-- From 85 -->
          <path d="M65 50 L75 50" /> <!-- From 86 -->
          <!-- Coil Box -->
          <rect x="35" y="42" width="30" height="16" stroke="#888" fill="none"/>
          <line x1="35" y1="42" x2="65" y2="58" stroke="#888" stroke-width="0.5"/> <!-- Diagonal for coil symbol -->
          
          <!-- Switch (30-87) -->
          <path d="M50 75 L50 63" /> <!-- From 30 -->
          <circle cx="50" cy="63" r="1.5" fill="#888" stroke="none"/> <!-- Pivot -->
          
          <!-- Arm -->
          <line x1="50" y1="63" x2="50" y2="40" stroke="#888"/> <!-- Arm moving parts -->
          
          <!-- Contact 87 -->
          <line x1="45" y1="35" x2="55" y2="35" stroke="#888"/> <!-- Plate -->
          <path d="M50 35 L50 25" /> <!-- To 87 -->
        </g>
      `;

        if (type === '5-pin') {
            // Contact 87a
            content += `
            <g stroke="#888" stroke-width="1.5" fill="none">
               <line x1="40" y1="45" x2="45" y2="45" stroke="#888"/> <!-- 87a Contact -->
               <path d="M40 45 L35 40" /> <!-- To 87a terminal -->
            </g>
          `;
        }
    }

    // Text Labels
    content += textLabel(50, 90, '30', { fontSize: 8, fill: '#aaa', bold: true, anchor: 'middle' }); // 30 Label
    content += textLabel(50, 18, '87', { fontSize: 8, fill: '#aaa', bold: true, anchor: 'middle' }); // 87 Label
    content += textLabel(18, 52, '85', { fontSize: 8, fill: '#aaa', bold: true, anchor: 'middle' }); // 85 Label
    content += textLabel(82, 52, '86', { fontSize: 8, fill: '#aaa', bold: true, anchor: 'middle' }); // 86 Label

    if (type === '5-pin') {
        content += textLabel(35, 33, '87a', { fontSize: 7, fill: '#aaa', bold: true, anchor: 'middle' });
    }

    // Main Label (e.g., "RELAY")
    content += textLabel(50, 12, label || 'RELAY', { fontSize: 9, fill: '#fff', bold: true, anchor: 'middle' });
    // Specs
    content += textLabel(50, 95, `${voltage}V ${amperage}A`, { fontSize: 8, fill: '#666', anchor: 'middle' });

    // Wiring Definitions
    const connectionPoints: ConnectionPointDefinition[] = [
        {
            id: 'term-30',
            label: '30',
            x: 50,
            y: 100, // Bottom edge
            type: 'power',
            shape: 'blade',
            description: 'Common (Power In)',
        },
        {
            id: 'term-87',
            label: '87',
            x: 50,
            y: 0, // Top edge
            type: 'power',
            shape: 'blade',
            description: 'Normally Open (NO) - Power Out',
        },
        {
            id: 'term-85',
            label: '85',
            x: 0, // Left edge
            y: 50,
            type: 'signal',
            shape: 'blade',
            description: 'Coil Ground',
        },
        {
            id: 'term-86',
            label: '86',
            x: 100, // Right edge
            y: 50,
            type: 'signal',
            shape: 'blade',
            description: 'Coil Trigger (Switch)',
        }
    ];

    if (type === '5-pin') {
        connectionPoints.push({
            id: 'term-87a',
            label: '87a',
            x: 35,
            y: 35, // On the body, somewhat inset? Or should we protrude it?
            // If we protrude, where? Top-Left corner?
            // Let's update geometry to protrude terminal for 87a
            // x=0, y=20 ? Or Top-Left corner 0,0?
            // Standard relay socket: 87a is center.
            // Let's keep it inset on the body for now, or maybe push it to corner.
            // Let's put it on the body similar to sense terminals on shunt.
            type: 'power',
            shape: 'blade',
            description: 'Normally Closed (NC) - Power Out',
        });
    }

    return {
        svg: wrapSvg(content, WIDTH, HEIGHT, defs),
        dimensions: { width: WIDTH, height: HEIGHT },
        connectionPoints
    };
}

function drawTerminal(x: number, y: number, orientation: 'top' | 'bottom' | 'left' | 'right' | 'center'): string {
    const w = 12;
    const h = 16;
    let tx = x;
    let ty = y;

    // Adjust position based on orientation to protrude OUT from x,y
    // x,y is the anchor point on the body edge

    switch (orientation) {
        case 'bottom':
            tx = x - w / 2;
            ty = y;
            break;
        case 'top':
            tx = x - w / 2;
            ty = y - h;
            break;
        case 'left':
            // Rotation for left/right is applied via the transform below.
            tx = x - h;
            ty = y - w / 2;
            break;
        case 'right':
            tx = x;
            ty = y - w / 2;
            break;
        case 'center':
            tx = x - w / 2;
            ty = y - h / 2;
            break;
    }

    if (orientation === 'left' || orientation === 'right') {
        return `
            <g transform="rotate(90, ${x}, ${y})">
               <rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" fill="url(#terminal-metal)" stroke="#666" stroke-width="0.5" rx="1"/>
               <circle cx="${x}" cy="${y + h - 4}" r="2" fill="rgba(0,0,0,0.2)"/> <!-- Hole -->
            </g>
         `;
    }

    if (orientation === 'center') {
        return `
            <rect x="${tx}" y="${ty}" width="${w}" height="${w}" fill="#d4af37" stroke="#b8860b" stroke-width="1" transform="rotate(45, ${x}, ${y})"/>
         `;
    }

    return `
       <rect x="${tx}" y="${ty}" width="${w}" height="${h}" fill="url(#terminal-metal)" stroke="#666" stroke-width="0.5" rx="1"/>
       <circle cx="${x}" cy="${ty + h - 4}" r="2" fill="rgba(0,0,0,0.2)"/> <!-- Hole -->
    `;
}

export default { generate, getDimensions };
