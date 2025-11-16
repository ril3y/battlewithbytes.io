/**
 * Loop Renderer for Linear Disassembly View
 *
 * Provides React components and styling for rendering loop visualization using SVG.
 * Simpler and cleaner than ASCII art - renders like IDA Pro.
 */

import React from 'react';
import type { LoopLineInfo, LoopCharType } from './loopAnalysis';

/**
 * Color palette for loop visualization (supports up to 6 nesting levels)
 */
const LOOP_COLORS = [
  '#00d4ff', // Cyan (level 1 - outermost)
  '#00ff88', // Green
  '#ffaa00', // Orange
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#ff4444', // Red (level 6 - innermost)
];

/**
 * Get color for a specific nesting level
 */
export function getLoopColor(nestingLevel: number): string {
  const index = (nestingLevel - 1) % LOOP_COLORS.length;
  return LOOP_COLORS[index];
}

/**
 * Map character type to visual representation with arrows
 */
function getCharacterForType(type: LoopCharType): string {
  switch (type) {
    case 'top': return '┌─→';      // Loop entry with arrow
    case 'bottom': return '└──';   // Loop back edge
    case 'vertical': return '│';   // Loop body
    case 'branch': return '├─→';   // Branch out with arrow
    case 'empty': return '';
    default: return '';
  }
}

/**
 * Props for LoopColumn component
 */
interface LoopColumnProps {
  /** Rendering info for this line */
  lineInfo: LoopLineInfo | undefined;

  /** Whether this line is hovered */
  isHovered?: boolean;

  /** Callback when hovering over a loop */
  onLoopHover?: (loopLevel: number | null) => void;
}

/**
 * Render loop visualization column for a single line using simple text characters
 */
export const LoopColumn: React.FC<LoopColumnProps> = ({
  lineInfo,
  isHovered = false,
  onLoopHover,
}) => {
  if (!lineInfo || lineInfo.columns.length === 0) {
    return null;
  }

  return (
    <div
      className={`loop-viz ${isHovered ? 'loop-viz-hovered' : ''}`}
      onMouseEnter={() => {
        if (lineInfo.activeLoops.length > 0) {
          onLoopHover?.(lineInfo.activeLoops[0]);
        }
      }}
      onMouseLeave={() => onLoopHover?.(null)}
      style={{
        display: 'flex',
        fontFamily: 'monospace',
        fontSize: '12px',
        gap: '4px',
        whiteSpace: 'nowrap',
        paddingRight: '8px',
      }}
    >
      {lineInfo.columns.map((charType, columnIdx) => {
        const nestingLevel = columnIdx + 1;
        const color = getLoopColor(nestingLevel);
        const isActive = lineInfo.activeLoops.includes(nestingLevel);
        const char = getCharacterForType(charType);

        if (!char) {
          return <span key={columnIdx} style={{ width: '24px', display: 'inline-block' }}>&nbsp;</span>;
        }

        return (
          <span
            key={columnIdx}
            style={{
              color: isActive ? color : 'transparent',
              fontWeight: 'bold',
              minWidth: '24px',
              textAlign: 'left',
              display: 'inline-block',
              opacity: isActive ? 1 : 0,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

/**
 * CSS styles for loop visualization
 */
export const LOOP_VISUALIZATION_STYLES = `
  .loop-viz {
    user-select: none;
  }

  .loop-viz-hovered span {
    text-shadow: 0 0 4px currentColor;
  }

  /* Highlight loop body on hover */
  .disassembly-line.loop-active {
    background-color: rgba(0, 212, 255, 0.05);
  }

  .disassembly-line.loop-active.loop-header {
    background-color: rgba(0, 212, 255, 0.15);
  }

  .disassembly-line.loop-active.loop-backedge {
    background-color: rgba(0, 212, 255, 0.15);
  }
`;

/**
 * Helper to merge loop visualization styles into component
 */
export function injectLoopStyles(): void {
  const styleId = 'loop-visualization-styles';

  // Check if already injected
  if (document.getElementById(styleId)) {
    return;
  }

  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = LOOP_VISUALIZATION_STYLES;
  document.head.appendChild(styleEl);
}
