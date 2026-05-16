import React from 'react';

interface HeaderBarProps {
  onNew: () => void;
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenComponentLibrary?: () => void;
  onOpenComponentEditor?: () => void;
  onOpenSettings: () => void;
  /**
   * Optional "back" link rendered at the top-left. Host passes a hostname /
   * route appropriate for its app (e.g. `/tools` on battlewithbytes.io).
   */
  backLink?: { href: string; label: string };
}

// Styled button component for consistency
const HeaderButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'purple';
  children: React.ReactNode;
  title?: string;
  /** Stable identifier for host-level tours / onboarding overlays to target. */
  tourId?: string;
}> = ({ onClick, disabled, variant = 'secondary', children, title, tourId }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Roboto Mono, monospace',
    fontWeight: 'bold',
    fontSize: '11px',
    transition: 'all 0.2s',
    opacity: disabled ? 0.4 : 1,
  };

  const variants = {
    primary: {
      borderColor: '#00ffa0',
      color: isHovered ? '#000' : '#00ffa0',
      background: isHovered ? '#00ffa0' : 'transparent',
      boxShadow: isHovered ? '0 0 15px rgba(0, 255, 160, 0.4)' : 'none',
    },
    secondary: {
      borderColor: '#444',
      color: isHovered ? '#fff' : '#888',
      background: isHovered ? '#333' : 'transparent',
    },
    danger: {
      borderColor: '#ff4444',
      color: isHovered ? '#fff' : '#ff4444',
      background: isHovered ? '#ff4444' : 'transparent',
      boxShadow: isHovered ? '0 0 15px rgba(255, 68, 68, 0.4)' : 'none',
    },
    purple: {
      borderColor: '#a855f7',
      color: isHovered ? '#fff' : '#a855f7',
      background: isHovered ? '#a855f7' : 'transparent',
      boxShadow: isHovered ? '0 0 15px rgba(168, 85, 247, 0.4)' : 'none',
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-wire-wizard-tour={tourId}
      style={{ ...baseStyle, ...variants[variant] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onNew,
  onExport,
  onImport,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenComponentLibrary,
  onOpenComponentEditor,
  onOpenSettings,
  backLink,
}) => {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)',
      borderBottom: '1px solid #00ffa0',
      boxShadow: '0 2px 20px rgba(0, 255, 160, 0.15)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      position: 'relative',
    }}>
      {/* Back link (host-provided) */}
      {backLink && (
        <a
          href={backLink.href}
          style={{
            position: 'absolute',
            top: 6,
            left: 16,
            fontFamily: 'Roboto Mono, monospace',
            fontSize: '11px',
            color: '#888',
            textDecoration: 'none',
            transition: 'color 0.2s',
            letterSpacing: '1px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00ffa0')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
        >
          ← {backLink.label}
        </a>
      )}

      {/* Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img
          src="/wire_wizard.png"
          alt="Wire Wizard"
          style={{
            width: '80px',
            height: '80px',
            filter: 'drop-shadow(0 0 10px rgba(0, 255, 160, 0.3))',
          }}
        />
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            fontFamily: 'Roboto Mono, monospace',
            color: '#00ffa0',
            textShadow: '0 0 20px rgba(0, 255, 160, 0.5)',
            letterSpacing: '3px',
          }}>
            WIRE WIZARD
          </h1>
          <div style={{
            fontSize: '10px',
            color: '#444',
            fontFamily: 'Roboto Mono, monospace',
            letterSpacing: '2px',
            marginTop: '2px',
          }}>
            CIRCUIT DESIGNER
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Button Groups */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>

        {/* File Operations */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#333', fontSize: '10px', fontFamily: 'Roboto Mono, monospace', marginRight: '4px' }}>FILE</span>
          <HeaderButton
            onClick={() => {
              if (confirm('Create new diagram? Current work will be lost unless saved.')) {
                onNew();
              }
            }}
            variant="secondary"
            tourId="new"
          >
            New
          </HeaderButton>
          <HeaderButton onClick={onImport} variant="secondary" tourId="import">
            Import
          </HeaderButton>
          <HeaderButton onClick={onExport} variant="primary" tourId="export">
            Export
          </HeaderButton>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '40px', background: 'linear-gradient(180deg, transparent 0%, #333 50%, transparent 100%)' }} />

        {/* Edit Operations */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#333', fontSize: '10px', fontFamily: 'Roboto Mono, monospace', marginRight: '4px' }}>EDIT</span>
          <HeaderButton onClick={onUndo} disabled={!canUndo} variant="secondary">
            Undo
          </HeaderButton>
          <HeaderButton onClick={onRedo} disabled={!canRedo} variant="secondary">
            Redo
          </HeaderButton>
          <HeaderButton
            onClick={() => {
              if (confirm('Clear all blocks and wires? This cannot be undone.')) {
                onClear();
              }
            }}
            variant="danger"
          >
            Clear
          </HeaderButton>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '40px', background: 'linear-gradient(180deg, transparent 0%, #333 50%, transparent 100%)' }} />

        {/* Components */}
        {onOpenComponentLibrary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeaderButton onClick={onOpenComponentLibrary} variant="purple" tourId="components">
              Components
            </HeaderButton>
          </div>
        )}

        {/* Settings */}
        <HeaderButton onClick={onOpenSettings} variant="secondary" title="Display Settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </HeaderButton>
      </div>
    </div>
  );
};
