import React, { useState } from 'react';
import NChannelMosfetConfiguration from './NChannelMosfetConfiguration';
import PChannelMosfetConfiguration from './PChannelMosfetConfiguration';
import MosfetTypeSelector from './MosfetTypeSelector';
import MosfetDiagram from './MosfetDiagram';
import Description from './Description';
import './css/styles.css';

function App() {
  const [mosfetType, setMosfetType] = useState('n-channel');
  const [mosfetName, setMosfetName] = useState('');
  const [mosfetDetails, setMosfetDetails] = useState({ vth: '', rds_on: '' });
  const [inputValues, setInputValues] = useState({
    vg: '',
    vcc: '',
    vd: '',
    vs: '0',
    loadResistance: ''
  });
  const [description, setDescription] = useState('');
  const [conducting, setConducting] = useState(null);
  const [voltageAcrossLoad, setVoltageAcrossLoad] = useState('');
  const [powerDissipated, setPowerDissipated] = useState('');
  const [currentThroughLoad, setCurrentThroughLoad] = useState('');
  const [vgs, setVgs] = useState('');
  const [id, setId] = useState('');
  const [vd, setVd] = useState('');

  const handleMosfetTypeChange = (type) => {
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
  };

  const handleMosfetDetailsChange = (name, details) => {
    setMosfetName(name);
    setMosfetDetails(details);
  };

  const handleInputChange = (name, value) => {
    setInputValues({ ...inputValues, [name]: value });
  };

  const updateDescription = (desc, isConducting, voltageAcrossLoad, powerDissipated, currentThroughLoad, vgs, id, vd) => {
    setDescription(desc);
    setConducting(isConducting);
    setVoltageAcrossLoad(voltageAcrossLoad);
    setPowerDissipated(powerDissipated);
    setCurrentThroughLoad(currentThroughLoad);
    setVgs(vgs);
    setId(id);
    setVd(vd);
  };

  return (
    <>
      <div className="container">
        <div className="left-section">
          <MosfetTypeSelector mosfetType={mosfetType} onTypeChange={handleMosfetTypeChange} />
          <MosfetDiagram mosfetType={mosfetType} inputValues={inputValues} />
        </div>
        <div className="right-section">
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
      />
    </>
  );
}

export default App;
