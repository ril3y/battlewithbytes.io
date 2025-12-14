/**
 * Header Loader
 *
 * Downloads and extracts platform headers from tar.gz files.
 * Uses DecompressionStream API for gzip decompression.
 * Now integrates with TargetRegistry for URL resolution.
 */

import { HeaderCache } from "./HeaderCache";
import { TargetRegistry } from "../registry";

const cache = new HeaderCache();

export interface LoadHeadersProgress {
  stage:
    | "checking"
    | "downloading"
    | "extracting"
    | "caching"
    | "ready"
    | "error"
    | "warning";
  message: string;
  current?: number;
  total?: number;
}

/**
 * Parse POSIX tar format
 * Returns map of filename -> Uint8Array content
 */
function parseTar(data: Uint8Array): Map<string, Uint8Array> {
  const files = new Map<string, Uint8Array>();
  let offset = 0;

  while (offset < data.length - 512) {
    // Read header (512 bytes)
    const header = data.slice(offset, offset + 512);

    // Check for empty block (end of archive)
    if (header.every((b) => b === 0)) {
      break;
    }

    // Extract filename (bytes 0-99)
    let filename = "";
    for (let i = 0; i < 100 && header[i] !== 0; i++) {
      filename += String.fromCharCode(header[i]);
    }

    // Extract file size (bytes 124-135, octal string)
    let sizeStr = "";
    for (let i = 124; i < 136 && header[i] !== 0 && header[i] !== 32; i++) {
      sizeStr += String.fromCharCode(header[i]);
    }
    const fileSize = parseInt(sizeStr, 8) || 0;

    // Extract typeflag (byte 156)
    const typeflag = header[156];

    // Skip to data
    offset += 512;

    // Only process regular files (typeflag '0' or '\0')
    if ((typeflag === 48 || typeflag === 0) && fileSize > 0) {
      // Normalize path - remove leading ./
      let normalizedPath = filename;
      if (normalizedPath.startsWith("./")) {
        normalizedPath = normalizedPath.substring(2);
      }
      if (normalizedPath.startsWith("/")) {
        normalizedPath = normalizedPath.substring(1);
      }

      // Read file content
      const content = data.slice(offset, offset + fileSize);
      files.set("/" + normalizedPath, content);
    }

    // Advance to next header (512-byte aligned)
    offset += Math.ceil(fileSize / 512) * 512;
  }

  return files;
}

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
 * Load headers for a platform family
 * Downloads tar.gz, extracts, and caches
 */
export async function loadHeaders(
  platformId: string,
  familyId: string,
  headerUrl: string,
  checksum: string,
  onProgress?: (progress: LoadHeadersProgress) => void,
): Promise<Map<string, Uint8Array>> {
  onProgress?.({ stage: "checking", message: "Checking cache..." });

  // Check cache first
  const isValid = await cache.isValid(platformId, familyId, checksum);
  if (isValid) {
    const cached = await cache.getHeaders(platformId, familyId);
    if (cached) {
      onProgress?.({
        stage: "ready",
        message: `Loaded ${cached.size} headers from cache`,
      });
      return cached;
    }
  }

  // Download headers
  onProgress?.({ stage: "downloading", message: "Downloading headers..." });

  // Use URL as-is (registry provides full path)
  const response = await fetch(headerUrl);
  if (!response.ok) {
    // Handle missing headers gracefully - return empty set with warning
    if (response.status === 404) {
      console.warn(
        `[HeaderLoader] Headers not available for this platform: ${headerUrl}`,
      );
      onProgress?.({
        stage: "warning",
        message: `Headers not available for this platform. You can still write code, but platform-specific includes won't work.`,
      });
      // Return empty map so IDE can continue without headers
      return new Map<string, Uint8Array>();
    }
    throw new Error(`Failed to download headers: ${response.status}`);
  }

  const contentLength = parseInt(
    response.headers.get("content-length") || "0",
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

    if (contentLength > 0) {
      onProgress?.({
        stage: "downloading",
        message: `Downloading headers... ${(receivedLength / 1024).toFixed(0)} KB`,
        current: receivedLength,
        total: contentLength,
      });
    }
  }

  // Combine chunks
  const compressed = new Uint8Array(receivedLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }

  // Decompress
  onProgress?.({ stage: "extracting", message: "Extracting headers..." });
  const tarData = await decompressGzip(compressed);

  // Parse tar
  const headers = parseTar(tarData);

  // Cache the results
  onProgress?.({ stage: "caching", message: "Caching headers..." });
  await cache.setHeaders(platformId, familyId, headers, checksum);

  onProgress?.({ stage: "ready", message: `Loaded ${headers.size} headers` });
  return headers;
}

/**
 * Clear cached headers for a family
 */
export async function clearCachedHeaders(
  platformId: string,
  familyId: string,
): Promise<void> {
  await cache.removeFamily(platformId, familyId);
}

/**
 * Check if headers are cached
 */
export async function hasCachedHeaders(
  platformId: string,
  familyId: string,
  checksum: string,
): Promise<boolean> {
  return cache.isValid(platformId, familyId, checksum);
}

/**
 * Load headers using the TargetRegistry
 * Automatically fetches the header URL from the platform manifest
 */
export async function loadHeadersFromRegistry(
  platformId: string,
  familyId: string,
  onProgress?: (progress: LoadHeadersProgress) => void,
): Promise<Map<string, Uint8Array>> {
  onProgress?.({ stage: "checking", message: "Loading platform manifest..." });

  // Get platform manifest from registry
  const manifest = await TargetRegistry.getPlatformManifest(
    platformId,
    familyId,
  );

  if (!manifest) {
    console.warn(
      `[HeaderLoader] Platform not found in registry: ${platformId}/${familyId}`,
    );
    onProgress?.({
      stage: "warning",
      message: `Platform ${platformId}/${familyId} not found in registry. Headers not available.`,
    });
    return new Map<string, Uint8Array>();
  }

  // Get header URL from manifest
  const headerUrl = manifest.headers.url.startsWith("/")
    ? manifest.headers.url
    : `${TargetRegistry.getBaseUrl()}/${manifest.headers.url}`;

  const checksum = manifest.headers.hash || "unknown";

  console.log(`[HeaderLoader] Loading headers from registry:`, {
    platform: platformId,
    family: familyId,
    url: headerUrl,
  });

  // Use the standard loadHeaders function with registry-provided URL
  return loadHeaders(platformId, familyId, headerUrl, checksum, onProgress);
}
