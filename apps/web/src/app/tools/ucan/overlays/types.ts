/**
 * CAN Overlay System - Type Definitions
 *
 * This module defines the types for the custom CAN overlay and auto-decoding system.
 * It supports:
 * - Message decoding (bit-level field extraction)
 * - Custom widget rendering (LED, gauge, analog, etc.)
 * - Layout management for dashboards/overlays
 */

// ============================================================================
// Field Definitions - How to extract and interpret data from CAN messages
// ============================================================================

export type FieldType =
  | 'boolean'    // Single bit flag
  | 'uint'       // Unsigned integer
  | 'int'        // Signed integer (two's complement)
  | 'float'      // IEEE 754 floating point (32-bit)
  | 'enum'       // Enumerated value
  | 'raw';       // Raw bytes (no conversion)

export type ByteOrder = 'little' | 'big';

export interface EnumValue {
  value: number;
  label: string;
  description?: string;
}

export interface FieldDefinition {
  name: string;
  description?: string;

  // Bit-level positioning
  byteOffset: number;      // Starting byte (0-7)
  bitOffset: number;       // Starting bit within byte (0-7)
  bitLength: number;       // Number of bits (1-64)

  // Data interpretation
  type: FieldType;
  byteOrder?: ByteOrder;   // Default: 'little' (matches protocol)

  // Value transformation
  scale?: number;          // Multiply raw value by this (e.g., 0.1 for 0.1V resolution)
  offset?: number;         // Add this to scaled value
  unit?: string;           // Display unit (e.g., 'V', '°C', 'RPM')

  // Enum mapping (for type='enum')
  enumValues?: EnumValue[];

  // Validation
  min?: number;
  max?: number;
}

export interface DecodedField {
  name: string;
  rawValue: number | boolean | number[];  // Raw extracted value
  value: number | boolean | string;       // Transformed/formatted value
  unit?: string;
  valid: boolean;                          // Within min/max range
  description?: string;
}

// ============================================================================
// Message Definitions - CAN message structure
// ============================================================================

export interface MessageDefinition {
  id: string;              // CAN ID in hex format (e.g., '0x100' or '0x18FF1234')
  name: string;
  description?: string;
  dlc?: number;            // Expected data length (0-8), optional for validation
  cycleTime?: number;      // Expected message period in ms (optional)
  fields: FieldDefinition[];
}

export interface DecodedMessage {
  messageId: string;       // CAN ID
  timestamp: number;
  fields: Record<string, DecodedField>;  // Keyed by field name
  definition?: MessageDefinition;
}

// ============================================================================
// Widget Definitions - Visual components for displaying decoded data
// ============================================================================

export type WidgetType =
  | 'led'           // Boolean indicator (on/off, colored circle)
  | 'switch'        // Boolean toggle display
  | 'gauge'         // Circular gauge (speedometer style)
  | 'bar'           // Linear bar graph
  | 'number'        // Numeric display with unit
  | 'text'          // Text display
  | 'graph'         // Time-series line graph
  | 'analog'        // Analog position (steering wheel, pedal position)
  | 'voltage'       // Voltage meter (specialized number display)
  | 'temperature'   // Temperature display with color coding
  | 'bitfield';     // Visual bit flags (8 LEDs for 8 bits)

export interface BaseWidgetConfig {
  label?: string;
  showLabel?: boolean;
  width?: number;      // In grid units or pixels
  height?: number;
}

export interface LEDWidgetConfig extends BaseWidgetConfig {
  type: 'led';
  colorOn?: string;    // CSS color when true
  colorOff?: string;   // CSS color when false
  size?: 'small' | 'medium' | 'large';
}

export interface SwitchWidgetConfig extends BaseWidgetConfig {
  type: 'switch';
  labelOn?: string;
  labelOff?: string;
}

export interface GaugeWidgetConfig extends BaseWidgetConfig {
  type: 'gauge';
  min: number;
  max: number;
  unit?: string;
  dangerZone?: [number, number];  // Red zone range
  warningZone?: [number, number]; // Yellow zone range
  segments?: number;               // Number of tick marks
}

export interface BarWidgetConfig extends BaseWidgetConfig {
  type: 'bar';
  min: number;
  max: number;
  unit?: string;
  orientation?: 'horizontal' | 'vertical';
  colorScale?: 'green' | 'yellow' | 'red' | 'gradient';
}

export interface NumberWidgetConfig extends BaseWidgetConfig {
  type: 'number';
  precision?: number;  // Decimal places
  unit?: string;
  fontSize?: number;
}

export interface TextWidgetConfig extends BaseWidgetConfig {
  type: 'text';
  fontSize?: number;
}

export interface GraphWidgetConfig extends BaseWidgetConfig {
  type: 'graph';
  historyLength?: number;  // Number of samples to show
  min?: number;
  max?: number;
  autoScale?: boolean;
  lineColor?: string;
}

export interface AnalogWidgetConfig extends BaseWidgetConfig {
  type: 'analog';
  min: number;
  max: number;
  icon: 'wheel' | 'pedal' | 'stick' | 'slider';
  unit?: string;
}

export interface VoltageWidgetConfig extends BaseWidgetConfig {
  type: 'voltage';
  precision?: number;
  lowThreshold?: number;   // Warning threshold
  highThreshold?: number;  // Danger threshold
}

export interface TemperatureWidgetConfig extends BaseWidgetConfig {
  type: 'temperature';
  precision?: number;
  unit?: '°C' | '°F' | 'K';
  coldThreshold?: number;
  normalRange?: [number, number];
  hotThreshold?: number;
}

export interface BitfieldWidgetConfig extends BaseWidgetConfig {
  type: 'bitfield';
  bitLabels?: string[];  // Labels for each bit (LSB to MSB)
  orientation?: 'horizontal' | 'vertical';
}

export type WidgetConfig =
  | LEDWidgetConfig
  | SwitchWidgetConfig
  | GaugeWidgetConfig
  | BarWidgetConfig
  | NumberWidgetConfig
  | TextWidgetConfig
  | GraphWidgetConfig
  | AnalogWidgetConfig
  | VoltageWidgetConfig
  | TemperatureWidgetConfig
  | BitfieldWidgetConfig;

// ============================================================================
// Widget Binding - Connect widgets to CAN data
// ============================================================================

export interface WidgetBinding {
  id: string;              // Unique widget instance ID
  config: WidgetConfig;
  messageId: string;       // CAN ID to monitor
  fieldName: string;       // Field within message
}

// ============================================================================
// Layout Definitions - Spatial arrangement of widgets
// ============================================================================

export interface WidgetPosition {
  x: number;      // Grid column or pixel X
  y: number;      // Grid row or pixel Y
  width?: number; // Override widget width
  height?: number;// Override widget height
}

export interface LayoutWidget {
  widgetId: string;        // Reference to WidgetBinding.id
  position: WidgetPosition;
}

export interface Layout {
  id: string;
  name: string;
  description?: string;
  gridColumns?: number;    // CSS grid columns
  gridRows?: number;       // CSS grid rows
  backgroundColor?: string;
  widgets: LayoutWidget[];
}

// ============================================================================
// Definition File - Complete specification
// ============================================================================

export interface CANDefinitionFile {
  version: string;         // Schema version (e.g., '1.0')
  name: string;            // Human-readable name
  description?: string;
  author?: string;
  created?: string;        // ISO date

  // Core definitions
  messages: MessageDefinition[];
  widgets: WidgetBinding[];
  layouts: Layout[];

  // Metadata
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Runtime State
// ============================================================================

export interface DecoderState {
  activeDefinition?: CANDefinitionFile;
  decodedMessages: Map<string, DecodedMessage>;  // Keyed by CAN ID
  activeLayoutId?: string;
}
