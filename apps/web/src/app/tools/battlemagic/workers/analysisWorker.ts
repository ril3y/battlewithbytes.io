/**
 * Web Worker for running firmware analysis in background thread
 * This prevents UI freezing during CPU-intensive WASM analysis
 */

import type { AnalysisResults, VectorTableEntry } from "../lib/wasmAnalyzer";

// Message types
interface AnalyzeMessage {
  type: "analyze";
  firmwareData: Uint8Array;
  baseAddress: number;
}

interface ProgressMessage {
  type: "progress";
  stage: string;
  progress: number;
}

interface ResultMessage {
  type: "result";
  results: AnalysisResults;
  vectorTable: VectorTableEntry[];
  analysisTimeMs: number;
}

interface ErrorMessage {
  type: "error";
  error: string;
}

type WorkerMessage = AnalyzeMessage;
type WorkerResponse = ProgressMessage | ResultMessage | ErrorMessage;

// WASM instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ArmAnalyzer: any = null;
let wasmInitialized = false;

async function initWasm() {
  if (!wasmInitialized) {
    try {
      // Import the glue code
      const glueModule = await import("../lib/battlemagic_analyzer_bg.js");

      // Fetch WASM from public directory
      const response = await fetch("/tools/battleforge/wasm/battlemagic_analyzer_bg.wasm");
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.statusText}`);
      }
      const wasmBytes = await response.arrayBuffer();

      // Instantiate WASM with the glue code as imports
      // Use type assertion to bypass strict typing on WebAssembly imports
      const imports = {
        "./battlemagic_analyzer_bg.js": glueModule,
        wbg: glueModule,
      };
      const result = await WebAssembly.instantiate(
        wasmBytes,
        imports as unknown as WebAssembly.Imports
      );

      // Set the WASM instance
      if (glueModule.__wbg_set_wasm) {
        glueModule.__wbg_set_wasm(result.instance.exports);
      }

      // Start the module if needed
      const startFn = result.instance.exports.__wbindgen_start;
      if (typeof startFn === "function") {
        startFn();
      }

      ArmAnalyzer = glueModule.ArmAnalyzer;
      wasmInitialized = true;
      self.postMessage({ type: "ready" });
    } catch (error) {
      throw new Error(
        `Failed to initialize WASM: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  try {
    if (message.type === "analyze") {
      // Ensure WASM is initialized
      if (!wasmInitialized) {
        await initWasm();
      }

      const { firmwareData, baseAddress } = message;

      // Create analyzer
      const analyzer = new ArmAnalyzer(baseAddress);

      // Run analysis with progress callbacks
      const startTime = performance.now();

      const results = analyzer.analyze_from_bytes_with_progress(
        firmwareData,
        (stage: string, progress: number) => {
          // Send progress updates to main thread
          const progressMsg: ProgressMessage = {
            type: "progress",
            stage,
            progress,
          };
          self.postMessage(progressMsg);
        },
      );

      const endTime = performance.now();
      const analysisTimeMs = Math.round(endTime - startTime);

      // Get vector table (try from results first, then from analyzer)
      let vectorTable: VectorTableEntry[] = [];
      if (results.vector_table) {
        vectorTable = results.vector_table;
      } else {
        try {
          vectorTable = analyzer.get_vector_table();
        } catch (error) {
          console.warn("[Worker] Could not get vector table:", error);
          vectorTable = [];
        }
      }

      // Send results back to main thread
      const resultMsg: ResultMessage = {
        type: "result",
        results,
        vectorTable,
        analysisTimeMs,
      };
      self.postMessage(resultMsg);

      // Clean up
      analyzer.free();
    }
  } catch (error) {
    // Send error back to main thread
    const errorMsg: ErrorMessage = {
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(errorMsg);
  }
};

// Initialize WASM on worker startup
initWasm().catch((err) => {
  console.error("Failed to initialize WASM in worker:", err);
  const errorMsg: ErrorMessage = {
    type: "error",
    error: "Failed to initialize WASM module",
  };
  self.postMessage(errorMsg);
});
