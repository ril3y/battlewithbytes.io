import React, { useState, useEffect } from 'react';
import { checkConductionPChannel } from './pchannel_calculations';
import mosfetData from '../mosfetData.json'; // Adjust the path based on your directory structure

function PChannelMosfetConfiguration({ mosfetName, mosfetDetails, inputValues, onDetailsChange, onInputChange }) {
  const [originalGateVoltage, setOriginalGateVoltage] = useState(null);

  useEffect(() => {
    if (inputValues && mosfetDetails) {
      console.log('Checking conduction with inputValues:', inputValues, 'and mosfetDetails:', mosfetDetails);
      checkConductionPChannel();
    }
  }, [inputValues, mosfetDetails]);

  const handleInputChange = (e) => {
    console.log('Input change detected:', e.target.name, e.target.value);
    onInputChange(e.target.name, e.target.value);
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
      console.log('Checking conduction with updated inputValues:', inputValues, 'and mosfetDetails:', mosfetDetails);
      checkConductionPChannel();
    }
  }, [inputValues.vg, inputValues.loadResistance, inputValues.vs]);

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
          <button type="button" onClick={() => checkConductionPChannel(inputValues, mosfetDetails)}>Check Conduction</button>
        </div>
      </div>
    </div>
  );
}

export default PChannelMosfetConfiguration;