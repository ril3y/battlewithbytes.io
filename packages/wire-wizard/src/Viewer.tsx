'use client';

import React from 'react';
import { WireWizardProvider } from './lib/core/contexts';
import { CanvasArea } from './components/canvas/CanvasArea';
import type { DiagramData } from './lib/core/types';

export interface WireWizardViewerProps {
  /** Diagram to render. Required. */
  diagram: DiagramData;
  /** Container width. Default: '100%'. */
  width?: number | string;
  /** Container height. Default: 400. */
  height?: number | string;
  /** Pass-through className for the outer wrapper. */
  className?: string;
}

/**
 * Read-only Wire Wizard render.
 *
 * Mounts the same canvas the editor uses, but with `readOnly` enabled — the
 * SVG has `pointer-events: none` so users can't drag, select, or edit, and
 * the floating "add" button is hidden. Wheel-to-zoom on the container still
 * works for navigating large diagrams.
 *
 * Persistence is explicitly disabled (`storageKey: null`) so embedded viewers
 * don't clobber the editor's autosave key.
 */
export function WireWizardViewer({
  diagram,
  width = '100%',
  height = 400,
  className,
}: WireWizardViewerProps) {
  return (
    <div
      className={`wire-wizard-root${className ? ' ' + className : ''}`}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1a1a',
        display: 'flex',
      }}
    >
      <WireWizardProvider initialData={diagram} storageKey={null}>
        <CanvasArea readOnly />
      </WireWizardProvider>
    </div>
  );
}

export default WireWizardViewer;
