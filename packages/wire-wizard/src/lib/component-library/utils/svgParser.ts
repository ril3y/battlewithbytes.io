/**
 * SVG Parser Utility
 *
 * Parses SVG content to extract connection point markers and metadata.
 * Supports detecting connection points defined via special markers in SVGs.
 *
 * Connection Point Marker Format:
 * SVG elements with data-connection-point attribute or class="connection-point"
 *
 * Example markers:
 * <circle class="connection-point" data-label="GND" data-type="ground" cx="50" cy="100" r="4"/>
 * <circle data-connection-point="PWR+" data-type="power" data-color="#ff0000" cx="20" cy="50"/>
 * <rect class="connection-point" data-label="SIG" data-type="signal" x="30" y="40" width="10" height="10"/>
 *
 * Supported data attributes:
 * - data-connection-point or data-label: Label for the connection point
 * - data-type: 'power' | 'ground' | 'signal' | 'sense' | 'data' (default: 'signal')
 * - data-color: Color override (e.g., '#ff0000')
 * - data-description: Description/tooltip text
 * - data-voltage: Voltage rating (number)
 * - data-current: Current rating in amps (number)
 */

import type { ConnectionPointDefinition } from '../types';

export interface ParsedSVG {
  /** Original SVG content */
  svg: string;
  /** SVG with connection point markers removed for clean rendering */
  cleanSvg: string;
  /** Extracted dimensions from viewBox or width/height */
  dimensions: {
    width: number;
    height: number;
  };
  /** Connection points extracted from markers */
  connectionPoints: ConnectionPointDefinition[];
  /** ViewBox string if present */
  viewBox: string | null;
}

export interface SVGParseOptions {
  /** Keep connection point markers visible in output (default: false) */
  keepMarkers?: boolean;
  /** Default connection point type if not specified (default: 'signal') */
  defaultType?: ConnectionPointDefinition['type'];
  /** Grid size for snapping coordinates (default: 2.5) */
  gridSize?: number;
}

/**
 * Parse SVG content and extract connection point markers
 */
export function parseSVG(svgContent: string, options: SVGParseOptions = {}): ParsedSVG {
  const {
    keepMarkers = false,
    defaultType = 'signal',
    gridSize = 2.5,
  } = options;

  // Parse the SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) {
    throw new Error('Invalid SVG: No svg element found');
  }

  // Extract dimensions
  const dimensions = extractDimensions(svgElement);
  const viewBox = svgElement.getAttribute('viewBox');

  // Find and extract connection point markers
  const connectionPoints: ConnectionPointDefinition[] = [];
  const markers = findConnectionPointMarkers(doc);

  markers.forEach((marker, index) => {
    const point = extractConnectionPoint(marker, index, defaultType, gridSize);
    if (point) {
      connectionPoints.push(point);
    }
  });

  // Create clean SVG by removing markers if requested
  let cleanSvg = svgContent;
  if (!keepMarkers && markers.length > 0) {
    markers.forEach((marker) => {
      marker.remove();
    });
    cleanSvg = new XMLSerializer().serializeToString(doc);
  }

  return {
    svg: svgContent,
    cleanSvg,
    dimensions,
    connectionPoints,
    viewBox,
  };
}

/**
 * Extract dimensions from SVG element
 */
function extractDimensions(svg: SVGSVGElement): { width: number; height: number } {
  // Try viewBox first
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
      return { width: parts[2], height: parts[3] };
    }
  }

  // Try width/height attributes
  const width = parseFloat(svg.getAttribute('width') || '0');
  const height = parseFloat(svg.getAttribute('height') || '0');

  if (width > 0 && height > 0) {
    return { width, height };
  }

  // Default dimensions
  return { width: 100, height: 100 };
}

/**
 * Find all connection point markers in the document
 */
function findConnectionPointMarkers(doc: Document): Element[] {
  const markers: Element[] = [];

  // Find elements with class="connection-point"
  doc.querySelectorAll('.connection-point').forEach((el) => markers.push(el));

  // Find elements with data-connection-point attribute
  doc.querySelectorAll('[data-connection-point]').forEach((el) => {
    if (!markers.includes(el)) {
      markers.push(el);
    }
  });

  // Find elements with data-label attribute (alternative marker)
  doc.querySelectorAll('[data-label]').forEach((el) => {
    if (!markers.includes(el)) {
      markers.push(el);
    }
  });

  return markers;
}

/**
 * Extract connection point data from a marker element
 */
function extractConnectionPoint(
  element: Element,
  index: number,
  defaultType: ConnectionPointDefinition['type'],
  gridSize: number
): ConnectionPointDefinition | null {
  // Get position based on element type
  const position = getElementPosition(element);
  if (!position) {
    return null;
  }

  // Snap to grid
  const x = snapToGrid(position.x, gridSize);
  const y = snapToGrid(position.y, gridSize);

  // Extract attributes
  const label =
    element.getAttribute('data-connection-point') ||
    element.getAttribute('data-label') ||
    `CP${index + 1}`;

  const typeAttr = element.getAttribute('data-type') as ConnectionPointDefinition['type'] | null;
  const type = typeAttr || defaultType;

  const color = element.getAttribute('data-color') || getDefaultColor(type);
  const description = element.getAttribute('data-description') || undefined;
  const radius = parseFloat(element.getAttribute('data-radius') || element.getAttribute('r') || '4');

  // Determine shape based on element type
  const shape = getElementShape(element);

  return {
    id: `cp_${index}`,
    label,
    x,
    y,
    type,
    color,
    shape,
    radius,
    description,
  };
}

/**
 * Get element position (center point)
 */
function getElementPosition(element: Element): { x: number; y: number } | null {
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case 'circle': {
      const cx = parseFloat(element.getAttribute('cx') || '0');
      const cy = parseFloat(element.getAttribute('cy') || '0');
      return { x: cx, y: cy };
    }
    case 'ellipse': {
      const cx = parseFloat(element.getAttribute('cx') || '0');
      const cy = parseFloat(element.getAttribute('cy') || '0');
      return { x: cx, y: cy };
    }
    case 'rect': {
      const x = parseFloat(element.getAttribute('x') || '0');
      const y = parseFloat(element.getAttribute('y') || '0');
      const width = parseFloat(element.getAttribute('width') || '0');
      const height = parseFloat(element.getAttribute('height') || '0');
      return { x: x + width / 2, y: y + height / 2 };
    }
    case 'line': {
      // Use midpoint of line
      const x1 = parseFloat(element.getAttribute('x1') || '0');
      const y1 = parseFloat(element.getAttribute('y1') || '0');
      const x2 = parseFloat(element.getAttribute('x2') || '0');
      const y2 = parseFloat(element.getAttribute('y2') || '0');
      return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    }
    case 'path': {
      // Try to get bounding box from d attribute (basic implementation)
      const d = element.getAttribute('d') || '';
      const match = d.match(/[ML]\s*([0-9.]+)[,\s]([0-9.]+)/i);
      if (match) {
        return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
      }
      return null;
    }
    case 'use':
    case 'g': {
      // Try to get position from transform or x/y attributes
      const x = parseFloat(element.getAttribute('x') || '0');
      const y = parseFloat(element.getAttribute('y') || '0');
      return { x, y };
    }
    default:
      return null;
  }
}

/**
 * Determine shape based on element type
 */
function getElementShape(element: Element): ConnectionPointDefinition['shape'] {
  const tagName = element.tagName.toLowerCase();
  const shapeAttr = element.getAttribute('data-shape') as ConnectionPointDefinition['shape'] | null;

  if (shapeAttr) {
    return shapeAttr;
  }

  switch (tagName) {
    case 'rect':
      return 'rectangle';
    case 'circle':
    case 'ellipse':
      return 'circle';
    default:
      return 'circle';
  }
}

/**
 * Get default color based on connection type
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
 * Snap value to grid
 */
function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Utility to add connection point markers to an SVG
 * Useful for creating SVGs with embedded connection point definitions
 */
export function addConnectionPointMarker(
  svgContent: string,
  point: {
    x: number;
    y: number;
    label: string;
    type?: ConnectionPointDefinition['type'];
    color?: string;
    description?: string;
    radius?: number;
  }
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) {
    return svgContent;
  }

  const marker = doc.createElementNS('http://www.w3.org/2000/svg', 'circle');
  marker.setAttribute('class', 'connection-point');
  marker.setAttribute('cx', String(point.x));
  marker.setAttribute('cy', String(point.y));
  marker.setAttribute('r', String(point.radius || 4));
  marker.setAttribute('data-label', point.label);

  if (point.type) {
    marker.setAttribute('data-type', point.type);
  }
  if (point.color) {
    marker.setAttribute('data-color', point.color);
  }
  if (point.description) {
    marker.setAttribute('data-description', point.description);
  }

  // Make marker invisible by default (transparent fill/stroke)
  marker.setAttribute('fill', 'transparent');
  marker.setAttribute('stroke', 'transparent');

  svg.appendChild(marker);

  return new XMLSerializer().serializeToString(doc);
}

/**
 * Validate that an SVG has proper structure for use as a component
 */
export function validateSVG(svgContent: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');

    if (parserError) {
      errors.push('Invalid SVG: Parse error');
      return { valid: false, errors, warnings };
    }

    const svg = doc.querySelector('svg');
    if (!svg) {
      errors.push('Invalid SVG: No svg element found');
      return { valid: false, errors, warnings };
    }

    // Check for viewBox
    if (!svg.getAttribute('viewBox')) {
      warnings.push('SVG has no viewBox attribute - dimensions may not scale correctly');
    }

    // Check dimensions
    const dimensions = extractDimensions(svg);
    if (dimensions.width <= 0 || dimensions.height <= 0) {
      errors.push('Invalid SVG: Could not determine dimensions');
    }

    // Check for excessively large dimensions
    if (dimensions.width > 1000 || dimensions.height > 1000) {
      warnings.push('SVG dimensions are large - consider using smaller viewBox for components');
    }

  } catch (e) {
    errors.push(`SVG validation error: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
