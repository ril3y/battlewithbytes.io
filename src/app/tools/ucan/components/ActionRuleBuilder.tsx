'use client';

/**
 * Action Rule Builder Component
 *
 * Dynamic UI for creating action rules based on board capabilities
 * Shows/hides options based on what the connected board supports
 */

import React, { useState, useEffect } from 'react';
import { ActionType, BoardCapabilities, ActionRule } from '../types';

interface ActionRuleBuilderProps {
  capabilities: BoardCapabilities | undefined;
  supportedActions: ActionType[];
  existingRules: ActionRule[];
  onAddRule: (rule: ActionRule) => void;
  onRemoveRule: (ruleId: number) => void;
  onClearAllRules?: () => void; // Clear all rules
  isConnected: boolean;
  prefilledCanId?: string; // Pre-fill CAN ID from context menu
  onClearPrefilledCanId?: () => void; // Clear the prefilled CAN ID after use
}

export default function ActionRuleBuilder({
  capabilities,
  supportedActions,
  existingRules,
  onAddRule,
  onRemoveRule,
  onClearAllRules,
  isConnected,
  prefilledCanId,
  onClearPrefilledCanId
}: ActionRuleBuilderProps) {
  const [canId, setCanId] = useState<string>('0x100');
  const [actionType, setActionType] = useState<ActionType | ''>('');
  const [paramSource, setParamSource] = useState<'fixed' | 'candata'>('fixed');
  const [pin, setPin] = useState<string>('13');
  const [pwmDuty, setPwmDuty] = useState<string>('128');
  const [neoR, setNeoR] = useState<string>('255');
  const [neoG, setNeoG] = useState<string>('0');
  const [neoB, setNeoB] = useState<string>('0');
  const [sendCanId, setSendCanId] = useState<string>('0x200');
  const [sendData, setSendData] = useState<string>('AA,BB,CC,DD');
  const [description, setDescription] = useState<string>('');
  const [highlightCanId, setHighlightCanId] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  // Auto-select first supported action when capabilities load
  useEffect(() => {
    if (supportedActions.length > 0 && !actionType) {
      setActionType(supportedActions[0]);
    }
  }, [supportedActions, actionType]);

  // Handle pre-filled CAN ID from context menu
  useEffect(() => {
    if (prefilledCanId) {
      setCanId(prefilledCanId);
      setHighlightCanId(true);
      // Show visual feedback that the field was updated
      console.log('CAN ID pre-filled from packet:', prefilledCanId);

      // Remove highlight after 1 second
      setTimeout(() => {
        setHighlightCanId(false);
      }, 1000);

      // Clear the prefilled value after a short delay
      if (onClearPrefilledCanId) {
        setTimeout(() => {
          onClearPrefilledCanId();
        }, 100);
      }
    }
  }, [prefilledCanId, onClearPrefilledCanId]);

  const handleEditRule = (rule: ActionRule) => {
    console.log('Edit rule - full rule object:', rule);
    console.log('Edit rule - parameters:', rule.parameters);

    // Load rule data into form
    setCanId(rule.canId);
    setActionType(rule.actionType);
    setParamSource(rule.paramSource || 'fixed');
    setDescription(rule.description || '');

    // Parse parameters based on action type
    switch (rule.actionType) {
      case 'GPIO_SET':
      case 'GPIO_CLEAR':
      case 'GPIO_TOGGLE':
      case 'ADC_READ':
        setPin(rule.parameters);
        break;

      case 'PWM_SET': {
        const [pwmPin, duty] = rule.parameters.split(',');
        setPin(pwmPin);
        setPwmDuty(duty);
        break;
      }

      case 'NEOPIXEL_COLOR': {
        const [r, g, b] = rule.parameters.split(',');
        setNeoR(r || '255');
        setNeoG(g || '0');
        setNeoB(b || '0');
        break;
      }

      case 'CAN_SEND': {
        const [canId, ...dataBytes] = rule.parameters.split(',');
        setSendCanId(canId);
        setSendData(dataBytes.join(','));
        break;
      }

      case 'ADC_READ_SEND': {
        const [adcPin, canId] = rule.parameters.split(',');
        setPin(adcPin);
        setSendCanId(canId);
        break;
      }
    }

    setEditingRuleId(rule.ruleId);
    console.log('Editing rule:', rule);

    // Scroll to top of the form
    setTimeout(() => {
      const formElement = document.querySelector('.action-rule-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    // Reset form to defaults
    setCanId('0x100');
    setActionType('');
    setParamSource('fixed');
    setPin('13');
    setPwmDuty('128');
    setNeoR('255');
    setNeoG('0');
    setNeoB('0');
    setSendCanId('0x200');
    setSendData('AA,BB,CC,DD');
    setDescription('');
  };

  const handleAddRule = () => {
    if (!actionType || !isConnected || !capabilities) {
      return;
    }

    // Determine rule ID - use existing if editing, or find next available
    let ruleId: number;
    if (editingRuleId !== null) {
      ruleId = editingRuleId;
    } else {
      // Find next available rule ID
      const usedIds = existingRules.map(r => r.ruleId);
      let nextId = 1;
      while (usedIds.includes(nextId)) {
        nextId++;
      }
      ruleId = nextId;

      // Check if we've hit max rules (only when adding new)
      if (existingRules.length >= capabilities.max_rules) {
        alert(`Maximum of ${capabilities.max_rules} rules reached for this board`);
        return;
      }
    }

    // Build parameters based on action type
    let parameters = '';
    try {
      switch (actionType) {
        case 'GPIO_SET':
        case 'GPIO_CLEAR':
        case 'GPIO_TOGGLE':
          const gpioPin = parseInt(pin, 10);
          if (isNaN(gpioPin) || gpioPin >= capabilities.gpio) {
            alert(`Invalid GPIO pin. Must be 0-${capabilities.gpio - 1}`);
            return;
          }
          parameters = pin;
          break;

        case 'PWM_SET': {
          const pwmPin = parseInt(pin, 10);
          const duty = parseInt(pwmDuty, 10);
          if (isNaN(pwmPin) || pwmPin >= capabilities.pwm) {
            alert(`Invalid PWM pin. Must be 0-${capabilities.pwm - 1}`);
            return;
          }
          if (isNaN(duty) || duty < 0 || duty > 255) {
            alert('PWM duty cycle must be 0-255');
            return;
          }
          parameters = `${pwmPin},${duty}`;
          break;
        }

        case 'NEOPIXEL_COLOR': {
          const r = parseInt(neoR, 10);
          const g = parseInt(neoG, 10);
          const b = parseInt(neoB, 10);
          if (isNaN(r) || r < 0 || r > 255 || isNaN(g) || g < 0 || g > 255 || isNaN(b) || b < 0 || b > 255) {
            alert('RGB values must be 0-255');
            return;
          }
          parameters = `${r},${g},${b}`;
          break;
        }

        case 'NEOPIXEL_OFF':
          parameters = '0';
          break;

        case 'CAN_SEND': {
          // Validate send CAN ID
          if (!sendCanId.match(/^0x[0-9A-Fa-f]+$/)) {
            alert('Send CAN ID must be in format 0xXXX');
            return;
          }
          // Validate data format (hex bytes separated by commas)
          const dataBytes = sendData.split(',').map(b => b.trim());
          if (dataBytes.length > 8) {
            alert('CAN data cannot exceed 8 bytes');
            return;
          }
          for (const byte of dataBytes) {
            if (!byte.match(/^[0-9A-Fa-f]{1,2}$/)) {
              alert('Data must be hex bytes (e.g., AA,BB,CC,DD)');
              return;
            }
          }
          parameters = `${sendCanId},${sendData}`;
          break;
        }

        case 'ADC_READ_SEND': {
          const adcPin = parseInt(pin, 10);
          if (isNaN(adcPin) || adcPin >= capabilities.adc) {
            alert(`Invalid ADC pin. Must be 0-${capabilities.adc - 1}`);
            return;
          }
          if (!sendCanId.match(/^0x[0-9A-Fa-f]+$/)) {
            alert('Send CAN ID must be in format 0xXXX');
            return;
          }
          parameters = `${adcPin},${sendCanId}`;
          break;
        }

        case 'ADC_READ':
          const adcReadPin = parseInt(pin, 10);
          if (isNaN(adcReadPin) || adcReadPin >= capabilities.adc) {
            alert(`Invalid ADC pin. Must be 0-${capabilities.adc - 1}`);
            return;
          }
          parameters = pin;
          break;

        default:
          alert('Action type not yet implemented in UI');
          return;
      }

      const rule: ActionRule = {
        ruleId: ruleId,
        canId: canId,
        actionType: actionType,
        paramSource: paramSource, // Protocol v2.0 - fixed or candata
        parameters: paramSource === 'candata' ? '' : parameters,
        enabled: true,
        description: description || undefined
      };

      onAddRule(rule);

      // Reset form for next rule
      if (editingRuleId !== null) {
        // After editing, reset to empty form
        setEditingRuleId(null);
        setCanId('0x100');
        setActionType('');
        setParamSource('fixed');
        setDescription('');
      } else {
        // After adding, increment CAN ID for convenience
        setCanId(`0x${(parseInt(canId.replace('0x', ''), 16) + 1).toString(16).toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error adding rule:', error);
      alert('Failed to add rule. Check console for details.');
    }
  };

  if (!isConnected || !capabilities) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Action Rule Builder</h3>
        <p className="text-gray-500 text-sm">Connect to a board to create action rules</p>
      </div>
    );
  }

  return (
    <div className={`action-rule-form bg-gray-900 border rounded-lg p-4 space-y-4 transition-all ${
      editingRuleId !== null ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700'
    }`}>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">
          {editingRuleId !== null ? `Editing Rule #${editingRuleId}` : 'Action Rule Builder'}
        </h3>
        <p className="text-xs text-gray-400">
          {existingRules.length} / {capabilities.max_rules} rules used
        </p>
      </div>

      {/* CAN ID */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">CAN ID (trigger)</label>
        <input
          type="text"
          value={canId}
          onChange={(e) => setCanId(e.target.value)}
          className={`w-full bg-gray-950 border rounded px-3 py-2 text-white text-sm font-mono transition-all ${
            highlightCanId
              ? 'border-green-500 ring-2 ring-green-500/50'
              : 'border-gray-700'
          }`}
          placeholder="0x100"
        />
        {highlightCanId && (
          <p className="text-xs text-green-400 mt-1 animate-pulse">✓ Pre-filled from packet</p>
        )}
      </div>

      {/* Action Type */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Action Type</label>
        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value as ActionType)}
          className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
        >
          <option value="">Select action...</option>
          {supportedActions.map((action) => (
            <option key={action} value={action}>
              {action.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Parameter Source (Protocol v2.0) */}
      {actionType && (
        <div>
          <label className="block text-sm text-gray-300 mb-2">Parameter Source</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paramSource"
                value="fixed"
                checked={paramSource === 'fixed'}
                onChange={(e) => setParamSource(e.target.value as 'fixed' | 'candata')}
                className="w-4 h-4 text-blue-600 bg-gray-950 border-gray-700 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Fixed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paramSource"
                value="candata"
                checked={paramSource === 'candata'}
                onChange={(e) => setParamSource(e.target.value as 'fixed' | 'candata')}
                className="w-4 h-4 text-blue-600 bg-gray-950 border-gray-700 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">CAN Data</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {paramSource === 'fixed'
              ? 'Use fixed parameter values defined below'
              : 'Extract parameters from incoming CAN message data'}
          </p>
        </div>
      )}

      {/* Dynamic Parameters based on Action Type */}
      {actionType && paramSource === 'fixed' && (actionType === 'GPIO_SET' || actionType === 'GPIO_CLEAR' || actionType === 'GPIO_TOGGLE') && (
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            GPIO Pin (0-{capabilities.gpio - 1})
          </label>
          <input
            type="number"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            min="0"
            max={capabilities.gpio - 1}
            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          />
        </div>
      )}

      {actionType === 'PWM_SET' && paramSource === 'fixed' && (
        <>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              PWM Pin (0-{capabilities.pwm - 1})
            </label>
            <input
              type="number"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              min="0"
              max={capabilities.pwm - 1}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Duty Cycle (0-255) - {Math.round((parseInt(pwmDuty) / 255) * 100)}%
            </label>
            <input
              type="range"
              value={pwmDuty}
              onChange={(e) => setPwmDuty(e.target.value)}
              min="0"
              max="255"
              className="w-full"
            />
            <input
              type="number"
              value={pwmDuty}
              onChange={(e) => setPwmDuty(e.target.value)}
              min="0"
              max="255"
              className="w-full mt-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
        </>
      )}

      {actionType === 'NEOPIXEL_COLOR' && paramSource === 'fixed' && (
        <div className="space-y-3">
          <div className="bg-gray-950 border border-gray-700 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Color Preview</div>
            <div
              className="w-full h-12 rounded border border-gray-700"
              style={{ backgroundColor: `rgb(${neoR}, ${neoG}, ${neoB})` }}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Red (0-255)</label>
            <input
              type="range"
              value={neoR}
              onChange={(e) => setNeoR(e.target.value)}
              min="0"
              max="255"
              className="w-full"
            />
            <input
              type="number"
              value={neoR}
              onChange={(e) => setNeoR(e.target.value)}
              min="0"
              max="255"
              className="w-full mt-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Green (0-255)</label>
            <input
              type="range"
              value={neoG}
              onChange={(e) => setNeoG(e.target.value)}
              min="0"
              max="255"
              className="w-full"
            />
            <input
              type="number"
              value={neoG}
              onChange={(e) => setNeoG(e.target.value)}
              min="0"
              max="255"
              className="w-full mt-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Blue (0-255)</label>
            <input
              type="range"
              value={neoB}
              onChange={(e) => setNeoB(e.target.value)}
              min="0"
              max="255"
              className="w-full"
            />
            <input
              type="number"
              value={neoB}
              onChange={(e) => setNeoB(e.target.value)}
              min="0"
              max="255"
              className="w-full mt-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
        </div>
      )}

      {actionType === 'CAN_SEND' && paramSource === 'fixed' && (
        <>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Send CAN ID</label>
            <input
              type="text"
              value={sendCanId}
              onChange={(e) => setSendCanId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm font-mono"
              placeholder="0x200"
            />
            <p className="text-xs text-gray-500 mt-1">CAN ID to send when trigger fires</p>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Data (hex bytes, comma-separated)</label>
            <input
              type="text"
              value={sendData}
              onChange={(e) => setSendData(e.target.value.toUpperCase())}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm font-mono"
              placeholder="AA,BB,CC,DD"
            />
            <p className="text-xs text-gray-500 mt-1">Max 8 bytes (e.g., AA,BB,CC,DD,EE,FF,00,11)</p>
          </div>
        </>
      )}

      {actionType === 'ADC_READ' && paramSource === 'fixed' && (
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            ADC Pin (A0-A{capabilities ? capabilities.adc - 1 : '?'})
          </label>
          <input
            type="number"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            min="0"
            max={capabilities ? capabilities.adc - 1 : 0}
            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Read analog value when CAN message received</p>
        </div>
      )}

      {actionType === 'ADC_READ_SEND' && paramSource === 'fixed' && (
        <>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              ADC Pin (A0-A{capabilities ? capabilities.adc - 1 : '?'})
            </label>
            <input
              type="number"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              min="0"
              max={capabilities ? capabilities.adc - 1 : 0}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Send Result to CAN ID</label>
            <input
              type="text"
              value={sendCanId}
              onChange={(e) => setSendCanId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm font-mono"
              placeholder="0x300"
            />
            <p className="text-xs text-gray-500 mt-1">ADC value will be sent as CAN message</p>
          </div>
        </>
      )}

      {/* Optional Description */}
      {actionType && (
        <div>
          <label className="block text-sm text-gray-300 mb-1">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            placeholder="e.g., Toggle LED on heartbeat"
          />
        </div>
      )}

      {/* Add/Update Buttons */}
      {editingRuleId !== null ? (
        <div className="flex gap-2">
          <button
            onClick={handleAddRule}
            disabled={!actionType}
            className={`flex-1 py-2 rounded font-medium transition-colors ${
              actionType
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            ✓ Update Rule
          </button>
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 rounded font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddRule}
          disabled={!actionType || existingRules.length >= capabilities.max_rules}
          className={`w-full py-2 rounded font-medium transition-colors ${
            actionType && existingRules.length < capabilities.max_rules
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {existingRules.length >= capabilities.max_rules ? 'Max Rules Reached' : '+ Add Rule'}
        </button>
      )}

      {/* Existing Rules List */}
      {existingRules.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-300">Active Rules</h4>
            {onClearAllRules && (
              <button
                onClick={onClearAllRules}
                className="px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                title="Clear all rules"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="space-y-2">
            {existingRules.map((rule) => (
              <div
                key={rule.ruleId}
                className={`bg-gray-950 border rounded p-3 ${
                  rule.enabled ? 'border-green-800/50' : 'border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-600'}`} />
                      <span className="text-sm text-white font-mono">{rule.canId}</span>
                      <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">
                        #{rule.ruleId}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {rule.actionType.replace(/_/g, ' ')}
                      <span className="ml-2 text-xs bg-purple-600/20 text-purple-400 px-1.5 py-0.5 rounded">
                        {rule.paramSource === 'candata' ? 'CAN Data' : 'Fixed'}
                      </span>
                    </div>
                    {rule.description && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        {rule.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded transition-colors"
                      title="Edit rule"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onRemoveRule(rule.ruleId)}
                      className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded transition-colors"
                      title="Remove rule"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded px-2 py-1">
                  <span className="text-xs text-gray-500 font-mono">{rule.parameters}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
