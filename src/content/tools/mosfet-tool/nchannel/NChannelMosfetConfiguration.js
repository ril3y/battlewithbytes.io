import React, { useState, useEffect } from 'react';
import mosfetData from '../mosfetData.json'; // Adjust the path based on your directory structure
import '../css/styles.css';
import Description from '../Description'; // Ensure Description component is imported
import { checkConduction } from '../mosfetUtils'; // Ensure the function is correctly imported

function NChannelMosfetConfiguration({ mosfetName, mosfetDetails, inputValues, onDetailsChange, onInputChange }) {
  const [description, setDescription] = useState('');
  const [conducting, setConducting] = useState(null);
  const [voltageAcrossLoad, setVoltageAcrossLoad] = useState('');
  const [powerDissipated, setPowerDissipated] = useState('');
  const [currentThroughLoad, setCurrentThroughLoad] = useState('');
  const [vgs, setVgs] = useState('');
  const [id, setId] = useState('');
  const [vd, setVd] = useState('');
  const [conductionPercentage, setConductionPercentage] = useState('');
  const [powerDissipationIncrease, setPowerDissipationIncrease] = useState('');

  const [originalGateVoltage, setOriginalGateVoltage] = useState(null);

  useEffect(() => {
    if (inputValues && mosfetDetails) {
      checkConduction('n-channel', inputValues, mosfetDetails, handleUpdateDescription);
    }
  }, [inputValues, mosfetDetails]);

  const handleInputChange = (e) => {
    onInputChange(e.target.name, e.target.value);
  };

  const handleUpdateDescription = (description, isConducting, voltageAcrossLoad, powerDissipated, currentThroughLoad, vgs, id, vd, conductionPercentage, powerDissipationIncrease) => {
    setDescription(description);
    setConducting(isConducting);
    setVoltageAcrossLoad(voltageAcrossLoad);
    setPowerDissipated(powerDissipated);
    setCurrentThroughLoad(currentThroughLoad);
    setVgs(vgs);
    setId(id);
    setVd(vd);
    setConductionPercentage(conductionPercentage);
    setPowerDissipationIncrease(powerDissipationIncrease);
  };

  const handleToggleGateVoltage = () => {
    if (originalGateVoltage === null) {
      setOriginalGateVoltage(inputValues.vg);
      onInputChange('vg', 0);
    } else {
      onInputChange('vg', originalGateVoltage);
      setOriginalGateVoltage(null);
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="mosfetName">MOSFET:</label>
        <select
          id="mosfetName"
          value={mosfetName}
          onChange={(e) => {
            const selectedMosfet = mosfetData.mosfets['n-channel'][e.target.value];
            if (selectedMosfet) {
              onDetailsChange(e.target.value, selectedMosfet);
            }
          }}
        >
          <option value="">Select a MOSFET...</option>
          {Object.keys(mosfetData.mosfets['n-channel']).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <div className="inputs">
          {mosfetDetails && (
            <>
              <div>
                <label htmlFor="vth">
                  Threshold Voltage (V<sub>th</sub>):
                </label>
                <input type="number" id="vth" value={mosfetDetails.vth} readOnly />
              </div>
              <div>
                <label htmlFor="rds_on">
                  R<sub>DS(on)</sub> (Ohms):
                </label>
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
            <label htmlFor="vg">
              Gate Voltage (V<sub>G</sub>):
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" id="vg" name="vg" value={inputValues.vg} onChange={handleInputChange} />
              <button type="button" onClick={handleToggleGateVoltage} style={{ marginLeft: '10px' }}>
                Toggle Gate Voltage
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="vcc">
              VCC (V<sub>CC</sub>):
            </label>
            <input type="number" id="vcc" name="vcc" value={inputValues.vcc} onChange={handleInputChange} />
          </div>
        </div>
        <div className="check-conduction-button">
          <button type="button" onClick={() => checkConduction('n-channel', inputValues, mosfetDetails, handleUpdateDescription)}>
            Check Conduction
          </button>
        </div>
        {/* Render Description component */}
        <Description
          description={description}
          conducting={conducting}
          voltageAcrossLoad={voltageAcrossLoad}
          powerDissipated={powerDissipated}
          currentThroughLoad={currentThroughLoad}
          vgs={vgs}
          id={id}
          vd={vd}
          conductionPercentage={conductionPercentage}
          powerDissipationIncrease={powerDissipationIncrease}
        />
      </div>
    </div>
  );
}

export default NChannelMosfetConfiguration;
