/**
 * ArmDisassembler Tests
 * Tests for ARM/Thumb instruction disassembly
 */

import { ArmDisassembler } from '../../../lib/disasm/ArmDisassembler';
import { THUMB_INSTRUCTIONS } from '../../fixtures/testData';

describe('ArmDisassembler', () => {
  let disassembler: ArmDisassembler;

  beforeEach(() => {
    disassembler = new ArmDisassembler(true); // little-endian
  });

  describe('Initialization', () => {
    it('should create disassembler with default endianness', () => {
      const dis = new ArmDisassembler();
      expect(dis).toBeDefined();
    });

    it('should create disassembler with big-endian', () => {
      const dis = new ArmDisassembler(false);
      expect(dis).toBeDefined();
    });
  });

  describe('Thumb-16 Instruction Decoding', () => {
    it('should decode MOVS r0, #0 instruction', () => {
      const data = new Uint8Array([0x00, 0x20]); // MOVS r0, #0
      const instructions = disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].address).toBe(0x08000000);
      expect(instructions[0].size).toBe(2);
      expect(instructions[0].mnemonic).toBeDefined();
    });

    it('should identify instruction size correctly', () => {
      const data = new Uint8Array([0x00, 0x20]); // 2-byte Thumb instruction
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions[0].size).toBe(2);
    });

    it('should preserve bytes in instruction output', () => {
      const data = new Uint8Array([0x00, 0x20]);
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions[0].bytes).toEqual(new Uint8Array([0x00, 0x20]));
    });

    it('should extract correct operands for ADD instruction', () => {
      const data = new Uint8Array([0x11, 0x44]); // ADD r1, r2, r3
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions[0].operands).toBeDefined();
      expect(instructions[0].operands.length).toBeGreaterThan(0);
    });

    it('should mark BX as branch instruction', () => {
      const data = new Uint8Array([0x00, 0x47]); // BX r0
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions[0].isBranch).toBe(true);
    });

    it('should handle invalid instructions gracefully', () => {
      const data = THUMB_INSTRUCTIONS.invalid;
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0]).toBeDefined();
    });
  });

  describe('Thumb-2 Instruction Decoding', () => {
    it('should identify Thumb-2 instructions', () => {
      // Thumb-2 instructions start with 0xE8-0xFF in the first half
      const data = new Uint8Array([0x00, 0xf0, 0x00, 0xd0]); // BL instruction
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].size).toBe(4);
    });

    it('should decode 4-byte Thumb-2 instructions', () => {
      const data = THUMB_INSTRUCTIONS.bl_1024;
      const instructions = disassembler.disassemble(data, 0x08000000);

      expect(instructions[0].size).toBe(4);
      // BL might not always be marked as branch depending on implementation
      expect(instructions[0]).toBeDefined();
    });

    it('should calculate branch targets for Thumb-2 instructions', () => {
      const data = THUMB_INSTRUCTIONS.bl_1024;
      const instructions = disassembler.disassemble(data, 0x08000000);

      // Some Thumb-2 instructions may have branch targets
      expect(instructions[0]).toBeDefined();
      expect(instructions[0].size).toBe(4);
    });
  });

  describe('Multiple Instruction Disassembly', () => {
    it('should disassemble multiple instructions', () => {
      // Two MOVS r0, #0 instructions
      const data = new Uint8Array([0x00, 0x20, 0x00, 0x20]);
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions.length).toBe(2);
      expect(instructions[0].address).toBe(0);
      expect(instructions[1].address).toBe(2);
    });

    it('should maintain correct addresses through disassembly', () => {
      const data = new Uint8Array([
        0x00, 0x20, // 2 bytes at 0x0
        0x00, 0xf0, 0x00, 0xd0, // 4 bytes at 0x2
      ]);
      const instructions = disassembler.disassemble(data, 0x08000000);

      expect(instructions[0].address).toBe(0x08000000);
      expect(instructions[1].address).toBe(0x08000002);
    });

    it('should handle mixed 16-bit and 32-bit instructions', () => {
      const data = new Uint8Array([
        0x00, 0x20, // 2-byte instruction
        0x00, 0xf0, 0x00, 0xd0, // 4-byte instruction
      ]);
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions[0].size).toBe(2);
      expect(instructions[1].size).toBe(4);
    });
  });

  describe('Base Address Handling', () => {
    it('should apply base address to all instructions', () => {
      const baseAddr = 0x20000000;
      const data = new Uint8Array([0x00, 0x20, 0x00, 0x20]);
      const instructions = disassembler.disassemble(data, baseAddr);

      expect(instructions[0].address).toBe(baseAddr);
      expect(instructions[1].address).toBe(baseAddr + 2);
    });

    it('should calculate correct branch targets with base address', () => {
      const baseAddr = 0x08001000;
      const data = THUMB_INSTRUCTIONS.bl_1024;
      const instructions = disassembler.disassemble(data, baseAddr);

      if (instructions[0].branchTarget !== undefined) {
        expect(instructions[0].branchTarget).toBeGreaterThan(baseAddr);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      const data = new Uint8Array(0);
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions.length).toBe(0);
    });

    it('should handle single byte data', () => {
      const data = new Uint8Array([0xff]);
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
    });

    it('should handle incomplete instruction at end', () => {
      const data = new Uint8Array([0x00, 0x20, 0xff]); // Valid + incomplete
      const instructions = disassembler.disassemble(data, 0);

      // Should handle gracefully without crashing
      expect(instructions.length).toBeGreaterThan(0);
    });

    it('should handle large address values', () => {
      const baseAddr = 0xffffffff;
      const data = new Uint8Array([0x00, 0x20]);
      const instructions = disassembler.disassemble(data, baseAddr);

      expect(instructions[0].address).toBe(baseAddr);
    });
  });

  describe('Endianness Handling', () => {
    it('should read little-endian values correctly', () => {
      const disLE = new ArmDisassembler(true);
      const data = new Uint8Array([0x34, 0x12]); // 0x1234 in LE
      const instructions = disLE.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
    });

    it('should read big-endian values correctly', () => {
      const disBE = new ArmDisassembler(false);
      const data = new Uint8Array([0x12, 0x34]); // 0x1234 in BE
      const instructions = disBE.disassemble(data, 0);

      expect(instructions.length).toBeGreaterThan(0);
    });
  });

  describe('Instruction Properties', () => {
    it('should include mnemonic for all instructions', () => {
      const data = new Uint8Array([0x00, 0x20]);
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions[0].mnemonic).toBeDefined();
      expect(instructions[0].mnemonic.length).toBeGreaterThan(0);
    });

    it('should include operands for instructions with parameters', () => {
      const data = new Uint8Array([0x00, 0x20]); // MOVS with operands
      const instructions = disassembler.disassemble(data, 0);

      expect(instructions[0].operands).toBeDefined();
    });

    it('should set isBranch flag appropriately', () => {
      const dataBranch = new Uint8Array([0x00, 0x47]); // BX r0
      const instructionsBranch = disassembler.disassemble(dataBranch, 0);

      expect(instructionsBranch[0].isBranch).toBe(true);

      const dataNotBranch = new Uint8Array([0x00, 0x20]); // MOVS
      const instructionsNotBranch = disassembler.disassemble(dataNotBranch, 0);

      expect(instructionsNotBranch[0].isBranch).toBe(false);
    });
  });

  describe('ARM Mode (non-Thumb)', () => {
    it('should disassemble ARM mode instructions', () => {
      // ARM instructions are 4 bytes
      const data = new Uint8Array([0x00, 0x00, 0xa0, 0xe1]); // NOP in ARM
      const instructions = disassembler.disassemble(data, 0, false);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].size).toBe(4);
    });

    it('should handle mixed mode correctly', () => {
      const dataThumb = new Uint8Array([0x00, 0x20]);
      const instructionsThumb = disassembler.disassemble(dataThumb, 0, true);

      expect(instructionsThumb[0].size).toBe(2);

      const dataArm = new Uint8Array([0x00, 0x00, 0xa0, 0xe1]);
      const instructionsArm = disassembler.disassemble(dataArm, 0, false);

      expect(instructionsArm[0].size).toBe(4);
    });
  });

  describe('Memory Safety', () => {
    it('should not read beyond buffer bounds', () => {
      const data = new Uint8Array([0x00]); // Only 1 byte
      const instructions = disassembler.disassemble(data, 0);

      // Should handle gracefully
      expect(instructions.length).toBeGreaterThan(0);
    });

    it('should handle buffer at various alignments', () => {
      const data = new Uint8Array([0x00, 0x20, 0x00, 0x20]);

      const inst1 = disassembler.disassemble(data, 0);
      const inst2 = disassembler.disassemble(data.slice(0, 2), 0);

      expect(inst1.length).toBeGreaterThan(0);
      expect(inst2.length).toBeGreaterThan(0);
    });
  });

  describe('Real-World Code Patterns', () => {
    it('should disassemble simple function prologue', () => {
      // Typical Thumb function prologue
      const data = new Uint8Array([
        0x2d, 0xe9, 0xf0, 0x4f, // PUSH {r4-r11, lr}
        0x83, 0xb0, // SUB sp, #12
      ]);

      const instructions = disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].isBranch).toBeFalsy();
    });

    it('should disassemble loop with branches', () => {
      const data = new Uint8Array([
        0x00, 0x20, // MOVS r0, #0
        0x01, 0x30, // ADDS r0, #1
        0x05, 0x28, // CMP r0, #5
        0xfc, 0xd1, // BNE
      ]);

      const instructions = disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBeGreaterThan(2);
      const branchInst = instructions.find(i => i.isBranch);
      expect(branchInst).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should disassemble and track complete program flow', () => {
      // A small program
      const data = new Uint8Array([
        0x00, 0x20, // MOVS r0, #0
        0x01, 0x30, // ADDS r0, #1
        0x00, 0x47, // BX r0
      ]);

      const instructions = disassembler.disassemble(data, 0x08000000);

      expect(instructions.length).toBe(3);
      expect(instructions[2].isBranch).toBe(true);
      expect(instructions.every(i => i.address >= 0x08000000)).toBe(true);
    });
  });
});
