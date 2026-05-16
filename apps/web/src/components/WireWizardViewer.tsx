// Short import path for MDX project pages:
//
//   import { WireWizardViewer } from '@/components/WireWizardViewer';
//   import diagram from './wiring.json';
//   <WireWizardViewer diagram={diagram} height={500} />
//
// This is a thin re-export. The actual component lives in
// `@battlewithbytes/wire-wizard`; keeping a local wrapper makes MDX
// imports shorter, gives us one place to inject site-wide defaults later,
// and lets us style the wrapper (e.g. with margin / a caption) without
// touching the package.

'use client';

import React from 'react';
import {
  WireWizardViewer as PackageViewer,
  type WireWizardViewerProps,
  type DiagramData,
} from '@battlewithbytes/wire-wizard';
import '@battlewithbytes/wire-wizard/styles/editor.css';

export interface MdxWireWizardViewerProps extends WireWizardViewerProps {
  /** Optional caption rendered below the diagram (italic, dim). */
  caption?: string;
}

export function WireWizardViewer({ caption, ...props }: MdxWireWizardViewerProps) {
  return (
    <figure style={{ margin: '24px 0' }}>
      <PackageViewer {...props} />
      {caption && (
        <figcaption
          style={{
            color: 'var(--text-muted, #888)',
            fontSize: 13,
            fontStyle: 'italic',
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export type { DiagramData };
export default WireWizardViewer;
