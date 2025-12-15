/**
 * Capstone ARM Disassembler - High-Level JavaScript API
 * Built from Capstone Engine 5.x
 */

// Architecture Constants
const CS_ARCH = {
    ARM: 0,
    ARM64: 1,
    MIPS: 2,
    X86: 3,
    PPC: 4,
    SPARC: 5,
    SYSZ: 6,
    XCORE: 7,
    M68K: 8,
    TMS320C64X: 9,
    M680X: 10,
    EVM: 11,
    MOS65XX: 12,
    WASM: 13,
    BPF: 14,
    RISCV: 15,
    SH: 16,
    TRICORE: 17
};

// ARM Mode Constants
const CS_MODE = {
    LITTLE_ENDIAN: 0,
    ARM: 0,
    THUMB: 1 << 4,
    MCLASS: 1 << 5,      // ARM Cortex-M
    V8: 1 << 6,          // ARMv8
    BIG_ENDIAN: 1 << 31
};

// Option types
const CS_OPT = {
    SYNTAX: 1,
    DETAIL: 2,
    MODE: 3,
    MEM: 4,
    SKIPDATA: 5,
    SKIPDATA_SETUP: 6,
    MNEMONIC: 7,
    UNSIGNED: 8,
    NO_BRANCH_OFFSET: 9
};

// Option values
const CS_OPT_VALUE = {
    OFF: 0,
    ON: 3,
    SYNTAX_DEFAULT: 0,
    SYNTAX_INTEL: 1,
    SYNTAX_ATT: 2,
    SYNTAX_NOREGNAME: 3,
    SYNTAX_MASM: 4,
    SYNTAX_MOTOROLA: 5
};

// Error codes
const CS_ERR = {
    OK: 0,
    MEM: 1,
    ARCH: 2,
    HANDLE: 3,
    CSH: 4,
    MODE: 5,
    OPTION: 6,
    DETAIL: 7,
    MEMSETUP: 8,
    VERSION: 9,
    DIET: 10,
    SKIPDATA: 11,
    X86_ATT: 12,
    X86_INTEL: 13,
    X86_MASM: 14
};

class CapstoneARM {
    constructor() {
        this.module = null;
        this.handle = 0;
        this._cs_open = null;
        this._cs_close = null;
        this._cs_option = null;
        this._cs_disasm = null;
        this._cs_free = null;
        this._cs_insn_address = null;
        this._cs_insn_size = null;
        this._cs_insn_mnemonic = null;
        this._cs_insn_op_str = null;
        this._cs_insn_bytes = null;
        this._cs_insn_id = null;
        this._cs_strerror = null;
    }

    async init() {
        if (typeof CapstoneModule === 'undefined') {
            throw new Error('CapstoneModule not loaded. Include capstone-arm.js first.');
        }

        this.module = await CapstoneModule();

        // Wrap C functions
        this._cs_open = this.module.cwrap('cs_open_js', 'number', ['number', 'number', 'number']);
        this._cs_close = this.module.cwrap('cs_close_js', 'number', ['number']);
        this._cs_option = this.module.cwrap('cs_option_js', 'number', ['number', 'number', 'number']);
        this._cs_disasm = this.module.cwrap('cs_disasm_js', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);
        this._cs_free = this.module.cwrap('cs_free_js', 'void', []);
        this._cs_insn_address = this.module.cwrap('cs_insn_address', 'number', ['number']);
        this._cs_insn_size = this.module.cwrap('cs_insn_size', 'number', ['number']);
        this._cs_insn_mnemonic = this.module.cwrap('cs_insn_mnemonic', 'string', ['number']);
        this._cs_insn_op_str = this.module.cwrap('cs_insn_op_str', 'string', ['number']);
        this._cs_insn_bytes = this.module.cwrap('cs_insn_bytes', 'number', ['number']);
        this._cs_insn_id = this.module.cwrap('cs_insn_id', 'number', ['number']);
        this._cs_strerror = this.module.cwrap('cs_strerror_js', 'string', ['number']);
        this._cs_insn_name = this.module.cwrap('cs_insn_name_js', 'string', ['number', 'number']);
        this._cs_reg_name = this.module.cwrap('cs_reg_name_js', 'string', ['number', 'number']);

        return this;
    }

    open(mode = CS_MODE.THUMB | CS_MODE.MCLASS) {
        const handlePtr = this.module._malloc(8);  // size_t
        const err = this._cs_open(CS_ARCH.ARM, mode, handlePtr);
        if (err !== CS_ERR.OK) {
            this.module._free(handlePtr);
            throw new Error(`cs_open failed: ${this._cs_strerror(err)}`);
        }
        this.handle = this.module.getValue(handlePtr, 'i64');
        this.module._free(handlePtr);
        return this;
    }

    close() {
        if (this.handle) {
            const handlePtr = this.module._malloc(8);
            this.module.setValue(handlePtr, this.handle, 'i64');
            this._cs_close(handlePtr);
            this.module._free(handlePtr);
            this.handle = 0;
        }
        this._cs_free();
    }

    setOption(type, value) {
        const err = this._cs_option(this.handle, type, value);
        if (err !== CS_ERR.OK) {
            throw new Error(`cs_option failed: ${this._cs_strerror(err)}`);
        }
        return this;
    }

    disasm(code, address = 0, count = 0) {
        const bytes = code instanceof Uint8Array ? code : new Uint8Array(code);
        const codePtr = this.module._malloc(bytes.length);
        this.module.HEAPU8.set(bytes, codePtr);

        const numInsns = this._cs_disasm(
            this.handle,
            codePtr,
            bytes.length,
            address,
            0,  // high 32 bits of address
            count
        );

        this.module._free(codePtr);

        const instructions = [];
        for (let i = 0; i < numInsns; i++) {
            const size = this._cs_insn_size(i);
            const bytesPtr = this._cs_insn_bytes(i);
            const insnBytes = new Uint8Array(size);
            for (let j = 0; j < size; j++) {
                insnBytes[j] = this.module.HEAPU8[bytesPtr + j];
            }

            instructions.push({
                address: this._cs_insn_address(i),
                size: size,
                mnemonic: this._cs_insn_mnemonic(i),
                opStr: this._cs_insn_op_str(i),
                bytes: insnBytes,
                id: this._cs_insn_id(i)
            });
        }

        return instructions;
    }

    // Convenience: disassemble and format as string
    disasmToString(code, address = 0) {
        const insns = this.disasm(code, address);
        return insns.map(i => {
            const hex = Array.from(i.bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
            return `0x${i.address.toString(16).padStart(8, '0')}: ${hex.padEnd(12)} ${i.mnemonic.padEnd(8)} ${i.opStr}`;
        }).join('\n');
    }

    // Get instruction name by ID
    insnName(id) {
        return this._cs_insn_name(this.handle, id);
    }

    // Get register name
    regName(reg) {
        return this._cs_reg_name(this.handle, reg);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CapstoneARM, CS_ARCH, CS_MODE, CS_OPT, CS_OPT_VALUE, CS_ERR };
}
if (typeof window !== 'undefined') {
    window.CapstoneARM = CapstoneARM;
    window.CS_ARCH = CS_ARCH;
    window.CS_MODE = CS_MODE;
    window.CS_OPT = CS_OPT;
    window.CS_OPT_VALUE = CS_OPT_VALUE;
    window.CS_ERR = CS_ERR;
}
