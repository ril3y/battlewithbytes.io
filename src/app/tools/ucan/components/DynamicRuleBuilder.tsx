'use client';

/**
 * Dynamic Rule Builder Component
 *
 * Builds action rules dynamically based on ACTIONDEF data from firmware
 * Supports both fixed parameter mode and candata extraction mode
 */

import React, { useState } from 'react';
import { ActionDefinition, ActionParameter } from '../types';

interface DynamicRuleBuilderProps {
  actionDefinitions: ActionDefinition[];
  onAddRule: (command: string) => Promise<void>;
  isConnected: boolean;
}

export default function DynamicRuleBuilder({
  actionDefinitions,
  onAddRule,
  isConnected
}: DynamicRuleBuilderProps) {
  const [selectedAction, setSelectedAction] = useState<ActionDefinition | null>(null);
  const [canId, setCanId] = useState('0x100');
  const [canMask, setCanMask] = useState('0xFFFFFFFF');
  const [paramSource, setParamSource] = useState<'fixed' | 'candata'>('candata');
  const [fixedParams, setFixedParams] = useState<Record<string, string>>({});

  const handleActionSelect = (actionId: number) => {
    const action = actionDefinitions.find(a => a.i === actionId);
    setSelectedAction(action || null);
    setFixedParams({});
  };

  const handleAddRule = async () => {
    if (!selectedAction) return;

    // Build the action:add command
    // Format: action:add:{RULE_ID}:{CAN_ID}:{MASK}:{EXTENDED}:{PRIORITY}:{INDEX}:{ACTION_NAME}:{PARAM_SOURCE}:{PARAMS...}

    const ruleId = 0; // Auto-assign
    const extended = ''; // Empty for standard
    const priority = ''; // Default
    const index = ''; // Default

    let command = `action:add:${ruleId}:${canId}:${canMask}:${extended}:${priority}:${index}:${selectedAction.n}:${paramSource}`;

    // Add fixed parameters if in fixed mode
    if (paramSource === 'fixed') {
      const paramValues = selectedAction.p.map(param => fixedParams[param.n] || '0');
      command += ':' + paramValues.join(':');
    }

    console.log('📤 Sending rule command:', command);
    await onAddRule(command);

    // Reset form
    setCanId('0x100');
    setFixedParams({});
  };

  if (actionDefinitions.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
        <p className="text-gray-500">No action definitions available</p>
        <p className="text-sm text-gray-600 mt-2">Connect to a uCAN device to load actions</p>
      </div>
    );
  }

  // Group actions by category
  const actionsByCategory = actionDefinitions.reduce((acc, action) => {
    const category = action.c || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(action);
    return acc;
  }, {} as Record<string, ActionDefinition[]>);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">⚡ Create Action Rule</h3>
        <p className="text-sm text-gray-400">Configure the board to automatically respond to CAN messages</p>
      </div>

      {/* Action Selection */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Select Action</label>
        <select
          value={selectedAction?.i || ''}
          onChange={(e) => handleActionSelect(parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
        >
          <option value="">Choose an action...</option>
          {Object.entries(actionsByCategory).map(([category, actions]) => (
            <optgroup key={category} label={category}>
              {actions.map(action => (
                <option key={action.i} value={action.i}>
                  {action.n} - {action.d}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {selectedAction && (
        <>
          {/* Trigger Configuration */}
          <div className="bg-gray-950 border border-gray-800 rounded p-3">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              🎯 Trigger Configuration
              {selectedAction.trig && (
                <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">
                  {selectedAction.trig}
                </span>
              )}
            </h4>

            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">CAN ID to Match</label>
                <input
                  type="text"
                  value={canId}
                  onChange={(e) => setCanId(e.target.value)}
                  placeholder="0x100"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">CAN ID Mask</label>
                <input
                  type="text"
                  value={canMask}
                  onChange={(e) => setCanMask(e.target.value)}
                  placeholder="0xFFFFFFFF"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-600 mt-1">Use 0xFFFFFFFF for exact match</p>
              </div>
            </div>
          </div>

          {/* Parameter Source Selection */}
          <div className="bg-gray-950 border border-gray-800 rounded p-3">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">📊 Parameter Source</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="candata"
                  checked={paramSource === 'candata'}
                  onChange={(e) => setParamSource(e.target.value as 'candata')}
                  className="w-4 h-4"
                />
                <div>
                  <div className="text-sm text-white">Extract from CAN Data</div>
                  <div className="text-xs text-gray-500">
                    Parameters come from CAN message bytes (one rule, infinite values)
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="fixed"
                  checked={paramSource === 'fixed'}
                  onChange={(e) => setParamSource(e.target.value as 'fixed')}
                  className="w-4 h-4"
                />
                <div>
                  <div className="text-sm text-white">Fixed Values</div>
                  <div className="text-xs text-gray-500">
                    Hardcode parameter values (simple, predictable)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Parameters */}
          {selectedAction.p && selectedAction.p.length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded p-3">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">🔧 Action Parameters</h4>

              {paramSource === 'candata' ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-3">
                    Parameters will be extracted from CAN message data bytes:
                  </p>
                  <div className="bg-black/30 rounded p-3 font-mono text-xs">
                    {selectedAction.p.map((param, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1">
                        <span className="text-gray-400">{param.n}:</span>
                        <span className="text-green-400">
                          Byte {param.b}
                          {param.o !== 0 && `, Bit ${param.o}`}
                          {param.l !== 8 && `, ${param.l} bits`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedAction.p.map((param) => (
                    <div key={param.n}>
                      <label className="block text-xs text-gray-500 mb-1">
                        {param.n}
                        {param.r && <span className="text-gray-600"> ({param.r})</span>}
                        {param.role && (
                          <span className="ml-2 text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">
                            {param.role}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={fixedParams[param.n] || ''}
                        onChange={(e) => setFixedParams({
                          ...fixedParams,
                          [param.n]: e.target.value
                        })}
                        placeholder={getParameterPlaceholder(param)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Rule Button */}
          <button
            onClick={handleAddRule}
            disabled={!isConnected || !canId}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
          >
            ➕ Add Rule
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Get placeholder text for parameter input based on type and range
 */
function getParameterPlaceholder(param: ActionParameter): string {
  // Parse range if available
  if (param.r) {
    const rangeParts = param.r.split('-');
    if (rangeParts.length === 2) {
      const min = parseInt(rangeParts[0]);
      const max = parseInt(rangeParts[1]);
      return `${min} to ${max}`;
    }
  }

  // Type-based defaults
  const typeNames = ['uint8', 'uint16', 'uint32', 'int8', 'int16', 'int32', 'float', 'bool'];
  const typeName = typeNames[param.t] || 'value';

  return `Enter ${typeName} value`;
}
