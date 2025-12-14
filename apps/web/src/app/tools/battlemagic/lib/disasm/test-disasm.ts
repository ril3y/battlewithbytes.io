/**
 * Test file for ARM Disassembler
 *
 * This file contains test cases to verify the disassembler works correctly
 * with common ARM Thumb instructions.
 */

import { ArmDisassembler } from "./ArmDisassembler";

// Test function to verify disassembler
function testDisassembler() {
  const disasm = new ArmDisassembler();

  // Example ARM Thumb code bytes (common startup sequence)
  // push {r7, lr}
  // mov r7, sp
  // movs r0, #0
  // pop {r7, pc}
  const testCode = new Uint8Array([
    0x80,
    0xb5, // push {r7, lr}
    0x00,
    0xaf, // add r7, sp, #0
    0x00,
    0x20, // movs r0, #0
    0x80,
    0xbd, // pop {r7, pc}
  ]);

  console.log("Testing ARM Disassembler:");
  console.log(
    "Input bytes:",
    Array.from(testCode)
      .map((b) => "0x" + b.toString(16).padStart(2, "0"))
      .join(" "),
  );
  console.log("\nDisassembled instructions:");

  const instructions = disasm.disassemble(testCode, 0x08000000, true);

  for (const inst of instructions) {
    const formatted = disasm.formatInstruction(inst, true);
    console.log(formatted);
  }

  // Test branch instruction
  const branchCode = new Uint8Array([
    0xfe,
    0xe7, // b.n #-4 (infinite loop)
  ]);

  console.log("\nBranch instruction test:");
  const branchInst = disasm.disassemble(branchCode, 0x08000100, true);
  for (const inst of branchInst) {
    const formatted = disasm.formatInstruction(inst, true);
    console.log(formatted);
    if (inst.branchTarget) {
      console.log(`  -> Branches to: 0x${inst.branchTarget.toString(16)}`);
    }
  }

  // Test Thumb-2 32-bit instruction
  const thumb2Code = new Uint8Array([
    0x4f,
    0xf0,
    0x00,
    0x00, // mov.w r0, #0
  ]);

  console.log("\nThumb-2 instruction test:");
  const thumb2Inst = disasm.disassemble(thumb2Code, 0x08000200, true);
  for (const inst of thumb2Inst) {
    const formatted = disasm.formatInstruction(inst, true);
    console.log(formatted);
  }
}

// Export test function
export { testDisassembler };

// Run test if executed directly
if (require.main === module) {
  testDisassembler();
}
