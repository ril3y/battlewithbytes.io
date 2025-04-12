import { parseValueWithSuffix } from '../../../src/lib/utils/inputUtils';

describe('parseValueWithSuffix', () => {
  test('parses basic numbers correctly', () => {
    expect(parseValueWithSuffix('5')).toBe(5);
    expect(parseValueWithSuffix('10')).toBe(10);
    expect(parseValueWithSuffix('0.5')).toBe(0.5);
    expect(parseValueWithSuffix('-10')).toBe(-10);
  });

  test('parses values with kilo (k/K) suffix correctly', () => {
    expect(parseValueWithSuffix('5k')).toBe(5000);
    expect(parseValueWithSuffix('2.5K')).toBe(2500);
    expect(parseValueWithSuffix('10kΩ')).toBe(10000);
  });

  test('parses values with mega (M) suffix correctly', () => {
    expect(parseValueWithSuffix('1M')).toBe(1000000);
    expect(parseValueWithSuffix('2.2M')).toBe(2200000);
    expect(parseValueWithSuffix('0.5MΩ')).toBe(500000);
  });

  test('parses values with milli (m) suffix correctly', () => {
    expect(parseValueWithSuffix('5m')).toBe(0.005);
    expect(parseValueWithSuffix('100m')).toBe(0.1);
    expect(parseValueWithSuffix('2.5mV')).toBe(0.0025);
  });

  test('parses values with micro (u/µ) suffix correctly', () => {
    expect(parseValueWithSuffix('10u')).toBe(0.00001);
    expect(parseValueWithSuffix('50µ')).toBe(0.00005);
    expect(parseValueWithSuffix('100uV')).toBe(0.0001);
  });

  test('parses values with giga (G) suffix correctly', () => {
    expect(parseValueWithSuffix('1G')).toBe(1000000000);
    expect(parseValueWithSuffix('2.5G')).toBe(2500000000);
  });

  test('parses values with unit symbols correctly', () => {
    expect(parseValueWithSuffix('5V')).toBe(5);
    expect(parseValueWithSuffix('10Ω')).toBe(10);
    expect(parseValueWithSuffix('20W')).toBe(20);
  });

  test('parses milliamps (mA) correctly', () => {
    expect(parseValueWithSuffix('100mA')).toBe(0.1);
    expect(parseValueWithSuffix('5ma')).toBe(0.005);
    expect(parseValueWithSuffix('2.5mA')).toBe(0.0025);
  });

  test('handles empty or invalid inputs', () => {
    expect(parseValueWithSuffix('')).toBe(0);
    expect(parseValueWithSuffix('   ')).toBe(0);
    expect(parseValueWithSuffix('abc')).toBe(0);
  });
});
