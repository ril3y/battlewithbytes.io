'use client';

import { IConnectorRenderer } from './base/IConnectorRenderer';
import { RectangleRenderer } from './RectangleRenderer';
import { CircleRenderer } from './CircleRenderer';
import { ConnectorShape } from '../types'; // Import ConnectorShape

// Create instances of all available renderers
const rectangleRenderer = new RectangleRenderer();
const circleRenderer = new CircleRenderer();

// Build the registry map using ConnectorShape as key
const rendererRegistry = new Map<ConnectorShape, IConnectorRenderer>();
rendererRegistry.set(rectangleRenderer.shape, rectangleRenderer); // Use .shape
rendererRegistry.set(circleRenderer.shape, circleRenderer); // Use .shape

// --- Registry Access Functions ---

/**
 * Retrieves a specific connector renderer instance by its shape enum value.
 * 
 * @param shape The ConnectorShape enum value.
 * @returns The corresponding IConnectorRenderer instance, or the default (Rectangle) if not found or shape is undefined.
 */
export const getRenderer = (shape: ConnectorShape | undefined): IConnectorRenderer => {
  // Default to rectangle if no shape is specified or if shape is not in registry
  const renderer = shape ? rendererRegistry.get(shape) : undefined;
  return renderer ?? rectangleRenderer;
};

/**
 * Retrieves the default connector renderer (Rectangle).
 */
export const getDefaultRenderer = (): IConnectorRenderer => {
  // Explicitly return the default renderer instance
  return rectangleRenderer; // Assuming rectangleRenderer is always the default
  // Or retrieve dynamically: return rendererRegistry.get(ConnectorShape.Rectangle)!;
};

/**
 * Gets a list of available connector shapes for UI selection.
 * Each item contains the shape enum value and a temporary display name.
 * TODO: Update to use a static displayName property from each renderer class.
 */
export const getAvailableShapes = (): { shape: ConnectorShape; displayName: string }[] => {
  return Array.from(rendererRegistry.values()).map(renderer => ({
    shape: renderer.shape,
    // Temporary display name - capitalize the enum key
    displayName: renderer.shape.charAt(0).toUpperCase() + renderer.shape.slice(1),
    // TODO: Replace above with: displayName: (renderer.constructor as any).displayName || renderer.shape
  }));
};

// Optionally export the map directly if needed, but functions are safer
// export { rendererRegistry };
