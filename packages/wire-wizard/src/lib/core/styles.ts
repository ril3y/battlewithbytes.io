/**
 * Wire Wizard Shared Styles
 *
 * Centralized style constants for UI components
 * Eliminates duplication across modal components
 */

import { UI_COLORS } from './constants';

/**
 * Modal overlay style - dark backdrop that covers the screen
 */
export const MODAL_OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
};

/**
 * Modal container style - the modal box itself
 */
export const MODAL_CONTAINER_STYLE: React.CSSProperties = {
  background: UI_COLORS.bgDark,
  border: `2px solid ${UI_COLORS.accent}`,
  borderRadius: '8px',
  padding: '30px',
  minWidth: '400px',
  fontFamily: 'monospace',
  color: UI_COLORS.accent,
};

/**
 * Modal header style
 */
export const MODAL_HEADER_STYLE: React.CSSProperties = {
  margin: '0 0 20px 0',
  fontSize: '18px',
  fontWeight: 'bold',
};

/**
 * Modal input style - text inputs, selects
 */
export const MODAL_INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  background: UI_COLORS.bgMedium,
  border: `1px solid ${UI_COLORS.borderDark}`,
  borderRadius: '3px',
  color: UI_COLORS.accent,
  fontFamily: 'monospace',
  fontSize: '12px',
};

/**
 * Modal label style
 */
export const MODAL_LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  marginBottom: '5px',
  fontSize: '11px',
};

/**
 * Modal field container style
 */
export const MODAL_FIELD_STYLE: React.CSSProperties = {
  marginBottom: '15px',
};

/**
 * Modal button base style - shared by all buttons
 */
export const MODAL_BUTTON_STYLE: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  background: UI_COLORS.bgLight,
  color: UI_COLORS.textSecondary,
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  fontSize: '12px',
};

/**
 * Modal primary button style - for confirm/submit actions
 */
export const MODAL_BUTTON_PRIMARY_STYLE: React.CSSProperties = {
  ...MODAL_BUTTON_STYLE,
  background: UI_COLORS.accent,
  color: '#000',
};

/**
 * Modal button row style - container for buttons
 */
export const MODAL_BUTTON_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '25px',
};

/**
 * Helper to create hover handlers for cancel buttons
 */
export const createCancelButtonHoverHandlers = () => ({
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = UI_COLORS.borderLight;
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = UI_COLORS.bgLight;
  },
});

/**
 * Helper to create hover handlers for primary buttons
 */
export const createPrimaryButtonHoverHandlers = () => ({
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = '#00cc80';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = UI_COLORS.accent;
  },
});
