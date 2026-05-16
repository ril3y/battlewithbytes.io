/**
 * High Current Fuse (ANL Style) Generator
 *
 * Generates a photorealistic high current fuse (ANL style) commonly used
 * for high current applications (inverters, main battery banks).
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import {
    lightenColor,
    darkenColor,
} from '../../utils/colorUtils';
import {
    wrapSvg,
    textLabel,
    metallicGradient
} from '../../utils/svgUtils';

export interface HeavyDutyFuseConfig {
    amperage?: number;
    bodyColor?: string;
    metalColor?: string;
}

const DEFAULT_CONFIG: Required<HeavyDutyFuseConfig> = {
    amperage: 300,
    bodyColor: '#1a1a1a', // Black plastic
    metalColor: '#e0e0e0', // Silver/Nickel plated
};

// Dimensions (approx based on standard ANL proportions)
const WIDTH = 140;
const HEIGHT = 50;

export function getDimensions(): { width: number; height: number } {
    return { width: WIDTH, height: HEIGHT };
}

export function generate(config: HeavyDutyFuseConfig = {}): GeneratorResult {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const { amperage, bodyColor, metalColor } = mergedConfig;

    // Generate Defs
    const defs = `
    ${metallicGradient('silver-gradient', metalColor, 'vertical')}
    <linearGradient id="fuse-body-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${lightenColor(bodyColor, 30)}"/>
      <stop offset="40%" style="stop-color:${bodyColor}"/>
      <stop offset="100%" style="stop-color:${darkenColor(bodyColor, 20)}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
      <feOffset dx="1" dy="1" result="offsetblur"/>
      <feFlood flood-color="rgba(0,0,0,0.5)"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;

    let content = '';

    // 1. Metal lugs (The base layer)
    // Left Lug
    content += `
    <path d="M 10 12 L 50 12 L 50 38 L 10 38 A 3 3 0 0 1 7 35 L 7 15 A 3 3 0 0 1 10 12 Z" 
      fill="url(#silver-gradient)" stroke="${darkenColor(metalColor, 30)}" stroke-width="0.5" filter="url(#shadow)"/>
    <circle cx="25" cy="25" r="7" fill="#111" stroke="${darkenColor(metalColor, 20)}" stroke-width="0.5"/>
  `;

    // Right Lug
    content += `
    <path d="M 90 12 L 130 12 A 3 3 0 0 1 133 15 L 133 35 A 3 3 0 0 1 130 38 L 90 38 Z" 
      fill="url(#silver-gradient)" stroke="${darkenColor(metalColor, 30)}" stroke-width="0.5" filter="url(#shadow)"/>
    <circle cx="115" cy="25" r="7" fill="#111" stroke="${darkenColor(metalColor, 20)}" stroke-width="0.5"/>
  `;

    // 2. Center Plastic Body
    // Main body rect
    content += `
    <rect x="45" y="8" width="50" height="34" rx="4" fill="url(#fuse-body-gradient)" stroke="#000" stroke-width="0.5" filter="url(#shadow)"/>
  `;

    // Window
    content += `
    <rect x="62" y="17" width="16" height="16" rx="2" fill="rgba(255,255,255,0.1)" stroke="#333" stroke-width="1"/>
  `;

    // Fuse Element visible in window (S-shape ish)
    content += `
    <path d="M 64 25 Q 70 18 76 25" fill="none" stroke="#d4af37" stroke-width="3"/>
  `;

    // Bolts/Rivets on body (4 corners)
    const rivets = [
        { cx: 50, cy: 13 }, { cx: 90, cy: 13 },
        { cx: 50, cy: 37 }, { cx: 90, cy: 37 }
    ];
    rivets.forEach(r => {
        content += `
      <circle cx="${r.cx}" cy="${r.cy}" r="2" fill="url(#silver-gradient)" stroke="#555" stroke-width="0.5"/>
    `;
    });

    // Label (Amperage)
    // Usually printed on top
    content += textLabel(70, 48, `${amperage}A`, {
        fontSize: 8,
        fill: '#fff',
        bold: true
    });

    const connectionPoints: ConnectionPointDefinition[] = [
        {
            id: 'p1',
            label: 'TERM1',
            x: 25,
            y: 25,
            type: 'power', // Bi-directional usually
            shape: 'circle',
            radius: 7,
            labelOffsetY: 18,
            voltage: 0 // Optional, assume floating/unknown
        },
        {
            id: 'p2',
            label: 'TERM2',
            x: 115,
            y: 25,
            type: 'power',
            shape: 'circle',
            radius: 7,
            labelOffsetY: 18,
            voltage: 0
        }
    ];

    return {
        svg: wrapSvg(content, WIDTH, HEIGHT, defs),
        dimensions: { width: WIDTH, height: HEIGHT },
        connectionPoints
    };
}
