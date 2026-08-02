/**
 * Custom SVG Component Generator
 *
 * Wraps user-provided SVG content into the standard component generator format.
 * Supports connection points defined via:
 * 1. SVG markers (elements with class="connection-point" or data-connection-point)
 * 2. Manually specified connection points in config
 * 3. Visual placement after import
 *
 * Grid Sizing:
 * - Components use a 2.5px grid for connection point alignment
 * - Recommended viewBox dimensions in multiples of 5 (5, 10, 15, 20...)
 */

import type { GeneratorResult, ConnectionPointDefinition } from '../../types';
import { parseSVG, validateSVG } from '../../utils/svgParser';

export interface CustomSVGConfig {
  /** Raw SVG content string */
  svgContent: string;
  /** Optional: Pre-defined connection points (overrides SVG markers) */
  connectionPoints?: Array<{
    label: string;
    x: number;
    y: number;
    type?: ConnectionPointDefinition['type'];
    color?: string;
    description?: string;
    radius?: number;
  }>;
  /** Optional: Override detected width */
  width?: number;
  /** Optional: Override detected height */
  height?: number;
  /** Whether to keep connection point markers visible (default: false) */
  showMarkers?: boolean;
  /** Grid size for snapping (default: 2.5) */
  gridSize?: number;
  /** Scale factor to apply to SVG (default: 1) */
  scale?: number;
  /** Label to display on component */
  label?: string;
  /** Background color (default: transparent) */
  backgroundColor?: string;
}

const DEFAULT_CONFIG: Partial<CustomSVGConfig> = {
  showMarkers: false,
  gridSize: 2.5,
  scale: 1,
};

/**
 * Get dimensions for a custom SVG component
 */
export function getDimensions(config: CustomSVGConfig): { width: number; height: number } {
  const { svgContent, width, height, scale = 1 } = config;

  // If dimensions are explicitly provided, use them
  if (width && height) {
    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    };
  }

  // Parse SVG to extract dimensions
  try {
    const parsed = parseSVG(svgContent);
    return {
      width: Math.round(parsed.dimensions.width * scale),
      height: Math.round(parsed.dimensions.height * scale),
    };
  } catch {
    return { width: 100, height: 100 };
  }
}

/**
 * Generate component from custom SVG content
 */
export function generate(config: CustomSVGConfig): GeneratorResult {
  const c = { ...DEFAULT_CONFIG, ...config };
  const { svgContent, gridSize = 2.5, scale = 1 } = c;

  // Validate SVG
  const validation = validateSVG(svgContent);
  if (!validation.valid) {
    throw new Error(`Invalid SVG: ${validation.errors.join(', ')}`);
  }

  // Parse SVG to extract connection points and dimensions
  const parsed = parseSVG(svgContent, {
    keepMarkers: c.showMarkers,
    gridSize,
  });

  // Use provided dimensions or parsed dimensions
  const width = c.width || parsed.dimensions.width;
  const height = c.height || parsed.dimensions.height;

  // Apply scale
  const scaledWidth = Math.round(width * scale);
  const scaledHeight = Math.round(height * scale);

  // Determine connection points - prefer config over parsed
  let connectionPoints: ConnectionPointDefinition[];

  if (c.connectionPoints && c.connectionPoints.length > 0) {
    // Use explicitly provided connection points
    connectionPoints = c.connectionPoints.map((point, index) => ({
      id: `cp_${index}`,
      label: point.label,
      x: snapToGrid(point.x * scale, gridSize),
      y: snapToGrid(point.y * scale, gridSize),
      type: point.type || 'signal',
      color: point.color || getDefaultColor(point.type || 'signal'),
      shape: 'circle' as const,
      radius: (point.radius || 4) * scale,
      description: point.description,
    }));
  } else {
    // Use connection points parsed from SVG markers
    connectionPoints = parsed.connectionPoints.map((point) => ({
      ...point,
      x: snapToGrid(point.x * scale, gridSize),
      y: snapToGrid(point.y * scale, gridSize),
      radius: (point.radius || 4) * scale,
    }));
  }

  // Build the final SVG
  let finalSvg: string;

  if (scale !== 1 || c.backgroundColor) {
    // Need to wrap or modify the SVG
    const svgToUse = c.showMarkers ? parsed.svg : parsed.cleanSvg;

    // Extract inner content from SVG
    const innerContent = extractSVGContent(svgToUse);

    finalSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${scaledWidth} ${scaledHeight}" width="${scaledWidth}" height="${scaledHeight}">
        ${c.backgroundColor ? `<rect width="100%" height="100%" fill="${c.backgroundColor}"/>` : ''}
        <g transform="scale(${scale})">
          ${innerContent}
        </g>
        ${c.label ? `
          <text x="${scaledWidth / 2}" y="${scaledHeight - 5}" text-anchor="middle" fill="#888" font-size="10" font-family="Arial, sans-serif">
            ${escapeXml(c.label)}
          </text>
        ` : ''}
      </svg>
    `.trim();
  } else {
    // Use the parsed SVG directly (possibly with markers removed)
    finalSvg = c.showMarkers ? parsed.svg : parsed.cleanSvg;

    // Ensure width/height attributes are present
    if (!finalSvg.includes('width=') || !finalSvg.includes('height=')) {
      finalSvg = finalSvg.replace(
        /<svg\s/,
        `<svg width="${scaledWidth}" height="${scaledHeight}" `
      );
    }
  }

  return {
    svg: finalSvg,
    dimensions: { width: scaledWidth, height: scaledHeight },
    connectionPoints,
  };
}

/**
 * Extract inner content from an SVG string (everything inside <svg>...</svg>)
 */
function extractSVGContent(svg: string): string {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  return match ? match[1] : svg;
}

/**
 * Snap a value to the grid
 */
function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Get default color for connection type
 */
function getDefaultColor(type: ConnectionPointDefinition['type']): string {
  switch (type) {
    case 'power':
      return '#ff4444';
    case 'ground':
      return '#333333';
    case 'signal':
      return '#00aa00';
    case 'sense':
      return '#ffaa00';
    case 'data':
      return '#0066cc';
    default:
      return '#888888';
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Create a custom SVG component from a URL
 * This is a utility for loading SVGs from files
 */
export async function createFromUrl(
  url: string,
  options: Omit<CustomSVGConfig, 'svgContent'> = {}
): Promise<GeneratorResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load SVG from ${url}: ${response.statusText}`);
  }
  const svgContent = await response.text();
  return generate({ ...options, svgContent });
}

export default { generate, getDimensions, createFromUrl };
