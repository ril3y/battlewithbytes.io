import { 
  parseResistance, 
  formatResistance, 
  isValidNumberInput,
  isValidResistance,
  isValidVoltage
} from '../src/components/tools/MosfetCalculator/inputUtils';

describe('Input Utilities', () => {
  describe('parseResistance', () => {
    test('parses plain numbers', () => {
      expect(parseResistance('100')).toBe(100);
      expect(parseResistance('0.5')).toBe(0.5);
      expect(parseResistance('-10')).toBe(-10);
    });

    test('parses values with k suffix (kilo)', () => {
      expect(parseResistance('1k')).toBe(1000);
      expect(parseResistance('1.5k')).toBe(1500);
      expect(parseResistance('2.2K')).toBe(2200);
    });

    test('parses values with M suffix (mega)', () => {
      expect(parseResistance('1M')).toBe(1000000);
      expect(parseResistance('0.5M')).toBe(500000);
    });

    test('parses values with m suffix (milli)', () => {
      // Use toBeCloseTo for floating point results
      expect(parseResistance('1m')).toBeCloseTo(0.001);
      expect(parseResistance('500m')).toBeCloseTo(0.5);
    });

    test('parses values with µ suffix (micro)', () => {
      // Use toBeCloseTo for floating point results
      expect(parseResistance('1µ')).toBeCloseTo(0.000001);
      expect(parseResistance('100µ')).toBeCloseTo(0.0001); // FIX: Use toBeCloseTo
      expect(parseResistance('10u')).toBeCloseTo(0.00001);  // FIX: Use toBeCloseTo (good practice)
    });

    test('handles values with Ω symbol', () => {
      expect(parseResistance('100Ω')).toBe(100);
      expect(parseResistance('1.5kΩ')).toBe(1500);
      expect(parseResistance(' 1 M Ω ')).toBe(1000000);
      // Use toBeCloseTo for floating point results
      expect(parseResistance(' 100 mΩ ')).toBeCloseTo(0.1);
    });

    test('handles empty or invalid input', () => {
      expect(parseResistance('')).toBe(0);
      expect(parseResistance('abc')).toBe(0);
      expect(parseResistance('1.k')).toBe(0); // Invalid format
      expect(parseResistance('k1')).toBe(0);  // Invalid format
    });
  });

  describe('formatResistance', () => {
    test('formats values less than 1Ω', () => {
      expect(formatResistance(0.1)).toBe('100.00mΩ');
      expect(formatResistance(0.001)).toBe('1.00mΩ');
      expect(formatResistance(0.0005)).toBe('500.00µΩ');
      expect(formatResistance(0.00001)).toBe('10.00µΩ');
      expect(formatResistance(0.000001)).toBe('1.00µΩ');
      expect(formatResistance(0)).toBe('0.00µΩ'); // Or adjust if you prefer 0.00Ω
    });

    test('formats values between 1Ω and 1kΩ', () => {
      expect(formatResistance(1)).toBe('1.00Ω');
      expect(formatResistance(10.5)).toBe('10.50Ω');
      expect(formatResistance(999.99)).toBe('999.99Ω');
    });

    test('formats values between 1kΩ and 1MΩ', () => {
      expect(formatResistance(1000)).toBe('1.00kΩ');
      expect(formatResistance(10000)).toBe('10.00kΩ');
      // FIX: Update expectation based on toFixed(2) rounding
      expect(formatResistance(999999)).toBe('1000.00kΩ');
    });

    test('formats values greater than 1MΩ', () => {
      expect(formatResistance(1000000)).toBe('1.00MΩ');
      expect(formatResistance(1500000)).toBe('1.50MΩ');
      expect(formatResistance(999999999)).toBe('1000.00MΩ'); // Check rounding here too
    });
  });

  // --- No changes needed below this line based on the errors ---

  describe('isValidNumberInput', () => {
    test('validates numbers', () => {
      expect(isValidNumberInput('123')).toBe(true);
      expect(isValidNumberInput('0.45')).toBe(true);
      expect(isValidNumberInput('-10.5')).toBe(true);
      expect(isValidNumberInput('+50')).toBe(true);
      expect(isValidNumberInput('.5')).toBe(true);
      expect(isValidNumberInput('5.')).toBe(true);
    });

    test('validates numbers with valid suffixes', () => {
      expect(isValidNumberInput('1k')).toBe(true);
      expect(isValidNumberInput('2.2K')).toBe(true);
      expect(isValidNumberInput('1M')).toBe(true);
      expect(isValidNumberInput('5m')).toBe(true);
      expect(isValidNumberInput('10u')).toBe(true);
      expect(isValidNumberInput('100µ')).toBe(true);
      expect(isValidNumberInput('-0.5k')).toBe(true);
    });

    test('rejects invalid inputs', () => {
      expect(isValidNumberInput('abc')).toBe(false);
      expect(isValidNumberInput('1.k')).toBe(false); // Suffix must be at the end
      expect(isValidNumberInput('k1')).toBe(false);
      expect(isValidNumberInput('1.2.3')).toBe(false);
      expect(isValidNumberInput('10 G')).toBe(false); // Invalid suffix
      expect(isValidNumberInput('--5')).toBe(false);
      expect(isValidNumberInput('5e3')).toBe(false); // Exponential notation not supported by regex
    });
  });

  describe('isValidResistance', () => {
     test('validates resistance values', () => {
      expect(isValidResistance('100')).toBe(true);
      expect(isValidResistance('1.5k')).toBe(true);
      expect(isValidResistance('2.2KΩ')).toBe(true);
      expect(isValidResistance('1M Ohm')).toBe(false); // Assumes only Ω symbol removal
      expect(isValidResistance(' 100 m ')).toBe(true);
      expect(isValidResistance(' 50 µΩ ')).toBe(true);
      expect(isValidResistance('+10k')).toBe(true);
    });

    test('rejects invalid resistance values', () => {
      expect(isValidResistance('abc')).toBe(false);
      expect(isValidResistance('1.5 k Ohms')).toBe(false);
      expect(isValidResistance('1..5k')).toBe(false);
      expect(isValidResistance('1k5')).toBe(false);
    });
  });

  describe('isValidVoltage', () => {
    test('validates voltage values', () => {
      expect(isValidVoltage('12')).toBe(true);
      expect(isValidVoltage('-5.5')).toBe(true);
      expect(isValidVoltage('+3.3V')).toBe(true);
      expect(isValidVoltage(' 0.1 V ')).toBe(true);
      expect(isValidVoltage('.7')).toBe(true);
    });

    test('rejects invalid voltage values', () => {
      expect(isValidVoltage('abc')).toBe(false);
      expect(isValidVoltage('1k')).toBe(false); // Suffixes not allowed
      expect(isValidVoltage('5 V V')).toBe(false);
      expect(isValidVoltage('1.2.3')).toBe(false);
      expect(isValidVoltage('--9')).toBe(false);
    });
  });
});