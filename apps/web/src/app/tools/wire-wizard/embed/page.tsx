'use client';

import { useEffect, useState } from 'react';
import { WireWizardViewer, type DiagramData } from '@battlewithbytes/wire-wizard';
import '@battlewithbytes/wire-wizard/styles/editor.css';

/**
 * iframe-friendly Wire Wizard viewer route.
 *
 * Reads a diagram from either:
 *   ?src=<url>   — fetched as JSON (must be same-origin or CORS-enabled)
 *   ?d=<base64>  — inline base64-encoded JSON (size-limited by URL length)
 *
 * Use this route to embed a diagram into any external site or page:
 *   <iframe src="https://battlewithbytes.io/tools/wire-wizard/embed?src=/wiring.json"
 *           style="width:100%;height:600px;border:0" />
 */
export default function WireWizardEmbedPage() {
  const [diagram, setDiagram] = useState<DiagramData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get('src');
    const d = params.get('d');

    (async () => {
      try {
        if (src) {
          const res = await fetch(src);
          if (!res.ok) throw new Error(`fetch ${src}: ${res.status}`);
          setDiagram(await res.json());
        } else if (d) {
          setDiagram(JSON.parse(atob(d)));
        } else {
          setError('Provide ?src=<url> or ?d=<base64-json>');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  if (error) {
    return (
      <div
        style={{
          padding: 16,
          color: '#ff6b6b',
          fontFamily: 'monospace',
          background: '#1a1a1a',
          width: '100vw',
          height: '100vh',
        }}
      >
        Wire Wizard embed error: {error}
      </div>
    );
  }
  if (!diagram) return null;

  return <WireWizardViewer diagram={diagram} width="100vw" height="100vh" />;
}
