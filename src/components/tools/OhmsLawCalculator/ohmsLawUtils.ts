'use client';

import { OhmsLawValues, OhmsLawResults } from './index'; // Assuming index.tsx defines these types
import {
  parseValueWithSuffix,     // Use the corrected, robust parser
  formatValueWithSuffix     // Used for formatting within descriptions
  // parseFieldValue // Removed - use parseValueWithSuffix directly
} from '../../../lib/utils/inputUtils';

/**
 * Calculate the missing value in Ohm's Law based on the provided values
 *
 * @param values The input values for voltage, current, resistance, and power (as strings)
 * @param calculationMode Which property to calculate
 * @returns The calculated results including all values (as strings) and a description
 */
export function calculateOhmsLaw(
  values: OhmsLawValues,
  calculationMode: 'voltage' | 'current' | 'resistance' | 'power'
): OhmsLawResults {
  // 1. Parse ALL input values robustly using the utility function
  // parseValueWithSuffix returns 0 for invalid/empty, which works for checks below
  const voltage = parseValueWithSuffix(values.voltage);
  const current = parseValueWithSuffix(values.current); // Will handle '5', '5m', '5mA' correctly -> Amps
  const resistance = parseValueWithSuffix(values.resistance);
  const power = parseValueWithSuffix(values.power);

  // 2. Determine if the original input suggested mA display preference
  const isCurrentInputSuggestingMilliamps = values.current &&
    (values.current.toLowerCase().includes('ma') ||
     (values.current.toLowerCase().includes('m') && !/^[0-9.]*M$/i.test(values.current.trim()))); // 'm' suffix, but not MegaOhms etc.


  // 3. Initialize results object - store results as strings for consistency with input state
  const results: OhmsLawResults = {
    voltage: '', // Will be populated below
    current: '', // Will be populated below
    resistance: '', // Will be populated below
    power: '', // Will be populated below
    calculatedProperty: calculationMode,
    description: '',
    // Set the flag based on original input OR if calculated value is small
    // Note: We check the *parsed* current value here for smallness check
    displayCurrentInMilliamps: isCurrentInputSuggestingMilliamps || (current > 0 && current < 0.1)
  };

  // --- Store initially parsed values (even if not calculated yet) ---
  // This ensures that if a value was provided but not calculated, it's still in the results
  if (calculationMode !== 'voltage' && voltage > 0) results.voltage = voltage.toString();
  if (calculationMode !== 'current' && current > 0) results.current = current.toString();
  if (calculationMode !== 'resistance' && resistance > 0) results.resistance = resistance.toString();
  if (calculationMode !== 'power' && power > 0) results.power = power.toString();
  // ---

  // 4. Perform calculations based on mode
  let calculatedVoltage: number | null = null;
  let calculatedCurrent: number | null = null;
  let calculatedResistance: number | null = null;
  let calculatedPower: number | null = null;
  let sufficientData = false;

  // Helper to format numbers for description (using base units mostly)
  const formatForDesc = (val: number, unit: string) => formatValueWithSuffix(val, unit);

  switch (calculationMode) {
    case 'voltage':
      if (current > 0 && resistance > 0) {
        calculatedVoltage = current * resistance;
        calculatedPower = calculatedVoltage * current; // Calculate power too
        results.description = `V = I × R = ${formatForDesc(current, 'A')} × ${formatForDesc(resistance, 'Ω')} = ${formatForDesc(calculatedVoltage, 'V')}. Power P = V × I = ${formatForDesc(calculatedPower, 'W')}.`;
        sufficientData = true;
      } else if (power > 0 && resistance > 0) {
        calculatedVoltage = Math.sqrt(power * resistance);
        calculatedCurrent = calculatedVoltage / resistance; // Calculate current too
        results.description = `V = √(P × R) = √(${formatForDesc(power, 'W')} × ${formatForDesc(resistance, 'Ω')}) = ${formatForDesc(calculatedVoltage, 'V')}. Current I = V / R = ${formatForDesc(calculatedCurrent, 'A')}.`;
        sufficientData = true;
      } else if (power > 0 && current > 0) {
        calculatedVoltage = power / current;
        calculatedResistance = calculatedVoltage / current; // Calculate resistance too
        results.description = `V = P / I = ${formatForDesc(power, 'W')} / ${formatForDesc(current, 'A')} = ${formatForDesc(calculatedVoltage, 'V')}. Resistance R = V / I = ${formatForDesc(calculatedResistance, 'Ω')}.`;
        sufficientData = true;
      }
      break; // End voltage case

    case 'current':
      if (voltage > 0 && resistance > 0) {
        calculatedCurrent = voltage / resistance;
        calculatedPower = voltage * calculatedCurrent;
        results.description = `I = V / R = ${formatForDesc(voltage, 'V')} / ${formatForDesc(resistance, 'Ω')} = ${formatForDesc(calculatedCurrent, 'A')}. Power P = V × I = ${formatForDesc(calculatedPower, 'W')}.`;
        sufficientData = true;
      } else if (power > 0 && resistance > 0) {
        calculatedCurrent = Math.sqrt(power / resistance);
        calculatedVoltage = calculatedCurrent * resistance;
        results.description = `I = √(P / R) = √(${formatForDesc(power, 'W')} / ${formatForDesc(resistance, 'Ω')}) = ${formatForDesc(calculatedCurrent, 'A')}. Voltage V = I × R = ${formatForDesc(calculatedVoltage, 'V')}.`;
        sufficientData = true;
      } else if (power > 0 && voltage > 0) {
        calculatedCurrent = power / voltage;
        calculatedResistance = voltage / calculatedCurrent;
        results.description = `I = P / V = ${formatForDesc(power, 'W')} / ${formatForDesc(voltage, 'V')} = ${formatForDesc(calculatedCurrent, 'A')}. Resistance R = V / I = ${formatForDesc(calculatedResistance, 'Ω')}.`;
        sufficientData = true;
      }
       // Update mA display flag based on *calculated* current if it wasn't set by input
       if(calculatedCurrent !== null && !isCurrentInputSuggestingMilliamps) {
            results.displayCurrentInMilliamps = calculatedCurrent > 0 && calculatedCurrent < 0.1;
       }
      break; // End current case

    case 'resistance':
      if (voltage > 0 && current > 0) {
        calculatedResistance = voltage / current;
        calculatedPower = voltage * current;
        results.description = `R = V / I = ${formatForDesc(voltage, 'V')} / ${formatForDesc(current, 'A')} = ${formatForDesc(calculatedResistance, 'Ω')}. Power P = V × I = ${formatForDesc(calculatedPower, 'W')}.`;
        sufficientData = true;
      } else if (voltage > 0 && power > 0) {
        calculatedResistance = (voltage * voltage) / power;
        calculatedCurrent = voltage / calculatedResistance;
        results.description = `R = V² / P = ${formatForDesc(voltage, 'V')}² / ${formatForDesc(power, 'W')} = ${formatForDesc(calculatedResistance, 'Ω')}. Current I = V / R = ${formatForDesc(calculatedCurrent, 'A')}.`;
        sufficientData = true;
      } else if (power > 0 && current > 0) {
        calculatedResistance = power / (current * current);
        calculatedVoltage = current * calculatedResistance;
        results.description = `R = P / I² = ${formatForDesc(power, 'W')} / ${formatForDesc(current, 'A')}² = ${formatForDesc(calculatedResistance, 'Ω')}. Voltage V = I × R = ${formatForDesc(calculatedVoltage, 'V')}.`;
        sufficientData = true;
      }
      // Update mA display flag based on *calculated* current if it wasn't set by input
      if (calculatedCurrent !== null && !isCurrentInputSuggestingMilliamps) {
        results.displayCurrentInMilliamps = calculatedCurrent > 0 && calculatedCurrent < 0.1;
      }
      break; // End resistance case

    case 'power':
      if (voltage > 0 && current > 0) {
        calculatedPower = voltage * current;
        calculatedResistance = voltage / current;
        results.description = `P = V × I = ${formatForDesc(voltage, 'V')} × ${formatForDesc(current, 'A')} = ${formatForDesc(calculatedPower, 'W')}. Resistance R = V / I = ${formatForDesc(calculatedResistance, 'Ω')}.`;
        sufficientData = true;
      } else if (voltage > 0 && resistance > 0) {
        calculatedPower = (voltage * voltage) / resistance;
        calculatedCurrent = voltage / resistance;
        results.description = `P = V² / R = ${formatForDesc(voltage, 'V')}² / ${formatForDesc(resistance, 'Ω')} = ${formatForDesc(calculatedPower, 'W')}. Current I = V / R = ${formatForDesc(calculatedCurrent, 'A')}.`;
        sufficientData = true;
      } else if (current > 0 && resistance > 0) {
        calculatedPower = current * current * resistance;
        calculatedVoltage = current * resistance;
        results.description = `P = I² × R = ${formatForDesc(current, 'A')}² × ${formatForDesc(resistance, 'Ω')} = ${formatForDesc(calculatedPower, 'W')}. Voltage V = I × R = ${formatForDesc(calculatedVoltage, 'V')}.`;
        sufficientData = true;
      }
      break; // End power case
  }

  // 5. Update results object and handle insufficient data
  if (sufficientData) {
    // Populate the results object with calculated values (as strings)
    if (calculatedVoltage !== null) results.voltage = calculatedVoltage.toString();
    if (calculatedCurrent !== null) results.current = calculatedCurrent.toString();
    if (calculatedResistance !== null) results.resistance = calculatedResistance.toString();
    if (calculatedPower !== null) results.power = calculatedPower.toString();

     // Ensure the display flag is correct if current was recalculated
     if (calculatedCurrent !== null && calculationMode !== 'current' && !isCurrentInputSuggestingMilliamps) {
          results.displayCurrentInMilliamps = calculatedCurrent > 0 && calculatedCurrent < 0.1;
     }

  } else {
    // Not enough data provided for the selected calculation mode
    results.calculatedProperty = null; // Reset calculated property flag
    // Clear potentially partially filled calculated values
    results.voltage = calculationMode === 'voltage' ? '' : results.voltage;
    results.current = calculationMode === 'current' ? '' : results.current;
    results.resistance = calculationMode === 'resistance' ? '' : results.resistance;
    results.power = calculationMode === 'power' ? '' : results.power;

    // Provide a generic error message (could be more specific based on mode)
    results.description = `Insufficient data to calculate ${calculationMode}. Please provide the required two values.`;
  }

  return results;
}


/**
 * Validates if the provided values are sufficient to perform the calculation.
 * NOTE: This might be redundant if the main calculate function handles insufficient data gracefully.
 *
 * @param values The input values (as strings)
 * @param calculationMode Which property to calculate
 * @returns True if the values are sufficient for calculation
 */
export function validateInputs(
  values: OhmsLawValues,
  calculationMode: 'voltage' | 'current' | 'resistance' | 'power'
): boolean {
  // Parse input values using the robust parser
  const voltage = parseValueWithSuffix(values.voltage);
  const current = parseValueWithSuffix(values.current);
  const resistance = parseValueWithSuffix(values.resistance);
  const power = parseValueWithSuffix(values.power);

  let count = 0;
  if (voltage > 0) count++;
  if (current > 0) count++;
  if (resistance > 0) count++;
  if (power > 0) count++;

  // Need exactly 2 values provided (excluding the one being calculated)
  // Or just check if enough data exists for the specific calculation
  let requiredInputsMet = false;
   switch (calculationMode) {
    case 'voltage':
      requiredInputsMet = (current > 0 && resistance > 0) || (power > 0 && resistance > 0) || (power > 0 && current > 0);
      break;
    case 'current':
      requiredInputsMet = (voltage > 0 && resistance > 0) || (power > 0 && resistance > 0) || (power > 0 && voltage > 0);
      break;
    case 'resistance':
       requiredInputsMet = (voltage > 0 && current > 0) || (voltage > 0 && power > 0) || (power > 0 && current > 0);
       break;
    case 'power':
       requiredInputsMet = (voltage > 0 && current > 0) || (voltage > 0 && resistance > 0) || (current > 0 && resistance > 0);
       break;
  }

  // Also ensure that not *too many* inputs were provided, as calculateOhmsLaw uses specific pairs.
  // Count how many of the *needed* inputs for the non-calculated fields exist.
  let providedInputCount = 0;
  if (calculationMode !== 'voltage' && voltage > 0) providedInputCount++;
  if (calculationMode !== 'current' && current > 0) providedInputCount++;
  if (calculationMode !== 'resistance' && resistance > 0) providedInputCount++;
  if (calculationMode !== 'power' && power > 0) providedInputCount++;


  // The core logic now checks specific pairs, so just ensure at least 2 inputs are provided overall.
  // The main function handles the specific pair requirements.
  // return providedInputCount >= 2; // Or perhaps exactly 2?
   return requiredInputsMet; // The check inside calculateOhmsLaw is sufficient.
}