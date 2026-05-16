/**
 * Wire Wizard Constants
 *
 * Centralized constants to eliminate duplication
 */

import type { Block } from './types';

/**
 * Random colors for new connection points
 * Used when creating new connection points
 */
export const CONNECTION_POINT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52C41A'
] as const;

/**
 * Get a random connection point color
 */
export function getRandomConnectionPointColor(): string {
  return CONNECTION_POINT_COLORS[Math.floor(Math.random() * CONNECTION_POINT_COLORS.length)];
}

/**
 * Default grid size for snapping
 */
export const DEFAULT_GRID_SIZE = 5;

/**
 * Default new block properties
 */
export const DEFAULT_BLOCK_DATA = {
  label: 'New Block',
  color: '#2a4d69',
  shape: 'rounded' as const,
  width: 100,
  height: 80,
};

/**
 * Default connection point properties
 */
export const DEFAULT_CONNECTION_POINT = {
  label: 'New',
  voltage: 12,
};

/**
 * Default initial blocks for empty diagram
 */
export const DEFAULT_BLOCKS: Block[] = [
  {
    id: 'battery',
    x: 50,
    y: 200,
    width: 120,
    height: 60,
    label: 'Battery 48V',
    color: '#8B0000',
    shape: 'rounded',
    connectionPoints: [
      { id: 'out1', x: 120, y: 30, label: '+', color: '#FFD700', voltage: 48, currentRating: 100 }
    ]
  },
  {
    id: 'reducer1',
    x: 350,
    y: 150,
    width: 100,
    height: 80,
    label: 'Reducer 1',
    color: '#1a4d6d',
    shape: 'rounded',
    connectionPoints: [
      { id: 'in', x: 0, y: 40, label: 'IN+', color: '#FFD700', voltage: 48 },
      { id: 'out', x: 100, y: 40, label: 'OUT', color: '#FF4444', voltage: 12, currentRating: 30 }
    ]
  }
];

/**
 * Zoom constraints
 */
export const ZOOM_CONSTRAINTS = {
  min: 0.1,
  max: 5.0,
  step: 0.1,
} as const;

/**
 * Wire stroke widths (visual, not AWG-based)
 */
export const WIRE_STROKE_WIDTHS = {
  default: 3,
  selected: 5,
  preview: 2,
  bus: 8,
} as const;

/**
 * Junction dot sizes
 */
export const JUNCTION_DOT_RADIUS = 6;

/**
 * Bend point sizes
 */
export const BEND_POINT_RADIUS = {
  default: 6,
  selected: 8,
} as const;

/**
 * Connection point default radius
 */
export const CONNECTION_POINT_RADIUS = 6;

/**
 * Bus convergence defaults
 */
export const BUS_CONVERGE_DEFAULTS = {
  start: 0.08,  // 8% - short fan-out near blocks
  end: 0.92,    // 92% - bundle dominates middle section
} as const;

/**
 * Click tolerance for wire selection (in SVG units)
 */
export const WIRE_CLICK_TOLERANCE = 10;

/**
 * Sidebar width
 */
export const SIDEBAR_WIDTH = 350;

/**
 * Header bar height
 */
export const HEADER_HEIGHT = 60;

/**
 * Colors for UI elements
 */
export const UI_COLORS = {
  // Primary accent
  accent: '#00ffa0',
  accentDark: '#008855',

  // Background colors
  bgDark: '#0a0a0a',
  bgMedium: '#1a1a1a',
  bgLight: '#2a2a2a',

  // Border colors
  borderDark: '#333',
  borderLight: '#444',

  // Text colors
  textPrimary: '#fff',
  textSecondary: '#aaa',
  textMuted: '#666',
  textAccent: '#00ffa0',

  // Status colors
  error: '#ff4444',
  warning: '#ffaa00',
  success: '#00ff00',
  info: '#4488ff',

  // Selection colors
  selected: '#1a3320',
  multiSelect: '#2a2a4a',
} as const;

/**
 * Block shape options
 */
export const BLOCK_SHAPES = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
] as const;

/**
 * Connection point shape options
 */
export const CONNECTION_POINT_SHAPES = [
  { value: 'circle', label: 'Circle' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'blade', label: 'Blade' },
  { value: 'ring', label: 'Ring' },
  { value: 'spade', label: 'Spade' },
] as const;
