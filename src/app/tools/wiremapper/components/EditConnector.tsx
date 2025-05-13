'use client';

import React, { useState, useEffect } from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Connector, Pin } from '../types';

// Define the type for items in the pinLayout state
interface PinLayoutItem {
  pos: number;
  row: number;
  col: number;
  visible: boolean;
  color?: string; // Make color optional as it might not always be set
}

interface EditConnectorProps {
  connectorId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const EditConnector: React.FC<EditConnectorProps> = ({ connectorId, onComplete, onCancel }) => {
  const { connectors, updateConnector } = useWireMapperStore();
  const connector = connectors.find(c => c.id === connectorId);

  const [name, setName] = useState('');
  const [type, setType] = useState('generic');
  const [rows, setRows] = useState(connector?.rows || 1);
  const [cols, setCols] = useState(connector?.cols || 8);
  const [gender, setGender] = useState(connector?.gender || 'male');
  const [pinLayout, setPinLayout] = useState<PinLayoutItem[]>([]); // Use PinLayoutItem type
  const [pinRemovalMode, setPinRemovalMode] = useState<'skip' | 'reindex'>('skip');
  const [viewMode, setViewMode] = useState<'basic' | 'rows' | 'advanced'>('basic');
  const [rowPinCounts, setRowPinCounts] = useState<number[]>([]);
  const [customLayout, setCustomLayout] = useState<string>('');
  const [presetLayout, setPresetLayout] = useState<'grid' | 'offset' | 'custom'>('grid');
  const [editMode, setEditMode] = useState<'standard' | 'advanced'>('standard');

  // Initialize form with connector data
  useEffect(() => {
    if (connector) {
      setName(connector.name);
      setType(connector.type);
      setRows(connector.rows);
      setCols(connector.cols);
      setGender(connector.gender);

      // Initialize pinLayout with data from connector.pins if available, or create default
      const initialPinLayout = Array.from({ length: connector.rows * connector.cols }).map((_, index) => {
        const row = Math.floor(index / connector.cols);
        const col = index % connector.cols;
        const pos = index + 1;
        // Try find existing pin data (including visibility and color)
        const existingPin = connector.pins.find(p => p.pos === pos);
        return {
          pos,
          row,
          col,
          visible: existingPin?.visible !== undefined ? existingPin.visible : true, // Default to visible
          color: existingPin?.color // Include color if available
        };
      });
      setPinLayout(initialPinLayout);

      // Initialize rowPinCounts based on existing pins or default cols
      const counts = Array(connector.rows).fill(0);
      connector.pins.forEach(pin => {
        const row = Math.floor((pin.pos - 1) / connector.cols);
        if (row >= 0 && row < connector.rows) {
          counts[row]++;
        }
      });
      // Set default full row if empty
      const defaultCounts = counts.map(count => count === 0 ? connector.cols : count);
      setRowPinCounts(defaultCounts);

      // Check if connector has a non-standard layout
      const hasAllPins = connector.pins.length === connector.rows * connector.cols;
      if (!hasAllPins) {
        setPresetLayout('custom');
        setEditMode('advanced');
      }
    } else {
      // Generate initial pin layout if no explicit pins (basic mode)
      const newPinLayout = Array.from({ length: rows * cols }).map((_, index) => ({
        pos: index + 1,
        row: Math.floor(index / cols),
        col: index % cols,
        visible: true, // Default to visible
        color: '#00ff9d' // Default color
      }));
      setPinLayout(newPinLayout);
      setRowPinCounts(Array(rows).fill(cols));
    }
  }, [connector, rows, cols]); // Add dependencies

  // Handle changes in rows or cols to update pinLayout
  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRows = parseInt(e.target.value, 10);
    if (!isNaN(newRows) && newRows > 0) {
      setRows(newRows);
      if (editMode !== 'advanced') {
        const newLayout = Array.from({ length: newRows * cols }).map((_, index) => {
          const pos = index + 1;
          const existingPin = pinLayout.find(p => p.pos === pos);
          return {
            pos,
            row: Math.floor(index / cols),
            col: index % cols,
            visible: existingPin?.visible ?? true, // Preserve visibility
            color: existingPin?.color // Preserve color
          };
        });
        setPinLayout(newLayout);
        setRowPinCounts(Array(newRows).fill(cols));
      }
    }
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCols = parseInt(e.target.value, 10);
    if (!isNaN(newCols) && newCols > 0) {
      setCols(newCols);
      // Regenerate layout only if not in advanced mode, preserving visibility
      if (editMode !== 'advanced') {
        const newLayout = Array.from({ length: rows * newCols }).map((_, index) => {
          const pos = index + 1;
          const existingPin = pinLayout.find(p => p.pos === pos);
          return {
            pos,
            row: Math.floor(index / newCols),
            col: index % newCols,
            visible: existingPin?.visible ?? true, // Preserve visibility
            color: existingPin?.color // Preserve color
          };
        });
        setPinLayout(newLayout);
        setRowPinCounts(Array(rows).fill(newCols));
      }
    }
  };

  if (!connector) {
    return <div>Connector not found</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In standard mode, update basic properties and reset pins to default grid
    if (editMode === 'standard') {
      // When changing rows/cols in standard mode, recreate all pins
      updateConnector(connectorId, {
        name,
        type,
        rows, 
        cols,
        gender,
        // Create default pins (all visible)
        pins: Array(rows * cols).fill(0).map((_, i) => ({
          pos: i + 1,
          name: `Pin ${i + 1}`,
          color: '#00ff9d',
          visible: true
        }))
      });
    } else {
      // In advanced mode, update with custom pin layout
      if (presetLayout === 'grid') {
        // All pins visible in grid layout
        updateConnector(connectorId, {
          name,
          type,
          rows, 
          cols,
          gender,
          pins: Array(rows * cols).fill(0).map((_, i) => ({
            pos: i + 1,
            name: `Pin ${i + 1}`,
            color: '#00ff9d',
            visible: true
          }))
        });
      } else if (rowPinCounts.some(count => count !== cols)) {
        // Using row-based pin configuration
        let pins = [];
        let pinNumber = 1;
        let currentPosIndex = 0; // Track original position for stable IDs if needed
        
        // Generate pins based on row pin counts
        for (let row = 0; row < rows; row++) {
          const pinsInRow = rowPinCounts[row] || cols;
          
          // Calculate left padding for centering if needed
          const emptySpace = cols - pinsInRow;
          const leftPadding = Math.floor(emptySpace / 2);
          
          for (let i = 0; i < pinsInRow; i++) {
            const actualCol = leftPadding + i;
            const originalPos = (row * cols) + actualCol + 1; // Estimate original grid position
            
            pins.push({
              // Use sequential numbering if reindexing, otherwise try to keep original pos
              pos: pinRemovalMode === 'reindex' ? pinNumber++ : originalPos,
              name: `Pin ${pinRemovalMode === 'reindex' ? pinNumber-1 : originalPos}`,
              color: '#00ff9d',
              row,
              col: actualCol,
              visible: true
            });
            currentPosIndex++;
          }
        }
        
        updateConnector(connectorId, {
          name,
          type,
          rows, 
          cols,
          gender,
          // Filter out potential duplicate pos if using originalPos in skip mode
          // And sort by position
          pins: pins.filter((pin, index, self) => 
            index === self.findIndex((p) => p.pos === pin.pos)
          ).sort((a,b) => a.pos - b.pos)
        });
      } else {
        // Custom or offset layout - only include visible pins
        const visiblePins = pinLayout
          .filter(pin => pin.visible)
          // Ensure row/col data is included
          .map((pin, index) => ({
            pos: pinRemovalMode === 'reindex' ? index + 1 : pin.pos, // Apply reindexing if needed
            name: `Pin ${pinRemovalMode === 'reindex' ? index + 1 : pin.pos}`,
            color: pin.color || '#00ff9d', // Use existing pin color or default
            row: pin.row,
            col: pin.col,
            visible: true
          }));
          
        updateConnector(connectorId, {
          name,
          type,
          rows, 
          cols,
          gender,
          // Sort by position just in case
          pins: visiblePins.sort((a,b) => a.pos - b.pos)
        });
      }
    }
    
    onComplete();
  };

  const handleTogglePin = (pos: number) => {
    setPinLayout(prev => {
      const result = prev.map(pin => 
        pin.pos === pos ? { ...pin, visible: !pin.visible } : pin
      );
      
      // If we're in reindex mode, we need to renumber the pins
      if (pinRemovalMode === 'reindex') {
        const visiblePins = result.filter(p => p.visible).sort((a, b) => {
          // Sort by row first, then by column
          if (a.row !== b.row) return a.row - b.row;
          return a.col - b.col;
        });
        
        // Renumber visible pins sequentially
        return result.map(pin => {
          if (!pin.visible) return pin;
          const index = visiblePins.findIndex(p => p.pos === pin.pos);
          return { ...pin, pos: index + 1 };
        });
      }
      
      return result;
    });
  };
  
  const updateRowPinCount = (rowIndex: number, count: number) => {
    setRowPinCounts(prev => {
      const newCounts = [...prev];
      newCounts[rowIndex] = Math.min(count, cols);  // Ensure count doesn't exceed columns
      return newCounts;
    });
  };

  const resetLayoutToGrid = () => {
    setPresetLayout('grid');
    setPinLayout(prev => prev.map(pin => ({ ...pin, visible: true })));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl text-green-400 font-mono mb-4">Edit Connector</h2>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded ${editMode === 'standard' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'}`}
              onClick={() => setEditMode('standard')}
            >
              Standard
            </button>
            <button 
              className={`px-3 py-1 rounded text-xs ${editMode === 'advanced' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setEditMode('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">Type</label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              placeholder="e.g. JST, Molex, etc."
            />
          </div>
          
          {editMode === 'standard' && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    value={rows}
                    onChange={handleRowsChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    value={cols}
                    onChange={handleColsChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              </div>
            </>
          )}
          
          {editMode === 'advanced' && (
            <div className="mt-2 p-3 bg-gray-850 rounded border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Pin Layout Options:</div>
              
              {/* Pin Removal Mode Selection */}
              <div className="mb-2">
                <label className="text-sm text-gray-400 block mb-1">Pin Removal Mode:</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={pinRemovalMode === 'skip'}
                      onChange={() => setPinRemovalMode('skip')}
                      className="text-green-500 focus:ring-green-400"
                    />
                    <span className="ml-2 text-gray-300 text-xs">Skip (1, 2, X, 4)</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={pinRemovalMode === 'reindex'}
                      onChange={() => setPinRemovalMode('reindex')}
                      className="text-green-500 focus:ring-green-400"
                    />
                    <span className="ml-2 text-gray-300 text-xs">Reindex (1, 2, 3)</span>
                  </label>
                </div>
              </div>
              
              {/* Row-based Configuration */}
              <div className="mb-3">
                <label className="text-sm text-gray-400 block mb-1">Row Pin Counts:</label>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={`row-config-${rowIndex}`} className="flex items-center">
                      {/* Simplified label */}
                      <span className="mr-2 text-xs text-gray-400">R{rowIndex + 1}:</span>
                      <input
                        type="number"
                        min="0"
                        max={cols}
                        value={rowPinCounts[rowIndex] || cols}
                        onChange={(e) => updateRowPinCount(rowIndex, parseInt(e.target.value) || 0)}
                        className="w-12 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Layout Preset Selector */}
              <div className="mb-3 flex space-x-2">
                <button
                  type="button"
                  className={`px-2 py-1 text-xs rounded ${presetLayout === 'grid' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'}`}
                  onClick={() => {
                    setPresetLayout('grid');
                    // Standard grid layout - all pins visible
                    setPinLayout(prev => prev.map(pin => ({ ...pin, visible: true })));
                  }}
                >
                  Standard Grid
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 text-xs rounded ${presetLayout === 'offset' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'}`}
                  onClick={() => {
                    setPresetLayout('offset');
                    // Create an offset/staggered pin layout like 7-6-6-7
                    if (rows >= 4) {
                      const newLayout = pinLayout.map(pin => {
                        let visible = true;
                        // For rows 1 and 4 (index 0 and 3), show all pins
                        // For rows 2 and 3 (index 1 and 2), hide the first and last pin if there are enough columns
                        if ((pin.row === 1 || pin.row === 2) && cols > 2) {
                          if (pin.col === 0 || pin.col === cols - 1) {
                            visible = false;
                          }
                        }
                        return { ...pin, visible };
                      });
                      setPinLayout(newLayout);
                    }
                  }}
                >
                  Offset (7-6-6-7)
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 text-xs rounded ${presetLayout === 'custom' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300'}`}
                  onClick={() => setPresetLayout('custom')}
                >
                  Custom
                </button>
              </div>
              
              {/* Visual Pin Editor */}
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Pin Preview:</div>
                <div 
                  className="grid gap-2 bg-gray-900 p-2 rounded border border-gray-700"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {pinLayout.map(pin => {
                    // Calculate the displayed number based on reindex mode
                    let displayPos: number | string = pin.pos;
                    if (pin.visible && pinRemovalMode === 'reindex') {
                      const visiblePins = pinLayout
                        .filter(p => p.visible)
                        .sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col); // Ensure consistent order
                      const reindexPos = visiblePins.findIndex(p => p.pos === pin.pos);
                      if (reindexPos !== -1) {
                        displayPos = reindexPos + 1;
                      }
                    } else if (!pin.visible) {
                      displayPos = 'X';
                    }
                    
                    return (
                      <button
                        key={`pin-vis-${pin.pos}`}
                        type="button" // Prevent form submission
                        onClick={() => handleTogglePin(pin.pos)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-mono border-2 ${pin.visible ? 'border-green-500 bg-gray-700 text-white' : 'border-gray-600 bg-gray-800 text-gray-500'}`}
                      >
                        {/* Display calculated position */}
                        {displayPos}
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Active pins: {pinLayout.filter(p => p.visible).length} of {rows * cols}
                </div>
                <button 
                  type="button" // Prevent form submission
                  onClick={resetLayoutToGrid}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  Reset to Grid
                </button>
              </div>

              {/* Tooltip */}
              <p className="text-xs text-yellow-500 mt-3">
                💡 Click pins to toggle them on/off to create custom layouts.
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">Gender</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="mr-1"
                />
                <span className="text-gray-300 text-sm">Male</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="mr-1"
                />
                <span className="text-gray-300 text-sm">Female</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-900 text-green-300 rounded hover:bg-green-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
