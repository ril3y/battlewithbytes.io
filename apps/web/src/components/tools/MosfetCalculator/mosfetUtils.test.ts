import { calculateNChannelConduction, calculatePChannelConduction } from './mosfetUtils';

describe('MOSFET Calculations', () => {
  describe('N-Channel MOSFET', () => {
    test('N-Channel MOSFET conducting state', () => {
      // Test case 1: Standard N-Channel MOSFET in conducting state
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculateNChannelConduction(2, 5, 0, 12, 100, 0.1);
      
      // Calculate expected values
      const expectedVgs = '5.00';
      const expectedId = '0.1199';
      const expectedVd = '0.0120';
      const expectedVoltageAcrossLoad = '11.9880';
      const expectedCurrentThroughLoad = '0.1199';
      const expectedRawPower = 0.1199 * 0.1199 * 0.1;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
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
    });

    test('N-Channel MOSFET with very low Rds_on', () => {
      // Test case 3: N-Channel MOSFET with very low Rds_on (0.022Ω)
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 25V, Rload = 225Ω, Rds_on = 0.022Ω
      const result = calculateNChannelConduction(2, 5, 0, 25, 225, 0.022);
      
      // Calculate expected values
      const expectedVgs = '5.00';
      const expectedId = '0.1110';
      const expectedVd = '0.0024';
      const expectedVoltageAcrossLoad = '24.9976';
      const expectedCurrentThroughLoad = '0.1110';
      const expectedRawPower = 0.1110 * 0.1110 * 0.022;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
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
      const expectedVgs = '5.00';
      const expectedId = '0.1091';
      const expectedVd = '1.0910';
      const expectedVoltageAcrossLoad = '10.9100';
      const expectedCurrentThroughLoad = '0.1091';
      const expectedRawPower = 0.1091 * 0.1091 * 10;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit for larger values
      expect(result.powerUnit).toBe('W');
    });
  });

  describe('P-Channel MOSFET', () => {
    test('P-Channel MOSFET conducting state', () => {
      // Test case 5: Standard P-Channel MOSFET in conducting state
      // Vth = -2V, Vg = 0V, Vs = 12V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculatePChannelConduction(-2, 0, 12, 12, 100, 0.1);
      
      // Calculate expected values
      const expectedVgs = '-12.00';
      const expectedId = '0.1199';
      const expectedVd = '11.9880';
      const expectedVoltageAcrossLoad = '11.9880';
      const expectedCurrentThroughLoad = '0.1199';
      const expectedRawPower = 0.1199 * 0.1199 * 0.1;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
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
    });

    test('P-Channel MOSFET with very low Rds_on', () => {
      // Test case 7: P-Channel MOSFET with very low Rds_on (0.022Ω)
      // Vth = -2V, Vg = 0V, Vs = 25V, Vcc = 25V, Rload = 225Ω, Rds_on = 0.022Ω
      const result = calculatePChannelConduction(-2, 0, 25, 25, 225, 0.022);
      
      // Calculate expected values
      const expectedVgs = '-25.00';
      const expectedId = '0.1110';
      const expectedVd = '24.9976';
      const expectedVoltageAcrossLoad = '24.9976';
      const expectedCurrentThroughLoad = '0.1110';
      const expectedRawPower = 0.1110 * 0.1110 * 0.022;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
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
      const expectedVgs = '-12.00';
      const expectedId = '0.1091';
      const expectedVd = '10.9100';
      const expectedVoltageAcrossLoad = '10.9100';
      const expectedCurrentThroughLoad = '0.1091';
      const expectedRawPower = 0.1091 * 0.1091 * 10;
      
      // Check results
      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe(expectedVgs);
      expect(result.id).toBe(expectedId);
      expect(result.vd).toBe(expectedVd);
      expect(result.voltageAcrossLoad).toBe(expectedVoltageAcrossLoad);
      expect(result.currentThroughLoad).toBe(expectedCurrentThroughLoad);
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);
      
      // Check power unit for larger values
      expect(result.powerUnit).toBe('W');
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
