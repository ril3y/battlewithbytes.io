/**
 * Framework Manager
 *
 * Downloads, caches, and loads framework core files on-demand.
 * Handles framework definitions and their associated core files (e.g., Arduino cores).
 */

import type { FrameworkId, Framework } from "../platform/types";
import { FrameworkCache } from "./FrameworkCache";
import { withBasePath } from "../utils/basePath";

const cache = new FrameworkCache();

export interface LoadFrameworkProgress {
  stage:
    | "checking"
    | "downloading"
    | "extracting"
    | "caching"
    | "ready"
    | "error";
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

export class FrameworkManager {
  private frameworkCache: Map<string, Framework> = new Map();

  /**
   * Load framework definition from JSON
   */
  async loadFramework(
    frameworkId: FrameworkId,
    platformId: string,
    familyId: string,
  ): Promise<Framework | null> {
    // Check memory cache first
    const cacheKey = `${frameworkId}/${platformId}/${familyId}`;
    const cached = this.frameworkCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch framework definition from server
    try {
      const url = withBasePath(`/boards/platforms/${platformId}/${familyId}/frameworks/${frameworkId}.json`);
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[FrameworkManager] Framework not found: ${url}`);
        return null;
      }

      const framework = (await response.json()) as Framework;

      // Store in memory cache
      this.frameworkCache.set(cacheKey, framework);

      console.log(
        `[FrameworkManager] Loaded framework definition: ${frameworkId}`,
      );
      return framework;
    } catch (error) {
      console.error(
        `[FrameworkManager] Failed to load framework ${frameworkId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Download and extract framework core files
   */
  async loadCoreFiles(
    framework: Framework,
    platformId: string,
    familyId: string,
    onProgress?: (progress: LoadFrameworkProgress) => void,
  ): Promise<Map<string, Uint8Array>> {
    const { id: frameworkId, coreUrl, coreChecksum } = framework;

    // Framework must have core files defined
    if (!coreUrl || !coreChecksum) {
      throw new Error(
        `Framework ${frameworkId} does not have core files defined`,
      );
    }

    onProgress?.({ stage: "checking", message: "Checking cache..." });

    // Check cache first
    const isValid = await cache.isValid(
      frameworkId,
      platformId,
      familyId,
      coreChecksum,
    );
    if (isValid) {
      const cached = await cache.getCoreFiles(
        frameworkId,
        platformId,
        familyId,
      );
      if (cached) {
        onProgress?.({
          stage: "ready",
          message: `Loaded ${cached.size} files from cache`,
        });
        return cached;
      }
    }

    // Download core files
    onProgress?.({
      stage: "downloading",
      message: "Downloading framework core files...",
    });

    const response = await fetch(withBasePath(`/boards/platforms/${coreUrl}`));
    if (!response.ok) {
      throw new Error(
        `Failed to download framework core files: ${response.status}`,
      );
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
        const percent = Math.round((receivedLength / contentLength) * 100);
        onProgress?.({
          stage: "downloading",
          message: `Downloading... ${(receivedLength / 1024).toFixed(0)} KB`,
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
    onProgress?.({
      stage: "extracting",
      message: "Extracting framework files...",
    });
    const tarData = await decompressGzip(compressed);

    // Parse tar
    const files = parseTar(tarData);

    // Cache the results
    onProgress?.({ stage: "caching", message: "Caching framework files..." });
    await cache.setCoreFiles(
      frameworkId,
      platformId,
      familyId,
      files,
      coreChecksum,
    );

    onProgress?.({
      stage: "ready",
      message: `Loaded ${files.size} framework files`,
    });
    return files;
  }

  /**
   * Check if framework is cached
   */
  async isFrameworkCached(
    frameworkId: FrameworkId,
    platformId: string,
    familyId: string,
    checksum: string,
  ): Promise<boolean> {
    return cache.isValid(frameworkId, platformId, familyId, checksum);
  }

  /**
   * Clear framework cache
   */
  async clearCache(
    frameworkId?: FrameworkId,
    platformId?: string,
    familyId?: string,
  ): Promise<void> {
    if (frameworkId && platformId && familyId) {
      // Clear specific framework
      await cache.removeFramework(frameworkId, platformId, familyId);
      this.frameworkCache.delete(`${frameworkId}/${platformId}/${familyId}`);
    } else {
      // Clear all frameworks
      await cache.clear();
      this.frameworkCache.clear();
    }
  }

  /**
   * Get cache size for a framework
   */
  async getCacheSize(
    frameworkId: FrameworkId,
    platformId: string,
    familyId: string,
  ): Promise<number> {
    return cache.getCacheSize(frameworkId, platformId, familyId);
  }

  /**
   * Get total cache size for all frameworks
   */
  async getTotalCacheSize(): Promise<number> {
    return cache.getTotalSize();
  }

  /**
   * List all cached frameworks
   */
  async listCached(): Promise<
    Array<{
      frameworkId: FrameworkId;
      platformId: string;
      familyId: string;
      size: number;
      timestamp: number;
    }>
  > {
    return cache.listCached();
  }
}

/**
 * Singleton instance
 */
export const frameworkManager = new FrameworkManager();

/**
 * Clear cached framework files
 */
export async function clearCachedFramework(
  frameworkId: FrameworkId,
  platformId: string,
  familyId: string,
): Promise<void> {
  await frameworkManager.clearCache(frameworkId, platformId, familyId);
}

/**
 * Check if framework files are cached
 */
export async function hasCachedFramework(
  frameworkId: FrameworkId,
  platformId: string,
  familyId: string,
  checksum: string,
): Promise<boolean> {
  return frameworkManager.isFrameworkCached(
    frameworkId,
    platformId,
    familyId,
    checksum,
  );
}
