import { 
  parseValueWithSuffix, 
  formatValueWithSuffix, 
  isValidNumberInput,
  isValidResistance,
  isValidVoltage,
  parseResistance,
  formatResistance,
  createParameterWarningFunction,
  createParameterTooltipFunction
} from '../../../src/lib/utils/inputUtils';

describe('Input Utilities', () => {
  describe('parseValueWithSuffix / parseResistance', () => {
    test('parses plain numbers', () => {
      expect(parseValueWithSuffix('100')).toBe(100);
      expect(parseValueWithSuffix('0.5')).toBe(0.5);
      expect(parseValueWithSuffix('-10')).toBe(-10);
      
      // Test alias function
      expect(parseResistance('100')).toBe(100);
    });

    test('parses values with k suffix (kilo)', () => {
      expect(parseValueWithSuffix('1k')).toBe(1000);
      expect(parseValueWithSuffix('1.5k')).toBe(1500);
      expect(parseValueWithSuffix('2.2K')).toBe(2200);
    });

    test('parses values with M suffix (mega)', () => {
      expect(parseValueWithSuffix('1M')).toBe(1000000);
      expect(parseValueWithSuffix('0.5M')).toBe(500000);
    });

    test('parses values with m suffix (milli)', () => {
      // Use toBeCloseTo for floating point results
      expect(parseValueWithSuffix('1m')).toBeCloseTo(0.001);
      expect(parseValueWithSuffix('500m')).toBeCloseTo(0.5);
    });

    test('parses values with µ suffix (micro)', () => {
      // Use toBeCloseTo for floating point results
      expect(parseValueWithSuffix('1µ')).toBeCloseTo(0.000001);
      expect(parseValueWithSuffix('100µ')).toBeCloseTo(0.0001);
      expect(parseValueWithSuffix('10u')).toBeCloseTo(0.00001);
    });

    test('handles values with Ω symbol', () => {
      expect(parseValueWithSuffix('100Ω')).toBe(100);
      expect(parseValueWithSuffix('1.5kΩ')).toBe(1500);
      expect(parseValueWithSuffix(' 1 M Ω ')).toBe(1000000);
      // Use toBeCloseTo for floating point results
      expect(parseValueWithSuffix(' 100 mΩ ')).toBeCloseTo(0.1);
    });

    test('handles empty or invalid input', () => {
      expect(parseValueWithSuffix('')).toBe(0);
      expect(parseValueWithSuffix('abc')).toBe(0);
      expect(parseValueWithSuffix('1.k')).toBe(0); // Invalid format
      expect(parseValueWithSuffix('k1')).toBe(0);  // Invalid format
    });
  });

  describe('formatValueWithSuffix / formatResistance', () => {
    test('formats values less than 1', () => {
      expect(formatValueWithSuffix(0.1)).toBe('100.00m');
      expect(formatValueWithSuffix(0.001)).toBe('1.00m');
      expect(formatValueWithSuffix(0.0005)).toBe('500.00u');
      expect(formatValueWithSuffix(0.00001)).toBe('10.00u');
      expect(formatValueWithSuffix(0.000001)).toBe('1.00u');
      expect(formatValueWithSuffix(0)).toBe('0.00');
      
      // Test with unit
      expect(formatValueWithSuffix(0.1, 'Ω')).toBe('100.00mΩ');
      expect(formatResistance(0.1)).toBe('100.00mΩ');
    });

    test('formats values between 1 and 1k', () => {
      expect(formatValueWithSuffix(1)).toBe('1.00');
      expect(formatValueWithSuffix(10.5)).toBe('10.50');
      expect(formatValueWithSuffix(999.99)).toBe('999.99');
    });

    test('formats values between 1k and 1M', () => {
      expect(formatValueWithSuffix(1000)).toBe('1.00k');
      expect(formatValueWithSuffix(10000)).toBe('10.00k');
      expect(formatValueWithSuffix(999999)).toBe('1000.00k');
    });

    test('formats values greater than 1M', () => {
      expect(formatValueWithSuffix(1000000)).toBe('1.00M');
      expect(formatValueWithSuffix(1500000)).toBe('1.50M');
      expect(formatValueWithSuffix(999999999)).toBe('1000.00M');
    });
  });

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

  describe('createParameterWarningFunction', () => {
    const testWarningRanges = {
      'resistance': {
        min: 1,
        max: 1000,
        warningMessage: 'Unusual resistance value'
      },
      'voltage': {
        min: 0,
        max: 24,
        warningMessage: 'Unusual voltage value'
      },
      'custom': {
        checkFn: (value: number) => value % 2 !== 0,
        warningMessage: 'Value should be even'
      }
    };

    const getWarning = createParameterWarningFunction(testWarningRanges);

    test('should return warnings for values outside ranges', () => {
      expect(getWarning('resistance', 0.5)).toBe('Unusual resistance value');
      expect(getWarning('resistance', 1500)).toBe('Unusual resistance value');
      expect(getWarning('resistance', 500)).toBe('');
      
      expect(getWarning('voltage', -1)).toBe('Unusual voltage value');
      expect(getWarning('voltage', 30)).toBe('Unusual voltage value');
      expect(getWarning('voltage', 12)).toBe('');
    });

    test('should handle custom check functions', () => {
      expect(getWarning('custom', 3)).toBe('Value should be even');
      expect(getWarning('custom', 4)).toBe('');
    });

    test('should handle string inputs', () => {
      expect(getWarning('resistance', '0.5')).toBe('Unusual resistance value');
      expect(getWarning('resistance', '500')).toBe('');
      expect(getWarning('resistance', '1.5k')).toBe('Unusual resistance value');
    });
  });

  describe('createParameterTooltipFunction', () => {
    const testTooltips = {
      'resistance': 'Resistance tooltip',
      'voltage': 'Voltage tooltip'
    };

    const getTooltip = createParameterTooltipFunction(testTooltips);

    test('should return tooltips for known parameters', () => {
      expect(getTooltip('resistance')).toBe('Resistance tooltip');
      expect(getTooltip('voltage')).toBe('Voltage tooltip');
    });

    test('should return empty string for unknown parameters', () => {
      expect(getTooltip('unknown')).toBe('');
    });
  });
});
