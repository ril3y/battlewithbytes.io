"use client";

/**
 * Load the WASM analyzer module using script tag approach
 * This is the most reliable way for Next.js as it avoids webpack bundling issues
 */

export interface WasmAnalyzerModule {
  ArmAnalyzer: new (baseAddress: number) => {
    analyze_from_disasm(instructions: unknown): unknown;
    get_xrefs_to(address: number): unknown[];
    get_xrefs_from(address: number): unknown[];
    xref_count(): number;
    is_analyzed(): boolean;
    reset(): void;
  };
}

declare global {
  interface Window {
    __wasmAnalyzer?: WasmAnalyzerModule;
    __wasmAnalyzerLoaded?: boolean;
  }
}

export async function loadWasmAnalyzer(): Promise<WasmAnalyzerModule> {
  console.log("[loadWasmAnalyzer] Starting load process...");

  // Return cached module if already loaded
  if (window.__wasmAnalyzer) {
    console.log("[loadWasmAnalyzer] Returning cached module");
    return window.__wasmAnalyzer;
  }

  // If already loading, wait for it
  if (window.__wasmAnalyzerLoaded === false) {
    console.log("[loadWasmAnalyzer] Already loading, waiting...");
    // Wait up to 5 seconds for load to complete
    for (let i = 0; i < 50; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (window.__wasmAnalyzer) {
        console.log("[loadWasmAnalyzer] Load completed while waiting");
        return window.__wasmAnalyzer;
      }
    }
    throw new Error("WASM module load timeout while waiting");
  }

  console.log("[loadWasmAnalyzer] Initiating new load...");
  // Mark as loading
  window.__wasmAnalyzerLoaded = false;

  // Create and inject script tag
  const script = document.createElement("script");
  script.type = "module";
  script.id = "wasm-analyzer-loader";

  // Remove any existing loader script
  const existing = document.getElementById("wasm-analyzer-loader");
  if (existing) {
    existing.remove();
  }

  script.textContent = `
    import init, { ArmAnalyzer } from '/tools/battleforge/wasm/battlemagic_analyzer.js';

    try {
      await init('/tools/battleforge/wasm/battlemagic_analyzer_bg.wasm');
      window.__wasmAnalyzer = { ArmAnalyzer };
      window.__wasmAnalyzerLoaded = true;
      console.log('[WASM] Analyzer loaded successfully');
    } catch (error) {
      console.error('[WASM] Failed to load:', error);
      window.__wasmAnalyzerLoaded = undefined;
      throw error;
    }
  `;

  document.head.appendChild(script);
  console.log("[loadWasmAnalyzer] Script tag injected, waiting for load...");

  // Wait for module to load (max 5 seconds)
  for (let i = 0; i < 50; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (window.__wasmAnalyzer) {
      console.log(
        "[loadWasmAnalyzer] Module loaded successfully!",
        window.__wasmAnalyzer,
      );
      return window.__wasmAnalyzer;
    }

    // Check if loading failed
    if (window.__wasmAnalyzerLoaded === undefined) {
      console.error("[loadWasmAnalyzer] Loading failed");
      throw new Error("WASM module failed to load");
    }

    if (i % 10 === 0) {
      console.log(`[loadWasmAnalyzer] Still waiting... (${i * 100}ms)`);
    }
  }

  console.error("[loadWasmAnalyzer] Timeout after 5 seconds");
  throw new Error("WASM module load timeout");
}

/**
 * Check if WASM analyzer is loaded
 */
export function isWasmAnalyzerLoaded(): boolean {
  return !!window.__wasmAnalyzer;
}

/**
 * Clear cached WASM analyzer (for testing/debugging)
 */
export function clearWasmAnalyzer(): void {
  delete window.__wasmAnalyzer;
  delete window.__wasmAnalyzerLoaded;

  const script = document.getElementById("wasm-analyzer-loader");
  if (script) {
    script.remove();
  }
}
