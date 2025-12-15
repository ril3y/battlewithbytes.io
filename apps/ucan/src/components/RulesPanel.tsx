"use client";

/**
 * Rules Panel Component
 *
 * UI for managing CAN message action rules
 */

import React, { useState } from "react";
import { ActionRule, CANMessage, ActionDefinition } from "../types";
import DynamicRuleBuilder from "./DynamicRuleBuilder";

interface RulesPanelProps {
  isConnected: boolean;
  rules: ActionRule[];
  actionDefinitions: ActionDefinition[];
  onAddRule: (command: string) => Promise<void>;
  onDeleteRule: (ruleId: number) => void;
  onToggleRule: (ruleId: number) => void;
  onClearAllRules: () => void;
  onRefreshRules: () => void;
  prefilledMessage?: CANMessage | null;
}

export default function RulesPanel({
  isConnected,
  rules,
  actionDefinitions,
  onAddRule,
  onDeleteRule,
  onToggleRule,
  onClearAllRules,
  onRefreshRules,
  prefilledMessage,
}: RulesPanelProps) {
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="p-4 bg-black space-y-4 max-h-[580px] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
          <span>⚡</span>
          Action Rules
        </h2>
        {!isConnected && (
          <span className="text-xs text-red-400">⚠️ Not connected</span>
        )}
      </div>

      {/* Info Section */}
      {!showBuilder && (
        <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded text-sm text-purple-200">
          <p className="mb-2">
            Action rules allow CAN messages to automatically trigger hardware
            responses on your board.
          </p>
          <p className="text-xs text-purple-300/80">
            💡 Configure rules below or right-click a message in the log
          </p>
        </div>
      )}

      {/* Prefilled Message Info */}
      {prefilledMessage && !showBuilder && (
        <div className="p-3 bg-green-900/20 border border-green-500/30 rounded text-sm">
          <p className="text-green-300 mb-2 font-semibold">
            Building rule from captured packet:
          </p>
          <div className="font-mono text-xs text-green-200">
            <div>
              CAN ID: 0x
              {prefilledMessage.canId
                .toString(16)
                .toUpperCase()
                .padStart(3, "0")}
            </div>
            <div>
              Data:{" "}
              {Array.from(prefilledMessage.data)
                .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
                .join(" ")}
            </div>
            <div>Length: {prefilledMessage.length} bytes</div>
          </div>
        </div>
      )}

      {/* Rule Builder Toggle */}
      {!showBuilder ? (
        <button
          onClick={() => setShowBuilder(true)}
          disabled={!isConnected || actionDefinitions.length === 0}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center justify-center gap-2 border border-purple-500/50"
        >
          <span className="text-lg">+</span>
          Create New Rule
        </button>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setShowBuilder(false)}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            ← Back to Rules List
          </button>

          <DynamicRuleBuilder
            actionDefinitions={actionDefinitions}
            onAddRule={async (command) => {
              await onAddRule(command);
              setShowBuilder(false);
            }}
            isConnected={isConnected}
          />
        </div>
      )}

      {/* Rules List */}
      {!showBuilder && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-purple-300">
              Active Rules ({rules.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={onRefreshRules}
                disabled={!isConnected}
                className="px-2 py-1 text-xs bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
                title="Refresh rules from device"
              >
                🔄 Refresh
              </button>
              {rules.length > 0 && (
                <button
                  onClick={onClearAllRules}
                  disabled={!isConnected}
                  className="px-2 py-1 text-xs bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
                  title="Clear all rules"
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {rules.length === 0 ? (
              <div className="p-6 text-center text-gray-500 border border-gray-800 rounded bg-gray-900/30">
                <p className="text-sm">No rules configured</p>
                <p className="text-xs mt-1 text-gray-600">
                  {actionDefinitions.length === 0
                    ? "Connect to a device to load available actions"
                    : 'Click "Create New Rule" to get started'}
                </p>
              </div>
            ) : (
              rules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={() => onToggleRule(rule.id)}
                  onDelete={() => onDeleteRule(rule.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Individual rule card component
 */
interface RuleCardProps {
  rule: ActionRule;
  onToggle: () => void;
  onDelete: () => void;
}

function RuleCard({ rule, onToggle, onDelete }: RuleCardProps) {
  return (
    <div
      className={`p-3 border rounded transition-colors ${
        rule.enabled
          ? "bg-purple-900/20 border-purple-500/30"
          : "bg-gray-900/30 border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Rule Name and Status */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white text-sm truncate">
              {rule.name || `Rule ${rule.id}`}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                rule.enabled
                  ? "bg-green-600/20 text-green-300 border border-green-500/30"
                  : "bg-gray-700 text-gray-400 border border-gray-600"
              }`}
            >
              {rule.enabled ? "Active" : "Disabled"}
            </span>
          </div>

          {/* Rule Details */}
          <div className="space-y-1 text-xs font-mono">
            <div className="text-gray-400">
              <span className="text-gray-500">ID:</span>{" "}
              <span className="text-purple-300">
                0x{rule.canId.toString(16).toUpperCase()}
              </span>
            </div>
            <div className="text-gray-400">
              <span className="text-gray-500">Action:</span>{" "}
              <span className="text-purple-300">{rule.actionType}</span>
            </div>
            {rule.params && rule.params.length > 0 && (
              <div className="text-gray-400">
                <span className="text-gray-500">Params:</span>{" "}
                <span className="text-purple-300">
                  {rule.params.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-purple-800/40 rounded transition-colors"
            title={rule.enabled ? "Disable rule" : "Enable rule"}
          >
            <span className="text-sm">{rule.enabled ? "⏸️" : "▶️"}</span>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-800/40 rounded transition-colors"
            title="Delete rule"
          >
            <span className="text-sm">🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
