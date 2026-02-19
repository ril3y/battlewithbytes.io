"use client";

import { useState } from "react";
import { useWasmModule } from "../hooks/useWasmModule";
import { loadBattleMagicCore, isWasmSupported } from "../lib/wasm-loader";
import { WasmErrorBoundary } from "../components/WasmErrorBoundary";

/**
 * WASM instruction interface
 */
interface WasmInstruction {
  address?: number;
  text?: string;
  bytes?: Uint8Array | number[];
  mnemonic?: string;
  operands?: string;
}

export default function BattleMagicTestPage() {
  const [output, setOutput] = useState<string[]>([]);
  const [elfFile, setElfFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"thumb" | "arm">("arm");
  const wasm = useWasmModule(loadBattleMagicCore, {
    preload: true, // Auto-load WASM on page load
    debug: true,
  });

  const addOutput = (line: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput((prev) => [...prev, `[${timestamp}] ${line}`]);
  };

  const handleClear = () => {
    setOutput([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setElfFile(file);
      addOutput(
        `Selected file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      );
    }
  };

  const detectMode = (bytes: Uint8Array): "arm" | "thumb" => {
    // Check ELF header for ARM architecture flags
    // ELF magic number check
    if (
      bytes.length < 52 ||
      bytes[0] !== 0x7f ||
      bytes[1] !== 0x45 ||
      bytes[2] !== 0x4c ||
      bytes[3] !== 0x46
    ) {
      addOutput("⚠ Not a valid ELF file, defaulting to ARM mode");
      return "arm";
    }

    // Check for Thumb entry point bit (bit 0 of entry point address at offset 0x18)
    const entryPoint = new DataView(bytes.buffer, bytes.byteOffset).getUint32(
      0x18,
      true,
    );
    const isThumb = (entryPoint & 0x1) === 1;

    if (isThumb) {
      addOutput("📍 Auto-detected: Thumb mode (entry point has LSB set)");
      return "thumb";
    } else {
      addOutput("📍 Auto-detected: ARM mode");
      return "arm";
    }
  };

  const handleDisassembleELF = async () => {
    if (!wasm.module) {
      addOutput("ERROR: WASM not loaded");
      return;
    }

    if (!elfFile) {
      addOutput("ERROR: No ELF file selected");
      return;
    }

    try {
      addOutput(`Reading ELF file: ${elfFile.name}`);
      const arrayBuffer = await elfFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      addOutput(`File size: ${bytes.length} bytes`);

      // Auto-detect mode from ELF headers
      const detectedMode = detectMode(bytes);
      const useMode = detectedMode;

      // For now, try to disassemble the first part
      const disasm = new wasm.module.Disassembler(0x08000000);

      // Skip ELF header (typically first 52 bytes for 32-bit ARM)
      const codeStart = 0x1000; // Common offset for .text section
      if (bytes.length <= codeStart) {
        addOutput("ERROR: File too small or invalid ELF format");
        return;
      }

      const codeBytes = bytes.slice(
        codeStart,
        Math.min(codeStart + 512, bytes.length),
      );
      addOutput(
        `Disassembling ${codeBytes.length} bytes from offset 0x${codeStart.toString(16)} in ${useMode.toUpperCase()} mode...`,
      );

      const instructions =
        useMode === "thumb"
          ? disasm.disassemble_thumb(codeBytes, 50)
          : disasm.disassemble_arm(codeBytes, 50);

      addOutput(`✓ Disassembled ${instructions.length} instructions`);
      addOutput("");

      instructions.forEach((instr: WasmInstruction, idx: number) => {
        try {
          const addr =
            instr.address?.toString(16).padStart(8, "0") || "????????";

          // The instruction is serialized, so we access the text field directly
          // and parse mnemonic/operands from it
          const text = instr.text || "???";
          const firstSpace = text.indexOf(" ");
          const mnemonic =
            firstSpace >= 0 ? text.substring(0, firstSpace) : text;
          const operands =
            firstSpace >= 0 ? text.substring(firstSpace + 1).trim() : "";

          // Get bytes array (serialized as regular array, not Uint8Array)
          const bytesArray = Array.isArray(instr.bytes) ? instr.bytes : [];
          const bytes_hex = bytesArray
            .map((b: number) => b.toString(16).padStart(2, "0"))
            .join(" ");

          addOutput(
            `  0x${addr}:  ${bytes_hex.padEnd(12)}  ${mnemonic} ${operands}`,
          );
        } catch (innerErr: unknown) {
          const errMsg =
            innerErr instanceof Error ? innerErr.message : String(innerErr);
          addOutput(`  [Error formatting instruction ${idx}: ${errMsg}]`);
          console.error("Instruction format error:", innerErr, instr);
        }
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      addOutput(`ERROR: ${errMsg}`);
      console.error("Full error:", err);
    }
  };

  const wasmSupported = isWasmSupported();

  return (
    <WasmErrorBoundary>
      <div className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold font-mono mb-2">
              <span className="text-purple-400">&lt;</span> BattleMagic WASM
              Test <span className="text-purple-400">/&gt;</span>
            </h1>
            <p className="text-gray-400">
              Testing Rust/WASM integration with proof-of-concept ARM
              disassembler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">WASM Support</div>
              <div
                className={`font-mono text-lg ${wasmSupported ? "text-green-400" : "text-red-400"}`}
              >
                {wasmSupported ? "✓ Supported" : "✗ Not Supported"}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Module Status</div>
              <div
                className={`font-mono text-lg ${
                  wasm.isInitialized
                    ? "text-green-400"
                    : wasm.isLoading
                      ? "text-yellow-400"
                      : wasm.error
                        ? "text-red-400"
                        : "text-gray-400"
                }`}
              >
                {wasm.isInitialized
                  ? "✓ Ready"
                  : wasm.isLoading
                    ? "⟳ Loading..."
                    : wasm.error
                      ? "✗ Error"
                      : "○ Not Loaded"}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <div className="font-mono text-lg text-purple-400">
                {wasm.progress}%
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">ELF File Disassembly</h2>

            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">
                Instruction Set Mode
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode("arm")}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    mode === "arm"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  ARM (32-bit)
                </button>
                <button
                  onClick={() => setMode("thumb")}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    mode === "thumb"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Thumb (16/32-bit)
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium cursor-pointer transition-colors">
                Choose ELF File
                <input
                  type="file"
                  accept=".elf,.bin"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {elfFile && (
                <span className="text-sm text-gray-400 font-mono">
                  {elfFile.name}
                </span>
              )}

              <button
                onClick={handleDisassembleELF}
                disabled={!wasm.isInitialized || !elfFile}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
                title={
                  !wasm.isInitialized
                    ? "WASM still loading..."
                    : !elfFile
                      ? "Choose a file first"
                      : "Click to disassemble"
                }
              >
                Disassemble ELF
                {!wasm.isInitialized && " (Loading...)"}
              </button>

              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
              >
                Clear Output
              </button>

              {wasm.error && (
                <button
                  onClick={wasm.reload}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
                >
                  Retry Load
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Upload an ARM ELF binary to disassemble. Select ARM mode for
              32-bit instructions or Thumb mode for 16/32-bit mixed
              instructions.
            </p>
          </div>

          {wasm.error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="font-semibold text-red-300 mb-2">
                Error Loading WASM
              </div>
              <div className="text-red-200 text-sm font-mono">
                {wasm.error.message}
              </div>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-sm text-gray-400">
                  Console Output
                </span>
              </div>
            </div>
            <div className="p-4 font-mono text-sm h-96 overflow-y-auto bg-black/50">
              {output.length === 0 ? (
                <div className="text-gray-600 italic">
                  No output yet. Click Load WASM to begin...
                </div>
              ) : (
                output.map((line, idx) => (
                  <div key={idx} className="mb-1">
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-sm text-blue-200">
              <strong>ℹ️ Info:</strong> This page tests the Rust/WASM
              integration with a proof-of-concept ARM Thumb disassembler. The
              current implementation uses the Rust/WASM disassembler (yaxpeax-arm)
              with ArmDisassembler as fallback.
            </div>
          </div>
        </div>
      </div>
    </WasmErrorBoundary>
  );
}
