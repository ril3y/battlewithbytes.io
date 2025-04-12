'use client';

// N-Channel MOSFET calculations
export const calculateNChannelConduction = (
  vth: number,
  vg: number,
  vs: number, // Source terminal voltage (often 0V / Ground)
  vcc: number, // Supply voltage connected *before* the load resistor
  loadResistance: number,
  rds_on: number
) => {
  // Assumes a standard N-Channel low-side switch configuration:
  // Vcc -> Load Resistor -> Drain, Source -> Vs (often Ground = 0V)
  // Current flows Vcc -> Load -> D -> S -> Vs when ON.

  const vgs = vg - vs;
  let conducting = false;
  let vd = 0; // Drain terminal voltage relative to ground/common
  let id = 0; // Drain current (flowing D->S)
  let voltageAcrossLoad = 0;
  let currentThroughLoad = 0;
  let powerDissipated = 0; // Power dissipated *in the MOSFET*
  let description = '';

  if (vgs > vth) {
    conducting = true;

    // Calculate the voltage division between Rds_on and the load resistor.
    // The total voltage driving the current is Vcc - Vs.
    // If Vs is ground (0V), then voltage driver is just Vcc.
    const drivingVoltage = vcc - vs; // Voltage across the Vcc -> Load -> MOSFET -> Vs path
    const totalResistance = rds_on + loadResistance;

    // Prevent division by zero if totalResistance is somehow zero
    if (totalResistance <= 0) {
        id = 0; // Or handle as an error state
    } else {
       // Current flowing through the series path
       id = drivingVoltage / totalResistance;
    }

    // Calculate Drain voltage relative to ground/common (Vs is the reference for Source)
    // Vd = Voltage drop across Rds_on + Vs
    vd = id * rds_on + vs;
    voltageAcrossLoad = id * loadResistance; // Voltage drop across the load
    currentThroughLoad = id; // Current through load is the drain current
    powerDissipated = id * id * rds_on; // Power in MOSFET = Ids^2 * Rds_on

    description = `The N-Channel MOSFET is conducting because Vgs (${vgs.toFixed(2)}V) is greater than Vth (${vth}V).\n\n`;
    description += `The MOSFET is in the ohmic region, acting as a low-value resistor (${rds_on}Ω).\n`;
    description += `Current flows from drain to source, allowing current through the load.`;

  } else {
    // Cutoff state
    conducting = false;
    // When off, Drain voltage is pulled up to Vcc via the load resistor (assuming load connects D to Vcc)
    // No, wait - Drain is between Load and MOSFET. If MOSFET is open, Vd = Vs because no current flows through Rds_on?
    // No, if MOSFET is open circuit (D-S), no current flows through Load either. Vd = Vcc (pulled up through load)
    vd = vcc; // Voltage at Drain node relative to ground/common
    id = 0;
    voltageAcrossLoad = 0; // No current through load
    currentThroughLoad = 0;
    powerDissipated = 0;

    description = `The N-Channel MOSFET is NOT conducting because Vgs (${vgs.toFixed(2)}V) is less than or equal to Vth (${vth}V).\n\n`; // Added "or equal to"
    description += `The MOSFET is in cutoff mode, acting as an open circuit between Drain and Source.\n`;
    description += `No significant current flows through the load resistor.`;
  }

  // Format the power with higher precision to show small values
  let formattedPower = powerDissipated.toFixed(6);
  let powerUnit = 'W';
  if (powerDissipated < 0.001 && powerDissipated > 0) {
    formattedPower = (powerDissipated * 1000).toFixed(2);
    powerUnit = 'mW';
  }

  return {
    conducting,
    vgs: vgs.toFixed(2),
    id: id.toFixed(4),
    vd: vd.toFixed(4),
    voltageAcrossLoad: voltageAcrossLoad.toFixed(4),
    currentThroughLoad: currentThroughLoad.toFixed(4),
    powerDissipated: formattedPower, // Now just the number part
    powerUnit: powerUnit,           // Unit separate
    rawPowerDissipated: powerDissipated,
    description
  };
};


// P-Channel MOSFET calculations
export const calculatePChannelConduction = (
  vth: number, // Expected to be negative for P-channel
  vg: number,
  vs: number, // Source terminal voltage (often Vcc for high-side)
  vcc: number, // Supply voltage (often connected to Vs for high-side) - parameter retained for consistency, but Vs drives current.
  loadResistance: number,
  rds_on: number
) => {
  // Assumes a standard P-Channel high-side switch configuration:
  // Vs (typically connected to Vcc) -> Source, Drain -> Load Resistor -> Ground (0V)
  // Current flows Vs -> S -> D -> Load -> Ground when ON.

  const vgs = vg - vs; // Will be negative when Vg < Vs
  let conducting = false;
  let vd = 0; // Drain terminal voltage relative to ground/common
  let id = 0; // Drain current (flowing S->D)
  let voltageAcrossLoad = 0;
  let currentThroughLoad = 0;
  let powerDissipated = 0; // Power dissipated *in the MOSFET*
  let description = '';

  // For P-Channel, vth is negative and conduction occurs when vgs < vth
  if (vgs < vth) {
    conducting = true;

    // Calculate the voltage division between Rds_on and the load resistor.
    // The total voltage driving the current is Vs - Ground = Vs.
    const drivingVoltage = vs; // Voltage across the Vs -> MOSFET -> Load -> Ground path
    const totalResistance = rds_on + loadResistance;

     // Prevent division by zero
    if (totalResistance <= 0) {
        id = 0;
    } else {
        // Current flowing through the series path
        id = drivingVoltage / totalResistance;
    }

    // Calculate Drain voltage relative to ground/common
    // Vd = Vs - (Voltage drop across Rds_on) = Vs - (Id * Rds_on)
    // Alternatively Vd = voltage drop across Load = Id * loadResistance
    vd = id * loadResistance; // Drain voltage is the voltage across the load resistor
    // Let's double-check the previous calculation: vd = vs - (id * rds_on); This is also correct.
    // Let's use vd = vs - (id * rds_on) as it's defined relative to Vs.

    vd = vs - (id * rds_on); // Voltage at Drain node relative to ground/common
    voltageAcrossLoad = id * loadResistance; // Voltage drop across the load resistor
    currentThroughLoad = id; // Current through load is the drain current
    powerDissipated = id * id * rds_on; // Power in MOSFET = Ids^2 * Rds_on

    description = `The P-Channel MOSFET is conducting because Vgs (${vgs.toFixed(2)}V) is less than Vth (${vth}V).\n\n`;
    description += `The MOSFET is in the ohmic region, acting as a low-value resistor (${rds_on}Ω).\n`;
    description += `Current flows from source to drain, allowing current through the load.`;
  } else {
    // Cutoff state
    conducting = false;
    // When off, no current flows. Drain is connected to Load, Load to Ground.
    // So, Drain voltage is pulled down to Ground (0V) through the load.
    vd = 0; // Voltage at Drain node relative to ground/common
    id = 0;
    voltageAcrossLoad = 0; // No current through load
    currentThroughLoad = 0;
    powerDissipated = 0;

    description = `The P-Channel MOSFET is NOT conducting because Vgs (${vgs.toFixed(2)}V) is greater than or equal to Vth (${vth}V).\n\n`;
    description += `The MOSFET is in cutoff mode, acting as an open circuit between Source and Drain.\n`;
    description += `No significant current flows through the load resistor.`;
  }

  // Format the power with higher precision to show small values
  let formattedPower = powerDissipated.toFixed(6);
  let powerUnit = 'W';
   if (powerDissipated < 0.001 && powerDissipated > 0) {
    formattedPower = (powerDissipated * 1000).toFixed(2);
    powerUnit = 'mW';
  }


  return {
    conducting,
    vgs: vgs.toFixed(2),
    id: id.toFixed(4),
    vd: vd.toFixed(4), // Drain voltage relative to ground
    voltageAcrossLoad: voltageAcrossLoad.toFixed(4),
    currentThroughLoad: currentThroughLoad.toFixed(4),
    powerDissipated: formattedPower, // Just the number part
    powerUnit: powerUnit,           // Unit separate
    rawPowerDissipated: powerDissipated,
    description
  };
};