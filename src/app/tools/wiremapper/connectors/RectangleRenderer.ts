import {
  Pin,
  ConnectorConfig,
  DynamicConfigSchema,
  ConfigOption,
  PinNumberingMode,
  ConnectorShape,
} from '../types';
import { IConnectorRenderer } from './base/IConnectorRenderer';
import { CONNECTOR_DEFAULTS } from '../constants';
import { generateUniqueId } from '../utils/generateUniqueId'; // Corrected import path

// Define the available numbering modes
const PIN_NUMBERING_MODES: PinNumberingMode[] = [
  'sequential', // Left-to-right, top-to-bottom
  'row-col',    // R1C1, R1C2, ..., R2C1, ...
  'col-row',    // C1R1, C1R2, ..., C2R1, ...
];

// Helper to calculate pin number based on mode
function calculatePinNumber(
  globalPinIndex: number,
  config: ConnectorConfig,
  actualRows: number,
  pinLayout: number[]
): number | string {
  const { numberingMode = 'sequential', rows = 1, cols = 8 } = config;
  const pinIndex = globalPinIndex + 1; // 1-based index

  // If using pinPattern, complex numbering requires more logic (TODO)
  // For now, pattern implies sequential numbering regardless of mode selection
  if (pinLayout && pinLayout.length > 0 && pinLayout.length !== actualRows) { // Check if it's truly a custom pattern
    console.warn("Pin numbering for custom patterns is currently sequential only.")
    return pinIndex;
  }
  // Fallback to sequential if actualRows or pinLayout seem invalid
  if(actualRows <= 0 || !pinLayout || pinLayout.length === 0){
    return pinIndex;
  }

  // Determine current row and column based on pinLayout for standard grid checks
  let cumulativePins = 0;
  let currentRow = 0;
  let currentPinInRow = 0;
  for(let r = 0; r < actualRows; r++) {
    const pinsInThisRow = pinLayout[r] ?? 0;
    if (globalPinIndex < cumulativePins + pinsInThisRow) {
      currentRow = r;
      currentPinInRow = globalPinIndex - cumulativePins;
      break;
    }
    cumulativePins += pinsInThisRow;
  }

  const current_row_1_based = currentRow + 1;
  const current_col_1_based = currentPinInRow + 1;

  switch (numberingMode) {
    case 'row-col':
      return (current_row_1_based) * 100 + (current_col_1_based); // Example: R1C1 = 101
    case 'col-row':
      // Requires knowing the number of pins in the current column across all rows, complex with pattern
      return pinIndex; // Fallback to sequential for now
    case 'sequential':
    default:
      return pinIndex;
  }
}

export class RectangleRenderer implements IConnectorRenderer {
  shape: ConnectorShape = 'Rectangle'; // Assign string literal
  static readonly displayName = 'Rectangle';

  getConfigurationSchema(): DynamicConfigSchema {
    const configOptions: ConfigOption[] = [
      {
        key: 'rows',
        label: 'Rows',
        type: 'number',
        min: 1,
        max: 20, // Example max
        defaultValue: 1,
        disabledCondition: (config: ConnectorConfig) => !!config.pinPattern?.trim(), // Disable if pinPattern has value
        required: true,
        description: 'Number of rows. Used if Pin Pattern is not set.',
      },
      {
        key: 'cols',
        label: 'Columns',
        type: 'number',
        min: 1,
        max: 20, // Example max
        defaultValue: 8,
        disabledCondition: (config: ConnectorConfig) => !!config.pinPattern?.trim(), // Disable if pinPattern has value
        required: true,
        description: 'Number of columns per row, or max columns for Pin Pattern. Used if Pin Pattern is not set.',
      },
      {
        key: 'pinPattern',
        label: 'Pin Pattern (e.g., 8,6,6,7)',
        type: 'text',
        defaultValue: '',
        required: false,
        placeholder: 'Comma-separated pins per row. Overrides Rows/Cols.',
        description: 'Define exact pin counts for each row, comma-separated (e.g., 8,6,6,7). Overrides Rows and Columns inputs for pin layout.',
      },
      {
        key: 'centerPinsHorizontally',
        label: 'Center pins horizontally',
        type: 'boolean',
        defaultValue: true, // Default to true for better look
      },
      {
        key: 'pinNumberingMode',
        label: 'Pin Numbering Mode',
        type: 'radio',
        options: PIN_NUMBERING_MODES.map(mode => ({
          value: mode,
          label: mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' '), // Nicer labels
        })),
        defaultValue: 'sequential',
      },
    ];

    // Transform the array into the required DynamicConfigSchema object
    const schema: DynamicConfigSchema = {};
    for (const option of configOptions) {
      schema[option.key] = option;
    }
    return schema;
  }

  generatePins(
    config: ConnectorConfig,
    dimensions: { width: number; height: number }
  ): Pin[] {
    const { rows = 1, cols = 8, pinPattern, centerPinsHorizontally = true } = config;
    const pins: Pin[] = [];
    let pinLayout: number[] = [];
    let totalPins = 0;
    let actualRows = rows;

    console.log(`Starting generatePins with config:`, { rows, cols, pinPattern });

    // Pin dimensions and spacing for pattern layout
    const pinSize = CONNECTOR_DEFAULTS.PIN_SIZE;
    const horizontalPinSpacing = 25; // Spacing between centers of pins horizontally
    const verticalPinSpacing = 25;   // Spacing between centers of pins vertically

    // Parse the pin pattern if available
    if (pinPattern && pinPattern.trim()) {
      console.log(`Parsing pin pattern: "${pinPattern}" typeof=${typeof pinPattern}`);
      
      // Simple split and parse approach for reliability
      const parts = pinPattern.trim().split(',');
      console.log(`  Split result (${parts.length} parts): "${parts.join('", "')}"`);
      
      // Convert string parts to numbers, filtering out invalid values
      const patternParts: number[] = [];
      
      for (let i = 0; i < parts.length; i++) {
        const trimmed = parts[i].trim();
        const parsed = parseInt(trimmed, 10);
        
        if (!isNaN(parsed) && parsed > 0) {
          patternParts.push(parsed);
          console.log(`  Part ${i}: "${parts[i]}" => ${parsed} (valid)`);
        } else {
          console.log(`  Part ${i}: "${parts[i]}" => INVALID (${parsed})`);
        }
      }
      
      // Verify we have at least some valid parts
      const validPattern = patternParts.length > 0;
      console.log(`  Pattern valid? ${validPattern}, parts: [${patternParts.join(',')}]`);
      console.log(`  Number of rows to create: ${patternParts.length}`);

      // Add a special debug pattern check
      if (pinPattern === '3,3') {
        console.log(`  SPECIAL CASE: Pattern is exactly "3,3" which should create 2 rows with 3 pins each`);
      }
      
      if (validPattern && patternParts.length > 0) {
        // Valid pattern found
        pinLayout = patternParts;
        actualRows = pinLayout.length; // Number of rows = number of parts in pattern
        totalPins = pinLayout.reduce((sum, count) => sum + count, 0); // Total pins = sum of all numbers
        console.log(`  USING PIN PATTERN: [${pinLayout.join(',')}], rows=${actualRows}, totalPins=${totalPins}`);
        console.log(`  Pins per row: ${JSON.stringify(pinLayout)}`);
      } else {
        console.warn(`  Invalid pinPattern format: "${pinPattern}". Falling back to rows/cols.`);
        // Fallback to standard grid
        totalPins = rows * cols;
        pinLayout = Array(rows).fill(cols);
        actualRows = rows;
      }
    } else {
      // No pattern provided, use rows/cols
      console.log(`No pinPattern, using standard grid: ${rows} rows x ${cols} columns`);
      totalPins = rows * cols;
      pinLayout = Array(rows).fill(cols);
      actualRows = rows;
    }

    if (totalPins <= 0) {
      console.warn('No pins to generate (totalPins <= 0)');
      return [];
    }

    // Calculate positions
    let yPos = 15; // Initial Y position for the first row

    for (let r = 0; r < pinLayout.length; r++) {
      const pinsInThisRow = pinLayout[r];
      const rowWidth = (pinsInThisRow - 1) * horizontalPinSpacing;
      let xStart = (dimensions.width - rowWidth) / 2; // Centered by default

      if (!centerPinsHorizontally) {
        xStart = 15; // Align to left if not centering
      }

      for (let c = 0; c < pinsInThisRow; c++) {
        const xPos = xStart + c * horizontalPinSpacing;
        const globalPinIndex = pins.length;
        
        // Save the current indices for this pin (important for proper row assignment)
        const currentRow = r;
        const currentCol = c;
        
        // Generate a pin at this specific row and column
        console.log(`  Placing pin ${globalPinIndex} at row=${currentRow}, col=${currentCol}`);
        
        // Calculate pin number based on chosen numbering scheme
        const pinNumber = calculatePinNumber(globalPinIndex, config, actualRows, pinLayout);
        
        // Create the pin object with explicit row information in the name
        const pin: Pin = {
          id: generateUniqueId(),
          index: globalPinIndex,
          number: pinNumber, // User-facing number
          pos: typeof pinNumber === 'number' ? pinNumber : globalPinIndex + 1, // Logical position (use number if possible, else index+1)
          name: `Pin ${pinNumber} (r${currentRow}c${currentCol})`, // Include row/col in name for debugging
          row: currentRow, // Add the row property
          col: currentCol, // Add the col property
          x: xPos,
          y: yPos,
          connectedWireIds: [], // Update connectedWireId to connectedWireIds
          config: {},
          active: true,
        };
        
        console.log(`  ✅ Created pin ${globalPinIndex} at R${currentRow}C${currentCol}, pos=(${xPos}, ${yPos})`);
        pins.push(pin);
      }
      yPos += verticalPinSpacing; // Move to the next row, using the tighter spacing
    }
    
    console.log(`Generated ${pins.length} pins total`);
    return pins;
  }

  getPinPosition(
    pinIndex: number,
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
    pinLayoutParam?: number[] // Optional: pass parsed pinLayout from generatePins
  ): { x: number; y: number } | null {
    
    const { rows = 1, cols = 8, pinPattern, centerPinsHorizontally = true } = config;
    let pinLayout: number[] = [];
    if (pinPattern && pinPattern.trim()) {
      const parts = pinPattern.split(',').map((p: string) => parseInt(p.trim(), 10));
      if (parts.every((p: number) => !isNaN(p) && p > 0)) {
        pinLayout = parts;
      }
    }

    // Use pinLayoutParam if provided and valid, otherwise use parsed from pinPattern or default
    if (pinLayoutParam && pinLayoutParam.length > 0 && pinLayoutParam.every(p => p > 0)) {
      pinLayout = pinLayoutParam;
    } else if (pinLayout.length === 0) { // No valid pattern or param, use rows/cols default
      pinLayout = Array(rows).fill(cols);
    }

    const actualNumRows = pinLayout.length;

    // Pin dimensions and spacing
    const pinSize = CONNECTOR_DEFAULTS.PIN_SIZE;
    const horizontalPinSpacing = 12; // Spacing between centers of pins horizontally
    const verticalPinSpacing = 10;   // Spacing between centers of pins vertically
    const padding = 15;              // Padding from connector edges

    let pinsProcessed = 0;
    for (let r = 0; r < actualNumRows; r++) {
      const pinsInThisRow = pinLayout[r];
      if (pinIndex < pinsProcessed + pinsInThisRow) {
        const c = pinIndex - pinsProcessed;
        const rowWidth = (pinsInThisRow - 1) * horizontalPinSpacing;
        let xStart = (dimensions.width - rowWidth) / 2; // Centered by default

        if (!centerPinsHorizontally) {
          xStart = padding; // Align to left if not centering
        }

        const x = xStart + c * horizontalPinSpacing;
        const y = padding + r * verticalPinSpacing; // Pin center y

        return { x, y };
      }
      pinsProcessed += pinsInThisRow;
    }

    return null; // Pin index out of bounds
  }
}