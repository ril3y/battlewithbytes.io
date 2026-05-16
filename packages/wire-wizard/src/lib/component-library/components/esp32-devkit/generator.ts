/**
 * ESP32 DevKit V1 SVG Generator
 *
 * Generates SVG markup for an ESP32-WROOM-32 development board.
 * 30 GPIO pins arranged in two rows of 15.
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';

export interface ESP32DevKitConfig {
  boardColor?: string;
  showPinLabels?: boolean;
  showPinNumbers?: boolean;
}

const DEFAULT_CONFIG: Required<ESP32DevKitConfig> = {
  boardColor: '#1a1a1a',
  showPinLabels: true,
  showPinNumbers: true,
};

// Board dimensions
const WIDTH = 280;
const HEIGHT = 540;
const PIN_SPACING = 30;
const PIN_START_Y = 60;
const LEFT_PIN_X = 15;
const RIGHT_PIN_X = WIDTH - 15;

// Pin definitions - Left side (top to bottom)
const LEFT_PINS = [
  { num: 'EN', gpio: 'EN', color: '#ffff00' },
  { num: '36', gpio: 'GPIO36', color: '#00ff00' },
  { num: '39', gpio: 'GPIO39', color: '#00ff00' },
  { num: '34', gpio: 'GPIO34', color: '#00ff00' },
  { num: '35', gpio: 'GPIO35', color: '#00ff00' },
  { num: '32', gpio: 'GPIO32', color: '#00ff00' },
  { num: '33', gpio: 'GPIO33', color: '#00ff00' },
  { num: '25', gpio: 'GPIO25', color: '#00ff00' },
  { num: '26', gpio: 'GPIO26', color: '#00ff00' },
  { num: '27', gpio: 'GPIO27', color: '#00ff00' },
  { num: '14', gpio: 'GPIO14', color: '#00ff00' },
  { num: '12', gpio: 'GPIO12', color: '#00ff00' },
  { num: '13', gpio: 'GPIO13', color: '#00ff00' },
  { num: 'GND', gpio: 'GND', color: '#333333' },
  { num: 'VIN', gpio: 'VIN', color: '#ff0000' },
];

// Pin definitions - Right side (top to bottom)
const RIGHT_PINS = [
  { num: '23', gpio: 'GPIO23', color: '#00ff00' },
  { num: '22', gpio: 'GPIO22', color: '#00ff00' },
  { num: '1', gpio: 'TX0', color: '#ff9900' },
  { num: '3', gpio: 'RX0', color: '#ff9900' },
  { num: '21', gpio: 'GPIO21', color: '#00ff00' },
  { num: '19', gpio: 'GPIO19', color: '#00ff00' },
  { num: '18', gpio: 'GPIO18', color: '#00ff00' },
  { num: '5', gpio: 'GPIO5', color: '#00ff00' },
  { num: '17', gpio: 'GPIO17', color: '#00ff00' },
  { num: '16', gpio: 'GPIO16', color: '#00ff00' },
  { num: '4', gpio: 'GPIO4', color: '#00ff00' },
  { num: '2', gpio: 'GPIO2', color: '#00ff00' },
  { num: '15', gpio: 'GPIO15', color: '#00ff00' },
  { num: 'GND', gpio: 'GND2', color: '#333333' },
  { num: '3V3', gpio: '3V3', color: '#ff0000' },
];

export function getDimensions(): { width: number; height: number } {
  return { width: WIDTH, height: HEIGHT };
}

export function generate(config: ESP32DevKitConfig = {}): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const uniqueId = Math.random().toString(36).substring(2, 9);

  // Generate pin rows SVG
  let leftPinsSvg = '';
  let rightPinsSvg = '';
  let pinLabelsSvg = '';

  LEFT_PINS.forEach((pin, i) => {
    const y = PIN_START_Y + i * PIN_SPACING;
    // Pin hole
    leftPinsSvg += `
      <circle cx="${LEFT_PIN_X + 25}" cy="${y}" r="4" fill="#d4a574" stroke="#8b6f47" stroke-width="1"/>
    `;
    // Pin label
    if (c.showPinLabels) {
      pinLabelsSvg += `
        <text x="${LEFT_PIN_X + 45}" y="${y + 4}" font-size="10" fill="#aaa" font-family="monospace">${pin.gpio}</text>
      `;
    }
  });

  RIGHT_PINS.forEach((pin, i) => {
    const y = PIN_START_Y + i * PIN_SPACING;
    // Pin hole
    rightPinsSvg += `
      <circle cx="${RIGHT_PIN_X - 25}" cy="${y}" r="4" fill="#d4a574" stroke="#8b6f47" stroke-width="1"/>
    `;
    // Pin label
    if (c.showPinLabels) {
      pinLabelsSvg += `
        <text x="${RIGHT_PIN_X - 90}" y="${y + 4}" font-size="10" fill="#aaa" font-family="monospace" text-anchor="end">${pin.gpio}</text>
      `;
    }
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="board-grad-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0d0d0d"/>
          <stop offset="50%" stop-color="${c.boardColor}"/>
          <stop offset="100%" stop-color="#0d0d0d"/>
        </linearGradient>
        <linearGradient id="chip-grad-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#404040"/>
          <stop offset="50%" stop-color="#2a2a2a"/>
          <stop offset="100%" stop-color="#1a1a1a"/>
        </linearGradient>
        <linearGradient id="antenna-grad-${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#c0c0c0"/>
          <stop offset="100%" stop-color="#808080"/>
        </linearGradient>
      </defs>

      <!-- PCB Board -->
      <rect x="20" y="10" width="${WIDTH - 40}" height="${HEIGHT - 20}" rx="3"
            fill="url(#board-grad-${uniqueId})" stroke="#333" stroke-width="2"/>

      <!-- Mounting holes -->
      <circle cx="35" cy="25" r="5" fill="#333" stroke="#555" stroke-width="1"/>
      <circle cx="${WIDTH - 35}" cy="25" r="5" fill="#333" stroke="#555" stroke-width="1"/>
      <circle cx="35" cy="${HEIGHT - 25}" r="5" fill="#333" stroke="#555" stroke-width="1"/>
      <circle cx="${WIDTH - 35}" cy="${HEIGHT - 25}" r="5" fill="#333" stroke="#555" stroke-width="1"/>

      <!-- ESP32-WROOM-32 Module -->
      <rect x="70" y="40" width="140" height="180" rx="2"
            fill="url(#chip-grad-${uniqueId})" stroke="#444" stroke-width="1"/>

      <!-- Antenna area (silver) -->
      <rect x="70" y="40" width="140" height="50" rx="2"
            fill="url(#antenna-grad-${uniqueId})" stroke="#666" stroke-width="1"/>

      <!-- Antenna pattern -->
      <path d="M 85 55 L 85 75 L 195 75 L 195 55" fill="none" stroke="#a0a0a0" stroke-width="2"/>
      <line x1="100" y1="55" x2="100" y2="75" stroke="#a0a0a0" stroke-width="1"/>
      <line x1="115" y1="55" x2="115" y2="75" stroke="#a0a0a0" stroke-width="1"/>
      <line x1="130" y1="55" x2="130" y2="75" stroke="#a0a0a0" stroke-width="1"/>
      <line x1="145" y1="55" x2="145" y2="75" stroke="#a0a0a0" stroke-width="1"/>
      <line x1="160" y1="55" x2="160" y2="75" stroke="#a0a0a0" stroke-width="1"/>
      <line x1="175" y1="55" x2="175" y2="75" stroke="#a0a0a0" stroke-width="1"/>

      <!-- ESP chip marking -->
      <text x="140" y="140" text-anchor="middle" font-size="10" fill="#666" font-family="Arial">ESP-WROOM-32</text>
      <text x="140" y="155" text-anchor="middle" font-size="8" fill="#555" font-family="Arial">WiFi + BT</text>

      <!-- Micro USB connector -->
      <rect x="115" y="${HEIGHT - 45}" width="50" height="25" rx="2"
            fill="#888" stroke="#666" stroke-width="1"/>
      <rect x="125" y="${HEIGHT - 40}" width="30" height="15" rx="1"
            fill="#333" stroke="#555" stroke-width="1"/>
      <text x="140" y="${HEIGHT - 55}" text-anchor="middle" font-size="8" fill="#666">USB</text>

      <!-- EN button -->
      <rect x="55" y="${HEIGHT - 80}" width="20" height="12" rx="1" fill="#222" stroke="#444" stroke-width="1"/>
      <text x="65" y="${HEIGHT - 90}" text-anchor="middle" font-size="7" fill="#666">EN</text>

      <!-- BOOT button -->
      <rect x="205" y="${HEIGHT - 80}" width="20" height="12" rx="1" fill="#222" stroke="#444" stroke-width="1"/>
      <text x="215" y="${HEIGHT - 90}" text-anchor="middle" font-size="7" fill="#666">BOOT</text>

      <!-- LED -->
      <circle cx="190" cy="240" r="4" fill="#330000" stroke="#440000" stroke-width="1"/>
      <circle cx="190" cy="240" r="2" fill="#ff0000" opacity="0.3"/>

      <!-- Pin headers background -->
      <rect x="25" y="45" width="30" height="${15 * PIN_SPACING - 5}" fill="#111" stroke="#333" stroke-width="1"/>
      <rect x="${WIDTH - 55}" y="45" width="30" height="${15 * PIN_SPACING - 5}" fill="#111" stroke="#333" stroke-width="1"/>

      <!-- Pin holes -->
      ${leftPinsSvg}
      ${rightPinsSvg}

      <!-- Pin labels -->
      ${pinLabelsSvg}

      <!-- Board label -->
      <text x="140" y="${HEIGHT - 10}" text-anchor="middle" font-size="10" fill="#444" font-family="Arial" font-weight="bold">ESP32 DevKit V1</text>
    </svg>
  `;

  // Generate connection points for all pins
  const connectionPoints: ConnectionPointDefinition[] = [];

  LEFT_PINS.forEach((pin, i) => {
    const y = PIN_START_Y + i * PIN_SPACING;
    connectionPoints.push({
      id: `left-${pin.gpio.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      label: pin.gpio,
      x: LEFT_PIN_X,
      y: y,
      type: pin.gpio.includes('GND') ? 'ground' : pin.gpio.includes('VIN') || pin.gpio.includes('3V3') ? 'power' : 'signal',
      shape: 'circle',
      radius: 4,
    });
  });

  RIGHT_PINS.forEach((pin, i) => {
    const y = PIN_START_Y + i * PIN_SPACING;
    connectionPoints.push({
      id: `right-${pin.gpio.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      label: pin.gpio,
      x: RIGHT_PIN_X,
      y: y,
      type: pin.gpio.includes('GND') ? 'ground' : pin.gpio.includes('3V3') ? 'power' : 'signal',
      shape: 'circle',
      radius: 4,
    });
  });

  return {
    svg,
    dimensions: { width: WIDTH, height: HEIGHT },
    connectionPoints,
  };
}

export default { generate, getDimensions };
