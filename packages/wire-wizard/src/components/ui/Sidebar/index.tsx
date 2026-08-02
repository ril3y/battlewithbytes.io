/**
 * Main Sidebar Component
 * Modular sidebar for the wire wizard with all editing controls
 *
 * Refactored to use React contexts instead of receiving all props.
 * Only page-local state and functions are passed as props.
 */

import React from 'react';
import type { SidebarProps } from './types';
import { BlockEditor } from './BlockEditor';
import { WiresList } from './WiresList';
import { useDiagram } from '../../../lib/core/contexts/DiagramContext';
import { useSelection } from '../../../lib/core/contexts/SelectionContext';
import { useDisplay } from '../../../lib/core/contexts/DisplayContext';

export const Sidebar: React.FC<SidebarProps> = ({
  // Local editing state
  editingPoint,
  setEditingPoint,
}) => {
  // Get state from contexts
  const { wires } = useDiagram();
  const { selectedBlockId, selectedWireId } = useSelection();
  const { sidebarOpen } = useDisplay();

  return (
    <div style={{
      width: '350px',
      background: '#0a0a0a',
      borderRight: '1px solid #333',
      overflowY: 'auto',
      padding: '20px',
      color: '#00ffa0',
      fontFamily: 'monospace',
      fontSize: '11px',
      transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      position: 'fixed',
      left: 0,
      top: '60px',
      bottom: 0,
      zIndex: 1000,
      boxShadow: sidebarOpen ? '5px 0 15px rgba(0,0,0,0.5)' : 'none'
    }}>
      {/* Selection Info */}
      {selectedBlockId && (
        <div style={{
          background: '#1a1a1a',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #00ffa0',
          marginBottom: '15px'
        }}>
          <div style={{ fontSize: '10px', color: '#888' }}>Selected</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '3px' }}>Block</div>
        </div>
      )}
      {selectedWireId && (
        <div style={{
          background: '#1a1a1a',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #00ffa0',
          marginBottom: '15px'
        }}>
          <div style={{ fontSize: '10px', color: '#888' }}>Selected</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '3px' }}>Wire</div>
        </div>
      )}

      {/* Selected Block Editor */}
      <BlockEditor
        editingPoint={editingPoint}
        setEditingPoint={setEditingPoint}
      />

      {/* Wires */}
      {wires.length > 0 && (
        <WiresList />
      )}
    </div>
  );
};
