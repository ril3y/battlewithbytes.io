'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Pin } from '../types';
import debounce from 'lodash.debounce';

interface LocalPinData extends Pin {
  connectorId: string;
  originalPos: number; // To track if the viewed pin identity changes
}

export const PinDetail: React.FC = () => {
  const { connectors, selectedPin, updatePinDetailsAndNet, setSelectedPin } = useWireMapperStore();
  const [pinData, setPinData] = useState<LocalPinData | null>(null);

  useEffect(() => {
    if (!selectedPin || !selectedPin.connectorId || selectedPin.pinPos === null) {
      setPinData(null);
      return;
    }

    const storeConnector = connectors.find(c => c.id === selectedPin.connectorId);
    const storePin = storeConnector?.pins.find(p => p.pos === selectedPin.pinPos);

    if (!storePin) {
      setPinData(null); 
      return;
    }

    // If selectedPin identity changes, or if pinData is null (initial load for current selection)
    if (!pinData || pinData.connectorId !== selectedPin.connectorId || pinData.originalPos !== selectedPin.pinPos) {
      setPinData({
        ...storePin,
        connectorId: selectedPin.connectorId,
        originalPos: selectedPin.pinPos,
        config: storePin.config ?? {},
      });
    } else {
      // Pin identity is the same, pinData is populated. Compare and merge carefully.
      const activeElement = document.activeElement as HTMLElement;
      const focusedInputName = (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) 
                              ? (activeElement as HTMLInputElement).name 
                              : null;

      let newPinData = { ...pinData }; // Start with current local state
      let needsUpdate = false;

      // Fields to check for updates from storePin
      const fieldsToSync: (keyof Pin)[] = ['name', 'netName', 'desc', 'voltage', 'signalType'];

      fieldsToSync.forEach(field => {
        const storeValue = storePin[field];
        const localValue = pinData[field];
        // Use a more robust check for undefined/null vs empty string if needed
        const normalizedStoreValue = storeValue === undefined || storeValue === null ? "" : storeValue;
        const normalizedLocalValue = localValue === undefined || localValue === null ? "" : localValue;

        if (normalizedStoreValue !== normalizedLocalValue) {
          if (focusedInputName !== field) { // Only update if this specific field is NOT focused
            newPinData = { ...newPinData, [field]: storeValue };
            needsUpdate = true;
          }
        }
      });

      // Sync color (from config)
      const storeColor = storePin.config?.color;
      const localColor = pinData.config?.color;
      if (storeColor !== localColor) {
        if (focusedInputName !== 'color') { // Assuming color input is named 'color'
          newPinData.config = { ...newPinData.config, color: storeColor };
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        setPinData(newPinData);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPin, connectors]); // pinData is intentionally omitted from deps here to prevent potential update loops 
                                 // and to give local typing precedence. The logic above handles merging from `connectors` 
                                 // when `selectedPin` itself hasn't changed identity.

  const debouncedUpdatePin = useCallback(
    (connectorId: string, pinPos: number, updates: Partial<Pin>) => {
      const debouncedFn = debounce(() => {
        const { config: configUpdates, ...topLevelUpdates } = updates;
        const currentPin = connectors.find(c => c.id === connectorId)?.pins.find(p => p.pos === pinPos);
        const currentConfig = currentPin?.config ?? {};
        const newConfig = { ...currentConfig, ...configUpdates };

        updatePinDetailsAndNet(connectorId, pinPos, { ...topLevelUpdates, config: newConfig });
      }, 300);
      debouncedFn();
    },
    [connectors, updatePinDetailsAndNet]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!pinData || !selectedPin) return; 
    setPinData(prev => {
      if (!prev) return null;
      const updatedPin = { ...prev, [name]: value };
      debouncedUpdatePin(prev.connectorId, prev.originalPos, { [name]: value });
      return updatedPin;
    });
  };

  const handleColorTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (!pinData || !selectedPin) return;
    setPinData(prev => {
      if (!prev) return null;
      const updatedPin = { ...prev, config: { ...prev.config, color: value } };
      debouncedUpdatePin(prev.connectorId, prev.originalPos, { config: { color: value } });
      return updatedPin;
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (!pinData || !selectedPin) return;
    setPinData(prev => {
      if (!prev) return null;
      const updatedPin = { ...prev, config: { ...prev.config, color: value } };
      debouncedUpdatePin(prev.connectorId, prev.originalPos, { config: { color: value } });
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
