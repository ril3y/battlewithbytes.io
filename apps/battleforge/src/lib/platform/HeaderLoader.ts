/**
 * Header Loader
 *
 * Downloads and extracts platform headers from tar.gz files.
 * Uses DecompressionStream API for gzip decompression.
 * Now integrates with TargetRegistry for URL resolution.
 */

import { HeaderCache } from "./HeaderCache";

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
 * Load headers using the platform manifest
 * Automatically fetches the manifest and determines how to load headers (GitHub vs tar.gz)
 */
export async function loadHeadersFromRegistry(
  platformId: string,
  familyId: string,
  onProgress?: (progress: LoadHeadersProgress) => void,
): Promise<Map<string, Uint8Array>> {
  onProgress?.({ stage: "checking", message: "Loading platform manifest..." });

  // Load manifest directly from known path pattern
  const manifestUrl = `/boards/platforms/${platformId}/${familyId}/manifest.json`;
  console.log(`[HeaderLoader] Loading manifest from ${manifestUrl}`);

  let manifest: { headers?: HeadersConfig } | null = null;
  try {
    const response = await fetch(manifestUrl);
    if (response.ok) {
      manifest = await response.json();
    }
  } catch (err) {
    console.warn(`[HeaderLoader] Failed to load manifest:`, err);
  }

  if (!manifest || !manifest.headers) {
    console.warn(
      `[HeaderLoader] Platform manifest not found: ${platformId}/${familyId}`,
    );
    onProgress?.({
      stage: "warning",
      message: `Platform ${platformId}/${familyId} not found. Headers not available.`,
    });
    return new Map<string, Uint8Array>();
  }

  // Check if manifest uses new GitHub source format
  const headersConfig = manifest.headers;
  if (headersConfig.source?.startsWith("github:")) {
    console.log(`[HeaderLoader] Loading headers from GitHub:`, {
      platform: platformId,
      family: familyId,
      source: headersConfig.source,
    });
    return loadHeadersFromGitHub(platformId, familyId, headersConfig, onProgress);
  }

  // Legacy: Get header URL from manifest (tar.gz)
  const headerUrl = headersConfig.url?.startsWith("/")
    ? headersConfig.url
    : `/boards/${headersConfig.url}`;

  const checksum = headersConfig.hash || "unknown";

  console.log(`[HeaderLoader] Loading headers from tar.gz:`, {
    platform: platformId,
    family: familyId,
    url: headerUrl,
  });

  // Use the standard loadHeaders function with registry-provided URL
  return loadHeaders(platformId, familyId, headerUrl, checksum, onProgress);
}

/**
 * Header source configuration from manifest
 */
interface HeadersConfig {
  // Legacy tar.gz format
  url?: string;
  hash?: string;
  includes?: string[];

  // New GitHub source format
  source?: string;  // "github:owner/repo" or "github:owner/repo/path"
  ref?: string;     // Branch/tag/commit (default: "master")
  files?: string[]; // Specific files to fetch

  // Additional sources (e.g., CMSIS core)
  cmsis?: {
    source: string;
    ref?: string;
    files?: string[];
  };
}

/**
 * Fetch a single file from GitHub raw content
 */
async function fetchGitHubFile(
  owner: string,
  repo: string,
  ref: string,
  path: string,
): Promise<Uint8Array | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[HeaderLoader] Failed to fetch ${path}: ${response.status}`);
      return null;
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (err) {
    console.warn(`[HeaderLoader] Error fetching ${path}:`, err);
    return null;
  }
}

/**
 * Parse GitHub source string
 * Format: "github:owner/repo" or "github:owner/repo/path/to/dir"
 */
function parseGitHubSource(source: string): { owner: string; repo: string; basePath: string } | null {
  if (!source.startsWith("github:")) return null;

  const parts = source.substring(7).split("/");
  if (parts.length < 2) return null;

  return {
    owner: parts[0],
    repo: parts[1],
    basePath: parts.slice(2).join("/"),
  };
}

/**
 * Default STM32 header files needed for compilation
 */
const STM32_HEADER_FILES: Record<string, string[]> = {
  f1: [
    "stm32f1xx.h",
    "stm32f103xb.h",
    "stm32f103xe.h",
    "system_stm32f1xx.h",
  ],
  f4: [
    "stm32f4xx.h",
    "stm32f407xx.h",
    "stm32f411xe.h",
    "stm32f401xc.h",
    "system_stm32f4xx.h",
  ],
  l4: [
    "stm32l4xx.h",
    "stm32l476xx.h",
    "stm32l432xx.h",
    "system_stm32l4xx.h",
  ],
  h7: [
    "stm32h7xx.h",
    "stm32h743xx.h",
    "stm32h750xx.h",
    "system_stm32h7xx.h",
  ],
};

/**
 * CMSIS core header files
 */
const CMSIS_CORE_FILES = [
  "cmsis_compiler.h",
  "cmsis_gcc.h",
  "cmsis_version.h",
  "core_cm3.h",
  "core_cm4.h",
  "core_cm7.h",
  "mpu_armv7.h",
];

/**
 * Freestanding libc headers from Clang
 * These are required even with -ffreestanding for basic types
 * Source: llvm-project/clang/lib/Headers/
 */
const FREESTANDING_LIBC_FILES = [
  "stdint.h",
  "stddef.h",
  "stdbool.h",
  "stdarg.h",
  "limits.h",
  "float.h",
];

/**
 * Load headers from GitHub repositories (modm-io style)
 */
async function loadHeadersFromGitHub(
  platformId: string,
  familyId: string,
  config: HeadersConfig,
  onProgress?: (progress: LoadHeadersProgress) => void,
): Promise<Map<string, Uint8Array>> {
  const headers = new Map<string, Uint8Array>();

  // Check cache first
  const cacheKey = `${config.source}@${config.ref || "master"}`;
  const isValid = await cache.isValid(platformId, familyId, cacheKey);
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

  // Parse main source
  const parsed = parseGitHubSource(config.source || "");
  if (!parsed) {
    onProgress?.({
      stage: "error",
      message: `Invalid GitHub source: ${config.source}`,
    });
    return headers;
  }

  const { owner, repo, basePath } = parsed;
  const ref = config.ref || "master";

  // Determine files to fetch
  let files = config.files;
  if (!files || files.length === 0) {
    // Use defaults based on platform/family
    if (platformId === "stm32") {
      files = STM32_HEADER_FILES[familyId] || STM32_HEADER_FILES.f1;
    } else {
      onProgress?.({
        stage: "warning",
        message: `No header files specified for ${platformId}/${familyId}`,
      });
      return headers;
    }
  }

  onProgress?.({
    stage: "downloading",
    message: `Downloading ${files.length} header files...`,
    current: 0,
    total: files.length,
  });

  // Fetch device headers
  let fetched = 0;
  for (const file of files) {
    const filePath = basePath ? `${basePath}/${file}` : file;
    const content = await fetchGitHubFile(owner, repo, ref, filePath);
    if (content) {
      // Store under /device/ path for include resolution
      headers.set(`/device/${file}`, content);
      fetched++;
      onProgress?.({
        stage: "downloading",
        message: `Downloaded ${file}`,
        current: fetched,
        total: files.length + CMSIS_CORE_FILES.length,
      });
    }
  }

  // Fetch CMSIS core headers
  if (config.cmsis) {
    const cmsisSource = parseGitHubSource(config.cmsis.source);
    if (cmsisSource) {
      const cmsisRef = config.cmsis.ref || "master";
      const cmsisFiles = config.cmsis.files || CMSIS_CORE_FILES;

      for (const file of cmsisFiles) {
        const filePath = cmsisSource.basePath ? `${cmsisSource.basePath}/${file}` : file;
        const content = await fetchGitHubFile(cmsisSource.owner, cmsisSource.repo, cmsisRef, filePath);
        if (content) {
          headers.set(`/cmsis/${file}`, content);
          fetched++;
          onProgress?.({
            stage: "downloading",
            message: `Downloaded ${file}`,
            current: fetched,
            total: files.length + cmsisFiles.length,
          });
        }
      }
    }
  } else {
    // Default: fetch CMSIS core from ARM repo
    onProgress?.({
      stage: "downloading",
      message: "Downloading CMSIS core headers...",
    });

    for (const file of CMSIS_CORE_FILES) {
      const content = await fetchGitHubFile(
        "ARM-software",
        "CMSIS_5",
        "develop",
        `CMSIS/Core/Include/${file}`,
      );
      if (content) {
        headers.set(`/cmsis/${file}`, content);
        fetched++;
      }
    }
  }

  if (headers.size === 0) {
    onProgress?.({
      stage: "warning",
      message: "No headers could be downloaded. Check network connection.",
    });
    return headers;
  }

  // Cache the results
  onProgress?.({ stage: "caching", message: "Caching headers..." });
  await cache.setHeaders(platformId, familyId, headers, cacheKey);

  onProgress?.({
    stage: "ready",
    message: `Loaded ${headers.size} headers from GitHub`,
  });

  return headers;
}
