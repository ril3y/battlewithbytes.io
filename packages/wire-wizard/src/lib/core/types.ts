/**
 * Wire Wizard Type Definitions
 */

export type BlockShape = 'rectangle' | 'circle' | 'rounded';

export interface BendPoint {
  x: number;
  y: number;
}

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  x: number;
  y: number;
}

export type WireGauge =
  | '4/0 AWG' | '3/0 AWG' | '2/0 AWG' | '1/0 AWG'
  | '1 AWG' | '2 AWG' | '4 AWG' | '6 AWG' | '8 AWG'
  | '10 AWG' | '12 AWG' | '14 AWG' | '16 AWG' | '18 AWG' | '20 AWG' | '22 AWG';

export interface WireSegmentGauge {
  segmentIndex: number;  // Which segment (0 = start to first bend, 1 = first bend to second bend, etc.)
  gauge: WireGauge;
}

export type ConnectionPointShape = 'circle' | 'rectangle' | 'blade' | 'ring' | 'spade';

export interface ConnectionPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
  voltage?: number;
  currentRating?: number;
  description?: string; // Description of the connection point
  labelOffsetX?: number; // X offset for draggable label position
  labelOffsetY?: number; // Y offset for draggable label position
  labelRotation?: number; // Rotation angle in degrees for label
  shape?: ConnectionPointShape; // Shape of the connection point (default: 'circle')
  radius?: number; // Custom radius for the connection point (default: 6)
  isGenerated?: boolean; // Flag if point was auto-generated from config
}

export interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  shape: BlockShape;
  connectionPoints: ConnectionPoint[];
  svgComponent?: string; // Path to custom SVG file (e.g., "/components/power-distribution/fuse-block-6way.svg")
  svgViewBox?: string; // Custom viewBox for SVG scaling (e.g., "0 0 200 150")
  componentConfig?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- Config objects have dynamic structure
  componentType?: string; // The ID of the component type (e.g., 'power-distribution/fuse-block-configurable')
  showLabel?: boolean; // Whether to show the block label
  labelOffsetX?: number; // X offset for draggable label position
  labelOffsetY?: number; // Y offset for draggable label position
  labelRotation?: number; // Rotation angle in degrees for label
  rotation?: number; // Rotation angle in degrees for the block (0, 90, 180, 270)
  showConnectionLabels?: boolean; // Whether to show connection point names for this block
  wiresOnTop?: boolean; // Whether to render connected wires on top of this block
  locked?: boolean; // Whether the block's position is locked
  flipH?: boolean; // Mirror the block visual horizontally (connection-point x is also mirrored at toggle time)
  flipV?: boolean; // Mirror the block visual vertically
}

export interface Wire {
  id: string;

  // Start point (either block connection or junction)
  fromBlockId?: string;
  fromPointId?: string;
  fromJunctionX?: number;  // X coordinate if starting from a junction
  fromJunctionY?: number;  // Y coordinate if starting from a junction
  fromLooseX?: number;     // X coordinate if detached (dangling) from a block
  fromLooseY?: number;     // Y coordinate if detached (dangling) from a block

  // End point (either block connection or junction)
  toBlockId?: string;
  toPointId?: string;
  toJunctionX?: number;    // X coordinate if ending at a junction
  toJunctionY?: number;    // Y coordinate if ending at a junction
  toLooseX?: number;       // X coordinate if detached (dangling) from a block
  toLooseY?: number;       // Y coordinate if detached (dangling) from a block

  color: string;
  label?: string;
  labelOffsetX?: number; // X offset for draggable label position
  labelOffsetY?: number; // Y offset for draggable label position
  bendPoints: BendPoint[];
  netName?: string;      // Electrical net name for this wire
  netNameRotation?: number; // Rotation angle in degrees for net name label
  busGroupId?: string;  // ID of the bus group this wire belongs to (visual bundling)
  isSelected?: boolean; // For multi-select when creating buses
  busConvergeStart?: number; // Percentage (0-1) where bus converges from individual wires (default 0.15)
  busConvergeEnd?: number;   // Percentage (0-1) where bus diverges to individual wires (default 0.85)
  showColoredStripes?: boolean; // Show alternating colored stripes on bus bundle (default false)

  // Wire gauge (thickness) properties
  wireGauge?: WireGauge;  // Default gauge for entire wire (backward compatibility)
  segmentGauges?: WireSegmentGauge[];  // Per-segment gauge overrides

  /**
   * Per-wire render-layer override.
   * - 'top'    → render above blocks regardless of either block's setting
   * - 'bottom' → render below blocks regardless of either block's setting
   * - undefined → fall back to block-level: any endpoint with wiresOnTop=true lifts it above.
   */
  wireLayer?: 'top' | 'bottom';
}

export interface DiagramData {
  blocks: Block[];
  wires: Wire[];
  busGroups?: Record<string, { name: string; rotation?: number; color?: string }>;
  version: string;
}
