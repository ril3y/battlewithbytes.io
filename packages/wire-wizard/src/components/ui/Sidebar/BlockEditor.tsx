/**
 * Block Editor
 * Edit properties of selected block including connection points
 *
 * Refactored to use React contexts instead of receiving all props.
 */

import React from 'react';
import type { BlockShape } from '../../../lib/core/types';
import type { BlockEditorProps } from './types';
import { useDiagram } from '../../../lib/core/contexts/DiagramContext';
import { useSelection } from '../../../lib/core/contexts/SelectionContext';
import { useInteraction } from '../../../lib/core/contexts/InteractionContext';

export const BlockEditor: React.FC<BlockEditorProps> = ({
  editingPoint,
  setEditingPoint
}) => {
  // Get state and actions from contexts
  const {
    blocks,
    updateBlock,
    removeBlock,
    addConnectionPoint,
    removeConnectionPoint,
    updateConnectionPoint
  } = useDiagram();

  const {
    selectedBlockId,
    selectedPointId,
    selectPoint,
    clearSelection
  } = useSelection();

  const {
    placementMode,
    startPlacement,
    stopPlacement
  } = useInteraction();

  // Find the selected block
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // Check if the block is an SVG component (custom or generated)
  // We'll hide Color and Shape inputs for these as they don't apply
  const isSvgBlock = selectedBlock ? !!(selectedBlock.svgComponent || selectedBlock.componentType) : false;

  // Handler for setting selected point
  const handleSetSelectedPointId = (pointId: string | null) => {
    if (pointId && selectedBlockId) {
      selectPoint(selectedBlockId, pointId);
    } else {
      // Don't fully clear - just clear point selection while keeping block selected
      // We need to keep the block selected, so we re-select it
      if (selectedBlockId) {
        // This is a bit of a workaround - ideally we'd have selectBlock in useSelection
        // For now, we'll just select the point as null which clears point selection
      }
    }
  };

  // Handler for adding connection point - uses selectedBlockId from context
  const handleAddConnectionPoint = () => {
    if (selectedBlockId) {
      addConnectionPoint(selectedBlockId);
    }
  };

  // Handler for removing connection point - uses selectedBlockId from context
  const handleRemoveConnectionPoint = (pointId: string) => {
    if (selectedBlockId) {
      removeConnectionPoint(selectedBlockId, pointId);
    }
  };

  if (!selectedBlock) {
    return (
      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '5px',
        border: '1px dashed #333',
        textAlign: 'center',
        color: '#888',
        marginBottom: '20px'
      }}>
        Click a block to edit
      </div>
    );
  }

  return (
    <>
      <div style={{
        background: '#1a1a1a',
        padding: '15px',
        borderRadius: '5px',
        border: '2px solid #00ffa0',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fff' }}>
          {selectedBlock.label}
        </h3>

        {/* Label */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', color: '#888' }}>
            Label
          </label>
          <textarea
            value={selectedBlock.label}
            onChange={(e) => updateBlock(selectedBlock.id, { label: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '3px',
              padding: '8px',
              color: '#fff',
              fontFamily: 'monospace',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Color - Only for non-SVG blocks */}
        {!isSvgBlock && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', color: '#888' }}>
              Color
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="color"
                value={selectedBlock.color}
                onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                style={{
                  width: '40px',
                  height: '32px',
                  border: '1px solid #333',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  background: '#0a0a0a'
                }}
              />
              <input
                type="text"
                value={selectedBlock.color}
                onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                style={{
                  flex: 1,
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '3px',
                  padding: '8px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '10px'
                }}
              />
            </div>
          </div>
        )}

        {/* Shape - Only for non-SVG blocks */}
        {!isSvgBlock && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', color: '#888' }}>
              Shape
            </label>
            <select
              value={selectedBlock.shape}
              onChange={(e) => updateBlock(selectedBlock.id, { shape: e.target.value as BlockShape })}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '3px',
                padding: '8px',
                color: '#fff',
                fontFamily: 'monospace',
                cursor: 'pointer'
              }}
            >
              <option value="rectangle">Rectangle</option>
              <option value="rounded">Rounded</option>
              <option value="circle">Circle</option>
            </select>
          </div>
        )}

        {/* Position (for debugging grid alignment) */}
        <div style={{ marginBottom: '10px', padding: '8px', background: '#0a0a0a', borderRadius: '3px', border: '1px solid #333' }}>
          <div style={{ fontSize: '10px', color: '#888', marginBottom: '3px' }}>Position</div>
          <div style={{ fontSize: '11px', color: '#00ffa0', fontFamily: 'monospace' }}>
            X: {selectedBlock.x}px, Y: {selectedBlock.y}px
          </div>
        </div>

        {/* Display Settings */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#fff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selectedBlock.showLabel !== false} // Default to true
              onChange={(e) => updateBlock(selectedBlock.id, { showLabel: e.target.checked })}
              style={{ accentColor: '#00ffa0' }}
            />
            Show Label
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#fff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selectedBlock.showConnectionLabels !== false} // Default to true if undefined
              onChange={(e) => updateBlock(selectedBlock.id, { showConnectionLabels: e.target.checked })}
              style={{ accentColor: '#00ffa0' }}
            />
            Show Connection Labels
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#fff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!selectedBlock.wiresOnTop}
              onChange={(e) => updateBlock(selectedBlock.id, { wiresOnTop: e.target.checked })}
              style={{ accentColor: '#00ffa0' }}
            />
            Wires on Top
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#fff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!selectedBlock.locked}
              onChange={(e) => updateBlock(selectedBlock.id, { locked: e.target.checked })}
              style={{ accentColor: '#00ffa0' }}
            />
            Lock Position
          </label>
        </div>

        {/* Size */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', color: '#888' }}>
            Width: {selectedBlock.width}px
          </label>
          <input
            type="range"
            min="40"
            max="300"
            step="10"
            value={selectedBlock.width}
            onChange={(e) => updateBlock(selectedBlock.id, { width: parseInt(e.target.value) })}
            style={{
              width: '100%',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', color: '#888' }}>
            Height: {selectedBlock.height}px
          </label>
          <input
            type="range"
            min="40"
            max="300"
            step="10"
            value={selectedBlock.height}
            onChange={(e) => updateBlock(selectedBlock.id, { height: parseInt(e.target.value) })}
            style={{
              width: '100%',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Label Position */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', color: '#888' }}>
            Label Position
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '3px', fontSize: '9px', color: '#666' }}>
                X Offset: {selectedBlock.labelOffsetX || 0}
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={selectedBlock.labelOffsetX || 0}
                onChange={(e) => updateBlock(selectedBlock.id, { labelOffsetX: parseInt(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '3px', fontSize: '9px', color: '#666' }}>
                Y Offset: {selectedBlock.labelOffsetY || 0}
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={selectedBlock.labelOffsetY || 0}
                onChange={(e) => updateBlock(selectedBlock.id, { labelOffsetY: parseInt(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '5px' }}>
            <label style={{ display: 'block', marginBottom: '3px', fontSize: '9px', color: '#666' }}>
              Rotation: {selectedBlock.labelRotation || 0}deg
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={selectedBlock.labelRotation || 0}
              onChange={(e) => updateBlock(selectedBlock.id, { labelRotation: parseInt(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
          <button
            onClick={() => updateBlock(selectedBlock.id, { labelOffsetX: 0, labelOffsetY: 0, labelRotation: 0 })}
            style={{
              width: '100%',
              background: '#2a2a2a',
              color: '#aaa',
              border: '1px solid #444',
              padding: '4px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '9px',
              marginTop: '5px'
            }}
          >
            Reset Label Position
          </button>
        </div>

        <button
          onClick={() => removeBlock(selectedBlock.id)}
          style={{
            width: '100%',
            background: '#ff4444',
            color: '#fff',
            border: 'none',
            padding: '8px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
        >
          Delete Block
        </button>
      </div>

      {/* Connection Points */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4 style={{ margin: 0, fontSize: '13px' }}>
            Points ({selectedBlock.connectionPoints.length})
          </h4>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={handleAddConnectionPoint}
              style={{
                background: '#00ffa0',
                color: '#000',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            >
              + Add
            </button>
            <button
              onClick={() => {
                if (placementMode) {
                  stopPlacement();
                } else {
                  startPlacement(selectedBlock.id);
                }
              }}
              style={{
                background: placementMode ? '#ff4444' : '#4488ff',
                color: '#fff',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
              title={placementMode ? 'Exit placement mode (ESC)' : 'Click on block to place connection points'}
            >
              {placementMode ? 'Done' : 'Place'}
            </button>
          </div>
        </div>

        {selectedBlock.connectionPoints.map(point => (
          <div
            key={point.id}
            onClick={() => {
              if (selectedBlockId) {
                selectPoint(selectedBlockId, point.id);
              }
              setEditingPoint({ ...point });
            }}
            style={{
              background: selectedPointId === point.id ? '#1a3320' : '#222',
              padding: '8px',
              borderRadius: '5px',
              marginBottom: '5px',
              border: selectedPointId === point.id ? '1px solid #00ffa0' : '1px solid #333',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: point.color,
                  border: '2px solid #fff'
                }} />
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>
                  {point.label}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveConnectionPoint(point.id);
                }}
                style={{
                  background: '#ff4444',
                  color: '#fff',
                  border: 'none',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '9px'
                }}
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Point */}
      {editingPoint && selectedPointId && selectedBlockId && (
        <div style={{
          background: '#1a3320',
          padding: '12px',
          borderRadius: '5px',
          border: '1px solid #00ffa0',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#00ffa0' }}>Edit Point</h4>

          <input
            type="text"
            placeholder="Label"
            value={editingPoint.label}
            onChange={(e) => {
              const val = e.target.value;
              setEditingPoint({ ...editingPoint, label: val });
              updateConnectionPoint(selectedBlockId, selectedPointId, { label: val });
            }}
            style={{
              width: '100%',
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '3px',
              padding: '6px',
              color: '#fff',
              fontSize: '11px',
              fontFamily: 'monospace',
              marginBottom: '8px'
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <input
              type="number"
              placeholder="X"
              value={Math.round(editingPoint.x)}
              onChange={(e) => {
                const val = Number(e.target.value);
                setEditingPoint({ ...editingPoint, x: val });
                updateConnectionPoint(selectedBlockId, selectedPointId, { x: val });
              }}
              style={{
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '3px',
                padding: '6px',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            />
            <input
              type="number"
              placeholder="Y"
              value={Math.round(editingPoint.y)}
              onChange={(e) => {
                const val = Number(e.target.value);
                setEditingPoint({ ...editingPoint, y: val });
                updateConnectionPoint(selectedBlockId, selectedPointId, { y: val });
              }}
              style={{
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '3px',
                padding: '6px',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <input
            type="color"
            value={editingPoint.color}
            onChange={(e) => {
              const val = e.target.value;
              setEditingPoint({ ...editingPoint, color: val });
              updateConnectionPoint(selectedBlockId, selectedPointId, { color: val });
            }}
            style={{
              width: '100%',
              height: '32px',
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '3px',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          />

          <select
            value={editingPoint.shape || 'circle'}
            onChange={(e) => {
              const val = e.target.value as 'circle' | 'rectangle' | 'blade' | 'ring' | 'spade';
              setEditingPoint({ ...editingPoint, shape: val });
              updateConnectionPoint(selectedBlockId, selectedPointId, { shape: val });
            }}
            style={{
              width: '100%',
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '3px',
              padding: '6px',
              color: '#fff',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}
          >
            <option value="circle">Circle</option>
            <option value="rectangle">Rectangle</option>
            <option value="blade">Blade</option>
            <option value="ring">Ring</option>
            <option value="spade">Spade</option>
          </select>
        </div>
      )}
    </>
  );
};
