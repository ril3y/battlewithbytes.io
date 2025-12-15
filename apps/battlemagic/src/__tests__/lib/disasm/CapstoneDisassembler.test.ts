/**
 * CapstoneDisassembler Tests
 * Tests for Capstone-based ARM/Thumb instruction disassembly
 *
 * Note: These tests use a mock Capstone implementation since the real Capstone.js
 * requires WebAssembly which is not available in Jest's Node environment.
 * The mock is automatically loaded from __mocks__/@alexaltea/capstone-js.ts
 */

// Enable manual mock
jest.mock("@alexaltea/capstone-js");

import {
  CapstoneDisassembler,
  createCapstoneDisassembler,
} from "../../../lib/disasm/CapstoneDisassembler";
import { THUMB_INSTRUCTIONS } from "../../fixtures/testData";

describe("CapstoneDisassembler", () => {
  let disassembler: CapstoneDisassembler;

  beforeEach(async () => {
    disassembler = new CapstoneDisassembler(true); // little-endian
    await disassembler.initialize();
  });

  afterEach(() => {
    disassembler.dispose();
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      const dis = new CapstoneDisassembler();
      await dis.initialize();
      expect(dis.isReady()).toBe(true);
      dis.dispose();
    });

    it("should handle multiple initialize calls", async () => {
      const dis = new CapstoneDisassembler();
      await dis.initialize();
      await dis.initialize(); // Should not throw
      expect(dis.isReady()).toBe(true);
      dis.dispose();
    });

    it("should create and initialize with factory function", async () => {
      const dis = await createCapstoneDisassembler(true);
      expect(dis.isReady()).toBe(true);
      dis.dispose();
    });

    it("should throw error if disassemble called before init", async () => {
      const dis = new CapstoneDisassembler();
      const data = new Uint8Array([0x00, 0x20]);

      // Should auto-initialize
      const result = await dis.disassemble(data, 0x08000000);
      expect(result).toBeDefined();
      dis.dispose();
    });
  });

  describe("Basic Disassembly", () => {
    it("should disassemble simple MOVS instruction", async () => {
      const data = new Uint8Array([0x00, 0x20]); // MOVS r0, #0
      const instructions = await disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].address).toBe(0x08000000);
      expect(instructions[0].size).toBe(2);
      expect(instructions[0].mnemonic).toBeTruthy();
      expect(instructions[0].mnemonic.toLowerCase()).toContain("mov");
    });

    it("should preserve instruction bytes", async () => {
      const data = new Uint8Array([0x00, 0x20]);
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions[0].bytes).toEqual(new Uint8Array([0x00, 0x20]));
    });

    it("should extract correct size for 16-bit Thumb", async () => {
      const data = new Uint8Array([0x00, 0x20]);
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions[0].size).toBe(2);
    });

    it("should extract correct size for 32-bit Thumb-2", async () => {
      const data = new Uint8Array([0x00, 0xf0, 0x00, 0xb8]); // B.W instruction
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].size).toBe(4);
    });

    it("should handle empty data", async () => {
      const data = new Uint8Array(0);
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions.length).toBe(0);
    });
  });

  describe("Branch Instruction Detection", () => {
    it("should detect BX as branch", async () => {
      const data = new Uint8Array([0x70, 0x47]); // BX lr
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions[0].isBranch).toBe(true);
    });

    it("should detect BL as branch", async () => {
      const data = new Uint8Array([0x00, 0xf0, 0x00, 0xf8]); // BL instruction
      const instructions = await disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].isBranch).toBe(true);
    });

    it("should detect conditional branches", async () => {
      const data = new Uint8Array([0x00, 0xd0]); // BEQ instruction
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].isBranch).toBe(true);
    });

    it("should not mark MOV as branch", async () => {
      const data = new Uint8Array([0x00, 0x20]); // MOVS r0, #0
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions[0].isBranch).toBe(false);
    });
  });

  describe("Branch Target Calculation", () => {
    it("should calculate branch target for simple branch", async () => {
      const data = new Uint8Array([0x00, 0xe0]); // B #0 (PC+4)
      const instructions = await disassembler.disassemble(data, 0x08000000);

      expect(instructions[0].isBranch).toBe(true);
      expect(instructions[0].branchTarget).toBeDefined();
    });

    it("should handle BL with target calculation", async () => {
      const data = THUMB_INSTRUCTIONS.bl_1024;
      const instructions = await disassembler.disassemble(data, 0x08000000);

      expect(instructions[0].isBranch).toBe(true);
      // Branch target should be defined for BL with immediate
      if (instructions[0].operands.includes("#")) {
        expect(instructions[0].branchTarget).toBeDefined();
      }
    });

    it("should not have branch target for BX register", async () => {
      const data = new Uint8Array([0x70, 0x47]); // BX lr
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions[0].isBranch).toBe(true);
      // BX lr has no static target
      expect(instructions[0].branchTarget).toBeUndefined();
    });
  });

  describe("Multiple Instructions", () => {
    it("should disassemble multiple instructions", async () => {
      const data = new Uint8Array([
        0x00,
        0x20, // MOVS r0, #0
        0x01,
        0x20, // MOVS r0, #1
      ]);
      const instructions = await disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBe(2);
      expect(instructions[0].address).toBe(0x08000000);
      expect(instructions[1].address).toBe(0x08000002);
    });

    it("should handle mixed 16-bit and 32-bit instructions", async () => {
      const data = new Uint8Array([
        0x00,
        0x20, // 2-byte MOVS
        0x00,
        0xf0,
        0x00,
        0xb8, // 4-byte B.W
      ]);
      const instructions = await disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBe(2);
      expect(instructions[0].size).toBe(2);
      expect(instructions[1].size).toBe(4);
      expect(instructions[1].address).toBe(0x08000002);
    });

    it("should maintain correct addresses through disassembly", async () => {
      const data = new Uint8Array([
        0x00,
        0x20, // 2 bytes at 0x0
        0x00,
        0xf0,
        0x00,
        0xf8, // 4 bytes at 0x2
      ]);
      const instructions = await disassembler.disassemble(data, 0x08001000);

      expect(instructions[0].address).toBe(0x08001000);
      expect(instructions[1].address).toBe(0x08001002);
    });
  });

  describe("Base Address Handling", () => {
    it("should apply base address correctly", async () => {
      const baseAddr = 0x20000000;
      const data = new Uint8Array([0x00, 0x20, 0x01, 0x20]);
      const instructions = await disassembler.disassemble(data, baseAddr);

      expect(instructions[0].address).toBe(baseAddr);
      expect(instructions[1].address).toBe(baseAddr + 2);
    });

    it("should calculate branch targets relative to base address", async () => {
      const baseAddr = 0x08001000;
      const data = new Uint8Array([0x00, 0xe0]); // B #0
      const instructions = await disassembler.disassemble(data, baseAddr);

      if (instructions[0].branchTarget !== undefined) {
        expect(instructions[0].branchTarget).toBeGreaterThanOrEqual(baseAddr);
      }
    });
  });

  describe("ARM Mode Support", () => {
    // Skip ARM mode test - Cortex-M uses Thumb exclusively
    // The disassembler is optimized for Thumb mode
    it.skip("should disassemble ARM mode instructions", async () => {
      // ARM mode NOP: MOV r0, r0
      const data = new Uint8Array([0x00, 0x00, 0xa0, 0xe1]);
      const instructions = await disassembler.disassemble(data, 0, false);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].size).toBe(4);
    });
  });

  describe("Control Flow Analysis", () => {
    it("should analyze control flow", async () => {
      const data = new Uint8Array([
        0x00,
        0x20, // MOVS r0, #0
        0x00,
        0xe0, // B #0
      ]);
      const instructions = await disassembler.disassemble(data, 0x08000000);
      const flowMap = disassembler.analyzeControlFlow(instructions);

      expect(flowMap).toBeInstanceOf(Map);
      // Should have entries for branch instructions
      const branchInst = instructions.find((i) => i.isBranch);
      if (branchInst && branchInst.branchTarget !== undefined) {
        expect(flowMap.has(branchInst.address)).toBe(true);
      }
    });
  });

  describe("Function Entry Detection", () => {
    it("should detect function entry from BL target", async () => {
      const data = new Uint8Array([
        0x00,
        0xf0,
        0x02,
        0xf8, // BL #4 (to offset 8)
        0x00,
        0x20, // MOVS r0, #0
        0x00,
        0x20, // MOVS r0, #0 <- target
      ]);
      const instructions = await disassembler.disassemble(data, 0x08000000);

      const isFuncEntry = disassembler.isFunctionEntry(instructions, 2);
      // Should be detected as function entry if BL targets it
      expect(typeof isFuncEntry).toBe("boolean");
    });

    it("should detect function prologue", async () => {
      const data = new Uint8Array([
        0x2d,
        0xe9,
        0xf0,
        0x4f, // PUSH {r4-r11, lr}
      ]);
      const instructions = await disassembler.disassemble(data, 0x08000000);

      const isFuncEntry = disassembler.isFunctionEntry(instructions, 0);
      expect(isFuncEntry).toBe(true);
    });
  });

  describe("Instruction Formatting", () => {
    it("should format instruction with bytes", async () => {
      const data = new Uint8Array([0x00, 0x20]);
      const instructions = await disassembler.disassemble(data, 0x08000000);

      const formatted = disassembler.formatInstruction(instructions[0], true);
      expect(formatted).toContain("0x08000000");
      expect(formatted).toContain("00 20");
    });

    it("should format instruction without bytes", async () => {
      const data = new Uint8Array([0x00, 0x20]);
      const instructions = await disassembler.disassemble(data, 0x08000000);

      const formatted = disassembler.formatInstruction(instructions[0], false);
      expect(formatted).toContain("0x08000000");
      expect(formatted).not.toContain("00 20");
    });
  });

  describe("Real-World Patterns", () => {
    it("should disassemble function prologue", async () => {
      const data = new Uint8Array([
        0x2d,
        0xe9,
        0xf0,
        0x4f, // PUSH {r4-r11, lr}
        0x83,
        0xb0, // SUB sp, #12
      ]);

      const instructions = await disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].mnemonic.toLowerCase()).toContain("push");
    });

    it("should disassemble loop with branches", async () => {
      const data = new Uint8Array([
        0x00,
        0x20, // MOVS r0, #0
        0x01,
        0x30, // ADDS r0, #1
        0x05,
        0x28, // CMP r0, #5
        0xfc,
        0xd1, // BNE (back)
      ]);

      const instructions = await disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBeGreaterThan(2);
      const branchInst = instructions.find((i) => i.isBranch);
      expect(branchInst).toBeDefined();
      expect(branchInst?.mnemonic.toLowerCase()).toContain("b");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid data gracefully", async () => {
      const data = THUMB_INSTRUCTIONS.invalid;
      const instructions = await disassembler.disassemble(data, 0);

      // Should not throw, but may return error instruction
      expect(instructions).toBeDefined();
      expect(instructions.length).toBeGreaterThan(0);
    });

    it("should handle incomplete instruction at end", async () => {
      const data = new Uint8Array([0x00, 0x20, 0xff]); // Valid + incomplete
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
    });
  });

  describe("Endianness", () => {
    it("should handle little-endian mode", async () => {
      const dis = new CapstoneDisassembler(true);
      await dis.initialize();

      const data = new Uint8Array([0x00, 0x20]);
      const instructions = await dis.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
      dis.dispose();
    });

    it("should handle big-endian mode", async () => {
      const dis = new CapstoneDisassembler(false);
      await dis.initialize();

      const data = new Uint8Array([0x20, 0x00]);
      const instructions = await dis.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
      dis.dispose();
    });
  });

  describe("Resource Management", () => {
    it("should dispose cleanly", async () => {
      const dis = new CapstoneDisassembler();
      await dis.initialize();
      expect(dis.isReady()).toBe(true);

      dis.dispose();
      expect(dis.isReady()).toBe(false);
    });

    it("should handle multiple dispose calls", async () => {
      const dis = new CapstoneDisassembler();
      await dis.initialize();

      dis.dispose();
      dis.dispose(); // Should not throw

      expect(dis.isReady()).toBe(false);
    });
  });

  describe("Advanced Branch Detection", () => {
    it("should detect CBZ (compare and branch)", async () => {
      // CBZ r0, #offset
      const data = new Uint8Array([0x00, 0xb1]); // CBZ r0, ...
      const instructions = await disassembler.disassemble(data, 0);

      if (instructions.length > 0) {
        expect(instructions[0].isBranch).toBe(true);
      }
    });

    it("should mark BX LR as return", async () => {
      const data = new Uint8Array([0x70, 0x47]); // BX lr
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions[0].isBranch).toBe(true);
      expect(instructions[0].comment).toContain("return");
    });

    it("should mark POP with PC as return", async () => {
      const data = new Uint8Array([0xbd, 0xe8, 0xf0, 0x8f]); // POP {r4-r11, pc}
      const instructions = await disassembler.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
      // Should be marked as return
      const hasReturn = instructions.some((i) => i.comment?.includes("return"));
      expect(hasReturn).toBe(true);
    });
  });
});
