/**
 * uCAN - Universal USB-to-CAN Monitor
 * TypeScript type definitions for CAN messages, configuration, and state management
 */

// ============================================================================
// CAN Message Types
// ============================================================================

export type MessageDirection = 'RX' | 'TX';
export type MessageType = 'CAN_RX' | 'CAN_TX' | 'CAN_ERR' | 'STATUS' | 'STATS' | 'CAPS' | 'ACTIONDEF' | 'RULE' | 'ACTION';

/**
 * Core CAN message structure
 */
export interface CANMessage {
  /** Unique message ID */
  id: string;
  /** Message timestamp */
  timestamp: Date;
  /** Message direction (RX/TX) */
  direction: MessageDirection;
  /** Message type from protocol */
  type: MessageType;
  /** CAN ID (11-bit or 29-bit) */
  canId: number;
  /** Data bytes */
  data: Uint8Array;
  /** Data length (0-8 for standard CAN) */
  length: number;
  /** Whether this is an extended ID (29-bit) */
  isExtended: boolean;
  /** Success status for TX messages */
  success?: boolean;
  /** Error message if applicable */
  error?: string;
}

/**
 * Parsed protocol message from serial port
 */
export interface ProtocolMessage {
  type: MessageType;
  canId?: number;
  data?: number[];
  timestamp?: number; // Optional firmware timestamp (milliseconds since epoch)
  error?: string;
  status?: string;
  // STATS message fields (Protocol spec: STATS;<RX>;<TX>;<ERR>;<LOAD>[;<TIMESTAMP>])
  stats?: {
    rxCount: number;
    txCount: number;
    errorCount: number;
    busLoad: number;
    timestamp?: number;
  };
  raw: string;
}

// ============================================================================
// Statistics & Monitoring
// ============================================================================

/**
 * Bus statistics
 */
export interface BusStatistics {
  /** Total messages received */
  rxCount: number;
  /** Total messages transmitted */
  txCount: number;
  /** Total errors */
  errorCount: number;
  /** Messages per second */
  messagesPerSecond: number;
  /** Estimated bus load percentage */
  busLoad: number;
  /** Connection uptime in milliseconds */
  uptime: number;
  /** Messages per CAN ID */
  perIdStats: Map<number, MessageStats>;
}

/**
 * Statistics for a specific CAN ID
 */
export interface MessageStats {
  canId: number;
  count: number;
  lastSeen: Date;
  frequency: number; // messages per second
  averageInterval: number; // milliseconds
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Message filter configuration
 */
export interface MessageFilter {
  /** Filter by message direction */
  directions: Set<MessageDirection>;
  /** Filter by CAN ID (empty = all) */
  canIds: Set<number>;
  /** Filter by CAN ID range */
  canIdRange?: {
    min: number;
    max: number;
  };
  /** Filter by data pattern (hex string) */
  dataPattern?: string;
  /** Filter by text search in formatted message */
  searchText?: string;
  /** Show only errors */
  errorsOnly: boolean;
}

// ============================================================================
// Serial Configuration
// ============================================================================

/**
 * Serial port configuration
 */
export interface SerialConfig {
  /** Baud rate */
  baudRate: number;
  /** Data bits */
  dataBits: 7 | 8;
  /** Stop bits */
  stopBits: 1 | 2;
  /** Parity */
  parity: 'none' | 'even' | 'odd';
  /** Flow control */
  flowControl: 'none' | 'hardware';
}

/**
 * Default serial configuration for uCAN
 */
export const DEFAULT_SERIAL_CONFIG: SerialConfig = {
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'none'
};

// ============================================================================
// Connection State
// ============================================================================

/**
 * Connection state
 */
export interface ConnectionState {
  /** Whether serial port is connected */
  isConnected: boolean;
  /** Connected port */
  port: SerialPort | null;
  /** Serial reader */
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  /** Serial writer */
  writer: WritableStreamDefaultWriter<Uint8Array> | null;
  /** Connection error if any */
  error: string | null;
  /** Device information */
  deviceInfo?: DeviceInfo;
}

/**
 * Connected device information
 */
export interface DeviceInfo {
  /** Vendor ID */
  vendorId?: number;
  /** Product ID */
  productId?: number;
  /** Product name */
  productName?: string;
  /** Manufacturer */
  manufacturer?: string;
  /** Serial number */
  serialNumber?: string;
}

// ============================================================================
// View Modes
// ============================================================================

export type ViewMode = 'list' | 'hex' | 'stats' | 'timeline';

/**
 * Display options
 */
export interface DisplayOptions {
  /** Current view mode */
  viewMode: ViewMode;
  /** Show timestamps */
  showTimestamps: boolean;
  /** Show raw hex data */
  showRawHex: boolean;
  /** Auto-scroll to new messages */
  autoScroll: boolean;
  /** Maximum messages to buffer */
  maxMessages: number;
  /** Pause message capture */
  paused: boolean;
}

/**
 * Default display options
 */
export const DEFAULT_DISPLAY_OPTIONS: DisplayOptions = {
  viewMode: 'list',
  showTimestamps: true,
  showRawHex: true,
  autoScroll: true,
  maxMessages: 10000,
  paused: false
};

// ============================================================================
// Export Configuration
// ============================================================================

export type ExportFormat = 'csv' | 'json' | 'txt';

/**
 * Export configuration
 */
export interface ExportConfig {
  format: ExportFormat;
  includeTimestamps: boolean;
  includeRawData: boolean;
  includeStats: boolean;
  filename?: string;
}

// ============================================================================
// Firmware Flashing
// ============================================================================

/**
 * UF2 block structure
 */
export interface UF2Block {
  /** Block flags */
  flags: number;
  /** Target address */
  targetAddr: number;
  /** Payload size */
  payloadSize: number;
  /** Block number */
  blockNo: number;
  /** Total number of blocks */
  numBlocks: number;
  /** Family ID */
  familyId: number;
  /** Data payload */
  data: Uint8Array;
}

/**
 * Supported board types
 */
export type BoardType = 'feather_m4_can' | 'pico' | 'esp32' | 'unknown';

/**
 * Board information
 */
export interface BoardInfo {
  type: BoardType;
  name: string;
  familyId: number;
  bootloaderSupport: 'uf2' | 'dfu' | 'esptool' | 'none';
  description: string;
}

/**
 * Firmware flash progress
 */
export interface FlashProgress {
  /** Current block being flashed */
  currentBlock: number;
  /** Total blocks */
  totalBlocks: number;
  /** Percentage complete (0-100) */
  percentage: number;
  /** Current status message */
  status: string;
  /** Whether flashing is complete */
  isComplete: boolean;
  /** Error if any */
  error?: string;
}

// ============================================================================
// Application State
// ============================================================================

/**
 * Main application state
 */
export interface UCANState {
  /** Connection state */
  connection: ConnectionState;
  /** Display options */
  display: DisplayOptions;
  /** Message filter */
  filter: MessageFilter;
  /** Statistics */
  stats: BusStatistics;
  /** Message buffer */
  messages: CANMessage[];
  /** Selected message ID (for detail view) */
  selectedMessageId?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Callback for handling messages
 */
export type MessageCallback = (message: CANMessage) => void;

/**
 * Callback for handling connection state changes
 */
export type ConnectionCallback = (connected: boolean, error?: string) => void;

/**
 * Callback for flash progress updates
 */
export type FlashProgressCallback = (progress: FlashProgress) => void;

// ============================================================================
// Board Capabilities & Action Rules
// ============================================================================

/**
 * Board capabilities response from get:capabilities
 * Protocol v2.0 format
 */
export interface BoardCapabilities {
  board?: string;
  chip?: string;
  clock_mhz?: number;
  flash_kb?: number;
  ram_kb?: number;
  can?: {
    controllers?: number;
    max_bitrate?: number;
    fd_capable?: boolean;
    filters?: number;
  };
  gpio?: {
    total?: number;
    pwm?: number;
    adc?: number;
    dac?: number;
  };
  features?: string[];
  protocol_version?: string;
  firmware_version?: string;
  // Legacy fields (for backward compatibility)
  canSpeed?: number;
  gpioCount?: number;
  pwmCount?: number;
  adcCount?: number;
  dacCount?: number;
  neopixelPin?: number;
  neopixel?: boolean;
  max_rules?: number;
}

/**
 * Action parameter definition from get:actiondefs
 */
export interface ActionParameter {
  /** Parameter name */
  n: string;
  /** Type: 0=uint8, 1=uint16, 2=uint32, 3=int8, 4=int16, 5=int32, 6=float, 7=bool */
  t: number;
  /** Data byte index (0-7) */
  b: number;
  /** Bit offset within byte (0-7) */
  o: number;
  /** Bit length (1-8) */
  l: number;
  /** Range (min-max string) */
  r?: string;
  /** Parameter role: 'action_param', 'output_param', 'trigger_param' */
  role?: string;
  /** Human-friendly parameter name for UI display (Protocol v2.0+) */
  label?: string;
  /** Help text/example for UI tooltips (Protocol v2.0+) */
  hint?: string;
}

/**
 * Action definition response from get:actiondef or get:actiondefs
 */
export interface ActionDefinition {
  /** Action ID (enum value) */
  i: number;
  /** Action name */
  n: string;
  /** Description */
  d: string;
  /** Category */
  c: string;
  /** Trigger type: 'can_msg', 'manual', 'periodic' */
  trig?: string;
  /** Parameters array */
  p: ActionParameter[];
}

/**
 * Action rule configuration (client-side state)
 */
export interface ActionRule {
  /** Unique rule ID */
  id: number;
  /** Rule name/label */
  name: string;
  /** CAN ID to match */
  canId: number;
  /** CAN ID mask */
  canMask: number;
  /** Data pattern to match */
  dataPattern?: string;
  /** Data mask */
  dataMask?: string;
  /** Data length to match (0=any) */
  dataLength: number;
  /** Action type */
  actionType: string;
  /** Parameter source: 'candata' or 'fixed' */
  paramSource: 'candata' | 'fixed';
  /** Fixed parameters (when paramSource='fixed') */
  params?: string[];
  /** Whether rule is enabled */
  enabled: boolean;
}
