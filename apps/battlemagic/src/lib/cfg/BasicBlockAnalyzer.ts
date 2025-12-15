/**
 * Basic Block Analyzer
 *
 * Identifies basic blocks from disassembled instructions.
 * A basic block is a straight-line code sequence with:
 * - One entry point (start)
 * - One exit point (end)
 * - No branches in the middle
 */

import type { DisassembledInstruction } from "../disasm/ArmDisassembler";
import { BlockType, EdgeType } from "./types";
import type { BasicBlock, BlockAnalysisOptions, CFGEdge } from "./types";

export class BasicBlockAnalyzer {
  private options: BlockAnalysisOptions;

  constructor(options: BlockAnalysisOptions) {
    this.options = options;
  }

  /**
   * Identify basic blocks from disassembled instructions
   *
   * Algorithm:
   * 1. Find all block start addresses:
   *    - First instruction
   *    - Branch targets
   *    - Instructions after branches
   * 2. Split instructions into blocks at start addresses
   * 3. Classify each block by its terminating instruction
   * 4. Build edge connections between blocks
   */
  identifyBasicBlocks(instructions: DisassembledInstruction[]): BasicBlock[] {
    if (instructions.length === 0) {
      return [];
    }

    // Step 1: Identify block boundaries
    const blockStarts = this.findBlockStarts(instructions);

    // Step 2: Build basic blocks
    const blocks = this.buildBlocks(instructions, blockStarts);

    // Step 3: Classify blocks and build edges
    this.classifyBlocks(blocks, instructions);

    // Step 4: Connect blocks with edges
    this.buildEdges(blocks);

    return blocks;
  }

  /**
   * Find all addresses that start a basic block
   */
  private findBlockStarts(
    instructions: DisassembledInstruction[],
  ): Set<number> {
    const starts = new Set<number>();

    // First instruction always starts a block
    starts.add(instructions[0].address);

    for (const inst of instructions) {
      // Branch target starts a new block
      if (inst.isBranch && inst.branchTarget !== undefined) {
        starts.add(inst.branchTarget);
      }

      // Instruction after branch starts a new block (fall-through)
      if (inst.isBranch) {
        const nextAddr = inst.address + inst.size;
        starts.add(nextAddr);
      }

      // Instruction after call may start new block (if call returns)
      if (this.isCallInstruction(inst)) {
        const nextAddr = inst.address + inst.size;
        starts.add(nextAddr);
      }
    }

    return starts;
  }

  /**
   * Build basic blocks by splitting at block start addresses
   */
  private buildBlocks(
    instructions: DisassembledInstruction[],
    blockStarts: Set<number>,
  ): BasicBlock[] {
    const blocks: BasicBlock[] = [];
    let currentBlock: DisassembledInstruction[] = [];
    let blockStartAddr = instructions[0].address;

    for (let i = 0; i < instructions.length; i++) {
      const inst = instructions[i];

      // Check if this address starts a new block (and we have a current block)
      if (blockStarts.has(inst.address) && currentBlock.length > 0) {
        // Finalize current block
        blocks.push(this.createBlock(currentBlock, blockStartAddr));

        // Start new block
        currentBlock = [inst];
        blockStartAddr = inst.address;
      } else {
        // Add to current block
        currentBlock.push(inst);
      }
    }

    // Don't forget last block
    if (currentBlock.length > 0) {
      blocks.push(this.createBlock(currentBlock, blockStartAddr));
    }

    return blocks;
  }

  /**
   * Create a basic block from instructions
   */
  private createBlock(
    instructions: DisassembledInstruction[],
    startAddr: number,
  ): BasicBlock {
    const lastInst = instructions[instructions.length - 1];

    return {
      id: `0x${startAddr.toString(16).toUpperCase().padStart(8, "0")}`,
      startAddress: startAddr,
      endAddress: lastInst.address,
      instructions,
      type: BlockType.NORMAL, // Will be classified later
      predecessors: [],
      successors: [],
      edges: [],
    };
  }

  /**
   * Classify blocks based on their terminating instructions
   */
  private classifyBlocks(
    blocks: BasicBlock[],
    allInstructions: DisassembledInstruction[],
  ): void {
    // Mark entry block
    if (blocks.length > 0) {
      blocks[0].type = BlockType.ENTRY;
    }

    for (const block of blocks) {
      if (block.type === BlockType.ENTRY && blocks.length === 1) {
        // Single block - keep as entry
        continue;
      }

      const lastInst = block.instructions[block.instructions.length - 1];
      const blockType = this.classifyBlockType(lastInst);

      // Don't override ENTRY type unless it's also a return
      if (block.type !== BlockType.ENTRY || blockType === BlockType.RETURN) {
        block.type = blockType;
      }
    }
  }

  /**
   * Classify block type based on terminating instruction
   */
  private classifyBlockType(inst: DisassembledInstruction): BlockType {
    const mnemonic = inst.mnemonic.toLowerCase();

    // Return instructions
    if (mnemonic === "bx" && inst.operands.toLowerCase().includes("lr")) {
      return BlockType.RETURN;
    }
    if (mnemonic === "pop" && inst.operands.toLowerCase().includes("pc")) {
      return BlockType.RETURN;
    }

    // Call instructions
    if (mnemonic === "bl" || mnemonic === "blx") {
      return BlockType.CALL;
    }

    // Conditional branches
    if (inst.isBranch && mnemonic !== "b" && mnemonic.startsWith("b")) {
      return BlockType.CONDITIONAL;
    }

    // Unconditional branch with no target = dead end
    if (mnemonic === "b" && inst.branchTarget === undefined) {
      return BlockType.EXIT;
    }

    return BlockType.NORMAL;
  }

  /**
   * Build edges between blocks based on control flow
   */
  private buildEdges(blocks: BasicBlock[]): void {
    // Create address-to-block mapping for fast lookup
    const addrToBlock = new Map<number, BasicBlock>();
    for (const block of blocks) {
      addrToBlock.set(block.startAddress, block);
    }

    for (const block of blocks) {
      const lastInst = block.instructions[block.instructions.length - 1];

      // Handle branch instructions
      if (lastInst.isBranch && lastInst.branchTarget !== undefined) {
        const targetBlock = addrToBlock.get(lastInst.branchTarget);

        if (targetBlock) {
          const edgeType = this.determineEdgeType(lastInst, true);
          this.addEdge(block, targetBlock, edgeType, lastInst);
        }
      }

      // Handle fall-through (non-unconditional branches and normal flow)
      if (!this.isUnconditionalExit(lastInst)) {
        const nextAddr = lastInst.address + lastInst.size;
        const nextBlock = addrToBlock.get(nextAddr);

        if (nextBlock) {
          const edgeType = this.determineEdgeType(lastInst, false);
          this.addEdge(block, nextBlock, edgeType, lastInst);
        }
      }
    }
  }

  /**
   * Determine edge type based on instruction
   */
  private determineEdgeType(
    inst: DisassembledInstruction,
    isBranchTarget: boolean,
  ): EdgeType {
    const mnemonic = inst.mnemonic.toLowerCase();

    // Call edge
    if (mnemonic === "bl" || mnemonic === "blx") {
      return EdgeType.CALL;
    }

    // Conditional branch
    if (inst.isBranch && mnemonic.startsWith("b") && mnemonic !== "b") {
      return isBranchTarget
        ? EdgeType.CONDITIONAL_TRUE
        : EdgeType.CONDITIONAL_FALSE;
    }

    // Unconditional
    return EdgeType.UNCONDITIONAL;
  }

  /**
   * Add edge between blocks
   */
  private addEdge(
    from: BasicBlock,
    to: BasicBlock,
    type: EdgeType,
    inst: DisassembledInstruction,
  ): void {
    // Don't add duplicate edges
    if (from.successors.includes(to.id)) {
      return;
    }

    const edge: CFGEdge = {
      target: to.id,
      type,
      condition: this.extractCondition(inst, type),
    };

    from.edges.push(edge);
    from.successors.push(to.id);
    to.predecessors.push(from.id);
  }

  /**
   * Extract condition string from conditional branch
   */
  private extractCondition(
    inst: DisassembledInstruction,
    edgeType: EdgeType,
  ): string | undefined {
    if (
      edgeType !== EdgeType.CONDITIONAL_TRUE &&
      edgeType !== EdgeType.CONDITIONAL_FALSE
    ) {
      return undefined;
    }

    const mnemonic = inst.mnemonic.toLowerCase();

    // ARM condition codes
    const conditionMap: Record<string, string> = {
      beq: "Z==1",
      bne: "Z==0",
      bcs: "C==1",
      bcc: "C==0",
      bmi: "N==1",
      bpl: "N==0",
      bvs: "V==1",
      bvc: "V==0",
      bhi: "C==1 && Z==0",
      bls: "C==0 || Z==1",
      bge: "N==V",
      blt: "N!=V",
      bgt: "Z==0 && N==V",
      ble: "Z==1 || N!=V",
    };

    const condition = conditionMap[mnemonic];

    if (edgeType === EdgeType.CONDITIONAL_FALSE && condition) {
      return `!(${condition})`;
    }

    return condition;
  }

  /**
   * Check if instruction is a call
   */
  private isCallInstruction(inst: DisassembledInstruction): boolean {
    const mnemonic = inst.mnemonic.toLowerCase();
    return mnemonic === "bl" || mnemonic === "blx";
  }

  /**
   * Check if instruction is an unconditional exit (no fall-through)
   */
  private isUnconditionalExit(inst: DisassembledInstruction): boolean {
    const mnemonic = inst.mnemonic.toLowerCase();

    // Unconditional branch
    if (mnemonic === "b" && inst.branchTarget !== undefined) {
      return true;
    }

    // Return instructions
    if (mnemonic === "bx" && inst.operands.toLowerCase().includes("lr")) {
      return true;
    }
    if (mnemonic === "pop" && inst.operands.toLowerCase().includes("pc")) {
      return true;
    }

    return false;
  }
}
