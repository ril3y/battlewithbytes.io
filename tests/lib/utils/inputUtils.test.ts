import { 
  parseValueWithSuffix, 
  formatValueWithSuffix, 
  isValidNumberInput,
  isValidResistance,
  isValidVoltage,
  parseResistance,
  formatResistance,
  createParameterWarningFunction,
  createParameterTooltipFunction,
  validateFieldInput,
  parseFieldValue,
  FieldType
} from '../../../src/lib/utils/inputUtils';

describe('Input Utilities', () => {
  describe('parseValueWithSuffix / parseResistance', () => {
    test('parses basic numbers', () => {
      expect(parseValueWithSuffix('100')).toBe(100);
      expect(parseValueWithSuffix('1.5')).toBe(1.5);
      expect(parseValueWithSuffix('-10')).toBe(-10);
    });

    test('parses values with engineering suffixes', () => {
      expect(parseValueWithSuffix('1.5k')).toBe(1500);
      expect(parseValueWithSuffix('2.2K')).toBe(2200);
      expect(parseValueWithSuffix('1M')).toBe(1000000);
      expect(parseValueWithSuffix('0.5m')).toBe(0.0005); // milli
      expect(parseValueWithSuffix('100u')).toBe(0.0001); // micro
      expect(parseValueWithSuffix('100µ')).toBe(0.0001); // micro with symbol
      expect(parseValueWithSuffix('2G')).toBe(2000000000); // giga
    });
    
    test('parses current values with mA suffix', () => {
      expect(parseValueWithSuffix('100ma')).toBe(0.1); // 100mA = 0.1A
      expect(parseValueWithSuffix('100mA')).toBe(0.1); // case insensitive
      expect(parseValueWithSuffix('1.5ma')).toBe(0.0015); // 1.5mA = 0.0015A
      expect(parseValueWithSuffix('2000ma')).toBe(2); // 2000mA = 2A
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

    test('validates current values with mA suffix', () => {
      expect(isValidNumberInput('100ma')).toBe(true);
      expect(isValidNumberInput('100mA')).toBe(true);
      expect(isValidNumberInput('1.5ma')).toBe(true);
    });

    test('rejects invalid inputs', () => {
      expect(isValidNumberInput('abc')).toBe(false);
      expect(isValidNumberInput('')).toBe(false);
    });

    test('rejects invalid inputs with suffixes', () => {
      expect(isValidNumberInput('k1')).toBe(false); // Suffix must be at the end
      expect(isValidNumberInput('1kΩ2')).toBe(false); // Invalid format
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

  describe('parseFieldValue', () => {
    test('parses current field values', () => {
      // Plain numbers should be treated as mA
      expect(parseFieldValue('5', 'current')).toBeCloseTo(0.005); // 5mA = 0.005A
      expect(parseFieldValue('100', 'current')).toBeCloseTo(0.1); // 100mA = 0.1A
      
      // Values with 'm' suffix should be treated as mA
      expect(parseFieldValue('5m', 'current')).toBeCloseTo(0.005); // 5m = 5mA = 0.005A
      expect(parseFieldValue('100m', 'current')).toBeCloseTo(0.1); // 100m = 100mA = 0.1A
      
      // Values with explicit suffixes
      expect(parseFieldValue('5A', 'current')).toBe(5); // 5A = 5A
      expect(parseFieldValue('50ma', 'current')).toBeCloseTo(0.05); // 50mA = 0.05A
    });
    
    test('parses power field values', () => {
      // Plain numbers should be treated as mW
      expect(parseFieldValue('5', 'power')).toBeCloseTo(0.005); // 5mW = 0.005W
      expect(parseFieldValue('100', 'power')).toBeCloseTo(0.1); // 100mW = 0.1W
      
      // Values with suffixes
      expect(parseFieldValue('5W', 'power')).toBe(5); // 5W = 5W
      expect(parseFieldValue('2kW', 'power')).toBe(2000); // 2kW = 2000W
    });
    
    test('parses resistance field values', () => {
      // Plain numbers should be treated as Ω
      expect(parseFieldValue('5', 'resistance')).toBe(5); // 5Ω = 5Ω
      expect(parseFieldValue('100', 'resistance')).toBe(100); // 100Ω = 100Ω
      
      // Values with suffixes
      expect(parseFieldValue('5kΩ', 'resistance')).toBe(5000); // 5kΩ = 5000Ω
      expect(parseFieldValue('2M', 'resistance')).toBe(2000000); // 2MΩ = 2000000Ω
    });
    
    test('parses voltage field values', () => {
      // Plain numbers should be treated as V
      expect(parseFieldValue('5', 'voltage')).toBe(5); // 5V = 5V
      expect(parseFieldValue('100', 'voltage')).toBe(100); // 100V = 100V
      
      // Values with suffixes
      expect(parseFieldValue('5kV', 'voltage')).toBe(5000); // 5kV = 5000V
      expect(parseFieldValue('0.5V', 'voltage')).toBe(0.5); // 0.5V = 0.5V
    });
    
    test('handles empty or invalid input', () => {
      expect(parseFieldValue('', 'current')).toBe(0);
      expect(parseFieldValue('abc', 'voltage')).toBe(0);
    });
  });
  
  describe('validateFieldInput', () => {
    test('validates current field input', () => {
      // Plain numbers should be treated as mA
      const result1 = validateFieldInput('100', 'current');
      expect(result1.isValid).toBe(true);
      expect(result1.parsedValue).toBeCloseTo(0.1); // 100mA = 0.1A
      
      // Values with suffixes
      const result2 = validateFieldInput('5A', 'current');
      expect(result2.isValid).toBe(true);
      expect(result2.parsedValue).toBe(5);
      
      const result3 = validateFieldInput('50ma', 'current');
      expect(result3.isValid).toBe(true);
      expect(result3.parsedValue).toBeCloseTo(0.05);
      
      // Invalid input
      const result4 = validateFieldInput('abc', 'current');
      expect(result4.isValid).toBe(false);
      expect(result4.parsedValue).toBe(0);
      
      // Empty input
      const result5 = validateFieldInput('', 'current');
      expect(result5.isValid).toBe(true);
      expect(result5.parsedValue).toBe(0);
    });
    
    test('validates power field input', () => {
      // Plain numbers should be treated as mW
      const result1 = validateFieldInput('100', 'power');
      expect(result1.isValid).toBe(true);
      expect(result1.parsedValue).toBeCloseTo(0.1); // 100mW = 0.1W
      
      // Values with suffixes
      const result2 = validateFieldInput('5W', 'power');
      expect(result2.isValid).toBe(true);
      expect(result2.parsedValue).toBe(5);
      
      const result3 = validateFieldInput('2kW', 'power');
      expect(result3.isValid).toBe(true);
      expect(result3.parsedValue).toBe(2000);
    });
    
    test('validates voltage field input', () => {
      const result1 = validateFieldInput('12', 'voltage');
      expect(result1.isValid).toBe(true);
      expect(result1.parsedValue).toBe(12);
      
      const result2 = validateFieldInput('12V', 'voltage');
      expect(result2.isValid).toBe(true);
      expect(result2.parsedValue).toBe(12);
      
      const result3 = validateFieldInput('invalid', 'voltage');
      expect(result3.isValid).toBe(false);
      expect(result3.parsedValue).toBe(0);
    });
    
    test('validates resistance field input', () => {
      const result1 = validateFieldInput('100', 'resistance');
      expect(result1.isValid).toBe(true);
      expect(result1.parsedValue).toBe(100);
      
      const result2 = validateFieldInput('1kΩ', 'resistance');
      expect(result2.isValid).toBe(true);
      expect(result2.parsedValue).toBe(1000);
      
      const result3 = validateFieldInput('invalid', 'resistance');
      expect(result3.isValid).toBe(false);
      expect(result3.parsedValue).toBe(0);
    });
    
    test('validates generic field input', () => {
      const result1 = validateFieldInput('100', 'generic');
      expect(result1.isValid).toBe(true);
      expect(result1.parsedValue).toBe(100);
      
      const result2 = validateFieldInput('1.5k', 'generic');
      expect(result2.isValid).toBe(true);
      expect(result2.parsedValue).toBe(1500);
      
      const result3 = validateFieldInput('invalid', 'generic');
      expect(result3.isValid).toBe(false);
      expect(result3.parsedValue).toBe(0);
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
