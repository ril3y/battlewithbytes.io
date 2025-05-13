'use client';

import React, { useState, useEffect } from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Pin } from '../types';

export const PinDetail: React.FC = () => {
  const { connectors, selectedPin, updatePinDetailsAndNet, setSelectedPin } = useWireMapperStore();
  const [pinData, setPinData] = useState<Pin | null>(null);

  // Find the selected pin when the component mounts or selection changes
  useEffect(() => {
    // Add explicit check for selectedPin
    if (selectedPin && selectedPin.connectorId && selectedPin.pinPos) {
      const connector = connectors.find(c => c.id === selectedPin.connectorId);
      if (connector) {
        const pin = connector.pins.find(p => p.pos === selectedPin.pinPos);
        if (pin) {
          setPinData({ ...pin });
          return;
        }
      }
    }
    
    setPinData(null);
  }, [selectedPin, connectors]);

  // Early return if no valid pin data or connector ID
  if (!pinData || !selectedPin?.connectorId) { // Add optional chaining for safety
    return <div className="text-gray-500">No pin selected</div>;
  }

  // Since we passed the check above, selectedPin and selectedPin.connectorId are guaranteed to be non-null here.
  const connector = connectors.find(c => c.id === selectedPin.connectorId);
  if (!connector) return null; // Connector might have been deleted

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'netName' ? value.trim() : value;
    setPinData(prev => prev ? { ...prev, [name]: processedValue } : null);
  };

  const handleSave = () => {
    // Add explicit check for selectedPin and its properties
    if (pinData && selectedPin && selectedPin.connectorId && selectedPin.pinPos) {
      updatePinDetailsAndNet(selectedPin.connectorId, selectedPin.pinPos, pinData);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setPinData(prev => prev ? { ...prev, color } : null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-400 text-sm">Connector:</span>
          <span className="text-white ml-2">{connector.name}</span>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Pin:</span>
          <span className="text-white ml-2">{pinData.pos}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Pin Name</label>
        <input
          type="text"
          name="name"
          value={pinData.name}
          onChange={handleChange}
          placeholder="e.g., 12V Power"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Net Name</label>
        <input
          type="text"
          name="netName"
          value={pinData.netName || ''}
          onChange={handleChange}
          placeholder="e.g., PWR_RAIL, CAN_H"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      <div className="flex space-x-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Color</label>
          <div className="flex items-center">
            <input
              type="color"
              name="color"
              value={pinData.color}
              onChange={handleColorChange}
              className="bg-gray-800 border border-gray-700 rounded w-10 h-10 cursor-pointer"
            />
            <input
              type="text"
              name="color"
              value={pinData.color}
              onChange={handleChange}
              className="flex-1 ml-2 bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea
          name="desc"
          value={pinData.desc || ''}
          onChange={handleChange}
          rows={2}
          placeholder="Optional description"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Voltage</label>
          <input
            type="text"
            name="voltage"
            value={pinData.voltage || ''}
            onChange={handleChange}
            placeholder="e.g., 12V"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Signal Type</label>
          <input
            type="text"
            name="signalType"
            value={pinData.signalType || ''}
            onChange={handleChange}
            placeholder="e.g., CAN_H"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
          />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => setSelectedPin(null, null)}
          className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600"
        >
          Clear Selection
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 bg-green-900 text-green-300 text-sm rounded hover:bg-green-800"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
