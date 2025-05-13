// Represents a single pin on a connector
export interface Pin {
  id: string;         // Unique identifier for the pin within the connector
  index: number;      // 0-based numerical index, primarily for calculation logic
  number?: number | string; // User-facing pin number (optional, could be 'A1', 1, etc.)
  pos: number; // The logical position (1-based) used for mapping/display
  name: string;       // User-defined name (e.g., 'VCC', 'GND', 'Data0')
  x: number;          // X coordinate relative to connector origin
  y: number;          // Y coordinate relative to connector origin
  connectedWireIds: string[]; // Array of wire IDs connected to this pin
  config: PinConfig; // Specific configuration for the pin (e.g., color, type)
  active: boolean;    // Whether the pin is currently enabled/used
  visible?: boolean;   // Optional: whether the pin should be rendered (defaults to true)
  row?: number;       // Row index (0-based) within the connector grid (optional)
  col?: number;       // Column index (0-based) within the connector grid (optional)
  netName?: string;    // Optional: Name of the electrical net this pin belongs to
  desc?: string;       // Optional: User-defined description for the pin
  voltage?: string | number; // Optional: Voltage level (e.g., 5, 3.3, '5V')
  signalType?: string; // Optional: Type of signal (e.g., 'Analog', 'Digital', 'PWM')
}

// Configuration for a single pin (can be expanded)
export interface PinConfig {
  color?: string;
  type?: 'power' | 'ground' | 'signal' | 'data' | 'nc'; // Example types
}

// Shape identifiers for connectors
export type ConnectorShape = 'Rectangle' | 'Circle';

// Add this export
export type ConnectorGender = 'Male' | 'Female' | 'Unknown';

// Configuration specific to a connector instance
export interface ConnectorConfig {
  [key: string]: any; // Allow arbitrary properties initially
  // Shape-specific properties are defined dynamically by the schema
  rows?: number;
  columns?: number;
  centerPinsHorizontal?: boolean;
  pinNumberingMode?: PinNumberingMode; // Use the enum/type
  numPins?: number;
  pinNumberingStart?: 'top' | 'right' | 'bottom' | 'left';
}

// Defines how pins are numbered visually and logically
export type PinNumberingMode =
  | 'sequential' // Simple 1, 2, 3...
  | 'row-col'    // Number across rows, then down columns
  | 'col-row'    // Number down columns, then across rows
  | 'top'        // Circle specific start
  | 'right'
  | 'bottom'
  | 'left';

// --- Dynamic Configuration Schema Types --- //
interface BaseConfigOption<TValue, TType extends string> {
  key: string; // Unique key matching ConnectorConfig property
  label: string;
  type: TType;
  defaultValue?: TValue;
  required?: boolean; // Optional required flag
  description?: string; // Optional description for the field
  placeholder?: string; // Optional placeholder text for input fields
  disabledCondition?: (state: Partial<ConnectorConfig>) => boolean; // Optional conditional disabling
  visibleCondition?: (state: Partial<ConnectorConfig>) => boolean; // Optional conditional visibility
}

export interface ConfigOptionNumber extends BaseConfigOption<number, 'number'> {
  min?: number;
  max?: number;
  step?: number;
}

export interface ConfigOptionBoolean extends BaseConfigOption<boolean, 'boolean'> {}

export interface ConfigOptionSelectOption<T> {
  label: string;
  value: T;
}

export interface ConfigOptionRadio<T = string | number> extends BaseConfigOption<T, 'radio'> {
  options: ConfigOptionSelectOption<T>[];
}

export interface ConfigOptionSelect<T = string | number> extends BaseConfigOption<T, 'select'> {
  options: ConfigOptionSelectOption<T>[];
}

export interface ConfigOptionText extends BaseConfigOption<string, 'text'> {
  // Future: minLength, maxLength, pattern (regex) etc.
}

// Union type for any config option
export type ConfigOption = ConfigOptionNumber | ConfigOptionBoolean | ConfigOptionRadio | ConfigOptionSelect | ConfigOptionText;

// Defines the structure for dynamic configuration UI generation
export type DynamicConfigSchema = {
  // Keys MUST match properties in ConnectorConfig for automatic state updates
  [key: string]: ConfigOption;
};

// Represents a connector component in the diagram
export interface Connector {
  id: string;
  name: string;
  type?: string; // Optional type identifier (e.g., 'DB9', 'RJ45')
  shape: ConnectorShape; // The shape used for rendering pins
  x: number; // Position on the canvas
  y: number;
  rows?: number; // Optional grid rows for layout
  cols?: number; // Optional grid columns for layout
  width: number; // Overall dimensions
  height: number;
  pins: Pin[];
  config: ConnectorConfig; // Holds dynamic configuration values
  // REMOVED pinNumberingMode - It's now fully within config
  gender?: ConnectorGender; // Use the exported type
  metadata?: Record<string, any>; // For extra info like datasheet link, part number etc.
}

// Represents the visual wire drawn on the canvas
export interface Wire {
  id: string; // Unique ID, typically same as the corresponding Mapping's wireId
  source: { connectorId: string; pinPos: number }; // Starting pin reference
  target: { connectorId: string; pinPos: number }; // Ending pin reference
  color: string;
  thickness?: number; // Optional thickness
  label?: string; // Optional text label on the wire
  // Other potential properties: style (dashed, solid), etc.
}

// Represents the entire diagram state
export interface DiagramState {
  connectors: Connector[];
  wires: Wire[];
  selectedConnectorIds: string[];
  selectedWireIds: string[];
  panOffset: { x: number; y: number };
  scale: number;
}

// For endpoint definitions (e.g., connecting wires)
export type ConnectionPoint = {
  connectorId: string;
  pinId: string; // Changed from pinPos to pinId for uniqueness
};

// Represents a connection between two pins
export interface Mapping {
  id: string; // Unique ID for the mapping itself
  wireId: string; // ID of the associated Wire object
  source: { connectorId: string; pinPos: number }; // Starting point
  target: { connectorId: string; pinPos: number }; // Ending point
  netName?: string; // Optional logical name for the connection
  color?: string; // Optional color for the wire/highlight
  // Add any other mapping-specific properties here
}

export interface WireMapperProject {
  projectName: string;
  connectors: Connector[];
  mappings: Mapping[];
}

export type ConnectorTemplate = Omit<Connector, 'id' | 'position' | 'pins'> & {
  pinCount: number;
  defaultPins?: Pin[];
};

export interface PinSelectionState {
  connectorId: string | null;
  pinPos: number | null;
}

export type AppMode = 'normal' | 'connectionMode';

export interface WireMapperSettings {
  snapToGrid: boolean;
  showGrid: boolean;
  gridSize: number;
  connectionMode: AppMode; // Renamed from 'mode' for clarity
  namePosition: 'inside' | 'above'; // Add back for compatibility
  simplifyConnections: boolean;
  darkMode: boolean;
  defaultWireColor?: string; // Added default color setting
  showWires: boolean; // Controls visibility of connection wires
}

export type PinIdentifier = {
  connectorId: string;
  pinPos: number;
};
