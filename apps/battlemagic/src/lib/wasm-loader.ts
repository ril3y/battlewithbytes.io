"use client";

/**
 * Lazy load WASM module with chunk isolation
 */
export async function loadBattleMagicCore() {
  try {
    // Import the glue code from local copy
    const glueModule = await import(
      /* webpackChunkName: "battlemagic-core-glue" */
      /* webpackMode: "lazy" */
      "./battlemagic_core_bg.js"
    );

    // Fetch WASM from public directory
    const response = await fetch("/wasm/battlemagic_core_bg.wasm");
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.statusText}`);
    }
    const wasmBytes = await response.arrayBuffer();

    // Instantiate WASM with the glue code as imports
    const result = await WebAssembly.instantiate(wasmBytes, {
      "./battlemagic_core_bg.js": glueModule,
      wbg: glueModule,
    });

    // Set the WASM instance
    if (glueModule.__wbg_set_wasm) {
      glueModule.__wbg_set_wasm(result.instance.exports);
    }

    // Start the module
    const startFn = result.instance.exports.__wbindgen_start;
    if (typeof startFn === "function") {
      startFn();
    }

    return glueModule;
  } catch (error) {
    console.error("Failed to load BattleMagic WASM core:", error);
    throw new Error(
      "Failed to initialize BattleMagic. Your browser may not support WebAssembly or the module failed to load.",
    );
  }
}

/**
 * Check if WebAssembly is supported
 */
export function isWasmSupported(): boolean {
  try {
    if (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    ) {
      const testModule = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00),
      );

      if (testModule instanceof WebAssembly.Module) {
        return true;
      }
    }
  } catch {
    // WebAssembly not supported
  }

  return false;
}

/**
 * Get user-friendly error message for WASM loading failures
 */
export function getWasmErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes("networkerror") || message.includes("fetch")) {
    return "Network error loading BattleMagic. Please check your connection and try again.";
  }

  if (message.includes("memory")) {
    return "Insufficient memory to load BattleMagic. Try closing other browser tabs.";
  }

  if (message.includes("compile") || message.includes("instantiate")) {
    return "Your browser encountered an error initializing BattleMagic. Try refreshing the page.";
  }

  if (!isWasmSupported()) {
    return "Your browser does not support WebAssembly, which is required for BattleMagic. Please use a modern browser like Chrome, Firefox, Safari, or Edge.";
  }

  return "An unexpected error occurred loading BattleMagic. Please try refreshing the page.";
}
