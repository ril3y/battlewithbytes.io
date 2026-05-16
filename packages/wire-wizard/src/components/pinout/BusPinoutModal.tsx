import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Block, ConnectionPoint, PinoutLayout, Wire } from '../../lib/core/types';
import { MODAL_OVERLAY_STYLE } from '../../lib/core/styles';
import { ConnectorPinoutView, getPinCenterInContainer } from './ConnectorPinoutView';
import { PinDetailPanel } from './PinDetailPanel';

/** Pick a sensible rectangle (rows × cols) for N pins. */
function autoRectangleLayout(pinCount: number): PinoutLayout {
  if (pinCount <= 0) return { shape: 'rectangle', rows: 1, cols: 1 };
  const cols = Math.ceil(Math.sqrt(pinCount));
  const rows = Math.ceil(pinCount / cols);
  return { shape: 'rectangle', rows, cols };
}

interface BusPinoutModalProps {
  /** The wire whose endpoint is a bus port — clicking the wire (or a context-menu item) triggered the modal. */
  wire: Wire;
  blocks: Block[];
  /** All wires currently sharing the same bus port as the trigger wire. */
  siblingsAtBusPort: Wire[];
  updateConnectionPoint: (
    blockId: string,
    pinId: string,
    updates: Partial<ConnectionPoint>
  ) => void;
  updateWire: (wireId: string, updates: Partial<Wire>) => void;
  saveToHistory: () => void;
  onClose: () => void;
}

interface ResolvedEnd {
  block: Block;
  pin: ConnectionPoint;
  isBusPort: boolean;
  /** Internal pins for this side (only populated when `isBusPort` is true). */
  internalPins: ConnectionPoint[];
}

function resolveEnd(
  blockId: string | undefined,
  pinId: string | undefined,
  blocks: Block[]
): ResolvedEnd | null {
  if (!blockId || !pinId) return null;
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return null;
  const pin = block.connectionPoints.find((p) => p.id === pinId);
  if (!pin) return null;
  const isBusPort = !!pin.isBusPort;
  const idSet = new Set(pin.internalPinIds ?? []);
  const internalPins = isBusPort
    ? block.connectionPoints.filter((p) => idSet.has(p.id))
    : [];
  return { block, pin, isBusPort, internalPins };
}

/**
 * A visual conductor inside the cable. Each one corresponds to a pin pair
 * (left internal pin <-> right internal pin or right pin).
 */
interface ConductorViz {
  id: string;            // stable key: `${leftPinId}->${rightPinId}` (or "unassigned-<i>")
  leftPinId: string | null;
  rightPinId: string | null;
  color: string;
  label: string;
}

const DEFAULT_PIN_COLORS = ['#ff4444', '#ffaa00', '#ffff00', '#00cc66', '#3399ff', '#a855f7', '#ffffff', '#888888'];

export const BusPinoutModal: React.FC<BusPinoutModalProps> = ({
  wire,
  blocks,
  siblingsAtBusPort,
  updateConnectionPoint,
  updateWire,
  saveToHistory,
  onClose,
}) => {
  // Figure out which end is the bus port that triggered the modal — that becomes "left".
  const fromEnd = useMemo(() => resolveEnd(wire.fromBlockId, wire.fromPointId, blocks), [wire, blocks]);
  const toEnd = useMemo(() => resolveEnd(wire.toBlockId, wire.toPointId, blocks), [wire, blocks]);

  // Prefer "from" as the bus-port side; if only "to" is a bus port, flip.
  const layout = useMemo(() => {
    if (fromEnd?.isBusPort && toEnd?.isBusPort) {
      return { left: fromEnd, right: toEnd, leftSide: 'from' as const, rightSide: 'to' as const };
    }
    if (fromEnd?.isBusPort) {
      return { left: fromEnd, right: toEnd, leftSide: 'from' as const, rightSide: 'to' as const };
    }
    if (toEnd?.isBusPort) {
      return { left: toEnd, right: fromEnd, leftSide: 'to' as const, rightSide: 'from' as const };
    }
    return null;
  }, [fromEnd, toEnd]);

  // Stable visual conductors. When both sides are bus ports of the same internal-pin
  // count, default to identity-by-pinNumber. Otherwise, the right side is a single pin
  // and we render one conductor going from each sibling wire's assigned internal pin
  // (or unassigned) to that single right pin.
  const conductors: ConductorViz[] = useMemo(() => {
    if (!layout) return [];
    const left = layout.left;
    const right = layout.right;

    // Both sides are bus ports → expand the cable into N conductors by matching pinNumber.
    if (left.isBusPort && right?.isBusPort) {
      const byPinNumber = (pins: ConnectionPoint[]) => {
        const m = new Map<number, ConnectionPoint>();
        pins.forEach((p, i) => m.set(p.pinNumber ?? i + 1, p));
        return m;
      };
      const leftByN = byPinNumber(left.internalPins);
      const rightByN = byPinNumber(right.internalPins);
      const allPinNumbers = Array.from(new Set([...leftByN.keys(), ...rightByN.keys()])).sort((a, b) => a - b);
      return allPinNumbers.map((n, i) => {
        const lp = leftByN.get(n) ?? null;
        const rp = rightByN.get(n) ?? null;
        const baseColor = lp?.color || rp?.color || DEFAULT_PIN_COLORS[i % DEFAULT_PIN_COLORS.length];
        return {
          id: `${lp?.id ?? '_'}->${rp?.id ?? '_'}`,
          leftPinId: lp?.id ?? null,
          rightPinId: rp?.id ?? null,
          color: baseColor,
          label: lp?.label ?? rp?.label ?? `Pin ${n}`,
        };
      });
    }

    // Left is bus port, right is a regular single pin — render one conductor per
    // sibling wire (each wire might assign a different internal pin on the left).
    if (left.isBusPort && right) {
      return siblingsAtBusPort.map((sw, i) => {
        const onFromSide = sw.fromBlockId === left.block.id && sw.fromPointId === left.pin.id;
        const leftInternalPinId = onFromSide ? sw.fromInternalPinId : sw.toInternalPinId;
        return {
          id: sw.id,
          leftPinId: leftInternalPinId ?? null,
          rightPinId: right.pin.id,
          color: sw.color || DEFAULT_PIN_COLORS[i % DEFAULT_PIN_COLORS.length],
          label: sw.label ?? `wire ${sw.id.slice(0, 4)}`,
        };
      });
    }

    return [];
  }, [layout, siblingsAtBusPort]);

  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const historySavedRef = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ensureHistorySnapshot = useCallback(() => {
    if (!historySavedRef.current) {
      saveToHistory();
      historySavedRef.current = true;
    }
  }, [saveToHistory]);

  const selectedBlock = layout
    ? selectedSide === 'left'
      ? layout.left.block
      : layout.right?.block ?? null
    : null;
  const selectedPin = selectedBlock && selectedPinId
    ? selectedBlock.connectionPoints.find((p) => p.id === selectedPinId) ?? null
    : null;

  const handlePinEdit = useCallback(
    (updates: Partial<ConnectionPoint>) => {
      if (!selectedBlock || !selectedPinId) return;
      ensureHistorySnapshot();
      updateConnectionPoint(selectedBlock.id, selectedPinId, updates);
    },
    [selectedBlock, selectedPinId, ensureHistorySnapshot, updateConnectionPoint]
  );

  // Wire-overlay measurement
  const wireLayerRef = useRef<HTMLDivElement | null>(null);
  const leftWrapRef = useRef<HTMLDivElement | null>(null);
  const rightWrapRef = useRef<HTMLDivElement | null>(null);
  const [paths, setPaths] = useState<Array<{ id: string; color: string; d: string; dashed: boolean }>>([]);

  const recompute = useCallback(() => {
    const layer = wireLayerRef.current;
    const lw = leftWrapRef.current;
    const rw = rightWrapRef.current;
    if (!layer || !lw || !rw) return;
    const layerRect = layer.getBoundingClientRect();
    const lwRect = lw.getBoundingClientRect();
    const rwRect = rw.getBoundingClientRect();
    const out: typeof paths = [];
    conductors.forEach((c) => {
      const leftPos = c.leftPinId ? getPinCenterInContainer(lw, c.leftPinId) : null;
      const rightPos = c.rightPinId ? getPinCenterInContainer(rw, c.rightPinId) : null;
      if (!leftPos && !rightPos) return;
      const x1 = leftPos ? lwRect.left + leftPos.x - layerRect.left : lwRect.right - layerRect.left - 12;
      const y1 = leftPos ? lwRect.top + leftPos.y - layerRect.top : lwRect.top + lwRect.height / 2 - layerRect.top;
      const x2 = rightPos ? rwRect.left + rightPos.x - layerRect.left : rwRect.left - layerRect.left + 12;
      const y2 = rightPos ? rwRect.top + rightPos.y - layerRect.top : rwRect.top + rwRect.height / 2 - layerRect.top;
      const midX = (x1 + x2) / 2;
      out.push({
        id: c.id,
        color: c.color,
        d: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
        dashed: !leftPos || !rightPos,
      });
    });
    setPaths(out);
  }, [conductors]);

  useLayoutEffect(() => { recompute(); }, [recompute, layout, selectedPinId]);
  useEffect(() => {
    const h = () => recompute();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [recompute]);

  if (!layout || !layout.right) {
    return null;
  }

  // Build virtual blocks that scope the pinout view to the right subset of pins.
  const leftVirtualBlock: Block = {
    ...layout.left.block,
    connectionPoints: layout.left.internalPins,
  };
  const rightVirtualBlock: Block = layout.right.isBusPort
    ? { ...layout.right.block, connectionPoints: layout.right.internalPins }
    : { ...layout.right.block, connectionPoints: [layout.right.pin] };

  const leftHighlighted = new Set(conductors.map((c) => c.leftPinId).filter((id): id is string => !!id));
  const rightHighlighted = new Set(conductors.map((c) => c.rightPinId).filter((id): id is string => !!id));

  return (
    <div
      style={{ ...MODAL_OVERLAY_STYLE, alignItems: 'stretch', justifyContent: 'stretch', padding: 24 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          background: '#0f0f0f',
          border: '2px solid #00aaff',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Roboto Mono, monospace',
          color: '#e5e5e5',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #1a1a1a',
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: '#666', letterSpacing: 2 }}>CABLE PINOUT</div>
            <div style={{ fontSize: 18, color: '#00aaff', fontWeight: 'bold', letterSpacing: 1 }}>
              {layout.left.block.label} · {layout.left.pin.label || 'Bus Port'}
              <span style={{ color: '#666', margin: '0 10px' }}>→</span>
              {layout.right.block.label}
              {layout.right.isBusPort && ` · ${layout.right.pin.label}`}
              <span style={{ fontSize: 12, marginLeft: 10, color: '#555' }}>
                [{conductors.length} conductor{conductors.length === 1 ? '' : 's'}]
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #444',
              color: '#888',
              padding: '6px 14px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 11,
            }}
          >
            Close · Esc
          </button>
        </div>

        {/* Body */}
        <div
          ref={wireLayerRef}
          style={{
            position: 'relative',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: selectedPin ? '1fr 1fr 280px' : '1fr 1fr',
            gap: 40,
            padding: 24,
            overflow: 'auto',
            alignItems: 'start',
          }}
        >
          {/* Conductor overlay */}
          {paths.length > 0 && (
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              {paths.map((p) => (
                <path
                  key={p.id}
                  d={p.d}
                  stroke={p.color}
                  strokeWidth={2.5}
                  fill="none"
                  opacity={0.85}
                  strokeDasharray={p.dashed ? '6,4' : undefined}
                />
              ))}
            </svg>
          )}

          {/* Left connector */}
          <div ref={leftWrapRef} style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#00ffa0', marginBottom: 8 }}>
              {`${layout.left.block.label} · ${layout.left.pin.label}`.toUpperCase()}
            </div>
            <ConnectorPinoutView
              block={leftVirtualBlock}
              highlightedPinIds={leftHighlighted}
              selectedPinId={selectedSide === 'left' ? selectedPinId : null}
              onPinClick={(pid) => { setSelectedSide('left'); setSelectedPinId(pid); }}
              labelSide="right"
              layoutOverride={autoRectangleLayout(leftVirtualBlock.connectionPoints.length)}
            />
          </div>

          {/* Right connector */}
          <div ref={rightWrapRef} style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#00ffa0', marginBottom: 8, textAlign: 'right' }}>
              {layout.right.isBusPort
                ? `${layout.right.block.label} · ${layout.right.pin.label}`.toUpperCase()
                : `${layout.right.block.label} · ${layout.right.pin.label}`.toUpperCase()}
            </div>
            <ConnectorPinoutView
              block={rightVirtualBlock}
              highlightedPinIds={rightHighlighted}
              selectedPinId={selectedSide === 'right' ? selectedPinId : null}
              onPinClick={(pid) => { setSelectedSide('right'); setSelectedPinId(pid); }}
              labelSide="left"
              layoutOverride={autoRectangleLayout(rightVirtualBlock.connectionPoints.length)}
            />
          </div>

          {/* Pin detail panel */}
          {selectedPin && selectedBlock && (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <PinDetailPanel
                blockLabel={selectedBlock.label}
                pin={selectedPin}
                onChange={handlePinEdit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
