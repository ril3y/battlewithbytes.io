/**
 * Emscripten Clang Loader
 *
 * Uses an iframe to isolate each Clang execution since Emscripten
 * declares global variables that can't be redeclared.
 */

import { getBasePath } from "@battlewithbytes/utils";
import { WasmCache } from "../wasm/WasmCache";

// Singleton cache instance for registering HTTP-loaded compilers
const wasmCache = new WasmCache();

export interface LoadProgress {
  stage: "downloading" | "instantiating" | "ready" | "error";
  progress: number;
  message: string;
  current?: number; // Bytes loaded (optional)
  total?: number; // Total bytes (optional)
}

export interface ClangExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  outputFiles: Map<string, Uint8Array>;
}

export type CompilerArch = "arm" | "xtensa" | "riscv";

// Track which compilers have been verified
const initialLoadDone: Record<CompilerArch, boolean> = {
  arm: false,
  xtensa: false,
  riscv: false,
};

/**
 * Execute Clang in an isolated iframe
 * @param args - Clang command line arguments
 * @param files - Files to write to the virtual filesystem
 * @param onStdout - Callback for stdout output
 * @param onStderr - Callback for stderr output
 * @param arch - Target architecture: "arm" (default), "xtensa" (ESP32/S2/S3), or "riscv" (ESP32-C3/C6/H2)
 */
export async function executeClang(
  args: string[],
  files: Record<string, string | Uint8Array>,
  onStdout?: (text: string) => void,
  onStderr?: (text: string) => void,
  arch: CompilerArch = "arm",
): Promise<ClangExecutionResult> {
  const compilerDir = `clang_${arch}`;
  return new Promise((resolve, reject) => {
    // Create iframe for isolation
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow as any;
    if (!iframeWindow) {
      iframe.remove();
      reject(new Error("Failed to create iframe"));
      return;
    }

    let stdout = "";
    let stderr = "";
    const exitCode = 0;
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        setTimeout(() => iframe.remove(), 100);
      }
    };

    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      if (!resolved) {
        cleanup();
        reject(new Error("Clang execution timed out"));
      }
    }, 60000);

    // Configure Module via inline script injection
    const basePath = getBasePath();
    const baseUrl = window.location.origin + basePath;
    console.log("[EmscriptenClang] Base URL:", baseUrl, "(basePath:", basePath, ")");
    console.log("[EmscriptenClang] Args:", args);

    // First, inject Module configuration as inline script
    // This ensures Module is defined BEFORE clang.js parses
    const moduleScript = iframeWindow.document.createElement("script");

    // Prepare file data for preRun
    const fileEntries: Array<{ path: string; data: string }> = [];
    for (const [path, content] of Object.entries(files)) {
      if (typeof content === "string") {
        fileEntries.push({ path, data: content });
      } else {
        // Convert Uint8Array to base64 for transmission
        const binary = Array.from(content)
          .map((b) => String.fromCharCode(b))
          .join("");
        fileEntries.push({ path, data: "BASE64:" + btoa(binary) });
      }
    }

    // List of output files to look for
    const oIndex = args.indexOf("-o");
    const outputPath =
      oIndex !== -1 && oIndex + 1 < args.length ? args[oIndex + 1] : "/main.o";
    const potentialOutputs = ["/main.o", "/a.out", "/output.o", outputPath];

    moduleScript.textContent = `
      var _clangExitCode = 0;
      var _inputFiles = ${JSON.stringify(fileEntries)};
      var _outputPaths = ${JSON.stringify(potentialOutputs)};

      // Intercept ALL console output in iframe
      var _origLog = console.log;
      var _origWarn = console.warn;
      var _origError = console.error;
      console.log = function() {
        _origLog.apply(console, arguments);
        var msg = Array.prototype.slice.call(arguments).join(' ');
        parent.postMessage({ type: 'iframe-console-log', text: msg }, '*');
      };
      console.warn = function() {
        _origWarn.apply(console, arguments);
        var msg = Array.prototype.slice.call(arguments).join(' ');
        parent.postMessage({ type: 'iframe-console-warn', text: msg }, '*');
      };
      console.error = function() {
        _origError.apply(console, arguments);
        var msg = Array.prototype.slice.call(arguments).join(' ');
        parent.postMessage({ type: 'iframe-console-error', text: msg }, '*');
      };

      var Module = {
        thisProgram: 'clang',
        noInitialRun: true,  // Don't auto-run, we'll call main manually
        _clangArgs: ${JSON.stringify(args)},

        locateFile: function(path) {
          var url = "${baseUrl}/wasm/${compilerDir}/" + path;
          console.log('[clang] locateFile:', path, '->', url);
          return url;
        },

        onRuntimeInitialized: function() {
          console.log('[clang] Runtime initialized');
          parent.postMessage({ type: 'emscripten-runtime-init' }, '*');

          var FS = Module.FS;
          var callMain = Module.callMain;

          if (!FS) {
            parent.postMessage({ type: 'emscripten-abort', message: 'FS not exported' }, '*');
            return;
          }
          if (!callMain) {
            parent.postMessage({ type: 'emscripten-abort', message: 'callMain not exported' }, '*');
            return;
          }

          // Write input files to virtual filesystem
          console.log('[clang] Writing input files...');
          for (var i = 0; i < _inputFiles.length; i++) {
            var file = _inputFiles[i];
            var data;

            if (file.data.startsWith('BASE64:')) {
              var b64 = file.data.substring(7);
              var binary = atob(b64);
              data = new Uint8Array(binary.length);
              for (var j = 0; j < binary.length; j++) {
                data[j] = binary.charCodeAt(j);
              }
            } else {
              data = new TextEncoder().encode(file.data);
            }

            // Create directories
            var dir = file.path.substring(0, file.path.lastIndexOf('/'));
            if (dir && dir !== '/' && dir !== '') {
              var parts = dir.split('/').filter(function(p) { return p; });
              var currentPath = '';
              for (var k = 0; k < parts.length; k++) {
                currentPath += '/' + parts[k];
                try { FS.mkdir(currentPath); } catch(e) {}
              }
            }

            FS.writeFile(file.path, data);
            console.log('[clang] Wrote:', file.path, '(' + data.length + ' bytes)');
          }

          // Create directories for output files
          for (var i = 0; i < _outputPaths.length; i++) {
            var outPath = _outputPaths[i];
            var outDir = outPath.substring(0, outPath.lastIndexOf('/'));
            if (outDir && outDir !== '/' && outDir !== '') {
              var parts = outDir.split('/').filter(function(p) { return p; });
              var currentPath = '';
              for (var k = 0; k < parts.length; k++) {
                currentPath += '/' + parts[k];
                try { FS.mkdir(currentPath); } catch(e) {}
              }
              console.log('[clang] Created output dir:', outDir);
            }
          }

          // Call clang main with arguments
          console.log('[clang] Calling main with args:', Module._clangArgs);
          try {
            _clangExitCode = callMain(Module._clangArgs);
            console.log('[clang] main returned:', _clangExitCode);
          } catch (e) {
            console.error('[clang] main threw:', e.message || e);
            _clangExitCode = 1;
          }

          // Collect output files
          console.log('[clang] Collecting output files...');
          var outputFiles = {};
          for (var i = 0; i < _outputPaths.length; i++) {
            var path = _outputPaths[i];
            try {
              var data = FS.readFile(path);
              if (data && data.length > 0) {
                outputFiles[path] = Array.from(data);
                console.log('[clang] Output:', path, '(' + data.length + ' bytes)');
              }
            } catch(e) {
              // File doesn't exist
            }
          }

          // Send done message
          parent.postMessage({
            type: 'emscripten-done',
            exitCode: _clangExitCode,
            outputFiles: outputFiles
          }, '*');
        },

        print: function(text) {
          console.log('[clang stdout]', text);
          parent.postMessage({ type: 'emscripten-stdout', text: text }, '*');
        },

        printErr: function(text) {
          console.warn('[clang stderr]', text);
          parent.postMessage({ type: 'emscripten-stderr', text: text }, '*');
        },

        onExit: function(code) {
          console.log('[clang] onExit:', code);
          _clangExitCode = code;
        },

        quit: function(code, toThrow) {
          console.log('[clang] quit called with code:', code);
          _clangExitCode = code;
        },

        onAbort: function(what) {
          console.error('[clang] Abort:', what);
          parent.postMessage({ type: 'emscripten-abort', message: String(what) }, '*');
        }
      };
    `;
    iframeWindow.document.head.appendChild(moduleScript);

    // Listen for messages from iframe
    const messageHandler = (event: MessageEvent) => {
      if (event.source !== iframeWindow) return;
      const data = event.data;

      if (data.type === "iframe-console-log") {
        console.log("[iframe]", data.text);
      } else if (data.type === "iframe-console-warn") {
        console.warn("[iframe warn]", data.text);
      } else if (data.type === "iframe-console-error") {
        console.error("[iframe error]", data.text);
      } else if (data.type === "emscripten-runtime-init") {
        console.log("[EmscriptenClang] Runtime initialized!");
      } else if (data.type === "emscripten-stdout") {
        stdout += data.text + "\n";
        onStdout?.(data.text);
        console.log("[clang stdout]", data.text);
      } else if (data.type === "emscripten-stderr") {
        stderr += data.text + "\n";
        onStderr?.(data.text);
        console.warn("[clang stderr]", data.text);
      } else if (data.type === "emscripten-abort") {
        console.error("[EmscriptenClang] Abort:", data.message);
        stderr += "ABORT: " + data.message + "\n";
      } else if (data.type === "emscripten-done") {
        console.log("[EmscriptenClang] Done, exit code:", data.exitCode);

        // Convert output files back to Map<string, Uint8Array>
        const outputFiles = new Map<string, Uint8Array>();
        for (const [path, arr] of Object.entries(data.outputFiles || {})) {
          outputFiles.set(path, new Uint8Array(arr as number[]));
        }

        clearTimeout(timeout);
        window.removeEventListener("message", messageHandler);
        cleanup();

        resolve({
          success: data.exitCode === 0,
          exitCode: data.exitCode,
          stdout,
          stderr,
          outputFiles,
        });
      }
    };
    window.addEventListener("message", messageHandler);

    // Now load clang.js - use absolute URL
    const script = iframeWindow.document.createElement("script");
    script.src = `${baseUrl}/wasm/${compilerDir}/clang.js`;
    console.log("[EmscriptenClang] Loading script:", script.src, "(arch:", arch, ")");

    script.onload = () => {
      console.log("[EmscriptenClang] Script loaded successfully");
    };

    script.onerror = (e: Event | string) => {
      console.error("[EmscriptenClang] Script load error:", e);
      clearTimeout(timeout);
      window.removeEventListener("message", messageHandler);
      cleanup();
      reject(new Error("Failed to load clang.js"));
    };

    iframeWindow.document.head.appendChild(script);
  });
}

/**
 * Load the Clang module (initial verification)
 * @param onProgress - Callback for load progress
 * @param arch - Target architecture: "arm" (default), "xtensa", or "riscv"
 */
export async function loadClangModule(
  onProgress?: (progress: LoadProgress) => void,
  arch: CompilerArch = "arm",
): Promise<void> {
  if (initialLoadDone[arch]) {
    onProgress?.({ stage: "ready", progress: 100, message: `Compiler ready (${arch})` });
    return;
  }

  const archName = arch === "arm" ? "ARM" : arch === "xtensa" ? "Xtensa" : "RISC-V";
  onProgress?.({
    stage: "downloading",
    progress: 0,
    message: `Loading Clang ${archName} compiler...`,
  });

  try {
    onProgress?.({
      stage: "instantiating",
      progress: 50,
      message: `Initializing Clang ${archName}...`,
    });

    const result = await executeClang(["--version"], {}, undefined, undefined, arch);

    console.log(`[EmscriptenClang] Version check result (${arch}):`, {
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      success: result.success,
    });

    // Check both stdout and stderr for clang output
    const combinedOutput = (result.stdout + result.stderr).toLowerCase();
    if (combinedOutput.includes("clang") || result.exitCode === 0) {
      initialLoadDone[arch] = true;

      // Register the compiler as installed in WasmCache
      // This syncs the HTTP-loaded compiler with the WasmManagerPanel
      await registerCompilerAsInstalled(arch);

      onProgress?.({
        stage: "ready",
        progress: 100,
        message: `Clang ${archName} compiler ready`,
      });
    } else {
      throw new Error(
        `Version check failed (exit ${result.exitCode}): stdout="${result.stdout}" stderr="${result.stderr}"`,
      );
    }
  } catch (error) {
    onProgress?.({
      stage: "error",
      progress: 0,
      message: `Failed to load: ${error}`,
    });
    throw error;
  }
}

/**
 * Register the compiler as installed in WasmCache
 * Fetches manifest to get version/hash/size info
 */
async function registerCompilerAsInstalled(arch: CompilerArch = "arm"): Promise<void> {
  const compilerId = `clang-${arch}`;
  try {
    const basePath = getBasePath();
    const manifestUrl = `${basePath}/data/boards/wasm/manifest.json`;

    const response = await fetch(manifestUrl);
    if (!response.ok) {
      console.warn("[EmscriptenClang] Could not fetch manifest for registration");
      return;
    }

    const manifest = await response.json();
    const compiler = manifest.compilers?.find((c: { id: string }) => c.id === compilerId);

    if (compiler) {
      // Support both v1 (version, hash) and v2 (fullVersion, hashes.compressed) formats
      const version = compiler.fullVersion || compiler.version || compiler.softwareVersion || "";
      const hash = compiler.hashes?.compressed || compiler.hash || "";
      await wasmCache.setMetadataOnly(
        compilerId,
        version,
        hash,
        compiler.size,
      );
      console.log(`[EmscriptenClang] Registered ${compilerId} v${version} as installed`);
    }
  } catch (err) {
    console.warn("[EmscriptenClang] Failed to register compiler:", err);
    // Non-fatal - compiler still works, just won't show in panel
  }
}

/**
 * Get compiler version
 */
export async function getClangVersion(arch: CompilerArch = "arm"): Promise<string> {
  const archName = arch === "arm" ? "ARM" : arch === "xtensa" ? "Xtensa" : "RISC-V";
  try {
    const result = await executeClang(["--version"], {}, undefined, undefined, arch);
    const lines = result.stdout.split("\n");
    return lines[0] || `Clang ${archName}`;
  } catch (error) {
    console.error("[EmscriptenClang] Failed to get version:", error);
    return "Unknown version";
  }
}

/**
 * Check if initial load completed for given architecture
 */
export function isClangLoaded(arch: CompilerArch = "arm"): boolean {
  return initialLoadDone[arch];
}

/**
 * Get the compiler architecture for a given platform
 */
export function getCompilerArchForPlatform(platformId: string): CompilerArch {
  // ESP32 uses Xtensa (ESP32, ESP32-S2, ESP32-S3) or RISC-V (ESP32-C3, ESP32-C6, ESP32-H2)
  if (platformId === "esp32") {
    return "xtensa"; // Default to Xtensa for ESP32 family
  }
  // ARM platforms: STM32, nRF52, RP2040
  return "arm";
}
