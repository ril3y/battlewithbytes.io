#!/bin/bash
#
# Build Capstone Disassembler as WebAssembly
# Modern ARM/Thumb disassembler for browser-based code analysis
#
# Run this on the buildbox: ssh builder@192.168.1.62
# Usage: ./build-capstone-wasm.sh
#
# Requirements:
#   - Emscripten SDK 3.1.50+
#   - CMake 3.15+
#   - ~500MB disk space
#
# Output: capstone-arm.wasm, capstone-arm.js
#

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_ROOT="${BUILD_ROOT:-$HOME/capstone-wasm-build}"

# Official Capstone repository
CAPSTONE_REPO="https://github.com/capstone-engine/capstone.git"
CAPSTONE_VERSION="${CAPSTONE_VERSION:-5.0.3}"
EMSDK_VERSION="${EMSDK_VERSION:-3.1.50}"
NUM_JOBS="${NUM_JOBS:-$(nproc)}"

# Directories
CAPSTONE_SRC="${BUILD_ROOT}/capstone"
WASM_BUILD="${BUILD_ROOT}/build-wasm"
EMSDK_DIR="${BUILD_ROOT}/emsdk"
OUTPUT_DIR="${BUILD_ROOT}/output"

# Output files
OUTPUT_WASM="capstone-arm.wasm"
OUTPUT_JS="capstone-arm.js"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# Helper Functions
# ============================================================================

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

log_step() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

# ============================================================================
# Setup
# ============================================================================

setup_directories() {
    log_step "Setting up directories"
    mkdir -p "${BUILD_ROOT}" "${OUTPUT_DIR}"
    log_info "Build root: ${BUILD_ROOT}"
}

setup_emscripten() {
    log_step "Setting up Emscripten SDK ${EMSDK_VERSION}"

    if [ -d "${EMSDK_DIR}" ] && [ -f "${EMSDK_DIR}/emsdk_env.sh" ]; then
        log_info "Emscripten SDK already installed"
    else
        log_info "Installing Emscripten SDK..."
        rm -rf "${EMSDK_DIR}"
        git clone https://github.com/emscripten-core/emsdk.git "${EMSDK_DIR}"
        cd "${EMSDK_DIR}"
        ./emsdk install ${EMSDK_VERSION}
        ./emsdk activate ${EMSDK_VERSION}
    fi

    source "${EMSDK_DIR}/emsdk_env.sh"
    log_info "Emscripten: $(emcc --version | head -n1)"
    log_success "Emscripten ready"
}

# ============================================================================
# Clone Capstone
# ============================================================================

clone_capstone() {
    log_step "Cloning Capstone (v${CAPSTONE_VERSION})"

    if [ -d "${CAPSTONE_SRC}" ]; then
        log_info "Updating existing source..."
        cd "${CAPSTONE_SRC}"
        git fetch --tags
        git checkout "tags/${CAPSTONE_VERSION}" 2>/dev/null || git checkout "${CAPSTONE_VERSION}"
    else
        log_info "Cloning Capstone repository..."
        git clone --depth 1 --branch "${CAPSTONE_VERSION}" "${CAPSTONE_REPO}" "${CAPSTONE_SRC}"
    fi

    log_success "Capstone source ready"
}

# ============================================================================
# Build WASM
# ============================================================================

build_wasm_library() {
    log_step "Building Capstone as static WASM library (ARM/Thumb only)"

    source "${EMSDK_DIR}/emsdk_env.sh"

    rm -rf "${WASM_BUILD}"
    mkdir -p "${WASM_BUILD}"
    cd "${WASM_BUILD}"

    log_info "Configuring with emcmake..."

    # Configure with emcmake for WASM target
    # Build only ARM architecture to minimize size
    emcmake cmake "${CAPSTONE_SRC}" \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=OFF \
        -DCAPSTONE_BUILD_STATIC=ON \
        -DCAPSTONE_BUILD_SHARED=OFF \
        -DCAPSTONE_BUILD_TESTS=OFF \
        -DCAPSTONE_BUILD_CSTOOL=OFF \
        -DCAPSTONE_ARM_SUPPORT=ON \
        -DCAPSTONE_ARM64_SUPPORT=OFF \
        -DCAPSTONE_M68K_SUPPORT=OFF \
        -DCAPSTONE_MIPS_SUPPORT=OFF \
        -DCAPSTONE_PPC_SUPPORT=OFF \
        -DCAPSTONE_SPARC_SUPPORT=OFF \
        -DCAPSTONE_SYSZ_SUPPORT=OFF \
        -DCAPSTONE_XCORE_SUPPORT=OFF \
        -DCAPSTONE_X86_SUPPORT=OFF \
        -DCAPSTONE_TMS320C64X_SUPPORT=OFF \
        -DCAPSTONE_M680X_SUPPORT=OFF \
        -DCAPSTONE_EVM_SUPPORT=OFF \
        -DCAPSTONE_WASM_SUPPORT=OFF \
        -DCAPSTONE_MOS65XX_SUPPORT=OFF \
        -DCAPSTONE_BPF_SUPPORT=OFF \
        -DCAPSTONE_RISCV_SUPPORT=OFF \
        -DCAPSTONE_SH_SUPPORT=OFF \
        -DCAPSTONE_TRICORE_SUPPORT=OFF \
        -DCAPSTONE_ALPHA_SUPPORT=OFF \
        -DCAPSTONE_HPPA_SUPPORT=OFF \
        -DCAPSTONE_LOONGARCH_SUPPORT=OFF \
        -DCAPSTONE_XTENSA_SUPPORT=OFF \
        -DCAPSTONE_ARC_SUPPORT=OFF \
        -DCMAKE_C_FLAGS="-O3 -DNDEBUG -fno-exceptions"

    log_info "Building with ${NUM_JOBS} jobs..."
    emmake make -j${NUM_JOBS}

    log_success "Capstone static library built"
}

# ============================================================================
# Create JavaScript Bindings
# ============================================================================

create_js_bindings() {
    log_step "Creating JavaScript/WASM bindings"

    cd "${WASM_BUILD}"

    # Find the built static library
    CAPSTONE_LIB=$(find . -name "libcapstone.a" | head -1)
    if [ -z "${CAPSTONE_LIB}" ]; then
        log_error "Could not find libcapstone.a"
    fi
    log_info "Found: ${CAPSTONE_LIB}"

    # Create a wrapper that exports the Capstone API
    cat > "${WASM_BUILD}/capstone_wrapper.c" << 'EOF'
#include <capstone/capstone.h>
#include <emscripten.h>
#include <stdlib.h>
#include <string.h>

// Store handles and instructions for JS access
static cs_insn *g_insn = NULL;
static size_t g_count = 0;

EMSCRIPTEN_KEEPALIVE
int cs_open_js(int arch, int mode, size_t *handle) {
    return cs_open(arch, mode, handle);
}

EMSCRIPTEN_KEEPALIVE
int cs_close_js(size_t *handle) {
    return cs_close(handle);
}

EMSCRIPTEN_KEEPALIVE
int cs_option_js(size_t handle, int type, size_t value) {
    return cs_option(handle, type, value);
}

EMSCRIPTEN_KEEPALIVE
size_t cs_disasm_js(size_t handle, const uint8_t *code, size_t code_size,
                    uint64_t address, size_t count) {
    // Free previous results
    if (g_insn) {
        cs_free(g_insn, g_count);
        g_insn = NULL;
        g_count = 0;
    }

    g_count = cs_disasm(handle, code, code_size, address, count, &g_insn);
    return g_count;
}

EMSCRIPTEN_KEEPALIVE
void cs_free_js(void) {
    if (g_insn) {
        cs_free(g_insn, g_count);
        g_insn = NULL;
        g_count = 0;
    }
}

// Accessors for instruction data
EMSCRIPTEN_KEEPALIVE
uint64_t cs_insn_address(size_t index) {
    if (index < g_count) return g_insn[index].address;
    return 0;
}

EMSCRIPTEN_KEEPALIVE
uint16_t cs_insn_size(size_t index) {
    if (index < g_count) return g_insn[index].size;
    return 0;
}

EMSCRIPTEN_KEEPALIVE
const char* cs_insn_mnemonic(size_t index) {
    if (index < g_count) return g_insn[index].mnemonic;
    return "";
}

EMSCRIPTEN_KEEPALIVE
const char* cs_insn_op_str(size_t index) {
    if (index < g_count) return g_insn[index].op_str;
    return "";
}

EMSCRIPTEN_KEEPALIVE
const uint8_t* cs_insn_bytes(size_t index) {
    if (index < g_count) return g_insn[index].bytes;
    return NULL;
}

EMSCRIPTEN_KEEPALIVE
unsigned int cs_insn_id(size_t index) {
    if (index < g_count) return g_insn[index].id;
    return 0;
}

EMSCRIPTEN_KEEPALIVE
const char* cs_strerror_js(int code) {
    return cs_strerror(code);
}

EMSCRIPTEN_KEEPALIVE
int cs_version_js(int *major, int *minor) {
    return cs_version(major, minor);
}

EMSCRIPTEN_KEEPALIVE
const char* cs_insn_name_js(size_t handle, unsigned int id) {
    return cs_insn_name(handle, id);
}

EMSCRIPTEN_KEEPALIVE
const char* cs_reg_name_js(size_t handle, unsigned int reg) {
    return cs_reg_name(handle, reg);
}
EOF

    log_info "Compiling WASM module with JavaScript bindings..."

    # Compile the wrapper with the static library
    emcc -O3 \
        -I"${CAPSTONE_SRC}/include" \
        "${WASM_BUILD}/capstone_wrapper.c" \
        "${CAPSTONE_LIB}" \
        -s WASM=1 \
        -s MODULARIZE=1 \
        -s EXPORT_NAME="CapstoneModule" \
        -s EXPORTED_FUNCTIONS="['_malloc','_free','_cs_open_js','_cs_close_js','_cs_option_js','_cs_disasm_js','_cs_free_js','_cs_insn_address','_cs_insn_size','_cs_insn_mnemonic','_cs_insn_op_str','_cs_insn_bytes','_cs_insn_id','_cs_strerror_js','_cs_version_js','_cs_insn_name_js','_cs_reg_name_js']" \
        -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','getValue','setValue','UTF8ToString','HEAPU8']" \
        -s ALLOW_MEMORY_GROWTH=1 \
        -s INITIAL_MEMORY=16777216 \
        -s NO_EXIT_RUNTIME=1 \
        -s FILESYSTEM=0 \
        -s ENVIRONMENT='web,worker' \
        -o "${OUTPUT_DIR}/${OUTPUT_JS}"

    log_success "WASM module created"
}

# ============================================================================
# Create High-Level JavaScript API
# ============================================================================

create_js_api() {
    log_step "Creating high-level JavaScript API"

    cat > "${OUTPUT_DIR}/capstone-api.js" << 'JSEOF'
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
JSEOF

    log_success "JavaScript API created"
}

# ============================================================================
# Post-processing
# ============================================================================

process_output() {
    log_step "Processing output"

    cd "${OUTPUT_DIR}"

    if [ -f "${OUTPUT_JS}" ]; then
        log_info "JavaScript glue: ${OUTPUT_JS}"
        ls -lh "${OUTPUT_JS}"
    fi

    if [ -f "${OUTPUT_WASM}" ]; then
        log_info "WASM binary: ${OUTPUT_WASM}"
        ls -lh "${OUTPUT_WASM}"

        # Compress WASM
        log_info "Compressing WASM..."
        gzip -9 -f -k "${OUTPUT_WASM}"
        ls -lh "${OUTPUT_WASM}.gz"
    fi

    log_success "Output files ready in ${OUTPUT_DIR}"
}

print_summary() {
    log_step "Build Summary"

    echo "Capstone ARM Disassembler WASM Build Complete!"
    echo ""
    echo "Output directory: ${OUTPUT_DIR}"
    echo ""
    echo "Files:"
    ls -lh "${OUTPUT_DIR}/"
    echo ""
    echo "To copy to your machine:"
    echo "  scp builder@192.168.1.62:${OUTPUT_DIR}/* ."
    echo ""
    echo "Usage example:"
    echo "  <script src=\"capstone-arm.js\"></script>"
    echo "  <script src=\"capstone-api.js\"></script>"
    echo "  <script>"
    echo "    const cs = new CapstoneARM();"
    echo "    await cs.init();"
    echo "    cs.open(CS_MODE.THUMB | CS_MODE.MCLASS);"
    echo "    const code = new Uint8Array([0x00, 0xbf, 0x00, 0xbf]);"
    echo "    console.log(cs.disasmToString(code, 0x1000));"
    echo "    cs.close();"
    echo "  </script>"
}

# ============================================================================
# Main
# ============================================================================

main() {
    log_step "Capstone ARM WASM Build"
    log_info "Version: ${CAPSTONE_VERSION}"
    log_info "Build root: ${BUILD_ROOT}"

    local start_time=$(date +%s)

    setup_directories
    setup_emscripten
    clone_capstone
    build_wasm_library
    create_js_bindings
    create_js_api
    process_output

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    print_summary
    log_success "Total build time: $(($duration / 60))m $(($duration % 60))s"
}

main "$@"
