/**
 * GitHub Registry Fetcher
 *
 * Fetches registry data directly from GitHub raw content.
 * Uses raw.githubusercontent.com which has no rate limits (CDN).
 */

import type {
  RegistryIndex,
  PlatformManifest,
  BoardManifest,
  LibraryManifest,
} from "./types";

// GitHub repository configuration
const GITHUB_CONFIG = {
  owner: "battlewithbytes",
  repo: "battleforge_boards",
  branch: "main",
  rawBaseUrl: "https://raw.githubusercontent.com",
};

export interface FetchResult<T> {
  data: T;
  etag?: string;
}

export class GitHubRegistryFetcher {
  private readonly baseUrl: string;

  constructor(
    owner = GITHUB_CONFIG.owner,
    repo = GITHUB_CONFIG.repo,
    branch = GITHUB_CONFIG.branch
  ) {
    this.baseUrl = `${GITHUB_CONFIG.rawBaseUrl}/${owner}/${repo}/${branch}`;
  }

  /**
   * Build full URL for a file path
   */
  private buildUrl(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${this.baseUrl}/${cleanPath}`;
  }

  /**
   * Fetch JSON with ETag support for conditional requests
   * Returns null if 304 Not Modified
   */
  async fetchWithETag<T>(
    path: string,
    etag?: string
  ): Promise<FetchResult<T> | null> {
    const url = this.buildUrl(path);
    console.log(`[GitHubFetcher] Fetching ${url}`);

    const headers: HeadersInit = {
      Accept: "application/json",
    };

    // Add If-None-Match header for conditional request
    if (etag) {
      headers["If-None-Match"] = etag;
    }

    const response = await fetch(url, { headers });

    // 304 Not Modified - cache is still valid
    if (response.status === 304) {
      console.log(`[GitHubFetcher] Cache valid (304): ${path}`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    const newEtag = response.headers.get("ETag") || undefined;

    console.log(`[GitHubFetcher] Fetched ${path}`, {
      etag: newEtag ? "present" : "none",
    });

    return { data, etag: newEtag };
  }

  /**
   * Fetch JSON file (simple fetch without ETag)
   */
  async fetchJson<T>(path: string): Promise<T> {
    const result = await this.fetchWithETag<T>(path);
    if (!result) {
      throw new Error(`Unexpected 304 response for ${path}`);
    }
    return result.data;
  }

  // ============================================================================
  // Registry API
  // ============================================================================

  /**
   * Fetch the main registry index
   */
  async fetchRegistry(): Promise<FetchResult<RegistryIndex> | null> {
    return this.fetchWithETag<RegistryIndex>("registry.json");
  }

  /**
   * Fetch registry with ETag for conditional refresh
   */
  async fetchRegistryIfModified(
    etag?: string
  ): Promise<FetchResult<RegistryIndex> | null> {
    return this.fetchWithETag<RegistryIndex>("registry.json", etag);
  }

  /**
   * Fetch a platform manifest by path
   */
  async fetchPlatformManifest(path: string): Promise<PlatformManifest> {
    return this.fetchJson<PlatformManifest>(path);
  }

  /**
   * Fetch a platform manifest by platform/family
   */
  async fetchPlatformManifestByFamily(
    platform: string,
    family: string
  ): Promise<PlatformManifest> {
    // Try v2 manifest first, fallback to v1
    const v2Path = `platforms/${platform}/${family}/manifest-v2.json`;
    try {
      return await this.fetchJson<PlatformManifest>(v2Path);
    } catch {
      // Fallback to v1 manifest
      const v1Path = `platforms/${platform}/${family}/manifest.json`;
      return this.fetchJson<PlatformManifest>(v1Path);
    }
  }

  /**
   * Fetch a board manifest by path
   */
  async fetchBoardManifest(path: string): Promise<BoardManifest> {
    return this.fetchJson<BoardManifest>(path);
  }

  /**
   * Fetch a library manifest by path
   */
  async fetchLibraryManifest(path: string): Promise<LibraryManifest> {
    return this.fetchJson<LibraryManifest>(path);
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Get the base URL being used
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if GitHub is reachable
   */
  async isReachable(): Promise<boolean> {
    try {
      const response = await fetch(this.buildUrl("registry.json"), {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance for convenience
export const githubFetcher = new GitHubRegistryFetcher();
