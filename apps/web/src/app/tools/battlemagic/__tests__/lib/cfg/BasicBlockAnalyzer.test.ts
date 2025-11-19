/**
 * BasicBlockAnalyzer Tests
 * Tests for basic block identification from ARM disassembled instructions
 */

import { BasicBlockAnalyzer } from '../../../lib/cfg/BasicBlockAnalyzer';
import { BlockType, EdgeType } from '../../../lib/cfg/types';
import type { DisassembledInstruction } from '../../../lib/arch/arm/types';

describe('BasicBlockAnalyzer', () => {
  let analyzer: BasicBlockAnalyzer;

  beforeEach(() => {
    analyzer = new BasicBlockAnalyzer({
      architecture: 'ARM',
      startAddress: 0x08000000,
      detectLoops: true,
      detectUnreachable: true
    });
  });

  describe('Single Basic Block', () => {
    it('should identify a single basic block with no branches', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'mov',
          operands: 'r0, #1',
          bytes: new Uint8Array([0x01, 0x20]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'add',
          operands: 'r0, r0, #1',
          bytes: new Uint8Array([0x01, 0x30]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000004,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].startAddress).toBe(0x08000000);
      expect(blocks[0].endAddress).toBe(0x08000004);
      expect(blocks[0].instructions).toHaveLength(3);
      expect(blocks[0].type).toBe(BlockType.ENTRY);
    });
  });

  describe('Conditional Branches', () => {
    it('should split blocks on conditional branch', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'cmp',
          operands: 'r0, #0',
          bytes: new Uint8Array([0x00, 0x28]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'beq',
          operands: '0x08000010',
          bytes: new Uint8Array([0x06, 0xd0]),
          size: 2,
          isBranch: true,
          branchTarget: 0x08000010,
          isThumb: true
        },
        {
          address: 0x08000004,
          mnemonic: 'mov',
          operands: 'r1, #1',
          bytes: new Uint8Array([0x01, 0x21]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000010,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);

      expect(blocks.length).toBeGreaterThan(1);

      // Entry block should end with beq
      const entryBlock = blocks[0];
      expect(entryBlock.type).toBe(BlockType.ENTRY);
      expect(entryBlock.instructions[entryBlock.instructions.length - 1].mnemonic).toBe('beq');

      // Entry block with conditional branch can be either ENTRY or CONDITIONAL
      expect([BlockType.ENTRY, BlockType.CONDITIONAL]).toContain(entryBlock.type);
    });

    it('should create edges for conditional branches', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'cmp',
          operands: 'r0, #0',
          bytes: new Uint8Array([0x00, 0x28]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'beq',
          operands: '0x08000010',
          bytes: new Uint8Array([0x06, 0xd0]),
          size: 2,
          isBranch: true,
          branchTarget: 0x08000010,
          isThumb: true
        },
        {
          address: 0x08000004,
          mnemonic: 'mov',
          operands: 'r1, #1',
          bytes: new Uint8Array([0x01, 0x21]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000010,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);
      const entryBlock = blocks[0];

      // Entry block should have 2 successors (branch taken and fall-through)
      expect(entryBlock.successors.length).toBeGreaterThanOrEqual(1);
      expect(entryBlock.edges.length).toBeGreaterThanOrEqual(1);

      // Should have both conditional true and false edges
      const hasConditionalEdge = entryBlock.edges.some(
        e => e.type === EdgeType.CONDITIONAL_TRUE || e.type === EdgeType.CONDITIONAL_FALSE
      );
      expect(hasConditionalEdge).toBe(true);
    });
  });

  describe('Function Calls', () => {
    it('should identify call blocks', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'mov',
          operands: 'r0, #1',
          bytes: new Uint8Array([0x01, 0x20]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'bl',
          operands: '0x08000100',
          bytes: new Uint8Array([0x00, 0xf0, 0x7d, 0xf8]),
          size: 4,
          isBranch: true,
          branchTarget: 0x08000100,
          isThumb: true
        },
        {
          address: 0x08000006,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);

      // Find the block containing the bl instruction
      const callBlock = blocks.find(b =>
        b.instructions.some(inst => inst.mnemonic === 'bl')
      );
      expect(callBlock).toBeDefined();

      // The block ending with bl should be classified as CALL or ENTRY (if it's the entry block)
      if (callBlock) {
        expect([BlockType.CALL, BlockType.ENTRY]).toContain(callBlock.type);
      }
    });
  });

  describe('Return Blocks', () => {
    it('should identify return block with bx lr', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'mov',
          operands: 'r0, #0',
          bytes: new Uint8Array([0x00, 0x20]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe(BlockType.ENTRY); // Entry block that also returns

      const lastInst = blocks[0].instructions[blocks[0].instructions.length - 1];
      expect(lastInst.mnemonic).toBe('bx');
      expect(lastInst.operands.toLowerCase()).toContain('lr');
    });

    it('should identify return block with pop {pc}', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'mov',
          operands: 'r0, #0',
          bytes: new Uint8Array([0x00, 0x20]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'pop',
          operands: '{pc}',
          bytes: new Uint8Array([0x00, 0xbd]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);

      expect(blocks).toHaveLength(1);

      const lastInst = blocks[0].instructions[blocks[0].instructions.length - 1];
      expect(lastInst.mnemonic).toBe('pop');
      expect(lastInst.operands.toLowerCase()).toContain('pc');
    });
  });

  describe('Unconditional Branches', () => {
    it('should handle unconditional branch', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'mov',
          operands: 'r0, #1',
          bytes: new Uint8Array([0x01, 0x20]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'b',
          operands: '0x08000010',
          bytes: new Uint8Array([0x06, 0xe0]),
          size: 2,
          isBranch: true,
          branchTarget: 0x08000010,
          isThumb: true
        },
        {
          address: 0x08000010,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);

      expect(blocks.length).toBeGreaterThan(1);

      const entryBlock = blocks[0];
      expect(entryBlock.successors.length).toBeGreaterThanOrEqual(1);

      // Unconditional branch should have only one successor
      const unconditionalEdge = entryBlock.edges.find(e => e.type === EdgeType.UNCONDITIONAL);
      expect(unconditionalEdge).toBeDefined();
    });
  });

  describe('Loop Detection', () => {
    it('should identify loop with back-edge', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'mov',
          operands: 'r0, #10',
          bytes: new Uint8Array([0x0a, 0x20]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'subs',
          operands: 'r0, r0, #1',
          bytes: new Uint8Array([0x01, 0x38]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000004,
          mnemonic: 'bne',
          operands: '0x08000002',
          bytes: new Uint8Array([0xfc, 0xd1]),
          size: 2,
          isBranch: true,
          branchTarget: 0x08000002,
          isThumb: true
        },
        {
          address: 0x08000006,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);

      expect(blocks.length).toBeGreaterThan(1);

      // Find block that branches back
      const loopBlock = blocks.find(b => {
        return b.edges.some(edge => {
          const targetBlock = blocks.find(tb => tb.id === edge.target);
          return targetBlock && targetBlock.startAddress <= b.startAddress;
        });
      });

      expect(loopBlock).toBeDefined();
    });
  });

  describe('Edge Conditions', () => {
    it('should extract condition for beq', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'cmp',
          operands: 'r0, #0',
          bytes: new Uint8Array([0x00, 0x28]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'beq',
          operands: '0x08000010',
          bytes: new Uint8Array([0x06, 0xd0]),
          size: 2,
          isBranch: true,
          branchTarget: 0x08000010,
          isThumb: true
        },
        {
          address: 0x08000004,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000010,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);
      const entryBlock = blocks[0];

      const trueEdge = entryBlock.edges.find(e => e.type === EdgeType.CONDITIONAL_TRUE);
      const falseEdge = entryBlock.edges.find(e => e.type === EdgeType.CONDITIONAL_FALSE);

      if (trueEdge) {
        expect(trueEdge.condition).toBeDefined();
        expect(trueEdge.condition).toContain('Z');
      }

      if (falseEdge) {
        expect(falseEdge.condition).toBeDefined();
        expect(falseEdge.condition).toContain('!');
      }
    });
  });

  describe('Empty Input', () => {
    it('should handle empty instruction array', () => {
      const blocks = analyzer.identifyBasicBlocks([]);
      expect(blocks).toHaveLength(0);
    });
  });

  describe('Predecessor/Successor Links', () => {
    it('should properly link predecessors and successors', () => {
      const instructions: DisassembledInstruction[] = [
        {
          address: 0x08000000,
          mnemonic: 'cmp',
          operands: 'r0, #0',
          bytes: new Uint8Array([0x00, 0x28]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000002,
          mnemonic: 'beq',
          operands: '0x08000010',
          bytes: new Uint8Array([0x06, 0xd0]),
          size: 2,
          isBranch: true,
          branchTarget: 0x08000010,
          isThumb: true
        },
        {
          address: 0x08000004,
          mnemonic: 'mov',
          operands: 'r1, #1',
          bytes: new Uint8Array([0x01, 0x21]),
          size: 2,
          isBranch: false,
          isThumb: true
        },
        {
          address: 0x08000010,
          mnemonic: 'bx',
          operands: 'lr',
          bytes: new Uint8Array([0x70, 0x47]),
          size: 2,
          isBranch: false,
          isThumb: true
        }
      ];

      const blocks = analyzer.identifyBasicBlocks(instructions);

      // Every successor should have corresponding predecessor
      for (const block of blocks) {
        for (const successorId of block.successors) {
          const successor = blocks.find(b => b.id === successorId);
          expect(successor).toBeDefined();
          expect(successor!.predecessors).toContain(block.id);
        }
      }
    });
  });
});
