import { OhmsLawValues } from '../../../src/components/tools/OhmsLawCalculator'; 
import {
  calculateOhmsLaw,
  validateInputs
} from '../../../src/components/tools/OhmsLawCalculator/ohmsLawUtils'; 

import { parseValueWithSuffix } from '../../../src/lib/utils/inputUtils';

describe("Ohm's Law Utilities", () => {
  // --- Mock Values ---
  const validSetVR: OhmsLawValues = { voltage: '12', current: '', resistance: '1k', power: '' };
  const validSetVI: OhmsLawValues = { voltage: '12', current: '100mA', resistance: '', power: '' };
  const validSetIR: OhmsLawValues = { voltage: '', current: '2A', resistance: '5', power: '' };
  const validSetVP: OhmsLawValues = { voltage: '12', current: '', resistance: '', power: '24W' };
  const validSetIP: OhmsLawValues = { voltage: '', current: '2A', resistance: '', power: '20W' };
  const validSetRP: OhmsLawValues = { voltage: '', current: '', resistance: '10k', power: '0.04W' }; // 40mW

  const invalidSetV: OhmsLawValues = { voltage: '12', current: '', resistance: '', power: '' };
  const invalidSetI: OhmsLawValues = { voltage: '', current: '1A', resistance: '', power: '' };
  const invalidSetR: OhmsLawValues = { voltage: '', current: '', resistance: '100', power: '' };
  const invalidSetP: OhmsLawValues = { voltage: '', current: '', resistance: '', power: '10W' };
  const invalidSetNone: OhmsLawValues = { voltage: '', current: '', resistance: '', power: '' };
  const invalidSetThree: OhmsLawValues = { voltage: '12', current: '1A', resistance: '12', power: '' };

  // --- validateInputs Tests ---
  describe('validateInputs', () => {
    // Add a debug test for the parser
    test('TEMP DEBUG: parser behavior in this test file', () => {
      console.log('\n--- TEMP DEBUG PARSER ---');
      console.log('Typeof parseValueWithSuffix:', typeof parseValueWithSuffix);
      expect(parseValueWithSuffix('2A')).toBe(2);
      expect(parseValueWithSuffix('5')).toBe(5);
      expect(parseValueWithSuffix('10k')).toBe(10000);
      expect(parseValueWithSuffix('0.04W')).toBe(0.04);
      expect(parseValueWithSuffix('20W')).toBe(20);
      expect(parseValueWithSuffix('100mA')).toBe(0.1);
      console.log('--- END TEMP DEBUG ---\n');
    });

    test('validates voltage calculation inputs', () => {
      // Test with valid input combinations
      expect(validateInputs(validSetIR, 'voltage')).toBe(true); 
      expect(validateInputs(validSetIP, 'voltage')).toBe(true); 
      expect(validateInputs(validSetRP, 'voltage')).toBe(true); 
      
      // Test with invalid input combinations
      expect(validateInputs(invalidSetV, 'voltage')).toBe(false);
      expect(validateInputs(invalidSetI, 'voltage')).toBe(false);
      expect(validateInputs(invalidSetR, 'voltage')).toBe(false);
      expect(validateInputs(invalidSetP, 'voltage')).toBe(false);
      expect(validateInputs(invalidSetNone, 'voltage')).toBe(false);
    });

    test('validates current calculation inputs', () => {
      // Test with valid input combinations
      expect(validateInputs(validSetVR, 'current')).toBe(true); 
      expect(validateInputs(validSetVP, 'current')).toBe(true); 
      expect(validateInputs(validSetRP, 'current')).toBe(true); 
      
      // Test with invalid input combinations
      expect(validateInputs(invalidSetV, 'current')).toBe(false);
      expect(validateInputs(invalidSetI, 'current')).toBe(false);
      expect(validateInputs(invalidSetR, 'current')).toBe(false);
      expect(validateInputs(invalidSetP, 'current')).toBe(false);
      expect(validateInputs(invalidSetNone, 'current')).toBe(false);
    });

    test('validates resistance calculation inputs', () => {
      // Test with valid input combinations
      expect(validateInputs(validSetVI, 'resistance')).toBe(true); 
      expect(validateInputs(validSetVP, 'resistance')).toBe(true); 
      expect(validateInputs(validSetIP, 'resistance')).toBe(true); 
      
      // Test with invalid input combinations
      expect(validateInputs(invalidSetV, 'resistance')).toBe(false);
      expect(validateInputs(invalidSetI, 'resistance')).toBe(false);
      expect(validateInputs(invalidSetR, 'resistance')).toBe(false);
      expect(validateInputs(invalidSetP, 'resistance')).toBe(false);
      expect(validateInputs(invalidSetNone, 'resistance')).toBe(false);
    });

    test('validates power calculation inputs', () => {
      // Test with valid input combinations
      expect(validateInputs(validSetVI, 'power')).toBe(true); 
      expect(validateInputs(validSetVR, 'power')).toBe(true); 
      expect(validateInputs(validSetIR, 'power')).toBe(true); 
      
      // Test with invalid input combinations
      expect(validateInputs(invalidSetV, 'power')).toBe(false);
      expect(validateInputs(invalidSetI, 'power')).toBe(false);
      expect(validateInputs(invalidSetR, 'power')).toBe(false);
      expect(validateInputs(invalidSetP, 'power')).toBe(false);
      expect(validateInputs(invalidSetNone, 'power')).toBe(false);
    });
  });

  // --- calculateOhmsLaw Tests ---
  describe('calculateOhmsLaw', () => {
    test('calculates voltage correctly', () => {
      const values1: OhmsLawValues = { voltage: '', current: '2mA', resistance: '10k', power: '' };
      const result1 = calculateOhmsLaw(values1, 'voltage');
      
      // Use Number() to ensure we're comparing numbers, not strings
      expect(Number(result1.voltage)).toBeCloseTo(20);
      expect(Number(result1.current)).toBeCloseTo(0.002);
      expect(Number(result1.resistance)).toBeCloseTo(10000);
      expect(Number(result1.power)).toBeCloseTo(0.04);
      expect(result1.calculatedProperty).toBe('voltage');
      expect(result1.displayCurrentInMilliamps).toBe(true);

      const values2: OhmsLawValues = { voltage: '', current: '', resistance: '10k', power: '0.04W' };
      const result2 = calculateOhmsLaw(values2, 'voltage');
      expect(Number(result2.voltage)).toBeCloseTo(20);
      expect(Number(result2.current)).toBeCloseTo(0.002);
      expect(result2.calculatedProperty).toBe('voltage');
      expect(result2.displayCurrentInMilliamps).toBe(true);

      const values3: OhmsLawValues = { voltage: '', current: '2mA', resistance: '', power: '0.04' };
      const result3 = calculateOhmsLaw(values3, 'voltage');
      expect(Number(result3.voltage)).toBeCloseTo(20);
      expect(Number(result3.resistance)).toBeCloseTo(10000);
      expect(result3.calculatedProperty).toBe('voltage');
      expect(result3.displayCurrentInMilliamps).toBe(true);
    });

    test('calculates current correctly', () => {
      const values1: OhmsLawValues = { voltage: '12', current: '', resistance: '1k', power: '' };
      const result1 = calculateOhmsLaw(values1, 'current');
      expect(Number(result1.current)).toBeCloseTo(0.012);
      expect(Number(result1.power)).toBeCloseTo(0.144);
      expect(result1.calculatedProperty).toBe('current');
      expect(result1.displayCurrentInMilliamps).toBe(true);

      const values2: OhmsLawValues = { voltage: '', current: '', resistance: '1k', power: '0.144W' };
      const result2 = calculateOhmsLaw(values2, 'current');
      expect(Number(result2.current)).toBeCloseTo(0.012);
      expect(Number(result2.voltage)).toBeCloseTo(12);
      expect(result2.calculatedProperty).toBe('current');
      expect(result2.displayCurrentInMilliamps).toBe(true);

      const values3: OhmsLawValues = { voltage: '12', current: '', resistance: '', power: '0.144' };
      const result3 = calculateOhmsLaw(values3, 'current');
      expect(Number(result3.current)).toBeCloseTo(0.012);
      expect(Number(result3.resistance)).toBeCloseTo(1000);
      expect(result3.calculatedProperty).toBe('current');
      expect(result3.displayCurrentInMilliamps).toBe(true);
    });

    test('calculates resistance correctly', () => {
      const values1: OhmsLawValues = { voltage: '20V', current: '2mA', resistance: '', power: '' };
      const result1 = calculateOhmsLaw(values1, 'resistance');
      expect(Number(result1.resistance)).toBeCloseTo(10000); 
      expect(Number(result1.power)).toBeCloseTo(0.04); 
      expect(result1.calculatedProperty).toBe('resistance');
      expect(result1.displayCurrentInMilliamps).toBe(true);

      const values2: OhmsLawValues = { voltage: '20', current: '', resistance: '', power: '0.04W' };
      const result2 = calculateOhmsLaw(values2, 'resistance');
      expect(Number(result2.resistance)).toBeCloseTo(10000);
      expect(Number(result2.current)).toBeCloseTo(0.002);
      expect(result2.calculatedProperty).toBe('resistance');
      expect(result2.displayCurrentInMilliamps).toBe(true);

      const values3: OhmsLawValues = { voltage: '', current: '2mA', resistance: '', power: '0.04' };
      const result3 = calculateOhmsLaw(values3, 'resistance');
      expect(Number(result3.resistance)).toBeCloseTo(10000);
      expect(Number(result3.voltage)).toBeCloseTo(20);
      expect(result3.calculatedProperty).toBe('resistance');
      expect(result3.displayCurrentInMilliamps).toBe(true);
    });

    test('calculates power correctly', () => {
      const values1: OhmsLawValues = { voltage: '20V', current: '2mA', resistance: '', power: '' };
      const result1 = calculateOhmsLaw(values1, 'power');
      expect(Number(result1.power)).toBeCloseTo(0.04); 
      expect(Number(result1.resistance)).toBeCloseTo(10000);
      expect(result1.calculatedProperty).toBe('power');
      expect(result1.displayCurrentInMilliamps).toBe(true);

      const values2: OhmsLawValues = { voltage: '20', current: '', resistance: '10k', power: '' };
      const result2 = calculateOhmsLaw(values2, 'power');
      expect(Number(result2.power)).toBeCloseTo(0.04);
      expect(Number(result2.current)).toBeCloseTo(0.002);
      expect(result2.calculatedProperty).toBe('power');
      expect(result2.displayCurrentInMilliamps).toBe(true);

      const values3: OhmsLawValues = { voltage: '', current: '2mA', resistance: '10k', power: '' };
      const result3 = calculateOhmsLaw(values3, 'power');
      expect(Number(result3.power)).toBeCloseTo(0.04);
      expect(Number(result3.voltage)).toBeCloseTo(20);
      expect(result3.calculatedProperty).toBe('power');
      expect(result3.displayCurrentInMilliamps).toBe(true);
    });

    test('handles current values with A suffix correctly', () => {
      // Create test values with 2A current
      const values: OhmsLawValues = { voltage: '20V', current: '2A', resistance: '', power: '' };
      
      // Calculate resistance using the values
      const result = calculateOhmsLaw(values, 'resistance');
      
      // Check that resistance is calculated correctly (V/I = 20/2 = 10 Ohms)
      expect(Number(result.resistance)).toBeCloseTo(10);
      
      // Check that power is calculated correctly (V*I = 20*2 = 40 Watts)
      expect(Number(result.power)).toBeCloseTo(40);
      
      // Check that the calculated property is set correctly
      expect(result.calculatedProperty).toBe('resistance');
      
      // Check that displayCurrentInMilliamps is false since 2A is not a small current
      expect(result.displayCurrentInMilliamps).toBe(false);
    });

    test('handles current values with mA suffix correctly', () => {
      const values: OhmsLawValues = { voltage: '12V', current: '', resistance: '1.2k', power: '' };
      const result = calculateOhmsLaw(values, 'current');
      expect(Number(result.current)).toBeCloseTo(0.01); 
      expect(result.displayCurrentInMilliamps).toBe(true);
      expect(result.calculatedProperty).toBe('current');
    });

    test('handles power values correctly', () => {
      const values: OhmsLawValues = { voltage: '10', current: '', resistance: '100', power: '' };
      const result = calculateOhmsLaw(values, 'power');
      expect(Number(result.power)).toBeCloseTo(1);
      expect(Number(result.current)).toBeCloseTo(0.1);
      expect(result.calculatedProperty).toBe('power');
      expect(result.displayCurrentInMilliamps).toBe(false); 
    });

    test('handles insufficient data', () => {
      const values: OhmsLawValues = { voltage: '10', current: '', resistance: '', power: '' };
      const result = calculateOhmsLaw(values, 'resistance');
      expect(result.calculatedProperty).toBeNull();
      expect(result.description).toContain('Insufficient data');
      expect(result.resistance).toBe('');
      expect(result.voltage).toBe('10');
    });
  }); 
}); 