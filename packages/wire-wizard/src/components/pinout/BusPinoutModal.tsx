import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Block, ConnectionPoint, Conductor, PinoutLayout, Wire } from '../../lib/core/types';
import { MODAL_OVERLAY_STYLE } from '../../lib/core/styles';
import { ConnectorPinoutView, getPinCenterInContainer } from './ConnectorPinoutView';
import { PinDetailPanel } from './PinDetailPanel';
import { ConductorList } from './ConductorList';
import { NumberingModeSelect } from './NumberingModeSelect';
import { propagateAcrossNet } from '../../lib/pinout/netPropagation';

/** HSL-spread color palette used to pick visually-distinct default conductor colors. */
function pickConductorColor(used: Set<string>): string {
  for (let i = 0; i < 24; i++) {
    const h = (i * 360) / 12 % 360;
    const s = i < 12 ? 70 : 55;
    const l = i < 12 ? 55 : 45;
    const c = `hsl(${h.toFixed(0)} ${s}% ${l}%)`;
    if (!used.has(c)) return c;
  }
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
}

/**
 * Pinout drill-in layout: keep it tall + narrow so labels never collide.
 * Up to 12 pins go in a single column; beyond that we add columns to
 * avoid an overly tall view.
 */
function autoRectangleLayout(pinCount: number): PinoutLayout {
  if (pinCount <= 0) return { shape: 'rectangle', rows: 1, cols: 1 };
  const cols = pinCount <= 12 ? 1 : Math.ceil(pinCount / 12);
  const rows = Math.ceil(pinCount / cols);
  return { shape: 'rectangle', rows, cols };
}

interface BusPinoutModalProps {
  /** The wire whose endpoint is a bus port — clicking the wire (or a context-menu item) triggered the modal. */
  wire: Wire;
  blocks: Block[];
  /** All wires in the diagram (used for net propagation). */
  allWires: Wire[];
  /** All wires currently sharing the same bus port as the trigger wire. */
  siblingsAtBusPort: Wire[];
  updateConnectionPoint: (
    blockId: string,
    pinId: string,
    updates: Partial<ConnectionPoint>
  ) => void;
  updateWire: (wireId: string, updates: Partial<Wire>) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  setWires: (wires: Wire[]) => void;
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
  allWires,
  updateConnectionPoint,
  updateWire,
  updateBlock,
  setWires,
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

  /**
   * Visual conductors driven by `wire.conductors`. The bus-to-bus case maps a
   * `Conductor` straight to one rendered line. The mixed case (bus port wired
   * to a regular pin) still falls back to one-conductor-per-sibling so the
   * old display continues to work without a forced migration.
   */
  const conductors: ConductorViz[] = useMemo(() => {
    if (!layout) return [];
    const left = layout.left;
    const right = layout.right;

    // Bus-to-bus: source of truth is wire.conductors.
    if (left.isBusPort && right?.isBusPort) {
      const leftPins = new Map(left.internalPins.map((p) => [p.id, p]));
      const rightPins = new Map(right.internalPins.map((p) => [p.id, p]));
      const list = wire.conductors ?? [];
      // Translate left/right based on which side of the wire is the "left" pinout.
      // wire.conductors store fromInternalPinId/toInternalPinId in terms of the
      // wire's from/to ends; flip them when the bus-port side that opens the
      // modal is the wire's "to" end.
      const fromIsLeft = layout.leftSide === 'from';
      return list.map((c, i) => {
        const lpId = fromIsLeft ? c.fromInternalPinId : c.toInternalPinId;
        const rpId = fromIsLeft ? c.toInternalPinId : c.fromInternalPinId;
        const lp = leftPins.get(lpId) ?? null;
        const rp = rightPins.get(rpId) ?? null;
        const baseColor = c.color || lp?.color || rp?.color || DEFAULT_PIN_COLORS[i % DEFAULT_PIN_COLORS.length];
        return {
          id: c.id,
          leftPinId: lp?.id ?? null,
          rightPinId: rp?.id ?? null,
          color: baseColor,
          label: c.label ?? lp?.label ?? rp?.label ?? `Conductor ${i + 1}`,
        };
      });
    }

    // Left is bus port, right is a single pin — one conductor per sibling wire.
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
  }, [layout, siblingsAtBusPort, wire.conductors]);

  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [wireStart, setWireStart] = useState<{ side: 'left' | 'right'; pinId: string } | null>(null);
  const [focusedConductorId, setFocusedConductorId] = useState<string | null>(null);
  const historySavedRef = useRef(false);

  const isBusToBus = !!(layout?.left.isBusPort && layout?.right?.isBusPort);

  const ensureHistorySnapshot = useCallback(() => {
    if (!historySavedRef.current) {
      saveToHistory();
      historySavedRef.current = true;
    }
  }, [saveToHistory]);

  const writeConductors = useCallback(
    (next: Conductor[]) => {
      ensureHistorySnapshot();
      updateWire(wire.id, { conductors: next });
    },
    [ensureHistorySnapshot, updateWire, wire.id]
  );

  const addConductor = useCallback(
    (leftPinId: string, rightPinId: string) => {
      if (!layout || !isBusToBus) return;
      const fromIsLeft = layout.leftSide === 'from';
      const fromPinId = fromIsLeft ? leftPinId : rightPinId;
      const toPinId = fromIsLeft ? rightPinId : leftPinId;
      const existing = wire.conductors ?? [];
      // Skip if this exact pair already exists.
      if (existing.some((c) => c.fromInternalPinId === fromPinId && c.toInternalPinId === toPinId)) {
        return;
      }
      const usedColors = new Set(existing.map((c) => c.color).filter((c): c is string => !!c));
      const next: Conductor[] = [
        ...existing,
        {
          id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          fromInternalPinId: fromPinId,
          toInternalPinId: toPinId,
          color: pickConductorColor(usedColors),
        },
      ];
      writeConductors(next);
    },
    [layout, isBusToBus, wire.conductors, writeConductors]
  );

  const removeConductor = useCallback(
    (conductorId: string) => {
      const existing = wire.conductors ?? [];
      const next = existing.filter((c) => c.id !== conductorId);
      writeConductors(next);
      if (focusedConductorId === conductorId) setFocusedConductorId(null);
    },
    [wire.conductors, writeConductors, focusedConductorId]
  );

  const updateConductor = useCallback(
    (conductorId: string, updates: Partial<Conductor>) => {
      const isNetChange = 'netName' in updates || 'color' in updates;
      if (isNetChange) {
        ensureHistorySnapshot();
        const nextWires = propagateAcrossNet(
          allWires,
          { wireId: wire.id, conductorId },
          { netName: updates.netName, color: updates.color }
        );
        // Apply any non-propagating updates (label, gauge) on the seed conductor.
        const finalWires = nextWires.map((w) => {
          if (w.id !== wire.id) return w;
          const conds = (w.conductors ?? []).map((c) =>
            c.id === conductorId ? { ...c, ...updates } : c
          );
          return { ...w, conductors: conds };
        });
        setWires(finalWires);
        return;
      }
      const existing = wire.conductors ?? [];
      const next = existing.map((c) => (c.id === conductorId ? { ...c, ...updates } : c));
      writeConductors(next);
    },
    [wire.conductors, wire.id, writeConductors, ensureHistorySnapshot, allWires, setWires]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (wireStart) { setWireStart(null); return; }
        onClose();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && focusedConductorId) {
        // Don't intercept when the user is editing a text input
        const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        removeConductor(focusedConductorId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, wireStart, focusedConductorId, removeConductor]);

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

  /**
   * Pin click handler used by both pinout sides.
   *   - Shift+click   → set / move wire-start
   *   - plain click while wireStart is set on the OTHER side → create conductor
   *   - plain click while wireStart is set on the SAME side  → move wire-start
   *   - plain click with no wireStart → select pin for metadata editing
   */
  const handlePinClick = useCallback(
    (side: 'left' | 'right', pinId: string, e: React.MouseEvent) => {
      if (e.shiftKey) {
        setWireStart({ side, pinId });
        return;
      }
      if (wireStart) {
        if (wireStart.side === side) {
          setWireStart({ side, pinId });
          return;
        }
        // Different side: create a conductor.
        if (isBusToBus) {
          const leftPinId = wireStart.side === 'left' ? wireStart.pinId : pinId;
          const rightPinId = wireStart.side === 'right' ? wireStart.pinId : pinId;
          addConductor(leftPinId, rightPinId);
        }
        setWireStart(null);
        return;
      }
      setSelectedSide(side);
      setSelectedPinId(pinId);
    },
    [wireStart, isBusToBus, addConductor]
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

  const focusedConductor = focusedConductorId ? conductors.find((c) => c.id === focusedConductorId) : null;
  const leftHighlighted = focusedConductor
    ? new Set(focusedConductor.leftPinId ? [focusedConductor.leftPinId] : [])
    : new Set(conductors.map((c) => c.leftPinId).filter((id): id is string => !!id));
  const rightHighlighted = focusedConductor
    ? new Set(focusedConductor.rightPinId ? [focusedConductor.rightPinId] : [])
    : new Set(conductors.map((c) => c.rightPinId).filter((id): id is string => !!id));

  // Pin-id → ConnectionPoint maps for the ConductorList row labels.
  const leftPinMap = new Map(layout.left.internalPins.map((p) => [p.id, p]));
  const rightPinMap = new Map<string, ConnectionPoint>(
    layout.right.isBusPort
      ? layout.right.internalPins.map((p) => [p.id, p])
      : [[layout.right.pin.id, layout.right.pin]]
  );

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
            gridTemplateColumns: selectedPin ? '1fr 1fr 280px 320px' : '1fr 1fr 320px',
            gap: 24,
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
              {paths.map((p) => {
                const isFocused = focusedConductorId === p.id;
                const dimmed = focusedConductorId !== null && !isFocused;
                return (
                  <path
                    key={p.id}
                    d={p.d}
                    stroke={p.color}
                    strokeWidth={isFocused ? 3.5 : 2.5}
                    fill="none"
                    opacity={dimmed ? 0.15 : 0.9}
                    strokeDasharray={p.dashed ? '6,4' : undefined}
                  />
                );
              })}
            </svg>
          )}

          {/* Left connector */}
          <div ref={leftWrapRef} style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#00ffa0' }}>
                {`${layout.left.block.label} · ${layout.left.pin.label}`.toUpperCase()}
              </div>
              <NumberingModeSelect
                pinout={layout.left.block.pinout}
                onChange={(next) => { ensureHistorySnapshot(); updateBlock(layout.left.block.id, { pinout: next }); }}
              />
            </div>
            <ConnectorPinoutView
              block={leftVirtualBlock}
              highlightedPinIds={leftHighlighted}
              selectedPinId={selectedSide === 'left' ? selectedPinId : null}
              wireStartPinId={wireStart?.side === 'left' ? wireStart.pinId : null}
              onPinClick={(pid, e) => handlePinClick('left', pid, e)}
              labelSide="right"
              layoutOverride={autoRectangleLayout(leftVirtualBlock.connectionPoints.length)}
            />
          </div>

          {/* Right connector */}
          <div ref={rightWrapRef} style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
              <NumberingModeSelect
                pinout={layout.right.block.pinout}
                onChange={(next) => { ensureHistorySnapshot(); updateBlock(layout.right!.block.id, { pinout: next }); }}
              />
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#00ffa0', textAlign: 'right' }}>
                {`${layout.right.block.label} · ${layout.right.pin.label}`.toUpperCase()}
              </div>
            </div>
            <ConnectorPinoutView
              block={rightVirtualBlock}
              highlightedPinIds={rightHighlighted}
              selectedPinId={selectedSide === 'right' ? selectedPinId : null}
              wireStartPinId={wireStart?.side === 'right' ? wireStart.pinId : null}
              onPinClick={(pid, e) => handlePinClick('right', pid, e)}
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

          {/* Conductor list */}
          {isBusToBus && (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <ConductorList
                conductors={wire.conductors ?? []}
                leftPinMap={leftPinMap}
                rightPinMap={rightPinMap}
                fromIsLeft={layout.leftSide === 'from'}
                focusedConductorId={focusedConductorId}
                onFocus={setFocusedConductorId}
                onUpdate={updateConductor}
                onRemove={removeConductor}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
