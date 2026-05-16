/**
 * Add Block Panel
 * Controls for adding new blocks to the canvas
 */

import React from 'react';
import type { BlockShape } from '../../../lib/core/types';

interface AddBlockPanelProps {
  addBlockMode: boolean;
  newBlockShape: BlockShape;
  setNewBlockShape: (shape: BlockShape) => void;
  setAddBlockMode: (mode: boolean) => void;
}

export const AddBlockPanel: React.FC<AddBlockPanelProps> = ({
  addBlockMode,
  newBlockShape,
  setNewBlockShape,
  setAddBlockMode
}) => {
  return (
    <div style={{
      background: '#1a1a1a',
      padding: '15px',
      borderRadius: '5px',
      border: addBlockMode ? '2px solid #00ffa0' : '1px solid #333',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Add Block</h4>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Shape</label>
        <select
          value={newBlockShape}
          onChange={(e) => setNewBlockShape(e.target.value as BlockShape)}
          style={{
            width: '100%',
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '3px',
            padding: '8px',
            color: '#fff',
            fontFamily: 'monospace'
          }}
        >
          <option value="rounded">Rounded Rectangle</option>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
        </select>
      </div>
      <button
        onClick={() => setAddBlockMode(!addBlockMode)}
        style={{
          width: '100%',
          background: addBlockMode ? '#ff4444' : '#00ffa0',
          color: addBlockMode ? '#fff' : '#000',
          border: 'none',
          padding: '10px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {addBlockMode ? 'Cancel' : 'Click Canvas to Add'}
      </button>
    </div>
  );
};
