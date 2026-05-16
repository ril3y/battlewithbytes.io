import React from 'react';
import { useInteraction, useBlockCreation } from '../../lib/core/contexts/InteractionContext';
import { useSelection } from '../../lib/core/contexts/SelectionContext';

interface CanvasOverlaysProps {
  wireStart: { blockId?: string; pointId?: string; wireId?: string; bendIndex?: number } | null;
}

export const CanvasOverlays: React.FC<CanvasOverlaysProps> = ({
  wireStart
}) => {
  const {
    isBusGroupMode,
    addingToBusWireId,
    placementMode,
    targetBlockId
  } = useInteraction();

  const {
    addBlockMode,
    newBlockShape,
  } = useBlockCreation();

  const {
    selectedWireIds,
    selectedPointId,
    selectedBlockLabelId,
  } = useSelection();

  return (
    <>
      {/* Bus Group Mode Indicator */}
      {isBusGroupMode && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 170, 255, 0.95)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          Bus Group Mode: Click wires to select • {selectedWireIds.length} selected • ESC to cancel
        </div>
      )}

      {/* Add to Bus Mode Indicator */}
      {addingToBusWireId && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(139, 0, 255, 0.95)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          Add to Bus Mode: Click target wire with matching endpoints • ESC to cancel
        </div>
      )}

      {/* Selected Point Indicator */}
      {selectedPointId && (
        <div style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 255, 160, 0.95)',
          color: '#000',
          padding: '10px 20px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          Shift+Click to start wire • Click to edit • Alt+Drag to reposition point • Drag label to move • Press R to rotate
        </div>
      )}

      {/* Selected Block Label Indicator */}
      {selectedBlockLabelId && !selectedPointId && (
        <div style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 255, 160, 0.95)',
          color: '#000',
          padding: '10px 20px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          Block Label Selected • Drag to move • Press R to rotate
        </div>
      )}

      {/* Wire Creation Mode Indicator */}
      {wireStart && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 136, 0, 0.9)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          Wire Mode: Click to add bends • Click destination point to finish • ESC to cancel
        </div>
      )}

      {/* Add Block Mode Indicator */}
      {addBlockMode && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 255, 160, 0.9)',
          color: '#000',
          padding: '10px 20px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          Click canvas to place {newBlockShape} block
        </div>
      )}

      {/* Connection Point Placement Mode Indicator */}
      {placementMode && targetBlockId && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(68, 136, 255, 0.95)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000,
          border: '2px solid #fff',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}>
          Click on block to place connection point • ESC to exit
        </div>
      )}
    </>
  );
};
