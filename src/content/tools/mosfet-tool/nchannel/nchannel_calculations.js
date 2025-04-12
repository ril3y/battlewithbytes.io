import { calculateAdjustedRdsOn, colors, conducting_description, non_conducting_description } from '../mosfetUtils';

export const checkConductionNChannel = (inputValues, mosfetDetails, updateDescription) => {
  console.log("checkConductionNChannel called with:", inputValues, mosfetDetails);

  if (!inputValues) {
    updateDescription('Input values are missing.', false, '', '', '', '', '', '', '', '', false);
    return;
  }

  const missingValues = [];

  if (!inputValues.loadResistance) {
    missingValues.push('Load resistance');
  }
  if (!inputValues.vs) {
    missingValues.push('Source voltage');
  }
  if (!inputValues.vg) {
    missingValues.push('Gate voltage');
  }

  if (Object.keys(mosfetDetails).length === 0) {
    missingValues.push('MOSFET details');
  } else if (!mosfetDetails.vth) {
    missingValues.push('Threshold voltage');
  }

  if (missingValues.length > 0) {
    const description = `Please set the following values: ${missingValues.join(', ')}`;
    updateDescription(description, false, '', '', '', '', '', '', '', '', false);
    return;
  }

  let isConducting = false;
  let description = '';
  let voltageAcrossLoad = '';
  let powerDissipated = '';
  let currentThroughLoad = '';
  let vgs = '';
  let id = '';
  let vd = '';
  let conductionPercentage = '';
  let powerDissipationIncrease = '';
  let mosfetDestroyed = false;

  const vg = parseFloat(inputValues.vg) || 0;
  const vs = parseFloat(inputValues.vs) || 0; // Source voltage
  vgs = (vg - vs);
  const loadResistance = parseFloat(inputValues.loadResistance) || 0;
  const vcc = parseFloat(inputValues.vcc) || 0;

  const specifiedRdsOn = parseFloat(mosfetDetails.rds_on);
  const specifiedVgs = parseFloat(mosfetDetails.rds_on_vgs);

  const { adjustedRdsOn, conductionPercentage: cp } = calculateAdjustedRdsOn(specifiedRdsOn, specifiedVgs, vgs, false);
  conductionPercentage = cp;

  const values = {
    vg,
    vs,
    vgs,
    vcc,
    loadResistance,
    adjustedRdsOn,
    id,
    voltageAcrossLoad,
    vd,
    powerDissipated,
    conductionPercentage,
    powerDissipationIncrease,
    vth: mosfetDetails.vth,
  };

  if (vcc > mosfetDetails.Vds_max) {
    description = `Alert: V_{cc} (${vcc}V) exceeds the maximum drain-source voltage (${mosfetDetails.Vds_max}V). MOSFET is destroyed.`;
    mosfetDestroyed = true;
  } else if (vgs > mosfetDetails.vth && vcc > 0) {
    isConducting = true;

    id = (vcc / (adjustedRdsOn + loadResistance));
    voltageAcrossLoad = (id * loadResistance);
    vd = (vcc - voltageAcrossLoad);
    powerDissipated = (Math.pow(id, 2) * adjustedRdsOn);
    currentThroughLoad = id;

    const idealPowerDissipated = id * id * specifiedRdsOn;
    powerDissipationIncrease = ((powerDissipated - idealPowerDissipated) / idealPowerDissipated * 100).toFixed(2);

    if (powerDissipationIncrease < 0) {
      powerDissipationIncrease = 0;
    }

    if (powerDissipated > parseFloat(mosfetDetails.P_max)) {
      description = `Alert: Power dissipation (${powerDissipated}W) exceeds the maximum (${mosfetDetails.P_max}). MOSFET is destroyed.`;
      mosfetDestroyed = true;
    } else {
      description = conducting_description('n', colors, values);
    }
  } else {
    description = non_conducting_description('n', colors, values);
  }

  updateDescription(description, isConducting, voltageAcrossLoad, powerDissipated, currentThroughLoad, vgs, id, vd, conductionPercentage, powerDissipationIncrease, mosfetDestroyed);
};
