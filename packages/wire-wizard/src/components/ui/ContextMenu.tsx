import React, { useState } from 'react';
import type { WireGauge } from '../../lib/core/types';

interface ContextMenuProps {
  contextMenu: {
    x: number;
    y: number;
    wireId?: string;
    blockId?: string;
    isConfigurable?: boolean; // Whether the block is configurable
  } | null;
  onClose: () => void;
  onRemoveWire: (wireId: string) => void;
  onAddToBus: (wireId: string) => void;
  onConfigureBlock?: (blockId: string) => void;
  onDuplicateBlock?: (blockId: string) => void;
  onRemoveBlock?: (blockId: string) => void;
  onMirrorBlockHorizontal?: (blockId: string) => void;
  onMirrorBlockVertical?: (blockId: string) => void;
  onSelectNet?: (wireId: string) => void;
  onSetNet?: (wireId: string, netName: string | null) => void;
  onSetGauge?: (wireId: string, gauge: WireGauge | null) => void;
  onSetWireLayer?: (wireId: string, layer: 'top' | 'bottom' | null) => void;
  onOpenPinout?: (wireId: string) => void;
  /** True when either endpoint of the right-clicked wire is a bus port. */
  wireIsBusPort?: boolean;
  /** Existing nets in the diagram, with a representative color per net. */
  nets?: Array<{ name: string; color: string }>;
  /** Available wire gauges to pick from. */
  availableGauges?: WireGauge[];
  /** Current wire's net + gauge + layer so the dropdowns reflect actual state. */
  currentNet?: string | null;
  currentGauge?: WireGauge | null;
  currentWireLayer?: 'top' | 'bottom' | null;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenu,
  onClose,
  onRemoveWire,
  onAddToBus,
  onConfigureBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onMirrorBlockHorizontal,
  onMirrorBlockVertical,
  onSelectNet,
  onSetNet,
  onSetGauge,
  onSetWireLayer,
  onOpenPinout,
  wireIsBusPort = false,
  nets = [],
  availableGauges = [],
  currentNet = null,
  currentGauge = null,
  currentWireLayer = null,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!contextMenu) return null;

  const itemStyle = (key: string, color: string, withBorder = true): React.CSSProperties => ({
    padding: '10px 15px',
    cursor: 'pointer',
    background: hoveredItem === key ? '#2a2a2a' : '#1a1a1a',
    color,
    borderBottom: withBorder ? '1px solid #333' : 'none',
    fontWeight: 'bold',
  });

  const dropdownRowStyle: React.CSSProperties = {
    padding: '8px 15px',
    background: '#1a1a1a',
    borderBottom: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const dropdownStyle: React.CSSProperties = {
    flex: 1,
    background: '#0a0a0a',
    border: '1px solid #555',
    color: '#fff',
    padding: '4px 6px',
    borderRadius: '3px',
    fontSize: '11px',
    fontFamily: 'monospace',
    cursor: 'pointer',
  };

  const dropdownLabelStyle: React.CSSProperties = {
    color: '#aaa',
    fontSize: '10px',
    minWidth: '40px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: contextMenu.x,
        top: contextMenu.y,
        background: '#1a1a1a',
        border: '2px solid #00ffa0',
        borderRadius: '5px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        minWidth: '220px',
        fontFamily: 'monospace',
        fontSize: '11px',
        overflow: 'hidden',
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      {contextMenu.wireId && (
        <>
          {onOpenPinout && wireIsBusPort && (
            <div
              onClick={() => {
                onOpenPinout(contextMenu.wireId!);
                onClose();
              }}
              style={itemStyle('pinout', '#00aaff')}
              onMouseEnter={() => setHoveredItem('pinout')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              View Pinout
            </div>
          )}

          <div
            onClick={() => {
              onRemoveWire(contextMenu.wireId!);
              onClose();
            }}
            style={itemStyle('delete', '#ff4444')}
            onMouseEnter={() => setHoveredItem('delete')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            Delete Wire
          </div>

          {onSelectNet && (
            <div
              onClick={() => {
                onSelectNet(contextMenu.wireId!);
                onClose();
              }}
              style={itemStyle('selectNet', '#00ffa0')}
              onMouseEnter={() => setHoveredItem('selectNet')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Select Whole Net
            </div>
          )}

          {/* Net dropdown */}
          {onSetNet && (
            <div style={dropdownRowStyle} onClick={(e) => e.stopPropagation()}>
              <span style={dropdownLabelStyle}>Net</span>
              <select
                value={currentNet ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onSetNet(contextMenu.wireId!, val === '' ? null : val);
                  onClose();
                }}
                style={dropdownStyle}
              >
                <option value="">— None —</option>
                {nets.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Gauge dropdown */}
          {onSetGauge && availableGauges.length > 0 && (
            <div style={dropdownRowStyle} onClick={(e) => e.stopPropagation()}>
              <span style={dropdownLabelStyle}>Gauge</span>
              <select
                value={currentGauge ?? ''}
                onChange={(e) => {
                  const val = e.target.value as WireGauge | '';
                  onSetGauge(contextMenu.wireId!, val === '' ? null : val);
                  onClose();
                }}
                style={dropdownStyle}
              >
                <option value="">— Default —</option>
                {availableGauges.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Wire layer override */}
          {onSetWireLayer && (
            <div style={dropdownRowStyle} onClick={(e) => e.stopPropagation()}>
              <span style={dropdownLabelStyle}>Layer</span>
              <select
                value={currentWireLayer ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onSetWireLayer(contextMenu.wireId!, val === '' ? null : (val as 'top' | 'bottom'));
                  onClose();
                }}
                style={dropdownStyle}
              >
                <option value="">— Auto (use blocks) —</option>
                <option value="top">Always on top</option>
                <option value="bottom">Always below</option>
              </select>
            </div>
          )}

          <div
            onClick={() => {
              onAddToBus(contextMenu.wireId!);
              onClose();
            }}
            style={itemStyle('bus', '#00aaff', false)}
            onMouseEnter={() => setHoveredItem('bus')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            Add to Bus
          </div>
        </>
      )}

      {/* Block Context Menu */}
      {contextMenu.blockId && (
        <>
          {onConfigureBlock && contextMenu.isConfigurable && (
            <div
              onClick={() => {
                onConfigureBlock(contextMenu.blockId!);
                onClose();
              }}
              style={itemStyle('config', '#fff')}
              onMouseEnter={() => setHoveredItem('config')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Configure Component
            </div>
          )}
          {onDuplicateBlock && (
            <div
              onClick={() => {
                onDuplicateBlock(contextMenu.blockId!);
                onClose();
              }}
              style={itemStyle('duplicate', '#00ffa0')}
              onMouseEnter={() => setHoveredItem('duplicate')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Duplicate
            </div>
          )}
          {onMirrorBlockHorizontal && (
            <div
              onClick={() => {
                onMirrorBlockHorizontal(contextMenu.blockId!);
                onClose();
              }}
              style={itemStyle('mirrorH', '#fff')}
              onMouseEnter={() => setHoveredItem('mirrorH')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Mirror Horizontal
            </div>
          )}
          {onMirrorBlockVertical && (
            <div
              onClick={() => {
                onMirrorBlockVertical(contextMenu.blockId!);
                onClose();
              }}
              style={itemStyle('mirrorV', '#fff')}
              onMouseEnter={() => setHoveredItem('mirrorV')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Mirror Vertical
            </div>
          )}
          {onRemoveBlock && (
            <div
              onClick={() => {
                onRemoveBlock(contextMenu.blockId!);
                onClose();
              }}
              style={itemStyle('deleteBlock', '#ff4444', false)}
              onMouseEnter={() => setHoveredItem('deleteBlock')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Delete
            </div>
          )}
        </>
      )}
    </div>
  );
};
