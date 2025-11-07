'use client';

import React from 'react';

interface MosfetTypeSelectorProps {
  mosfetType: string;
  onTypeChange: (type: string) => void;
}

export default function MosfetTypeSelector({ mosfetType, onTypeChange }: MosfetTypeSelectorProps) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">MOSFET Type</h3>
      <div className="type-selector">
        <button
          className={`type-button ${mosfetType === 'n-channel' ? 'active' : ''}`}
          onClick={() => onTypeChange('n-channel')}
        >
          N-Channel
        </button>
        <button
          className={`type-button ${mosfetType === 'p-channel' ? 'active' : ''}`}
          onClick={() => onTypeChange('p-channel')}
        >
          P-Channel
        </button>
      </div>
    </div>
  );
}
