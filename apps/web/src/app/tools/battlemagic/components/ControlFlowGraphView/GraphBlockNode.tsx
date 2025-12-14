/**
 * Graph Block Node Renderer
 *
 * Canvas-based rendering utilities for individual basic blocks in the control flow graph.
 * Displays block header, instructions with syntax highlighting, and visual indicators
 * for breakpoints and program counter (similar to IDA Pro).
 */

import type { BasicBlock, BlockLayout, BlockType } from "../../lib/cfg/types";
import type { DisassembledInstruction } from "../../lib/arch/arm/disasm";

export interface BlockXrefInfo {
  incomingCalls: number;
  outgoingCalls: number;
  incomingBranches: number;
  outgoingBranches: number;
  instructionsWithXrefs: number;
  isEntryPoint: boolean;
  isBranchTarget: boolean;
}

export interface GraphBlockNodeOptions {
  showOpcodes?: boolean;
  sectionName?: string; // e.g., ".text", ".rodata"
  xrefInfo?: BlockXrefInfo;
  showXrefIndicators?: boolean;
}

/**
 * Get hex color string from Tailwind color class
 */
function getInstructionHexColor(inst: DisassembledInstruction): string {
  const mnem = inst.mnemonic.toLowerCase();

  // Branches and jumps
  if (mnem === "bx" && inst.operands?.toLowerCase() === "lr") return "#fdba74"; // orange-300
  if (mnem.startsWith("bl")) return "#fb923c"; // orange-400
  if (mnem.startsWith("b")) return "#fbbf24"; // yellow-400

  // Memory operations
  if (mnem.includes("ldr") || mnem.includes("str")) return "#60a5fa"; // blue-400

  // Stack operations
  if (mnem.includes("push") || mnem.includes("pop")) return "#c084fc"; // purple-400
  if (mnem.includes("stm") || mnem.includes("ldm")) return "#d8b4fe"; // purple-300

  // Arithmetic
  if (mnem.includes("add") || mnem.includes("sub") || mnem.includes("mul"))
    return "#22d3ee"; // cyan-400

  // Comparisons
  if (mnem.includes("cmp") || mnem.includes("tst")) return "#f472b6"; // pink-400

  // Move operations
  if (mnem.includes("mov")) return "#4ade80"; // green-400

  // Data directives
  if (mnem.startsWith(".")) return "#6b7280"; // gray-500

  // System instructions
  if (mnem === "svc" || mnem === "bkpt" || mnem === "udf") return "#f87171"; // red-400

  return "#d1d5db"; // gray-300 - default
}

/**
 * Get block type colors
 */
function getBlockTypeColors(blockType: BlockType): {
  bg: string;
  border: string;
  text: string;
} {
  const colors = {
    entry: { bg: "#1e3a8a", border: "#3b82f6", text: "#93c5fd" }, // Blue
    normal: { bg: "#1e293b", border: "#475569", text: "#cbd5e1" }, // Gray
    conditional: { bg: "#713f12", border: "#f59e0b", text: "#fbbf24" }, // Amber
    call: { bg: "#581c87", border: "#a855f7", text: "#c084fc" }, // Purple
    return: { bg: "#831843", border: "#ec4899", text: "#f9a8d4" }, // Pink
    exit: { bg: "#7f1d1d", border: "#ef4444", text: "#fca5a5" }, // Red
    unreachable: { bg: "#171717", border: "#404040", text: "#737373" }, // Dark gray
  };

  return colors[blockType] || colors.normal;
}

/**
 * Draw a basic block node on canvas
 *
 * Visual Structure:
 * ┌─────────────────────────┐
 * │ .text                   │ <- Section header (optional)
 * ├─────────────────────────┤
 * │ Block_0x08000000        │ <- Block ID
 * │ [ENTRY]                 │ <- Block type badge
 * ├─────────────────────────┤
 * │ ● 0x08000000  48 00     │ <- Breakpoint + opcode (optional)
 * │   push {r3, lr}         │ <- Instruction (syntax highlighted)
 * │   0x08000002  AB 12     │
 * │   ldr r0, [pc, #8]      │
 * └─────────────────────────┘
 */
export function drawGraphBlockNode(
  ctx: CanvasRenderingContext2D,
  block: BasicBlock,
  layout: BlockLayout,
  options: {
    programCounter?: number;
    breakpoints: Set<number>;
    showOpcodes?: boolean;
    sectionName?: string;
    isSelected?: boolean;
    isHovered?: boolean;
    xrefInfo?: BlockXrefInfo;
    showXrefIndicators?: boolean;
  },
): void {
  const { x, y, width, height } = layout;
  const {
    programCounter,
    breakpoints,
    showOpcodes = false,
    sectionName,
    isSelected = false,
    isHovered = false,
    xrefInfo,
    showXrefIndicators = false,
  } = options;

  const isPCBlock =
    programCounter !== undefined &&
    programCounter >= block.startAddress &&
    programCounter <= block.endAddress;

  const colors = getBlockTypeColors(block.type);

  // Draw xref entry point glow if enabled
  if (showXrefIndicators && xrefInfo?.isEntryPoint && !isPCBlock) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#60a5fa"; // Blue glow for entry points
  } else if (showXrefIndicators && xrefInfo?.isBranchTarget && !isPCBlock) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#fbbf24"; // Yellow glow for branch targets
  } else if (isPCBlock) {
    // Draw PC glow effect if this block contains the program counter
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#4ade80"; // Green glow
  }

  // Draw block background
  ctx.fillStyle = isSelected
    ? colors.border
    : isHovered
      ? colors.text
      : colors.bg;
  ctx.fillRect(x, y, width, height);

  // Reset shadow
  ctx.shadowBlur = 0;

  // Draw border with xref-based colors
  let borderColor = colors.border;
  let borderWidth = 2;

  if (isPCBlock) {
    borderColor = "#4ade80"; // Green for PC
    borderWidth = 4;
  } else if (isSelected) {
    borderColor = "#10b981";
    borderWidth = 3;
  } else if (showXrefIndicators && xrefInfo?.isEntryPoint) {
    borderColor = "#60a5fa"; // Blue for entry points
    borderWidth = 3;
  } else if (showXrefIndicators && xrefInfo?.isBranchTarget) {
    borderColor = "#fbbf24"; // Yellow for branch targets
    borderWidth = 2;
  }

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(x, y, width, height);

  let currentY = y + 8;

  // Draw section header (optional)
  if (sectionName) {
    ctx.fillStyle = "#1f2937"; // bg-gray-800
    ctx.fillRect(x, currentY, width, 16);
    ctx.strokeStyle = "#374151"; // border-gray-700
    ctx.lineWidth = 1;
    ctx.moveTo(x, currentY + 16);
    ctx.lineTo(x + width, currentY + 16);
    ctx.stroke();

    ctx.fillStyle = "#4ade80"; // text-green-400
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillText(sectionName, x + 8, currentY + 12);
    currentY += 18;
  }

  // Draw block ID
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText(block.id, x + 8, currentY + 12);
  currentY += 14;

  // Draw block type badge
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = "#64748b";
  ctx.fillText(`[${block.type.toUpperCase()}]`, x + 8, currentY + 10);
  currentY += 16;

  // Draw separator line
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 4, currentY);
  ctx.lineTo(x + width - 4, currentY);
  ctx.stroke();
  currentY += 4;

  // Draw instructions
  ctx.font = '10px "Courier New", monospace';

  for (const inst of block.instructions) {
    const hasBreakpoint = breakpoints.has(inst.address);
    const isPC = inst.address === programCounter;

    // Draw instruction background for breakpoint/PC
    if (hasBreakpoint || isPC) {
      ctx.fillStyle = hasBreakpoint
        ? "rgba(127, 29, 29, 0.2)"
        : "rgba(20, 83, 45, 0.2)";
      ctx.fillRect(x, currentY, width, 12);
    }

    let textX = x + 8;

    // Draw breakpoint indicator
    if (hasBreakpoint) {
      ctx.fillStyle = "#ef4444"; // red-500
      ctx.beginPath();
      ctx.arc(textX + 4, currentY + 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    textX += 12;

    // Draw PC indicator
    if (isPC) {
      ctx.fillStyle = "#4ade80"; // green-500
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText("▶", textX, currentY + 10);
    }
    textX += 12;

    // Draw address
    ctx.fillStyle = "#9ca3af"; // text-gray-400
    ctx.font = '10px "Courier New", monospace';
    const addrStr = `0x${inst.address.toString(16).toUpperCase().padStart(8, "0")}`;
    ctx.fillText(addrStr, textX, currentY + 10);
    textX += 80;

    // Draw opcode bytes (optional)
    if (showOpcodes && inst.bytes) {
      ctx.fillStyle = "#4b5563"; // text-gray-600
      const opcodeStr = Array.from(inst.bytes)
        .map((b: number) => b.toString(16).toUpperCase().padStart(2, "0"))
        .join(" ");
      ctx.fillText(opcodeStr, textX, currentY + 10);
      textX += 70;
    }

    // Draw instruction with syntax highlighting
    const instColor = getInstructionHexColor(inst);
    ctx.fillStyle = instColor;
    const instText = inst.operands
      ? `${inst.mnemonic} ${inst.operands}`
      : inst.mnemonic;
    ctx.fillText(instText, textX, currentY + 10);

    currentY += 12;
  }

  // Draw xref badges if enabled
  if (showXrefIndicators && xrefInfo) {
    const badgeY = y + 8;
    let badgeX = x + width - 8;

    // Draw incoming calls badge
    if (xrefInfo.incomingCalls > 0) {
      const badgeText = `${xrefInfo.incomingCalls}`;
      const badgeWidth = ctx.measureText(badgeText).width + 8;
      badgeX -= badgeWidth;

      // Badge background
      ctx.fillStyle = "#1e3a8a"; // blue-900
      ctx.fillRect(badgeX, badgeY, badgeWidth, 14);
      ctx.strokeStyle = "#60a5fa"; // blue-400
      ctx.lineWidth = 1;
      ctx.strokeRect(badgeX, badgeY, badgeWidth, 14);

      // Badge text
      ctx.fillStyle = "#93c5fd"; // blue-300
      ctx.font = 'bold 9px "Courier New", monospace';
      ctx.fillText(badgeText, badgeX + 4, badgeY + 10);

      // Icon
      ctx.fillStyle = "#60a5fa";
      ctx.font = 'bold 9px "Courier New", monospace';
      ctx.fillText("↓", badgeX + badgeWidth - 10, badgeY + 10);

      badgeX -= 4;
    }

    // Draw instructions with xrefs count
    if (xrefInfo.instructionsWithXrefs > 0) {
      const badgeText = `${xrefInfo.instructionsWithXrefs}x`;
      const badgeWidth = ctx.measureText(badgeText).width + 8;
      badgeX -= badgeWidth;

      // Badge background
      ctx.fillStyle = "#365314"; // green-900
      ctx.fillRect(badgeX, badgeY, badgeWidth, 14);
      ctx.strokeStyle = "#4ade80"; // green-400
      ctx.lineWidth = 1;
      ctx.strokeRect(badgeX, badgeY, badgeWidth, 14);

      // Badge text
      ctx.fillStyle = "#86efac"; // green-300
      ctx.font = 'bold 9px "Courier New", monospace';
      ctx.fillText(badgeText, badgeX + 4, badgeY + 10);

      badgeX -= 4;
    }

    // Draw entry point indicator
    if (xrefInfo.isEntryPoint) {
      const badgeWidth = 16;
      badgeX -= badgeWidth;

      // Badge background
      ctx.fillStyle = "#1e3a8a"; // blue-900
      ctx.fillRect(badgeX, badgeY, badgeWidth, 14);
      ctx.strokeStyle = "#60a5fa"; // blue-400
      ctx.lineWidth = 1;
      ctx.strokeRect(badgeX, badgeY, badgeWidth, 14);

      // Entry icon
      ctx.fillStyle = "#93c5fd";
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText("⊳", badgeX + 3, badgeY + 10);
    }
  }
}
