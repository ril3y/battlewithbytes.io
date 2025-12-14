"use client";

/**
 * Dynamic Rule Builder Component (Protocol v2.0)
 *
 * Builds action rules dynamically based on ACTIONDEF data from firmware
 * Supports:
 * - Fixed parameter mode and candata extraction mode
 * - Label and hint fields for better UX (Protocol v2.0+)
 * - Parameter role-based organization (trigger_param, action_param, output_param)
 * - Different trigger types (can_msg, periodic, gpio, manual)
 */

import React, { useState, useEffect } from "react";
import {
  ActionDefinition,
  ActionParameter,
  ActionRule,
  CANMessage,
} from "../types";

interface DynamicRuleBuilderProps {
  actionDefinitions: ActionDefinition[];
  onAddRule: (command: string) => Promise<void>;
  isConnected: boolean;
  editingRule?: ActionRule | null;
  prefilledMessage?: CANMessage | null;
}

export default function DynamicRuleBuilder({
  actionDefinitions,
  onAddRule,
  isConnected,
  editingRule,
  prefilledMessage,
}: DynamicRuleBuilderProps) {
  const [selectedAction, setSelectedAction] = useState<ActionDefinition | null>(
    null,
  );
  const [canId, setCanId] = useState("0x100");
  const [canMask, setCanMask] = useState("0xFFFFFFFF");
  const [paramSource, setParamSource] = useState<"fixed" | "candata">(
    "candata",
  );
  const [fixedParams, setFixedParams] = useState<Record<string, string>>({});

  // Data filtering (Protocol v2.0 - advanced feature)
  const [dataPattern, setDataPattern] = useState("");
  const [dataMask, setDataMask] = useState("");
  const [dataLength, setDataLength] = useState("0");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Pre-populate form when editing a rule
  useEffect(() => {
    if (editingRule && actionDefinitions.length > 0) {
      console.log(
        "🔍 [DynamicRuleBuilder] Attempting to pre-populate rule:",
        editingRule,
      );
      console.log(
        "🔍 [DynamicRuleBuilder] Looking for action type:",
        editingRule.actionType,
      );
      console.log(
        "🔍 [DynamicRuleBuilder] Available actions:",
        actionDefinitions.map((a) => a.n),
      );

      // Find the action definition that matches the rule's action type
      const action = actionDefinitions.find(
        (a) => a.n === editingRule.actionType,
      );

      if (action) {
        console.log("✅ [DynamicRuleBuilder] Found matching action:", action);
        setSelectedAction(action);
        setCanId(`0x${editingRule.canId.toString(16).toUpperCase()}`);
        setCanMask(`0x${editingRule.canMask.toString(16).toUpperCase()}`);
        setParamSource(editingRule.paramSource);

        // Pre-populate data filtering fields (Protocol v2.0)
        setDataPattern(editingRule.dataPattern || "");
        setDataMask(editingRule.dataMask || "");
        setDataLength(editingRule.dataLength?.toString() || "0");

        // Show advanced section if data filtering is used
        if (
          editingRule.dataPattern ||
          editingRule.dataMask ||
          (editingRule.dataLength && editingRule.dataLength > 0)
        ) {
          setShowAdvanced(true);
        }

        // Pre-populate fixed params if available
        if (editingRule.paramSource === "fixed" && editingRule.params) {
          const paramsMap: Record<string, string> = {};
          action.p.forEach((paramDef, idx) => {
            if (editingRule.params && editingRule.params[idx] !== undefined) {
              paramsMap[paramDef.n] = editingRule.params[idx];
            }
          });
          setFixedParams(paramsMap);
        }
      } else {
        console.error(
          "❌ [DynamicRuleBuilder] Could not find action for type:",
          editingRule.actionType,
        );
      }
    }
  }, [editingRule, actionDefinitions]);

  // Pre-populate form when building rule from a packet
  useEffect(() => {
    if (prefilledMessage && !editingRule) {
      console.log(
        "📦 [DynamicRuleBuilder] Prefilling from CAN message:",
        prefilledMessage,
      );
      setCanId(`0x${prefilledMessage.canId.toString(16).toUpperCase()}`);
      setCanMask("0xFFFFFFFF"); // Default to exact match
    }
  }, [prefilledMessage, editingRule]);

  const handleActionSelect = (actionId: number) => {
    const action = actionDefinitions.find((a) => a.i === actionId);
    setSelectedAction(action || null);
    setFixedParams({});
  };

  const handleAddRule = async () => {
    if (!selectedAction) return;

    // Build the action:add command
    // Protocol v2.0 Format: action:add:{ID}:{CAN_ID}:{CAN_MASK}:{DATA}:{DATA_MASK}:{DATA_LEN}:{ACTION}:{PARAM_SOURCE}:{PARAMS...}
    // Example: action:add:0:0x100:0xFFFFFFFF:::0:GPIO_SET:fixed:13
    // Example: action:add:0:0x500:0xFFFFFFFF:::0:NEOPIXEL:candata
    // Example: action:add:0:0x200:0xFFFFFFFF:FF:FF:1:GPIO_TOGGLE:fixed:14

    const ruleId = 0; // Auto-assign

    let command = `action:add:${ruleId}:${canId}:${canMask}:${dataPattern}:${dataMask}:${dataLength}:${selectedAction.n}:${paramSource}`;

    // Add fixed parameters if in fixed mode
    if (paramSource === "fixed") {
      const paramValues = selectedAction.p.map(
        (param) => fixedParams[param.n] || "0",
      );
      command += ":" + paramValues.join(":");
    }

    await onAddRule(command);

    // Reset form
    setCanId("0x100");
    setFixedParams({});
    setDataPattern("");
    setDataMask("");
    setDataLength("0");
    setShowAdvanced(false);
  };

  if (actionDefinitions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No action definitions available</p>
        <p className="text-sm text-gray-600 mt-2">
          Connect to a uCAN device to load actions
        </p>
      </div>
    );
  }

  // Group actions by category
  const actionsByCategory = actionDefinitions.reduce(
    (acc, action) => {
      const category = action.c || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(action);
      return acc;
    },
    {} as Record<string, ActionDefinition[]>,
  );

  // Separate parameters by role
  const triggerParams =
    selectedAction?.p.filter((p) => p.role === "trigger_param") || [];
  const actionParams =
    selectedAction?.p.filter((p) => p.role === "action_param") || [];
  const outputParams =
    selectedAction?.p.filter((p) => p.role === "output_param") || [];

  // Get CAN ID label based on trigger type
  const getCanIdLabel = () => {
    const trigType = selectedAction?.trig;
    if (trigType === "periodic" || trigType === "manual") {
      return "CAN ID to Send";
    }
    return "CAN ID to Match";
  };

  return (
    <div className="space-y-4">
      {/* Action Selection */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Select Action
        </label>
        <select
          value={selectedAction?.i || ""}
          onChange={(e) => handleActionSelect(parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
        >
          <option value="">Choose an action...</option>
          {Object.entries(actionsByCategory).map(([category, actions]) => (
            <optgroup key={category} label={category}>
              {actions.map((action) => (
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

            <div className="space-y-3">
              {/* CAN ID field (label changes based on trigger type) */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {getCanIdLabel()}
                </label>
                <input
                  type="text"
                  value={canId}
                  onChange={(e) => setCanId(e.target.value)}
                  placeholder="0x100"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* CAN ID Mask (only for can_msg trigger) */}
              {selectedAction.trig === "can_msg" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    CAN ID Mask
                  </label>
                  <input
                    type="text"
                    value={canMask}
                    onChange={(e) => setCanMask(e.target.value)}
                    placeholder="0xFFFFFFFF"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Use 0xFFFFFFFF for exact match
                  </p>
                </div>
              )}

              {/* Trigger-specific parameters */}
              {triggerParams.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">
                    Trigger Parameters:
                  </p>
                  {renderParameterInputs(
                    triggerParams,
                    paramSource,
                    fixedParams,
                    setFixedParams,
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Parameter Source Selection (only if action has parameters) */}
          {(actionParams.length > 0 || outputParams.length > 0) && (
            <div className="bg-gray-950 border border-gray-800 rounded p-3">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">
                📊 Parameter Source
              </h4>
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="candata"
                    checked={paramSource === "candata"}
                    onChange={(e) =>
                      setParamSource(e.target.value as "candata")
                    }
                    className="w-4 h-4 mt-0.5"
                  />
                  <div>
                    <div className="text-sm text-white">
                      Extract from CAN Data
                    </div>
                    <div className="text-xs text-gray-500">
                      Parameters come from CAN message bytes (one rule, infinite
                      values)
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="fixed"
                    checked={paramSource === "fixed"}
                    onChange={(e) => setParamSource(e.target.value as "fixed")}
                    className="w-4 h-4 mt-0.5"
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
          )}

          {/* Action Parameters */}
          {actionParams.length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded p-3">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">
                🔧 Action Parameters
              </h4>

              {paramSource === "candata" ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-3">
                    Parameters will be extracted from CAN message data bytes:
                  </p>
                  {renderParameterMapping(actionParams)}
                </div>
              ) : (
                <div className="space-y-3">
                  {renderParameterInputs(
                    actionParams,
                    paramSource,
                    fixedParams,
                    setFixedParams,
                  )}
                </div>
              )}
            </div>
          )}

          {/* Output Configuration */}
          {outputParams.length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded p-3">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">
                📤 Output Configuration
              </h4>

              {paramSource === "candata" ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-3">
                    Output parameters will be extracted from CAN message data
                    bytes:
                  </p>
                  {renderParameterMapping(outputParams)}
                </div>
              ) : (
                <div className="space-y-3">
                  {renderParameterInputs(
                    outputParams,
                    paramSource,
                    fixedParams,
                    setFixedParams,
                  )}
                </div>
              )}
            </div>
          )}

          {/* Advanced: Data Filtering (Protocol v2.0) */}
          <div className="bg-gray-950 border border-gray-800 rounded p-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <span>🔬 Advanced: Data Filtering</span>
              <span className="text-xs text-gray-500">
                {showAdvanced ? "▼" : "▶"}
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-gray-400">
                  Filter CAN messages by data content before triggering the rule
                </p>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Data Pattern
                  </label>
                  <input
                    type="text"
                    value={dataPattern}
                    onChange={(e) => setDataPattern(e.target.value)}
                    placeholder="FF,00 (empty = match any)"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Hex bytes to match (comma-separated, e.g.,
                    &quot;FF,00&quot;)
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Data Mask
                  </label>
                  <input
                    type="text"
                    value={dataMask}
                    onChange={(e) => setDataMask(e.target.value)}
                    placeholder="FF,FF (empty = no masking)"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    FF = must match, 00 = don&apos;t care (e.g.,
                    &quot;FF,FF&quot;)
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Required Data Length
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={dataLength}
                    onChange={(e) => setDataLength(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    0 = any length, 1-8 = exact length required
                  </p>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/30 rounded p-2">
                  <p className="text-xs text-blue-400">
                    <strong>Example:</strong> Pattern &quot;FF&quot;, Mask
                    &quot;FF&quot;, Length &quot;4&quot; → Only trigger when
                    byte 0 is 0xFF and message is exactly 4 bytes long
                  </p>
                </div>
              </div>
            )}
          </div>

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
 * Render parameter inputs for fixed mode
 */
function renderParameterInputs(
  params: ActionParameter[],
  paramSource: "fixed" | "candata",
  fixedParams: Record<string, string>,
  setFixedParams: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  return params.map((param) => (
    <div key={param.n}>
      <label className="block text-xs text-gray-500 mb-1">
        {/* Use label if available (v2.0+), otherwise fall back to n */}
        {param.label || param.n}
        {param.r && <span className="text-gray-600"> ({param.r})</span>}
      </label>
      <input
        type="text"
        value={fixedParams[param.n] || ""}
        onChange={(e) =>
          setFixedParams({
            ...fixedParams,
            [param.n]: e.target.value,
          })
        }
        placeholder={getParameterPlaceholder(param)}
        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
      />
      {/* Show hint if available (v2.0+) */}
      {param.hint && (
        <p className="text-xs text-gray-600 mt-1">💡 {param.hint}</p>
      )}
    </div>
  ));
}

/**
 * Render parameter mapping for candata mode
 */
function renderParameterMapping(params: ActionParameter[]) {
  return (
    <div className="bg-black/30 rounded p-3 font-mono text-xs">
      {params.map((param, idx) => (
        <div key={idx} className="flex items-center justify-between py-1">
          <span className="text-gray-400">
            {/* Use label if available (v2.0+), otherwise fall back to n */}
            {param.label || param.n}:
          </span>
          <span className="text-green-400">
            Byte {param.b}
            {param.o !== 0 && `, Bit ${param.o}`}
            {param.l !== 8 && `, ${param.l} bits`}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Get placeholder text for parameter input based on type, range, and hint
 */
function getParameterPlaceholder(param: ActionParameter): string {
  // Use hint as placeholder if available (v2.0+)
  if (param.hint) {
    return param.hint;
  }

  // Parse range if available
  if (param.r) {
    const rangeParts = param.r.split("-");
    if (rangeParts.length === 2) {
      const min = parseInt(rangeParts[0]);
      const max = parseInt(rangeParts[1]);
      return `${min} to ${max}`;
    }
  }

  // Type-based defaults
  const typeNames = [
    "uint8",
    "uint16",
    "uint32",
    "int8",
    "int16",
    "int32",
    "float",
    "bool",
  ];
  const typeName = typeNames[param.t] || "value";

  return `Enter ${typeName} value`;
}
