'use client';

/**
 * Parses a value with engineering notation suffixes (k, M, m, u, µ, G)
 * and handles optional units like Ω.
 * Examples:
 * - "100" -> 100
 * - "1.5kΩ" -> 1500
 * - "2.2K" -> 2200
 * - "1M" -> 1000000
 * - "0.5m" -> 0.0005 (milli)
 * - "100u" -> 0.0001 (micro)
 * - "100µ" -> 0.0001 (micro)
 * - "2G" -> 2000000000 (giga)
 *
 * @param value The value as a string
 * @returns The parsed value as a number, or 0 for invalid/empty input.
 */
export const parseValueWithSuffix = (value: string): number => {
  // Handle empty or null input explicitly
  if (!value || value.trim() === '') return 0;

  // Remove all spaces and common units like Ω, V, A, etc. for parsing flexibility
  // Keep the core number and potential suffix
  const cleanedValue = value.replace(/[\sΩVAWFHz]/gi, ''); // Add other units if needed

  // Regex to match optional sign, number (potentially decimal), and optional suffix
  // Ensures suffix is at the very end. Allows '.' or '5.'
  const match = cleanedValue.match(/^(-?[0-9]*\.?[0-9]*)([kKMmGuµ])?$/);

  if (!match) {
    // If it doesn't match the structure (e.g., "abc", "1.k", "k1") return 0
    return 0;
  }

  // Check for invalid numeric parts that regex might allow
  const numPartString = match[1];
  const suffix = match[2];
  
  // Check for invalid formats like "1.k" or ".k"
  if (numPartString.endsWith('.') && suffix) {
    return 0;
  }

  // Check for multiple decimal points
  if ((numPartString.match(/\./g) || []).length > 1) {
    return 0;
  }

  // Handle cases like "." or "+." which result in NaN from parseFloat
  const numValue = parseFloat(numPartString);
  if (isNaN(numValue)) {
    return 0;
  }

  if (!suffix) {
    // No suffix, return the parsed number
    return numValue;
  }

  switch (suffix) {
    case 'k':
    case 'K':
      return numValue * 1000;
    case 'M':
      return numValue * 1000000;
    case 'G': // Added Giga
      return numValue * 1000000000;
    case 'm':
      return numValue / 1000; // milli
    case 'u':
    case 'µ': // Added micro symbol
      return numValue / 1000000; // micro
    default:
      // Should not happen if regex is correct, but return 0 as fallback
      return 0;
  }
};

/**
 * Formats a value with appropriate engineering notation suffix
 *
 * @param value The value as a number
 * @param unit Optional unit to append (e.g., "Ω", "V", "A")
 * @returns The formatted value as a string with appropriate suffix
 */
export const formatValueWithSuffix = (value: number, unit: string = ''): string => {
  if (isNaN(value)) return `NaN${unit}`; // Handle NaN input

  // Handle zero separately to avoid issues with log/negative powers
  if (value === 0) return `0.00${unit}`;

  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}G${unit}`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M${unit}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}k${unit}`;
  } else if (value >= 1) {
    // Avoid unnecessary decimals for whole numbers >= 1? Optional.
    // if (value === Math.floor(value)) return `${value}${unit}`;
    return `${value.toFixed(2)}${unit}`;
  } else if (value >= 0.001) {
    return `${(value * 1000).toFixed(2)}m${unit}`;
  } else if (value >= 0.000001) {
    return `${(value * 1000000).toFixed(2)}u${unit}`; // Use 'u' consistently
  } else if (value > 0) {
     // Very small positive numbers -> micro or exponential
     const microVal = value * 1000000;
     if (microVal >= 0.01) { // Show down to 0.01 µΩ
         return `${microVal.toFixed(2)}u${unit}`;
     } else {
         return `${value.toExponential(2)}${unit}`;
     }
  }
  // Handle negative numbers - apply same logic to absolute value then add sign
  else { // value < 0
      const absFormatted = formatValueWithSuffix(Math.abs(value), unit);
      // Check if the formatted value is just the unit (e.g., for very small negatives)
      if (absFormatted === unit || absFormatted === `0.00${unit}`) return `0.00${unit}`;
      return `-${absFormatted}`;
  }
};

/**
 * Validates if the input string represents a valid number potentially
 * with an engineering suffix (k, K, M, m, G, u, µ). Allows partial input like "." or "-".
 *
 * @param value The input value to validate
 * @returns True if the input is potentially valid, false otherwise
 */
// ==== Replace isValidNumberInput AGAIN with this version ====
export const isValidNumberInput = (value: string): boolean => {
  // Allow empty string
  if (value === '') return true;
  // Allow partial inputs for easier typing
  if (value === '+' || value === '-' || value === '.') return true;

  const cleanedValue = value.replace(/\s+/g, '');

  // Define allowed suffixes (Match the parse function. If G is parsed, allow G. If not, remove G.)
  // The test "rejects invalid inputs" expects '10 G' to be false. So DO NOT include G here.
  const allowedSuffixes = 'kKMmuµ';

  // --- Specific Invalid Pattern Checks ---
  // More than one decimal point
  if ((cleanedValue.match(/\./g) || []).length > 1) return false;
  // More than one sign or sign not at the start
  if ((cleanedValue.match(/[+-]/g) || []).length > 1 || (cleanedValue.indexOf('-') > 0) || (cleanedValue.indexOf('+') > 0)) return false;
  // Just "+." or "-." is invalid as a final value
  if (/^[+-]\.$/.test(cleanedValue)) return false;
  // *** ADD THIS CHECK BACK IN: Suffix directly after a dot ***
  const suffixAfterDotRegex = new RegExp(`\\.[${allowedSuffixes}]$`, 'i');
  if (suffixAfterDotRegex.test(cleanedValue)) {
       return false;
  }
  // Reject if ONLY a suffix (e.g., "k")
  const justSuffixRegex = new RegExp(`^[${allowedSuffixes}]$`, 'i');
  if (justSuffixRegex.test(cleanedValue)) {
      return false;
  }
  // Reject if just sign + suffix (e.g., "+k")
  const signSuffixRegex = new RegExp(`^[+-][${allowedSuffixes}]$`, 'i');
  if (signSuffixRegex.test(cleanedValue)) {
      return false;
  }


  // --- Structural Regex Check ---
  // Does it broadly fit the pattern of number + optional suffix?
  const validStructureRegex = new RegExp(
      `^[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)` + // Number part logic
      `([${allowedSuffixes}])?` + // Optional allowed suffix
      `$`, // End anchor
      'i' // Case-insensitive for suffixes
  );

  // If it fails the basic structure OR any of the specific invalid checks above, return false.
  // The structural regex test now mainly serves to reject completely invalid characters or placements.
  if (!validStructureRegex.test(cleanedValue)) {
      return false;
  }

  // If it passes the structural regex AND all the specific invalid checks, it's valid.
  return true;
};
/**
 * Validates if the input is a valid resistance value
 * Allows engineering notation with suffixes and Ω symbol
 * 
 * @param value The input value to validate
 * @returns True if the input is a valid resistance, false otherwise
 */
export const isValidResistance = (value: string): boolean => {
    // Allow empty string (user clearing the input)
    if (value === '') return true;

    // Remove spaces and Ω symbol for validation
    const cleanedValue = value.replace(/[\sΩ]/g, '');
    
    // Use the general number validation
    return isValidNumberInput(cleanedValue);
};

/**
 * Validates if the input is a valid voltage value (number + optional V)
 * 
 * @param value The input value to validate
 * @returns True if the input is a valid voltage, false otherwise
 */
export const isValidVoltage = (value: string): boolean => {
    // Allow empty input
    if (!value || value.trim() === '') return true;

    // Trim whitespace and remove V suffix if present
    const cleanedValue = value.trim().replace(/\s*V$/i, '');
    
    // Use the general number validation without suffix
    // For voltage, we don't allow engineering suffixes
    return /^[+-]?[\d.]+$/.test(cleanedValue) && 
           (cleanedValue.match(/\./g) || []).length <= 1;
};

/**
 * Creates a function to get parameter warnings based on provided ranges
 * 
 * @param warningRanges Object mapping parameter names to their warning ranges
 * @returns A function that returns warnings for parameter values
 */
export const createParameterWarningFunction = (warningRanges: Record<string, {
    min?: number;
    max?: number;
    checkFn?: (value: number) => boolean;
    warningMessage: string;
}>) => {
    return (paramName: string, value: string | number): string => {
        const range = warningRanges[paramName];
        if (!range) return '';

        // Convert string to number if needed
        const numValue = typeof value === 'string' 
            ? parseValueWithSuffix(value)
            : value;

        // Check if value is outside range or fails custom check
        if (
            (range.min !== undefined && numValue < range.min) ||
            (range.max !== undefined && numValue > range.max) ||
            (range.checkFn && range.checkFn(numValue))
        ) {
            return range.warningMessage;
        }

        return '';
    };
};

/**
 * Creates a function to get parameter tooltips
 * 
 * @param tooltips Object mapping parameter names to their tooltips
 * @returns A function that returns tooltips for parameters
 */
export const createParameterTooltipFunction = (tooltips: Record<string, string>) => {
    return (paramName: string): string => {
        return tooltips[paramName] || '';
    };
};

/**
 * Parses a resistance value with suffixes (k, M, etc.) and Ω symbol
 * Alias for parseValueWithSuffix for backward compatibility
 * 
 * @param value The resistance value as a string
 * @returns The parsed resistance value as a number
 */
export const parseResistance = (value: string): number => {
    return parseValueWithSuffix(value);
};

/**
 * Formats a resistance value with appropriate suffix and Ω symbol
 * 
 * @param value The resistance value as a number
 * @returns The formatted resistance value as a string with Ω symbol
 */
export const formatResistance = (value: number): string => {
    return formatValueWithSuffix(value, 'Ω');
};

/**
 * Checks if a parameter value is within a reasonable range for MOSFET applications
 * Returns a warning message if the value is outside the expected range
 * 
 * @param paramType The type of parameter being checked
 * @param value The value to check
 * @param warningRanges Optional custom warning ranges for different parameter types
 * @returns Warning message if value is unusual, empty string otherwise
 */
export const getParameterWarning = (
  paramType: string, 
  value: string | number,
  warningRanges?: Record<string, {
    min?: number;
    max?: number;
    checkFn?: (value: number) => boolean;
    warningMessage: string;
  }>
): string => {
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? 
    (paramType === 'loadResistance' || paramType === 'resistance' ? parseValueWithSuffix(value) : parseFloat(value)) : 
    value;
  
  // Skip check for empty or invalid values
  if (isNaN(numValue)) return '';

  // Use custom warning ranges if provided
  if (warningRanges && warningRanges[paramType]) {
    const range = warningRanges[paramType];
    
    // Check custom function if provided
    if (range.checkFn && range.checkFn(numValue)) {
      return range.warningMessage;
    }
    
    // Check min/max ranges
    if (range.min !== undefined && numValue < range.min) {
      return range.warningMessage;
    }
    
    if (range.max !== undefined && numValue > range.max) {
      return range.warningMessage;
    }
    
    return '';
  }
  
  // Default MOSFET-specific warnings if no custom ranges provided
  switch (paramType) {
    case 'loadResistance':
    case 'resistance':
      if (numValue > 100000) {
        return 'Warning: Resistance is unusually high for typical applications.';
      } else if (numValue < 1) {
        return 'Warning: Resistance is extremely low. This may cause excessive current flow.';
      }
      break;
    
    case 'vg':
    case 'voltage':
      if (Math.abs(numValue) > 20) {
        return 'Warning: Voltage is unusually high.';
      }
      break;
    
    case 'vcc':
      if (numValue > 50) {
        return 'Warning: Supply voltage is high. Ensure this is within the component\'s maximum rating.';
      } else if (numValue < 1) {
        return 'Warning: Supply voltage is very low.';
      }
      break;
    
    case 'vth':
      if (Math.abs(numValue) > 10) {
        return 'Warning: Threshold voltage is unusually high.';
      }
      break;
    
    case 'rds_on':
      if (numValue > 100) {
        return 'Warning: On-resistance is unusually high.';
      } else if (numValue < 0.001) {
        return 'Warning: On-resistance is extremely low.';
      }
      break;
      
    case 'current':
      if (numValue > 10) {
        return 'Warning: Current is unusually high.';
      } else if (numValue < 0.0001) {
        return 'Warning: Current is extremely low.';
      }
      break;
      
    case 'power':
      if (numValue > 100) {
        return 'Warning: Power is unusually high.';
      } else if (numValue < 0.0001) {
        return 'Warning: Power is extremely low.';
      }
      break;
  }
  
  return '';
};

/**
 * Gets a tooltip description for a parameter
 * 
 * @param paramType The type of parameter
 * @param tooltips Optional custom tooltips for different parameter types
 * @returns Description of the parameter
 */
export const getParameterTooltip = (
  paramType: string,
  tooltips?: Record<string, string>
): string => {
  // Use custom tooltips if provided
  if (tooltips && tooltips[paramType]) {
    return tooltips[paramType];
  }
  
  // Default MOSFET-specific tooltips
  switch (paramType) {
    case 'vth':
      return 'Threshold Voltage (Vth): The gate-source voltage at which the MOSFET begins to conduct. For N-channel, typically positive (1-4V). For P-channel, typically negative (-1 to -4V). This is a key parameter that determines when the MOSFET turns on.';
    
    case 'rds_on':
      return 'On Resistance (Rds_on): The drain-source resistance when the MOSFET is fully conducting. Lower values (0.001Ω to 1Ω) mean less power dissipation and higher efficiency. This is the resistance between drain and source when the MOSFET is fully turned on.';
    
    case 'vg':
      return 'Gate Voltage (Vg): The voltage applied to the gate terminal. Controls whether the MOSFET conducts or not. Must exceed threshold voltage (Vth) to turn on an N-channel MOSFET or be below Vth for P-channel.';
    
    case 'vcc':
      return 'Supply Voltage (Vcc): The main power supply voltage for the circuit. Provides the potential difference needed to drive current through the load when the MOSFET is conducting.';
    
    case 'vs':
      return 'Source Voltage (Vs): The voltage at the source terminal. For N-channel MOSFETs, typically connected to ground (0V). For P-channel MOSFETs, typically connected to Vcc.';
    
    case 'loadResistance':
    case 'resistance':
      return 'Resistance (Ω): The resistance of the component or circuit. Can use suffixes like k (kilo), M (mega), m (milli), u (micro).';
      
    case 'voltage':
      return 'Voltage (V): The electrical potential difference. Measured in volts (V).';
      
    case 'current':
      return 'Current (I): The flow of electrical charge. Measured in amperes (A).';
      
    case 'power':
      return 'Power (P): The rate of energy transfer. Measured in watts (W).';
    
    default:
      return '';
  }
};
