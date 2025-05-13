'use client';

import React from 'react';
import { Pin } from '../types';

interface PinEditorProps {
  pins: Pin[];
  onPinUpdate: (updatedPin: Pin) => void;
  onToggleVisibility: (index: number) => void;
}

export const PinEditor: React.FC<PinEditorProps> = ({ pins, onPinUpdate, onToggleVisibility }) => {
  if (!pins || pins.length === 0) {
    return <p className="text-sm text-gray-500">No pins defined.</p>;
  }

  // Handle name input changes
  const handleNameChange = (index: number, newName: string) => {
    const pinToUpdate = pins.find(p => p.index === index);
    if (pinToUpdate) {
      onPinUpdate({ ...pinToUpdate, name: newName });
    }
  };

  return (
    <div className="p-4 border border-gray-700 rounded bg-gray-850 space-y-2">
      <h4 className="text-sm font-medium text-gray-400">Pin Configuration</h4>
      <p className="text-xs text-gray-500">Detailed pin editor UI will go here.</p>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> 
        {pins.map((pin) => (
          <div key={pin.index} className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
            <span className="text-sm font-mono text-gray-400 w-8 text-right">{pin.index}</span>
            <input
              type="text"
              value={pin.name || ''}
              onChange={(e) => handleNameChange(pin.index, e.target.value)}
              placeholder={`Pin ${pin.index} Name`}
              className="flex-grow bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            {/* --- Visibility Toggle Button --- */}
            <button
              onClick={() => onToggleVisibility(pin.index)}
              className={`w-16 text-xs px-2 py-1 rounded transition-colors
                ${pin.visible === false ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                                         : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}
            >
              {pin.visible === false ? 'Show' : 'Hide'}
            </button>
            {/* --- End Visibility Toggle Button --- */}
          </div>
        ))}
      </div>
    </div>
  );
};
