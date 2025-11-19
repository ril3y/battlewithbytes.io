/**
 * Loop Renderer for Linear Disassembly View
 *
 * Provides React components and styling for rendering loop visualization.
 * Uses pre-computed CFG loop data from WASM analyzer database.
 */

import React from 'react';

/**
 * Types of characters in loop visualization
 */
export type LoopCharType =
  | 'empty'      // ' '
  | 'vertical'   // '│'
  | 'top'        // '┌'
  | 'bottom'     // '└'
  | 'branch';    // '├'

/**
 * Rendering information for a single line in the loop visualization
 */
export interface LoopLineInfo {
  /** Character type for each nesting level */
  columns: LoopCharType[];

  /** Loops that this line participates in (for hover/highlighting) */
  activeLoops: number[];
}

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
 * Map character type to visual representation using IDA-style brackets
 */
function getCharacterForType(type: LoopCharType): string {
  switch (type) {
    case 'top': return '╭';        // Loop entry (top bracket)
    case 'bottom': return '╰';     // Loop back edge (bottom bracket)
    case 'vertical': return '│';   // Loop body (vertical line)
    case 'branch': return '├';     // Branch out
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
        fontSize: '13px',
        gap: '2px',
        whiteSpace: 'nowrap',
        paddingLeft: '4px',
        paddingRight: '4px',
        height: '100%',
        alignItems: 'center',
      }}
    >
      {lineInfo.columns.map((charType, columnIdx) => {
        const nestingLevel = columnIdx + 1;
        const color = getLoopColor(nestingLevel);
        const isActive = lineInfo.activeLoops.includes(nestingLevel);
        const char = getCharacterForType(charType);

        if (!char) {
          return <span key={columnIdx} style={{ width: '14px', display: 'inline-block' }}>&nbsp;</span>;
        }

        return (
          <span
            key={columnIdx}
            style={{
              color: isActive ? color : 'transparent',
              fontWeight: 'bold',
              minWidth: '14px',
              textAlign: 'center',
              display: 'inline-block',
              opacity: isActive ? 1 : 0,
              lineHeight: '1',
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

/**
 * Generate loop visualization from database loops
 *
 * @param addresses - Array of instruction addresses in visible range
 * @param loops - Array of loops from WASM analyzer (overlapping with visible range)
 * @returns Map of address index to LoopLineInfo
 */
export function generateLoopVisualization(
  addresses: number[],
  loops: Array<{
    header_addr: number;
    back_edge_addr: number;
    body_addrs: number[];
    nesting_level: number;
  }>
): Map<number, LoopLineInfo> {
  const lineInfo = new Map<number, LoopLineInfo>();

  // Build address-to-index map
  const addressToIndex = new Map<number, number>();
  addresses.forEach((addr, idx) => {
    addressToIndex.set(addr, idx);
  });

  // Determine maximum nesting depth
  const maxDepth = loops.reduce((max, loop) => Math.max(max, loop.nesting_level), 0);

  // Initialize all lines with empty columns
  for (let i = 0; i < addresses.length; i++) {
    lineInfo.set(i, {
      columns: Array(maxDepth).fill('empty' as LoopCharType),
      activeLoops: [],
    });
  }

  // Build set of loop body addresses for fast lookup
  const loopBodiesMap = new Map<number, Set<number>>();
  loops.forEach((loop, loopIdx) => {
    loopBodiesMap.set(loopIdx, new Set(loop.body_addrs));
  });

  // For each loop, render its contribution to each line
  for (const loop of loops) {
    const columnIndex = loop.nesting_level - 1; // 0-indexed

    const headerIdx = addressToIndex.get(loop.header_addr);
    const backEdgeIdx = addressToIndex.get(loop.back_edge_addr);
    const bodySet = new Set(loop.body_addrs);

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      const info = lineInfo.get(i)!;

      // Determine character for this position
      let charType: LoopCharType = 'empty';

      if (i === headerIdx) {
        // Loop header - show entry point
        charType = 'top';
        info.activeLoops.push(loop.nesting_level);
      } else if (i === backEdgeIdx) {
        // Back edge - show loop back
        charType = 'bottom';
        info.activeLoops.push(loop.nesting_level);
      } else if (bodySet.has(address)) {
        // Inside loop body
        charType = 'vertical';
        info.activeLoops.push(loop.nesting_level);
      }

      // Set character in appropriate column
      if (charType !== 'empty') {
        info.columns[columnIndex] = charType;
      }
    }
  }

  return lineInfo;
}
