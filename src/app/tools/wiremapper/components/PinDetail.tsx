'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Pin } from '../types';
import debounce from 'lodash.debounce';

export const PinDetail: React.FC = () => {
  const { connectors, selectedPin, updatePinDetailsAndNet, setSelectedPin } = useWireMapperStore();
  const [pinData, setPinData] = useState<Pin | null>(null);

  useEffect(() => {
    // Guard against null selectedPin first
    if (!selectedPin) {
      setPinData(null);
      return;
    }
    // Perform null check first
    if (!selectedPin.connectorId || selectedPin.pinPos === null) {
      setPinData(null);
      return;
    }
    const connector = connectors.find(c => c.id === selectedPin.connectorId);
    const pin = connector?.pins.find(p => p.pos === selectedPin.pinPos);
    if (pin) {
      setPinData({ ...pin, config: pin.config ?? {} });
    } else {
      setPinData(null);
    }
  }, [selectedPin, connectors]);

  const debouncedUpdatePin = useCallback(
    debounce((connectorId: string, pinPos: number, updates: Partial<Pin>) => {
      const { config: configUpdates, ...topLevelUpdates } = updates;
      const currentPin = connectors.find(c => c.id === connectorId)?.pins.find(p => p.pos === pinPos);
      const currentConfig = currentPin?.config ?? {};
      const newConfig = { ...currentConfig, ...configUpdates };

      updatePinDetailsAndNet(connectorId, pinPos, { ...topLevelUpdates, config: newConfig });
    }, 300),
    [connectors, updatePinDetailsAndNet]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Guard against null selectedPin
    if (!selectedPin) return;
    setPinData(prev => {
      if (!prev) return null;
      const updatedPin = { ...prev, [name]: value };
      if (selectedPin.connectorId && selectedPin.pinPos !== null) {
        debouncedUpdatePin(selectedPin.connectorId, selectedPin.pinPos, { [name]: value });
      }
      return updatedPin;
    });
  };

  const handleColorTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Guard against null selectedPin
    if (!selectedPin) return;
    setPinData(prev => {
      if (!prev) return null;
      const updatedPin = { ...prev, config: { ...prev.config, color: value } };
      if (selectedPin.connectorId && selectedPin.pinPos !== null) {
        debouncedUpdatePin(selectedPin.connectorId, selectedPin.pinPos, { config: { color: value } });
      }
      return updatedPin;
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Guard against null selectedPin
    if (!selectedPin) return;
    setPinData(prev => {
      if (!prev) return null;
      const updatedPin = { ...prev, config: { ...prev.config, color: value } };
      if (selectedPin.connectorId && selectedPin.pinPos !== null) {
        // Use debounced update for consistency with other fields
        debouncedUpdatePin(selectedPin.connectorId, selectedPin.pinPos, { config: { color: value } });
      }
      return updatedPin;
    });
  };

  if (!pinData) {
    return <div className="text-center text-gray-500 p-4">Select a pin to view details.</div>;
  }

  return (
    <div className="p-4 bg-gray-800 text-white h-full overflow-y-auto space-y-4">
      <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Pin {pinData.number ?? pinData.pos} Details</h3>

      {/* Pin Name Input */}
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

      {/* Net Name Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Net Name</label>
        <input
          type="text"
          name="netName"
          value={pinData.netName ?? ''}
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
              value={pinData.config?.color ?? '#ffffff'}
              onChange={handleColorChange}
              className="bg-gray-800 border border-gray-700 rounded w-10 h-10 cursor-pointer"
            />
            <input
              type="text"
              name="color"
              value={pinData.config?.color ?? '#ffffff'}
              onChange={handleColorTextChange}
              className="flex-1 ml-2 bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>
        </div>
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea
          name="desc"
          value={pinData.desc ?? ''}
          onChange={handleChange}
          rows={3}
          placeholder="Optional description for this pin."
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      {/* Voltage Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Voltage</label>
        <input
          type="text"
          name="voltage"
          value={pinData.voltage ?? ''}
          onChange={handleChange}
          placeholder="e.g., 5V, 3.3V"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      {/* Signal Type Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Signal Type</label>
        <input
          type="text"
          name="signalType"
          value={pinData.signalType ?? ''}
          onChange={handleChange}
          placeholder="e.g., Analog In, Digital Out, PWM"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      <button
        onClick={() => setSelectedPin(null, null)}
        className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded shadow-md transition-colors"
      >
        Clear Selection
      </button>
    </div>
  );
};
