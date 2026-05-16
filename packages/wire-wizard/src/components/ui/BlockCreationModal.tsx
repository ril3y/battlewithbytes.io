import React, { useState, useEffect } from 'react';
import type { BlockShape } from '../../lib/core/types';
import { DEFAULT_BLOCK_DATA } from '../../lib/core/constants';
import {
  MODAL_OVERLAY_STYLE,
  MODAL_CONTAINER_STYLE,
  MODAL_HEADER_STYLE,
  MODAL_INPUT_STYLE,
  MODAL_LABEL_STYLE,
  MODAL_FIELD_STYLE,
  MODAL_BUTTON_STYLE,
  MODAL_BUTTON_PRIMARY_STYLE,
  MODAL_BUTTON_ROW_STYLE,
} from '../../lib/core/styles';

export interface BlockData {
  label: string;
  color: string;
  shape: BlockShape;
  width: number;
  height: number;
}

interface BlockCreationModalProps {
  showModal: boolean;
  onClose: () => void;
  onCreate: (data: BlockData) => void;
}

export const BlockCreationModal: React.FC<BlockCreationModalProps> = ({
  showModal,
  onClose,
  onCreate
}) => {
  // Manage internal state - reset when modal opens
  const [data, setData] = useState<BlockData>({
    label: DEFAULT_BLOCK_DATA.label,
    color: DEFAULT_BLOCK_DATA.color,
    shape: DEFAULT_BLOCK_DATA.shape,
    width: DEFAULT_BLOCK_DATA.width,
    height: DEFAULT_BLOCK_DATA.height
  });

  // Reset state when modal opens
  useEffect(() => {
    if (showModal) {
      setData({
        label: DEFAULT_BLOCK_DATA.label,
        color: DEFAULT_BLOCK_DATA.color,
        shape: DEFAULT_BLOCK_DATA.shape,
        width: DEFAULT_BLOCK_DATA.width,
        height: DEFAULT_BLOCK_DATA.height
      });
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div style={MODAL_OVERLAY_STYLE} onClick={onClose} onWheel={(e) => e.stopPropagation()}>
      <div style={MODAL_CONTAINER_STYLE} onClick={(e) => e.stopPropagation()}>
        <h2 style={MODAL_HEADER_STYLE}>Create New Block</h2>

        <div style={MODAL_FIELD_STYLE}>
          <label style={MODAL_LABEL_STYLE}>Label:</label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => setData({...data, label: e.target.value})}
            style={MODAL_INPUT_STYLE}
          />
        </div>

        <div style={MODAL_FIELD_STYLE}>
          <label style={MODAL_LABEL_STYLE}>Color:</label>
          <input
            type="color"
            value={data.color}
            onChange={(e) => setData({...data, color: e.target.value})}
            style={{
              ...MODAL_INPUT_STYLE,
              height: '40px',
              padding: '4px',
              cursor: 'pointer',
            }}
          />
        </div>

        <div style={MODAL_FIELD_STYLE}>
          <label style={MODAL_LABEL_STYLE}>Shape:</label>
          <select
            value={data.shape}
            onChange={(e) => setData({...data, shape: e.target.value as BlockShape})}
            style={{ ...MODAL_INPUT_STYLE, cursor: 'pointer' }}
          >
            <option value="rounded">Rounded Rectangle</option>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="hexagon">Hexagon</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={MODAL_LABEL_STYLE}>Width:</label>
            <input
              type="number"
              value={data.width}
              onChange={(e) => setData({...data, width: parseInt(e.target.value) || 100})}
              style={MODAL_INPUT_STYLE}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={MODAL_LABEL_STYLE}>Height:</label>
            <input
              type="number"
              value={data.height}
              onChange={(e) => setData({...data, height: parseInt(e.target.value) || 80})}
              style={MODAL_INPUT_STYLE}
            />
          </div>
        </div>

        <div style={MODAL_BUTTON_ROW_STYLE}>
          <button onClick={onClose} style={MODAL_BUTTON_STYLE}>
            Cancel
          </button>
          <button onClick={() => onCreate(data)} style={MODAL_BUTTON_PRIMARY_STYLE}>
            Create Block
          </button>
        </div>
      </div>
    </div>
  );
};
