import React from 'react';
import Image from 'next/image';
import nChannelImg from './img/nchannel.png';
import pChannelImg from './img/pchannel.png';

function MosfetDiagram({ mosfetType, inputValues }) {
  const { vg, vcc, vd, vs } = inputValues;
  const mosfetImageSrc = mosfetType === 'n-channel' ? nChannelImg : pChannelImg;

  return (
    <div className="mosfet-diagram">
      <div className="image-container relative">
        <Image 
          id="mosfetImage" 
          className="scaled-image" 
          src={mosfetImageSrc} 
          alt="MOSFET Diagram"
          width={500}
          height={300}
          priority
        />
        <div id="gateValue" className={`overlay ${mosfetType}_gate_green`}>{vg}V</div>
        {mosfetType === 'n-channel' && (
          <div id="vccValue" className={`overlay nchannel-vcc`}>{vcc}V</div>
        )}
        <div id="drainValue" className={`overlay ${mosfetType}_drain_grey`}>{vd}V</div>
        <div id="sourceValue" className={`overlay ${mosfetType}_source_orange`}>{vs}V</div>
        <div id="conductingStatus" className="overlay conducting-status"></div>
        <div id="vgsValue" className="overlay vgs-value"></div>
      </div>
    </div>
  );
}

export default MosfetDiagram;
