import React, { useState, useEffect } from 'react';
import mosfetData from './mosfetData.json'; // Adjust the path based on your directory structure
import './css/styles.css'; // Make sure to import your CSS file

function PChannelMosfetConfiguration({ mosfetName, mosfetDetails, inputValues, onDetailsChange, onInputChange, updateDescription }) {
  const [originalGateVoltage, setOriginalGateVoltage] = useState(null);

  useEffect(() => {
    if (mosfetName) {
      const selectedMosfet = mosfetData.mosfets['p-channel'][mosfetName];
      if (selectedMosfet) {
        onDetailsChange(mosfetName, selectedMosfet);
      }
    }
  }, [mosfetName, onDetailsChange]);

  const handleInputChange = (e) => {
    onInputChange(e.target.name, e.target.value);
  };

  const checkConductionPChannel   = () => {
    let missingValues   = [];

    // Check if all required values are set
    if (!inputValues.loadResistance) {
        missingValues.push('Load resistance');
    }
    if (!inputValues.vs) {
        missingValues.push('Source voltage');
    }
    if (document.getElementById("vth").value === "") {
        missingValues.push('Threshold voltage');
    }

    // Check if the MOSFET selector is set
    if (Object.keys(mosfetDetails).length === 0) {
        missingValues.push('MOSFET details');
    } else if (!mosfetDetails.vth) {
        missingValues.push('Threshold voltage');
    }
    if (inputValues.vg === "") {
        missingValues.push('Gate voltage');
    }

    if (missingValues.length > 0) {
        const description = `Please set the following values: ${missingValues.join(', ')}`;
        updateDescription(description, false, '', '', '', '', '', '', false);
        console.log(`Warning: The following values are not set: ${missingValues.join(', ')}`);
        return;
    }
    let isConducting = false;
    let description = '';
    let voltageAcrossLoad = '';
    let powerDissipated = '';
    let currentThroughLoad = '';
    let vgs = '';
    let id = '';
    let vs = '';
    let vd = '';
    let mosfetDestroyed = false;

    const vg = parseFloat(inputValues.vg) || 0;
    const loadResistance = parseFloat(inputValues.loadResistance) || 0;
    const vsInput = parseFloat(inputValues.vs) || 0;  // Source voltage input

    if (isNaN(vg) || isNaN(loadResistance) || isNaN(vsInput)) {
        description = 'Please enter valid input values for gate voltage, load resistance, and source voltage.';
        updateDescription(description, isConducting, voltageAcrossLoad, powerDissipated, currentThroughLoad, vgs, id, vd, mosfetDestroyed);
        return;
    }

    vs = vsInput; // Set the source voltage
    vgs = (vg - vs);

    if (Math.abs(vs) > Math.abs(mosfetDetails.Vds_max)) {
        description = `Alert: V_{s} (${vs}V) exceeds the maximum drain-source voltage (${mosfetDetails.Vds_max}V). MOSFET is destroyed.`;
        mosfetDestroyed = true;
    } else if (parseFloat(vgs) < mosfetDetails.vth) {
        isConducting = true;
        const rds_on = parseFloat(mosfetDetails.rds_on) || 0;

        id = (vs / (rds_on + loadResistance));
        voltageAcrossLoad = (id * loadResistance);
        vd = (vs - voltageAcrossLoad);
        powerDissipated = (Math.pow(id, 2) * rds_on);
        currentThroughLoad = id;

        if (powerDissipated > parseFloat(mosfetDetails.P_max)) {
            description = `Alert: Power dissipation (${powerDissipated}W) exceeds the maximum (${mosfetDetails.P_max}). MOSFET is destroyed.`;
            mosfetDestroyed = true;
        } else {
            description = `
              \\[
              \\color{blue}{V_{gs}} = \\color{red}{V_{g}} - \\color{green}{V_{s}} \\\\
              \\color{blue}{V_{gs}} = ${vg}V - ${vs}V = ${vgs}V \\\\
              \\color{purple}{I_{d}} = \\frac{\\color{green}{V_{s}}}{\\color{brown}{R_{load}} + \\color{cyan}{R_{ds(on)}}} \\\\
              \\color{purple}{I_{d}} = \\frac{${vs}V}{${loadResistance}\\Omega + ${rds_on}\\Omega} = ${id}A \\\\
              \\color{magenta}{V_{d}} = \\color{green}{V_{s}} - \\color{purple}{I_{d}} \\times \\color{brown}{R_{load}} \\\\
              \\color{magenta}{V_{d}} = ${vs}V - ${id}A \\times ${loadResistance}\\Omega = ${vd}V \\\\
              \\text{Voltage across load} = \\color{purple}{I_{d}} \\times \\color{brown}{R_{load}} = ${voltageAcrossLoad}V \\\\
              \\text{Power dissipated by MOSFET} = \\color{purple}{I_{d}}^2 \\times \\color{cyan}{R_{ds(on)}} = ${powerDissipated}W
              \\]
              \\
              The P-channel MOSFET is conducting. V_{gs} (${vgs}V) is less than the threshold voltage (${mosfetDetails.vth}V). The voltage at the source is ${vs}V and the voltage at the drain is approximately ${vd}V.
            `;
        }
    } else {
        description = `
          \\[
          \\color{blue}{V_{gs}} = \\color{red}{V_{g}} - \\color{green}{V_{s}} \\\\
          \\color{blue}{V_{gs}} = ${vg}V - ${vs}V = ${vgs}V
          \\]
          \\
          The P-channel MOSFET is not conducting because V_{gs} (${vgs}V) is not less than the threshold voltage (${mosfetDetails.vth}V).
        `;
    }

    updateDescription(description, isConducting, voltageAcrossLoad, powerDissipated, currentThroughLoad, vgs, id, vd, mosfetDestroyed);
};

  const handleToggleGateVoltage = () => {
    if (originalGateVoltage === null) {
      // Store the original gate voltage and set the gate voltage to 0
      setOriginalGateVoltage(inputValues.vg);
      onInputChange('vg', 0);
    } else {
      // Restore the original gate voltage and clear the stored value
      onInputChange('vg', originalGateVoltage);
      setOriginalGateVoltage(null);
    }
  };

  useEffect(() => {
    if (inputValues && mosfetDetails) {
      checkConductionPChannel();
    }
  }, [inputValues.vg, inputValues.loadResistance, inputValues.vs, inputValues, mosfetDetails, checkConductionPChannel]);

  return (
    <div>
      <div>
        <label htmlFor="mosfetName">MOSFET:</label>
        <select id="mosfetName" value={mosfetName} onChange={(e) => {
          const selectedMosfet = mosfetData.mosfets['p-channel'][e.target.value];
          if (selectedMosfet) {
            onDetailsChange(e.target.value, selectedMosfet);
          }
        }}>
           <option value="">Select a MOSFET...</option>
          {Object.keys(mosfetData.mosfets['p-channel']).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
        <div className="inputs">
          {mosfetDetails && (
            <>
              <div>
                <label htmlFor="vth">Threshold Voltage (V<sub>th</sub>):</label>
                <input type="number" id="vth" value={mosfetDetails.vth} readOnly />
              </div>
              <div>
                <label htmlFor="rds_on">R<sub>DS(on)</sub> (Ohms):</label>
                <input type="number" id="rds_on" value={mosfetDetails.rds_on} readOnly />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="right-section">
        <div className="inputs">
          <div>
            <label htmlFor="loadResistance">Load Resistance (Ohms):</label>
            <input type="number" id="loadResistance" name="loadResistance" value={inputValues.loadResistance} onChange={handleInputChange} />
          </div>
          <div>
            <label htmlFor="vg">Gate Voltage (V<sub>G</sub>):</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" id="vg" name="vg" value={inputValues.vg} onChange={handleInputChange} />
              <button type="button" onClick={handleToggleGateVoltage} style={{ marginLeft: '10px' }}>
                Toggle Gate Voltage
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="vs">Source Voltage (V<sub>S</sub>):</label>
            <input type="number" id="vs" name="vs" value={inputValues.vs} onChange={handleInputChange} />
          </div>
        </div>
        <div className="check-conduction-button">
          <button type="button" onClick={checkConductionPChannel}>Check Conduction</button>
        </div>
      </div>
    </div>
  );
}

export default PChannelMosfetConfiguration;
