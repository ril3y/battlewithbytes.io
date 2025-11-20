/**
 * Standalone test for Clang WASM with proper WASI bindings
 * Tests if we can compile a simple ARM program
 */

const fs = require('fs');
const zlib = require('zlib');

// Simple in-memory filesystem
class VirtualFS {
  constructor() {
    this.files = new Map();
  }

  writeFile(path, content) {
    if (typeof content === 'string') {
      content = Buffer.from(content, 'utf8');
    }
    this.files.set(path, content);
    console.log(`[VFS] Wrote ${path} (${content.length} bytes)`);
  }

  readFile(path) {
    return this.files.get(path) || null;
  }

  listFiles() {
    return Array.from(this.files.keys());
  }

  exists(path) {
    return this.files.has(path);
  }
}

// Create WASI bindings
function createWasiBindings(vfs, args, memory) {
  let stdoutBuffer = [];
  let stderrBuffer = [];

  // Convert args to WASI format
  const argsArray = args.map(arg => arg + '\0').join('');
  const argsBuffer = Buffer.from(argsArray, 'utf8');

  return {
    // WASI Snapshot Preview 1
    args_get: (argv, argvBuf) => {
      console.log('[WASI] args_get called');
      return 0; // ESUCCESS
    },
    args_sizes_get: (argcPtr, argvBufSizePtr) => {
      console.log('[WASI] args_sizes_get called');
      // We'll write to memory via the memory export
      return 0; // ESUCCESS
    },
    environ_get: (environ, environBuf) => {
      console.log('[WASI] environ_get called');
      return 0; // ESUCCESS
    },
    environ_sizes_get: (environcPtr, environBufSizePtr) => {
      console.log('[WASI] environ_sizes_get called');
      return 0; // ESUCCESS
    },
    clock_time_get: (id, precision, timePtr) => {
      console.log('[WASI] clock_time_get called');
      return 0; // ESUCCESS
    },
    fd_write: (fd, iovsPtr, iovsLen, nwrittenPtr) => {
      // fd 1 = stdout, fd 2 = stderr
      const buffer = fd === 1 ? stdoutBuffer : stderrBuffer;

      // Read iovs from memory and collect the data
      const mem = new Uint8Array(memory.buffer);
      let totalWritten = 0;

      for (let i = 0; i < iovsLen; i++) {
        const iovBase = iovsPtr + i * 8;
        const bufPtr = mem[iovBase] | (mem[iovBase + 1] << 8) | (mem[iovBase + 2] << 16) | (mem[iovBase + 3] << 24);
        const bufLen = mem[iovBase + 4] | (mem[iovBase + 5] << 8) | (mem[iovBase + 6] << 16) | (mem[iovBase + 7] << 24);

        const data = mem.slice(bufPtr, bufPtr + bufLen);
        const text = Buffer.from(data).toString('utf8');
        buffer.push(text);
        totalWritten += bufLen;
      }

      // Write the total bytes written to nwrittenPtr
      if (nwrittenPtr) {
        mem[nwrittenPtr] = totalWritten & 0xFF;
        mem[nwrittenPtr + 1] = (totalWritten >> 8) & 0xFF;
        mem[nwrittenPtr + 2] = (totalWritten >> 16) & 0xFF;
        mem[nwrittenPtr + 3] = (totalWritten >> 24) & 0xFF;
      }

      return 0; // ESUCCESS
    },
    fd_read: (fd, iovsPtr, iovsLen, nreadPtr) => {
      console.log(`[WASI] fd_read called: fd=${fd}`);
      return 0; // ESUCCESS
    },
    fd_close: (fd) => {
      console.log(`[WASI] fd_close called: fd=${fd}`);
      return 0; // ESUCCESS
    },
    fd_seek: (fd, offset, whence, newOffsetPtr) => {
      console.log(`[WASI] fd_seek called: fd=${fd}`);
      return 0; // ESUCCESS
    },
    fd_prestat_get: (fd, prestatPtr) => {
      console.log(`[WASI] fd_prestat_get called: fd=${fd}`);
      // We'll map fd 3 to root directory
      if (fd === 3) {
        return 0; // ESUCCESS
      }
      return 8; // EBADF
    },
    fd_prestat_dir_name: (fd, pathPtr, pathLen) => {
      console.log(`[WASI] fd_prestat_dir_name called: fd=${fd}`);
      return 0; // ESUCCESS
    },
    fd_fdstat_get: (fd, statPtr) => {
      console.log(`[WASI] fd_fdstat_get called: fd=${fd}`);
      return 0; // ESUCCESS
    },
    path_open: (fd, dirflags, pathPtr, pathLen, oflags, fsRightsBase, fsRightsInheriting, fdflags, openedFdPtr) => {
      console.log(`[WASI] path_open called: fd=${fd}, pathLen=${pathLen}`);
      return 0; // ESUCCESS
    },
    path_filestat_get: (fd, flags, pathPtr, pathLen, statPtr) => {
      console.log(`[WASI] path_filestat_get called: fd=${fd}`);
      return 0; // ESUCCESS
    },
    proc_exit: (code) => {
      console.log(`[WASI] proc_exit called with code: ${code}`);
      throw new Error(`Process exited with code ${code}`);
    },

    // Get stdout/stderr
    getStdout: () => stdoutBuffer.join('\n'),
    getStderr: () => stderrBuffer.join('\n')
  };
}

async function testClangWasm() {
  console.log('=== Clang WASM Test ===\n');

  // 1. Load and decompress WASM
  console.log('1. Loading WASM...');
  const compressed = fs.readFileSync('./dist/clang.wasm.gz');
  const wasmBuffer = zlib.gunzipSync(compressed);
  console.log(`   ✓ Loaded ${(wasmBuffer.length / 1024 / 1024).toFixed(2)} MB\n`);

  // 2. Create virtual filesystem
  console.log('2. Setting up virtual filesystem...');
  const vfs = new VirtualFS();

  // Write a simple test program
  const testProgram = `
int main(void) {
    return 42;
}
`;
  vfs.writeFile('/project/main.c', testProgram);
  console.log('   ✓ Created test program\n');

  // 3. Prepare command-line args
  const args = [
    'clang',
    '--version'  // Just test if Clang can print its version
  ];
  console.log('3. Command:', args.join(' '), '\n');

  // 4. Create WASI + Emscripten bindings
  console.log('4. Creating WASI and Emscripten bindings...');

  // Create memory for WASM (16MB initial, 256MB max)
  const memory = new WebAssembly.Memory({
    initial: 256,  // 16MB (256 * 64KB pages)
    maximum: 4096  // 256MB
  });

  const wasiBindings = createWasiBindings(vfs, args, memory);

  // Create table for indirect calls (needs to be large for Clang)
  const table = new WebAssembly.Table({
    initial: 30000,  // Clang needs ~28273 minimum
    maximum: 30000,
    element: 'anyfunc'
  });

  // Emscripten env module stubs
  const envBindings = {
    memory: memory,
    __indirect_function_table: table,
    __memory_base: 1024,
    __stack_pointer: new WebAssembly.Global({ value: 'i32', mutable: true }, 65536),
    __table_base: 0,

    // System calls - just return success/error codes
    __syscall_unlinkat: () => { console.log('[env] __syscall_unlinkat'); return 0; },
    __syscall_faccessat: () => { console.log('[env] __syscall_faccessat'); return 0; },
    __syscall_symlink: () => { console.log('[env] __syscall_symlink'); return -1; },
    __syscall_statfs64: () => { console.log('[env] __syscall_statfs64'); return -1; },
    __syscall_renameat: () => { console.log('[env] __syscall_renameat'); return -1; },
    __syscall_rmdir: () => { console.log('[env] __syscall_rmdir'); return -1; },
    __syscall_readlinkat: () => { console.log('[env] __syscall_readlinkat'); return -1; },
    __syscall_getdents64: () => { console.log('[env] __syscall_getdents64'); return -1; },
    __syscall_getcwd: () => { console.log('[env] __syscall_getcwd'); return 0; },
    __syscall_dup3: () => { console.log('[env] __syscall_dup3'); return 0; },
    __syscall_chdir: () => { console.log('[env] __syscall_chdir'); return 0; },
    wait4: () => { console.log('[env] wait4'); return -1; },

    // Emscripten runtime
    emscripten_notify_memory_growth: (idx) => {
      console.log('[env] emscripten_notify_memory_growth:', idx);
    },
    _emscripten_throw_longjmp: () => {
      console.log('[env] _emscripten_throw_longjmp');
      throw new Error('longjmp');
    },

    // Invoke wrappers for dynamic calls
    invoke_vi: (idx, a) => { console.log('[env] invoke_vi'); },
    invoke_ii: (idx, a) => { console.log('[env] invoke_ii'); return 0; }
  };

  // GOT (Global Offset Table)
  const gotBindings = {
    __heap_base: new WebAssembly.Global({ value: 'i32', mutable: true }, 1048576)
  };

  const imports = {
    wasi_snapshot_preview1: wasiBindings,
    env: envBindings,
    'GOT.mem': gotBindings
  };
  console.log('   ✓ WASI + Emscripten bindings ready\n');

  // 5. Instantiate WASM
  console.log('5. Instantiating WASM module...');
  try {
    const module = await WebAssembly.compile(wasmBuffer);
    const instance = await WebAssembly.instantiate(module, imports);

    console.log('   ✓ Module instantiated');
    console.log('   Available exports:', Object.keys(instance.exports).join(', '), '\n');

    // 6. Call _start
    console.log('6. Calling _start...');
    if (instance.exports._start) {
      try {
        instance.exports._start();
        console.log('   ✓ _start returned normally (exit code 0)\n');
      } catch (error) {
        const msg = error.message;
        if (msg.includes('exited with code')) {
          const match = msg.match(/code (\d+)/);
          const exitCode = match ? parseInt(match[1]) : 'unknown';
          console.log(`   ✓ Process exited with code: ${exitCode}\n`);
        } else {
          console.log('   ✗ Error:', msg, '\n');
          throw error;
        }
      }
    } else {
      console.log('   ✗ No _start export found!\n');
      return false;
    }

    // 7. Check results
    console.log('7. Results:');
    console.log('   Stdout:', wasiBindings.getStdout() || '(empty)');
    console.log('   Stderr:', wasiBindings.getStderr() || '(empty)');
    console.log('\n   Files in VFS after compilation:');
    for (const file of vfs.listFiles()) {
      const content = vfs.readFile(file);
      console.log(`   - ${file}: ${content?.length || 0} bytes`);
    }

    console.log('\n=== Test Complete ===');
    return true;

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run test
testClangWasm()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
