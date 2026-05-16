import React from 'react';
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

// Bus-specific accent color
const BUS_ACCENT = '#00aaff';

interface BusNameModalProps {
  editingBusName: {
    busGroupId: string;
    currentName: string;
  } | null;
  onClose: () => void;
  onSave: (busGroupId: string, name: string) => void;
  onNameChange: (name: string) => void;
}

export const BusNameModal: React.FC<BusNameModalProps> = ({
  editingBusName,
  onClose,
  onSave,
  onNameChange
}) => {
  if (!editingBusName) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSave(editingBusName.busGroupId, editingBusName.currentName);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div style={MODAL_OVERLAY_STYLE} onClick={onClose} onWheel={(e) => e.stopPropagation()}>
      <div
        style={{
          ...MODAL_CONTAINER_STYLE,
          borderColor: BUS_ACCENT,
          color: BUS_ACCENT,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={MODAL_HEADER_STYLE}>Edit Bus Name</h2>

        <div style={MODAL_FIELD_STYLE}>
          <label style={MODAL_LABEL_STYLE}>Bus Name:</label>
          <input
            type="text"
            value={editingBusName.currentName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ ...MODAL_INPUT_STYLE, color: BUS_ACCENT }}
          />
        </div>

        <div style={{ ...MODAL_BUTTON_ROW_STYLE, marginTop: '10px' }}>
          <button onClick={onClose} style={MODAL_BUTTON_STYLE}>
            Cancel
          </button>
          <button
            onClick={() => onSave(editingBusName.busGroupId, editingBusName.currentName)}
            style={{ ...MODAL_BUTTON_PRIMARY_STYLE, background: BUS_ACCENT }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
