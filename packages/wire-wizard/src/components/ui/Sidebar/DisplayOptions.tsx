/**
 * Display Options Panel
 * Checkboxes for controlling visibility of labels and names
 */

import React from 'react';

interface DisplayOptionsProps {
  showConnectionLabels: boolean;
  showNetNames: boolean;
  showBusNames: boolean;
  setShowConnectionLabels: (show: boolean) => void;
  setShowNetNames: (show: boolean) => void;
  setShowBusNames: (show: boolean) => void;
}

export const DisplayOptions: React.FC<DisplayOptionsProps> = ({
  showConnectionLabels,
  showNetNames,
  showBusNames,
  setShowConnectionLabels,
  setShowNetNames,
  setShowBusNames
}) => {
  return (
    <div style={{
      background: '#1a1a1a',
      padding: '15px',
      borderRadius: '5px',
      border: '1px solid #333',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Display</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px' }}>
          <input
            type="checkbox"
            checked={showConnectionLabels}
            onChange={(e) => setShowConnectionLabels(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Show Connection Labels</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px' }}>
          <input
            type="checkbox"
            checked={showNetNames}
            onChange={(e) => setShowNetNames(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Show Net Names</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px' }}>
          <input
            type="checkbox"
            checked={showBusNames}
            onChange={(e) => setShowBusNames(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Show Bus Names</span>
        </label>
      </div>
    </div>
  );
};
