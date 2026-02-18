/**
 * ARM/Thumb Disassembler Module
 *
 * Primary: WasmDisassembler (Rust/yaxpeax-arm, 155KB)
 * Fallback: ArmDisassembler (pure TypeScript, ~20KB, ~30 common instructions)
 */

// Export the shared interface
export type { DisassembledInstruction } from "./ArmDisassembler";

// Export the lightweight TypeScript fallback disassembler
export { ArmDisassembler } from "./ArmDisassembler";

// Export the primary WASM-based disassembler
export { WasmDisassembler } from "./WasmDisassembler";
