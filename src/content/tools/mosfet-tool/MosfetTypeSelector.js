// MosfetTypeSelector.js

import React from 'react';

function MosfetTypeSelector({ mosfetType, onTypeChange }) {
  return (
    <div>
      <label htmlFor="mosfetType">MOSFET Type:</label>
      <select id="mosfetType" value={mosfetType === 'n-channel' ? 'nchannel' : 'pchannel'} onChange={(e) => onTypeChange(e.target.value === 'nchannel' ? 'n-channel' : 'p-channel')}>
        <option value="nchannel">N-Channel</option>
        <option value="pchannel">P-Channel</option>
      </select>
    </div>
  );
}

export default MosfetTypeSelector;
