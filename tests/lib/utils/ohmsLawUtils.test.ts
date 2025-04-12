import { calculateOhmsLaw, validateInputs } from '../../../src/components/tools/OhmsLawCalculator/ohmsLawUtils';
import { OhmsLawValues } from '../../../src/components/tools/OhmsLawCalculator/index';

describe('Ohm\'s Law Utilities', () => {
  describe('validateInputs', () => {
    test('validates voltage calculation inputs', () => {
      // Current and resistance provided
      expect(validateInputs({
        voltage: '',
        current: '2000', // 2000mA = 2A
        resistance: '10',
        power: ''
      }, 'voltage')).toBe(true);
      
      // Power and resistance provided
      expect(validateInputs({
        voltage: '',
        current: '',
        resistance: '10',
        power: '40',
      }, 'voltage')).toBe(true);
      
      // Power and current provided
      expect(validateInputs({
        voltage: '',
        current: '2000', // 2000mA = 2A
        resistance: '',
        power: '40000', // 40000mW = 40W
      }, 'voltage')).toBe(true);
      
      // Insufficient data
      expect(validateInputs({
        voltage: '',
        current: '',
        resistance: '10',
        power: ''
      }, 'voltage')).toBe(false);
    });
    
    test('validates current calculation inputs', () => {
      // Voltage and resistance provided
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '10',
        power: ''
      }, 'current')).toBe(true);
      
      // Power and resistance provided
      expect(validateInputs({
        voltage: '',
        current: '',
        resistance: '10',
        power: '40000', // 40000mW = 40W
      }, 'current')).toBe(true);
      
      // Power and voltage provided
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: '40000', // 40000mW = 40W
      }, 'current')).toBe(true);
      
      // Insufficient data
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: ''
      }, 'current')).toBe(false);
    });
    
    test('validates resistance calculation inputs', () => {
      // Voltage and current provided
      expect(validateInputs({
        voltage: '20',
        current: '2000', // 2000mA = 2A
        resistance: '',
        power: ''
      }, 'resistance')).toBe(true);
      
      // Voltage and power provided
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: '40000', // 40000mW = 40W
      }, 'resistance')).toBe(true);
      
      // Power and current provided
      expect(validateInputs({
        voltage: '',
        current: '2000', // 2000mA = 2A
        resistance: '',
        power: '40000', // 40000mW = 40W
      }, 'resistance')).toBe(true);
      
      // Insufficient data
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: ''
      }, 'resistance')).toBe(false);
    });
    
    test('validates power calculation inputs', () => {
      // Voltage and current provided
      expect(validateInputs({
        voltage: '20',
        current: '2000', // 2000mA = 2A
        resistance: '',
        power: ''
      }, 'power')).toBe(true);
      
      // Current and resistance provided
      expect(validateInputs({
        voltage: '',
        current: '2000', // 2000mA = 2A
        resistance: '10',
        power: ''
      }, 'power')).toBe(true);
      
      // Voltage and resistance provided
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '10',
        power: ''
      }, 'power')).toBe(true);
      
      // Insufficient data
      expect(validateInputs({
        voltage: '20',
        current: '',
        resistance: '',
        power: ''
      }, 'power')).toBe(false);
    });
  });
  
  describe('calculateOhmsLaw', () => {
    test('calculates voltage correctly', () => {
      // Using current and resistance (V = I × R)
      const values: OhmsLawValues = {
        voltage: '',
        current: '2000', // 2000mA = 2A
        resistance: '10',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'voltage');
      expect(parseFloat(result.voltage)).toBeCloseTo(20);
      expect(parseFloat(result.power)).toBeCloseTo(40);
      expect(result.calculatedProperty).toBe('voltage');
    });
    
    test('calculates current correctly', () => {
      // Using voltage and resistance (I = V / R)
      const values: OhmsLawValues = {
        voltage: '20',
        current: '',
        resistance: '10',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'current');
      // Result will be in amps, but we need to check the string value
      // which might be formatted differently
      expect(parseFloat(result.current)).toBeCloseTo(2);
      expect(parseFloat(result.power)).toBeCloseTo(40);
      expect(result.calculatedProperty).toBe('current');
    });
    
    test('calculates resistance correctly', () => {
      // Using voltage and current (R = V / I)
      const values: OhmsLawValues = {
        voltage: '20',
        current: '2000', // 2000mA = 2A
        resistance: '',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'resistance');
      expect(parseFloat(result.resistance)).toBeCloseTo(10);
      expect(parseFloat(result.power)).toBeCloseTo(40);
      expect(result.calculatedProperty).toBe('resistance');
    });
    
    test('calculates power correctly', () => {
      // Using voltage and current (P = V × I)
      const values: OhmsLawValues = {
        voltage: '20',
        current: '2000', // 2000mA = 2A
        resistance: '',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'power');
      expect(parseFloat(result.power)).toBeCloseTo(40);
      expect(result.calculatedProperty).toBe('power');
    });
    
    test('handles current values with A suffix correctly', () => {
      const values: OhmsLawValues = {
        voltage: '20',
        current: '2A', // Explicitly in amps
        resistance: '',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'resistance');
      expect(parseFloat(result.resistance)).toBeCloseTo(10);
    });
    
    test('handles current values with mA suffix correctly', () => {
      const values: OhmsLawValues = {
        voltage: '20',
        current: '2000mA', // Explicitly in milliamps
        resistance: '',
        power: ''
      };
      
      const result = calculateOhmsLaw(values, 'resistance');
      expect(parseFloat(result.resistance)).toBeCloseTo(10);
    });
    
    test('handles power values correctly', () => {
      // Test with plain number (treated as mW)
      const values1: OhmsLawValues = {
        voltage: '20',
        current: '',
        resistance: '10',
        power: '40000' // 40000mW = 40W
      };
      
      const result1 = calculateOhmsLaw(values1, 'current');
      expect(parseFloat(result1.current)).toBeCloseTo(2);
      
      // Test with W suffix
      const values2: OhmsLawValues = {
        voltage: '20',
        current: '',
        resistance: '10',
        power: '40W' // 40W
      };
      
      const result2 = calculateOhmsLaw(values2, 'current');
      expect(parseFloat(result2.current)).toBeCloseTo(2);
    });
  });
});
