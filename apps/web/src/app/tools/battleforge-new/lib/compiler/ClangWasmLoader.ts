/**
 * Clang ARM WASM Loader
 *
 * Loads and instantiates the custom ARM-enabled Clang WASM binary.
 * Unlike YoWASP which uses npm packages, this loader fetches the WASM
 * binary directly from the public directory and manages its lifecycle.
 */

import { VirtualFileSystem } from '../wasi/wasiBindings';

export interface LoadProgress {
  stage: 'downloading' | 'instantiating' | 'ready' | 'error';
  progress: number; // 0-100
  message: string;
}

export interface ClangExecutionOptions {
  args: string[];
  files?: Record<string, Uint8Array | string>;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

export interface ClangExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  files?: Map<string, Uint8Array>;
}

/**
 * Clang ARM WASM Loader
 *
 * Manages loading and execution of ARM-enabled Clang compiler
 */
export class ClangWasmLoader {
  private wasmUrl = '/wasm/clang_arm/clang-arm.wasm';
  private wasmModule: WebAssembly.Module | null = null;
  private isLoaded = false;
  private fs: VirtualFileSystem;

  constructor() {
    this.fs = new VirtualFileSystem();
  }

  /**
   * Load the WASM binary and instantiate the module
   */
  async load(onProgress?: (progress: LoadProgress) => void): Promise<void> {
    if (this.isLoaded && this.wasmModule) {
      onProgress?.({ stage: 'ready', progress: 100, message: 'Compiler ready' });
      return;
    }

    try {
      onProgress?.({ stage: 'downloading', progress: 0, message: 'Downloading ARM Clang WASM...' });

      // Fetch WASM binary
      const response = await fetch(this.wasmUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      let loaded = 0;
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (total > 0) {
          const progress = Math.min((loaded / total) * 80, 80); // 0-80% for download
          onProgress?.({
            stage: 'downloading',
            progress,
            message: `Downloading... ${(loaded / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB`
          });
        }
      }

      // Combine chunks
      const wasmBytes = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        wasmBytes.set(chunk, offset);
        offset += chunk.length;
      }

      onProgress?.({ stage: 'instantiating', progress: 85, message: 'Compiling WASM module...' });

      // Compile WASM module
      this.wasmModule = await WebAssembly.compile(wasmBytes);

      this.isLoaded = true;
      onProgress?.({ stage: 'ready', progress: 100, message: 'Compiler ready' });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onProgress?.({ stage: 'error', progress: 0, message: `Failed to load: ${message}` });
      throw error;
    }
  }

  /**
   * Execute Clang with given arguments
   */
  async execute(options: ClangExecutionOptions): Promise<ClangExecutionResult> {
    if (!this.isLoaded || !this.wasmModule) {
      throw new Error('WASM module not loaded. Call load() first.');
    }

    // Clear filesystem and prepare for execution
    this.fs.clear();

    // Write input files to virtual filesystem
    if (options.files) {
      for (const [path, content] of Object.entries(options.files)) {
        // Ensure absolute paths (prepend / if not already absolute)
        const absolutePath = path.startsWith('/') ? path : '/' + path;
        this.fs.writeFile(absolutePath, content);
        console.log(`[ClangWasmLoader] Wrote file: ${absolutePath}`);
      }
    }

    // Capture stdout/stderr
    let stdoutData = '';
    let stderrData = '';

    // Prepare arguments (add 'clang' as argv[0])
    const args = ['clang', ...options.args];

    // Import createClangImports for full Emscripten support
    const { createClangImports } = await import('../wasi/wasiBindings');

    // Create complete imports (WASI + Emscripten env + memory + table)
    const { imports, wasiBindings, memoryRef } = createClangImports(this.fs, args);

    // Wrap stdout/stderr to capture output (will use exported memory after instantiation)
    const originalFdWrite = wasiBindings.fd_write;
    wasiBindings.fd_write = (fd: number, iovs: number, iovsLen: number, nwritten: number) => {
      // Call original fd_write
      const result = originalFdWrite(fd, iovs, iovsLen, nwritten);

      // Extract written data from exported memory for stdout/stderr
      const memory = memoryRef.memory;
      if ((fd === 1 || fd === 2) && memory) {
        const view = new DataView(memory.buffer);
        const decoder = new TextDecoder();

        for (let i = 0; i < iovsLen; i++) {
          const ptr = view.getUint32(iovs + i * 8, true);
          const len = view.getUint32(iovs + i * 8 + 4, true);
          const bytes = new Uint8Array(memory.buffer, ptr, len);
          const text = decoder.decode(bytes);

          if (fd === 1) {
            stdoutData += text;
            options.onStdout?.(text);
          } else if (fd === 2) {
            stderrData += text;
            options.onStderr?.(text);
          }
        }
      }

      return result;
    };

    // Instantiate WASM with complete imports (Emscripten needs env, table, WASI)
    const instance = await WebAssembly.instantiate(this.wasmModule, imports);

    console.log('[ClangWasmLoader] WASM instantiated with Emscripten imports (table, env, WASI)');
    console.log('[ClangWasmLoader] WASM exports:', Object.keys(instance.exports));

    // Get memory from WASM exports and set in memoryRef for future reference
    if (instance.exports.memory && instance.exports.memory instanceof WebAssembly.Memory) {
      memoryRef.memory = instance.exports.memory;
      console.log('[ClangWasmLoader] Using WASM exported memory:', instance.exports.memory.buffer.byteLength, 'bytes');
    } else {
      throw new Error('WASM module does not export memory');
    }

    // Execute WASM (call _start entry point)
    let exitCode = 0;
    try {
      const startFn = instance.exports._start as CallableFunction;
      if (typeof startFn === 'function') {
        startFn();
      } else {
        throw new Error('WASM module does not export _start function');
      }
    } catch (error) {
      // WASI programs may exit by throwing, check if it's a normal exit
      if (error && typeof error === 'object' && 'exitCode' in error) {
        exitCode = (error as { exitCode: number }).exitCode;
      } else {
        console.error('[ClangWasmLoader] Execution error:', error);
        exitCode = 1;
      }
    }

    // Collect output files from virtual filesystem
    const outputFiles = new Map<string, Uint8Array>();
    for (const path of this.fs.listFiles()) {
      if (!path.endsWith('/.dir')) {
        const data = this.fs.readFile(path);
        if (data) {
          outputFiles.set(path, data);
        }
      }
    }

    return {
      success: exitCode === 0,
      exitCode,
      stdout: stdoutData,
      stderr: stderrData,
      files: outputFiles
    };
  }

  /**
   * Get compiler version
   */
  async getVersion(): Promise<string> {
    try {
      const result = await this.execute({
        args: ['--version']
      });
      return result.stdout.trim() || 'Clang ARM (custom build)';
    } catch (error) {
      console.error('[ClangWasmLoader] Failed to get version:', error);
      return 'Unknown version';
    }
  }

  /**
   * Check if loader is ready
   */
  isReady(): boolean {
    return this.isLoaded && this.wasmModule !== null;
  }

  /**
   * Get virtual filesystem instance
   */
  getFileSystem(): VirtualFileSystem {
    return this.fs;
  }
}

// Singleton instance
let loaderInstance: ClangWasmLoader | null = null;

/**
 * Get singleton loader instance
 */
export function getClangWasmLoader(): ClangWasmLoader {
  if (!loaderInstance) {
    loaderInstance = new ClangWasmLoader();
  }
  return loaderInstance;
}

/**
 * Debug utilities for inspecting virtual filesystem from browser console
 */
export function enableDebugFS() {
  const loader = getClangWasmLoader();
  const fs = loader.getFileSystem();

  (window as Window & typeof globalThis & { debugFS?: unknown }).debugFS = {
    ls: (path: string = '/') => {
      const files = fs.listFiles();
      const filtered = files.filter(f => {
        if (path === '/') return true;
        return f.startsWith(path);
      });
      console.log(`Files in ${path}:`);
      filtered.forEach(f => console.log(`  ${f}`));
      return filtered;
    },

    cat: (path: string) => {
      const data = fs.readFile(path);
      if (!data) {
        console.log(`File not found: ${path}`);
        return null;
      }
      const text = new TextDecoder().decode(data);
      console.log(text);
      return text;
    },

    hexdump: (path: string, limit: number = 256) => {
      const data = fs.readFile(path);
      if (!data) {
        console.log(`File not found: ${path}`);
        return null;
      }
      const bytes = data.slice(0, limit);
      let output = '';
      for (let i = 0; i < bytes.length; i += 16) {
        const chunk = bytes.slice(i, i + 16);
        const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const ascii = Array.from(chunk).map(b => (b >= 32 && b < 127) ? String.fromCharCode(b) : '.').join('');
        output += `${i.toString(16).padStart(8, '0')}  ${hex.padEnd(48, ' ')}  ${ascii}\n`;
      }
      console.log(output);
      return data;
    },

    exists: (path: string) => {
      const exists = fs.exists(path);
      console.log(`${path}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
      return exists;
    },

    stat: (path: string) => {
      const data = fs.readFile(path);
      if (!data) {
        console.log(`File not found: ${path}`);
        return null;
      }
      const stats = {
        path,
        size: data.length,
        type: path.endsWith('/.dir') ? 'directory' : 'file'
      };
      console.table(stats);
      return stats;
    },

    help: () => {
      console.log('Virtual Filesystem Debug Commands:');
      console.log('  debugFS.ls(path)          - List files (default: /)');
      console.log('  debugFS.cat(path)         - Display file contents as text');
      console.log('  debugFS.hexdump(path)     - Display file contents as hex');
      console.log('  debugFS.exists(path)      - Check if file exists');
      console.log('  debugFS.stat(path)        - Show file stats');
      console.log('  debugFS.help()            - Show this help');
    }
  };

  console.log('🐚 Virtual Filesystem debug interface enabled!');
  console.log('Type debugFS.help() for available commands');
}
