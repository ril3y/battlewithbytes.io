/**
 * Source Fetcher
 *
 * Fetches platform source files (headers, startup, linker scripts) from GitHub
 * repositories as defined in v2 platform manifests.
 */

import type {
  PlatformManifestV2,
  SourceDefinition,
  DeviceDefinitionV2,
  DeviceSourceFiles,
} from "./types";
import { SourceCache } from "./SourceCache";

export interface FetchProgress {
  stage: "checking" | "downloading" | "caching" | "ready" | "error" | "warning";
  message: string;
  current?: number;
  total?: number;
}

/**
 * Parse GitHub source string
 * Format: "github:owner/repo"
 */
function parseGitHubRepo(repo: string): { owner: string; repo: string } | null {
  if (!repo.startsWith("github:")) return null;

  const parts = repo.substring(7).split("/");
  if (parts.length < 2) return null;

  return {
    owner: parts[0],
    repo: parts[1],
  };
}

/**
 * Fetch a single file from GitHub raw content
 */
async function fetchGitHubFile(
  owner: string,
  repo: string,
  ref: string,
  path: string
): Promise<Uint8Array | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[SourceFetcher] Failed to fetch ${path}: ${response.status}`);
      return null;
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (err) {
    console.warn(`[SourceFetcher] Error fetching ${path}:`, err);
    return null;
  }
}

/**
 * Fetch a text file from GitHub
 */
async function fetchGitHubTextFile(
  owner: string,
  repo: string,
  ref: string,
  path: string
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[SourceFetcher] Failed to fetch ${path}: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (err) {
    console.warn(`[SourceFetcher] Error fetching ${path}:`, err);
    return null;
  }
}

// Singleton cache instance
const sourceCache = new SourceCache();

/**
 * SourceFetcher class for fetching platform files from GitHub
 */
export class SourceFetcher {
  private manifest: PlatformManifestV2;

  constructor(manifest: PlatformManifestV2) {
    this.manifest = manifest;
  }

  /**
   * Get the cache key for this manifest version
   */
  private getCacheKey(): string {
    return `${this.manifest.platform}/${this.manifest.family}@${this.manifest.version}`;
  }

  /**
   * Fetch all header files defined in the manifest
   */
  async fetchHeaders(
    onProgress?: (progress: FetchProgress) => void
  ): Promise<Map<string, Uint8Array>> {
    const headers = new Map<string, Uint8Array>();
    const cacheKey = this.getCacheKey();

    // Check cache first
    onProgress?.({ stage: "checking", message: "Checking cache..." });
    const cached = await sourceCache.getHeaders(
      this.manifest.platform,
      this.manifest.family
    );
    if (cached && cached.size > 0) {
      const isValid = await sourceCache.isValid(
        this.manifest.platform,
        this.manifest.family,
        cacheKey
      );
      if (isValid) {
        onProgress?.({
          stage: "ready",
          message: `Loaded ${cached.size} headers from cache`,
        });
        return cached;
      }
    }

    // Fetch from each source
    const totalFiles = this.countTotalHeaderFiles();
    let fetched = 0;

    for (const [sourceName, source] of Object.entries(this.manifest.sources)) {
      const parsed = parseGitHubRepo(source.repo);
      if (!parsed) {
        console.warn(`[SourceFetcher] Invalid repo format: ${source.repo}`);
        continue;
      }

      const ref = source.ref || "master";
      const headerFiles = source.files?.headers || [];
      const headersPath = source.paths?.headers || "";

      for (const file of headerFiles) {
        const filePath = headersPath ? `${headersPath}/${file}` : file;
        onProgress?.({
          stage: "downloading",
          message: `Downloading ${file}...`,
          current: fetched,
          total: totalFiles,
        });

        const content = await fetchGitHubFile(
          parsed.owner,
          parsed.repo,
          ref,
          filePath
        );
        if (content) {
          // Store under appropriate path based on source name
          const storePath =
            sourceName === "cmsis_core" ? `/cmsis/${file}` : `/device/${file}`;
          headers.set(storePath, content);
          fetched++;
        }
      }
    }

    // Fetch freestanding C headers from LLVM
    const freestandingFiles = [
      "stdint.h",
      "stddef.h",
      "stdbool.h",
      "stdarg.h",
      "limits.h",
      "float.h",
    ];

    onProgress?.({
      stage: "downloading",
      message: "Downloading freestanding C headers...",
    });

    for (const file of freestandingFiles) {
      const content = await fetchGitHubFile(
        "llvm",
        "llvm-project",
        "main",
        `clang/lib/Headers/${file}`
      );
      if (content) {
        headers.set(`/include/${file}`, content);
      }
    }

    // Cache the results
    if (headers.size > 0) {
      onProgress?.({ stage: "caching", message: "Caching headers..." });
      await sourceCache.setHeaders(
        this.manifest.platform,
        this.manifest.family,
        headers,
        cacheKey
      );
    }

    onProgress?.({
      stage: "ready",
      message: `Loaded ${headers.size} headers from GitHub`,
    });

    return headers;
  }

  /**
   * Fetch device-specific files (startup, linker, system)
   */
  async fetchDeviceFiles(
    device: DeviceDefinitionV2,
    onProgress?: (progress: FetchProgress) => void
  ): Promise<DeviceSourceFiles> {
    const result: DeviceSourceFiles = {};

    if (!device.files) {
      onProgress?.({
        stage: "warning",
        message: `No device files specified for ${device.id}`,
      });
      return result;
    }

    // Find the cmsis source (primary source for startup/linker)
    const cmsisSource = this.manifest.sources.cmsis;
    if (!cmsisSource) {
      onProgress?.({
        stage: "warning",
        message: "No cmsis source defined in manifest",
      });
      return result;
    }

    const parsed = parseGitHubRepo(cmsisSource.repo);
    if (!parsed) {
      onProgress?.({
        stage: "error",
        message: `Invalid repo format: ${cmsisSource.repo}`,
      });
      return result;
    }

    const ref = cmsisSource.ref || "master";
    let totalFiles = 0;
    let fetched = 0;

    if (device.files.startup) totalFiles++;
    if (device.files.linker) totalFiles++;
    if (device.files.header) totalFiles++;

    // Also count system files
    const systemFiles = cmsisSource.files?.system || [];
    totalFiles += systemFiles.length;

    // Fetch startup file
    if (device.files.startup && cmsisSource.paths?.startup) {
      const startupPath = `${cmsisSource.paths.startup}/${device.files.startup}`;
      onProgress?.({
        stage: "downloading",
        message: `Downloading ${device.files.startup}...`,
        current: fetched,
        total: totalFiles,
      });

      const content = await fetchGitHubFile(
        parsed.owner,
        parsed.repo,
        ref,
        startupPath
      );
      if (content) {
        result.startup = content;
        fetched++;
      }
    }

    // Fetch linker script
    if (device.files.linker && cmsisSource.paths?.linker) {
      const linkerPath = `${cmsisSource.paths.linker}/${device.files.linker}`;
      onProgress?.({
        stage: "downloading",
        message: `Downloading ${device.files.linker}...`,
        current: fetched,
        total: totalFiles,
      });

      const content = await fetchGitHubTextFile(
        parsed.owner,
        parsed.repo,
        ref,
        linkerPath
      );
      if (content) {
        result.linker = content;
        fetched++;
      }
    }

    // Fetch device header if specified
    if (device.files.header && cmsisSource.paths?.headers) {
      const headerPath = `${cmsisSource.paths.headers}/${device.files.header}`;
      onProgress?.({
        stage: "downloading",
        message: `Downloading ${device.files.header}...`,
        current: fetched,
        total: totalFiles,
      });

      const content = await fetchGitHubFile(
        parsed.owner,
        parsed.repo,
        ref,
        headerPath
      );
      if (content) {
        result.header = content;
        fetched++;
      }
    }

    // Fetch system files (e.g., system_stm32f1xx.c)
    if (cmsisSource.paths?.system && systemFiles.length > 0) {
      for (const file of systemFiles) {
        const systemPath = `${cmsisSource.paths.system}/${file}`;
        onProgress?.({
          stage: "downloading",
          message: `Downloading ${file}...`,
          current: fetched,
          total: totalFiles,
        });

        const content = await fetchGitHubFile(
          parsed.owner,
          parsed.repo,
          ref,
          systemPath
        );
        if (content) {
          result.system = content;
          fetched++;
        }
      }
    }

    onProgress?.({
      stage: "ready",
      message: `Loaded device files for ${device.id}`,
    });

    return result;
  }

  /**
   * Fetch just the linker script for a device
   */
  async fetchLinkerScript(
    device: DeviceDefinitionV2,
    onProgress?: (progress: FetchProgress) => void
  ): Promise<string | null> {
    if (!device.files?.linker) {
      onProgress?.({
        stage: "warning",
        message: `No linker script specified for ${device.id}`,
      });
      return null;
    }

    const cmsisSource = this.manifest.sources.cmsis;
    if (!cmsisSource?.paths?.linker) {
      onProgress?.({
        stage: "warning",
        message: "No linker path in cmsis source",
      });
      return null;
    }

    const parsed = parseGitHubRepo(cmsisSource.repo);
    if (!parsed) return null;

    const ref = cmsisSource.ref || "master";
    const linkerPath = `${cmsisSource.paths.linker}/${device.files.linker}`;

    onProgress?.({
      stage: "downloading",
      message: `Downloading ${device.files.linker}...`,
    });

    const content = await fetchGitHubTextFile(
      parsed.owner,
      parsed.repo,
      ref,
      linkerPath
    );

    if (content) {
      onProgress?.({
        stage: "ready",
        message: `Loaded linker script for ${device.id}`,
      });
    } else {
      onProgress?.({
        stage: "warning",
        message: `Could not load linker script ${device.files.linker}`,
      });
    }

    return content;
  }

  /**
   * Fetch just the startup file for a device
   */
  async fetchStartupFile(
    device: DeviceDefinitionV2,
    onProgress?: (progress: FetchProgress) => void
  ): Promise<Uint8Array | null> {
    if (!device.files?.startup) {
      onProgress?.({
        stage: "warning",
        message: `No startup file specified for ${device.id}`,
      });
      return null;
    }

    const cmsisSource = this.manifest.sources.cmsis;
    if (!cmsisSource?.paths?.startup) {
      onProgress?.({
        stage: "warning",
        message: "No startup path in cmsis source",
      });
      return null;
    }

    const parsed = parseGitHubRepo(cmsisSource.repo);
    if (!parsed) return null;

    const ref = cmsisSource.ref || "master";
    const startupPath = `${cmsisSource.paths.startup}/${device.files.startup}`;

    onProgress?.({
      stage: "downloading",
      message: `Downloading ${device.files.startup}...`,
    });

    const content = await fetchGitHubFile(
      parsed.owner,
      parsed.repo,
      ref,
      startupPath
    );

    if (content) {
      onProgress?.({
        stage: "ready",
        message: `Loaded startup file for ${device.id}`,
      });
    } else {
      onProgress?.({
        stage: "warning",
        message: `Could not load startup file ${device.files.startup}`,
      });
    }

    return content;
  }

  /**
   * Count total header files to fetch
   */
  private countTotalHeaderFiles(): number {
    let total = 0;
    for (const source of Object.values(this.manifest.sources)) {
      total += source.files?.headers?.length || 0;
    }
    return total;
  }
}

/**
 * Create a SourceFetcher for a v2 manifest
 */
export function createSourceFetcher(
  manifest: PlatformManifestV2
): SourceFetcher {
  return new SourceFetcher(manifest);
}
