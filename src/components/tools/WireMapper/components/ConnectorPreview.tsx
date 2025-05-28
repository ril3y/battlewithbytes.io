import React from 'react';
import { Connector, Pin, ConnectorConfig, ConnectorShape } from '../types';
import { getRenderer } from '../connectors/connectorRegistry';
import { CONNECTOR_DEFAULTS } from '../constants';

// Define theme colors (replace with actual theme variables if available)
const THEME_COLORS = {
  background: '#1a202c', // Dark background
  accent: '#00ff9d',    // Green accent
  pinFill: '#374151',     // Mid-gray for pin body
  textLight: '#E2E8F0',   // Light text for contrast
  textDark: '#1A202C',    // Dark text (for light backgrounds, if needed)
  textSubtle: '#94a3b8',  // Subtle gray text
  border: '#475569',     // Border color
};

export interface ConnectorPreviewProps {
  connector: Partial<Pick<Connector, 'id' | 'name' | 'type' | 'gender' | 'shape' | 'width' | 'height' | 'config'>> & {
    pins: Pin[];
    shape: ConnectorShape;
    config: ConnectorConfig;
  };
  scale?: number;
  onPinClick?: (pinId: string) => void;
}

const PIN_RADIUS = 4;

export const ConnectorPreview: React.FC<ConnectorPreviewProps> = ({ connector, scale = 1, onPinClick }) => {
  const renderer = getRenderer(connector.shape);

  if (!renderer) {
    return <div className="text-red-500">Error: Renderer not found for shape {connector.shape}</div>;
  }

  const pins = connector.pins;

  // --- Calculate pin bounds for dynamic padding ---
  const scaledPinRadius = PIN_RADIUS * scale;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  pins.forEach(pin => {
    if (typeof pin.x === 'number' && typeof pin.y === 'number') {
      minX = Math.min(minX, pin.x);
      minY = Math.min(minY, pin.y);
      maxX = Math.max(maxX, pin.x);
      maxY = Math.max(maxY, pin.y);
    }
  });
  // Add padding so pins are never clipped
  // Reduce vertical padding for compact rows
  const padX = Math.max(scaledPinRadius * 2, 16 * scale);
  const padY = Math.max(scaledPinRadius * 1.1, 8 * scale); // Less vertical pad than horizontal
  // If pins are not defined, fallback to connector dimensions
  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    minX = 0; minY = 0;
    maxX = (connector.width ?? CONNECTOR_DEFAULTS.width) * scale;
    maxY = (connector.height ?? CONNECTOR_DEFAULTS.height) * scale;
  }
  const svgMinX = Math.floor(minX - padX);
  const svgMinY = Math.floor(minY - padY);
  const svgMaxX = Math.ceil(maxX + padX);
  const svgMaxY = Math.ceil(maxY + padY);
  const width = svgMaxX - svgMinX;
  const height = svgMaxY - svgMinY;
  const viewBox = `${svgMinX} ${svgMinY} ${width} ${height}`;

  // Connector Base Component (adjust styling here)
  const ConnectorBase = () => {
    if (connector.shape === 'Circle') {
      // Approximate center based on calculated viewbox
      const centerX = svgMinX + width / 2;
      const centerY = svgMinY + height / 2;
      const radius = Math.min(width, height) / 2 - (1 * scale); // Adjust radius slightly for stroke

      return (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={THEME_COLORS.background} // Dark background
          stroke={THEME_COLORS.accent}   // Green accent stroke
          strokeWidth={1.5 * scale}
        />
      );
    } else {
      // Rectangle connector: use calculated viewbox coords/dims
      return (
        <rect
          x={svgMinX}
          y={svgMinY}
          width={width}
          height={height}
          rx={5 * scale} // Smaller radius for subtle rounding
          ry={5 * scale}
          fill={THEME_COLORS.background} // Dark background
          stroke={THEME_COLORS.accent}   // Green accent stroke
          strokeWidth={1.5 * scale}
        />
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Removed bg-gray-700 from SVG, using ConnectorBase fill instead */}
      <svg width={width} height={height} viewBox={viewBox} className="rounded overflow-hidden border border-[${THEME_COLORS.border}]">
        <ConnectorBase />
        {pins.map((pin) => {
          // Use precomputed pin.x and pin.y from generatePins
          if (typeof pin.x !== 'number' || typeof pin.y !== 'number') return null;

          const pinIsActive = pin.active ?? true;

          return (
            <g
              key={pin.id || pin.index}
              transform={`translate(${pin.x}, ${pin.y})`}
              opacity={pinIsActive ? 1 : 0.4}
              onClick={(e) => {
                e.stopPropagation();
                if (pin.id) {
                  onPinClick?.(pin.id);
                }
              }}
              className={onPinClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
            >
              <circle
                cx="0"
                cy="0"
                r={scaledPinRadius}
                fill={THEME_COLORS.pinFill}      // Updated pin fill
                stroke={THEME_COLORS.accent}    // Green accent stroke
                strokeWidth={0.7 * scale}       // Slightly thinner pin stroke
                // Optional: Add subtle glow back if desired
                // style={{ filter: `drop-shadow(0 0 ${2 * scale}px ${THEME_COLORS.accent})` }}
              />
              {/* Pin number in light color for contrast */}
              <text
                x="0"
                y="0"
                dy=".3em"
                textAnchor="middle"
                fontSize={scaledPinRadius * 0.9}
                fill={THEME_COLORS.textLight}   // Updated text color
                fontWeight="bold"
                fontFamily='monospace'         // Use monospace for consistency
                className="pointer-events-none select-none"
              >
                {pin.number}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Updated text styling below preview */}
      <div className="text-xs text-center mt-2 text-[${THEME_COLORS.textSubtle}] font-mono">
        <p className="text-[${THEME_COLORS.textLight}] font-semibold">{connector.name || 'Unnamed Preview'}</p>
        <p>{pins.length} pin / {connector.gender || 'Unknown'}</p>
        <p>Shape: {connector.shape}</p>
      </div>
    </div>
  );
};