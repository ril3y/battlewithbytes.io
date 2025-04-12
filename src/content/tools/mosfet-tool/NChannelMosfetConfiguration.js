import React, { useState, useEffect } from 'react';
import mosfetData from './mosfetData.json'; // Adjust the path based on your directory structure
import './css/styles.css'; // Make sure to import your CSS file

function NChannelMosfetConfiguration({ mosfetName, mosfetDetails, inputValues, onDetailsChange, onInputChange, updateDescription }) {
  const [originalGateVoltage, setOriginalGateVoltage] = useState(null);

  useEffect(() => {
    if (mosfetName) {
      const selectedMosfet = mosfetData.mosfets['n-channel'][mosfetName];
      if (selectedMosfet) {
        onDetailsChange(mosfetName, selectedMosfet);
      }
    }
  }, [mosfetName, onDetailsChange]);

  const handleInputChange = (e) => {
    onInputChange(e.target.name, e.target.value);
  };

  const checkConductionNChannel = () => {
    const missingValues = [];

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
  if (inputValues.vg === "") {
    missingValues.push('Gate voltage');
  }

  // Check if the MOSFET selector is set
  if (Object.keys(mosfetDetails).length === 0) {
    missingValues.push('MOSFET details');
  } else if (!mosfetDetails.vth) {
    missingValues.push('Threshold voltage');
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
    let vd = '';
    let mosfetDestroyed = false;
  
    const vg = parseFloat(inputValues.vg) || 0;
    const vs = 0; // Source is connected to ground
    vgs = (vg - vs);
    const loadResistance = parseFloat(inputValues.loadResistance) || 0;
    const vcc = parseFloat(inputValues.vcc) || 0;
  
    const colorVgs = '\\color{blue}{V_{gs}}';
    const colorVg = '\\color{red}{V_{g}}';
    const colorVs = '\\color{green}{V_{s}}';
    const colorId = '\\color{purple}{I_{d}}';
    const colorVcc = '\\color{orange}{V_{cc}}';
    const colorRload = '\\color{brown}{R_{load}}';
    const colorRds_on = '\\color{cyan}{R_{ds(on)}}';
    const colorVd = '\\color{magenta}{V_{d}}';
  
    if (vcc > mosfetDetails.Vds_max) {
      description = `Alert: V_{cc} (${vcc}V) exceeds the maximum drain-source voltage (${mosfetDetails.Vds_max}V). MOSFET is destroyed.`;
      mosfetDestroyed = true;
    } else if (parseFloat(vgs) > mosfetDetails.vth && vcc > 0) {
      isConducting = true;
      const rds_on = parseFloat(mosfetDetails.rds_on) || 0;
  
      id = (vcc / (rds_on + loadResistance));
      voltageAcrossLoad = (id * loadResistance);
      vd = (vcc - voltageAcrossLoad);
      powerDissipated = (Math.pow(id, 2) * rds_on);
      currentThroughLoad = id;
  
      if (powerDissipated > parseFloat(mosfetDetails.P_max)) {
        description = `Alert: Power dissipation (${powerDissipated}W) exceeds the maximum (${mosfetDetails.P_max}). MOSFET is destroyed.`;
        mosfetDestroyed = true;
      } else {
        description = `
          \\[
          ${colorVgs} = ${colorVg} - ${colorVs} \\\\
          ${colorVgs} = ${vg}V - ${vs}V = ${vgs}V \\\\
          ${colorId} = \\frac{${colorVcc}}{${colorRload} + ${colorRds_on}} \\\\
          ${colorId} = \\frac{${vcc}V}{${loadResistance}\\Omega + ${rds_on}\\Omega} = ${id}A \\\\
          ${colorVd} = ${colorVcc} - ${colorId} \\times ${colorRload} \\\\
          ${colorVd} = ${vcc}V - ${id}A \\times ${loadResistance}\\Omega = ${vd}V \\\\
          \\text{Voltage across load} = ${colorId} \\times ${colorRload} = ${voltageAcrossLoad}V \\\\
          \\text{Power dissipated by MOSFET} = ${colorId}^2 \\times ${colorRds_on} = ${powerDissipated}W
          \\]
          \\
          The N-channel MOSFET is conducting. V_{gs} (${vgs}V) is greater than the threshold voltage (${mosfetDetails.vth}V). The voltage at the drain is approximately ${vd}V and the voltage at the source is 0V.
        `;
      }
    } else {
      description = `
        \\[
        ${colorVgs} = ${colorVg} - ${colorVs} \\\\
        ${colorVgs} = ${vg}V - ${vs}V = ${vgs}V
        \\]
        \\
        The N-channel MOSFET is not conducting because V_{gs} (${vgs}V) is not greater than the threshold voltage (${mosfetDetails.vth}V) or V_{cc} (${vcc}V) is zero.
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
      checkConductionNChannel();
    }
  }, [inputValues.vg, inputValues.loadResistance, inputValues.vcc]);

  return (
    <div>
      <div>
        <label htmlFor="mosfetName">MOSFET:</label>
        <select id="mosfetName" value={mosfetName} onChange={(e) => {
          const selectedMosfet = mosfetData.mosfets['n-channel'][e.target.value];
          if (selectedMosfet) {
            onDetailsChange(e.target.value, selectedMosfet);
          }
        }}>
           <option value="">Select a MOSFET...</option>
          {Object.keys(mosfetData.mosfets['n-channel']).map((key) => (
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
            <label htmlFor="vcc">VCC (V<sub>CC</sub>):</label>
            <input type="number" id="vcc" name="vcc" value={inputValues.vcc} onChange={handleInputChange} />
          </div>
        </div>
        <div className="check-conduction-button">
          <button type="button" onClick={checkConductionNChannel}>Check Conduction</button>
        </div>
      </div>
    </div>
  );
}

export default NChannelMosfetConfiguration;
