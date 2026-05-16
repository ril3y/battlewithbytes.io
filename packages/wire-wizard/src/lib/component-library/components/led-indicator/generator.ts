/**
 * LED Indicator SVG Generator
 *
 * Generates SVG markup for a panel-mount LED indicator light.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface LEDIndicatorConfig {
  color?: string;
  state?: 'on' | 'off';
  size?: 'small' | 'medium' | 'large';
  bezelColor?: string;
  showGlow?: boolean;
  shape?: 'round' | 'square';
}

const DEFAULT_CONFIG: Required<LEDIndicatorConfig> = {
  color: '#2ecc71',
  state: 'off',
  size: 'medium',
  bezelColor: '#c0c0c0',
  showGlow: true,
  shape: 'round',
};

const SIZES = {
  small: { width: 30, height: 30, ledRadius: 8, bezelRadius: 12 },
  medium: { width: 40, height: 40, ledRadius: 12, bezelRadius: 16 },
  large: { width: 50, height: 50, ledRadius: 16, bezelRadius: 20 },
};

export function getDimensions(config: LEDIndicatorConfig = {}): { width: number; height: number } {
  const c = { ...DEFAULT_CONFIG, ...config };
  const size = SIZES[c.size];
  return { width: size.width, height: size.height };
}

export function generate(config: LEDIndicatorConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  const size = SIZES[c.size];
  const { width, height, ledRadius, bezelRadius } = size;
  const centerX = width / 2;
  const centerY = height / 2;

  // LED brightness based on state
  const isOn = c.state === 'on';
  const ledOpacity = isOn ? 1 : 0.4;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <!-- Bezel gradient -->
        <radialGradient id="bezel-${uniqueId}" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stop-color="#e8e8e8"/>
          <stop offset="70%" stop-color="${c.bezelColor}"/>
          <stop offset="100%" stop-color="#666"/>
        </radialGradient>
        <!-- LED gradient (on state) -->
        <radialGradient id="led-on-${uniqueId}" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="${c.color}"/>
          <stop offset="100%" stop-color="${c.color}cc"/>
        </radialGradient>
        <!-- LED gradient (off state) -->
        <radialGradient id="led-off-${uniqueId}" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stop-color="${c.color}88"/>
          <stop offset="100%" stop-color="${c.color}44"/>
        </radialGradient>
        <!-- Glow effect -->
        ${isOn && c.showGlow ? `
        <filter id="glow-${uniqueId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          <feFlood flood-color="${c.color}" flood-opacity="0.6"/>
          <feComposite in2="blur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        ` : ''}
      </defs>

      ${c.shape === 'round' ? `
      <!-- Round bezel -->
      <circle cx="${centerX}" cy="${centerY}" r="${bezelRadius}"
              fill="url(#bezel-${uniqueId})" stroke="#555" stroke-width="1"/>

      <!-- Inner ring -->
      <circle cx="${centerX}" cy="${centerY}" r="${bezelRadius - 2}"
              fill="none" stroke="#888" stroke-width="0.5"/>

      <!-- LED dome -->
      <circle cx="${centerX}" cy="${centerY}" r="${ledRadius}"
              fill="url(#led-${isOn ? 'on' : 'off'}-${uniqueId})"
              stroke="${c.color}88" stroke-width="0.5"
              ${isOn && c.showGlow ? `filter="url(#glow-${uniqueId})"` : ''}
              opacity="${ledOpacity}"/>

      <!-- Highlight on LED -->
      <ellipse cx="${centerX - ledRadius * 0.3}" cy="${centerY - ledRadius * 0.3}"
               rx="${ledRadius * 0.4}" ry="${ledRadius * 0.3}"
               fill="#ffffff55"/>
      ` : `
      <!-- Square bezel -->
      <rect x="${centerX - bezelRadius}" y="${centerY - bezelRadius}"
            width="${bezelRadius * 2}" height="${bezelRadius * 2}" rx="3"
            fill="url(#bezel-${uniqueId})" stroke="#555" stroke-width="1"/>

      <!-- Inner ring -->
      <rect x="${centerX - bezelRadius + 2}" y="${centerY - bezelRadius + 2}"
            width="${(bezelRadius - 2) * 2}" height="${(bezelRadius - 2) * 2}" rx="2"
            fill="none" stroke="#888" stroke-width="0.5"/>

      <!-- LED square -->
      <rect x="${centerX - ledRadius}" y="${centerY - ledRadius}"
            width="${ledRadius * 2}" height="${ledRadius * 2}" rx="2"
            fill="url(#led-${isOn ? 'on' : 'off'}-${uniqueId})"
            stroke="${c.color}88" stroke-width="0.5"
            ${isOn && c.showGlow ? `filter="url(#glow-${uniqueId})"` : ''}
            opacity="${ledOpacity}"/>

      <!-- Highlight on LED -->
      <rect x="${centerX - ledRadius + 2}" y="${centerY - ledRadius + 2}"
            width="${ledRadius * 0.8}" height="${ledRadius * 0.6}" rx="1"
            fill="#ffffff55"/>
      `}
    </svg>
  `;

  const connectionPoints: ConnectionPointDefinition[] = [
    {
      id: 'anode',
      label: '+',
      x: centerX - 8,
      y: height,
      type: 'power',
      color: '#cc0000',
      shape: 'circle',
      radius: 3,
      description: 'LED Anode (+)',
    },
    {
      id: 'cathode',
      label: '-',
      x: centerX + 8,
      y: height,
      type: 'ground',
      color: '#333333',
      shape: 'circle',
      radius: 3,
      description: 'LED Cathode (-)',
    },
  ];

  return {
    svg,
    dimensions: { width, height },
    connectionPoints,
  };
}

export default { generate, getDimensions };
