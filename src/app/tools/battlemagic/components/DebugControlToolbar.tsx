'use client';

/**
 * Debug Control Toolbar Component
 *
 * Provides intuitive debug control buttons for GDB execution control.
 * Supports: Continue, Pause, Step Over, Step Into, Step Out, Restart, Reset
 * with keyboard shortcuts and visual feedback.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';

export enum ExecutionState {
  STOPPED = 'stopped',
  RUNNING = 'running',
  STEPPING = 'stepping',
  UNKNOWN = 'unknown'
}

interface DebugControlToolbarProps {
  gdbClient: GdbClient | null;
  executionState: ExecutionState;
  onCommandExecuted?: (command: string) => void;
  isAttached: boolean;
}

interface ButtonConfig {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
  command: () => Promise<void>;
  disabled: (state: ExecutionState, isAttached: boolean) => boolean;
  variant: 'default' | 'success' | 'warning' | 'danger';
  shortcut?: string;
}

export default function DebugControlToolbar({
  gdbClient,
  executionState,
  onCommandExecuted,
  isAttached
}: DebugControlToolbarProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const executeCommand = useCallback(async (command: () => Promise<void>, commandName: string) => {
    if (isExecuting) return;

    setIsExecuting(true);
    try {
      await command();
      onCommandExecuted?.(commandName);
    } catch (error) {
      console.error(`Failed to execute ${commandName}:`, error);
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, onCommandExecuted]);

  const handleContinue = useCallback(async () => {
    await executeCommand(async () => {
      await gdbClient?.continue();
    }, 'continue');
  }, [gdbClient, executeCommand]);

  const handlePause = useCallback(async () => {
    await executeCommand(async () => {
      await gdbClient?.halt();
    }, 'halt');
  }, [gdbClient, executeCommand]);

  const handleStepOver = useCallback(async () => {
    await executeCommand(async () => {
      await gdbClient?.step();
    }, 'step_over');
  }, [gdbClient, executeCommand]);

  const handleStepInto = useCallback(async () => {
    await executeCommand(async () => {
      await gdbClient?.step();
    }, 'step_into');
  }, [gdbClient, executeCommand]);

  const handleStepOut = useCallback(async () => {
    await executeCommand(async () => {
      await gdbClient?.sendCommand('finish');
    }, 'step_out');
  }, [gdbClient, executeCommand]);

  const handleRestart = useCallback(async () => {
    await executeCommand(async () => {
      await gdbClient?.sendCommand('run');
    }, 'restart');
  }, [gdbClient, executeCommand]);

  const handleReset = useCallback(async () => {
    await executeCommand(async () => {
      await gdbClient?.reset();
    }, 'reset');
  }, [gdbClient, executeCommand]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gdbClient?.isConnected() || !isAttached) return;

      // Check for debugger shortcuts
      switch (e.code) {
        case 'F5':
          e.preventDefault();
          if (e.ctrlKey && e.shiftKey) {
            handleRestart();
          } else {
            handleContinue();
          }
          break;
        case 'F6':
          e.preventDefault();
          handlePause();
          break;
        case 'F10':
          e.preventDefault();
          handleStepOver();
          break;
        case 'F11':
          e.preventDefault();
          if (e.shiftKey) {
            handleStepOut();
          } else {
            handleStepInto();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gdbClient, isAttached, handleContinue, handlePause, handleStepOver, handleStepInto, handleStepOut, handleRestart]);

  const buttons: ButtonConfig[] = [
    {
      id: 'continue',
      label: 'Continue',
      icon: '▶',
      tooltip: 'Resume execution (F5)',
      command: handleContinue,
      disabled: (state) => state === ExecutionState.RUNNING,
      variant: 'success',
      shortcut: 'F5'
    },
    {
      id: 'pause',
      label: 'Pause',
      icon: '⏸',
      tooltip: 'Halt execution (F6)',
      command: handlePause,
      disabled: (state) => state !== ExecutionState.RUNNING,
      variant: 'warning',
      shortcut: 'F6'
    },
    {
      id: 'step-over',
      label: 'Step Over',
      icon: '⏩',
      tooltip: 'Step over function calls (F10)',
      command: handleStepOver,
      disabled: (state) => state === ExecutionState.RUNNING,
      variant: 'default',
      shortcut: 'F10'
    },
    {
      id: 'step-into',
      label: 'Step Into',
      icon: '⬇',
      tooltip: 'Step into functions (F11)',
      command: handleStepInto,
      disabled: (state) => state === ExecutionState.RUNNING,
      variant: 'default',
      shortcut: 'F11'
    },
    {
      id: 'step-out',
      label: 'Step Out',
      icon: '⬆',
      tooltip: 'Step out of current function (Shift+F11)',
      command: handleStepOut,
      disabled: (state) => state === ExecutionState.RUNNING,
      variant: 'default',
      shortcut: 'Shift+F11'
    },
    {
      id: 'restart',
      label: 'Restart',
      icon: '↺',
      tooltip: 'Restart execution (Ctrl+Shift+F5)',
      command: handleRestart,
      disabled: () => false,
      variant: 'default',
      shortcut: 'Ctrl+Shift+F5'
    },
    {
      id: 'reset',
      label: 'Reset',
      icon: '🔄',
      tooltip: 'Reset target',
      command: handleReset,
      disabled: () => false,
      variant: 'warning'
    }
  ];

  const getButtonStyles = (button: ButtonConfig, isDisabled: boolean) => {
    const baseStyles = 'px-3 py-2 text-sm rounded transition-all flex items-center gap-1 font-mono text-xs hover:shadow-lg';

    if (isDisabled) {
      return `${baseStyles} opacity-50 cursor-not-allowed bg-gray-700 text-gray-400`;
    }

    const variants = {
      default: 'bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500',
      success: 'bg-green-600/30 border border-green-500/50 text-green-300 hover:bg-green-600/50 hover:border-green-400',
      warning: 'bg-yellow-600/30 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-600/50 hover:border-yellow-400',
      danger: 'bg-red-600/30 border border-red-500/50 text-red-300 hover:bg-red-600/50 hover:border-red-400'
    };

    return `${baseStyles} ${variants[button.variant]}`;
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-2 flex gap-1 flex-wrap flex-shrink-0">
      {/* Execution State Indicator */}
      <div className="flex items-center gap-2 px-2 border-r border-gray-700 pr-3">
        <div className="text-xs text-gray-400">State:</div>
        <div className={`text-xs font-mono font-semibold flex items-center gap-1 ${
          executionState === ExecutionState.RUNNING ? 'text-green-400 animate-pulse' :
          executionState === ExecutionState.STEPPING ? 'text-yellow-400' :
          executionState === ExecutionState.STOPPED ? 'text-red-400' :
          'text-gray-400'
        }`}>
          {executionState === ExecutionState.STOPPED && (
            <span className="inline-block w-2 h-2 bg-red-400 rounded-full"></span>
          )}
          {executionState === ExecutionState.RUNNING && (
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          )}
          {executionState === ExecutionState.STEPPING && (
            <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
          )}
          {executionState.toUpperCase()}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-1">
        {buttons.map((button) => {
          const isDisabled = button.disabled(executionState, isAttached) || !isAttached || isExecuting;
          const isHovered = hoveredButton === button.id;

          return (
            <div key={button.id} className="relative">
              <button
                onClick={() => button.command()}
                disabled={isDisabled}
                className={getButtonStyles(button, isDisabled)}
                title={button.tooltip}
                onMouseEnter={() => setHoveredButton(button.id)}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="text-base">{button.icon}</span>
                <span className="hidden sm:inline">{button.label}</span>
              </button>

              {/* Tooltip with keyboard shortcut */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 whitespace-nowrap">
                  <div className="bg-gray-950 border border-green-500/50 rounded px-2 py-1 text-xs text-green-300 shadow-lg">
                    <div>{button.tooltip}</div>
                    {button.shortcut && (
                      <div className="text-gray-500 text-xs mt-1">{button.shortcut}</div>
                    )}
                  </div>
                  {/* Arrow pointer */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-950 border-t-opacity-75"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Execution Status Text */}
      {isExecuting && (
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-xs text-gray-400">Executing command...</div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
