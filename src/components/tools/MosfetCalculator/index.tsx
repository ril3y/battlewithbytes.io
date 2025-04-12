'use client';

import React, { useState, useCallback } from 'react';
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
    // Clear results when changing MOSFET type
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

  // Use useCallback to prevent unnecessary re-renders and ensure the description persists
  const updateDescription = useCallback((
    desc: string, 
    isConducting: boolean | null, 
    voltageAcrossLoad: string, 
    powerDissipated: string, 
    currentThroughLoad: string, 
    vgs: string, 
    id: string, 
    vd: string
  ) => {
    setDescription(desc);
    setConducting(isConducting);
    setVoltageAcrossLoad(voltageAcrossLoad);
    setPowerDissipated(powerDissipated);
    setCurrentThroughLoad(currentThroughLoad);
    setVgs(vgs);
    setId(id);
    setVd(vd);
  }, []);

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
              updateDescription={updateDescription}
            />
          ) : (
            <PChannelMosfetConfiguration
              mosfetName={mosfetName}
              mosfetDetails={mosfetDetails}
              inputValues={inputValues}
              onDetailsChange={handleMosfetDetailsChange}
              onInputChange={handleInputChange}
              updateDescription={updateDescription}
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
