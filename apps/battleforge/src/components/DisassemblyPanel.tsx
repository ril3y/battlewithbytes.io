"use client";

/**
 * Disassembly Panel Component
 *
 * Displays disassembled ARM/Thumb code from ELF files using Capstone WASM.
 * Shows address, bytes, mnemonic, and operands with syntax highlighting.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { DisassembledInstruction } from "../lib/disasm/types";

interface DisassemblyPanelProps {
  data: Uint8Array;
  filename?: string;
}

// Minimal ELF parsing - just extract .text section
interface ElfSection {
  name: string;
  offset: number;
  size: number;
  address: number;
  flags: number;
  data: Uint8Array;
}

// ELF machine types
const EM_ARM = 40;
const EM_RISCV = 243;
const EM_XTENSA = 94;

// ELF section flags
const SHF_EXECINSTR = 0x4;

type ElfArch = "arm" | "riscv" | "xtensa" | "unknown";

interface ElfParseResult {
  textSection: ElfSection | null;
  entryPoint: number;
  isThumb: boolean;
  architecture: ElfArch;
  error?: string;
}

function parseElf(data: Uint8Array): ElfParseResult {
  // Check ELF magic
  if (data[0] !== 0x7f || data[1] !== 0x45 || data[2] !== 0x4c || data[3] !== 0x46) {
    return {
      textSection: null,
      entryPoint: 0,
      isThumb: true,
      architecture: "unknown",
      error: "Not a valid ELF file (invalid magic bytes)"
    };
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const is32bit = data[4] === 1;
  const isLittleEndian = data[5] === 1;

  // Check for 64-bit ELF - not supported
  if (!is32bit) {
    return {
      textSection: null,
      entryPoint: 0,
      isThumb: true,
      architecture: "unknown",
      error: "64-bit ELF files are not supported. Please use a 32-bit ARM binary."
    };
  }

  // Check endianness - we only support little-endian for ARM/RISC-V
  if (!isLittleEndian) {
    return {
      textSection: null,
      entryPoint: 0,
      isThumb: true,
      architecture: "unknown",
      error: "Big-endian ELF files are not supported. Please use a little-endian binary."
    };
  }

  // Read ELF header (32-bit)
  const e_machine = view.getUint16(0x12, isLittleEndian);
  const rawEntryPoint = view.getUint32(0x18, isLittleEndian);
  const shOffset = view.getUint32(0x20, isLittleEndian);
  const shEntSize = view.getUint16(0x2e, isLittleEndian);
  const shNum = view.getUint16(0x30, isLittleEndian);
  const shStrIndex = view.getUint16(0x32, isLittleEndian);

  // Validate architecture
  let architecture: ElfArch;
  switch (e_machine) {
    case EM_ARM:
      architecture = "arm";
      break;
    case EM_RISCV:
      architecture = "riscv";
      break;
    case EM_XTENSA:
      architecture = "xtensa";
      break;
    default:
      return {
        textSection: null,
        entryPoint: 0,
        isThumb: true,
        architecture: "unknown",
        error: `Unsupported architecture (e_machine=${e_machine}). Only ARM (40), RISC-V (243), and Xtensa (94) are supported.`
      };
  }

  // For ARM: check entry point LSB for Thumb mode
  // In ARM ELF files, LSB of entry point is set to 1 for Thumb mode
  const isThumb = architecture === "arm" && (rawEntryPoint & 1) === 1;
  const entryPoint = rawEntryPoint & ~1; // Clear LSB for actual address

  if (shOffset === 0 || shNum === 0) {
    return { textSection: null, entryPoint, isThumb, architecture };
  }

  // Read section headers
  const sections: Array<{
    nameOffset: number;
    type: number;
    flags: number;
    addr: number;
    offset: number;
    size: number;
  }> = [];

  for (let i = 0; i < shNum; i++) {
    const base = shOffset + i * shEntSize;
    sections.push({
      nameOffset: view.getUint32(base + 0, isLittleEndian),
      type: view.getUint32(base + 4, isLittleEndian),
      flags: view.getUint32(base + 8, isLittleEndian),
      addr: view.getUint32(base + 12, isLittleEndian),
      offset: view.getUint32(base + 16, isLittleEndian),
      size: view.getUint32(base + 20, isLittleEndian),
    });
  }

  // Get string table for section names
  const strSection = sections[shStrIndex];
  if (!strSection) {
    return { textSection: null, entryPoint, isThumb, architecture };
  }

  const getString = (offset: number): string => {
    let str = "";
    let pos = strSection.offset + offset;
    while (pos < data.length && data[pos] !== 0) {
      str += String.fromCharCode(data[pos++]);
    }
    return str;
  };

  // Find .text section - must be executable (SHF_EXECINSTR)
  for (const section of sections) {
    const name = getString(section.nameOffset);
    if (name === ".text" && section.size > 0) {
      // Verify section is executable
      if (!(section.flags & SHF_EXECINSTR)) {
        console.warn("[DisassemblyPanel] .text section found but not marked as executable");
      }
      return {
        textSection: {
          name,
          offset: section.offset,
          size: section.size,
          address: section.addr,
          flags: section.flags,
          data: data.slice(section.offset, section.offset + section.size),
        },
        entryPoint,
        isThumb,
        architecture,
      };
    }
  }

  return { textSection: null, entryPoint, isThumb, architecture };
}

// Syntax highlighting colors (matching BattleMagic)
function getInstructionColor(mnemonic: string): string {
  const mnem = mnemonic.toLowerCase();

  // Return instructions
  if (mnem === "bx" || mnem === "ret") return "text-orange-300";
  // Function calls
  if (mnem.startsWith("bl")) return "text-orange-400";
  // Branches
  if (mnem.startsWith("b")) return "text-yellow-400";
  // Memory operations
  if (mnem.includes("ldr") || mnem.includes("str")) return "text-blue-400";
  // Stack operations
  if (mnem.includes("push") || mnem.includes("pop")) return "text-purple-400";
  if (mnem.includes("stm") || mnem.includes("ldm")) return "text-purple-300";
  // Arithmetic
  if (mnem.includes("add") || mnem.includes("sub") || mnem.includes("mul"))
    return "text-cyan-400";
  // Comparisons
  if (mnem.includes("cmp") || mnem.includes("tst")) return "text-pink-400";
  // Move operations
  if (mnem.includes("mov")) return "text-green-400";
  // System instructions
  if (mnem === "svc" || mnem === "bkpt" || mnem === "udf") return "text-red-400";
  // NOP
  if (mnem === "nop") return "text-gray-500";

  return "text-gray-300";
}

function formatAddress(addr: number): string {
  return `0x${addr.toString(16).padStart(8, "0")}`;
}

function formatBytes(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

// Virtual scrolling constants
const ROW_HEIGHT = 20;
const BUFFER_ROWS = 20;

export function DisassemblyPanel({ data, filename }: DisassemblyPanelProps) {
  const [instructions, setInstructions] = useState<DisassembledInstruction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseAddress, setBaseAddress] = useState(0);
  const [endAddress, setEndAddress] = useState(0);
  const [showBytes, setShowBytes] = useState(true);
  const [gotoAddress, setGotoAddress] = useState("");

  // Virtual scrolling state
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  // Download ELF file
  const handleDownload = useCallback(() => {
    // Extract ArrayBuffer from Uint8Array (handles views correctly)
    const arrayBuffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "firmware.elf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data, filename]);

  // Go to address
  const handleGotoAddress = useCallback(() => {
    if (!gotoAddress.trim()) return;
    const addr = parseInt(gotoAddress.replace(/^0x/i, ""), 16);
    if (isNaN(addr)) return;

    // Find instruction at or near this address
    const idx = instructions.findIndex((inst) => inst.address >= addr);
    if (idx >= 0 && containerRef.current) {
      containerRef.current.scrollTop = idx * ROW_HEIGHT - containerHeight / 2;
    }
    setGotoAddress("");
  }, [gotoAddress, instructions, containerHeight]);

  // Copy disassembly to clipboard
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const handleCopyDisassembly = useCallback(() => {
    const lines = instructions.map((inst) => {
      const addr = formatAddress(inst.address);
      const bytes = formatBytes(inst.bytes).padEnd(12);
      return `${addr}  ${bytes}  ${inst.mnemonic.padEnd(8)} ${inst.opStr}`;
    });
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    });
  }, [instructions]);

  // Load and disassemble
  useEffect(() => {
    let cancelled = false;

    async function disassemble() {
      setIsLoading(true);
      setError(null);

      try {
        // Parse ELF to get .text section and architecture info
        const elfResult = parseElf(data);

        // Check for ELF parsing errors
        if (elfResult.error && !elfResult.textSection) {
          setError(elfResult.error);
          setIsLoading(false);
          return;
        }

        if (!elfResult.textSection) {
          // If not ELF or no .text, try disassembling as raw binary from start
          setError("Could not find .text section in ELF. Showing raw binary disassembly.");
          // For raw binary, assume it starts at 0x08000000 (common for STM32)
          setBaseAddress(0x08000000);
        } else {
          setBaseAddress(elfResult.textSection.address);
        }

        const codeData = elfResult.textSection?.data || data;
        const startAddr = elfResult.textSection?.address || 0x08000000;

        // Dynamically import Capstone loader
        const { createDisassemblerFactory } = await import("../lib/disasm/CapstoneLoader");

        const factory = await createDisassemblerFactory({
          onProgress: (p) => console.log("[Disasm]", p.message),
        });

        if (cancelled) return;

        // Select appropriate disassembler based on architecture and mode
        let disasm;
        switch (elfResult.architecture) {
          case "arm":
            // Use Thumb mode if detected from entry point, otherwise default to Thumb for Cortex-M
            disasm = elfResult.isThumb ? factory.createArmThumb() : factory.createArm();
            console.log(`[Disasm] Using ARM ${elfResult.isThumb ? "Thumb" : "ARM"} mode`);
            break;
          case "riscv":
            disasm = factory.createRiscv32();
            console.log("[Disasm] Using RISC-V 32-bit mode");
            break;
          case "xtensa":
            // Xtensa not yet supported in Capstone - fall back to ARM Thumb
            console.warn("[Disasm] Xtensa architecture not yet supported, falling back to ARM Thumb");
            disasm = factory.createArmThumb();
            break;
          default:
            // Default to ARM Thumb for raw binaries (most common for embedded)
            disasm = factory.createArmThumb();
            console.log("[Disasm] Unknown architecture, defaulting to ARM Thumb");
        }

        if (cancelled) return;

        // Disassemble code
        const result = disasm.disassemble(codeData, startAddr, 0);

        disasm.dispose();

        if (cancelled) return;

        setInstructions(result);
        // Calculate end address from last instruction
        if (result.length > 0) {
          const lastInst = result[result.length - 1];
          setEndAddress(lastInst.address + lastInst.bytes.length);
        }
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Disassembly failed:", err);
        setError(err instanceof Error ? err.message : "Disassembly failed");
        setIsLoading(false);
      }
    }

    disassemble();

    return () => {
      cancelled = true;
    };
  }, [data]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Update container height on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate visible rows
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
    const visibleRows = Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_ROWS * 2;
    const endRow = Math.min(instructions.length, startRow + visibleRows);
    return { startRow, endRow };
  }, [scrollTop, containerHeight, instructions.length]);

  const totalHeight = instructions.length * ROW_HEIGHT;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a] text-gray-400">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading Capstone disassembler...</p>
        </div>
      </div>
    );
  }

  if (error && instructions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a] text-red-400">
        <div className="text-center max-w-md">
          <p className="text-lg mb-2">Disassembly Error</p>
          <p className="text-sm text-gray-400">{error}</p>
          <p className="text-xs text-gray-500 mt-4">
            Make sure Capstone is installed via WASM Tools.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-gray-200 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#111] border-b border-gray-800 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          {filename && <span className="text-green-400">{filename}</span>}
          <span className="text-gray-500">
            {instructions.length.toLocaleString()} instructions
          </span>
          <span className="text-gray-500">
            {formatAddress(baseAddress)} - {formatAddress(endAddress)}
          </span>
          <span className="text-gray-600 text-[10px]">
            ({(endAddress - baseAddress).toLocaleString()} bytes)
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Go to address */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="Go to 0x..."
              value={gotoAddress}
              onChange={(e) => setGotoAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGotoAddress()}
              className="w-28 px-2 py-1 bg-[#1a1a1a] border border-gray-700 rounded text-gray-300 text-xs focus:border-green-500 focus:outline-none"
            />
            <button
              onClick={handleGotoAddress}
              className="px-2 py-1 bg-[#222] border border-gray-600 rounded text-gray-400 text-xs hover:bg-[#333] hover:text-green-400"
            >
              Go
            </button>
          </div>
          {/* Show bytes toggle */}
          <label className="flex items-center gap-1 text-gray-400 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={showBytes}
              onChange={(e) => setShowBytes(e.target.checked)}
              className="accent-green-500"
            />
            Bytes
          </label>
          {/* Copy disassembly button */}
          <button
            onClick={handleCopyDisassembly}
            className="flex items-center gap-1 px-2 py-1 bg-[#222] border border-gray-600 rounded text-gray-400 text-xs hover:bg-[#333] hover:text-green-400"
            title="Copy disassembly to clipboard"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {copyStatus === "copied" ? "Copied!" : "Copy"}
          </button>
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 bg-[#222] border border-gray-600 rounded text-gray-400 text-xs hover:bg-[#333] hover:text-green-400"
            title="Download ELF file"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-1 bg-yellow-900/30 text-yellow-400 text-xs">
          {error}
        </div>
      )}

      {/* Column headers */}
      <div className="flex px-3 py-1 bg-[#151515] border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-wide">
        <span className="w-24 shrink-0">Address</span>
        {showBytes && <span className="w-28 shrink-0">Bytes</span>}
        <span className="w-16 shrink-0">Mnemonic</span>
        <span className="flex-1">Operands</span>
      </div>

      {/* Disassembly content with virtual scrolling */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {instructions.slice(visibleRange.startRow, visibleRange.endRow).map((inst, i) => {
            const rowIndex = visibleRange.startRow + i;
            return (
              <div
                key={rowIndex}
                className="flex px-3 hover:bg-gray-800/50"
                style={{
                  position: "absolute",
                  top: rowIndex * ROW_HEIGHT,
                  left: 0,
                  right: 0,
                  height: ROW_HEIGHT,
                  lineHeight: `${ROW_HEIGHT}px`,
                }}
              >
                {/* Address */}
                <span className="w-24 shrink-0 text-gray-500">
                  {formatAddress(inst.address)}
                </span>

                {/* Bytes */}
                {showBytes && (
                  <span className="w-28 shrink-0 text-gray-600 truncate">
                    {formatBytes(inst.bytes)}
                  </span>
                )}

                {/* Mnemonic */}
                <span className={`w-16 shrink-0 ${getInstructionColor(inst.mnemonic)}`}>
                  {inst.mnemonic}
                </span>

                {/* Operands */}
                <span className={getInstructionColor(inst.mnemonic)}>
                  {inst.opStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer status */}
      <div className="px-3 py-1 bg-[#111] border-t border-gray-800 text-gray-500 text-[10px]">
        Disassembled with Capstone 5.0.3 (ARM/Thumb mode)
      </div>
    </div>
  );
}
