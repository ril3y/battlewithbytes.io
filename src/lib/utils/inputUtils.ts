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

  // Check for invalid numeric parts that regex might allow (e.g., "1.2.3", "--5", ".")
  // Only sign or sign + dot is invalid as a final value (but allowed by regex for typing)
  if (/^[+-]?$/.test(match[1]) || /^[+-]?\.$/.test(match[1]) || match[1] === '.') {
      // Allow simple numbers if no suffix (e.g. parseFloat("5") is valid)
      if(!match[2] && /^-?[0-9]+$/.test(match[1])) {
          // Fall through to parse valid integer
      } else {
          // Check if it contains multiple dots
          if (match[1].indexOf('.') !== match[1].lastIndexOf('.')){
             return 0;
          }
           // If it's just a sign/dot, and not a valid number, return 0
           if(!/[0-9]/.test(match[1])) return 0;
      }
  }
   // Check for multiple decimal points
   if (match[1].indexOf('.') !== match[1].lastIndexOf('.')) {
       return 0;
   }


  const numPartString = match[1];
  const suffix = match[2];

  // Handle cases like "." or "+." which result in NaN from parseFloat
  const numValue = parseFloat(numPartString);
  if (isNaN(numValue)) {
       // If the original string only contained digits and a dot, parseFloat might work
       // but if the regex matched but resulted in NaN, treat as invalid.
       // Exception: allow plain numbers that don't need suffix logic.
       if(!suffix && /^-?[0-9]*\.?[0-9]+$/.test(numPartString)) {
            // Let plain number parsing happen
       } else {
           return 0;
       }
  }


  if (!suffix) {
    // No suffix, return the parsed number or 0 if it was invalid (e.g. just '.')
    return isNaN(numValue) ? 0 : numValue;
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
export const isValidNumberInput = (value: string): boolean => {
    // Allow empty string (user clearing the input)
    if (value === '') return true;

    // Allow partial inputs for easier typing
    if (value === '+' || value === '-' || value === '.') return true;

    // Remove spaces for validation
    const cleanedValue = value.replace(/\s+/g, '');

    // Check overall structure: optional sign, digits/dots, optional suffix
    // Allows multiple dots temporarily, checked later
    const structuralRegex = /^-?[\d.]*([kKMmGuµ])?$/i; // Case insensitive suffix check
    if (!structuralRegex.test(cleanedValue)) {
        return false; // Contains invalid characters or multiple suffixes etc.
    }

    // --- Check for specific invalid patterns ---

    // More than one decimal point
    if ((cleanedValue.match(/\./g) || []).length > 1) {
        return false;
    }

    // More than one sign or sign not at the start
    if ((cleanedValue.match(/[+-]/g) || []).length > 1 || !/^[+-]?/.test(cleanedValue)) {
         if((cleanedValue.match(/[+-]/g) || []).length === 1 && cleanedValue.startsWith('-')) {
            // Allow single negative sign at start
         } else if ((cleanedValue.match(/[+-]/g) || []).length === 1 && cleanedValue.startsWith('+')) {
            // Allow single positive sign at start
         } else {
            return false;
         }
    }


    // Suffix directly after dot (e.g., "1.k", ".M")
    // Need to check case insensitively
    if (/\.[kKMmGuµ]$/i.test(cleanedValue)) {
        return false;
    }

    // Suffix after sign without number (e.g., "+k", "-M")
    if (/^[+-][kKMmGuµ]$/i.test(cleanedValue)) {
        return false;
    }

    // If it passed all specific checks, consider it potentially valid
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
