'use client';

/**
 * Board Info Panel Component
 *
 * Displays connected uCAN board capabilities and features
 * Shows different information based on hardware (RP2040, SAMD51, ESP32)
 */

import React, { useState } from 'react';
import { BoardCapabilities } from '../types';
import CollapsiblePanel from './CollapsiblePanel';

interface BoardInfoPanelProps {
  capabilities: BoardCapabilities | undefined;
  isConnected: boolean;
  onSendCommand?: (command: string) => Promise<void>;
}

export default function BoardInfoPanel({ capabilities, isConnected, onSendCommand }: BoardInfoPanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [deviceName, setDeviceName] = useState('');

  if (!isConnected || !capabilities) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <p className="text-gray-500 text-sm">No board connected</p>
        <p className="text-gray-600 text-xs mt-2">Connect to a uCAN device to view capabilities</p>
      </div>
    );
  }

  const handleEditName = () => {
    setDeviceName(capabilities.device_name || capabilities.board || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (onSendCommand && deviceName.trim()) {
      try {
        await onSendCommand(`set:name:${deviceName.trim()}`);
        setIsEditingName(false);
      } catch (error) {
        console.error('Failed to set device name:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setDeviceName('');
  };

  // Format memory sizes
  const formatBytes = (bytes: number): string => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <CollapsiblePanel
      title="Board Information"
      icon="💾"
      defaultCollapsed={false}
    >
      <div className="space-y-4">
        {/* Device Name with Edit */}
        <div className="bg-gray-950 border border-gray-800 rounded p-3">
          <div className="text-xs text-gray-500 mb-2">Device Name</div>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
                placeholder="Enter device name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-white">{capabilities.device_name || capabilities.board}</div>
                <p className="text-xs text-gray-400 mt-0.5">{capabilities.chip} - {capabilities.manufacturer}</p>
              </div>
              {onSendCommand && (
                <button
                  onClick={handleEditName}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded transition-colors flex items-center gap-1"
                >
                  ✏️ Edit
                </button>
              )}
            </div>
          )}
        </div>

      {/* CAN Controller */}
      <div className="bg-gray-950 border border-gray-800 rounded p-3">
        <div className="text-xs text-gray-500 mb-1">CAN Controller</div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${capabilities.can.hardware ? 'text-green-400' : 'text-yellow-400'}`}>
            {capabilities.can.controller}
          </span>
          {capabilities.can.hardware && (
            <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded">Hardware</span>
          )}
          {!capabilities.can.hardware && (
            <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded">Software</span>
          )}
        </div>
      </div>

      {/* Hardware Resources */}
      <div>
        <div className="text-xs text-gray-500 mb-2">Hardware Resources</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-950 border border-gray-800 rounded p-2">
            <div className="text-xs text-gray-500">GPIO Pins</div>
            <div className="text-lg font-bold text-white">{capabilities.gpio}</div>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded p-2">
            <div className="text-xs text-gray-500">PWM Channels</div>
            <div className="text-lg font-bold text-white">{capabilities.pwm}</div>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded p-2">
            <div className="text-xs text-gray-500">ADC Channels</div>
            <div className="text-lg font-bold text-white">{capabilities.adc}</div>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded p-2">
            <div className="text-xs text-gray-500">DAC Channels</div>
            <div className="text-lg font-bold text-white">{capabilities.dac}</div>
          </div>
        </div>
      </div>

      {/* Memory */}
      <div>
        <div className="text-xs text-gray-500 mb-2">Memory</div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Flash:</span>
            <span className="text-white font-mono">{formatBytes(capabilities.memory.flash)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">RAM:</span>
            <span className="text-white font-mono">{formatBytes(capabilities.memory.ram)}</span>
          </div>
          {capabilities.memory.storage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Storage:</span>
              <span className="text-white font-mono">{formatBytes(capabilities.memory.storage)}</span>
            </div>
          )}
        </div>
      </div>

      {/* NeoPixel (if available) */}
      {capabilities.neopixel && (
        <div className="bg-purple-600/10 border border-purple-500/30 rounded p-3">
          <div className="text-xs text-purple-400 mb-1">Built-in NeoPixel</div>
          <div className="text-sm text-gray-300">
            Data Pin: {capabilities.neopixel.pin} | Power Pin: {capabilities.neopixel.power_pin}
          </div>
        </div>
      )}

      {/* Max Action Rules */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded p-3">
        <div className="text-xs text-blue-400 mb-1">Action Rules</div>
        <div className="text-lg font-bold text-white">
          {capabilities.max_rules} <span className="text-sm font-normal text-gray-400">max rules</span>
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="text-xs text-gray-500 mb-2">Features</div>
        <div className="flex flex-wrap gap-1.5">
          {capabilities.features.map((feature) => (
            <span
              key={feature}
              className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
      </div>
    </CollapsiblePanel>
  );
}
