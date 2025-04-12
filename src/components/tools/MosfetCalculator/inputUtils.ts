'use client';

/**
 * Parses resistance values with suffixes (k, M, etc.)
 * Examples:
 * - "100" -> 100
 * - "1.5k" -> 1500
 * - "2.2K" -> 2200
 * - "1M" -> 1000000
 * - "0.5m" -> 0.0005 (milli)
 * - "100u" -> 0.0001 (micro)
 * 
 * @param value The resistance value as a string
 * @returns The parsed resistance value as a number
 */
export const parseResistance = (value: string): number => {
  // Remove all spaces
  value = value.replace(/\s+/g, '');
  
  // Handle engineering notation with suffixes
  if (/^[0-9.]+[kKMmGu]?$/.test(value)) {
    const numPart = parseFloat(value.replace(/[kKMmGu]$/, ''));
    const suffix = value.slice(-1);
    
    switch (suffix) {
      case 'k':
      case 'K':
        return numPart * 1000;
      case 'M':
        return numPart * 1000000;
      case 'm':
        return numPart / 1000;
      case 'u':
        return numPart / 1000000;
      case 'G':
        return numPart * 1000000000;
      default:
        return numPart;
    }
  }
  
  // If no suffix or not a valid format, try to parse as a number
  return parseFloat(value);
};

/**
 * Formats a resistance value with appropriate suffix
 * @param value The resistance value as a number
 * @returns The formatted resistance value as a string
 */
export const formatResistance = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}G`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}k`;
  } else if (value >= 1) {
    return value.toFixed(2);
  } else if (value >= 0.001) {
    return `${(value * 1000).toFixed(2)}m`;
  } else if (value >= 0.000001) {
    return `${(value * 1000000).toFixed(2)}u`;
  } else {
    return value.toExponential(2);
  }
};

/**
 * Validates if the input is a valid number with optional suffix
 * @param value The input value to validate
 * @returns True if the input is valid, false otherwise
 */
export const isValidNumberInput = (value: string): boolean => {
  // Allow empty input
  if (!value || value.trim() === '') return true;

  // Allow partial inputs for easier typing (check the raw value)
  if (value === '+' || value === '-' || value === '.') return true;

  // General structure: optional sign, digits/dot, optional suffix
  // This checks for invalid characters or multiple suffixes etc.
  const structuralRegex = /^[+-]?[\d.]*([kKmMuGu])?$/i; // Use case-insensitive for suffixes
  if (!structuralRegex.test(value)) {
      return false;
  }

  // --- Specific invalid patterns not caught by the broad structural regex ---

  // More than one decimal point
  if (value.indexOf('.') !== value.lastIndexOf('.')) {
      return false;
  }

  // Ends with dot directly followed by a suffix (e.g., "1.k", ".M")
  if (/\.[kKmMuGu]$/i.test(value)) {
      return false;
  }

  // Only sign or sign + dot is not valid (e.g., "+", "-.", "+.")
  // (We already allowed single '+', '-', '.' above for partial typing)
  if (/^[+-]\.?$/.test(value)) {
       return false;
  }

  // Regex allows just "." followed by suffix (e.g. ".k") which is invalid.
  // Check if the part before the suffix is just "."
  const numberPart = value.replace(/[kKmMuGu]$/i, '');
  if (numberPart === '.') {
    return false;
  }

  // Ensure there's at least one digit if it's not just a sign/dot partial
  // (already handled by partial checks and the sign/dot checks above, but doesn't hurt)
  if (!/\d/.test(value)) {
      // If no digits, it must be one of the allowed partials handled earlier
      // Or cases like "+.", which are handled by the specific check above
      // This case might catch something like "+k", which structural regex would allow
      if (!/^[+-]$/.test(value.replace(/[kKmMuGu]$/i,''))) { // Check if number part is just a sign
         // If it's not just a sign and has no digits, it must be invalid
         // unless it's just a "." which is handled
         if(value !== '.') return false;
      }
  }


  // If none of the invalid patterns were found, assume it's valid
  return true;
};

/**
 * Validates if the input is a valid resistance value
 * @param value The input value to validate
 * @returns True if the input is a valid resistance, false otherwise
 */
export const isValidResistance = (value: string): boolean => {
  // Empty string is valid (for clearing input)
  if (value === '') return true;
  
  // Remove all spaces
  value = value.replace(/\s+/g, '');
  
  // Check for valid format: number followed by optional suffix
  return /^-?[0-9]*\.?[0-9]*[kKMmGu]?$/.test(value);
};

/**
 * Validates if the input is a valid voltage value
 * @param value The input value to validate
 * @returns True if the input is a valid voltage, false otherwise
 */
export const isValidVoltage = (value: string): boolean => {
  // Allow empty input
  if (!value || value.trim() === '') return true;

  // Trim whitespace once at the beginning
  const trimmedValue = value.trim();

  // Allow partial inputs for easier typing (using the trimmed value)
  if (trimmedValue === '+' || trimmedValue === '-' || trimmedValue === '.') return true;

  // Check for structure: optional sign, digits/dot, optionally followed by 'V' (case-insensitive)
  // Allows spaces between number and 'V'
  const structuralRegex = /^[+-]?[\d.]+(\s*V)?$/i;
  if (!structuralRegex.test(trimmedValue)) {
    // Check if it might just be a number ending in a dot (allowed during typing)
    if (/^[+-]?[\d]+\.$/.test(trimmedValue)) {
        return true; // Allow "5." or "-10." during typing
    }
    return false; // Fails basic structure (e.g., "abc", "5VV", "5 V V", "1k")
  }

  // --- Specific invalid patterns for the number part ---

  // More than one decimal point
  // Need to check before removing optional V
  const numberPart = trimmedValue.replace(/\s*V$/i, ''); // Remove optional V and preceding space
  if (numberPart.indexOf('.') !== numberPart.lastIndexOf('.')) {
    return false;
  }

  // Only sign or sign + dot is not valid (e.g., "+", "-.", "+.")
  if (/^[+-]\.?$/.test(numberPart)) {
     return false;
  }

   // Only a dot is not valid
   if (numberPart === '.') {
     return false;
   }

  // Ensure there's at least one digit if not just a sign/dot partial
  if (!/\d/.test(numberPart)) {
      // If no digits, it must be one of the allowed partials handled earlier
      // or the invalid sign/dot cases handled above.
      return false;
  }

  // Passed all checks
  return true;
};

/**
 * Checks if a parameter value is within a reasonable range for MOSFET applications
 * Returns a warning message if the value is outside the expected range
 * @param paramType The type of parameter being checked
 * @param value The value to check
 * @returns Warning message if value is unusual, empty string otherwise
 */
export const getParameterWarning = (paramType: string, value: string | number): string => {
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? 
    (paramType === 'loadResistance' ? parseResistance(value) : parseFloat(value)) : 
    value;
  
  // Skip check for empty or invalid values
  if (isNaN(numValue)) return '';
  
  switch (paramType) {
    case 'loadResistance':
      if (numValue > 100000) {
        return 'Warning: Load resistance is unusually high for typical MOSFET applications. Power MOSFETs are typically used with loads under 10kΩ.';
      } else if (numValue < 1) {
        return 'Warning: Load resistance is extremely low. This may cause excessive current flow.';
      }
      break;
    
    case 'vg':
      if (Math.abs(numValue) > 20) {
        return 'Warning: Gate voltage is unusually high. Most MOSFETs operate with gate voltages between 3-15V.';
      }
      break;
    
    case 'vcc':
      if (numValue > 50) {
        return 'Warning: Supply voltage is high. Ensure this is within the MOSFET\'s maximum Vds rating.';
      } else if (numValue < 1) {
        return 'Warning: Supply voltage is very low. The MOSFET may not operate as expected.';
      }
      break;
    
    case 'vth':
      if (Math.abs(numValue) > 10) {
        return 'Warning: Threshold voltage is unusually high. Most MOSFETs have Vth between 1-5V (or -1 to -5V for P-channel).';
      }
      break;
    
    case 'rds_on':
      if (numValue > 100) {
        return 'Warning: On-resistance is unusually high. Power MOSFETs typically have Rds_on values under 1Ω.';
      } else if (numValue < 0.001) {
        return 'Warning: On-resistance is extremely low. This may be unrealistic for real-world MOSFETs.';
      }
      break;
  }
  
  return '';
};

/**
 * Gets a tooltip description for a MOSFET parameter
 * @param paramType The type of parameter
 * @returns Description of the parameter
 */
export const getParameterTooltip = (paramType: string): string => {
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
      return 'Load Resistance (Ω): The resistance of the device being controlled by the MOSFET (like an LED, motor, or relay). Can use suffixes like k (kilo), M (mega), m (milli), u (micro). Typical values for power applications range from 1Ω to 10kΩ.';
    
    default:
      return '';
  }
};