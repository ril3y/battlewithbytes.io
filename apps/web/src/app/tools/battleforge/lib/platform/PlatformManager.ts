/**
 * Platform Manager
 *
 * Handles loading and caching of platform definitions from static JSON files.
 * All platform data is served from /platforms/ directory.
 */

import type {
  PlatformRegistry,
  PlatformEntry,
  PlatformFamily,
  DeviceEntry,
  SelectedPlatform,
  BuildConfig,
  Architecture,
  ARCHITECTURE_CONFIGS,
  LoadingProgress
} from './types';
import { HeaderCache } from './HeaderCache';

const PLATFORMS_BASE_URL = '/platforms';

export class PlatformManager {
  private registry: PlatformRegistry | null = null;
  private platformCache: Map<string, PlatformEntry> = new Map();
  private familyCache: Map<string, PlatformFamily> = new Map();
  private headerCache: HeaderCache;
  private onProgress?: (progress: LoadingProgress) => void;

  constructor() {
    this.headerCache = new HeaderCache();
  }

  /**
   * Set progress callback for loading operations
   */
  setProgressCallback(callback: (progress: LoadingProgress) => void): void {
    this.onProgress = callback;
  }

  /**
   * Load the platform registry
   */
  async loadRegistry(): Promise<PlatformRegistry> {
    if (this.registry) {
      return this.registry;
    }

    this.reportProgress('downloading', 0, 0, 'Loading platform registry...');

    try {
      const response = await fetch(`${PLATFORMS_BASE_URL}/registry.json`);
      if (!response.ok) {
        throw new Error(`Failed to load registry: ${response.status}`);
      }

      this.registry = await response.json() as PlatformRegistry;

      // Index platforms for quick lookup
      for (const platform of this.registry.platforms) {
        this.platformCache.set(platform.id, platform);
      }

      this.reportProgress('ready', 0, 0, 'Registry loaded');
      return this.registry;
    } catch (error) {
      this.reportProgress('error', 0, 0, `Registry load failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get all available platforms
   */
  async getPlatforms(): Promise<PlatformEntry[]> {
    const registry = await this.loadRegistry();
    return registry.platforms;
  }

  /**
   * Get a specific platform by ID
   */
  async getPlatform(platformId: string): Promise<PlatformEntry | null> {
    await this.loadRegistry();
    return this.platformCache.get(platformId) || null;
  }

  /**
   * Get families for a platform
   */
  async getFamilies(platformId: string): Promise<string[]> {
    const platform = await this.getPlatform(platformId);
    return platform?.families || [];
  }

  /**
   * Load a platform family definition
   */
  async loadFamily(platformId: string, familyId: string): Promise<PlatformFamily> {
    const cacheKey = `${platformId}/${familyId}`;

    // Check cache
    const cached = this.familyCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    this.reportProgress('downloading', 0, 0, `Loading ${platformId}/${familyId}...`);

    try {
      const response = await fetch(`${PLATFORMS_BASE_URL}/${platformId}/${familyId}/family.json`);
      if (!response.ok) {
        throw new Error(`Failed to load family: ${response.status}`);
      }

      const family = await response.json() as PlatformFamily;
      this.familyCache.set(cacheKey, family);

      this.reportProgress('ready', 0, 0, `Family ${familyId} loaded`);
      return family;
    } catch (error) {
      this.reportProgress('error', 0, 0, `Family load failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get devices for a family
   */
  async getDevices(platformId: string, familyId: string): Promise<DeviceEntry[]> {
    const family = await this.loadFamily(platformId, familyId);
    return family.devices;
  }

  /**
   * Select a complete platform configuration
   */
  async selectPlatform(
    platformId: string,
    familyId: string,
    deviceId: string
  ): Promise<SelectedPlatform> {
    const family = await this.loadFamily(platformId, familyId);
    const device = family.devices.find(d => d.id === deviceId);

    if (!device) {
      throw new Error(`Device ${deviceId} not found in family ${familyId}`);
    }

    // Import ARCHITECTURE_CONFIGS dynamically to avoid circular dependency
    const { ARCHITECTURE_CONFIGS } = await import('./types');
    const archConfig = ARCHITECTURE_CONFIGS[family.architecture];

    if (!archConfig) {
      throw new Error(`Unknown architecture: ${family.architecture}`);
    }

    return {
      platformId,
      familyId,
      deviceId,
      family,
      device,
      archConfig
    };
  }

  /**
   * Load headers for a platform family
   */
  async loadHeaders(
    platformId: string,
    familyId: string,
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<Map<string, Uint8Array>> {
    const family = await this.loadFamily(platformId, familyId);
    const headerBundle = family.headers;

    // Check if already cached
    const cached = await this.headerCache.getHeaders(platformId, familyId);
    if (cached) {
      onProgress?.({ stage: 'ready', current: 0, total: 0, message: 'Headers loaded from cache' });
      return cached;
    }

    // Download and extract headers
    const url = `${PLATFORMS_BASE_URL}/${headerBundle.url}`;
    onProgress?.({ stage: 'downloading', current: 0, total: headerBundle.size, message: 'Downloading headers...' });

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download headers: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      onProgress?.({ stage: 'extracting', current: buffer.byteLength, total: headerBundle.size, message: 'Extracting headers...' });

      // Extract tar.gz
      const headers = await this.extractTarGz(new Uint8Array(buffer));

      // Cache the extracted headers
      await this.headerCache.setHeaders(platformId, familyId, headers, headerBundle.checksum);

      onProgress?.({ stage: 'ready', current: 0, total: 0, message: 'Headers ready' });
      return headers;
    } catch (error) {
      onProgress?.({ stage: 'error', current: 0, total: 0, message: `Header load failed: ${error}` });
      throw error;
    }
  }

  /**
   * Generate build configuration for selected platform
   */
  async generateBuildConfig(selected: SelectedPlatform): Promise<BuildConfig> {
    const { family, device, archConfig } = selected;

    // Build compiler arguments
    const compilerArgs: string[] = [
      `--target=${archConfig.target}`,
      `-mcpu=${archConfig.cpu}`,
      '-mthumb',
      '-nostdlib',
      '-ffreestanding',
      ...family.compilerFlags
    ];

    // Add FPU flags if present
    if (archConfig.fpu) {
      compilerArgs.push(`-mfpu=${archConfig.fpu}`);
    }
    if (archConfig.float) {
      compilerArgs.push(`-mfloat-abi=${archConfig.float}`);
    }

    // Add device-specific defines
    const defines = device.defines || [];
    for (const define of defines) {
      compilerArgs.push(`-D${define}`);
    }

    // Build linker arguments
    const linkerArgs: string[] = [
      '-flavor', 'gnu',
      '-nostdlib',
      `--script=/platform/${selected.platformId}/${selected.familyId}/linker/${device.linkerScript}`
    ];

    if (family.linkerFlags) {
      linkerArgs.push(...family.linkerFlags);
    }

    // Include paths (relative to VFS root)
    const includePaths = family.headers.includes.map(
      inc => `/platform/${selected.platformId}/${selected.familyId}/headers${inc}`
    );

    // Library paths
    const libPaths = [`/libs/${archConfig.libPath}`];

    // Required libraries
    const libs = [...family.libs.required];

    // Linker script path
    const linkerScript = `/platform/${selected.platformId}/${selected.familyId}/linker/${device.linkerScript}`;

    return {
      compilerArgs,
      linkerArgs,
      includePaths,
      libPaths,
      libs,
      linkerScript,
      defines
    };
  }

  /**
   * Load linker script for a device
   */
  async loadLinkerScript(
    platformId: string,
    familyId: string,
    linkerScriptName: string
  ): Promise<string> {
    const url = `${PLATFORMS_BASE_URL}/${platformId}/${familyId}/linker/${linkerScriptName}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load linker script: ${response.status}`);
    }

    return await response.text();
  }

  /**
   * Extract a tar.gz archive
   * Uses pako for gzip decompression and a simple tar parser
   */
  private async extractTarGz(data: Uint8Array): Promise<Map<string, Uint8Array>> {
    // Dynamically import pako for gzip decompression
    // In browser, we'll use the DecompressionStream API if available
    const files = new Map<string, Uint8Array>();

    try {
      // Try using DecompressionStream (modern browsers)
      const decompressed = await this.decompressGzip(data);
      await this.parseTar(decompressed, files);
    } catch (error) {
      console.error('[PlatformManager] Failed to extract tar.gz:', error);
      throw new Error(`Failed to extract headers: ${error}`);
    }

    return files;
  }

  /**
   * Decompress gzip data using DecompressionStream or fallback
   */
  private async decompressGzip(data: Uint8Array): Promise<Uint8Array> {
    // Check for DecompressionStream support
    if (typeof DecompressionStream !== 'undefined') {
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(data as unknown as BufferSource);
      writer.close();

      const reader = stream.readable.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      // Concatenate chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result;
    }

    // Fallback: use pako if available
    throw new Error('DecompressionStream not supported. Please use a modern browser.');
  }

  /**
   * Parse tar archive
   */
  private async parseTar(data: Uint8Array, files: Map<string, Uint8Array>): Promise<void> {
    let offset = 0;

    while (offset < data.length - 512) {
      // Read header (512 bytes)
      const header = data.slice(offset, offset + 512);

      // Check for empty header (end of archive)
      if (header.every(b => b === 0)) {
        break;
      }

      // Parse filename (first 100 bytes)
      const nameBytes = header.slice(0, 100);
      const nameEnd = nameBytes.indexOf(0);
      const name = new TextDecoder().decode(nameBytes.slice(0, nameEnd > 0 ? nameEnd : 100)).trim();

      // Parse size (bytes 124-135, octal string)
      const sizeBytes = header.slice(124, 136);
      const sizeStr = new TextDecoder().decode(sizeBytes).trim();
      const size = parseInt(sizeStr, 8) || 0;

      // Parse type flag (byte 156)
      const typeFlag = header[156];

      offset += 512; // Move past header

      if (name && size > 0 && typeFlag === 48) { // 48 = '0' = regular file
        // Extract file content
        const content = data.slice(offset, offset + size);
        files.set('/' + name, content);
      }

      // Move to next header (size rounded up to 512 bytes)
      offset += Math.ceil(size / 512) * 512;
    }
  }

  /**
   * Report loading progress
   */
  private reportProgress(
    stage: LoadingProgress['stage'],
    current: number,
    total: number,
    message: string
  ): void {
    this.onProgress?.({ stage, current, total, message });
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    this.registry = null;
    this.platformCache.clear();
    this.familyCache.clear();
    await this.headerCache.clear();
  }
}

// Singleton instance
let instance: PlatformManager | null = null;

export function getPlatformManager(): PlatformManager {
  if (!instance) {
    instance = new PlatformManager();
  }
  return instance;
}
