import {
  calculateNChannelConduction,
  calculatePChannelConduction,
} from "./mosfetUtils";

describe("MOSFET Calculations", () => {
  describe("N-Channel MOSFET", () => {
    test("N-Channel MOSFET conducting state", () => {
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculateNChannelConduction(2, 5, 0, 12, 100, 0.1);

      const expectedIdFull = 12 / (100 + 0.1);

      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe("5.00");
      expect(result.id).toBe("0.1199");
      expect(result.vd).toBe("0.0120");
      expect(result.voltageAcrossLoad).toBe("11.9880");
      expect(result.currentThroughLoad).toBe("0.1199");
      expect(result.rawPowerDissipated).toBeCloseTo(
        expectedIdFull * expectedIdFull * 0.1,
        6,
      );
    });

    test("N-Channel MOSFET cutoff state", () => {
      // Vth = 2V, Vg = 1V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculateNChannelConduction(2, 1, 0, 12, 100, 0.1);

      expect(result.conducting).toBe(false);
      expect(result.vgs).toBe("1.00");
      expect(result.id).toBe("0.0000");
      expect(result.vd).toBe("12.0000");
      expect(result.voltageAcrossLoad).toBe("0.0000");
      expect(result.currentThroughLoad).toBe("0.0000");
      expect(result.rawPowerDissipated).toBe(0);
    });

    test("N-Channel MOSFET with very low Rds_on", () => {
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 25V, Rload = 225Ω, Rds_on = 0.022Ω
      const result = calculateNChannelConduction(2, 5, 0, 25, 225, 0.022);

      const expectedIdFull = 25 / (225 + 0.022);
      const expectedRawPower = expectedIdFull * expectedIdFull * 0.022;

      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe("5.00");
      expect(result.id).toBe("0.1111");
      expect(result.vd).toBe("0.0024");
      expect(result.voltageAcrossLoad).toBe("24.9976");
      expect(result.currentThroughLoad).toBe("0.1111");
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);

      // Small dissipation is reported in mW
      expect(result.powerUnit).toBe("mW");
      expect(parseFloat(result.powerDissipated)).toBeCloseTo(
        expectedRawPower * 1000,
        2,
      );
    });

    test("N-Channel MOSFET with high Rds_on", () => {
      // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 10Ω
      const result = calculateNChannelConduction(2, 5, 0, 12, 100, 10);

      const expectedIdFull = 12 / (100 + 10);

      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe("5.00");
      expect(result.id).toBe("0.1091");
      expect(result.vd).toBe("1.0909");
      expect(result.voltageAcrossLoad).toBe("10.9091");
      expect(result.currentThroughLoad).toBe("0.1091");
      expect(result.rawPowerDissipated).toBeCloseTo(
        expectedIdFull * expectedIdFull * 10,
        6,
      );

      // Larger dissipation stays in W
      expect(result.powerUnit).toBe("W");
    });
  });

  describe("P-Channel MOSFET", () => {
    // Note: calculatePChannelConduction takes (vth, vg, vs, loadResistance,
    // rds_on) — there is no separate vcc parameter; the source voltage IS
    // the supply in the high-side configuration.
    test("P-Channel MOSFET conducting state", () => {
      // Vth = -2V, Vg = 0V, Vs = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculatePChannelConduction(-2, 0, 12, 100, 0.1);

      const expectedIdFull = 12 / (100 + 0.1);

      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe("-12.00");
      expect(result.id).toBe("0.1199");
      expect(result.vd).toBe("11.9880");
      expect(result.voltageAcrossLoad).toBe("11.9880");
      expect(result.currentThroughLoad).toBe("0.1199");
      expect(result.rawPowerDissipated).toBeCloseTo(
        expectedIdFull * expectedIdFull * 0.1,
        6,
      );
    });

    test("P-Channel MOSFET cutoff state", () => {
      // Vth = -2V, Vg = 12V, Vs = 12V, Rload = 100Ω, Rds_on = 0.1Ω
      const result = calculatePChannelConduction(-2, 12, 12, 100, 0.1);

      expect(result.conducting).toBe(false);
      expect(result.vgs).toBe("0.00");
      expect(result.id).toBe("0.0000");
      expect(result.vd).toBe("0.0000");
      expect(result.voltageAcrossLoad).toBe("0.0000");
      expect(result.currentThroughLoad).toBe("0.0000");
      expect(result.rawPowerDissipated).toBe(0);
    });

    test("P-Channel MOSFET with very low Rds_on", () => {
      // Vth = -2V, Vg = 0V, Vs = 25V, Rload = 225Ω, Rds_on = 0.022Ω
      const result = calculatePChannelConduction(-2, 0, 25, 225, 0.022);

      const expectedIdFull = 25 / (225 + 0.022);
      const expectedRawPower = expectedIdFull * expectedIdFull * 0.022;

      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe("-25.00");
      expect(result.id).toBe("0.1111");
      expect(result.vd).toBe("24.9976");
      expect(result.voltageAcrossLoad).toBe("24.9976");
      expect(result.currentThroughLoad).toBe("0.1111");
      expect(result.rawPowerDissipated).toBeCloseTo(expectedRawPower, 6);

      // Small dissipation is reported in mW
      expect(result.powerUnit).toBe("mW");
      expect(parseFloat(result.powerDissipated)).toBeCloseTo(
        expectedRawPower * 1000,
        2,
      );
    });

    test("P-Channel MOSFET with high Rds_on", () => {
      // Vth = -2V, Vg = 0V, Vs = 12V, Rload = 100Ω, Rds_on = 10Ω
      const result = calculatePChannelConduction(-2, 0, 12, 100, 10);

      const expectedIdFull = 12 / (100 + 10);

      expect(result.conducting).toBe(true);
      expect(result.vgs).toBe("-12.00");
      expect(result.id).toBe("0.1091");
      expect(result.vd).toBe("10.9091");
      expect(result.voltageAcrossLoad).toBe("10.9091");
      expect(result.currentThroughLoad).toBe("0.1091");
      expect(result.rawPowerDissipated).toBeCloseTo(
        expectedIdFull * expectedIdFull * 10,
        6,
      );

      // Larger dissipation stays in W
      expect(result.powerUnit).toBe("W");
    });
  });

  describe("Edge Cases", () => {
    test("N-Channel MOSFET with Vgs exactly at threshold", () => {
      // Vgs == Vth must not conduct
      const result = calculateNChannelConduction(2, 2, 0, 12, 100, 0.1);
      expect(result.conducting).toBe(false);
    });

    test("P-Channel MOSFET with Vgs exactly at threshold", () => {
      // Vgs == Vth must not conduct
      const result = calculatePChannelConduction(-2, 10, 12, 100, 0.1);
      expect(result.conducting).toBe(false);
    });
  });
});
