import { calculateAdjustedRdsOn, colors, conducting_description, non_conducting_description } from '../mosfetUtils';


export const checkConductionPChannel = (inputValues, mosfetDetails) => {
  if (!inputValues) {
    return {
      description: 'Input values are missing.',
      isConducting: false,
      voltageAcrossLoad: '',
      powerDissipated: '',
      currentThroughLoad: '',
      vgs: '',
      id: '',
      vd: '',
      conductionPercentage: '',
      powerDissipationIncrease: '',
      mosfetDestroyed: false
    };
  }

  const missingValues = [];

  if (!inputValues.loadResistance) {
    missingValues.push('Load resistance');
  }
  if (!inputValues.vs) {
    missingValues.push('Source voltage');
  }
  if (!inputValues.gate_voltage) {
    missingValues.push('Gate voltage');
  }

  if (Object.keys(mosfetDetails).length === 0) {
    missingValues.push('MOSFET details');
  } else if (!mosfetDetails.vth) {
    missingValues.push('Threshold voltage');
  }

  if (missingValues.length > 0) {
    const description = `Please set the following values: ${missingValues.join(', ')}`;
    return {
      description,
      isConducting: false,
      voltageAcrossLoad: '',
      powerDissipated: '',
      currentThroughLoad: '',
      vgs: '',
      id: '',
      vd: '',
      conductionPercentage: '',
      powerDissipationIncrease: '',
      mosfetDestroyed: false
    };
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

  const vg = parseFloat(inputValues.gate_voltage) || 0;
  const vs = parseFloat(inputValues.vs) || 0; // Source voltage
  vgs = (vg - vs);
  const loadResistance = parseFloat(inputValues.loadResistance) || 0;

  const specifiedRdsOn = parseFloat(mosfetDetails.rds_on);
  const specifiedVgs = parseFloat(mosfetDetails.rds_on_vgs);

  const { adjustedRdsOn, conductionPercentage: cp } = calculateAdjustedRdsOn(specifiedRdsOn, specifiedVgs, vgs, true);
  conductionPercentage = cp;

  const values = {
    vg,
    vs,
    vgs,
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

  if (Math.abs(vs) > Math.abs(mosfetDetails.Vds_max)) {
    description = `Alert: V_{s} (${vs}V) exceeds the maximum drain-source voltage (${mosfetDetails.Vds_max}V). MOSFET is destroyed.`;
    mosfetDestroyed = true;
  } else if (parseFloat(vgs) < mosfetDetails.vth) {
    isConducting = true;

    id = vs / (adjustedRdsOn + loadResistance);
    voltageAcrossLoad = id * loadResistance;
    vd = vs - voltageAcrossLoad;
    powerDissipated = Math.pow(id, 2) * adjustedRdsOn;
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
      description = conducting_description('p', colors, values);
    }
  } else {
    description = non_conducting_description('p', colors, values);
  }

  return {
    description,
    isConducting,
    voltageAcrossLoad,
    powerDissipated,
    currentThroughLoad,
    vgs,
    id,
    vd,
    conductionPercentage,
    powerDissipationIncrease,
    mosfetDestroyed
  };
};