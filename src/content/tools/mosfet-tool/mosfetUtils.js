export const handleInputChange = (setter, name, value) => {
    setter(prev => ({ ...prev, [name]: value }));
};

export const checkConduction = (type, inputValues, mosfetDetails, updateDescription) => {
    const { gate_voltage: vg, vcc, vs, loadResistance } = inputValues;

    if (vg === null || loadResistance === null || (type === 'n-channel' && vcc === null) || (type === 'p-channel' && vs === null)) {
        throw new Error(`Invalid input values: vg=${vg}, vcc=${vcc}, vs=${vs}, loadResistance=${loadResistance}`);
    }

    const vgs = vg - (type === 'n-channel' ? 0 : vs); // For N-channel vs is assumed to be 0

    let isConducting = false;
    let description = '';
    let voltageAcrossLoad = 0;
    let powerDissipated = 0;
    let currentThroughLoad = 0;
    let id = 0;
    let vd = 0;

    console.log(`Type: ${type}`);
    console.log(`Input Values: Vg=${vg}, Vcc=${vcc}, Vs=${vs}, Load Resistance=${loadResistance}`);
    console.log(`Mosfet Details: Vth=${mosfetDetails.vth}, Rds_on=${mosfetDetails.rds_on}`);
    console.log(`Vgs: ${vgs}`);

    if (type === 'n-channel') {
        if (vgs > mosfetDetails.vth) {
            isConducting = true;
            const rds_on = parseFloat(mosfetDetails.rds_on);
            if (rds_on + loadResistance === 0) {
                throw new Error("Invalid input values: division by zero.");
            }
            id = vcc / (rds_on + loadResistance);
            vd = vcc - (id * loadResistance);
            voltageAcrossLoad = id * loadResistance;
            powerDissipated = Math.pow(id, 2) * rds_on;
            currentThroughLoad = id;
            description = `Conducting. V_GS (${vgs}V) > Vth (${mosfetDetails.vth}V). Drain: ${vd}V`;

            console.log(`N-Channel Conducting: Id=${id}, Vd=${vd}, Voltage Across Load=${voltageAcrossLoad}, Power Dissipated=${powerDissipated}`);
        } else {
            description = `Not Conducting. V_GS (${vgs}V) <= Vth (${mosfetDetails.vth}V)`;
            console.log(`N-Channel Not Conducting`);
        }
    } else if (type === 'p-channel') {
        if (vgs < mosfetDetails.vth) {
            isConducting = true;
            const rds_on = parseFloat(mosfetDetails.rds_on);
            if (rds_on + loadResistance === 0) {
                throw new Error("Invalid input values: division by zero.");
            }
            id = vs / (rds_on + loadResistance);
            voltageAcrossLoad = id * loadResistance;
            vd = vs - voltageAcrossLoad;
            powerDissipated = Math.pow(id, 2) * rds_on;
            currentThroughLoad = id;
            description = `Conducting. V_GS (${vgs}V) < Vth (${mosfetDetails.vth}V). Drain: ${vd}V`;

            console.log(`P-Channel Conducting: Id=${id}, Vd=${vd}, Voltage Across Load=${voltageAcrossLoad}, Power Dissipated=${powerDissipated}`);
        } else {
            description = `Not Conducting. V_GS (${vgs}V) >= Vth (${mosfetDetails.vth}V)`;
            console.log(`P-Channel Not Conducting`);
        }
    }

    updateDescription(
        description,
        isConducting,
        voltageAcrossLoad,
        powerDissipated,
        currentThroughLoad,
        vgs,
        id,
        vd,
        false // Assuming `mosfetDestroyed` is false for simplicity
    );
};

