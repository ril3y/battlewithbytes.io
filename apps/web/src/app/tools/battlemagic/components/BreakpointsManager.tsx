'use client';

/**
 * Breakpoints Manager Component
 *
 * Manages hardware and software breakpoints for debugging
 */

import React, { useState, useCallback, useRef } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';

export interface Breakpoint {
  id: string;
  address: string;
  type: 'hardware' | 'software';
  enabled: boolean;
  condition?: string;
  hitCount?: number;
  symbol?: string;
  description?: string;
}

interface BreakpointsManagerProps {
  gdbClient: GdbClient | null;
  isConnected: boolean;
  onOutput?: (message: string) => void;
  breakpoints?: Breakpoint[];
  setBreakpoints?: React.Dispatch<React.SetStateAction<Breakpoint[]>>;
}

export default function BreakpointsManager({
  gdbClient,
  isConnected,
  onOutput,
  breakpoints: breakpointsProp,
  setBreakpoints: setBreakpointsProp
}: BreakpointsManagerProps) {
  // Use local state if props not provided (fallback for standalone use)
  const [localBreakpoints, setLocalBreakpoints] = useState<Breakpoint[]>([]);

  const breakpoints = breakpointsProp ?? localBreakpoints;
  const setBreakpoints = setBreakpointsProp ?? setLocalBreakpoints;
  const [newAddress, setNewAddress] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [breakpointType, setBreakpointType] = useState<'hardware' | 'software'>('software');
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID for breakpoints
  const generateId = () => `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add a new breakpoint
  const handleAddBreakpoint = useCallback(async () => {
    if (!gdbClient || !isConnected) {
      onOutput?.('[Error] Not connected to target');
      return;
    }

    const addressOrSymbol = newAddress || newSymbol;
    if (!addressOrSymbol) {
      onOutput?.('[Error] Address or symbol required');
      return;
    }

    try {
      // For addresses, convert to number; for symbols, keep as string
      let gdbAddress: number | string = addressOrSymbol;
      if (newAddress) {
        // User entered an address
        const addressNum = addressOrSymbol.startsWith('0x') || addressOrSymbol.startsWith('0X')
          ? parseInt(addressOrSymbol, 16)
          : parseInt(addressOrSymbol, 10);

        if (isNaN(addressNum)) {
          onOutput?.(`[Error] Invalid address format: ${addressOrSymbol}`);
          return;
        }
        gdbAddress = addressNum;
      }

      // Insert breakpoint via GDB
      await gdbClient.insertBreakpoint(gdbAddress, breakpointType === 'hardware');

      // Add to local state (store as string for display)
      const displayAddress = typeof gdbAddress === 'number'
        ? `0x${gdbAddress.toString(16).toUpperCase()}`
        : gdbAddress;

      const newBreakpoint: Breakpoint = {
        id: generateId(),
        address: displayAddress,
        type: breakpointType,
        enabled: true,
        condition: newCondition || undefined,
        symbol: newSymbol || undefined,
        description: newSymbol ? `Symbol: ${newSymbol}` : `Address: ${displayAddress}`,
        hitCount: 0
      };

      setBreakpoints(prev => [...prev, newBreakpoint]);
      onOutput?.(`[Breakpoint] Added ${breakpointType} breakpoint at ${displayAddress}`);

      // Clear form
      setNewAddress('');
      setNewSymbol('');
      setNewCondition('');
      setShowAddForm(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onOutput?.(`[Error] Failed to add breakpoint: ${errorMsg}`);
    }
  }, [gdbClient, isConnected, newAddress, newSymbol, newCondition, breakpointType, onOutput, setBreakpoints]);

  // Remove a breakpoint
  const handleRemoveBreakpoint = useCallback(async (bp: Breakpoint) => {
    if (!gdbClient || !isConnected) {
      onOutput?.('[Error] Not connected to target');
      return;
    }

    try {
      // Convert address string to number for GDB command
      const addressNum = bp.address.startsWith('0x') || bp.address.startsWith('0X')
        ? parseInt(bp.address, 16)
        : parseInt(bp.address, 10);

      if (isNaN(addressNum)) {
        onOutput?.(`[Error] Invalid breakpoint address: ${bp.address}`);
        return;
      }

      // Remove from GDB
      await gdbClient.removeBreakpoint(addressNum, bp.type === 'hardware');

      // Remove from local state
      setBreakpoints(prev => prev.filter(b => b.id !== bp.id));
      onOutput?.(`[Breakpoint] Removed breakpoint at ${bp.address}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onOutput?.(`[Error] Failed to remove breakpoint at ${bp.address}: ${errorMsg}`);
    }
  }, [gdbClient, isConnected, onOutput, setBreakpoints]);

  // Toggle breakpoint enabled/disabled
  const handleToggleBreakpoint = useCallback(async (bp: Breakpoint) => {
    if (!gdbClient || !isConnected) {
      onOutput?.('[Error] Not connected to target');
      return;
    }

    try {
      // Convert address string to number for GDB command
      const addressNum = bp.address.startsWith('0x') || bp.address.startsWith('0X')
        ? parseInt(bp.address, 16)
        : parseInt(bp.address, 10);

      if (isNaN(addressNum)) {
        onOutput?.(`[Error] Invalid breakpoint address: ${bp.address}`);
        return;
      }

      if (bp.enabled) {
        // Disable by removing from GDB but keep in list
        await gdbClient.removeBreakpoint(addressNum, bp.type === 'hardware');
      } else {
        // Re-enable by adding back to GDB
        await gdbClient.insertBreakpoint(addressNum, bp.type === 'hardware');
      }

      // Update local state
      setBreakpoints(prev => prev.map(b =>
        b.id === bp.id ? { ...b, enabled: !b.enabled } : b
      ));

      onOutput?.(`[Breakpoint] ${bp.enabled ? 'Disabled' : 'Enabled'} breakpoint at ${bp.address}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onOutput?.(`[Error] Failed to toggle breakpoint at ${bp.address}: ${errorMsg}`);
    }
  }, [gdbClient, isConnected, onOutput, setBreakpoints]);

  // Clear all breakpoints
  const handleClearAll = useCallback(async () => {
    if (!gdbClient || !isConnected) {
      onOutput?.('[Error] Not connected to target');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Remove all breakpoints from GDB
    for (const bp of breakpoints) {
      if (bp.enabled) {
        try {
          // Convert address string to number for GDB command
          const addressNum = bp.address.startsWith('0x') || bp.address.startsWith('0X')
            ? parseInt(bp.address, 16)
            : parseInt(bp.address, 10);

          if (isNaN(addressNum)) {
            failCount++;
            errors.push(`Invalid address: ${bp.address}`);
            continue;
          }

          await gdbClient.removeBreakpoint(addressNum, bp.type === 'hardware');
          successCount++;
        } catch (error) {
          failCount++;
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`${bp.address}: ${errorMsg}`);
        }
      }
    }

    // Clear local state regardless of GDB errors
    setBreakpoints([]);

    // Report results
    if (failCount === 0) {
      onOutput?.(`[Breakpoint] Cleared all breakpoints (${successCount} removed)`);
    } else {
      onOutput?.(`[Breakpoint] Cleared breakpoints: ${successCount} removed, ${failCount} failed`);
      errors.forEach(err => onOutput?.(`[Error] ${err}`));
    }
  }, [gdbClient, isConnected, breakpoints, onOutput, setBreakpoints]);

  // Export breakpoints to JSON
  const handleExport = useCallback(() => {
    const data = JSON.stringify(breakpoints, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breakpoints_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onOutput?.('[Breakpoint] Exported breakpoints to file');
  }, [breakpoints, onOutput]);

  // Import breakpoints from JSON
  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text) as Breakpoint[];

      if (!Array.isArray(imported)) {
        throw new Error('Invalid breakpoint file format');
      }

      // Add imported breakpoints to GDB if connected
      if (gdbClient && isConnected) {
        for (const bp of imported) {
          if (bp.enabled) {
            try {
              // Convert address string to number for GDB command
              const addressNum = bp.address.startsWith('0x') || bp.address.startsWith('0X')
                ? parseInt(bp.address, 16)
                : parseInt(bp.address, 10);

              if (isNaN(addressNum)) {
                onOutput?.(`[Warning] Invalid address format: ${bp.address}`);
                bp.enabled = false;
                continue;
              }

              await gdbClient.insertBreakpoint(addressNum, bp.type === 'hardware');
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              onOutput?.(`[Warning] Failed to set breakpoint at ${bp.address}: ${errorMsg}`);
              bp.enabled = false;
            }
          }
        }
      }

      setBreakpoints(imported);
      onOutput?.(`[Breakpoint] Imported ${imported.length} breakpoints`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onOutput?.(`[Error] Failed to import breakpoints: ${errorMsg}`);
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [gdbClient, isConnected, onOutput, setBreakpoints]);

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-green-400">BREAKPOINTS</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={!isConnected}
            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded transition-colors"
          >
            + Add
          </button>
          <button
            onClick={handleClearAll}
            disabled={!isConnected || breakpoints.length === 0}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 disabled:bg-gray-600 rounded transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleExport}
            disabled={breakpoints.length === 0}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded transition-colors"
          >
            Export
          </button>
          <label className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded cursor-pointer transition-colors">
            Import
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Add Breakpoint Form */}
      {showAddForm && (
        <div className="p-3 border-b border-gray-700 bg-gray-900">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Address (e.g., 0x08000000)"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                disabled={!!newSymbol}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs font-mono disabled:opacity-50"
              />
              <span className="text-xs text-gray-400 self-center">OR</span>
              <input
                type="text"
                placeholder="Symbol (e.g., main)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                disabled={!!newAddress}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs font-mono disabled:opacity-50"
              />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Condition (optional)"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs font-mono"
              />
              <select
                value={breakpointType}
                onChange={(e) => setBreakpointType(e.target.value as 'hardware' | 'software')}
                className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs"
              >
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
              </select>
              <button
                onClick={handleAddBreakpoint}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewAddress('');
                  setNewSymbol('');
                  setNewCondition('');
                }}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breakpoints List */}
      <div className="flex-1 overflow-auto p-3">
        {!isConnected ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            Connect to target to manage breakpoints
          </div>
        ) : breakpoints.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            No breakpoints set
          </div>
        ) : (
          <div className="space-y-2">
            {breakpoints.map((bp) => (
              <div
                key={bp.id}
                className={`p-3 rounded border ${
                  bp.enabled
                    ? 'bg-gray-900 border-gray-700'
                    : 'bg-gray-900/50 border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        bp.enabled ? 'bg-red-500' : 'bg-gray-600'
                      }`} />
                      <span className="font-mono text-sm text-green-400">
                        {bp.address}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        bp.type === 'hardware'
                          ? 'bg-purple-600/30 text-purple-300'
                          : 'bg-blue-600/30 text-blue-300'
                      }`}>
                        {bp.type}
                      </span>
                    </div>

                    {bp.description && (
                      <div className="text-xs text-gray-400 ml-4">
                        {bp.description}
                      </div>
                    )}

                    {bp.condition && (
                      <div className="text-xs text-yellow-400 ml-4 mt-1">
                        Condition: {bp.condition}
                      </div>
                    )}

                    {bp.hitCount !== undefined && bp.hitCount > 0 && (
                      <div className="text-xs text-gray-500 ml-4 mt-1">
                        Hit count: {bp.hitCount}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleToggleBreakpoint(bp)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title={bp.enabled ? 'Disable' : 'Enable'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {bp.enabled ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemoveBreakpoint(bp)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors text-red-400"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {breakpoints.length} breakpoint{breakpoints.length !== 1 ? 's' : ''}
            ({breakpoints.filter(bp => bp.enabled).length} enabled)
          </span>
          <span>
            HW: {breakpoints.filter(bp => bp.type === 'hardware').length} |
            SW: {breakpoints.filter(bp => bp.type === 'software').length}
          </span>
        </div>
      </div>
    </div>
  );
}