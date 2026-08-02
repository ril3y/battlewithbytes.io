/**
 * @jest-environment node
 */

/**
 * HeaderLoader unit tests
 *
 * Exercises the real module with the network and IndexedDB cache mocked,
 * so it runs offline and deterministically. Covers the tar parser, the
 * gzip path, graceful 404 handling, progress reporting, and the
 * registry-manifest branch selection.
 */

import { gzipSync } from "zlib";

const mockCache = {
  isValid: jest.fn(),
  getHeaders: jest.fn(),
  setHeaders: jest.fn(),
  removeFamily: jest.fn(),
};

jest.mock("../HeaderCache", () => ({
  HeaderCache: jest.fn().mockImplementation(() => mockCache),
}));

const mockFetchPlatformManifestByFamily = jest.fn();
const mockGetBaseUrl = jest.fn(() => "https://registry.example/base");

jest.mock("../../registry/GitHubRegistryFetcher", () => ({
  GitHubRegistryFetcher: jest.fn().mockImplementation(() => ({
    fetchPlatformManifestByFamily: mockFetchPlatformManifestByFamily,
    getBaseUrl: mockGetBaseUrl,
  })),
}));

jest.mock("@battlewithbytes/utils", () => ({
  withBasePath: (p: string) => p,
}));

import {
  loadHeaders,
  clearCachedHeaders,
  hasCachedHeaders,
  loadHeadersFromRegistry,
  type LoadHeadersProgress,
} from "../HeaderLoader";

/** Build a single POSIX tar header + padded data block for one file. */
function tarEntry(name: string, contents: string, typeflag = "0"): Uint8Array {
  const header = new Uint8Array(512);
  const write = (str: string, offset: number) => {
    for (let i = 0; i < str.length; i++) header[offset + i] = str.charCodeAt(i);
  };

  write(name, 0);
  write("000644 ", 100); // mode
  write("000000 ", 108); // uid
  write("000000 ", 116); // gid
  // size: 11 octal digits + NUL, per POSIX
  write(contents.length.toString(8).padStart(11, "0"), 124);
  write("00000000000 ", 136); // mtime
  write(typeflag, 156);

  // Checksum: sum of header bytes with the checksum field read as spaces
  for (let i = 148; i < 156; i++) header[i] = 32;
  let sum = 0;
  for (const b of header) sum += b;
  write(sum.toString(8).padStart(6, "0") + "\0 ", 148);

  const dataLen = Math.ceil(contents.length / 512) * 512;
  const data = new Uint8Array(dataLen);
  for (let i = 0; i < contents.length; i++) data[i] = contents.charCodeAt(i);

  const entry = new Uint8Array(512 + dataLen);
  entry.set(header, 0);
  entry.set(data, 512);
  return entry;
}

/** Assemble entries into a gzipped tar archive with the trailing blocks. */
function makeTarGz(entries: Uint8Array[]): Uint8Array {
  const trailer = new Uint8Array(1024); // two zero blocks end the archive
  const total =
    entries.reduce((n, e) => n + e.length, 0) + trailer.length;
  const tar = new Uint8Array(total);
  let offset = 0;
  for (const e of entries) {
    tar.set(e, offset);
    offset += e.length;
  }
  tar.set(trailer, offset);
  return new Uint8Array(gzipSync(Buffer.from(tar)));
}

/** Minimal Response stand-in exposing the body reader loadHeaders uses. */
function okResponse(body: Uint8Array) {
  return {
    ok: true,
    status: 200,
    headers: { get: (h: string) => (h === "content-length" ? String(body.length) : null) },
    body: {
      getReader: () => {
        let sent = false;
        return {
          read: async () =>
            sent
              ? { done: true, value: undefined }
              : ((sent = true), { done: false, value: body }),
        };
      },
    },
  };
}

const decode = (bytes: Uint8Array) => Buffer.from(bytes).toString("utf8");

describe("HeaderLoader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCache.isValid.mockResolvedValue(false);
    mockCache.getHeaders.mockResolvedValue(null);
    mockCache.setHeaders.mockResolvedValue(undefined);
    mockCache.removeFamily.mockResolvedValue(undefined);
    global.fetch = jest.fn() as unknown as typeof fetch;
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("loadHeaders", () => {
    it("downloads, decompresses, and parses a tar.gz into a header map", async () => {
      const archive = makeTarGz([
        tarEntry("stm32f1xx.h", "#define STM32F1xx 1\n"),
        tarEntry("./core_cm3.h", "#define CORE_CM3 1\n"),
      ]);
      (global.fetch as jest.Mock).mockResolvedValue(okResponse(archive));

      const headers = await loadHeaders("stm32", "f1", "https://x/h.tar.gz", "sha-1");

      expect(headers.size).toBe(2);
      expect(decode(headers.get("/stm32f1xx.h")!)).toContain("STM32F1xx");
      // Leading "./" is normalized away
      expect(decode(headers.get("/core_cm3.h")!)).toContain("CORE_CM3");
    });

    it("skips directory entries and keeps only regular files", async () => {
      const archive = makeTarGz([
        tarEntry("Include/", "", "5"), // directory typeflag
        tarEntry("Include/stm32f1xx.h", "#define OK 1\n"),
      ]);
      (global.fetch as jest.Mock).mockResolvedValue(okResponse(archive));

      const headers = await loadHeaders("stm32", "f1", "https://x/h.tar.gz", "sha-1");

      expect([...headers.keys()]).toEqual(["/Include/stm32f1xx.h"]);
    });

    it("handles a file whose size is not a multiple of 512", async () => {
      // 3-byte file: the parser must still land on the next 512 boundary
      const archive = makeTarGz([
        tarEntry("a.h", "abc"),
        tarEntry("b.h", "#define B 1\n"),
      ]);
      (global.fetch as jest.Mock).mockResolvedValue(okResponse(archive));

      const headers = await loadHeaders("stm32", "f1", "https://x/h.tar.gz", "sha-1");

      expect(decode(headers.get("/a.h")!)).toBe("abc");
      expect(decode(headers.get("/b.h")!)).toContain("#define B 1");
    });

    it("returns cached headers without fetching when the cache is valid", async () => {
      const cached = new Map([["/cached.h", new Uint8Array([1, 2, 3])]]);
      mockCache.isValid.mockResolvedValue(true);
      mockCache.getHeaders.mockResolvedValue(cached);

      const stages: LoadHeadersProgress["stage"][] = [];
      const headers = await loadHeaders(
        "stm32",
        "f1",
        "https://x/h.tar.gz",
        "sha-1",
        (p) => stages.push(p.stage),
      );

      expect(headers).toBe(cached);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(stages).toEqual(["checking", "ready"]);
    });

    it("treats a 404 as 'no headers for this platform', not a failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });
      const progress: LoadHeadersProgress[] = [];

      const headers = await loadHeaders(
        "stm32",
        "f1",
        "https://x/missing.tar.gz",
        "sha-1",
        (p) => progress.push(p),
      );

      expect(headers.size).toBe(0);
      expect(progress.at(-1)?.stage).toBe("warning");
      expect(mockCache.setHeaders).not.toHaveBeenCalled();
    });

    it("throws on non-404 download failures", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

      await expect(
        loadHeaders("stm32", "f1", "https://x/h.tar.gz", "sha-1"),
      ).rejects.toThrow("Failed to download headers: 500");
    });

    it("caches what it parsed and reports progress through to ready", async () => {
      const archive = makeTarGz([tarEntry("stm32f1xx.h", "#define X 1\n")]);
      (global.fetch as jest.Mock).mockResolvedValue(okResponse(archive));
      const stages: LoadHeadersProgress["stage"][] = [];

      await loadHeaders("stm32", "f1", "https://x/h.tar.gz", "sha-99", (p) =>
        stages.push(p.stage),
      );

      expect(stages).toContain("downloading");
      expect(stages).toContain("extracting");
      expect(stages).toContain("caching");
      expect(stages.at(-1)).toBe("ready");
      expect(mockCache.setHeaders).toHaveBeenCalledWith(
        "stm32",
        "f1",
        expect.any(Map),
        "sha-99",
      );
    });
  });

  describe("cache helpers", () => {
    it("clearCachedHeaders removes the family from the cache", async () => {
      await clearCachedHeaders("stm32", "f4");
      expect(mockCache.removeFamily).toHaveBeenCalledWith("stm32", "f4");
    });

    it("hasCachedHeaders delegates to the cache validity check", async () => {
      mockCache.isValid.mockResolvedValue(true);
      await expect(hasCachedHeaders("stm32", "f4", "sha-1")).resolves.toBe(true);
      expect(mockCache.isValid).toHaveBeenCalledWith("stm32", "f4", "sha-1");
    });
  });

  describe("loadHeadersFromRegistry", () => {
    it("warns and returns empty when the manifest has no headers section", async () => {
      mockFetchPlatformManifestByFamily.mockResolvedValue({});
      const progress: LoadHeadersProgress[] = [];

      const headers = await loadHeadersFromRegistry("stm32", "f1", (p) =>
        progress.push(p),
      );

      expect(headers.size).toBe(0);
      expect(progress.at(-1)?.stage).toBe("warning");
    });

    it("survives a manifest fetch that throws", async () => {
      mockFetchPlatformManifestByFamily.mockRejectedValue(new Error("offline"));

      const headers = await loadHeadersFromRegistry("stm32", "f1");

      expect(headers.size).toBe(0);
    });

    it("resolves a relative tar.gz url against the registry base url", async () => {
      mockFetchPlatformManifestByFamily.mockResolvedValue({
        headers: { url: "platforms/stm32/f1/headers.tar.gz", hash: "sha-7" },
      });
      const archive = makeTarGz([tarEntry("stm32f1xx.h", "#define X 1\n")]);
      (global.fetch as jest.Mock).mockResolvedValue(okResponse(archive));

      const headers = await loadHeadersFromRegistry("stm32", "f1");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://registry.example/base/platforms/stm32/f1/headers.tar.gz",
      );
      expect(headers.size).toBe(1);
    });

    it("uses an absolute tar.gz url as-is", async () => {
      mockFetchPlatformManifestByFamily.mockResolvedValue({
        headers: { url: "https://cdn.example/h.tar.gz", hash: "sha-8" },
      });
      const archive = makeTarGz([tarEntry("stm32f1xx.h", "#define X 1\n")]);
      (global.fetch as jest.Mock).mockResolvedValue(okResponse(archive));

      await loadHeadersFromRegistry("stm32", "f1");

      expect(global.fetch).toHaveBeenCalledWith("https://cdn.example/h.tar.gz");
    });

    it("fetches individual files for a github: source, under /device and /cmsis", async () => {
      mockFetchPlatformManifestByFamily.mockResolvedValue({
        headers: {
          source: "github:modm-io/cmsis-header-stm32/stm32f1xx/Include",
          ref: "master",
          files: ["stm32f1xx.h"],
          cmsis: {
            source: "github:ARM-software/CMSIS_5/CMSIS/Core/Include",
            ref: "develop",
            files: ["core_cm3.h"],
          },
        },
      });
      (global.fetch as jest.Mock).mockImplementation(async (url: string) => ({
        ok: true,
        status: 200,
        arrayBuffer: async () => Buffer.from(`content of ${url}`),
      }));

      const headers = await loadHeadersFromRegistry("stm32", "f1");

      const urls = (global.fetch as jest.Mock).mock.calls.map((c) => c[0]);
      expect(urls).toContain(
        "https://raw.githubusercontent.com/modm-io/cmsis-header-stm32/master/stm32f1xx/Include/stm32f1xx.h",
      );
      expect(urls).toContain(
        "https://raw.githubusercontent.com/ARM-software/CMSIS_5/develop/CMSIS/Core/Include/core_cm3.h",
      );
      expect(headers.has("/device/stm32f1xx.h")).toBe(true);
      expect(headers.has("/cmsis/core_cm3.h")).toBe(true);
      // Freestanding libc headers come from llvm-project
      expect(headers.has("/include/stdint.h")).toBe(true);
    });

    it("reports an error stage for a malformed github: source", async () => {
      mockFetchPlatformManifestByFamily.mockResolvedValue({
        headers: { source: "github:incomplete" },
      });
      const progress: LoadHeadersProgress[] = [];

      const headers = await loadHeadersFromRegistry("stm32", "f1", (p) =>
        progress.push(p),
      );

      expect(headers.size).toBe(0);
      expect(progress.some((p) => p.stage === "error")).toBe(true);
    });

    it("skips files that 404 instead of failing the whole load", async () => {
      mockFetchPlatformManifestByFamily.mockResolvedValue({
        headers: {
          source: "github:modm-io/cmsis-header-stm32/Include",
          files: ["present.h", "missing.h"],
          cmsis: { source: "github:ARM-software/CMSIS_5/Include", files: [] },
        },
      });
      (global.fetch as jest.Mock).mockImplementation(async (url: string) =>
        url.includes("missing.h")
          ? { ok: false, status: 404 }
          : { ok: true, status: 200, arrayBuffer: async () => Buffer.from("ok") },
      );

      const headers = await loadHeadersFromRegistry("stm32", "f1");

      expect(headers.has("/device/present.h")).toBe(true);
      expect(headers.has("/device/missing.h")).toBe(false);
    });
  });
});
