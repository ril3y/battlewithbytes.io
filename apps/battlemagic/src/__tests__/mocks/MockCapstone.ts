/**
 * Mock Capstone for Jest Testing
 *
 * Provides a mock implementation of Capstone.js for unit testing.
 * Since Capstone.js uses WebAssembly, it cannot run in Jest's Node environment.
 * This mock provides basic disassembly for common test cases.
 */

/**
 * Mock Capstone instruction
 */
export interface MockCapstoneInstruction {
  address: number;
  size: number;
  mnemonic: string;
  op_str: string;
  bytes: number[];
}

/**
 * Mock Capstone class
 */
export class MockCapstone {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_arch: number, _mode: number) {
    // Mock constructor - arch/mode are accepted but unused
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  detail(_enable: boolean): void {
    // Mock method
  }

  disasm(data: Uint8Array, baseAddress: number): MockCapstoneInstruction[] {
    const instructions: MockCapstoneInstruction[] = [];
    let offset = 0;

    while (offset < data.length) {
      const inst = this.decodeInstruction(data, offset, baseAddress + offset);
      if (!inst) break;
      instructions.push(inst);
      offset += inst.size;
    }

    return instructions;
  }

  close(): void {
    // Mock cleanup
  }

  private decodeInstruction(
    data: Uint8Array,
    offset: number,
    address: number,
  ): MockCapstoneInstruction | null {
    if (offset >= data.length) return null;

    const byte0 = data[offset];
    const byte1 = offset + 1 < data.length ? data[offset + 1] : 0;
    const halfword = byte0 | (byte1 << 8);

    // Detect Thumb-2 (32-bit instruction)
    const isThumb2 = (halfword & 0xf800) >= 0xe800;

    if (isThumb2 && offset + 3 < data.length) {
      return this.decodeThumb32(data, offset, address);
    } else {
      return this.decodeThumb16(data, offset, address);
    }
  }

  private decodeThumb16(
    data: Uint8Array,
    offset: number,
    address: number,
  ): MockCapstoneInstruction {
    const byte0 = data[offset];
    const byte1 = offset + 1 < data.length ? data[offset + 1] : 0;
    const inst = byte0 | (byte1 << 8);

    // Simple decoding for common instructions
    let mnemonic = "unknown";
    let op_str = "";

    if ((inst & 0xf800) === 0x2000) {
      // MOVS r0-r7, #imm8
      const rd = (inst >> 8) & 0x7;
      const imm = inst & 0xff;
      mnemonic = "movs";
      op_str = `r${rd}, #${imm}`;
    } else if ((inst & 0xff00) === 0x4700) {
      // BX
      const rm = (inst >> 3) & 0xf;
      mnemonic = "bx";
      op_str = rm === 14 ? "lr" : rm === 15 ? "pc" : `r${rm}`;
    } else if ((inst & 0xf000) === 0xd000) {
      // Conditional branch
      const cond = (inst >> 8) & 0xf;
      const offset = (inst & 0xff) << 1;
      const target = address + 4 + (offset > 255 ? offset - 512 : offset);
      mnemonic = `b${["eq", "ne", "cs", "cc", "mi", "pl", "vs", "vc", "hi", "ls", "ge", "lt", "gt", "le", "", "nv"][cond]}`;
      op_str = `#0x${target.toString(16)}`;
    } else if ((inst & 0xf800) === 0xe000) {
      // Unconditional branch
      const offset = (inst & 0x7ff) << 1;
      const signExtended = offset & 0x800 ? offset | 0xfffff000 : offset;
      const target = address + 4 + signExtended;
      mnemonic = "b";
      op_str = `#0x${target.toString(16)}`;
    } else if ((inst & 0xf800) === 0x4800) {
      // LDR literal
      const rt = (inst >> 8) & 0x7;
      const imm = (inst & 0xff) << 2;
      mnemonic = "ldr";
      op_str = `r${rt}, [pc, #${imm}]`;
    } else if ((inst & 0xff00) === 0xb100) {
      // CBZ
      const rn = inst & 0x7;
      const offset = ((inst >> 3) & 0x1f) << 1;
      const target = address + 4 + offset;
      mnemonic = "cbz";
      op_str = `r${rn}, #0x${target.toString(16)}`;
    }

    return {
      address,
      size: 2,
      mnemonic,
      op_str,
      bytes: [byte0, byte1],
    };
  }

  private decodeThumb32(
    data: Uint8Array,
    offset: number,
    address: number,
  ): MockCapstoneInstruction {
    const bytes = [
      data[offset],
      data[offset + 1],
      data[offset + 2],
      data[offset + 3],
    ];

    const halfword1 = bytes[0] | (bytes[1] << 8);
    const halfword2 = bytes[2] | (bytes[3] << 8);

    let mnemonic = "unknown";
    let op_str = "";

    // BL instruction
    if ((halfword1 & 0xf800) === 0xf000 && (halfword2 & 0xd000) === 0xd000) {
      const s = (halfword1 >> 10) & 1;
      const j1 = (halfword2 >> 13) & 1;
      const j2 = (halfword2 >> 11) & 1;
      const i1 = j1 ^ s ^ 1;
      const i2 = j2 ^ s ^ 1;
      const imm10 = halfword1 & 0x3ff;
      const imm11 = halfword2 & 0x7ff;

      let offset =
        (s ? -1 << 24 : 0) |
        (i1 << 23) |
        (i2 << 22) |
        (imm10 << 12) |
        (imm11 << 1);
      if (s) offset |= 0xff000000;

      const target = address + 4 + offset;
      mnemonic = "bl";
      op_str = `#0x${target.toString(16)}`;
    }
    // B.W instruction
    else if (
      (halfword1 & 0xf800) === 0xf000 &&
      (halfword2 & 0xd000) === 0x9000
    ) {
      const s = (halfword1 >> 10) & 1;
      const j1 = (halfword2 >> 13) & 1;
      const j2 = (halfword2 >> 11) & 1;
      const imm10 = halfword1 & 0x3ff;
      const imm11 = halfword2 & 0x7ff;

      const offset =
        (s ? -1 << 20 : 0) |
        (j2 << 19) |
        (j1 << 18) |
        (imm10 << 12) |
        (imm11 << 1);
      const target = address + 4 + offset;
      mnemonic = "b.w";
      op_str = `#0x${target.toString(16)}`;
    }
    // PUSH (32-bit form)
    else if (
      (halfword1 & 0xfff0) === 0xe920 &&
      (halfword2 & 0x8000) === 0x0000
    ) {
      mnemonic = "push";
      const reglist = halfword2;
      const regs = this.formatRegList(reglist);
      op_str = `{${regs}}`;
    }
    // POP (32-bit form)
    else if (
      (halfword1 & 0xfff0) === 0xe8b0 &&
      (halfword2 & 0x0000) === 0x0000
    ) {
      mnemonic = "pop";
      const reglist = halfword2;
      const regs = this.formatRegList(reglist);
      op_str = `{${regs}}`;
    }

    return {
      address,
      size: 4,
      mnemonic,
      op_str,
      bytes,
    };
  }

  private formatRegList(bitmap: number): string {
    const regs: string[] = [];
    for (let i = 0; i < 16; i++) {
      if (bitmap & (1 << i)) {
        regs.push(
          i === 13 ? "sp" : i === 14 ? "lr" : i === 15 ? "pc" : `r${i}`,
        );
      }
    }
    return regs.join(", ");
  }
}

/**
 * Mock Capstone API
 */
export const MockCapstoneAPI = {
  ARCH_ARM: 0,
  MODE_THUMB: 16,
  MODE_MCLASS: 32,
  MODE_BIG_ENDIAN: 0x80000000,
  MODE_ARM: 0,

  Capstone: MockCapstone,
};

/**
 * Mock module export
 *
 * The real @alexaltea/capstone-js dist bundle's default export (MCapstone) is a
 * promise that resolves to the Capstone API object once WASM is initialized.
 * CapstoneDisassembler does `const cs = await MCapstone` and expects
 * `cs.Capstone`, `cs.ARCH_ARM`, `cs.MODE_THUMB`, etc. - so the default export
 * here must be an awaitable resolving to the API object, not a factory.
 */
const MCapstone: Promise<typeof MockCapstoneAPI> =
  Promise.resolve(MockCapstoneAPI);

export default MCapstone;
