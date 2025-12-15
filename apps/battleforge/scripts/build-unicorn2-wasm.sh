#!/bin/bash
#
# Build Unicorn 2.x as WebAssembly
# Modern ARM CPU emulator for browser-based code execution
#
# Run this on the buildbox: ssh builder@192.168.1.62
# Usage: ./build-unicorn2-wasm.sh
#
# Requirements:
#   - Emscripten SDK 3.1.50+
#   - CMake 3.15+
#   - ~4GB disk space
#
# Output: unicorn2-arm.wasm, unicorn2-arm.js
#

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_ROOT="${BUILD_ROOT:-$HOME/unicorn2-wasm-build}"

# Official Unicorn 2.x repository
UNICORN_REPO="https://github.com/unicorn-engine/unicorn.git"
UNICORN_VERSION="${UNICORN_VERSION:-2.1.1}"
EMSDK_VERSION="${EMSDK_VERSION:-3.1.50}"
NUM_JOBS="${NUM_JOBS:-$(nproc)}"

# Directories
UNICORN_SRC="${BUILD_ROOT}/unicorn"
WASM_BUILD="${BUILD_ROOT}/build-wasm"
EMSDK_DIR="${BUILD_ROOT}/emsdk"
OUTPUT_DIR="${BUILD_ROOT}/output"

# Output files
OUTPUT_WASM="unicorn2-arm.wasm"
OUTPUT_JS="unicorn2-arm.js"

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
# Clone Unicorn 2.x
# ============================================================================

clone_unicorn() {
    log_step "Cloning Unicorn 2.x (v${UNICORN_VERSION})"

    if [ -d "${UNICORN_SRC}" ]; then
        log_info "Updating existing source..."
        cd "${UNICORN_SRC}"
        git fetch --tags
        git checkout "tags/${UNICORN_VERSION}" 2>/dev/null || git checkout "${UNICORN_VERSION}"
    else
        log_info "Cloning Unicorn repository..."
        git clone --depth 1 --branch "${UNICORN_VERSION}" "${UNICORN_REPO}" "${UNICORN_SRC}"
    fi

    log_success "Unicorn 2.x source ready"
}

# ============================================================================
# Build WASM
# ============================================================================

build_wasm() {
    log_step "Building Unicorn 2.x as WebAssembly (ARM only)"

    source "${EMSDK_DIR}/emsdk_env.sh"

    rm -rf "${WASM_BUILD}"
    mkdir -p "${WASM_BUILD}"
    cd "${WASM_BUILD}"

    log_info "Configuring with emcmake..."

    # Configure with emcmake for WASM target
    # - ARM architecture only for smaller binary
    # - Static library for embedding
    # - Disable tests and installation
    emcmake cmake "${UNICORN_SRC}" \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_SHARED_LIBS=OFF \
        -DUNICORN_ARCH=arm \
        -DUNICORN_BUILD_TESTS=OFF \
        -DUNICORN_INSTALL=OFF \
        -DUNICORN_LOGGING=OFF \
        -DCMAKE_C_FLAGS="-O3 -DNDEBUG" \
        -DCMAKE_CXX_FLAGS="-O3 -DNDEBUG"

    log_info "Building with ${NUM_JOBS} jobs..."
    emmake make -j${NUM_JOBS} || {
        log_warning "Parallel build failed, trying single-threaded..."
        emmake make -j1
    }

    log_success "Unicorn library built"
}

# ============================================================================
# Create JavaScript Bindings
# ============================================================================

create_js_bindings() {
    log_step "Creating JavaScript/WASM bindings"

    cd "${WASM_BUILD}"

    # Find the built static library
    UNICORN_LIB=$(find . -name "libunicorn.a" | head -1)
    if [ -z "${UNICORN_LIB}" ]; then
        log_error "Could not find libunicorn.a"
    fi
    log_info "Found: ${UNICORN_LIB}"

    # Create a simple wrapper that exports the Unicorn API
    cat > "${WASM_BUILD}/unicorn_wrapper.c" << 'EOF'
#include <unicorn/unicorn.h>
#include <emscripten.h>

// Export Unicorn functions to JavaScript
EMSCRIPTEN_KEEPALIVE
uc_err uc_open_js(uc_arch arch, uc_mode mode, uc_engine **uc) {
    return uc_open(arch, mode, uc);
}

EMSCRIPTEN_KEEPALIVE
uc_err uc_close_js(uc_engine *uc) {
    return uc_close(uc);
}

EMSCRIPTEN_KEEPALIVE
uc_err uc_mem_map_js(uc_engine *uc, uint64_t address, size_t size, uint32_t perms) {
    return uc_mem_map(uc, address, size, perms);
}

EMSCRIPTEN_KEEPALIVE
uc_err uc_mem_write_js(uc_engine *uc, uint64_t address, const void *bytes, size_t size) {
    return uc_mem_write(uc, address, bytes, size);
}

EMSCRIPTEN_KEEPALIVE
uc_err uc_mem_read_js(uc_engine *uc, uint64_t address, void *bytes, size_t size) {
    return uc_mem_read(uc, address, bytes, size);
}

EMSCRIPTEN_KEEPALIVE
uc_err uc_reg_write_js(uc_engine *uc, int regid, const void *value) {
    return uc_reg_write(uc, regid, value);
}

EMSCRIPTEN_KEEPALIVE
uc_err uc_reg_read_js(uc_engine *uc, int regid, void *value) {
    return uc_reg_read(uc, regid, value);
}

EMSCRIPTEN_KEEPALIVE
uc_err uc_emu_start_js(uc_engine *uc, uint64_t begin, uint64_t until, uint64_t timeout, size_t count) {
    return uc_emu_start(uc, begin, until, timeout, count);
}

EMSCRIPTEN_KEEPALIVE
uc_err uc_emu_stop_js(uc_engine *uc) {
    return uc_emu_stop(uc);
}

EMSCRIPTEN_KEEPALIVE
const char* uc_strerror_js(uc_err err) {
    return uc_strerror(err);
}

EMSCRIPTEN_KEEPALIVE
unsigned int uc_version_js(unsigned int *major, unsigned int *minor) {
    return uc_version(major, minor);
}
EOF

    log_info "Compiling WASM module with JavaScript bindings..."

    # Compile the wrapper with the static library
    emcc -O3 \
        -I"${UNICORN_SRC}/include" \
        "${WASM_BUILD}/unicorn_wrapper.c" \
        "${UNICORN_LIB}" \
        -s WASM=1 \
        -s MODULARIZE=1 \
        -s EXPORT_NAME="UnicornModule" \
        -s EXPORTED_FUNCTIONS="['_malloc','_free','_uc_open_js','_uc_close_js','_uc_mem_map_js','_uc_mem_write_js','_uc_mem_read_js','_uc_reg_write_js','_uc_reg_read_js','_uc_emu_start_js','_uc_emu_stop_js','_uc_strerror_js','_uc_version_js']" \
        -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','getValue','setValue','HEAPU8','HEAP32']" \
        -s ALLOW_MEMORY_GROWTH=1 \
        -s INITIAL_MEMORY=67108864 \
        -s MAXIMUM_MEMORY=536870912 \
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

    cat > "${OUTPUT_DIR}/unicorn2-api.js" << 'JSEOF'
/**
 * Unicorn2 ARM Emulator - High-Level JavaScript API
 * Built from Unicorn Engine 2.x
 */

// ARM Architecture Constants
const UC_ARCH_ARM = 1;
const UC_MODE_ARM = 0;
const UC_MODE_THUMB = 16;
const UC_MODE_LITTLE_ENDIAN = 0;

// ARM Registers
const UC_ARM_REG = {
    R0: 66, R1: 67, R2: 68, R3: 69,
    R4: 70, R5: 71, R6: 72, R7: 73,
    R8: 74, R9: 75, R10: 76, R11: 77,
    R12: 78, SP: 12, LR: 10, PC: 15,
    CPSR: 25
};

// Memory Permissions
const UC_PROT = {
    NONE: 0,
    READ: 1,
    WRITE: 2,
    EXEC: 4,
    ALL: 7
};

// Error Codes
const UC_ERR = {
    OK: 0,
    NOMEM: 1,
    ARCH: 2,
    HANDLE: 3,
    MODE: 4,
    VERSION: 5,
    READ_UNMAPPED: 6,
    WRITE_UNMAPPED: 7,
    FETCH_UNMAPPED: 8,
    HOOK: 9,
    INSN_INVALID: 10,
    MAP: 11,
    WRITE_PROT: 12,
    READ_PROT: 13,
    FETCH_PROT: 14,
    ARG: 15,
    READ_UNALIGNED: 16,
    WRITE_UNALIGNED: 17,
    FETCH_UNALIGNED: 18,
    HOOK_EXIST: 19,
    RESOURCE: 20,
    EXCEPTION: 21
};

class Unicorn2ARM {
    constructor() {
        this.module = null;
        this.engine = null;
        this._uc_open = null;
        this._uc_close = null;
        this._uc_mem_map = null;
        this._uc_mem_write = null;
        this._uc_mem_read = null;
        this._uc_reg_write = null;
        this._uc_reg_read = null;
        this._uc_emu_start = null;
        this._uc_emu_stop = null;
        this._uc_strerror = null;
    }

    async init() {
        if (typeof UnicornModule === 'undefined') {
            throw new Error('UnicornModule not loaded. Include unicorn2-arm.js first.');
        }

        this.module = await UnicornModule();

        // Wrap C functions
        this._uc_open = this.module.cwrap('uc_open_js', 'number', ['number', 'number', 'number']);
        this._uc_close = this.module.cwrap('uc_close_js', 'number', ['number']);
        this._uc_mem_map = this.module.cwrap('uc_mem_map_js', 'number', ['number', 'number', 'number', 'number', 'number']);
        this._uc_mem_write = this.module.cwrap('uc_mem_write_js', 'number', ['number', 'number', 'number', 'number', 'number']);
        this._uc_mem_read = this.module.cwrap('uc_mem_read_js', 'number', ['number', 'number', 'number', 'number', 'number']);
        this._uc_reg_write = this.module.cwrap('uc_reg_write_js', 'number', ['number', 'number', 'number']);
        this._uc_reg_read = this.module.cwrap('uc_reg_read_js', 'number', ['number', 'number', 'number']);
        this._uc_emu_start = this.module.cwrap('uc_emu_start_js', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
        this._uc_emu_stop = this.module.cwrap('uc_emu_stop_js', 'number', ['number']);
        this._uc_strerror = this.module.cwrap('uc_strerror_js', 'string', ['number']);

        return this;
    }

    open(mode = UC_MODE_THUMB) {
        const enginePtr = this.module._malloc(4);
        const err = this._uc_open(UC_ARCH_ARM, mode | UC_MODE_LITTLE_ENDIAN, enginePtr);
        if (err !== UC_ERR.OK) {
            this.module._free(enginePtr);
            throw new Error(`uc_open failed: ${this._uc_strerror(err)}`);
        }
        this.engine = this.module.getValue(enginePtr, 'i32');
        this.module._free(enginePtr);
        return this;
    }

    close() {
        if (this.engine) {
            this._uc_close(this.engine);
            this.engine = null;
        }
    }

    memMap(address, size, perms = UC_PROT.ALL) {
        const err = this._uc_mem_map(this.engine, address, 0, size, perms);
        if (err !== UC_ERR.OK) {
            throw new Error(`uc_mem_map failed: ${this._uc_strerror(err)}`);
        }
        return this;
    }

    memWrite(address, data) {
        const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
        const ptr = this.module._malloc(bytes.length);
        this.module.HEAPU8.set(bytes, ptr);
        const err = this._uc_mem_write(this.engine, address, 0, ptr, bytes.length);
        this.module._free(ptr);
        if (err !== UC_ERR.OK) {
            throw new Error(`uc_mem_write failed: ${this._uc_strerror(err)}`);
        }
        return this;
    }

    memRead(address, size) {
        const ptr = this.module._malloc(size);
        const err = this._uc_mem_read(this.engine, address, 0, ptr, size);
        if (err !== UC_ERR.OK) {
            this.module._free(ptr);
            throw new Error(`uc_mem_read failed: ${this._uc_strerror(err)}`);
        }
        const result = new Uint8Array(size);
        result.set(this.module.HEAPU8.subarray(ptr, ptr + size));
        this.module._free(ptr);
        return result;
    }

    regWrite(reg, value) {
        const ptr = this.module._malloc(4);
        this.module.setValue(ptr, value, 'i32');
        const err = this._uc_reg_write(this.engine, reg, ptr);
        this.module._free(ptr);
        if (err !== UC_ERR.OK) {
            throw new Error(`uc_reg_write failed: ${this._uc_strerror(err)}`);
        }
        return this;
    }

    regRead(reg) {
        const ptr = this.module._malloc(4);
        const err = this._uc_reg_read(this.engine, reg, ptr);
        if (err !== UC_ERR.OK) {
            this.module._free(ptr);
            throw new Error(`uc_reg_read failed: ${this._uc_strerror(err)}`);
        }
        const value = this.module.getValue(ptr, 'i32');
        this.module._free(ptr);
        return value >>> 0; // Return as unsigned
    }

    emuStart(begin, until, timeout = 0, count = 0) {
        const err = this._uc_emu_start(this.engine, begin, 0, until, 0, timeout, count);
        if (err !== UC_ERR.OK) {
            throw new Error(`uc_emu_start failed: ${this._uc_strerror(err)}`);
        }
        return this;
    }

    emuStop() {
        const err = this._uc_emu_stop(this.engine);
        if (err !== UC_ERR.OK) {
            throw new Error(`uc_emu_stop failed: ${this._uc_strerror(err)}`);
        }
        return this;
    }

    // Convenience method to step one instruction
    step(address) {
        return this.emuStart(address, address + 4, 0, 1);
    }

    // Get all general purpose registers
    getRegisters() {
        return {
            r0: this.regRead(UC_ARM_REG.R0),
            r1: this.regRead(UC_ARM_REG.R1),
            r2: this.regRead(UC_ARM_REG.R2),
            r3: this.regRead(UC_ARM_REG.R3),
            r4: this.regRead(UC_ARM_REG.R4),
            r5: this.regRead(UC_ARM_REG.R5),
            r6: this.regRead(UC_ARM_REG.R6),
            r7: this.regRead(UC_ARM_REG.R7),
            r8: this.regRead(UC_ARM_REG.R8),
            r9: this.regRead(UC_ARM_REG.R9),
            r10: this.regRead(UC_ARM_REG.R10),
            r11: this.regRead(UC_ARM_REG.R11),
            r12: this.regRead(UC_ARM_REG.R12),
            sp: this.regRead(UC_ARM_REG.SP),
            lr: this.regRead(UC_ARM_REG.LR),
            pc: this.regRead(UC_ARM_REG.PC),
            cpsr: this.regRead(UC_ARM_REG.CPSR)
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Unicorn2ARM, UC_ARCH_ARM, UC_MODE_ARM, UC_MODE_THUMB, UC_ARM_REG, UC_PROT, UC_ERR };
}
if (typeof window !== 'undefined') {
    window.Unicorn2ARM = Unicorn2ARM;
    window.UC_ARM_REG = UC_ARM_REG;
    window.UC_PROT = UC_PROT;
    window.UC_ERR = UC_ERR;
    window.UC_MODE_THUMB = UC_MODE_THUMB;
    window.UC_MODE_ARM = UC_MODE_ARM;
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

    echo "Unicorn 2.x ARM WASM Build Complete!"
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
    echo "  <script src=\"unicorn2-arm.js\"></script>"
    echo "  <script src=\"unicorn2-api.js\"></script>"
    echo "  <script>"
    echo "    const emu = new Unicorn2ARM();"
    echo "    await emu.init();"
    echo "    emu.open(UC_MODE_THUMB);"
    echo "    emu.memMap(0x10000, 0x10000);"
    echo "    emu.memWrite(0x10000, code);"
    echo "    emu.regWrite(UC_ARM_REG.SP, 0x1FFFF);"
    echo "    emu.emuStart(0x10000, 0x10100);"
    echo "    console.log(emu.getRegisters());"
    echo "  </script>"
}

# ============================================================================
# Main
# ============================================================================

main() {
    log_step "Unicorn 2.x ARM WASM Build"
    log_info "Version: ${UNICORN_VERSION}"
    log_info "Build root: ${BUILD_ROOT}"

    local start_time=$(date +%s)

    setup_directories
    setup_emscripten
    clone_unicorn
    build_wasm
    create_js_bindings
    create_js_api
    process_output

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    print_summary
    log_success "Total build time: $(($duration / 60))m $(($duration % 60))s"
}

main "$@"
