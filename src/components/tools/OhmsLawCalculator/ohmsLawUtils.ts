'use client';

import { OhmsLawValues, OhmsLawResults } from './index';
import { 
  parseValueWithSuffix, 
  formatValueWithSuffix 
} from '../../../lib/utils/inputUtils';

/**
 * Calculate the missing value in Ohm's Law based on the provided values
 * 
 * @param values The input values for voltage, current, resistance, and power
 * @param calculationMode Which property to calculate
 * @returns The calculated results including all values and a description
 */
export function calculateOhmsLaw(
  values: OhmsLawValues,
  calculationMode: 'voltage' | 'current' | 'resistance' | 'power'
): OhmsLawResults {
  // Parse input values
  const voltage = parseValueWithSuffix(values.voltage);
  const current = parseValueWithSuffix(values.current);
  const resistance = parseValueWithSuffix(values.resistance);
  const power = parseValueWithSuffix(values.power);
  
  // Initialize results with input values
  const results: OhmsLawResults = {
    voltage: values.voltage,
    current: values.current,
    resistance: values.resistance,
    power: values.power,
    calculatedProperty: calculationMode,
    description: ''
  };
  
  // Calculate the missing value based on the calculation mode
  switch (calculationMode) {
    case 'voltage':
      // V = I × R or V = sqrt(P × R)
      if (current > 0 && resistance > 0) {
        const calculatedVoltage = current * resistance;
        results.voltage = calculatedVoltage.toString();
        results.description = `Calculated voltage using Ohm's Law (V = I × R). With a current of ${formatValueWithSuffix(current, 'A')} and a resistance of ${formatValueWithSuffix(resistance, 'Ω')}, the voltage is ${formatValueWithSuffix(calculatedVoltage, 'V')}.`;
        
        // Also calculate power
        const calculatedPower = calculatedVoltage * current;
        results.power = calculatedPower.toString();
      } else if (power > 0 && resistance > 0) {
        const calculatedVoltage = Math.sqrt(power * resistance);
        results.voltage = calculatedVoltage.toString();
        results.description = `Calculated voltage using the power formula (V = sqrt(P × R)). With a power of ${formatValueWithSuffix(power, 'W')} and a resistance of ${formatValueWithSuffix(resistance, 'Ω')}, the voltage is ${formatValueWithSuffix(calculatedVoltage, 'V')}.`;
        
        // Also calculate current
        const calculatedCurrent = calculatedVoltage / resistance;
        results.current = calculatedCurrent.toString();
      } else if (power > 0 && current > 0) {
        const calculatedVoltage = power / current;
        results.voltage = calculatedVoltage.toString();
        results.description = `Calculated voltage using the power formula (V = P / I). With a power of ${formatValueWithSuffix(power, 'W')} and a current of ${formatValueWithSuffix(current, 'A')}, the voltage is ${formatValueWithSuffix(calculatedVoltage, 'V')}.`;
        
        // Also calculate resistance
        const calculatedResistance = calculatedVoltage / current;
        results.resistance = calculatedResistance.toString();
      } else {
        results.description = 'Insufficient data to calculate voltage. Please provide either current and resistance, or power and either current or resistance.';
        results.calculatedProperty = null;
      }
      break;
      
    case 'current':
      // I = V / R or I = sqrt(P / R)
      if (voltage > 0 && resistance > 0) {
        const calculatedCurrent = voltage / resistance;
        results.current = calculatedCurrent.toString();
        results.description = `Calculated current using Ohm's Law (I = V / R). With a voltage of ${formatValueWithSuffix(voltage, 'V')} and a resistance of ${formatValueWithSuffix(resistance, 'Ω')}, the current is ${formatValueWithSuffix(calculatedCurrent, 'A')}.`;
        
        // Also calculate power
        const calculatedPower = voltage * calculatedCurrent;
        results.power = calculatedPower.toString();
      } else if (power > 0 && resistance > 0) {
        const calculatedCurrent = Math.sqrt(power / resistance);
        results.current = calculatedCurrent.toString();
        results.description = `Calculated current using the power formula (I = sqrt(P / R)). With a power of ${formatValueWithSuffix(power, 'W')} and a resistance of ${formatValueWithSuffix(resistance, 'Ω')}, the current is ${formatValueWithSuffix(calculatedCurrent, 'A')}.`;
        
        // Also calculate voltage
        const calculatedVoltage = calculatedCurrent * resistance;
        results.voltage = calculatedVoltage.toString();
      } else if (power > 0 && voltage > 0) {
        const calculatedCurrent = power / voltage;
        results.current = calculatedCurrent.toString();
        results.description = `Calculated current using the power formula (I = P / V). With a power of ${formatValueWithSuffix(power, 'W')} and a voltage of ${formatValueWithSuffix(voltage, 'V')}, the current is ${formatValueWithSuffix(calculatedCurrent, 'A')}.`;
        
        // Also calculate resistance
        const calculatedResistance = voltage / calculatedCurrent;
        results.resistance = calculatedResistance.toString();
      } else {
        results.description = 'Insufficient data to calculate current. Please provide either voltage and resistance, or power and either voltage or resistance.';
        results.calculatedProperty = null;
      }
      break;
      
    case 'resistance':
      // R = V / I or R = V² / P
      if (voltage > 0 && current > 0) {
        const calculatedResistance = voltage / current;
        results.resistance = calculatedResistance.toString();
        results.description = `Calculated resistance using Ohm's Law (R = V / I). With a voltage of ${formatValueWithSuffix(voltage, 'V')} and a current of ${formatValueWithSuffix(current, 'A')}, the resistance is ${formatValueWithSuffix(calculatedResistance, 'Ω')}.`;
        
        // Also calculate power
        const calculatedPower = voltage * current;
        results.power = calculatedPower.toString();
      } else if (voltage > 0 && power > 0) {
        const calculatedResistance = (voltage * voltage) / power;
        results.resistance = calculatedResistance.toString();
        results.description = `Calculated resistance using the power formula (R = V² / P). With a voltage of ${formatValueWithSuffix(voltage, 'V')} and a power of ${formatValueWithSuffix(power, 'W')}, the resistance is ${formatValueWithSuffix(calculatedResistance, 'Ω')}.`;
        
        // Also calculate current
        const calculatedCurrent = voltage / calculatedResistance;
        results.current = calculatedCurrent.toString();
      } else if (power > 0 && current > 0) {
        const calculatedResistance = power / (current * current);
        results.resistance = calculatedResistance.toString();
        results.description = `Calculated resistance using the power formula (R = P / I²). With a power of ${formatValueWithSuffix(power, 'W')} and a current of ${formatValueWithSuffix(current, 'A')}, the resistance is ${formatValueWithSuffix(calculatedResistance, 'Ω')}.`;
        
        // Also calculate voltage
        const calculatedVoltage = current * calculatedResistance;
        results.voltage = calculatedVoltage.toString();
      } else {
        results.description = 'Insufficient data to calculate resistance. Please provide either voltage and current, or power and either voltage or current.';
        results.calculatedProperty = null;
      }
      break;
      
    case 'power':
      // P = V × I or P = I² × R or P = V² / R
      if (voltage > 0 && current > 0) {
        const calculatedPower = voltage * current;
        results.power = calculatedPower.toString();
        results.description = `Calculated power using the formula P = V × I. With a voltage of ${formatValueWithSuffix(voltage, 'V')} and a current of ${formatValueWithSuffix(current, 'A')}, the power is ${formatValueWithSuffix(calculatedPower, 'W')}.`;
      } else if (current > 0 && resistance > 0) {
        const calculatedPower = current * current * resistance;
        results.power = calculatedPower.toString();
        results.description = `Calculated power using the formula P = I² × R. With a current of ${formatValueWithSuffix(current, 'A')} and a resistance of ${formatValueWithSuffix(resistance, 'Ω')}, the power is ${formatValueWithSuffix(calculatedPower, 'W')}.`;
        
        // Also calculate voltage
        const calculatedVoltage = current * resistance;
        results.voltage = calculatedVoltage.toString();
      } else if (voltage > 0 && resistance > 0) {
        const calculatedPower = (voltage * voltage) / resistance;
        results.power = calculatedPower.toString();
        results.description = `Calculated power using the formula P = V² / R. With a voltage of ${formatValueWithSuffix(voltage, 'V')} and a resistance of ${formatValueWithSuffix(resistance, 'Ω')}, the power is ${formatValueWithSuffix(calculatedPower, 'W')}.`;
        
        // Also calculate current
        const calculatedCurrent = voltage / resistance;
        results.current = calculatedCurrent.toString();
      } else {
        results.description = 'Insufficient data to calculate power. Please provide either voltage and current, current and resistance, or voltage and resistance.';
        results.calculatedProperty = null;
      }
      break;
  }
  
  return results;
}

/**
 * Validates if the provided values are sufficient to perform the calculation
 * 
 * @param values The input values
 * @param calculationMode Which property to calculate
 * @returns True if the values are sufficient for calculation
 */
export function validateInputs(
  values: OhmsLawValues,
  calculationMode: 'voltage' | 'current' | 'resistance' | 'power'
): boolean {
  const voltage = parseValueWithSuffix(values.voltage);
  const current = parseValueWithSuffix(values.current);
  const resistance = parseValueWithSuffix(values.resistance);
  const power = parseValueWithSuffix(values.power);
  
  switch (calculationMode) {
    case 'voltage':
      return (current > 0 && resistance > 0) || 
             (power > 0 && resistance > 0) || 
             (power > 0 && current > 0);
    case 'current':
      return (voltage > 0 && resistance > 0) || 
             (power > 0 && resistance > 0) || 
             (power > 0 && voltage > 0);
    case 'resistance':
      return (voltage > 0 && current > 0) || 
             (voltage > 0 && power > 0) || 
             (power > 0 && current > 0);
    case 'power':
      return (voltage > 0 && current > 0) || 
             (current > 0 && resistance > 0) || 
             (voltage > 0 && resistance > 0);
    default:
      return false;
  }
}
