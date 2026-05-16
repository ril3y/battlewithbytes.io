import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Block, ConnectionPoint, PinoutLayout, Wire } from '../../lib/core/types';
import { MODAL_OVERLAY_STYLE } from '../../lib/core/styles';
import { ConnectorPinoutView, getPinCenterInContainer } from './ConnectorPinoutView';
import { PinDetailPanel } from './PinDetailPanel';

/** Pick a sensible rectangle (rows × cols) for N pins. */
function autoRectangleLayout(pinCount: number): PinoutLayout {
  if (pinCount <= 0) return { shape: 'rectangle', rows: 1, cols: 1 };
  // Prefer wider than tall — e.g. 6 -> 3x2, 9 -> 3x3, 12 -> 4x3.
  const cols = Math.ceil(Math.sqrt(pinCount));
  const rows = Math.ceil(pinCount / cols);
  return { shape: 'rectangle', rows, cols };
}

interface BusPinoutModalProps {
  /** The wire whose endpoint is a bus port — clicking the wire (or a context-menu item) triggered the modal. */
  wire: Wire;
  blocks: Block[];
  /** All wires currently sharing the same bus port as `wire.from{Block,Point}Id` or `wire.to{Block,Point}Id`. */
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

/**
 * Resolve the bus-port side of a wire. Returns the block + the bus-port pin
 * if either endpoint is a bus port; otherwise null.
 */
function findBusPortEnd(
  wire: Wire,
  blocks: Block[]
): { side: 'from' | 'to'; block: Block; busPort: ConnectionPoint } | null {
  const tryEnd = (
    side: 'from' | 'to',
    blockId?: string,
    pointId?: string
  ): { side: 'from' | 'to'; block: Block; busPort: ConnectionPoint } | null => {
    if (!blockId || !pointId) return null;
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return null;
    const pin = block.connectionPoints.find((p) => p.id === pointId);
    if (!pin || !pin.isBusPort) return null;
    return { side, block, busPort: pin };
  };
  return (
    tryEnd('from', wire.fromBlockId, wire.fromPointId) ??
    tryEnd('to', wire.toBlockId, wire.toPointId)
  );
}

interface ResolvedSiblingWire {
  wire: Wire;
  internalPinId: string | undefined;
  destBlock: Block | null;
  destPin: ConnectionPoint | null;
}

export const BusPinoutModal: React.FC<BusPinoutModalProps> = ({
  wire,
  blocks,
  siblingsAtBusPort,
  updateConnectionPoint,
  updateWire,
  saveToHistory,
  onClose,
}) => {
  const busPortEnd = useMemo(() => findBusPortEnd(wire, blocks), [wire, blocks]);

  const internalPins = useMemo<ConnectionPoint[]>(() => {
    if (!busPortEnd) return [];
    const ids = new Set(busPortEnd.busPort.internalPinIds ?? []);
    return busPortEnd.block.connectionPoints.filter((p) => ids.has(p.id));
  }, [busPortEnd]);

  /**
   * Synthesize a Block whose `connectionPoints` are the internal pins of the
   * bus port. Pinout renderer takes a Block; rather than build a parallel API
   * we just construct a virtual one with the relevant subset.
   */
  const internalBlock = useMemo<Block | null>(() => {
    if (!busPortEnd) return null;
    return {
      ...busPortEnd.block,
      connectionPoints: internalPins,
    };
  }, [busPortEnd, internalPins]);

  /** Resolve each sibling wire's other end and its internal-pin assignment (if any). */
  const siblings: ResolvedSiblingWire[] = useMemo(() => {
    if (!busPortEnd) return [];
    return siblingsAtBusPort.map((sw) => {
      const onFromSide = busPortEnd.side === 'from'
        ? sw.fromBlockId === busPortEnd.block.id && sw.fromPointId === busPortEnd.busPort.id
        : sw.toBlockId === busPortEnd.block.id && sw.toPointId === busPortEnd.busPort.id;

      // The "other" end is the destination — opposite side from the bus port.
      const destBlockId = onFromSide ? sw.toBlockId : sw.fromBlockId;
      const destPinId = onFromSide ? sw.toPointId : sw.fromPointId;
      const destBlock = destBlockId ? blocks.find((b) => b.id === destBlockId) ?? null : null;
      const destPin = destBlock && destPinId
        ? destBlock.connectionPoints.find((p) => p.id === destPinId) ?? null
        : null;
      const internalPinId = onFromSide ? sw.fromInternalPinId : sw.toInternalPinId;
      return { wire: sw, internalPinId, destBlock, destPin };
    });
  }, [siblingsAtBusPort, busPortEnd, blocks]);

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [assigningWireId, setAssigningWireId] = useState<string | null>(wire.id);
  const historySavedRef = useRef(false);

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const highlightedInternalPinIds = useMemo(
    () => new Set(siblings.map((s) => s.internalPinId).filter((id): id is string => !!id)),
    [siblings]
  );

  const selectedPin = selectedPinId && internalBlock
    ? internalBlock.connectionPoints.find((p) => p.id === selectedPinId) ?? null
    : null;

  const ensureHistorySnapshot = useCallback(() => {
    if (!historySavedRef.current) {
      saveToHistory();
      historySavedRef.current = true;
    }
  }, [saveToHistory]);

  const handlePinEdit = useCallback(
    (updates: Partial<ConnectionPoint>) => {
      if (!busPortEnd || !selectedPinId) return;
      ensureHistorySnapshot();
      updateConnectionPoint(busPortEnd.block.id, selectedPinId, updates);
    },
    [busPortEnd, selectedPinId, ensureHistorySnapshot, updateConnectionPoint]
  );

  /** Click a pin: assign the currently-selected wire to that internal pin, OR select for editing if no wire active. */
  const handlePinClick = useCallback(
    (pinId: string) => {
      setSelectedPinId(pinId);
      if (!assigningWireId || !busPortEnd) return;
      const sw = siblings.find((s) => s.wire.id === assigningWireId);
      if (!sw) return;
      ensureHistorySnapshot();
      const field = busPortEnd.side === 'from' ? 'fromInternalPinId' : 'toInternalPinId';
      updateWire(assigningWireId, { [field]: pinId } as Partial<Wire>);
    },
    [assigningWireId, busPortEnd, siblings, ensureHistorySnapshot, updateWire]
  );

  // Drawing wires from internal pin → destination block in the modal
  const wireLayerRef = useRef<HTMLDivElement | null>(null);
  const internalWrapRef = useRef<HTMLDivElement | null>(null);
  const destWrapsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [wirePaths, setWirePaths] = useState<Array<{ id: string; color: string; d: string; dashed: boolean }>>([]);

  const recomputeWirePaths = useCallback(() => {
    const layer = wireLayerRef.current;
    const lw = internalWrapRef.current;
    if (!layer || !lw) return;
    const layerRect = layer.getBoundingClientRect();
    const lwRect = lw.getBoundingClientRect();
    const paths: typeof wirePaths = [];
    siblings.forEach((s) => {
      if (!s.destBlock || !s.destPin) return;
      const destWrap = destWrapsRef.current.get(s.wire.id);
      if (!destWrap) return;
      // If this wire has no internal-pin assignment yet, route from the bus
      // port's icon (collapsed entry point) rather than from a pin.
      const fromPos = s.internalPinId ? getPinCenterInContainer(lw, s.internalPinId) : null;
      const toPos = getPinCenterInContainer(destWrap, s.destPin.id);
      if (!toPos) return;
      const dRect = destWrap.getBoundingClientRect();
      const x1 = fromPos
        ? lwRect.left + fromPos.x - layerRect.left
        : lwRect.right - layerRect.left - 12;
      const y1 = fromPos
        ? lwRect.top + fromPos.y - layerRect.top
        : (lwRect.top + lwRect.height / 2) - layerRect.top;
      const x2 = dRect.left + toPos.x - layerRect.left;
      const y2 = dRect.top + toPos.y - layerRect.top;
      const midX = (x1 + x2) / 2;
      paths.push({
        id: s.wire.id,
        color: s.wire.color,
        d: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
        dashed: !s.internalPinId,
      });
    });
    setWirePaths(paths);
  }, [siblings]);

  useLayoutEffect(() => { recomputeWirePaths(); }, [recomputeWirePaths, internalBlock, siblings]);
  useEffect(() => {
    const handler = () => recomputeWirePaths();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [recomputeWirePaths]);

  if (!busPortEnd || !internalBlock) {
    return null;
  }

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
            <div style={{ fontSize: 10, color: '#666', letterSpacing: 2 }}>CONNECTOR PINOUT</div>
            <div style={{ fontSize: 18, color: '#00aaff', fontWeight: 'bold', letterSpacing: 1 }}>
              {busPortEnd.block.label} · {busPortEnd.busPort.label || 'Bus Port'}
              <span style={{ fontSize: 12, marginLeft: 10, color: '#555' }}>
                [{busPortEnd.busPort.internalPinIds?.length ?? 0} pins]
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
            gap: 20,
            padding: 24,
            overflow: 'auto',
          }}
        >
          {/* Connecting-wire overlay */}
          {wirePaths.length > 0 && (
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
              {wirePaths.map((p) => (
                <path
                  key={p.id}
                  d={p.d}
                  stroke={p.color}
                  strokeWidth={2}
                  fill="none"
                  opacity={0.75}
                  strokeDasharray={p.dashed ? '4,4' : undefined}
                />
              ))}
            </svg>
          )}

          {/* Internal connector pinout (the bus port side) */}
          <div ref={internalWrapRef} style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#00ffa0', marginBottom: 8 }}>
              {`${busPortEnd.block.label} · INTERNAL`.toUpperCase()}
            </div>
            <ConnectorPinoutView
              block={internalBlock}
              highlightedPinIds={highlightedInternalPinIds.size ? highlightedInternalPinIds : undefined}
              selectedPinId={selectedPinId}
              onPinClick={handlePinClick}
              labelSide="right"
              layoutOverride={autoRectangleLayout(internalBlock.connectionPoints.length)}
            />
            <div style={{ marginTop: 8, fontSize: 10, color: '#666' }}>
              {assigningWireId
                ? `Click a pin to assign wire ${assigningWireId.slice(0, 6)}…`
                : 'Click a pin to edit metadata.'}
            </div>
          </div>

          {/* Destination side — stacked, one mini-pinout per destination block */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
            {siblings.map((s) => {
              if (!s.destBlock || !s.destPin) {
                return (
                  <div key={s.wire.id} style={{ color: '#555', fontSize: 11 }}>
                    Wire {s.wire.id.slice(0, 6)}… has no resolvable destination.
                  </div>
                );
              }
              const destOnlyBlock: Block = {
                ...s.destBlock,
                connectionPoints: [s.destPin],
              };
              const isActiveAssign = assigningWireId === s.wire.id;
              return (
                <div
                  key={s.wire.id}
                  ref={(el) => { destWrapsRef.current.set(s.wire.id, el); }}
                  onClick={() => setAssigningWireId(s.wire.id)}
                  style={{
                    border: `1px solid ${isActiveAssign ? '#00aaff' : '#222'}`,
                    borderRadius: 6,
                    padding: 10,
                    background: isActiveAssign ? 'rgba(0,170,255,0.05)' : '#0a0a0a',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#777', marginBottom: 4 }}>
                    → {s.destBlock.label}
                    {s.internalPinId
                      ? ` · maps to internal pin ${s.internalPinId.slice(0, 6)}…`
                      : ' · unassigned (click an internal pin to assign)'}
                  </div>
                  <ConnectorPinoutView
                    block={destOnlyBlock}
                    labelSide="left"
                    layoutOverride={{ shape: 'rectangle', rows: 1, cols: 1 }}
                  />
                </div>
              );
            })}
          </div>

          {/* Pin detail panel */}
          {selectedPin && (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <PinDetailPanel
                blockLabel={busPortEnd.block.label}
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
