'use client';

/**
 * Board Info Panel Component
 *
 * Displays connected uCAN board capabilities and features
 * Shows different information based on hardware (RP2040, SAMD51, ESP32)
 */

import React, { useState, useEffect } from 'react';
import { BoardCapabilities, SerialConfig, ActionRule } from '../types';
import CollapsiblePanel from './CollapsiblePanel';
import Tooltip from '@/lib/utils/Tooltip';
import { loadLastDevice, formatDeviceName, isMatchingDevice, type StoredDeviceInfo } from '../utils/deviceStorage';
import { isSerialSupported, getAuthorizedPorts } from '../core/serialBridge';

interface BoardInfoPanelProps {
  capabilities: BoardCapabilities | undefined;
  isConnected: boolean;
  onSendCommand?: (command: string) => Promise<void>;
  onDisconnect?: () => Promise<void>;
  onConnect?: (port?: SerialPort, config?: SerialConfig) => Promise<void>;
  rules?: ActionRule[];
  onEditRule?: (rule: ActionRule) => void;
  onDeleteRule?: (ruleId: number) => Promise<void>;
  onClearAllRules?: () => Promise<void>;
  recentlyFiredRules?: Map<number, number>;
}

export default function BoardInfoPanel({ capabilities, isConnected, onSendCommand, onDisconnect, onConnect, rules, onEditRule, onDeleteRule, onClearAllRules, recentlyFiredRules }: BoardInfoPanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [filterCanId, setFilterCanId] = useState('');
  const [filterMask, setFilterMask] = useState('');
  const [lastDevice, setLastDevice] = useState<StoredDeviceInfo | null>(null);
  const [lastDevicePort, setLastDevicePort] = useState<SerialPort | null>(null);
  const [authorizedPorts, setAuthorizedPorts] = useState<SerialPort[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Helper to check if a rule was recently fired (blink effect - 600ms)
  const isRuleRecentlyFired = (ruleId: number): boolean => {
    if (!recentlyFiredRules) return false;
    const timestamp = recentlyFiredRules.get(ruleId);
    if (!timestamp) return false;
    return Date.now() - timestamp < 600; // 600ms blink window
  };

  // Force re-render every 50ms to update the blink animation state
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!recentlyFiredRules || recentlyFiredRules.size === 0) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 50); // Faster updates for snappier animation

    return () => clearInterval(interval);
  }, [recentlyFiredRules]);

  useEffect(() => {
    if (!isConnected && isSerialSupported()) {
      // Load last device from localStorage
      const stored = loadLastDevice();
      setLastDevice(stored);

      // Load authorized ports
      getAuthorizedPorts().then(ports => {
        setAuthorizedPorts(ports);

        // Find the port that matches the last device
        if (stored) {
          const matchingPort = ports.find(port => isMatchingDevice(port, stored));
          setLastDevicePort(matchingPort || null);
        }
      });
    }
  }, [isConnected]);

  const handleQuickConnect = async (port: SerialPort) => {
    if (!onConnect) return;
    setIsConnecting(true);
    try {
      await onConnect(port);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
        <div>
          <p className="text-gray-500 text-sm font-medium">No board connected</p>
          <p className="text-gray-600 text-xs mt-1">Connect to a uCAN device to view capabilities</p>
        </div>

        {/* Last Connected Device - Quick Connect */}
        {onConnect && lastDevice && lastDevicePort && (
          <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded">
            <p className="text-xs text-blue-400 mb-2">💾 Last Connected</p>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-white font-medium truncate">
                  {formatDeviceName(lastDevice)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(lastDevice.lastConnected).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleQuickConnect(lastDevicePort)}
                disabled={isConnecting}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors text-sm"
              >
                {isConnecting ? '⏳ Connecting...' : '⚡ Quick Connect'}
              </button>
            </div>
          </div>
        )}

        {/* Other authorized ports */}
        {onConnect && authorizedPorts.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              {lastDevice && lastDevicePort ? 'Other Devices:' : 'Previously Connected:'}
            </p>
            <div className="space-y-1">
              {authorizedPorts
                .filter(port => !lastDevice || !isMatchingDevice(port, lastDevice))
                .map((port, index) => {
                  const info = port.getInfo();
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickConnect(port)}
                      disabled={isConnecting}
                      className="w-full px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-300 rounded border border-gray-600 transition-colors text-left font-mono"
                    >
                      VID: 0x{info.usbVendorId?.toString(16).toUpperCase().padStart(4, '0')}, PID: 0x{info.usbProductId?.toString(16).toUpperCase().padStart(4, '0')}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!capabilities) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-green-400 animate-pulse">🟢</span>
          <div>
            <p className="text-green-400 text-sm font-medium">Connected</p>
            <p className="text-gray-500 text-xs mt-1">Loading board capabilities...</p>
          </div>
        </div>
        {onDisconnect && (
          <button
            onClick={onDisconnect}
            className="w-full mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors text-sm"
          >
            Disconnect
          </button>
        )}
      </div>
    );
  }

  const handleEditName = () => {
    setDeviceName(capabilities.board || '');
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
                <div className="text-base font-semibold text-white">{capabilities.board}</div>
                <p className="text-xs text-gray-400 mt-0.5">{capabilities.chip}</p>
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
      {capabilities.can && (
        <Tooltip
          text={`CAN Controller Info
━━━━━━━━━━━━━━━━━━━━
Controllers: ${capabilities.can.controllers || 1}
Max Bitrate: ${capabilities.can.max_bitrate ? `${capabilities.can.max_bitrate} bps` : 'Unknown'}
FD Capable: ${capabilities.can.fd_capable ? 'Yes' : 'No'}
Filters: ${capabilities.can.filters || 'N/A'}`}
          position="left"
        >
          <div className="bg-gray-950 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">CAN Controller</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-400">
                {capabilities.can.controllers || 1} Controller{(capabilities.can.controllers || 1) > 1 ? 's' : ''}
              </span>
              {capabilities.can.fd_capable && (
                <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">FD</span>
              )}
            </div>
          </div>
        </Tooltip>
      )}

      {/* CAN Configuration */}
      {onSendCommand && (
        <div className="space-y-3">
          {/* Bitrate */}
          <div className="bg-gray-950 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">CAN Bitrate</div>
            <select
              onChange={async (e) => {
                if (e.target.value && onSendCommand) {
                  await onSendCommand(`config:baudrate:${e.target.value}`);
                }
              }}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
              defaultValue=""
            >
              <option value="">Change bitrate...</option>
              <option value="125000">125 kbps</option>
              <option value="250000">250 kbps</option>
              <option value="500000">500 kbps (Default)</option>
              <option value="1000000">1000 kbps (1 Mbps)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">⚠️ Changing bitrate will restart CAN bus</p>
          </div>

          {/* Hardware Filter */}
          <div className="bg-gray-950 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Hardware CAN ID Filter</div>
            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  value={filterCanId}
                  onChange={(e) => setFilterCanId(e.target.value)}
                  placeholder="Filter ID (e.g., 0x500)"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={filterMask}
                  onChange={(e) => setFilterMask(e.target.value)}
                  placeholder="Mask (e.g., 0x700)"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={async () => {
                  if (filterCanId && filterMask && onSendCommand) {
                    await onSendCommand(`config:filter:${filterCanId}:${filterMask}`);
                    setFilterCanId('');
                    setFilterMask('');
                  }
                }}
                disabled={!filterCanId || !filterMask}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
              >
                Apply Filter
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">🔧 Reduces CPU load by filtering in hardware</p>
          </div>
        </div>
      )}

      {/* Hardware Resources */}
      <div>
        <div className="text-xs text-gray-500 mb-2">Hardware Resources</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-950 border border-gray-800 rounded p-2">
            <div className="text-xs text-gray-500">GPIO Pins</div>
            <div className="text-lg font-bold text-white">{capabilities.gpio?.total || capabilities.gpioCount || 0}</div>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded p-2">
            <div className="text-xs text-gray-500">PWM Channels</div>
            <div className="text-lg font-bold text-white">{capabilities.gpio?.pwm || capabilities.pwmCount || 0}</div>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded p-2">
            <div className="text-xs text-gray-500">ADC Channels</div>
            <div className="text-lg font-bold text-white">{capabilities.gpio?.adc || capabilities.adcCount || 0}</div>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded p-2">
            <div className="text-xs text-gray-500">DAC Channels</div>
            <div className="text-lg font-bold text-white">{capabilities.gpio?.dac || capabilities.dacCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Memory */}
      {(capabilities.flash_kb || capabilities.ram_kb) && (
        <div>
          <div className="text-xs text-gray-500 mb-2">Memory</div>
          <div className="space-y-1">
            {capabilities.flash_kb && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Flash:</span>
                <span className="text-white font-mono">{capabilities.flash_kb} KB</span>
              </div>
            )}
            {capabilities.ram_kb && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">RAM:</span>
                <span className="text-white font-mono">{capabilities.ram_kb} KB</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NeoPixel (if available) */}
      {capabilities.neopixel && capabilities.neopixelPin !== undefined && (
        <div className="bg-purple-600/10 border border-purple-500/30 rounded p-3">
          <div className="text-xs text-purple-400 mb-1">Built-in NeoPixel</div>
          <div className="text-sm text-gray-300">
            Data Pin: {capabilities.neopixelPin}
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

      {/* Active Rules List */}
      {rules && rules.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
            <span>Active Rules</span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded">
                {rules.length} / {capabilities.max_rules}
              </span>
              {onClearAllRules && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`Clear all ${rules.length} rules?`)) {
                      await onClearAllRules();
                    }
                  }}
                  className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 px-2 py-0.5 rounded transition-colors"
                  title="Clear all rules"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          <div className="space-y-1">
            {rules.map((rule) => {
              const isFiring = isRuleRecentlyFired(rule.id);
              const tooltipText = `Rule #${rule.id}: ${rule.actionType}
━━━━━━━━━━━━━━━━━━━━
Trigger: CAN ID 0x${rule.canId.toString(16).toUpperCase()}
Mask: 0x${rule.canMask.toString(16).toUpperCase()}
${rule.dataPattern ? `Data: ${rule.dataPattern}` : ''}
${rule.dataLength > 0 ? `Length: ${rule.dataLength} bytes` : ''}
━━━━━━━━━━━━━━━━━━━━
Status: ${isFiring ? '🔥 FIRING NOW!' : '⚡ Armed & Ready'}
Mode: ${rule.paramSource}
${rule.params ? `Params: ${rule.params.join(', ')}` : ''}`;

              return (
                <Tooltip key={rule.id} text={tooltipText} position="left">
                  <div
                    className={`w-full px-3 py-2 text-sm rounded border flex items-center justify-between group transition-all duration-100 ${
                      isFiring
                        ? 'bg-orange-600/20 border-orange-500/50 shadow-lg shadow-orange-500/20'
                        : 'bg-gray-800 border-gray-600'
                    }`}
                  >
                    <button
                      onClick={() => onEditRule?.(rule)}
                      className="flex-1 min-w-0 text-left hover:text-purple-400 transition-colors"
                    >
                      <div className={`font-medium truncate transition-colors duration-100 ${isFiring ? 'text-orange-300' : 'text-gray-300'}`}>
                        {rule.name}
                      </div>
                      <div className={`text-xs truncate mt-0.5 transition-colors duration-100 ${isFiring ? 'text-orange-400' : 'text-gray-500'}`}>
                        CAN ID: 0x{rule.canId.toString(16).toUpperCase().padStart(3, '0')} → {rule.actionType}
                      </div>
                    </button>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      {/* Always show flame, greyed out when not firing */}
                      <span
                        className={`text-base transition-all duration-100 ${
                          isFiring
                            ? 'opacity-100 scale-110 animate-pulse'
                            : 'opacity-30 grayscale'
                        }`}
                      >
                        🔥
                      </span>
                      <button
                        onClick={() => onEditRule?.(rule)}
                        className="p-1 text-gray-600 hover:text-purple-400 transition-colors"
                        title="Edit rule"
                      >
                        ✏️
                      </button>
                      {onDeleteRule && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete rule "${rule.name}"?`)) {
                              await onDeleteRule(rule.id);
                            }
                          }}
                          className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                          title="Delete rule"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      )}

      {/* Features */}
      {capabilities.features && capabilities.features.length > 0 && (
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
      )}

      {/* Disconnect Button */}
      {onDisconnect && (
        <button
          onClick={onDisconnect}
          className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <span>🔌</span>
          Disconnect
        </button>
      )}
      </div>
    </CollapsiblePanel>
  );
}
