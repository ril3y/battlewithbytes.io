'use client';

/**
 * CPU Definition Editor
 *
 * UI for creating and editing CPU definitions with custom memory maps
 */

import React, { useState, useCallback } from 'react';
import { CpuDefinition, MemoryRegionDefinition } from '../lib/cpu/CpuDefinition';
import { getCpuDefinitionManager } from '../lib/cpu/CpuDefinitionManager';
import architectures from '../data/architectures.json';

interface CpuDefinitionEditorProps {
  initialDefinition?: CpuDefinition;
  onSave?: (definition: CpuDefinition) => void;
  onCancel?: () => void;
}

export const CpuDefinitionEditor: React.FC<CpuDefinitionEditorProps> = ({
  initialDefinition,
  onSave,
  onCancel
}) => {
  const manager = getCpuDefinitionManager();

  // Initialize with either the provided definition or a blank template
  const [definition, setDefinition] = useState<Partial<CpuDefinition>>(() => {
    if (initialDefinition) {
      return initialDefinition;
    }
    const blank = manager.createBlankDefinition();
    return blank;
  });

  const [editingRegion, setEditingRegion] = useState<number | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update definition fields
  const updateField = useCallback((field: keyof CpuDefinition, value: unknown) => {
    setDefinition(prev => ({ ...prev, [field]: value }));
    setValidationError(null);
  }, []);

  // Add a new memory region
  const addRegion = useCallback(() => {
    const newRegion: MemoryRegionDefinition = {
      name: 'New Region',
      type: 'flash',
      start: 0x08000000,
      end: 0x0800FFFF,
      size: 0x10000,
      permissions: { read: true, write: false, execute: true }
    };

    setDefinition(prev => ({
      ...prev,
      memoryRegions: [...(prev.memoryRegions || []), newRegion]
    }));
  }, []);

  // Update a memory region
  const updateRegion = useCallback((index: number, region: MemoryRegionDefinition) => {
    setDefinition(prev => {
      const regions = [...(prev.memoryRegions || [])];
      regions[index] = region;
      return { ...prev, memoryRegions: regions };
    });
  }, []);

  // Delete a memory region
  const deleteRegion = useCallback((index: number) => {
    setDefinition(prev => {
      const regions = [...(prev.memoryRegions || [])];
      regions.splice(index, 1);
      return { ...prev, memoryRegions: regions };
    });
    if (editingRegion === index) {
      setEditingRegion(null);
    }
  }, [editingRegion]);

  // Validate definition
  const validate = useCallback((): boolean => {
    if (!definition.id || definition.id.trim() === '') {
      setValidationError('CPU ID is required');
      return false;
    }
    if (!definition.name || definition.name.trim() === '') {
      setValidationError('CPU name is required');
      return false;
    }
    if (!definition.family || definition.family.trim() === '') {
      setValidationError('CPU family is required');
      return false;
    }
    if (!definition.memoryRegions || definition.memoryRegions.length === 0) {
      setValidationError('At least one memory region is required');
      return false;
    }

    // Check for overlapping regions
    const regions = definition.memoryRegions;
    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        const r1 = regions[i];
        const r2 = regions[j];
        if (!(r1.end < r2.start || r2.end < r1.start)) {
          setValidationError(`Memory regions ${i + 1} and ${j + 1} overlap`);
          return false;
        }
      }
    }

    return true;
  }, [definition]);

  // Save definition
  const handleSave = useCallback(() => {
    if (!validate()) return;

    const cpuDef = definition as CpuDefinition;
    manager.saveCustomDefinition(cpuDef);

    if (onSave) {
      onSave(cpuDef);
    }
  }, [definition, validate, manager, onSave]);

  // Export to JSON
  const handleExport = useCallback(() => {
    const json = JSON.stringify(definition, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${definition.id || 'cpu-definition'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [definition]);

  // Import from JSON
  const handleImport = useCallback(() => {
    try {
      const imported = JSON.parse(importText);
      setDefinition(imported);
      setShowImportDialog(false);
      setImportText('');
      setValidationError(null);
    } catch (error) {
      setValidationError(`Invalid JSON: ${error}`);
    }
  }, [importText]);

  // Parse hex address
  const parseAddress = (value: string): number => {
    const cleaned = value.replace(/[^0-9a-fA-F]/g, '');
    return parseInt(cleaned, 16) || 0;
  };

  // Format address as hex
  const formatAddress = (addr: number): string => {
    return '0x' + addr.toString(16).toUpperCase().padStart(8, '0');
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-[#00ff9d]">CPU DEFINITION EDITOR</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="px-3 py-1 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Import JSON
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Validation Error */}
        {validationError && (
          <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-red-300 text-sm">
            {validationError}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-gray-900 rounded p-3">
          <h3 className="text-xs font-bold text-gray-400 mb-3">BASIC INFORMATION</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">CPU ID *</label>
              <input
                type="text"
                value={definition.id || ''}
                onChange={(e) => updateField('id', e.target.value)}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                placeholder="e.g., stm32f407vg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name *</label>
              <input
                type="text"
                value={definition.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                placeholder="e.g., STM32F407VG"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Family *</label>
                <input
                  type="text"
                  value={definition.family || ''}
                  onChange={(e) => updateField('family', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                  placeholder="e.g., ARM Cortex-M4"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Vendor</label>
                <input
                  type="text"
                  value={definition.vendor || ''}
                  onChange={(e) => updateField('vendor', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                  placeholder="e.g., STMicroelectronics"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Architecture</label>
              <select
                value={definition.architecture || ''}
                onChange={(e) => updateField('architecture', e.target.value)}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
              >
                <option value="">Select architecture...</option>
                {Object.entries(
                  architectures.reduce((groups: Record<string, typeof architectures>, arch) => {
                    if (!groups[arch.family]) groups[arch.family] = [];
                    groups[arch.family].push(arch);
                    return groups;
                  }, {})
                ).map(([family, archs]) => (
                  <optgroup key={family} label={family}>
                    {archs.map(arch => (
                      <option key={arch.id} value={arch.name}>
                        {arch.name} - {arch.description}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Flash Size (bytes)</label>
                <input
                  type="number"
                  value={definition.flashSize || ''}
                  onChange={(e) => updateField('flashSize', parseInt(e.target.value) || undefined)}
                  className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                  placeholder="e.g., 1048576"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">RAM Size (bytes)</label>
                <input
                  type="number"
                  value={definition.ramSize || ''}
                  onChange={(e) => updateField('ramSize', parseInt(e.target.value) || undefined)}
                  className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                  placeholder="e.g., 196608"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">CPU URL</label>
                <input
                  type="url"
                  value={definition.url || ''}
                  onChange={(e) => updateField('url', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Datasheet URL</label>
                <input
                  type="url"
                  value={definition.datasheet || ''}
                  onChange={(e) => updateField('datasheet', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Memory Regions */}
        <div className="bg-gray-900 rounded p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-400">MEMORY REGIONS *</h3>
            <button
              onClick={addRegion}
              className="px-3 py-1 text-xs rounded border bg-[#00ff9d]/10 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/20 transition-colors"
            >
              + Add Region
            </button>
          </div>

          <div className="space-y-2">
            {definition.memoryRegions?.map((region, index) => (
              <div key={index} className="bg-gray-800 rounded p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-300">{region.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingRegion(editingRegion === index ? null : index)}
                      className="px-2 py-1 text-xs rounded border border-gray-700 text-gray-400 hover:bg-gray-700 transition-colors"
                    >
                      {editingRegion === index ? 'Done' : 'Edit'}
                    </button>
                    <button
                      onClick={() => deleteRegion(index)}
                      className="px-2 py-1 text-xs rounded border border-red-700 text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingRegion === index && (
                  <div className="mt-2 space-y-2 border-t border-gray-700 pt-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={region.name}
                        onChange={(e) => updateRegion(index, { ...region, name: e.target.value })}
                        className="w-full px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select
                        value={region.type}
                        onChange={(e) => updateRegion(index, { ...region, type: e.target.value as MemoryRegionDefinition['type'] })}
                        className="w-full px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                      >
                        <option value="flash">Flash (Orange)</option>
                        <option value="ram">RAM (Green)</option>
                        <option value="sram">SRAM (Emerald)</option>
                        <option value="peripheral">Peripheral (Blue)</option>
                        <option value="external_ram">External RAM (Purple)</option>
                        <option value="external_device">External Device (Pink)</option>
                        <option value="system">System (Red)</option>
                        <option value="reserved">Reserved (Gray)</option>
                        <option value="rom">ROM</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Address</label>
                        <input
                          type="text"
                          value={formatAddress(region.start)}
                          onChange={(e) => {
                            const start = parseAddress(e.target.value);
                            const size = region.end - region.start + 1;
                            updateRegion(index, { ...region, start, end: start + size - 1, size });
                          }}
                          className="w-full px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-gray-300 font-mono focus:outline-none focus:border-[#0088ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Size (bytes)</label>
                        <input
                          type="number"
                          value={region.size}
                          onChange={(e) => {
                            const size = parseInt(e.target.value) || 0;
                            const end = region.start + size - 1;
                            updateRegion(index, { ...region, size, end });
                          }}
                          className="w-full px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Permissions</label>
                      <div className="flex gap-3">
                        <label className="flex items-center text-xs">
                          <input
                            type="checkbox"
                            checked={region.permissions?.read || false}
                            onChange={(e) => updateRegion(index, {
                              ...region,
                              permissions: { read: e.target.checked, write: region.permissions?.write || false, execute: region.permissions?.execute || false }
                            })}
                            className="mr-1"
                          />
                          Read
                        </label>
                        <label className="flex items-center text-xs">
                          <input
                            type="checkbox"
                            checked={region.permissions?.write || false}
                            onChange={(e) => updateRegion(index, {
                              ...region,
                              permissions: { read: region.permissions?.read || false, write: e.target.checked, execute: region.permissions?.execute || false }
                            })}
                            className="mr-1"
                          />
                          Write
                        </label>
                        <label className="flex items-center text-xs">
                          <input
                            type="checkbox"
                            checked={region.permissions?.execute || false}
                            onChange={(e) => updateRegion(index, {
                              ...region,
                              permissions: { read: region.permissions?.read || false, write: region.permissions?.write || false, execute: e.target.checked }
                            })}
                            className="mr-1"
                          />
                          Execute
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
                      <textarea
                        value={region.description || ''}
                        onChange={(e) => updateRegion(index, { ...region, description: e.target.value })}
                        className="w-full px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {editingRegion !== index && (
                  <div className="text-xs font-mono text-gray-500 space-y-1">
                    <div>Type: {region.type}</div>
                    <div>Range: {formatAddress(region.start)} - {formatAddress(region.end)}</div>
                    <div>Size: {(region.size / 1024).toFixed(1)} KB</div>
                    <div>
                      Permissions: {region.permissions?.read ? 'R' : '-'}
                      {region.permissions?.write ? 'W' : '-'}
                      {region.permissions?.execute ? 'X' : '-'}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {(!definition.memoryRegions || definition.memoryRegions.length === 0) && (
              <div className="text-xs text-gray-500 text-center py-4">
                No memory regions defined. Click &ldquo;Add Region&rdquo; to start.
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-900 rounded p-3">
          <h3 className="text-xs font-bold text-gray-400 mb-2">NOTES</h3>
          <textarea
            value={definition.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-[#0088ff]"
            rows={3}
            placeholder="Additional notes about this CPU..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          * Required fields
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs rounded border bg-[#00ff9d]/10 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/20 transition-colors"
          >
            Save Definition
          </button>
        </div>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-[600px] max-w-[90vw]">
            <h3 className="text-sm font-bold text-[#00ff9d] mb-3">IMPORT CPU DEFINITION</h3>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 font-mono focus:outline-none focus:border-[#0088ff]"
              rows={15}
              placeholder="Paste JSON here..."
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportText('');
                  setValidationError(null);
                }}
                className="px-4 py-2 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 text-xs rounded border bg-[#00ff9d]/10 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/20 transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
