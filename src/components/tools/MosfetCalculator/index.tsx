'use client';

import React, { useState, useEffect } from 'react';
import { calculateNChannelConduction, calculatePChannelConduction } from './mosfetUtils';
import MosfetTypeSelector from './MosfetTypeSelector';
import MosfetDiagram from './MosfetDiagram';
import NChannelMosfetConfiguration from './NChannelMosfetConfiguration';
import PChannelMosfetConfiguration from './PChannelMosfetConfiguration';
import Description from './Description';
import './styles.css';

interface InputValues {
  vg: string;
  vcc: string;
  vd: string;
  vs: string;
  loadResistance: string;
}

interface MosfetDetails {
  vth: string;
  rds_on: string;
  vgs_th?: string;
  type?: string;
  [key: string]: string | undefined;
}

export default function MosfetCalculator() {
  const [mosfetType, setMosfetType] = useState<string>('n-channel');
  const [mosfetName, setMosfetName] = useState<string>('');
  const [mosfetDetails, setMosfetDetails] = useState<MosfetDetails>({ vth: '', rds_on: '' });
  const [inputValues, setInputValues] = useState<InputValues>({
    vg: '',
    vcc: '',
    vd: '',
    vs: '0',
    loadResistance: ''
  });
  const [description, setDescription] = useState<string>('');
  const [conducting, setConducting] = useState<boolean | null>(null);
  const [voltageAcrossLoad, setVoltageAcrossLoad] = useState<string>('');
  const [powerDissipated, setPowerDissipated] = useState<string>('');
  const [currentThroughLoad, setCurrentThroughLoad] = useState<string>('');
  const [vgs, setVgs] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [vd, setVd] = useState<string>('');

  const handleMosfetTypeChange = (type: string) => {
    setMosfetType(type);
    setMosfetName('');
    setMosfetDetails({ vth: '', rds_on: '' });
    setInputValues({
      vg: '',
      vcc: '',
      vd: '',
      vs: '0',
      loadResistance: ''
    });
    setDescription('');
    setConducting(null);
    setVoltageAcrossLoad('');
    setPowerDissipated('');
    setCurrentThroughLoad('');
    setVgs('');
    setId('');
    setVd('');
  };

  const handleMosfetDetailsChange = (name: string, details: MosfetDetails) => {
    setMosfetName(name);
    setMosfetDetails(details);
  };

  const handleInputChange = (name: string, value: string) => {
    setInputValues({ ...inputValues, [name]: value });
  };

  useEffect(() => {
    const vth = parseFloat(mosfetDetails.vth);
    const rds_on = parseFloat(mosfetDetails.rds_on);
    const vg = parseFloat(inputValues.vg);
    const vs = parseFloat(inputValues.vs);
    const vcc = parseFloat(inputValues.vcc);
    const loadResistance = parseFloat(inputValues.loadResistance);

    const hasRequiredDetails = !isNaN(vth) && !isNaN(rds_on);
    const hasRequiredInputs = !isNaN(vg) && !isNaN(vs) && !isNaN(loadResistance);
    const hasNChannelPower = mosfetType === 'n-channel' && !isNaN(vcc);
    const hasPChannelPower = mosfetType === 'p-channel';

    if (hasRequiredDetails && hasRequiredInputs && (hasNChannelPower || hasPChannelPower)) {
      let results;
      if (mosfetType === 'n-channel') {
        results = calculateNChannelConduction(vth, vg, vs, vcc, loadResistance, rds_on);
      } else {
        results = calculatePChannelConduction(vth, vg, vs, vcc, loadResistance, rds_on);
      }

      setDescription(results.description || '');
      setConducting(results.conducting);
      setVoltageAcrossLoad(results.voltageAcrossLoad || '');
      setPowerDissipated(results.powerDissipated || '');
      setCurrentThroughLoad(results.currentThroughLoad || '');
      setVgs(results.vgs || '');
      setId(results.id || '');
      setVd(results.vd || '');
    } else {
      setDescription('Please select a MOSFET and provide valid numeric input values.');
      setConducting(null);
      setVoltageAcrossLoad('');
      setPowerDissipated('');
      setCurrentThroughLoad('');
      setVgs('');
      setId('');
      setVd('');
    }
  }, [mosfetType, inputValues, mosfetDetails]);

  return (
    <div className="mosfet-calculator">
      <div className="mosfet-container">
        <div className="mosfet-left-section">
          <MosfetTypeSelector mosfetType={mosfetType} onTypeChange={handleMosfetTypeChange} />
          <MosfetDiagram mosfetType={mosfetType} inputValues={inputValues} />
        </div>
        <div className="mosfet-right-section">
          {mosfetType === 'n-channel' ? (
            <NChannelMosfetConfiguration
              mosfetName={mosfetName}
              mosfetDetails={mosfetDetails}
              inputValues={inputValues}
              onDetailsChange={handleMosfetDetailsChange}
              onInputChange={handleInputChange}
            />
          ) : (
            <PChannelMosfetConfiguration
              mosfetName={mosfetName}
              mosfetDetails={mosfetDetails}
              inputValues={inputValues}
              onDetailsChange={handleMosfetDetailsChange}
              onInputChange={handleInputChange}
            />
          )}
        </div>
      </div>
      <Description 
        description={description} 
        conducting={conducting} 
        voltageAcrossLoad={voltageAcrossLoad} 
        powerDissipated={powerDissipated} 
        currentThroughLoad={currentThroughLoad} 
        vgs={vgs}
        id={id}
        vd={vd}
        mosfetDetails={mosfetDetails}
      />
    </div>
  );
}
