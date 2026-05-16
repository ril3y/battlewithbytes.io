'use client';

import React, { useEffect } from 'react';
import {
  WireWizardProvider,
  useDiagram,
  useInteraction,
  useDisplay,
} from './lib/core/contexts';
import { HeaderBar } from './components/ui/HeaderBar';
import { Sidebar } from './components/ui/Sidebar';
import { DisplaySettingsModal } from './components/ui/DisplaySettingsModal';
import { CanvasArea } from './components/canvas/CanvasArea';
import {
  exportToFile,
  importFromFile,
  clearAllData,
} from './lib/persistence/fileOperations';
import type { DiagramData } from './lib/core/types';

export interface WireWizardEditorProps {
  /** Diagram to load on first mount. After mount, the editor manages its own state. */
  initialDiagram?: Partial<DiagramData>;
  /**
   * localStorage key for autosave/autoload. `null` disables persistence.
   * Default: `'wire-wizard-diagram'`.
   */
  storageKey?: string | null;
  /** Fires whenever the diagram changes; useful for parent-driven autosave/upload. */
  onChange?: (diagram: DiagramData) => void;
  /** When true (default), the editor fills 100vw x 100vh. */
  fullScreen?: boolean;
  /**
   * Optional back-link rendered top-left in the editor header. Use to send
   * users back to the host app's tool index, e.g. `{ href: '/tools', label: 'Tools' }`.
   */
  backLink?: { href: string; label: string };
}

function WiringEditor({
  onChange,
  backLink,
}: {
  onChange?: (d: DiagramData) => void;
  backLink?: { href: string; label: string };
}) {
  const {
    blocks,
    wires,
    busGroups,
    setBlocks,
    setWires,
    setBusGroups,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDiagram();

  const {
    editingPoint,
    setEditingPoint,
    openBlockModal,
    openComponentPicker,
    openDisplaySettings,
    showDisplaySettings,
    closeDisplaySettings,
  } = useInteraction();

  const {
    showConnectionLabels,
    showNetNames,
    showBusNames,
    setShowConnectionLabels,
    setShowNetNames,
    setShowBusNames,
    sidebarOpen,
    setSidebarOpen,
  } = useDisplay();

  // Notify parent on changes (for parent-driven persistence layers).
  useEffect(() => {
    if (onChange) onChange({ blocks, wires, busGroups, version: '1.0' });
  }, [blocks, wires, busGroups, onChange]);

  const saveToFile = () => exportToFile({ blocks, wires, busGroups, version: '1.0' });

  const loadFromFile = () =>
    importFromFile((data) => {
      setBlocks(data.blocks);
      setWires(data.wires);
      if (data.busGroups) setBusGroups(data.busGroups);
    });

  const clearAll = () =>
    clearAllData(() => {
      setBlocks([]);
      setWires([]);
      setBusGroups({});
    });

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
      <HeaderBar
        onNew={clearAll}
        onExport={saveToFile}
        onImport={loadFromFile}
        onClear={clearAll}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenComponentLibrary={openComponentPicker}
        onOpenComponentEditor={openBlockModal}
        onOpenSettings={openDisplaySettings}
        backLink={backLink}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            left: sidebarOpen ? '350px' : '0',
            top: '90px',
            background: '#00ffa0',
            color: '#000',
            border: 'none',
            padding: '10px 8px',
            borderRadius: '0 5px 5px 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            zIndex: 1001,
            transition: 'left 0.3s',
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        <Sidebar editingPoint={editingPoint} setEditingPoint={setEditingPoint} />

        <DisplaySettingsModal
          isOpen={showDisplaySettings}
          onClose={closeDisplaySettings}
          showConnectionLabels={showConnectionLabels}
          showNetNames={showNetNames}
          showBusNames={showBusNames}
          setShowConnectionLabels={setShowConnectionLabels}
          setShowNetNames={setShowNetNames}
          setShowBusNames={setShowBusNames}
        />

        <CanvasArea />
      </div>
    </div>
  );
}

export function WireWizardEditor({
  initialDiagram,
  storageKey = 'wire-wizard-diagram',
  onChange,
  fullScreen = true,
  backLink,
}: WireWizardEditorProps) {
  const wrapperStyle: React.CSSProperties = fullScreen
    ? { width: '100vw', height: '100vh', position: 'relative' }
    : { width: '100%', height: '100%', position: 'relative' };

  return (
    <div className="wire-wizard-root" style={wrapperStyle}>
      <WireWizardProvider initialData={initialDiagram} storageKey={storageKey}>
        <WiringEditor onChange={onChange} backLink={backLink} />
      </WireWizardProvider>
    </div>
  );
}

export default WireWizardEditor;
