import { calculateNChannelConduction, calculatePChannelConduction } from '../src/components/tools/MosfetCalculator/mosfetUtils';

describe('MOSFET Calculations', () => {
  describe('N-Channel MOSFET', () => {
    test('N-Channel MOSFET conducting state', () => {
      // Test case 1: Standard N-Channel MOSFET in conducting state
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculateNChannelConduction(2, 5, 0, 12, 100, 0.1);

      // Calculate expected values more precisely
      const expectedVgs = '5.00'; // Vg - Vs
      const totalResistance = 100 + 0.1; // Rload + Rds_on
      const preciseId = 12 / totalResistance; // Vcc / Rtotal ≈ 0.1198801...
      const preciseVd = preciseId * 0.1;      // Id * Rds_on ≈ 0.011988...
      const preciseVoltageAcrossLoad = preciseId * 100; // Id * Rload ≈ 11.98801...
      // *** Calculate expected power using precise Id ***
      const expectedRawPower = preciseId * preciseId * 0.1; // ≈ 0.001437124...

      // Expected formatted string values (adjust based on your function's formatting rules)
      const expectedIdStr = preciseId.toFixed(4); // e.g., "0.1199"
      const expectedVdStr = preciseVd.toFixed(4); // e.g., "0.0120"
      const expectedVoltageAcrossLoadStr = preciseVoltageAcrossLoad.toFixed(4); // e.g., "11.9880"
      // Determine expected formatted power based on expectedRawPower and your formatting logic
      let expectedPowerStr: string;
      let expectedPowerUnit: string;
      if (expectedRawPower < 0.001) {
          expectedPowerStr = (expectedRawPower * 1000).toFixed(2); // Match precision used in function
          expectedPowerUnit = 'mW';
      } else {
          expectedPowerStr = expectedRawPower.toFixed(6); // Match precision used in function (e.g., 6 places -> '0.001437')
          expectedPowerUnit = 'W';
      }


      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs); // Check Vgs string
      expect(result.id).toBe(expectedIdStr); // Check Id formatted string
      expect(result.vd).toBe(expectedVdStr); // Check Vd formatted string
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoadStr); // Check V_Rload formatted string
      expect(result.currentThroughLoad).toBe(expectedIdStr); // Check I_Rload formatted string (usually same as Id)

      // *** Check the raw calculated power ***
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 8); // Increase precision if needed

      // *** Check the final formatted power string and unit ***
      expect(result.powerUnit).toBe(expectedPowerUnit);
      expect(result.powerDissipated).toBe(expectedPowerStr);

      // Optional: If you still want to test the parseFloat version, use the correct expectedRawPower
      // expect(parseFloat(result.powerDissipated)).toBeCloseTo(expectedRawPower, 6); // This might still be fragile depending on formatting
    });

    test('N-Channel MOSFET cutoff state', () => {
      // Test case 2: N-Channel MOSFET in cutoff state
      // Vth = 2V, Vg = 1V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculateNChannelConduction(2, 1, 0, 12, 100, 0.1);
      
      // Check results
      expect(result.conducting).toBe(false);
      expect(result.vgs).toBe('1.00');
      expect(result.id).toBe('0.0000');
      expect(result.vd).toBe('12.0000');
      expect(result.voltageAcrossLoad).toBe('0.0000');
      expect(result.currentThroughLoad).toBe('0.0000');
      expect(result.rawPowerDissipated).toBe(0);
      expect(result.powerUnit).toBe('W');
      expect(result.powerDissipated).toBe('0.000000');
    });

    test('N-Channel MOSFET with very low Rds_on', () => {
      // Test case 3: N-Channel MOSFET with very low Rds_on (0.022Ω)
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 25V, Rload = 225Ω, Rds_on = 0.022Ω
      const result = calculateNChannelConduction(2, 5, 0, 25, 225, 0.022);
      
      // Calculate expected values
      const totalResistance = 225 + 0.022;
      const expectedId = 25 / totalResistance;
      const expectedVd = expectedId * 0.022;
      const expectedVoltageAcrossLoad = expectedId * 225;
      const expectedRawPower = expectedId * expectedId * 0.022;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe('5.00');
      expect(parseFloat(result.id)).toBeCloseTo(expectedId, 4);
      expect(parseFloat(result.vd)).toBeCloseTo(expectedVd, 4);
      expect(parseFloat(result.voltageAcrossLoad)).toBeCloseTo(expectedVoltageAcrossLoad, 4);
      expect(parseFloat(result.currentThroughLoad)).toBeCloseTo(expectedId, 4);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit conversion for small values
      expect(result.powerUnit).toBe('mW');
      expect(parseFloat(result.powerDissipated)).toBeCloseTo(expectedRawPower * 1000, 2);
    });

    test('N-Channel MOSFET with high Rds_on', () => {
      // Test case 4: N-Channel MOSFET with high Rds_on (10Ω)
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 10Ω
      const result = calculateNChannelConduction(2, 5, 0, 12, 100, 10);
      
      // Calculate expected values
      const totalResistance = 100 + 10;
      const expectedId = 12 / totalResistance;
      const expectedVd = expectedId * 10;
      const expectedVoltageAcrossLoad = expectedId * 100;
      const expectedRawPower = expectedId * expectedId * 10;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe('5.00');
      expect(parseFloat(result.id)).toBeCloseTo(expectedId, 4);
      expect(parseFloat(result.vd)).toBeCloseTo(expectedVd, 4);
      expect(parseFloat(result.voltageAcrossLoad)).toBeCloseTo(expectedVoltageAcrossLoad, 4);
      expect(parseFloat(result.currentThroughLoad)).toBeCloseTo(expectedId, 4);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit for larger values
      expect(result.powerUnit).toBe('W');
      expect(parseFloat(result.powerDissipated)).toBeCloseTo(expectedRawPower, 6);
    });
  });

  describe('P-Channel MOSFET', () => {
    test('P-Channel MOSFET conducting state', () => {
      // Test case 5: Standard P-Channel MOSFET in conducting state
      // Vth = -2V, Vg = 0V, Vs = 12V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculatePChannelConduction(-2, 0, 12, 12, 100, 0.1);
      
      // Calculate expected values
      const totalResistance = 100 + 0.1;
      const expectedId = 12 / totalResistance;
      const expectedVd = 12 - (expectedId * 0.1);
      const expectedVoltageAcrossLoad = expectedId * 100;
      const expectedRawPower = expectedId * expectedId * 0.1;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe('-12.00');
      expect(parseFloat(result.id)).toBeCloseTo(expectedId, 4);
      expect(parseFloat(result.vd)).toBeCloseTo(expectedVd, 4);
      expect(parseFloat(result.voltageAcrossLoad)).toBeCloseTo(expectedVoltageAcrossLoad, 4);
      expect(parseFloat(result.currentThroughLoad)).toBeCloseTo(expectedId, 4);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit
      if (expectedRawPower < 0.001) {
        expect(result.powerUnit).toBe('mW');
        expect(parseFloat(result.powerDissipated)).toBeCloseTo(expectedRawPower * 1000, 2);
      } else {
        expect(result.powerUnit).toBe('W');
        expect(parseFloat(result.powerDissipated)).toBeCloseTo(expectedRawPower, 6);
      }
    });

    test('P-Channel MOSFET cutoff state', () => {
      // Test case 6: P-Channel MOSFET in cutoff state
      // Vth = -2V, Vg = 12V, Vs = 12V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculatePChannelConduction(-2, 12, 12, 12, 100, 0.1);
      
      // Check results
      expect(result.conducting).toBe(false);
      expect(result.vgs).toBe('0.00');
      expect(result.id).toBe('0.0000');
      expect(result.vd).toBe('0.0000');
      expect(result.voltageAcrossLoad).toBe('0.0000');
      expect(result.currentThroughLoad).toBe('0.0000');
      expect(result.rawPowerDissipated).toBe(0);
      expect(result.powerUnit).toBe('W');
      expect(result.powerDissipated).toBe('0.000000');
    });

    test('P-Channel MOSFET with very low Rds_on', () => {
      // Test case 7: P-Channel MOSFET with very low Rds_on (0.022Ω)
      // Vth = -2V, Vg = 0V, Vs = 25V, Vcc = 25V, Rload = 225Ω, Rds_on = 0.022Ω
      const result = calculatePChannelConduction(-2, 0, 25, 25, 225, 0.022);
      
      // Calculate expected values
      const totalResistance = 225 + 0.022;
      const expectedId = 25 / totalResistance;
      const expectedVd = 25 - (expectedId * 0.022);
      const expectedVoltageAcrossLoad = expectedId * 225;
      const expectedRawPower = expectedId * expectedId * 0.022;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe('-25.00');
      expect(parseFloat(result.id)).toBeCloseTo(expectedId, 4);
      expect(parseFloat(result.vd)).toBeCloseTo(expectedVd, 4);
      expect(parseFloat(result.voltageAcrossLoad)).toBeCloseTo(expectedVoltageAcrossLoad, 4);
      expect(parseFloat(result.currentThroughLoad)).toBeCloseTo(expectedId, 4);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit conversion for small values
      expect(result.powerUnit).toBe('mW');
      expect(parseFloat(result.powerDissipated)).toBeCloseTo(expectedRawPower * 1000, 2);
    });

    test('P-Channel MOSFET with high Rds_on', () => {
      // Test case 8: P-Channel MOSFET with high Rds_on (10Ω)
      // Vth = -2V, Vg = 0V, Vs = 12V, Vcc = 12V, Rload = 100Ω, Rds_on = 10Ω
      const result = calculatePChannelConduction(-2, 0, 12, 12, 100, 10);
      
      // Calculate expected values
      const totalResistance = 100 + 10;
      const expectedId = 12 / totalResistance;
      const expectedVd = 12 - (expectedId * 10);
      const expectedVoltageAcrossLoad = expectedId * 100;
      const expectedRawPower = expectedId * expectedId * 10;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe('-12.00');
      expect(parseFloat(result.id)).toBeCloseTo(expectedId, 4);
      expect(parseFloat(result.vd)).toBeCloseTo(expectedVd, 4);
      expect(parseFloat(result.voltageAcrossLoad)).toBeCloseTo(expectedVoltageAcrossLoad, 4);
      expect(parseFloat(result.currentThroughLoad)).toBeCloseTo(expectedId, 4);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit for larger values
      expect(result.powerUnit).toBe('W');
      expect(parseFloat(result.powerDissipated)).toBeCloseTo(expectedRawPower, 6);
    });
  });

  describe('Edge Cases', () => {
    test('N-Channel MOSFET with Vgs exactly at threshold', () => {
      // Test case 9: N-Channel MOSFET with Vgs exactly at threshold
      // Vth = 2V, Vg = 2V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculateNChannelConduction(2, 2, 0, 12, 100, 0.1);
      
      // Check results - should be in cutoff state
      expect(result.conducting).toBe(false);
    });

    test('P-Channel MOSFET with Vgs exactly at threshold', () => {
      // Test case 10: P-Channel MOSFET with Vgs exactly at threshold
      // Vth = -2V, Vg = 10V, Vs = 12V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculatePChannelConduction(-2, 10, 12, 12, 100, 0.1);
      
      // Check results - should be in cutoff state
      expect(result.conducting).toBe(false);
    });
  });
});
