import React, { useMemo } from 'react';
import type { Block, ConnectionPoint, PinoutLayout } from '../../lib/core/types';
import { layoutPinout, type PinPosition } from '../../lib/pinout';

interface ConnectorPinoutViewProps {
  block: Block;
  /** Pins to render solid; if omitted, all pins are rendered solid. */
  highlightedPinIds?: Set<string>;
  selectedPinId?: string | null;
  onPinClick?: (pinId: string) => void;
  /**
   * Side the connector "faces" — controls which side labels are rendered on.
   * For a left-hand connector in the bus modal, labels go on the right; vice versa.
   */
  labelSide?: 'left' | 'right';
  /** Override the block.pinout for this rendering pass. */
  layoutOverride?: PinoutLayout;
}

const PIN_RADIUS = 9;

/**
 * Render a single block's connector pinout as an SVG `<svg>`. The internal
 * coordinate system comes from `layoutPinout`; the wrapping `<svg>` sets a
 * viewBox so it scales into whatever space the parent gives it.
 *
 * The returned element exposes `data-pin-id` on each pin circle so a parent
 * modal can measure pin positions in screen space to draw connecting wires.
 */
export const ConnectorPinoutView: React.FC<ConnectorPinoutViewProps> = ({
  block,
  highlightedPinIds,
  selectedPinId,
  onPinClick,
  labelSide = 'right',
  layoutOverride,
}) => {
  const { positions, width, height, byId } = useMemo(() => {
    const result = layoutPinout(block.connectionPoints, layoutOverride ?? block.pinout);
    const map = new Map<string, PinPosition>();
    result.positions.forEach((p) => map.set(p.pinId, p));
    return { ...result, byId: map };
  }, [block.connectionPoints, block.pinout, layoutOverride]);

  // Reserve horizontal room for the longest label so labels never overflow
  // the SVG when the layout scales up. ~7 SVG units per character at our text size.
  const maxLabelChars = block.connectionPoints.reduce(
    (n, p) => Math.max(n, (p.label || '').length, 8),
    8
  );
  const labelPad = maxLabelChars * 7 + 16;
  const totalWidth = width + labelPad * 2;

  return (
    <svg
      viewBox={`0 0 ${Math.max(1, totalWidth)} ${Math.max(1, height)}`}
      style={{
        width: '100%',
        height: 'auto',
        maxHeight: '60vh',
        display: 'block',
      }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Connector body — a soft outline so the pins read as one connector */}
      <rect
        x={labelPad - 4}
        y={6}
        width={Math.max(1, width + 8)}
        height={Math.max(1, height - 12)}
        rx={8}
        ry={8}
        fill="#0f0f0f"
        stroke="#2a2a2a"
        strokeWidth={1}
      />

      {block.connectionPoints.map((pin) => {
        const pos = byId.get(pin.id);
        if (!pos) return null;
        const isHighlighted = !highlightedPinIds || highlightedPinIds.has(pin.id);
        const isSelected = selectedPinId === pin.id;
        const fill = isHighlighted ? pin.color || '#888' : '#222';
        const stroke = isSelected ? '#00ffa0' : isHighlighted ? '#fff' : '#444';

        const cx = pos.x + labelPad;
        const cy = pos.y;
        const labelX = labelSide === 'right' ? cx + PIN_RADIUS + 6 : cx - PIN_RADIUS - 6;
        const labelAnchor = labelSide === 'right' ? 'start' : 'end';

        return (
          <g
            key={pin.id}
            data-pin-id={pin.id}
            style={{ cursor: onPinClick ? 'pointer' : 'default' }}
            onClick={(e) => {
              if (!onPinClick) return;
              e.stopPropagation();
              onPinClick(pin.id);
            }}
          >
            {/* Hit target — larger than the visible circle so clicks are easy */}
            <circle
              cx={cx}
              cy={cy}
              r={PIN_RADIUS + 8}
              fill="transparent"
            />
            <circle
              cx={cx}
              cy={cy}
              r={PIN_RADIUS}
              fill={fill}
              stroke={stroke}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
            {pin.pinNumber !== undefined && (
              <text
                x={cx}
                y={cy + 3}
                textAnchor="middle"
                fontFamily="Roboto Mono, monospace"
                fontSize={9}
                fill={isHighlighted ? '#000' : '#666'}
                fontWeight="bold"
                pointerEvents="none"
              >
                {pin.pinNumber}
              </text>
            )}
            <text
              x={labelX}
              y={cy + 3}
              textAnchor={labelAnchor}
              fontFamily="Roboto Mono, monospace"
              fontSize={10}
              fill={isHighlighted ? '#e5e5e5' : '#555'}
              pointerEvents="none"
            >
              {pin.label || `Pin ${pin.pinNumber ?? '?'}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** Find the global pixel center of a pin element inside a container, for drawing wires. */
export function getPinCenterInContainer(
  container: HTMLElement,
  pinId: string
): { x: number; y: number } | null {
  const el = container.querySelector(`[data-pin-id="${pinId}"] circle:nth-of-type(2)`) as SVGCircleElement | null;
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const cRect = container.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - cRect.left,
    y: rect.top + rect.height / 2 - cRect.top,
  };
}

export type { ConnectionPoint };
