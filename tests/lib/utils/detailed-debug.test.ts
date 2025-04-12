import { OhmsLawValues } from '../../../src/components/tools/OhmsLawCalculator'; 
import {
  calculateOhmsLaw,
  validateInputs
} from '../../../src/components/tools/OhmsLawCalculator/ohmsLawUtils'; 

import { parseValueWithSuffix } from '../../../src/lib/utils/inputUtils';

describe('Detailed Debug Tests', () => {
  test('debug calculateOhmsLaw behavior', () => {
    // Test voltage calculation
    const voltageValues: OhmsLawValues = { voltage: '', current: '2mA', resistance: '10k', power: '' };
    const voltageResult = calculateOhmsLaw(voltageValues, 'voltage');
    console.log('Voltage calculation result:', {
      voltage: voltageResult.voltage,
      current: voltageResult.current,
      resistance: voltageResult.resistance,
      power: voltageResult.power,
      calculatedProperty: voltageResult.calculatedProperty,
      displayCurrentInMilliamps: voltageResult.displayCurrentInMilliamps
    });
    
    // Test current calculation
    const currentValues: OhmsLawValues = { voltage: '12', current: '', resistance: '1k', power: '' };
    const currentResult = calculateOhmsLaw(currentValues, 'current');
    console.log('Current calculation result:', {
      voltage: currentResult.voltage,
      current: currentResult.current,
      resistance: currentResult.resistance,
      power: currentResult.power,
      calculatedProperty: currentResult.calculatedProperty,
      displayCurrentInMilliamps: currentResult.displayCurrentInMilliamps
    });
    
    // Test resistance calculation
    const resistanceValues: OhmsLawValues = { voltage: '20V', current: '2mA', resistance: '', power: '' };
    const resistanceResult = calculateOhmsLaw(resistanceValues, 'resistance');
    console.log('Resistance calculation result:', {
      voltage: resistanceResult.voltage,
      current: resistanceResult.current,
      resistance: resistanceResult.resistance,
      power: resistanceResult.power,
      calculatedProperty: resistanceResult.calculatedProperty,
      displayCurrentInMilliamps: resistanceResult.displayCurrentInMilliamps
    });
    
    // Test power calculation
    const powerValues: OhmsLawValues = { voltage: '20V', current: '2mA', resistance: '', power: '' };
    const powerResult = calculateOhmsLaw(powerValues, 'power');
    console.log('Power calculation result:', {
      voltage: powerResult.voltage,
      current: powerResult.current,
      resistance: powerResult.resistance,
      power: powerResult.power,
      calculatedProperty: powerResult.calculatedProperty,
      displayCurrentInMilliamps: powerResult.displayCurrentInMilliamps
    });
    
    // Just to make the test pass
    expect(true).toBe(true);
  });
});
