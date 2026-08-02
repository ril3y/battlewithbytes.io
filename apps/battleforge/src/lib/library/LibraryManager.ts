/**
 * Library Manager
 *
 * Manages third-party libraries from PlatformIO registry.
 * Handles search, download, caching, and dependency resolution.
 */

import { LibraryCache } from "./LibraryCache";
import {
  loadLibraryManifest,
  getLibraries,
  getLibrariesForPlatform,
  getArchPortablePath,
} from "./LibraryRegistry";
import type {
  LibraryManifest,
  LibrarySearchResult,
  CachedLibrary,
  InstalledLibrary,
  ResolvedDependency,
  BattleForgeLibraryManifest,
  LibraryRegistryEntry,
  Architecture,
  PlatformId,
} from "./types";

// PlatformIO Registry API
const REGISTRY_API = "https://api.registry.platformio.org/v3";

// Fallback to GitHub for library downloads
const GITHUB_RAW = "https://raw.githubusercontent.com";

export class LibraryManager {
  private cache: LibraryCache;
  private installedLibraries: Map<string, string> = new Map(); // name -> version

  constructor() {
    this.cache = new LibraryCache();
  }

  /**
   * Search PlatformIO registry for libraries
   */
  async searchLibraries(
    query: string,
    options?: {
      frameworks?: string[];
      platforms?: string[];
      limit?: number;
    },
  ): Promise<LibrarySearchResult[]> {
    try {
      // Build search query
      let searchQuery = `type:"library" ${query}`;

      if (options?.frameworks?.length) {
        searchQuery += ` frameworks:${options.frameworks.join(",")}`;
      }

      if (options?.platforms?.length) {
        searchQuery += ` platforms:${options.platforms.join(",")}`;
      }

      const limit = options?.limit || 20;
      const url = `${REGISTRY_API}/search?query=${encodeURIComponent(searchQuery)}&limit=${limit}`;

      console.log(`[LibraryManager] Searching: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Registry search failed: ${response.status}`);
      }

      const data = await response.json();

      // Transform to our format
      return (data.items || []).map((item: Record<string, unknown>) => ({
        id: item.id as number,
        name: item.name as string,
        description: (item.description as string) || "",
        keywords: (item.keywords as string[]) || [],
        homepage: item.homepage as string,
        repository: item.repository as LibrarySearchResult["repository"],
        authors: (item.authors as LibrarySearchResult["authors"]) || [],
        version: item.version as { name: string; released: string },
        frameworks: (item.frameworks as string[]) || [],
        platforms: (item.platforms as string[]) || [],
        downloads:
          (item.dlstats as { day?: number; week?: number; month?: number })
            ?.month || 0,
        examples: item.examples as number,
      }));
    } catch (error) {
      console.error("[LibraryManager] Search error:", error);
      return [];
    }
  }

  /**
   * Get library info from registry
   */
  async getLibraryInfo(
    name: string,
    version?: string,
  ): Promise<LibrarySearchResult | null> {
    try {
      const versionPath = version ? `/${version}` : "";
      const url = `${REGISTRY_API}/libraries/${encodeURIComponent(name)}${versionPath}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get library info: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        description: data.description || "",
        keywords: data.keywords || [],
        homepage: data.homepage,
        repository: data.repository,
        authors: data.authors || [],
        version: data.version,
        frameworks: data.frameworks || [],
        platforms: data.platforms || [],
        downloads: data.dlstats?.month || 0,
        examples: data.examples,
      };
    } catch (error) {
      console.error("[LibraryManager] Get info error:", error);
      return null;
    }
  }

  /**
   * Install a library (download and cache)
   */
  async installLibrary(
    name: string,
    version?: string,
    onProgress?: (message: string) => void,
  ): Promise<CachedLibrary | null> {
    try {
      // Check cache first
      const targetVersion = version || "latest";
      onProgress?.(`Checking cache for ${name}@${targetVersion}...`);

      if (version) {
        const cached = await this.cache.getLibrary(name, version);
        if (cached) {
          onProgress?.(`${name}@${version} loaded from cache`);
          this.installedLibraries.set(name, version);
          return cached;
        }
      }

      // Get library info from registry
      onProgress?.(`Fetching ${name} info from registry...`);
      const info = await this.getLibraryInfo(name, version);

      if (!info) {
        throw new Error(`Library not found: ${name}`);
      }

      const actualVersion = info.version.name;

      // Check cache again with actual version
      const cached = await this.cache.getLibrary(name, actualVersion);
      if (cached) {
        onProgress?.(`${name}@${actualVersion} loaded from cache`);
        this.installedLibraries.set(name, actualVersion);
        return cached;
      }

      // Download the library
      onProgress?.(`Downloading ${name}@${actualVersion}...`);
      const { manifest, files, checksum } = await this.downloadLibrary(
        name,
        actualVersion,
        info,
      );

      // Cache it
      onProgress?.(`Caching ${name}@${actualVersion}...`);
      await this.cache.setLibrary(
        name,
        actualVersion,
        manifest,
        files,
        checksum,
      );

      // Mark as installed
      this.installedLibraries.set(name, actualVersion);

      onProgress?.(`${name}@${actualVersion} installed successfully`);

      return {
        id: `${name}@${actualVersion}`,
        name,
        version: actualVersion,
        manifest,
        files,
        checksum,
        downloadedAt: Date.now(),
        size: Array.from(files.values()).reduce((sum, f) => sum + f.length, 0),
      };
    } catch (error) {
      console.error("[LibraryManager] Install error:", error);
      onProgress?.(`Error installing ${name}: ${error}`);
      return null;
    }
  }

  /**
   * Download library files
   */
  private async downloadLibrary(
    name: string,
    version: string,
    info: LibrarySearchResult,
  ): Promise<{
    manifest: LibraryManifest;
    files: Map<string, Uint8Array>;
    checksum: string;
  }> {
    const files = new Map<string, Uint8Array>();

    // Try PlatformIO download URL first
    let downloadUrl = `https://dl.registry.platformio.org/libraries/${encodeURIComponent(name)}/${version}.tar.gz`;

    // Fall back to GitHub if repository is available
    if (info.repository?.url) {
      const githubMatch = info.repository.url.match(
        /github\.com\/([^\/]+)\/([^\/\.]+)/,
      );
      if (githubMatch) {
        const [, owner, repo] = githubMatch;
        downloadUrl = `https://github.com/${owner}/${repo}/archive/refs/tags/v${version}.tar.gz`;
      }
    }

    console.log(`[LibraryManager] Downloading from: ${downloadUrl}`);

    // For now, we'll create a placeholder implementation
    // In production, this would:
    // 1. Fetch the tar.gz
    // 2. Decompress and extract
    // 3. Parse the manifest

    // Simplified: Just fetch library.json and src files from GitHub raw
    if (info.repository?.url) {
      const githubMatch = info.repository.url.match(
        /github\.com\/([^\/]+)\/([^\/\.]+)/,
      );
      if (githubMatch) {
        const [, owner, repo] = githubMatch;
        const branch = info.repository.branch || "main";

        // Try to fetch library.json
        const manifestUrl = `${GITHUB_RAW}/${owner}/${repo}/${branch}/library.json`;
        try {
          const manifestResponse = await fetch(manifestUrl);
          if (manifestResponse.ok) {
            const manifestText = await manifestResponse.text();
            files.set("/library.json", new TextEncoder().encode(manifestText));
          }
        } catch {
          console.warn("[LibraryManager] Could not fetch library.json");
        }
      }
    }

    // Create a basic manifest from registry info
    const manifest: LibraryManifest = {
      name: info.name,
      version: info.version.name,
      description: info.description,
      keywords: info.keywords,
      authors: info.authors,
      repository: info.repository,
      homepage: info.homepage,
      frameworks: info.frameworks,
      platforms: info.platforms,
    };

    // Generate a simple checksum
    const checksum = `sha256:${await this.simpleHash(JSON.stringify(manifest))}`;

    return { manifest, files, checksum };
  }

  /**
   * Simple hash function for checksums
   */
  private async simpleHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // ===========================================================================
  // BattleForge Curated Library Methods
  // ===========================================================================

  /**
   * Get libraries from BattleForge registry
   */
  async getBattleForgeLibraries(): Promise<LibraryRegistryEntry[]> {
    return getLibraries();
  }

  /**
   * Get libraries compatible with a platform
   */
  async getLibrariesForPlatform(
    platformId: PlatformId,
  ): Promise<LibraryRegistryEntry[]> {
    return getLibrariesForPlatform(platformId);
  }

  /**
   * Install a library from BattleForge registry
   */
  async installFromRegistry(
    libraryId: string,
    architecture: Architecture,
    onProgress?: (message: string) => void,
  ): Promise<CachedLibrary | null> {
    try {
      // Load the library manifest
      onProgress?.(`Loading manifest for ${libraryId}...`);
      const manifest = await loadLibraryManifest(libraryId);

      if (!manifest) {
        throw new Error(`Library not found: ${libraryId}`);
      }

      // Check if already cached
      const cached = await this.cache.getLibrary(libraryId, manifest.version);
      if (cached) {
        onProgress?.(`${manifest.name} v${manifest.version} loaded from cache`);
        this.installedLibraries.set(libraryId, manifest.version);
        return cached;
      }

      // Download files from GitHub
      onProgress?.(`Downloading ${manifest.name} v${manifest.version}...`);
      const files = await this.downloadFromGitHub(
        manifest,
        architecture,
        onProgress,
      );

      if (files.size === 0) {
        throw new Error("No files downloaded");
      }

      // Download config template if specified
      if (manifest.configTemplate) {
        onProgress?.(
          `Downloading config template: ${manifest.configTemplate}...`,
        );
        try {
          const configUrl = `/libraries/${libraryId}/${manifest.configTemplate}`;
          const configResponse = await fetch(configUrl);
          if (configResponse.ok) {
            const configContent = new Uint8Array(
              await configResponse.arrayBuffer(),
            );
            // Store in /config/ directory of the library
            files.set(`/config/${manifest.configTemplate}`, configContent);
            console.log(
              `[LibraryManager] Downloaded config template: ${manifest.configTemplate}`,
            );
          } else {
            console.warn(
              `[LibraryManager] Config template not found: ${configUrl}`,
            );
          }
        } catch (error) {
          console.warn(
            `[LibraryManager] Error fetching config template:`,
            error,
          );
        }
      }

      // Create a LibraryManifest for caching (compatibility with existing cache)
      const cacheManifest: LibraryManifest = {
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        homepage: manifest.homepage,
        license: manifest.license,
        platforms: manifest.platforms,
        frameworks: [],
      };

      // Generate checksum
      const checksum = `sha256:${await this.simpleHash(JSON.stringify(manifest))}`;

      // Cache the library
      onProgress?.(`Caching ${manifest.name}...`);
      await this.cache.setLibrary(
        libraryId,
        manifest.version,
        cacheManifest,
        files,
        checksum,
      );

      // Mark as installed
      this.installedLibraries.set(libraryId, manifest.version);

      onProgress?.(
        `${manifest.name} v${manifest.version} installed successfully (${files.size} files)`,
      );

      return {
        id: `${libraryId}@${manifest.version}`,
        name: libraryId,
        version: manifest.version,
        manifest: cacheManifest,
        files,
        checksum,
        downloadedAt: Date.now(),
        size: Array.from(files.values()).reduce((sum, f) => sum + f.length, 0),
      };
    } catch (error) {
      console.error("[LibraryManager] Install from registry error:", error);
      onProgress?.(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return null;
    }
  }

  /**
   * Download library files from GitHub based on manifest
   */
  private async downloadFromGitHub(
    manifest: BattleForgeLibraryManifest,
    architecture: Architecture,
    onProgress?: (message: string) => void,
  ): Promise<Map<string, Uint8Array>> {
    const files = new Map<string, Uint8Array>();
    const { source } = manifest;

    if (source.type !== "github") {
      throw new Error(`Unsupported source type: ${source.type}`);
    }

    const baseUrl = `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${source.ref}`;
    const archPath = getArchPortablePath(architecture);

    // Filter files by architecture/platform
    const filesToDownload = source.files.filter((file) => {
      // Skip files for other architectures
      if (file.arch && file.arch !== architecture) {
        return false;
      }
      return true;
    });

    let downloaded = 0;
    const total = filesToDownload.length;

    for (const fileSpec of filesToDownload) {
      const sourcePath = fileSpec.path;
      const destDir = fileSpec.dest.replace(/\$\{arch\}/g, archPath);

      // Handle wildcard patterns vs single files
      if (sourcePath.includes("*")) {
        // For wildcards, we need to fetch the file listing first
        // This is a limitation - GitHub raw doesn't support directory listing
        // For now, skip wildcard patterns and rely on explicit file lists
        console.warn(
          `[LibraryManager] Wildcard patterns not supported yet: ${sourcePath}`,
        );
        continue;
      }

      // Single file download
      const url = `${baseUrl}/${sourcePath}`;
      const fileName = sourcePath.split("/").pop() || sourcePath;
      const destPath = `/${destDir}${fileName}`.replace(/\/+/g, "/");

      try {
        onProgress?.(`Downloading ${fileName}...`);
        const response = await fetch(url);

        if (!response.ok) {
          console.warn(
            `[LibraryManager] Failed to fetch ${url}: ${response.status}`,
          );
          continue;
        }

        const content = new Uint8Array(await response.arrayBuffer());
        files.set(destPath, content);
        downloaded++;

        console.log(
          `[LibraryManager] Downloaded ${destPath} (${content.length} bytes)`,
        );
      } catch (error) {
        console.warn(`[LibraryManager] Error fetching ${url}:`, error);
      }
    }

    onProgress?.(`Downloaded ${downloaded}/${total} files`);
    return files;
  }

  /**
   * Get build configuration for installed libraries
   */
  // Takes no architecture argument yet: the include paths below are the same
  // for every target. An architecture parameter should be reintroduced when
  // this starts aggregating per-library manifests (see note below).
  getBuildConfig(): {
    includePaths: string[];
    defines: string[];
    compilerFlags: string[];
  } {
    const includePaths: string[] = [];
    const defines: string[] = [];
    const compilerFlags: string[] = [];

    // Note: In a full implementation, we'd load manifests for each installed library
    // and aggregate their build configurations
    for (const name of this.installedLibraries.keys()) {
      includePaths.push(`-I/libs/${name}/include`);
      includePaths.push(`-I/libs/${name}/src`);
    }

    return { includePaths, defines, compilerFlags };
  }

  /**
   * Uninstall a library
   */
  async uninstallLibrary(name: string): Promise<void> {
    // Try in-memory map first, then fall back to cache lookup
    let version = this.installedLibraries.get(name);

    if (!version) {
      // Look up in cache (handles page reload scenario)
      const cached = await this.cache.listCached();
      const found = cached.find(
        (m) => m.name.toLowerCase() === name.toLowerCase(),
      );
      if (found) {
        version = found.version;
      }
    }

    if (version) {
      await this.cache.removeLibrary(name, version);
      this.installedLibraries.delete(name);
    }
  }

  /**
   * Get list of installed libraries
   */
  async getInstalledLibraries(): Promise<InstalledLibrary[]> {
    const cached = await this.cache.listCached();
    return cached.map((meta) => ({
      name: meta.name,
      version: meta.version,
      status: "installed" as const,
      manifest: {
        name: meta.name,
        version: meta.version,
        frameworks: meta.frameworks,
        platforms: meta.platforms,
      },
      size: meta.totalSize,
      installedAt: meta.timestamp,
    }));
  }

  /**
   * Get all header files from installed libraries
   */
  async getLibraryHeaders(): Promise<Map<string, Uint8Array>> {
    const headers = new Map<string, Uint8Array>();

    // Get libraries from cache (persisted in IndexedDB) instead of in-memory map
    const cached = await this.cache.listCached();

    for (const meta of cached) {
      const lib = await this.cache.getLibrary(meta.name, meta.version);
      if (lib) {
        for (const [path, content] of lib.files) {
          // Only include header files
          if (path.endsWith(".h") || path.endsWith(".hpp")) {
            // Prefix with library name for namespacing
            const fullPath = `/libs/${meta.name}${path}`;
            headers.set(fullPath, content);
          }
        }
      }
    }

    return headers;
  }

  /**
   * Get include paths for all installed libraries
   */
  async getIncludePaths(): Promise<string[]> {
    const paths: string[] = [];

    // Get libraries from cache (persisted in IndexedDB) instead of in-memory map
    const cached = await this.cache.listCached();

    for (const meta of cached) {
      paths.push(`-I/libs/${meta.name}/src`);
      paths.push(`-I/libs/${meta.name}/include`);
      paths.push(`-I/libs/${meta.name}`);
    }

    return paths;
  }

  /**
   * Get all source files from installed libraries for compilation
   */
  async getLibrarySources(): Promise<Map<string, Uint8Array>> {
    const sources = new Map<string, Uint8Array>();

    // Get libraries from cache (persisted in IndexedDB) instead of in-memory map
    const cached = await this.cache.listCached();

    for (const meta of cached) {
      const lib = await this.cache.getLibrary(meta.name, meta.version);
      if (lib) {
        for (const [path, content] of lib.files) {
          // Include C/C++ source files
          if (
            path.endsWith(".c") ||
            path.endsWith(".cpp") ||
            path.endsWith(".cc")
          ) {
            // Prefix with library name for namespacing
            const fullPath = `/libs/${meta.name}${path}`;
            sources.set(fullPath, content);
          }
        }
      }
    }

    return sources;
  }

  /**
   * Get all files (headers + sources) from installed libraries
   * @deprecated Use getLibraryFilesFor() with specific library IDs instead
   */
  async getAllLibraryFiles(): Promise<Map<string, Uint8Array>> {
    const files = new Map<string, Uint8Array>();

    // Get libraries from cache (persisted in IndexedDB) instead of in-memory map
    const cached = await this.cache.listCached();

    for (const meta of cached) {
      const lib = await this.cache.getLibrary(meta.name, meta.version);
      if (lib) {
        for (const [path, content] of lib.files) {
          // Prefix with library name for namespacing
          const fullPath = `/libs/${meta.name}${path}`;
          files.set(fullPath, content);
        }
      }
    }

    return files;
  }

  /**
   * Get files for specific libraries only (project-aware loading)
   * @param libraryIds - Array of library IDs to load (e.g., ['freertos', 'stm32hal'])
   * @returns Map of file paths to content for the specified libraries only
   */
  async getLibraryFilesFor(
    libraryIds: string[],
  ): Promise<Map<string, Uint8Array>> {
    const files = new Map<string, Uint8Array>();

    if (!libraryIds || libraryIds.length === 0) {
      return files;
    }

    // Normalize library IDs to lowercase for matching
    const requestedLibs = new Set(libraryIds.map((id) => id.toLowerCase()));

    // Get libraries from cache
    const cached = await this.cache.listCached();

    for (const meta of cached) {
      // Only include libraries that are in the project
      if (!requestedLibs.has(meta.name.toLowerCase())) {
        continue;
      }

      const lib = await this.cache.getLibrary(meta.name, meta.version);
      if (lib) {
        for (const [path, content] of lib.files) {
          const fullPath = `/libs/${meta.name}${path}`;
          files.set(fullPath, content);
        }
      }
    }

    return files;
  }

  /**
   * Resolve library dependencies recursively
   */
  async resolveDependencies(
    manifest: LibraryManifest,
    resolved: Map<string, string> = new Map(),
  ): Promise<ResolvedDependency[]> {
    const dependencies: ResolvedDependency[] = [];

    if (!manifest.dependencies) {
      return dependencies;
    }

    for (const [depName, versionConstraint] of Object.entries(
      manifest.dependencies,
    )) {
      // Skip if already resolved
      if (resolved.has(depName)) {
        continue;
      }

      // For now, just use the constraint as-is (simplified)
      // In production, implement proper semver resolution
      const version = versionConstraint.replace(/[\^~>=<]/g, "");

      resolved.set(depName, version);

      // Check if cached
      const cached = await this.cache.has(depName, version);

      const dependency: ResolvedDependency = {
        name: depName,
        version,
        source: cached ? "cache" : "remote",
        dependencies: [],
      };

      // Recursively resolve sub-dependencies
      if (!cached) {
        const info = await this.getLibraryInfo(depName, version);
        if (info) {
          // Would need to download and parse manifest for sub-deps
          // Simplified for now
        }
      }

      dependencies.push(dependency);
    }

    return dependencies;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    libraryCount: number;
    totalSize: number;
    libraries: Array<{ name: string; version: string; size: number }>;
  }> {
    const cached = await this.cache.listCached();
    const totalSize = await this.cache.getTotalSize();

    return {
      libraryCount: cached.length,
      totalSize,
      libraries: cached.map((m) => ({
        name: m.name,
        version: m.version,
        size: m.totalSize,
      })),
    };
  }

  /**
   * Clear all cached libraries
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
    this.installedLibraries.clear();
  }
}

// Singleton instance
let instance: LibraryManager | null = null;

export function getLibraryManager(): LibraryManager {
  if (!instance) {
    instance = new LibraryManager();
  }
  return instance;
}
