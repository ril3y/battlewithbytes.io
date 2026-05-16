import React, { useState, useEffect } from 'react';
import type { Block } from '../../lib/core/types';
import { generateComponent, getComponent } from '../../lib/component-library';

interface BlockShapeProps {
  block: Block;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

/**
 * BlockShape Component
 *
 * Renders the visual shape of a block:
 * - Library-generated SVG (when componentType references a registered generator)
 * - Plain shape (circle/rounded/rectangle) for blocks without a componentType
 */
export const BlockShape: React.FC<BlockShapeProps> = ({
  block,
  isSelected,
  onClick,
  onMouseDown,
  onDoubleClick,
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!block.componentType) {
      setSvgContent(null);
      setLoadError(false);
      return;
    }

    if (!getComponent(block.componentType)) {
      console.error('Unknown component type:', block.componentType);
      setLoadError(true);
      setSvgContent(null);
      return;
    }

    try {
      const config = {
        ...(block.componentConfig || {}),
        id: block.id,
        color: block.color,
      };
      const result = generateComponent(block.componentType, config);
      setSvgContent(result.svg);
      setLoadError(false);
    } catch (error) {
      console.error('Error generating SVG:', error);
      setLoadError(true);
      setSvgContent(null);
    }
  }, [block.componentType, block.id, block.componentConfig, block.color]);

  const shapeProps = {
    fill: block.color,
    stroke: isSelected ? '#00ffa0' : '#666',
    strokeWidth: isSelected ? 3 : 2,
    style: { cursor: 'move' },
    onClick,
    onMouseDown,
    onDoubleClick,
  };

  // Render generator-backed SVG if available
  if (block.componentType && svgContent && !loadError) {
    const viewBox = block.svgViewBox || `0 0 ${block.width} ${block.height}`;

    // Mirror transforms — applied around the block's center so the SVG flips
    // in place rather than translating off-screen. Connection-point positions
    // are mirrored at toggle time (in the context-menu handler) so they
    // physically follow the visual.
    const cx = block.x + block.width / 2;
    const cy = block.y + block.height / 2;
    const flipParts: string[] = [];
    if (block.flipH) flipParts.push(`translate(${2 * cx}, 0) scale(-1, 1)`);
    if (block.flipV) flipParts.push(`translate(0, ${2 * cy}) scale(1, -1)`);
    const flipTransform = flipParts.join(' ');

    return (
      <g {...(flipTransform ? { transform: flipTransform } : {})}>
        {/* Selection border */}
        <rect
          x={block.x}
          y={block.y}
          width={block.width}
          height={block.height}
          fill="none"
          stroke={isSelected ? '#00ffa0' : 'transparent'}
          strokeWidth={isSelected ? 3 : 0}
          style={{ cursor: 'move', pointerEvents: 'all' }}
          onClick={onClick}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
        />

        <svg
          x={block.x}
          y={block.y}
          width={block.width}
          height={block.height}
          viewBox={viewBox}
          preserveAspectRatio="none"
          style={{ cursor: 'move', pointerEvents: 'none' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </g>
    );
  }

  // Loading or error state
  if (block.componentType && !svgContent) {
    return (
      <g>
        <rect
          x={block.x}
          y={block.y}
          width={block.width}
          height={block.height}
          fill={loadError ? '#c0392b' : '#95a5a6'}
          stroke={isSelected ? '#00ffa0' : '#666'}
          strokeWidth={isSelected ? 3 : 2}
          style={{ cursor: 'move' }}
          onClick={onClick}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
        />
        <text
          x={block.x + block.width / 2}
          y={block.y + block.height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize="12"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {loadError ? 'Error Loading' : 'Loading...'}
        </text>
      </g>
    );
  }

  // Plain shape (blocks without a componentType)
  switch (block.shape) {
    case 'circle': {
      const radius = Math.min(block.width, block.height) / 2;
      return (
        <circle
          cx={block.x + block.width / 2}
          cy={block.y + block.height / 2}
          r={radius}
          {...shapeProps}
        />
      );
    }
    case 'rounded':
      return (
        <rect
          x={block.x}
          y={block.y}
          width={block.width}
          height={block.height}
          rx={8}
          {...shapeProps}
        />
      );
    default:
      return (
        <rect
          x={block.x}
          y={block.y}
          width={block.width}
          height={block.height}
          {...shapeProps}
        />
      );
  }
};
