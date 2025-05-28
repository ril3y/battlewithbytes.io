'use client';

import {
  Pin,
  ConnectorConfig,
  ConnectorShape,
  DynamicConfigSchema,
} from '../../types'; // Use the refined types

/**
 * Interface for connector rendering logic and configuration.
 */
export interface IConnectorRenderer {
  /**
   * The shape identifier for this renderer.
   */
  shape: ConnectorShape;

  /**
   * Gets the schema defining the configuration UI options for this shape.
   * Keys in the schema should match properties in ConnectorConfig.
   * @returns A DynamicConfigSchema object.
   */
  getConfigurationSchema(): DynamicConfigSchema;

  /**
   * Calculates the position of a specific pin relative to the connector's origin (top-left).
   *
   * @param pinIndex The 0-based index of the pin.
   * @param config The current connector configuration object.
   * @param dimensions The current calculated or default dimensions { width, height } of the connector preview.
   * @returns The { x, y } coordinates relative to the connector's top-left corner, or null if invalid.
   */
  getPinPosition(
    pinIndex: number,
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
  ): { x: number; y: number } | null;

  /**
   * Generates the array of Pin objects based on the connector configuration.
   *
   * @param config The current connector configuration object.
   * @param dimensions The dimensions to use for calculating pin positions.
   * @returns An array of Pin objects.
   */
  generatePins(
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
  ): Pin[];

  // --- Optional methods for potential future canvas rendering ---
  // render?(ctx: CanvasRenderingContext2D, connector: Connector, position: { x: number; y: number }, scale: number, isSelected: boolean, isHovered: boolean): void;
  // getBoundingBox?(connector: Connector, position: { x: number; y: number }, scale: number): { x: number; y: number; width: number; height: number };
  // getDisplayName?(): string; // Maybe useful for registry/UI
  // getShapeKey?(): string; // Implicitly handled by the 'shape' property now
  // getShapeSpecificProperties?(builderState: Partial<Connector>): Partial<Connector>; // Logic should be handled by builder using the config schema
}