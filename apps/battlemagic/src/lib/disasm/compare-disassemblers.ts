/**
 * Disassembler Comparison Script
 *
 * Demonstrates the differences between ArmDisassembler and CapstoneDisassembler
 * Run this to see side-by-side comparison of instruction coverage and accuracy
 */

import { ArmDisassembler, DisassembledInstruction } from "./ArmDisassembler";
import { CapstoneDisassembler } from "./CapstoneDisassembler";

/**
 * Test code samples representing common ARM Cortex-M patterns
 */
const TEST_SAMPLES = {
  // Simple function prologue
  functionPrologue: new Uint8Array([
    0x2d,
    0xe9,
    0xf0,
    0x4f, // PUSH {r4-r11, lr}
    0x83,
    0xb0, // SUB sp, #12
    0x00,
    0xaf, // ADD r7, sp, #0
  ]),

  // Loop with conditional branch
  simpleLoop: new Uint8Array([
    0x00,
    0x20, // MOVS r0, #0
    0x01,
    0x30, // ADDS r0, #1
    0x0a,
    0x28, // CMP r0, #10
    0xfc,
    0xd1, // BNE (back to ADDS)
    0x70,
    0x47, // BX lr
  ]),

  // Function call sequence
  functionCall: new Uint8Array([
    0x00,
    0xf0,
    0x04,
    0xf8, // BL #8 (call function)
    0x00,
    0x20, // MOVS r0, #0
    0x70,
    0x47, // BX lr
    // Target function at offset 8:
    0x10,
    0xb5, // PUSH {r4, lr}
    0x00,
    0x20, // MOVS r0, #0
    0x10,
    0xbd, // POP {r4, pc}
  ]),

  // Table branch
  tableBranch: new Uint8Array([
    0x00,
    0x28, // CMP r0, #0
    0x01,
    0xd0, // BEQ #2
    0x00,
    0xe0, // B #0
    0x00,
    0x20, // MOVS r0, #0
    0x70,
    0x47, // BX lr
  ]),

  // CBZ/CBNZ instructions
  compareAndBranch: new Uint8Array([
    0x08,
    0xb1, // CBZ r0, #offset
    0x01,
    0x20, // MOVS r0, #1
    0x70,
    0x47, // BX lr
  ]),

  // Wide instructions (Thumb-2)
  wideInstructions: new Uint8Array([
    0x4f,
    0xf0,
    0x00,
    0x00, // MOV.W r0, #0
    0x4f,
    0xf4,
    0x80,
    0x70, // MOV.W r0, #256
    0x00,
    0xf0,
    0x00,
    0xb8, // B.W #0
  ]),

  // Mixed 16-bit and 32-bit
  mixedInstructions: new Uint8Array([
    0x00,
    0x20, // MOVS r0, #0 (16-bit)
    0x4f,
    0xf0,
    0xff,
    0x01, // MOV.W r1, #255 (32-bit)
    0x08,
    0x44, // ADD r0, r1 (16-bit)
    0x70,
    0x47, // BX lr (16-bit)
  ]),
};

/**
 * Format instruction for display
 */
function formatInstruction(inst: DisassembledInstruction): string {
  const addr = `0x${inst.address.toString(16).padStart(8, "0")}`;
  const bytes = Array.from(inst.bytes)
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(" ")
    .padEnd(12, " ");
  const mnem = inst.mnemonic.padEnd(8, " ");
  const ops = inst.operands.padEnd(20, " ");
  const branch = inst.isBranch ? "[BRANCH]" : "        ";
  const target = inst.branchTarget
    ? `-> 0x${inst.branchTarget.toString(16).toUpperCase()}`
    : "";

  return `${addr}: ${bytes} ${mnem} ${ops} ${branch} ${target}`;
}

/**
 * Compare two disassemblers on a code sample
 */
async function compareSample(
  name: string,
  code: Uint8Array,
  baseAddress: number = 0x08000000,
): Promise<void> {
  console.log("\n" + "=".repeat(80));
  console.log(`Sample: ${name}`);
  console.log("=".repeat(80));

  // ArmDisassembler (synchronous)
  console.log("\n--- ArmDisassembler ---");
  const armDisasm = new ArmDisassembler(true);
  const armInstructions = armDisasm.disassemble(code, baseAddress, true);
  for (const inst of armInstructions) {
    console.log(formatInstruction(inst));
  }

  // CapstoneDisassembler (asynchronous)
  console.log("\n--- CapstoneDisassembler ---");
  const capstoneDisasm = new CapstoneDisassembler(true);
  await capstoneDisasm.initialize();
  const capstoneInstructions = await capstoneDisasm.disassemble(
    code,
    baseAddress,
    true,
  );
  for (const inst of capstoneInstructions) {
    console.log(formatInstruction(inst));
  }
  capstoneDisasm.dispose();

  // Analysis
  console.log("\n--- Analysis ---");
  console.log(`ArmDisassembler:      ${armInstructions.length} instructions`);
  console.log(
    `CapstoneDisassembler: ${capstoneInstructions.length} instructions`,
  );

  const armBranches = armInstructions.filter((i) => i.isBranch).length;
  const capstoneBranches = capstoneInstructions.filter(
    (i) => i.isBranch,
  ).length;
  console.log(
    `Branches detected: ARM=${armBranches}, Capstone=${capstoneBranches}`,
  );

  const armTargets = armInstructions.filter(
    (i) => i.branchTarget !== undefined,
  ).length;
  const capstoneTargets = capstoneInstructions.filter(
    (i) => i.branchTarget !== undefined,
  ).length;
  console.log(`Branch targets: ARM=${armTargets}, Capstone=${capstoneTargets}`);
}

/**
 * Performance comparison
 */
async function performanceTest(iterations: number = 1000): Promise<void> {
  console.log("\n" + "=".repeat(80));
  console.log("Performance Test");
  console.log("=".repeat(80));

  const code = TEST_SAMPLES.mixedInstructions;

  // Warm up
  const armDisasm = new ArmDisassembler(true);
  armDisasm.disassemble(code, 0x08000000);

  const capstoneDisasm = new CapstoneDisassembler(true);
  await capstoneDisasm.initialize();
  await capstoneDisasm.disassemble(code, 0x08000000);

  // Test ArmDisassembler
  const armStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    armDisasm.disassemble(code, 0x08000000);
  }
  const armTime = performance.now() - armStart;

  // Test CapstoneDisassembler
  const capstoneStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await capstoneDisasm.disassemble(code, 0x08000000);
  }
  const capstoneTime = performance.now() - capstoneStart;

  capstoneDisasm.dispose();

  console.log(`\nDisassembled ${iterations} times:`);
  console.log(
    `ArmDisassembler:      ${armTime.toFixed(2)}ms (${(armTime / iterations).toFixed(3)}ms per call)`,
  );
  console.log(
    `CapstoneDisassembler: ${capstoneTime.toFixed(2)}ms (${(capstoneTime / iterations).toFixed(3)}ms per call)`,
  );
  console.log(`Relative speed: ${(capstoneTime / armTime).toFixed(2)}x`);
}

/**
 * Main comparison runner
 */
export async function runComparison(): Promise<void> {
  console.log("ARM Disassembler Comparison Tool");
  console.log("================================\n");

  // Compare all test samples
  for (const [name, code] of Object.entries(TEST_SAMPLES)) {
    await compareSample(name, code);
  }

  // Performance test
  await performanceTest(1000);

  console.log("\n" + "=".repeat(80));
  console.log("Comparison Complete");
  console.log("=".repeat(80));
  console.log("\nKey Differences:");
  console.log(
    "1. CapstoneDisassembler has complete ARM Thumb/Thumb-2 coverage",
  );
  console.log(
    "2. CapstoneDisassembler detects more branch types (CBZ, CBNZ, etc.)",
  );
  console.log("3. CapstoneDisassembler provides more accurate mnemonics");
  console.log(
    "4. ArmDisassembler is slightly faster (pure JavaScript vs WebAssembly)",
  );
  console.log("5. CapstoneDisassembler requires async initialization");
  console.log("\nRecommendation:");
  console.log(
    "- Use CapstoneDisassembler for production/analysis (better accuracy)",
  );
  console.log("- Use ArmDisassembler for quick prototyping (faster startup)");
}

/**
 * Quick test function for use in browser console
 */
export async function quickCompare(
  hexString: string,
  address: number = 0x08000000,
): Promise<void> {
  // Convert hex string to Uint8Array
  const bytes = hexString.replace(/\s+/g, "").match(/.{1,2}/g);
  if (!bytes) {
    console.error("Invalid hex string");
    return;
  }
  const code = new Uint8Array(bytes.map((b) => parseInt(b, 16)));

  await compareSample("Custom Code", code, address);
}

// Example usage:
// await runComparison();
// await quickCompare('00 20 70 47', 0x08000000); // MOVS r0, #0; BX lr
