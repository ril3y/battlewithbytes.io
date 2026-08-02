/**
 * Emscripten LLD Loader
 *
 * Uses an iframe to isolate each LLD execution since Emscripten
 * declares global variables that can't be redeclared.
 */

import { getBasePath } from "@battlewithbytes/utils";

export interface LldExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  outputFiles: Map<string, Uint8Array>;
}

let initialLoadDone = false;

/**
 * Execute LLD in an isolated iframe
 */
export async function executeLld(
  args: string[],
  files: Record<string, string | Uint8Array>,
  onStdout?: (text: string) => void,
  onStderr?: (text: string) => void,
): Promise<LldExecutionResult> {
  return new Promise((resolve, reject) => {
    // Create iframe for isolation
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) {
      iframe.remove();
      reject(new Error("Failed to create iframe"));
      return;
    }

    let stdout = "";
    let stderr = "";
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        setTimeout(() => iframe.remove(), 100);
      }
    };

    // Timeout after 120 seconds (linking can take longer)
    const timeout = setTimeout(() => {
      if (!resolved) {
        cleanup();
        reject(new Error("LLD execution timed out"));
      }
    }, 120000);

    // Configure Module via inline script injection
    const basePath = getBasePath();
    const baseUrl = window.location.origin + basePath;
    console.log("[EmscriptenLld] Base URL:", baseUrl, "(basePath:", basePath, ")");
    console.log("[EmscriptenLld] Args:", args);

    // First, inject Module configuration as inline script
    const moduleScript = iframeWindow.document.createElement("script");

    // Prepare file data for preRun
    const fileEntries: Array<{ path: string; data: string; binary: boolean }> =
      [];
    for (const [path, content] of Object.entries(files)) {
      if (typeof content === "string") {
        fileEntries.push({ path, data: content, binary: false });
      } else {
        // Convert Uint8Array to base64 for transmission
        const binary = Array.from(content)
          .map((b) => String.fromCharCode(b))
          .join("");
        fileEntries.push({ path, data: btoa(binary), binary: true });
      }
    }

    // List of output files to look for
    const oIndex = args.indexOf("-o");
    const outputPath =
      oIndex !== -1 && oIndex + 1 < args.length
        ? args[oIndex + 1]
        : "/firmware.elf";
    const potentialOutputs = [
      "/firmware.elf",
      "/output.elf",
      "/a.out",
      outputPath,
    ];

    // Debug: log input file info before sending to iframe
    for (const entry of fileEntries) {
      if (entry.binary) {
        try {
          const decoded = atob(entry.data);
          const firstBytes = decoded
            .slice(0, 4)
            .split("")
            .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
            .join(" ");
          console.log(
            `[EmscriptenLld] File ${entry.path}: ${decoded.length} bytes, magic: ${firstBytes}`,
          );
        } catch (e) {
          console.error(`[EmscriptenLld] Failed to decode ${entry.path}:`, e);
        }
      } else {
        console.log(
          `[EmscriptenLld] File ${entry.path}: ${entry.data.length} chars (text)`,
        );
      }
    }

    moduleScript.textContent = `
      var _lldExitCode = 0;
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
        thisProgram: 'ld.lld',
        noInitialRun: true,  // Don't auto-run, we'll call main manually
        _lldArgs: ${JSON.stringify(args)},

        locateFile: function(path) {
          var url = "${baseUrl}/wasm/clang_arm/" + path;
          console.log('[lld] locateFile:', path, '->', url);
          return url;
        },

        onRuntimeInitialized: function() {
          console.log('[lld] Runtime initialized');
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
          console.log('[lld] Writing input files...');
          for (var i = 0; i < _inputFiles.length; i++) {
            var file = _inputFiles[i];
            var data;

            if (file.binary) {
              var b64 = file.data;
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
            // Debug: show first 4 bytes (ELF magic should be 7f 45 4c 46)
            var magic = '';
            for (var m = 0; m < Math.min(4, data.length); m++) {
              magic += data[m].toString(16).padStart(2, '0') + ' ';
            }
            console.log('[lld] Wrote:', file.path, '(' + data.length + ' bytes, magic:', magic.trim() + ')');

            // Verify the file can be read back
            try {
              var verify = FS.readFile(file.path);
              console.log('[lld] Verify read:', file.path, '(' + verify.length + ' bytes)');
            } catch (verifyErr) {
              console.error('[lld] Verify failed:', verifyErr.message || verifyErr);
            }
          }

          // Call lld main with arguments
          console.log('[lld] Calling main with args:', Module._lldArgs);
          try {
            _lldExitCode = callMain(Module._lldArgs);
            console.log('[lld] main returned:', _lldExitCode);
          } catch (e) {
            console.error('[lld] main threw:', e.message || e);
            _lldExitCode = 1;
          }

          // Collect output files
          console.log('[lld] Collecting output files...');
          var outputFiles = {};
          for (var i = 0; i < _outputPaths.length; i++) {
            var path = _outputPaths[i];
            try {
              var data = FS.readFile(path);
              if (data && data.length > 0) {
                outputFiles[path] = Array.from(data);
                console.log('[lld] Output:', path, '(' + data.length + ' bytes)');
              }
            } catch(e) {
              // File doesn't exist
            }
          }

          // Send done message
          parent.postMessage({
            type: 'emscripten-done',
            exitCode: _lldExitCode,
            outputFiles: outputFiles
          }, '*');
        },

        print: function(text) {
          console.log('[lld stdout]', text);
          parent.postMessage({ type: 'emscripten-stdout', text: text }, '*');
        },

        printErr: function(text) {
          console.warn('[lld stderr]', text);
          parent.postMessage({ type: 'emscripten-stderr', text: text }, '*');
        },

        onExit: function(code) {
          console.log('[lld] onExit:', code);
          _lldExitCode = code;
        },

        quit: function(code, toThrow) {
          console.log('[lld] quit called with code:', code);
          _lldExitCode = code;
        },

        onAbort: function(what) {
          console.error('[lld] Abort:', what);
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
        console.log("[EmscriptenLld] Runtime initialized!");
      } else if (data.type === "emscripten-stdout") {
        stdout += data.text + "\n";
        onStdout?.(data.text);
        console.log("[lld stdout]", data.text);
      } else if (data.type === "emscripten-stderr") {
        stderr += data.text + "\n";
        onStderr?.(data.text);
        console.warn("[lld stderr]", data.text);
      } else if (data.type === "emscripten-abort") {
        console.error("[EmscriptenLld] Abort:", data.message);
        stderr += "ABORT: " + data.message + "\n";
      } else if (data.type === "emscripten-done") {
        console.log("[EmscriptenLld] Done, exit code:", data.exitCode);

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

    // Now load lld.js - use absolute URL
    const script = iframeWindow.document.createElement("script");
    script.src = `${baseUrl}/wasm/clang_arm/lld.js`;
    console.log("[EmscriptenLld] Loading script:", script.src);

    script.onload = () => {
      console.log("[EmscriptenLld] Script loaded successfully");
    };

    script.onerror = (e: Event | string) => {
      console.error("[EmscriptenLld] Script load error:", e);
      clearTimeout(timeout);
      window.removeEventListener("message", messageHandler);
      cleanup();
      reject(new Error("Failed to load lld.js"));
    };

    iframeWindow.document.head.appendChild(script);
  });
}

/**
 * Load the LLD module (initial verification)
 */
export async function loadLldModule(
  onProgress?: (progress: { stage: string; message: string }) => void,
): Promise<void> {
  if (initialLoadDone) {
    onProgress?.({ stage: "ready", message: "Linker ready" });
    return;
  }

  onProgress?.({ stage: "downloading", message: "Loading LLD linker..." });

  try {
    onProgress?.({ stage: "instantiating", message: "Initializing LLD..." });

    const result = await executeLld(["--version"], {});

    console.log("[EmscriptenLld] Version check result:", {
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      success: result.success,
    });

    // Check both stdout and stderr for lld output
    const combinedOutput = (result.stdout + result.stderr).toLowerCase();
    if (combinedOutput.includes("lld") || result.exitCode === 0) {
      initialLoadDone = true;
      onProgress?.({ stage: "ready", message: "LLD linker ready" });
    } else {
      throw new Error(
        `Version check failed (exit ${result.exitCode}): stdout="${result.stdout}" stderr="${result.stderr}"`,
      );
    }
  } catch (error) {
    onProgress?.({ stage: "error", message: `Failed to load: ${error}` });
    throw error;
  }
}

/**
 * Get linker version
 */
export async function getLldVersion(): Promise<string> {
  try {
    const result = await executeLld(["--version"], {});
    const lines = result.stdout.split("\n");
    return lines[0] || "LLD ARM";
  } catch (error) {
    console.error("[EmscriptenLld] Failed to get version:", error);
    return "Unknown version";
  }
}

/**
 * Check if initial load completed
 */
export function isLldLoaded(): boolean {
  return initialLoadDone;
}
