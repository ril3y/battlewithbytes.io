'use client';

import { WireWizardEditor, type DiagramData } from '@battlewithbytes/wire-wizard';
import '@battlewithbytes/wire-wizard/styles/editor.css';
import demoDiagram from './demo-diagram.json';
import WireWizardWelcomeTour from '@/components/WireWizardWelcomeTour';

// Bundle the demo diagram (golf-cart wiring harness) so first-time visitors
// with no autosave see a populated example. Users who've already saved a
// diagram in localStorage under `wire-wizard-diagram` continue to see their
// work — DiagramProvider's load-on-mount prefers stored state over
// `initialDiagram`.
const initialDiagram = demoDiagram as unknown as DiagramData;

export default function WireWizardPage() {
  return (
    <>
      <WireWizardEditor
        fullScreen
        backLink={{ href: '/tools', label: 'Tools' }}
        initialDiagram={initialDiagram}
      />
      <WireWizardWelcomeTour />
    </>
  );
}
