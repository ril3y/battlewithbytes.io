/**
 * Mock for battlemagic-analyzer/pkg/battlemagic_analyzer_bg.js
 *
 * The real module is wasm-bindgen glue backed by a Rust WASM binary, which
 * cannot load in Jest. jest.config.js maps 'battlemagic-analyzer/pkg/*' here.
 *
 * This mock mirrors the glue surface consumed by src/lib/wasmAnalyzer.ts
 * (ArmAnalyzer, __wbg_set_wasm, detect_architecture_wasm, ...) and implements
 * a small, deterministic Thumb pattern scanner. It is NOT a real disassembler:
 * it recognizes just enough encodings (BL, unconditional B, LDR literal,
 * MOVS imm, SP-relative LDR/STR, SUB sp) to produce stable xrefs, functions,
 * loops, vector table entries, and argument annotations for the test firmware
 * fixtures.
 *
 * Because src/lib/wasmAnalyzer.ts also fetches the .wasm binary and calls
 * WebAssembly.instantiate, this module installs a fetch stub (jsdom has no
 * fetch) that serves a minimal valid empty WASM module for the analyzer URL
 * and delegates everything else to any pre-existing fetch.
 */

// ============================================================================
// Environment shims so loadWasmAnalyzer()'s fetch + instantiate path succeeds
// ============================================================================

// Smallest valid WASM module: magic + version, no sections.
const EMPTY_WASM = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);

const originalFetch =
  typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : null;

globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  if (url.includes("battlemagic_analyzer_bg.wasm")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      arrayBuffer: async () => EMPTY_WASM.slice().buffer,
    } as unknown as Response);
  }
  if (originalFetch) {
    return originalFetch(input as RequestInfo, init);
  }
  return Promise.reject(
    new Error(`[MockAnalyzer] Unexpected fetch in tests: ${url}`),
  );
}) as typeof fetch;

// jsdom normally exposes WebAssembly; shim it defensively if absent.
if (typeof globalThis.WebAssembly === "undefined") {
  (globalThis as Record<string, unknown>).WebAssembly = {
    instantiate: async () => ({ instance: { exports: {} }, module: {} }),
  };
}

/** wasm-bindgen glue hook: the loader hands us the WASM exports. No-op. */
export function __wbg_set_wasm(_wasm: unknown): void {
  void _wasm;
}

export function init(): void {}

// ============================================================================
// Result shapes (structurally identical to src/lib/wasmAnalyzer.ts interfaces;
// duplicated here to avoid importing the module that dynamically imports us)
// ============================================================================

interface XrefResult {
  from_addr: number;
  to_addr: number;
  xref_type: number; // 0 Call, 1 Branch, 2 CondBranch, 3 DataRead, 4 DataWrite
  instruction: string;
  operands: string;
}

interface Loop {
  header_addr: number;
  back_edge_addr: number;
  body_addrs: number[];
  loop_type: number; // 3 = Infinite
  nesting_level: number;
}

interface StackVariable {
  function_start: number;
  offset: number;
  size: number;
  access_type: number; // 0 read, 1 write
}

interface ArgAnnotation {
  call_address: number;
  function_target: number;
  args: Array<[number, string]>;
}

interface FunctionInfo {
  start_address: number;
  end_address: number | null;
  name: string | null;
  stack_frame_size: number;
  stack_vars: StackVariable[];
  arg_annotations: ArgAnnotation[];
  callers: number[];
  callees: number[];
  complexity: number;
}

interface VectorTableEntry {
  vector_number: number;
  handler_address: number;
  handler_name: string;
  is_valid: boolean;
}

interface AnalysisResults {
  xrefs: XrefResult[];
  loops: Loop[];
  functions: FunctionInfo[];
  vector_table: VectorTableEntry[];
  total_instructions: number;
  analysis_time_ms: number;
  unique_targets: number;
  start_address: number;
  end_address: number;
}

interface DisasmData {
  instructions: Array<{
    address: number;
    bytes: number[];
    mnemonic: string;
    operands: string;
  }>;
}

type ProgressCallback = (stage: string, progress: number) => void;

// ============================================================================
// Deterministic Thumb pattern scanner
// ============================================================================

const XREF_CALL = 0;
const XREF_BRANCH = 1;
const XREF_DATA_READ = 3;
const LOOP_INFINITE = 3;

const VECTOR_NAMES = [
  "Initial_SP",
  "Reset_Handler",
  "NMI_Handler",
  "HardFault_Handler",
  "MemManage_Handler",
  "BusFault_Handler",
  "UsageFault_Handler",
  "Reserved",
  "Reserved",
  "Reserved",
  "Reserved",
  "SVC_Handler",
  "DebugMon_Handler",
  "Reserved",
  "PendSV_Handler",
  "SysTick_Handler",
];

const MAX_VECTOR_ENTRIES = 32;

interface RawInsn {
  offset: number;
  kind:
    | "bl"
    | "b"
    | "ldr_lit"
    | "movs"
    | "sub_sp"
    | "str_sp"
    | "ldr_sp"
    | "other";
  target?: number; // absolute address (bl / b / ldr_lit)
  rd?: number;
  imm?: number;
}

function readLE16(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readLE32(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
}

function parseVectorTable(bytes: Uint8Array): VectorTableEntry[] {
  const count = Math.min(MAX_VECTOR_ENTRIES, bytes.length >> 2);
  const entries: VectorTableEntry[] = [];
  for (let n = 0; n < count; n++) {
    const word = readLE32(bytes, n * 4);
    // Vector 0 is the initial SP (no Thumb bit); handlers must be odd.
    const isValid = n === 0 ? word !== 0 : word !== 0 && (word & 1) === 1;
    entries.push({
      vector_number: n,
      handler_address: word,
      handler_name: n < VECTOR_NAMES.length ? VECTOR_NAMES[n] : `IRQ${n - 16}`,
      is_valid: isValid,
    });
  }
  return entries;
}

function scanInstructions(bytes: Uint8Array, base: number): RawInsn[] {
  const insns: RawInsn[] = [];
  let off = 0;
  while (off + 1 < bytes.length) {
    const hw = readLE16(bytes, off);

    // BL (32-bit Thumb): 0xF000-0xF7FF followed by 0xF800-0xFFFF
    if (hw >= 0xf000 && hw <= 0xf7ff && off + 3 < bytes.length) {
      const hw2 = readLE16(bytes, off + 2);
      if (hw2 >= 0xf800) {
        let delta = ((hw & 0x7ff) << 12) | ((hw2 & 0x7ff) << 1);
        if (delta & 0x400000) delta -= 0x800000; // sign-extend 23 bits
        insns.push({ offset: off, kind: "bl", target: base + off + 4 + delta });
        off += 4;
        continue;
      }
    }

    if (hw >= 0xe000 && hw <= 0xe7ff) {
      // B (unconditional, T2): signed 11-bit halfword offset
      let imm11 = hw & 0x7ff;
      if (imm11 & 0x400) imm11 -= 0x800;
      insns.push({ offset: off, kind: "b", target: base + off + 4 + imm11 * 2 });
    } else if ((hw & 0xf800) === 0x4800) {
      // LDR rd, [pc, #imm8*4] — literal pool read
      const imm = (hw & 0xff) * 4;
      insns.push({
        offset: off,
        kind: "ldr_lit",
        target: base + (((off + 4) & ~3) + imm),
        rd: (hw >> 8) & 7,
        imm,
      });
    } else if ((hw & 0xf800) === 0x2000) {
      // MOVS rd, #imm8
      insns.push({ offset: off, kind: "movs", rd: (hw >> 8) & 7, imm: hw & 0xff });
    } else if ((hw & 0xff80) === 0xb080) {
      // SUB sp, #imm7*4
      insns.push({ offset: off, kind: "sub_sp", imm: (hw & 0x7f) * 4 });
    } else if ((hw & 0xf800) === 0x9000) {
      // STR rd, [sp, #imm8*4]
      insns.push({ offset: off, kind: "str_sp", rd: (hw >> 8) & 7, imm: (hw & 0xff) * 4 });
    } else if ((hw & 0xf800) === 0x9800) {
      // LDR rd, [sp, #imm8*4]
      insns.push({ offset: off, kind: "ldr_sp", rd: (hw >> 8) & 7, imm: (hw & 0xff) * 4 });
    } else {
      insns.push({ offset: off, kind: "other" });
    }
    off += 2;
  }
  return insns;
}

function analyze(bytes: Uint8Array, base: number): AnalysisResults {
  const startTime = Date.now();

  const vectorTable = parseVectorTable(bytes);
  const insns = scanInstructions(bytes, base);

  // Function starts: valid vector handlers inside the image + BL targets.
  const startOffsets = new Set<number>();
  for (const v of vectorTable) {
    if (v.vector_number === 0 || !v.is_valid) continue;
    const off = (v.handler_address & ~1) - base;
    if (off >= 0 && off < bytes.length) startOffsets.add(off);
  }
  for (const insn of insns) {
    if (insn.kind === "bl" && insn.target !== undefined) {
      const off = (insn.target & ~1) - base;
      if (off >= 0 && off < bytes.length) startOffsets.add(off);
    }
  }
  const sortedStarts = [...startOffsets].sort((a, b) => a - b);

  const functions: FunctionInfo[] = sortedStarts.map((start, i) => ({
    start_address: base + start,
    end_address:
      base + (i + 1 < sortedStarts.length ? sortedStarts[i + 1] : bytes.length) - 2,
    name: null,
    stack_frame_size: 0,
    stack_vars: [],
    arg_annotations: [],
    callers: [],
    callees: [],
    complexity: 1,
  }));
  const funcByAddress = new Map<number, FunctionInfo>(
    functions.map((f) => [f.start_address, f]),
  );

  const xrefs: XrefResult[] = [];
  const loops: Loop[] = [];

  // Walk instructions in address order, tracking the containing function and
  // a simple r0-r3 constant state for argument annotations.
  let fi = -1;
  let regState = new Map<number, string>();
  for (const insn of insns) {
    while (fi + 1 < sortedStarts.length && insn.offset >= sortedStarts[fi + 1]) {
      fi++;
      regState = new Map();
    }
    if (fi < 0) continue; // before the first function (vector table area)
    const fn = functions[fi];
    const fromAddr = base + insn.offset;

    switch (insn.kind) {
      case "movs":
        if (insn.rd !== undefined && insn.rd <= 3) {
          regState.set(insn.rd, `#0x${(insn.imm ?? 0).toString(16)}`);
        }
        break;

      case "sub_sp":
        fn.stack_frame_size = Math.max(fn.stack_frame_size, insn.imm ?? 0);
        break;

      case "str_sp":
      case "ldr_sp":
        fn.stack_vars.push({
          function_start: fn.start_address,
          offset: insn.imm ?? 0,
          size: 4,
          access_type: insn.kind === "str_sp" ? 1 : 0,
        });
        break;

      case "bl": {
        const target = insn.target as number;
        xrefs.push({
          from_addr: fromAddr,
          to_addr: target,
          xref_type: XREF_CALL,
          instruction: "bl",
          operands: `#0x${target.toString(16)}`,
        });
        fn.complexity++;
        const callee = funcByAddress.get(target & ~1);
        if (callee) {
          if (!fn.callees.includes(callee.start_address)) {
            fn.callees.push(callee.start_address);
          }
          if (!callee.callers.includes(fn.start_address)) {
            callee.callers.push(fn.start_address);
          }
        }
        if (regState.size > 0) {
          const args = [...regState.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([reg, value]) => [reg, value] as [number, string]);
          fn.arg_annotations.push({
            call_address: fromAddr,
            function_target: target,
            args,
          });
        }
        regState = new Map(); // r0-r3 are clobbered by the call
        break;
      }

      case "b": {
        const target = insn.target as number;
        xrefs.push({
          from_addr: fromAddr,
          to_addr: target,
          xref_type: XREF_BRANCH,
          instruction: "b",
          operands: `#0x${target.toString(16)}`,
        });
        fn.complexity++;
        if (target <= fromAddr) {
          const body: number[] = [];
          for (let a = target; a <= fromAddr && body.length < 256; a += 2) {
            body.push(a);
          }
          loops.push({
            header_addr: target,
            back_edge_addr: fromAddr,
            body_addrs: body,
            loop_type: LOOP_INFINITE,
            nesting_level: 0,
          });
        }
        break;
      }

      case "ldr_lit": {
        const target = insn.target as number;
        xrefs.push({
          from_addr: fromAddr,
          to_addr: target,
          xref_type: XREF_DATA_READ,
          instruction: "ldr",
          operands: `r${insn.rd}, [pc, #${insn.imm}]`,
        });
        break;
      }

      default:
        break;
    }
  }

  return {
    xrefs,
    loops,
    functions,
    vector_table: vectorTable,
    total_instructions: insns.length,
    analysis_time_ms: Math.max(1, Date.now() - startTime),
    unique_targets: new Set(xrefs.map((x) => x.to_addr)).size,
    start_address: base,
    end_address: base + bytes.length,
  };
}

// ============================================================================
// ArmAnalyzer — the class wasm-bindgen would generate
// ============================================================================

export class ArmAnalyzer {
  private baseAddress: number;
  private results: AnalysisResults | null = null;

  constructor(baseAddress: number) {
    this.baseAddress = baseAddress;
  }

  analyze_from_bytes(bytes: Uint8Array): AnalysisResults {
    this.results = analyze(bytes, this.baseAddress);
    return this.results;
  }

  analyze_from_bytes_with_progress(
    bytes: Uint8Array,
    progressCallback?: ProgressCallback,
  ): AnalysisResults {
    progressCallback?.("decoding", 0);
    const results = this.analyze_from_bytes(bytes);
    progressCallback?.("complete", 100);
    return results;
  }

  analyze_from_disasm(disasmData: DisasmData): AnalysisResults {
    const startTime = Date.now();
    const instructions = disasmData?.instructions ?? [];
    const xrefs: XrefResult[] = [];
    for (const insn of instructions) {
      if (insn.mnemonic === "bl" || insn.mnemonic === "b") {
        const target = parseInt(insn.operands.replace(/^#/, ""), 16);
        if (!Number.isNaN(target)) {
          xrefs.push({
            from_addr: insn.address,
            to_addr: target,
            xref_type: insn.mnemonic === "bl" ? XREF_CALL : XREF_BRANCH,
            instruction: insn.mnemonic,
            operands: insn.operands,
          });
        }
      }
    }
    this.results = {
      xrefs,
      loops: [],
      functions: [],
      vector_table: [],
      total_instructions: instructions.length,
      analysis_time_ms: Math.max(1, Date.now() - startTime),
      unique_targets: new Set(xrefs.map((x) => x.to_addr)).size,
      start_address: this.baseAddress,
      end_address:
        instructions.length > 0
          ? instructions[instructions.length - 1].address
          : this.baseAddress,
    };
    return this.results;
  }

  get_xrefs_to(address: number): XrefResult[] {
    return (this.results?.xrefs ?? []).filter((x) => x.to_addr === address);
  }

  get_xrefs_from(address: number): XrefResult[] {
    return (this.results?.xrefs ?? []).filter((x) => x.from_addr === address);
  }

  get_vector_table(): VectorTableEntry[] {
    return this.results?.vector_table ?? [];
  }

  xref_count(): number {
    return this.results?.xrefs.length ?? 0;
  }

  is_analyzed(): boolean {
    return this.results !== null;
  }

  reset(): void {
    this.results = null;
  }

  free(): void {
    this.results = null;
  }
}

// ============================================================================
// Architecture helpers exposed by the real glue module
// ============================================================================

export function detect_architecture_wasm(target_description: string): {
  architecture: string;
  chip_name: string;
  manufacturer: string;
  supported: boolean;
  confidence: number;
} {
  const isStm32 = /stm32/i.test(target_description);
  return {
    architecture: "ArmCortexM4",
    chip_name: isStm32 ? target_description.toUpperCase() : "Unknown",
    manufacturer: isStm32 ? "STMicroelectronics" : "Unknown",
    supported: isStm32,
    confidence: isStm32 ? 0.9 : 0.0,
  };
}

export function get_supported_chips_wasm(): Array<{
  architecture: string;
  chip_name: string;
  manufacturer: string;
  supported: boolean;
  confidence: number;
}> {
  return [
    {
      architecture: "ArmCortexM4",
      chip_name: "STM32F407",
      manufacturer: "STMicroelectronics",
      supported: true,
      confidence: 1.0,
    },
  ];
}

export function is_architecture_supported_wasm(arch_name: string): boolean {
  return arch_name.startsWith("ArmCortexM");
}
