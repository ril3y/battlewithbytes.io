import path from 'path';
import mosfetData from './mosfetData.json';

const calculateNChannelMOSFET = (inputValues, mosfetDetails) => {
    const { gate_voltage: vg, vcc, vs, loadResistance } = inputValues;
    const vgs = vg - vs;
    let isConducting = false;
    let voltageAcrossLoad = 0;
    let powerDissipated = 0;
    let currentThroughLoad = 0;
    let id = 0;
    let vd = 0;

    if (vgs > mosfetDetails.vth) {
        isConducting = true;
        id = vcc / (parseFloat(mosfetDetails.rds_on) + loadResistance);
        vd = vcc - (id * loadResistance);
        voltageAcrossLoad = id * loadResistance;
        powerDissipated = Math.pow(id, 2) * parseFloat(mosfetDetails.rds_on);
        currentThroughLoad = id;
    }

    return {
        isConducting,
        voltageAcrossLoad,
        powerDissipated,
        currentThroughLoad,
        vgs,
        id,
        vd
    };
};

const calculatePChannelMOSFET = (inputValues, mosfetDetails) => {
    const { gate_voltage: vg, vs, loadResistance } = inputValues;
    const vgs = vg - vs;
    let isConducting = false;
    let voltageAcrossLoad = 0;
    let powerDissipated = 0;
    let currentThroughLoad = 0;
    let id = 0;
    let vd = 0;

    if (vgs < mosfetDetails.vth) {
        isConducting = true;
        const rds_on = parseFloat(mosfetDetails.rds_on);
        id = vs / (rds_on + loadResistance);
        voltageAcrossLoad = id * loadResistance;
        vd = vs - voltageAcrossLoad; // Voltage at the drain
        powerDissipated = id * id * rds_on;
        currentThroughLoad = id;
    }

    return {
        isConducting,
        voltageAcrossLoad,
        powerDissipated,
        currentThroughLoad,
        vgs,
        id,
        vd
    };
};

const generateExpectedOutputs = () => {
    const updatedData = JSON.parse(JSON.stringify(mosfetData)); // Deep copy

    // Calculate expected outputs for N-channel MOSFETs
    for (const mosfetName in updatedData.mosfets["n-channel"]) {
        const mosfetDetails = updatedData.mosfets["n-channel"][mosfetName];
        const inputValues = mosfetDetails.test_inputs;

        if (!inputValues || Object.values(inputValues).some(value => value === null)) {
            console.error(`Skipping ${mosfetName} due to missing input values`);
            continue;
        }

        const expectedOutputs = calculateNChannelMOSFET(inputValues, mosfetDetails);
        updatedData.mosfets["n-channel"][mosfetName].expected_outputs = expectedOutputs;
    }

    // Calculate expected outputs for P-channel MOSFETs
    for (const mosfetName in updatedData.mosfets["p-channel"]) {
        const mosfetDetails = updatedData.mosfets["p-channel"][mosfetName];
        const inputValues = mosfetDetails.test_inputs;

        if (!inputValues || Object.values(inputValues).some(value => value === null)) {
            console.error(`Skipping ${mosfetName} due to missing input values`);
            continue;
        }

        const expectedOutputs = calculatePChannelMOSFET(inputValues, mosfetDetails);
        updatedData.mosfets["p-channel"][mosfetName].expected_outputs = expectedOutputs;
    }

    console.log(JSON.stringify(updatedData, null, 4));
};

// Check for --generate flag
if (process.argv.includes('--generate')) {
    generateExpectedOutputs();
}

export {
    calculateNChannelMOSFET,
    calculatePChannelMOSFET,
    generateExpectedOutputs
};
