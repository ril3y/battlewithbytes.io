/**
 * Platform Manager
 *
 * Handles loading and caching of platform definitions.
 * Supports both v1 (legacy) and v2 (GitHub sources) manifest formats.
 */

import type {
  PlatformRegistry,
  PlatformEntry,
  PlatformFamily,
  DeviceEntry,
  SelectedPlatform,
  BuildConfig,
  LoadingProgress,
  PlatformManifest,
  PlatformManifestV2,
  DeviceDefinitionV2,
  DeviceSourceFiles,
} from "./types";
import { isManifestV2 } from "./types";
import { HeaderCache } from "./HeaderCache";
import { loadHeadersFromRegistry } from "./HeaderLoader";
import { createSourceFetcher } from "./SourceFetcher";
import { withBasePath } from "../utils/basePath";

// Use the boards submodule for all platform data
const getPlatformsBaseUrl = () => withBasePath("/boards/platforms");

export class PlatformManager {
  private registry: PlatformRegistry | null = null;
  private platformCache: Map<string, PlatformEntry> = new Map();
  private familyCache: Map<string, PlatformFamily> = new Map();
  private manifestCache: Map<string, PlatformManifest> = new Map();
  private headerCache: HeaderCache;
  private onProgress?: (progress: LoadingProgress) => void;

  constructor() {
    this.headerCache = new HeaderCache();
  }

  /**
   * Get the raw manifest for a platform family
   * Returns either v1 or v2 format
   */
  async getManifest(
    platformId: string,
    familyId: string
  ): Promise<PlatformManifest | null> {
    const cacheKey = `${platformId}/${familyId}`;

    // Check cache
    const cached = this.manifestCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Try loading v2 manifest first
    try {
      const v2Response = await fetch(
        `${getPlatformsBaseUrl()}/${platformId}/${familyId}/manifest-v2.json`
      );
      if (v2Response.ok) {
        const manifest = (await v2Response.json()) as PlatformManifestV2;
        this.manifestCache.set(cacheKey, manifest);
        console.log(`[PlatformManager] Loaded v2 manifest for ${cacheKey}`);
        return manifest;
      }
    } catch {
      // V2 not found, try v1
    }

    // Fall back to v1 manifest
    try {
      const v1Response = await fetch(
        `${getPlatformsBaseUrl()}/${platformId}/${familyId}/manifest.json`
      );
      if (v1Response.ok) {
        const manifest = await v1Response.json();
        this.manifestCache.set(cacheKey, manifest);
        console.log(`[PlatformManager] Loaded v1 manifest for ${cacheKey}`);
        return manifest;
      }
    } catch (error) {
      console.warn(`[PlatformManager] Failed to load manifest: ${error}`);
    }

    return null;
  }

  /**
   * Check if a platform uses v2 manifest format
   */
  async isV2Platform(platformId: string, familyId: string): Promise<boolean> {
    const manifest = await this.getManifest(platformId, familyId);
    return manifest !== null && isManifestV2(manifest);
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

    this.reportProgress("downloading", 0, 0, "Loading platform registry...");

    try {
      const response = await fetch(`${getPlatformsBaseUrl()}/registry.json`);
      if (!response.ok) {
        throw new Error(`Failed to load registry: ${response.status}`);
      }

      this.registry = (await response.json()) as PlatformRegistry;

      // Index platforms for quick lookup
      for (const platform of this.registry.platforms) {
        this.platformCache.set(platform.id, platform);
      }

      this.reportProgress("ready", 0, 0, "Registry loaded");
      return this.registry;
    } catch (error) {
      this.reportProgress("error", 0, 0, `Registry load failed: ${error}`);
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
   * Supports both v1 and v2 manifest formats
   */
  async loadFamily(
    platformId: string,
    familyId: string
  ): Promise<PlatformFamily> {
    const cacheKey = `${platformId}/${familyId}`;

    // Check cache
    const cached = this.familyCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    this.reportProgress(
      "downloading",
      0,
      0,
      `Loading ${platformId}/${familyId}...`
    );

    try {
      const manifest = await this.getManifest(platformId, familyId);
      if (!manifest) {
        throw new Error(`Failed to load family manifest: ${platformId}/${familyId}`);
      }

      let family: PlatformFamily;

      if (isManifestV2(manifest)) {
        // V2 manifest format
        family = this.transformV2Manifest(manifest, familyId);
      } else {
        // V1 manifest format (legacy)
        family = this.transformV1Manifest(manifest, familyId);
      }

      this.familyCache.set(cacheKey, family);

      this.reportProgress("ready", 0, 0, `Family ${familyId} loaded`);
      return family;
    } catch (error) {
      this.reportProgress("error", 0, 0, `Family load failed: ${error}`);
      throw error;
    }
  }

  /**
   * Transform v1 manifest to PlatformFamily
   */
  private transformV1Manifest(
    manifest: PlatformManifest,
    familyId: string
  ): PlatformFamily {
    // Type assertion since we know it's v1 if isManifestV2 returns false
    const v1 = manifest as {
      family?: string;
      name: string;
      description?: string;
      architecture: string;
      devices?: DeviceEntry[];
      headers?: {
        url?: string;
        size?: number;
        hash?: string;
        checksum?: string;
        includes?: string[];
      };
      libs?: {
        architecture: string;
        required: string[];
        optional: string[];
      };
      build?: {
        compilerFlags?: string[];
        linkerFlags?: string[];
      };
      compilerFlags?: string[];
      linkerFlags?: string[];
      frameworks?: unknown;
    };

    return {
      id: v1.family || familyId,
      name: v1.name,
      description: v1.description,
      architecture: v1.architecture as PlatformFamily["architecture"],
      devices: (v1.devices || []) as DeviceEntry[],
      headers: {
        url: v1.headers?.url || "",
        size: v1.headers?.size || 0,
        checksum: v1.headers?.hash || v1.headers?.checksum || "",
        includes: v1.headers?.includes || [],
      },
      libs: (v1.libs as PlatformFamily["libs"]) || {
        architecture: v1.architecture as PlatformFamily["architecture"],
        required: [],
        optional: [],
      },
      compilerFlags: v1.build?.compilerFlags || v1.compilerFlags || [],
      linkerFlags: v1.build?.linkerFlags || v1.linkerFlags || [],
      frameworks: v1.frameworks as PlatformFamily["frameworks"],
    };
  }

  /**
   * Transform v2 manifest to PlatformFamily
   */
  private transformV2Manifest(
    manifest: PlatformManifestV2,
    familyId: string
  ): PlatformFamily {
    // Map v2 devices to v1 DeviceEntry format for compatibility
    const devices: DeviceEntry[] = manifest.devices.map((d) => ({
      id: d.id,
      name: d.name,
      description: undefined,
      flash: d.flash,
      ram: d.ram,
      linkerScript: d.files?.linker || "",
      defines: d.defines,
    }));

    return {
      id: manifest.family || familyId,
      name: manifest.name,
      description: manifest.description,
      architecture: manifest.architecture,
      devices,
      headers: {
        // V2 doesn't use URL-based headers, but we need to provide this
        // for backward compatibility
        url: "",
        size: 0,
        checksum: `v2:${manifest.version}`,
        includes: ["/cmsis", "/device"],
      },
      libs: {
        architecture: manifest.architecture,
        required: [],
        optional: [],
      },
      compilerFlags: manifest.build?.compilerFlags || [],
      linkerFlags: manifest.build?.linkerFlags || [],
      frameworks: undefined, // TODO: map frameworks
    };
  }

  /**
   * Get devices for a family
   */
  async getDevices(
    platformId: string,
    familyId: string,
  ): Promise<DeviceEntry[]> {
    const family = await this.loadFamily(platformId, familyId);
    return family.devices;
  }

  /**
   * Select a complete platform configuration
   */
  async selectPlatform(
    platformId: string,
    familyId: string,
    deviceId: string,
  ): Promise<SelectedPlatform> {
    const family = await this.loadFamily(platformId, familyId);
    const device = family.devices.find((d) => d.id === deviceId);

    if (!device) {
      throw new Error(`Device ${deviceId} not found in family ${familyId}`);
    }

    // Import ARCHITECTURE_CONFIGS dynamically to avoid circular dependency
    const { ARCHITECTURE_CONFIGS } = await import("./types");
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
      archConfig,
    };
  }

  /**
   * Load headers for a platform family
   * Supports both v1 (tar.gz) and v2 (GitHub) sources
   */
  async loadHeaders(
    platformId: string,
    familyId: string,
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<Map<string, Uint8Array>> {
    // Check if this is a v2 manifest
    const manifest = await this.getManifest(platformId, familyId);

    if (manifest && isManifestV2(manifest)) {
      // Use SourceFetcher for v2 manifests
      console.log(
        `[PlatformManager] Loading headers via SourceFetcher (v2): ${platformId}/${familyId}`
      );
      const fetcher = createSourceFetcher(manifest);
      return fetcher.fetchHeaders((progress) => {
        onProgress?.({
          stage: progress.stage as LoadingProgress["stage"],
          current: progress.current || 0,
          total: progress.total || 0,
          message: progress.message,
        });
      });
    }

    // V1 manifest: try registry-based loader first
    try {
      console.log(
        `[PlatformManager] Loading headers via registry (v1): ${platformId}/${familyId}`
      );
      const headers = await loadHeadersFromRegistry(
        platformId,
        familyId,
        (progress) => {
          onProgress?.({
            stage: progress.stage as LoadingProgress["stage"],
            current: progress.current || 0,
            total: progress.total || 0,
            message: progress.message,
          });
        }
      );
      return headers;
    } catch (registryError) {
      console.warn(
        `[PlatformManager] Registry-based load failed, trying legacy path:`,
        registryError
      );
    }

    // Fallback to legacy loading from /platforms/ directory
    try {
      const family = await this.loadFamily(platformId, familyId);
      const headerBundle = family.headers;

      // Check if already cached
      const cached = await this.headerCache.getHeaders(platformId, familyId);
      if (cached) {
        onProgress?.({
          stage: "ready",
          current: 0,
          total: 0,
          message: "Headers loaded from cache",
        });
        return cached;
      }

      // Download and extract headers
      const url = `${getPlatformsBaseUrl()}/${headerBundle.url}`;
      onProgress?.({
        stage: "downloading",
        current: 0,
        total: headerBundle.size,
        message: "Downloading headers...",
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download headers: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      onProgress?.({
        stage: "extracting",
        current: buffer.byteLength,
        total: headerBundle.size,
        message: "Extracting headers...",
      });

      // Extract tar.gz
      const headers = await this.extractTarGz(new Uint8Array(buffer));

      // Cache the extracted headers
      await this.headerCache.setHeaders(
        platformId,
        familyId,
        headers,
        headerBundle.checksum
      );

      onProgress?.({
        stage: "ready",
        current: 0,
        total: 0,
        message: "Headers ready",
      });
      return headers;
    } catch (error) {
      // Return empty map with warning instead of throwing
      console.warn(
        `[PlatformManager] Headers not available for ${platformId}/${familyId}:`,
        error
      );
      onProgress?.({
        stage: "warning",
        current: 0,
        total: 0,
        message: `Headers not available for this platform. You can still write code.`,
      });
      return new Map<string, Uint8Array>();
    }
  }

  /**
   * Generate build configuration for selected platform
   */
  async generateBuildConfig(selected: SelectedPlatform): Promise<BuildConfig> {
    const { family, device, archConfig, frameworkId = "native" } = selected;

    // Determine if using Arduino framework
    const isArduino = frameworkId === "arduino";

    // Build compiler arguments based on framework
    const compilerArgs: string[] = [
      `--target=${archConfig.target}`,
      `-mcpu=${archConfig.cpu}`,
      "-mthumb",
    ];

    // Add FPU flags if present
    if (archConfig.fpu) {
      compilerArgs.push(`-mfpu=${archConfig.fpu}`);
    }
    if (archConfig.float) {
      compilerArgs.push(`-mfloat-abi=${archConfig.float}`);
    }

    // Framework-specific compiler flags
    if (isArduino) {
      // Arduino-specific flags
      compilerArgs.push(
        "-std=gnu++14", // Arduino uses C++14
        "-fno-rtti",
        "-fno-exceptions",
        "-fno-threadsafe-statics",
        "-ffunction-sections",
        "-fdata-sections",
        "-Os", // Arduino optimizes for size
      );
    } else {
      // Native framework flags
      compilerArgs.push(
        "-nostdlib",
        "-ffreestanding",
        "-fno-exceptions",
        "-fno-rtti",
      );
    }

    // Add family-specific compiler flags
    compilerArgs.push(...family.compilerFlags);

    // Build defines array
    const defines = [...(device.defines || [])];

    // Add framework-specific defines
    if (isArduino) {
      defines.push(
        "ARDUINO=10819",
        `ARDUINO_${device.id.toUpperCase()}`,
        `ARDUINO_ARCH_${selected.platformId.toUpperCase()}`,
      );
    }

    // Add defines as compiler arguments
    for (const define of defines) {
      compilerArgs.push(`-D${define}`);
    }

    // Include paths (relative to VFS root)
    const includePaths: string[] = [];

    // Add framework-specific include paths
    if (isArduino) {
      // Arduino core and variant paths
      includePaths.push(
        `/framework/arduino/cores/arduino`,
        `/framework/arduino/variants/${device.id.toUpperCase()}`,
      );
    }

    // Add platform headers
    includePaths.push(
      ...family.headers.includes.map(
        (inc) =>
          `/platform/${selected.platformId}/${selected.familyId}/headers${inc}`,
      ),
    );

    // Build linker arguments
    const linkerArgs: string[] = [
      "-flavor",
      "gnu",
      "-nostdlib",
      `--script=/platform/${selected.platformId}/${selected.familyId}/linker/${device.linkerScript}`,
    ];

    if (family.linkerFlags) {
      linkerArgs.push(...family.linkerFlags);
    }

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
      defines,
    };
  }

  /**
   * Load linker script for a device
   * Supports both v1 (local files) and v2 (GitHub) sources
   */
  async loadLinkerScript(
    platformId: string,
    familyId: string,
    linkerScriptName: string,
    deviceId?: string
  ): Promise<string> {
    // Check if this is a v2 manifest
    const manifest = await this.getManifest(platformId, familyId);

    if (manifest && isManifestV2(manifest)) {
      // Find the device to get file info
      const device = deviceId
        ? manifest.devices.find((d) => d.id === deviceId)
        : manifest.devices.find((d) => d.files?.linker === linkerScriptName);

      if (device) {
        console.log(
          `[PlatformManager] Loading linker script via SourceFetcher (v2): ${linkerScriptName}`
        );
        const fetcher = createSourceFetcher(manifest);
        const linkerContent = await fetcher.fetchLinkerScript(device);
        if (linkerContent) {
          return linkerContent;
        }
        console.warn(
          `[PlatformManager] V2 linker script fetch failed, trying fallback`
        );
      }
    }

    // V1: Try loading from local path
    const url = `${getPlatformsBaseUrl()}/${platformId}/${familyId}/linker/${linkerScriptName}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(
        `[PlatformManager] Could not load linker script from ${url}: ${response.status}`
      );
      throw new Error(`Failed to load linker script: ${response.status}`);
    }

    return await response.text();
  }

  /**
   * Load device-specific files (startup, linker, system) for v2 manifests
   */
  async loadDeviceFiles(
    platformId: string,
    familyId: string,
    deviceId: string,
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<DeviceSourceFiles> {
    const manifest = await this.getManifest(platformId, familyId);

    if (!manifest || !isManifestV2(manifest)) {
      console.warn(
        `[PlatformManager] loadDeviceFiles only works with v2 manifests`
      );
      return {};
    }

    const device = manifest.devices.find((d) => d.id === deviceId);
    if (!device) {
      console.warn(`[PlatformManager] Device ${deviceId} not found in manifest`);
      return {};
    }

    console.log(
      `[PlatformManager] Loading device files for ${deviceId} via SourceFetcher`
    );
    const fetcher = createSourceFetcher(manifest);
    return fetcher.fetchDeviceFiles(device, (progress) => {
      onProgress?.({
        stage: progress.stage as LoadingProgress["stage"],
        current: progress.current || 0,
        total: progress.total || 0,
        message: progress.message,
      });
    });
  }

  /**
   * Load startup file for a device
   */
  async loadStartupFile(
    platformId: string,
    familyId: string,
    deviceId: string,
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<Uint8Array | null> {
    const manifest = await this.getManifest(platformId, familyId);

    if (!manifest || !isManifestV2(manifest)) {
      console.warn(
        `[PlatformManager] loadStartupFile only works with v2 manifests`
      );
      return null;
    }

    const device = manifest.devices.find((d) => d.id === deviceId);
    if (!device) {
      console.warn(`[PlatformManager] Device ${deviceId} not found in manifest`);
      return null;
    }

    const fetcher = createSourceFetcher(manifest);
    return fetcher.fetchStartupFile(device, (progress) => {
      onProgress?.({
        stage: progress.stage as LoadingProgress["stage"],
        current: progress.current || 0,
        total: progress.total || 0,
        message: progress.message,
      });
    });
  }

  /**
   * Load system file (e.g., system_stm32f1xx.c) for a device
   */
  async loadSystemFile(
    platformId: string,
    familyId: string,
    deviceId: string,
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<Uint8Array | null> {
    const manifest = await this.getManifest(platformId, familyId);

    if (!manifest || !isManifestV2(manifest)) {
      console.warn(
        `[PlatformManager] loadSystemFile only works with v2 manifests`
      );
      return null;
    }

    const device = manifest.devices.find((d) => d.id === deviceId);
    if (!device) {
      console.warn(`[PlatformManager] Device ${deviceId} not found in manifest`);
      return null;
    }

    const fetcher = createSourceFetcher(manifest);
    const files = await fetcher.fetchDeviceFiles(device, (progress) => {
      onProgress?.({
        stage: progress.stage as LoadingProgress["stage"],
        current: progress.current || 0,
        total: progress.total || 0,
        message: progress.message,
      });
    });

    return files.system || null;
  }

  /**
   * Get the v2 device definition if available
   */
  async getDeviceV2(
    platformId: string,
    familyId: string,
    deviceId: string
  ): Promise<DeviceDefinitionV2 | null> {
    const manifest = await this.getManifest(platformId, familyId);

    if (!manifest || !isManifestV2(manifest)) {
      return null;
    }

    return manifest.devices.find((d) => d.id === deviceId) || null;
  }

  /**
   * Extract a tar.gz archive
   * Uses pako for gzip decompression and a simple tar parser
   */
  private async extractTarGz(
    data: Uint8Array,
  ): Promise<Map<string, Uint8Array>> {
    // Dynamically import pako for gzip decompression
    // In browser, we'll use the DecompressionStream API if available
    const files = new Map<string, Uint8Array>();

    try {
      // Try using DecompressionStream (modern browsers)
      const decompressed = await this.decompressGzip(data);
      await this.parseTar(decompressed, files);
    } catch (error) {
      console.error("[PlatformManager] Failed to extract tar.gz:", error);
      throw new Error(`Failed to extract headers: ${error}`);
    }

    return files;
  }

  /**
   * Decompress gzip data using DecompressionStream or fallback
   */
  private async decompressGzip(data: Uint8Array): Promise<Uint8Array> {
    // Check for DecompressionStream support
    if (typeof DecompressionStream !== "undefined") {
      const stream = new DecompressionStream("gzip");
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
    throw new Error(
      "DecompressionStream not supported. Please use a modern browser.",
    );
  }

  /**
   * Parse tar archive
   */
  private async parseTar(
    data: Uint8Array,
    files: Map<string, Uint8Array>,
  ): Promise<void> {
    let offset = 0;

    while (offset < data.length - 512) {
      // Read header (512 bytes)
      const header = data.slice(offset, offset + 512);

      // Check for empty header (end of archive)
      if (header.every((b) => b === 0)) {
        break;
      }

      // Parse filename (first 100 bytes)
      const nameBytes = header.slice(0, 100);
      const nameEnd = nameBytes.indexOf(0);
      const name = new TextDecoder()
        .decode(nameBytes.slice(0, nameEnd > 0 ? nameEnd : 100))
        .trim();

      // Parse size (bytes 124-135, octal string)
      const sizeBytes = header.slice(124, 136);
      const sizeStr = new TextDecoder().decode(sizeBytes).trim();
      const size = parseInt(sizeStr, 8) || 0;

      // Parse type flag (byte 156)
      const typeFlag = header[156];

      offset += 512; // Move past header

      if (name && size > 0 && typeFlag === 48) {
        // 48 = '0' = regular file
        // Extract file content
        const content = data.slice(offset, offset + size);
        files.set("/" + name, content);
      }

      // Move to next header (size rounded up to 512 bytes)
      offset += Math.ceil(size / 512) * 512;
    }
  }

  /**
   * Report loading progress
   */
  private reportProgress(
    stage: LoadingProgress["stage"],
    current: number,
    total: number,
    message: string,
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
    this.manifestCache.clear();
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
