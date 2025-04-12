import { parseValueWithSuffix } from '../../../src/lib/utils/inputUtils';

describe('Debug parseValueWithSuffix', () => {
  test('debug actual behavior', () => {
    console.log('2A =>', parseValueWithSuffix('2A'));
    console.log('5 =>', parseValueWithSuffix('5'));
    console.log('10k =>', parseValueWithSuffix('10k'));
    console.log('0.04W =>', parseValueWithSuffix('0.04W'));
    console.log('20W =>', parseValueWithSuffix('20W'));
    console.log('100mA =>', parseValueWithSuffix('100mA'));
    
    // Just to make the test pass
    expect(true).toBe(true);
  });
});
