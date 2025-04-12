'use client';

/**
 * Parses a value with engineering notation suffixes (k, M, m, u, µ, G)
 * and handles optional units like Ω, V, A etc. by ignoring them during parsing.
 * Handles 'mA' specifically for current.
 *
 * @param value The value as a string.
 * @returns The parsed value as a number, or 0 for invalid/empty input.
 */
export const parseValueWithSuffix = (value: string): number => {
  // Handle empty or null input explicitly
  if (!value || value.trim() === '') return 0;

  // Trim whitespace first
  const trimmedValue = value.trim();

  // --- Handle specific formats FIRST ---

  // Handle special case for mA (milliamps) - case-insensitive
  if (/^[-+]?\d*\.?\d*ma$/i.test(trimmedValue)) {
    const numericPart = trimmedValue.replace(/ma$/i, '');
    const num = parseFloat(numericPart); // Use parseFloat for robustness
    return isNaN(num) ? 0 : num / 1000; // Convert mA to A
  }

  // --- Handle general number + optional single-char suffix ---

  // Remove common units AFTER checking for multi-char units like 'mA'
  const cleanValue = trimmedValue.replace(/[ΩVAWFHz]/gi, ''); // Remove units

  // Regex to capture number part and optional single suffix
  // Uses parseFloat internally, so handles "5." or ".5" correctly if parsed.
  // Allows sign.
  const match = cleanValue.match(/^([-+]?\d*\.?\d*)?([kKmMGuµ])?$/i); // Capture num part and suffix

  if (!match || match[0] !== cleanValue) { // Check if the entire string matches the pattern
       // Try parsing as plain number if pattern fails (e.g. just "123")
       const plainNum = parseFloat(cleanValue);
       if (!isNaN(plainNum)) return plainNum;
       // If pattern failed AND it's not a plain number, it's invalid
       return 0;
  }

  const numPartString = match[1] || ''; // Number part (might be empty if only suffix like "k")
  const suffix = match[2]; // The suffix character (e.g., 'k', 'M', 'm') or undefined

  // If only a suffix was provided (e.g. "k", "m") -> Invalid
  if (numPartString === '' && suffix) return 0;
  // If sign only was provided (e.g. "+", "-") -> Invalid
  if (/^[+-]$/.test(numPartString)) return 0;

  // Parse the number part
  const numValue = parseFloat(numPartString);

  // If parsing failed (e.g. "+.", ".") and it wasn't handled above
  if (isNaN(numValue)) {
      // Allow parsing plain numbers like "5" if suffix is missing
       if (!suffix && !isNaN(parseFloat(cleanValue))) {
           return parseFloat(cleanValue);
       }
       return 0; // Invalid if NaN with suffix or unparseable pattern
  }

  // Apply suffix multiplier/divisor if suffix exists
  if (suffix) {
    // IMPORTANT: Switch on the ORIGINAL case suffix from match[2]
    switch (suffix) {
      case 'k':             // Lowercase k
      case 'K':             // Uppercase K
        return numValue * 1000; // kilo

      case 'M':             // Uppercase M (Mega)
        return numValue * 1000000; // mega

      case 'G':             // Uppercase G (Giga)
         // case 'g': // Add if you want lowercase 'g' for Giga too
        return numValue * 1000000000; // giga

      case 'm':             // Lowercase m (milli)
        return numValue / 1000; // milli

      case 'u':             // Lowercase u
      case 'µ':             // Micro symbol
        return numValue / 1000000; // micro

      default:
        // Suffix was captured by regex but isn't in the switch? Return base value.
        return numValue;
    }
  }

  // No suffix, return the parsed number
  return numValue;
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
  if (value === 0) return `0.000${unit}`;

  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(3)}G${unit}`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(3)}M${unit}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(3)}k${unit}`;
  } else if (value >= 1) {
    // Avoid unnecessary decimals for whole numbers >= 1? Optional.
    // if (value === Math.floor(value)) return `${value}${unit}`;
    return `${value.toFixed(3)}${unit}`;
  } else if (value >= 0.001) {
    return `${(value * 1000).toFixed(3)}m${unit}`;
  } else if (value >= 0.000001) {
    return `${(value * 1000000).toFixed(3)}u${unit}`; // Use 'u' consistently
  } else if (value > 0) {
     // Very small positive numbers -> micro or exponential
     const microVal = value * 1000000;
     if (microVal >= 0.01) { // Show down to 0.01 µΩ
         return `${microVal.toFixed(3)}u${unit}`;
     } else {
         return `${value.toExponential(3)}${unit}`;
     }
  }
  // Handle negative numbers - apply same logic to absolute value then add sign
  else { // value < 0
      const absFormatted = formatValueWithSuffix(Math.abs(value), unit);
      // Check if the formatted value is just the unit (e.g., for very small negatives)
      if (absFormatted === unit || absFormatted === `0.000${unit}`) return `0.000${unit}`;
      return `-${absFormatted}`;
  }
};

/**
 * Validates if the input is a valid number with optional engineering notation suffix
 * 
 * @param value The input value to validate
 * @returns True if the input is a valid number with optional suffix
 */
export const isValidNumberInput = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  
  // Remove any Ω, V, or W symbols for validation
  const cleanValue = value.replace(/[ΩVW]/g, '').trim();
  
  // Basic number pattern (allows decimal points, signs)
  if (/^[-+]?\d*\.?\d*$/.test(cleanValue)) {
    return true;
  }
  
  // Handle special case for mA (milliamps)
  if (/^[-+]?\d*\.?\d*ma$/i.test(cleanValue)) {
    return true;
  }
  
  // Handle engineering notation with suffixes
  if (/^[-+]?\d*\.?\d*[kKmMuµG]$/i.test(cleanValue)) {
    // Make sure there's a number before the suffix
    const numericPart = cleanValue.slice(0, -1);
    return numericPart.length > 0 && !isNaN(Number(numericPart));
  }
  
  return false;
};

/**
 * Validates if the input is a valid voltage value
 * Allows decimal numbers with optional V symbol
 * 
 * @param value The input value to validate
 * @returns True if the input is a valid voltage value
 */
export const isValidVoltage = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  
  // Remove V symbol if present
  const cleanValue = value.replace(/V/gi, '').trim();
  
  // Basic number pattern (allows decimal points, signs)
  if (/^[-+]?\d*\.?\d*$/.test(cleanValue)) {
    return true;
  }
  
  // Allow voltage with k, m, µ suffixes
  if (/^[-+]?\d*\.?\d*[kKmMuµ]$/i.test(cleanValue)) {
    const numericPart = cleanValue.slice(0, -1);
    return numericPart.length > 0 && !isNaN(Number(numericPart));
  }
  
  return false;
};

/**
 * Validates if the input is a valid resistance value
 * Allows engineering notation with suffixes and Ω symbol
 * 
 * @param value The input value to validate
 * @returns True if the input is a valid resistance value
 */
export const isValidResistance = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  
  // Remove Ω symbol if present
  const cleanValue = value.replace(/Ω/g, '').trim();
  
  // Basic number pattern (allows decimal points, signs)
  if (/^[-+]?\d*\.?\d*$/.test(cleanValue)) {
    return true;
  }
  
  // Allow resistance with k, M, m, µ suffixes
  if (/^[-+]?\d*\.?\d*[kKMmuµ]$/i.test(cleanValue)) {
    const numericPart = cleanValue.slice(0, -1);
    return numericPart.length > 0 && !isNaN(Number(numericPart));
  }
  
  return false;
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

/**
 * Field types for validation
 */
export type FieldType = 'voltage' | 'current' | 'resistance' | 'power' | 'generic';

/**
 * Parse a value based on field type with appropriate default units
 * - current: plain numbers treated as A (e.g., 5 → 5A)
 * - resistance: plain numbers treated as Ω (e.g., 5 → 5Ω)
 * - power: plain numbers treated as W (e.g., 5 → 5W)
 * - voltage: plain numbers treated as V (e.g., 5 → 5V)
 * 
 * @param value The value to parse
 * @param fieldType The type of field
 * @returns The parsed value as a number
 */
export const parseFieldValue = (
  value: string,
  fieldType: FieldType = 'generic'
): number => {
  if (!value || value.trim() === '') return 0;
  
  // If it's a plain number with no suffix, treat it as the base unit
  if (!isNaN(Number(value)) && !value.match(/[a-zA-Z]/)) {
    return Number(value); // All plain numbers are in their base unit (A, V, Ω, W)
  }
  
  // Handle special case for mA (milliamps) - both "ma" and "m" suffixes
  if (fieldType === 'current') {
    // Check for explicit mA suffix
    if (/^\d*\.?\d*ma$/i.test(value)) {
      const numericPart = value.replace(/ma$/i, '');
      return Number(numericPart) / 1000; // Convert mA to A
    }
    
    // Also check for just "m" suffix for current (interpret as mA)
    if (/^\d*\.?\d*m$/i.test(value)) {
      const numericPart = value.replace(/m$/i, '');
      return Number(numericPart) / 1000; // Convert mA to A
    }
  }
  
  // Use standard parser for values with other suffixes
  return parseValueWithSuffix(value);
};

/**
 * Validates input based on field type
 * Allows any text input but provides validation status
 * 
 * @param value The input value to validate
 * @param fieldType The type of field being validated
 * @returns Object with validation status and parsed value
 */
export const validateFieldInput = (
  value: string,
  fieldType: FieldType = 'generic'
): { isValid: boolean; parsedValue: number } => {
  // Empty values are considered valid but with zero value
  if (!value || value.trim() === '') {
    return { isValid: true, parsedValue: 0 };
  }
  
  let parsedValue = 0;
  let isValid = false;
  
  // If it's a plain number with no suffix
  if (!isNaN(Number(value)) && !value.match(/[a-zA-Z]/)) {
    parsedValue = parseFieldValue(value, fieldType);
    isValid = true;
    return { isValid, parsedValue };
  }
  
  // For values with suffixes, validate based on field type
  switch (fieldType) {
    case 'current':
      if (isValidNumberInput(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
      
    case 'voltage':
      if (isValidVoltage(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
      
    case 'resistance':
      if (isValidResistance(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
      
    case 'power':
      if (isValidNumberInput(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
      
    case 'generic':
    default:
      if (isValidNumberInput(value)) {
        parsedValue = parseValueWithSuffix(value);
        isValid = true;
      }
      break;
  }
  
  return { isValid, parsedValue };
};
