"use client";

/**
 * Rule Builder Modal (Protocol v2.0)
 *
 * Full-screen modal for creating and editing action rules
 * Provides more space and better UX than the cramped panel
 */

import React from "react";
import { ActionDefinition, ActionRule, CANMessage } from "../types";
import DynamicRuleBuilder from "./DynamicRuleBuilder";

interface RuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionDefinitions: ActionDefinition[];
  onAddRule: (command: string) => Promise<void>;
  isConnected: boolean;
  editingRule?: ActionRule | null; // If provided, we're editing
  prefilledMessage?: CANMessage | null; // If provided, prefill CAN ID from this message
}

export default function RuleBuilderModal({
  isOpen,
  onClose,
  actionDefinitions,
  onAddRule,
  isConnected,
  editingRule,
  prefilledMessage,
}: RuleBuilderModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white font-mono">
              {editingRule ? "✏️ Edit Action Rule" : "⚡ Create Action Rule"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {editingRule
                ? `Editing: ${editingRule.name}`
                : prefilledMessage
                  ? `Building rule from CAN ID 0x${prefilledMessage.canId.toString(16).toUpperCase()}`
                  : "Configure the board to automatically respond to triggers"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {editingRule ? (
            <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm font-medium">
                ⚠️ Edit Mode
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Currently editing rule #{editingRule.id}. Modifying and saving
                will create a new rule. Delete the old rule manually if needed.
              </p>
            </div>
          ) : null}

          <DynamicRuleBuilder
            actionDefinitions={actionDefinitions}
            onAddRule={async (command) => {
              await onAddRule(command);
              onClose(); // Close modal after successful rule creation
            }}
            isConnected={isConnected}
            editingRule={editingRule}
            prefilledMessage={prefilledMessage}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 bg-gray-950">
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Rules execute automatically when their trigger conditions
            are met
          </p>
        </div>
      </div>
    </div>
  );
}
