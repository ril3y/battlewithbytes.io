/**
 * WASM Loader
 *
 * Downloads and decompresses WASM compiler binaries.
 * Supports gzipped WASM files with progress reporting.
 */

import type {
  CompilerId,
  AvailableCompiler,
  AvailableLinker,
  DownloadProgress,
  WasmManifest,
} from "./types";
import { WasmCache } from "./WasmCache";

const cache = new WasmCache();

/**
 * Decompress gzip data using DecompressionStream API
 */
async function decompressGzip(compressed: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("gzip");
  const blob = new Blob([compressed as unknown as BlobPart]);
  const decompressedStream = blob.stream().pipeThrough(ds);

  const chunks: Uint8Array[] = [];
  const reader = decompressedStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combine chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Load WASM manifest from server
 * Supports both v1 (legacy) and v2 (dual versioning) manifest formats
 */
export async function loadManifest(
  manifestUrl: string = "/wasm/manifest.json",
): Promise<WasmManifest> {
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Failed to load WASM manifest: ${response.status}`);
  }
  const manifest = await response.json();

  // Normalize manifest to v2 format with backward compatibility
  return normalizeManifest(manifest);
}

/**
 * Normalize manifest to v2 format
 * Ensures backward compatibility with v1 manifests
 */
function normalizeManifest(manifest: Record<string, unknown>): WasmManifest {
  // Add schemaVersion if missing (v1 manifest)
  if (!manifest.schemaVersion) {
    manifest.schemaVersion = "1.0.0";
  }

  // Normalize compilers
  if (Array.isArray(manifest.compilers)) {
    manifest.compilers = manifest.compilers.map(normalizeCompiler);
  }

  // Normalize linkers
  if (Array.isArray(manifest.linkers)) {
    manifest.linkers = manifest.linkers.map(normalizeLinker);
  }

  return manifest as unknown as WasmManifest;
}

/**
 * Normalize compiler to v2 format
 */
function normalizeCompiler(compiler: Record<string, unknown>): AvailableCompiler {
  // Handle legacy 'version' field
  if (!compiler.softwareVersion && compiler.version) {
    compiler.softwareVersion = compiler.version as string;
  }

  // Default releaseVersion if missing
  if (!compiler.releaseVersion) {
    compiler.releaseVersion = "1.0.0";
  }

  // Generate fullVersion if missing
  if (!compiler.fullVersion) {
    compiler.fullVersion = `${compiler.softwareVersion}-r${compiler.releaseVersion}`;
  }

  // Ensure version alias exists
  if (!compiler.version) {
    compiler.version = compiler.fullVersion;
  }

  // Handle legacy 'hash' field -> hashes object
  if (!compiler.hashes && compiler.hash) {
    compiler.hashes = { compressed: compiler.hash as string };
  }

  // Ensure hash alias exists
  if (compiler.hashes && !compiler.hash) {
    compiler.hash = (compiler.hashes as { compressed: string }).compressed;
  }

  return compiler as unknown as AvailableCompiler;
}

/**
 * Normalize linker to v2 format
 */
function normalizeLinker(linker: Record<string, unknown>): AvailableLinker {
  // Same normalization as compiler
  if (!linker.softwareVersion && linker.version) {
    linker.softwareVersion = linker.version as string;
  }
  if (!linker.releaseVersion) {
    linker.releaseVersion = "1.0.0";
  }
  if (!linker.fullVersion) {
    linker.fullVersion = `${linker.softwareVersion}-r${linker.releaseVersion}`;
  }
  if (!linker.hashes && linker.hash) {
    linker.hashes = { compressed: linker.hash as string };
  }
  if (linker.hashes && !linker.hash) {
    linker.hash = (linker.hashes as { compressed: string }).compressed;
  }

  return linker as unknown as AvailableLinker;
}

/**
 * Download and cache a compiler WASM binary
 */
export async function downloadCompiler(
  compiler: AvailableCompiler,
  baseUrl: string,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<Uint8Array> {
  onProgress?.({
    stage: "starting",
    current: 0,
    total: compiler.size,
    message: `Preparing to download ${compiler.name}...`,
    percentage: 0,
  });

  // Check cache first using hash (with backward compat)
  const compilerHash = compiler.hash || compiler.hashes?.compressed;
  const isValid = compilerHash ? await cache.isValid(compiler.id, compilerHash) : false;
  if (isValid) {
    const cached = await cache.getWasm(compiler.id);
    if (cached) {
      onProgress?.({
        stage: "ready",
        current: cached.length,
        total: cached.length,
        message: `${compiler.name} loaded from cache`,
        percentage: 100,
      });
      return cached;
    }
  }

  // Download the WASM file
  const wasmUrl = `${baseUrl}/${compiler.files.wasm}`;
  console.log(`[WasmLoader] Downloading ${compiler.id} from ${wasmUrl}`);

  onProgress?.({
    stage: "downloading",
    current: 0,
    total: compiler.size,
    message: `Downloading ${compiler.name}...`,
    percentage: 0,
  });

  const response = await fetch(wasmUrl);
  if (!response.ok) {
    const error = `Failed to download ${compiler.name}: ${response.status}`;
    onProgress?.({
      stage: "error",
      current: 0,
      total: compiler.size,
      message: error,
      percentage: 0,
    });
    throw new Error(error);
  }

  const contentLength = parseInt(
    response.headers.get("content-length") || String(compiler.size),
    10,
  );
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response reader");
  }

  const chunks: Uint8Array[] = [];
  let receivedLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    const percentage = Math.round((receivedLength / contentLength) * 100);
    onProgress?.({
      stage: "downloading",
      current: receivedLength,
      total: contentLength,
      message: `Downloading ${compiler.name}... ${formatBytes(receivedLength)} / ${formatBytes(contentLength)}`,
      percentage,
    });
  }

  // Combine chunks
  const compressed = new Uint8Array(receivedLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }

  // Decompress if gzipped
  onProgress?.({
    stage: "decompressing",
    current: receivedLength,
    total: contentLength,
    message: `Decompressing ${compiler.name}...`,
    percentage: 100,
  });

  let wasm: Uint8Array;
  if (compiler.files.wasm.endsWith(".gz")) {
    wasm = await decompressGzip(compressed);
    console.log(
      `[WasmLoader] Decompressed ${compiler.id}: ${formatBytes(compressed.length)} -> ${formatBytes(wasm.length)}`,
    );
  } else {
    wasm = compressed;
  }

  // Cache the result
  onProgress?.({
    stage: "caching",
    current: wasm.length,
    total: wasm.length,
    message: `Caching ${compiler.name}...`,
    percentage: 100,
  });

  // Cache using fullVersion and hash (with backward compat)
  const version = compiler.fullVersion || compiler.version || compiler.softwareVersion;
  const hash = compiler.hash || compiler.hashes?.compressed || "";
  await cache.setWasm(compiler.id, wasm, version, hash);

  onProgress?.({
    stage: "ready",
    current: wasm.length,
    total: wasm.length,
    message: `${compiler.name} ready`,
    percentage: 100,
  });

  return wasm;
}

/**
 * Get cached WASM binary if available
 */
export async function getCachedCompiler(
  compilerId: CompilerId,
): Promise<Uint8Array | null> {
  return cache.getWasm(compilerId);
}

/**
 * Check if compiler is cached
 */
export async function isCompilerCached(
  compilerId: CompilerId,
  expectedHash?: string,
): Promise<boolean> {
  if (expectedHash) {
    return cache.isValid(compilerId, expectedHash);
  }
  const meta = await cache.getMetadata(compilerId);
  return meta !== null;
}

/**
 * Remove cached compiler
 */
export async function removeCompiler(compilerId: CompilerId): Promise<void> {
  await cache.remove(compilerId);
}

/**
 * Get storage statistics
 */
export async function getStorageStats() {
  return cache.getStorageStats();
}

/**
 * List installed compilers
 */
export async function listInstalled() {
  return cache.listInstalled();
}

/**
 * Clear all cached compilers
 */
export async function clearCache(): Promise<void> {
  await cache.clear();
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Get compiler info for display
 */
export function getCompilerDisplayInfo(compilerId: CompilerId): {
  name: string;
  description: string;
  architectures: string[];
} {
  const info: Record<
    CompilerId,
    { name: string; description: string; architectures: string[] }
  > = {
    "clang-arm": {
      name: "Clang ARM",
      description:
        "ARM Cortex-M compiler for STM32, nRF52, RP2040, and other ARM-based microcontrollers",
      architectures: [
        "Cortex-M0",
        "Cortex-M0+",
        "Cortex-M3",
        "Cortex-M4",
        "Cortex-M4F",
        "Cortex-M7",
        "Cortex-M33",
      ],
    },
    "clang-riscv": {
      name: "Clang RISC-V",
      description:
        "RISC-V compiler for ESP32-C3, ESP32-C6, ESP32-H2, and other RISC-V microcontrollers",
      architectures: ["RISC-V (RV32IMC)"],
    },
    "clang-xtensa": {
      name: "Clang Xtensa",
      description:
        "Xtensa compiler for ESP32, ESP32-S2, ESP32-S3 (built from Espressif LLVM fork)",
      architectures: ["Xtensa LX6", "Xtensa LX7"],
    },
  };

  return (
    info[compilerId] || { name: compilerId, description: "", architectures: [] }
  );
}
