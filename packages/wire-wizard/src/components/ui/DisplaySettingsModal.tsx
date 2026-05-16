import React from 'react';
import {
    MODAL_OVERLAY_STYLE,
    MODAL_CONTAINER_STYLE,
    MODAL_BUTTON_PRIMARY_STYLE,
} from '../../lib/core/styles';
import { UI_COLORS } from '../../lib/core/constants';

interface DisplaySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showConnectionLabels: boolean;
    showNetNames: boolean;
    showBusNames: boolean;
    setShowConnectionLabels: (show: boolean) => void;
    setShowNetNames: (show: boolean) => void;
    setShowBusNames: (show: boolean) => void;
}

const checkboxLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
};

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({
    isOpen,
    onClose,
    showConnectionLabels,
    showNetNames,
    showBusNames,
    setShowConnectionLabels,
    setShowNetNames,
    setShowBusNames
}) => {
    if (!isOpen) return null;

    return (
        <div style={MODAL_OVERLAY_STYLE} onClick={onClose} onWheel={(e) => e.stopPropagation()}>
            <div
                style={{
                    ...MODAL_CONTAINER_STYLE,
                    padding: '24px',
                    minWidth: '300px',
                    width: '300px',
                    borderWidth: '1px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    borderBottom: `1px solid ${UI_COLORS.borderDark}`,
                    paddingBottom: '10px'
                }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Display Settings</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: UI_COLORS.textMuted,
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '0 5px'
                        }}
                    >
                        x
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label style={checkboxLabelStyle}>
                        <input
                            type="checkbox"
                            checked={showConnectionLabels}
                            onChange={(e) => setShowConnectionLabels(e.target.checked)}
                            style={{ accentColor: UI_COLORS.accent }}
                        />
                        Show Connection Labels
                    </label>

                    <label style={checkboxLabelStyle}>
                        <input
                            type="checkbox"
                            checked={showNetNames}
                            onChange={(e) => setShowNetNames(e.target.checked)}
                            style={{ accentColor: UI_COLORS.accent }}
                        />
                        Show Net Names
                    </label>

                    <label style={checkboxLabelStyle}>
                        <input
                            type="checkbox"
                            checked={showBusNames}
                            onChange={(e) => setShowBusNames(e.target.checked)}
                            style={{ accentColor: UI_COLORS.accent }}
                        />
                        Show Bus Names
                    </label>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                    <button
                        onClick={onClose}
                        style={{
                            ...MODAL_BUTTON_PRIMARY_STYLE,
                            flex: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                        }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
