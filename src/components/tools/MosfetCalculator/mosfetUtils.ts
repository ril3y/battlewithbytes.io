'use client';

// N-Channel MOSFET calculations
export const calculateNChannelConduction = (
  vth: number,
  vg: number,
  vs: number,
  vcc: number,
  loadResistance: number,
  rds_on: number
) => {
  const vgs = vg - vs;
  let conducting = false;
  let vd = 0;
  let id = 0;
  let voltageAcrossLoad = 0;
  let currentThroughLoad = 0;
  let powerDissipated = 0;
  let description = '';

  if (vgs > vth) {
    conducting = true;
    
    // Calculate the voltage division between Rds_on and the load resistor
    const totalResistance = rds_on + loadResistance;
    id = vcc / totalResistance;
    vd = id * rds_on + vs;
    voltageAcrossLoad = id * loadResistance;
    currentThroughLoad = id;
    powerDissipated = id * id * rds_on;
    
    description = `The N-Channel MOSFET is conducting because Vgs (${vgs.toFixed(2)}V) is greater than Vth (${vth}V).\n\n`;
    description += `The MOSFET is in the ohmic region, acting as a low-value resistor (${rds_on}Ω).\n`;
    description += `Current flows from drain to source, allowing current through the load.`;
  } else {
    conducting = false;
    vd = vcc;
    id = 0;
    voltageAcrossLoad = 0;
    currentThroughLoad = 0;
    powerDissipated = 0;
    
    description = `The N-Channel MOSFET is NOT conducting because Vgs (${vgs.toFixed(2)}V) is less than Vth (${vth}V).\n\n`;
    description += `The MOSFET is in cutoff mode, acting as an open circuit.\n`;
    description += `No current flows through the load resistor.`;
  }

  // Format the power with higher precision to show small values
  const formattedPower = powerDissipated < 0.001 && powerDissipated > 0 
    ? `${(powerDissipated * 1000).toFixed(2)} mW`
    : `${powerDissipated.toFixed(6)}`;

  return {
    conducting,
    vgs: vgs.toFixed(2),
    id: id.toFixed(4),
    vd: vd.toFixed(4),
    voltageAcrossLoad: voltageAcrossLoad.toFixed(4),
    currentThroughLoad: currentThroughLoad.toFixed(4),
    powerDissipated: formattedPower,
    powerUnit: powerDissipated < 0.001 && powerDissipated > 0 ? 'mW' : 'W',
    rawPowerDissipated: powerDissipated, // Add raw value for calculations
    description
  };
};

// P-Channel MOSFET calculations
export const calculatePChannelConduction = (
  vth: number,
  vg: number,
  vs: number,
  vcc: number,
  loadResistance: number,
  rds_on: number
) => {
  const vgs = vg - vs;
  let conducting = false;
  let vd = 0;
  let id = 0;
  let voltageAcrossLoad = 0;
  let currentThroughLoad = 0;
  let powerDissipated = 0;
  let description = '';

  // For P-Channel, vth is negative and conduction occurs when vgs < vth
  if (vgs < vth) {
    conducting = true;
    
    // Calculate the voltage division between Rds_on and the load resistor
    const totalResistance = rds_on + loadResistance;
    id = vcc / totalResistance;
    vd = vs - (id * rds_on);
    voltageAcrossLoad = id * loadResistance;
    currentThroughLoad = id;
    powerDissipated = id * id * rds_on;
    
    description = `The P-Channel MOSFET is conducting because Vgs (${vgs.toFixed(2)}V) is less than Vth (${vth}V).\n\n`;
    description += `The MOSFET is in the ohmic region, acting as a low-value resistor (${rds_on}Ω).\n`;
    description += `Current flows from source to drain, allowing current through the load.`;
  } else {
    conducting = false;
    vd = 0;
    id = 0;
    voltageAcrossLoad = 0;
    currentThroughLoad = 0;
    powerDissipated = 0;
    
    description = `The P-Channel MOSFET is NOT conducting because Vgs (${vgs.toFixed(2)}V) is greater than or equal to Vth (${vth}V).\n\n`;
    description += `The MOSFET is in cutoff mode, acting as an open circuit.\n`;
    description += `No current flows through the load resistor.`;
  }

  // Format the power with higher precision to show small values
  const formattedPower = powerDissipated < 0.001 && powerDissipated > 0 
    ? `${(powerDissipated * 1000).toFixed(2)} mW`
    : `${powerDissipated.toFixed(6)}`;

  return {
    conducting,
    vgs: vgs.toFixed(2),
    id: id.toFixed(4),
    vd: vd.toFixed(4),
    voltageAcrossLoad: voltageAcrossLoad.toFixed(4),
    currentThroughLoad: currentThroughLoad.toFixed(4),
    powerDissipated: formattedPower,
    powerUnit: powerDissipated < 0.001 && powerDissipated > 0 ? 'mW' : 'W',
    rawPowerDissipated: powerDissipated, // Add raw value for calculations
    description
  };
};
