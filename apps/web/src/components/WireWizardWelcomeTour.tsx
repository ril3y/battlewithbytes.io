'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * First-visit walkthrough for the Wire Wizard editor.
 *
 * - Shows a multi-step card explaining the tool + linking to the GitHub
 *   issue tracker so people can request new components.
 * - When a step targets a HeaderBar button (data-wire-wizard-tour="..."),
 *   a pulsing neon ring is drawn around that element.
 * - "Don't show this again" sets localStorage `wire-wizard-tour-completed`,
 *   which suppresses the tour on subsequent visits.
 * - Skipping via Esc or the close button also sets the flag.
 */

const TOUR_STORAGE_KEY = 'wire-wizard-tour-completed';
const ISSUES_URL = 'https://github.com/battlewithbytes/battlewithbytes.io/issues';

interface Step {
  title: string;
  body: React.ReactNode;
  /** Optional selector — if set, draws a glowing ring around the matched element. */
  highlight?: string;
}

const STEPS: Step[] = [
  {
    title: 'Welcome to Wire Wizard',
    body: (
      <>
        <p style={{ margin: '0 0 12px' }}>
          A wiring-diagram editor I built for my own electrical projects (the
          golf-cart harness loaded right now is one of them).
        </p>
        <p style={{ margin: '0 0 12px', color: '#facc15' }}>
          Heads up — this is beta software primarily for my personal use, but
          you&apos;re welcome to play with it. Stuff may break.
        </p>
        <p style={{ margin: 0 }}>
          Missing a component? Found a bug?{' '}
          <a
            href={ISSUES_URL}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#00ffa0', textDecoration: 'underline' }}
          >
            Open an issue on GitHub
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: 'This is a demo diagram — edit away',
    body: (
      <>
        <p style={{ margin: '0 0 12px' }}>
          Drag blocks around. Shift-click a connection point to start a wire
          and click another point to connect them. Double-click any
          component to open its Configure dialog.
        </p>
        <p style={{ margin: 0, color: '#9aa0a6' }}>
          Everything auto-saves to your browser&apos;s localStorage so you can
          come back to it later.
        </p>
      </>
    ),
  },
  {
    title: 'Start fresh with "New"',
    body: (
      <p style={{ margin: 0 }}>
        Click <strong style={{ color: '#fff' }}>New</strong> in the top-left
        of the header to clear the canvas and start your own diagram from
        scratch.
      </p>
    ),
    highlight: '[data-wire-wizard-tour="new"]',
  },
  {
    title: 'Add components from the catalog',
    body: (
      <p style={{ margin: 0 }}>
        Hit <strong style={{ color: '#a855f7' }}>Components</strong> to
        browse the component library — contactors, fuses, bus bars, amps,
        switches, RCA inputs, hub motors, and more. Click one to drop it on
        the canvas.
      </p>
    ),
    highlight: '[data-wire-wizard-tour="components"]',
  },
  {
    title: 'Export when you\'re done',
    body: (
      <>
        <p style={{ margin: '0 0 12px' }}>
          <strong style={{ color: '#00ffa0' }}>Export</strong> downloads a
          JSON file of your diagram. You can also embed a saved diagram in
          any project page on this site:
        </p>
        <pre
          style={{
            margin: 0,
            padding: '10px 12px',
            background: '#0a0a0a',
            border: '1px solid #2a2a2a',
            borderRadius: 4,
            fontSize: 11,
            color: '#9aa0a6',
            overflow: 'auto',
          }}
        >{`import diagram from './wiring.json';
<WireWizardViewer diagram={diagram} />`}</pre>
      </>
    ),
    highlight: '[data-wire-wizard-tour="export"]',
  },
];

export function WireWizardWelcomeTour() {
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Show the tour on first mount when the suppress flag isn't set.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  // Recompute the highlight rect whenever the step (or window size) changes.
  useEffect(() => {
    if (!open) {
      setHighlightRect(null);
      return;
    }
    const step = STEPS[stepIdx];
    if (!step.highlight) {
      setHighlightRect(null);
      return;
    }
    const update = () => {
      const el = document.querySelector(step.highlight!) as HTMLElement | null;
      if (el) setHighlightRect(el.getBoundingClientRect());
      else setHighlightRect(null);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [open, stepIdx]);

  const close = useCallback(() => {
    if (dontShow && typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, '1');
    }
    setOpen(false);
  }, [dontShow]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const isFirst = stepIdx === 0;

  return (
    <>
      {/* Soft scrim — covers the whole viewport but leaves everything readable.
          We intentionally don't block pointer events so the canvas underneath
          stays interactive while the tour is up. */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          zIndex: 9998,
          pointerEvents: 'auto',
        }}
        onClick={close}
      />

      {/* Pulsing highlight ring around the targeted header button */}
      {highlightRect && (
        <div
          style={{
            position: 'fixed',
            top: highlightRect.top - 6,
            left: highlightRect.left - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
            border: '2px solid #00ffa0',
            borderRadius: 6,
            boxShadow: '0 0 20px rgba(0, 255, 160, 0.6), inset 0 0 12px rgba(0, 255, 160, 0.25)',
            pointerEvents: 'none',
            zIndex: 9999,
            animation: 'wire-wizard-tour-pulse 1.6s ease-in-out infinite',
          }}
        />
      )}
      <style>{`
        @keyframes wire-wizard-tour-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(0, 255, 160, 0.4), inset 0 0 8px rgba(0, 255, 160, 0.2); }
          50%      { box-shadow: 0 0 28px rgba(0, 255, 160, 0.85), inset 0 0 16px rgba(0, 255, 160, 0.35); }
        }
      `}</style>

      {/* The actual tour card — centered on the page. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wire-wizard-tour-title"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, calc(100vw - 32px))',
          background: '#0f0f0f',
          color: '#e5e5e5',
          border: '1px solid #00ffa0',
          borderRadius: 8,
          boxShadow: '0 0 40px rgba(0, 255, 160, 0.2)',
          padding: '20px 22px',
          fontFamily: '"Roboto Mono", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 12,
          }}
        >
          <h2
            id="wire-wizard-tour-title"
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 'bold',
              color: '#00ffa0',
              letterSpacing: '1.5px',
            }}
          >
            {step.title}
          </h2>
          <span style={{ color: '#666', fontSize: 11 }}>
            Step {stepIdx + 1} / {STEPS.length}
          </span>
        </div>

        {/* Body */}
        <div style={{ marginBottom: 18 }}>{step.body}</div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: '#888',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              style={{ accentColor: '#00ffa0' }}
            />
            Don&apos;t show this again
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              style={{
                padding: '6px 14px',
                fontSize: 11,
                fontFamily: 'inherit',
                background: 'transparent',
                color: isFirst ? '#444' : '#aaa',
                border: '1px solid ' + (isFirst ? '#222' : '#444'),
                borderRadius: 4,
                cursor: isFirst ? 'not-allowed' : 'pointer',
              }}
            >
              ← Back
            </button>
            {isLast ? (
              <button
                onClick={close}
                style={{
                  padding: '6px 14px',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                  background: '#00ffa0',
                  color: '#000',
                  border: '1px solid #00ffa0',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Got it
              </button>
            ) : (
              <button
                onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
                style={{
                  padding: '6px 14px',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                  background: '#00ffa0',
                  color: '#000',
                  border: '1px solid #00ffa0',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default WireWizardWelcomeTour;
