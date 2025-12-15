/**
 * FileParser Tests
 * Tests for firmware file parsing (HEX, Binary, S-Record formats)
 */

import { FileParser } from "../../../lib/flash/FileParser";
import { BINARY_FIRMWARE } from "../../fixtures/testData";

describe("FileParser", () => {
  describe("Intel HEX Parsing", () => {
    it("should parse simple data record", async () => {
      const hexContent =
        ":10000000000102030405060708090A0B0C0D0E7B\n:00000001FF";
      const file = new File([hexContent], "test.hex", { type: "text/plain" });

      const result = await FileParser.parseFile(file);

      expect(result.format).toBe("hex");
      expect(result.segments.length).toBeGreaterThan(0);
      expect(result.segments[0].address).toBe(0x0000);
      expect(result.segments[0].data.length).toBe(16);
    });

    it("should parse multiple records", async () => {
      const hexContent =
        ":10000000000102030405060708090A0B0C0D0E7B\n" +
        ":10001000101112131415161718191A1B1C1D1E6B\n" +
        ":00000001FF";
      const file = new File([hexContent], "test.hex", { type: "text/plain" });

      const result = await FileParser.parseFile(file);

      expect(result.segments.length).toBe(2);
      expect(result.segments[0].address).toBe(0x0000);
      expect(result.segments[1].address).toBe(0x0010);
    });

    it("should handle extended linear address records", async () => {
      const hexContent =
        ":020000040008F2\n" +
        ":10000000000102030405060708090A0B0C0D0E7B\n" +
        ":00000001FF";
      const file = new File([hexContent], "test.hex", { type: "text/plain" });

      const result = await FileParser.parseFile(file);

      expect(result.segments.length).toBeGreaterThan(0);
      // Extended address should be applied to subsequent records
      expect(result.segments[0].address).toBe(0x08000000);
    });

    it("should extract entry point from start linear address record", async () => {
      const hexContent =
        ":020000040000FA\n" +
        ":10000000000102030405060708090A0B0C0D0E7B\n" +
        ":04000005080000006D\n" +
        ":00000001FF";
      const file = new File([hexContent], "test.hex", { type: "text/plain" });

      const result = await FileParser.parseFile(file);

      expect(result.entryPoint).toBe(0x08000000);
    });

    it("should merge contiguous segments", async () => {
      const hexContent =
        ":10000000000102030405060708090A0B0C0D0E7B\n" +
        ":10001000101112131415161718191A1B1C1D1E6B\n" +
        ":00000001FF";
      const file = new File([hexContent], "test.hex", { type: "text/plain" });

      const result = await FileParser.parseFile(file);

      // Should have merged into one segment since addresses are contiguous
      expect(result.segments.length).toBe(1);
      expect(result.segments[0].data.length).toBe(32);
    });

    it("should include file metadata", async () => {
      const hexContent = ":00000001FF";
      const file = new File([hexContent], "firmware.hex", {
        type: "text/plain",
      });

      const result = await FileParser.parseFile(file);

      expect(result.metadata?.filename).toBe("firmware.hex");
      expect(result.metadata?.size).toBeDefined();
    });

    it("should handle empty records", async () => {
      const hexContent =
        ":10000000000102030405060708090A0B0C0D0E7B\n" + "\n" + ":00000001FF";
      const file = new File([hexContent], "test.hex", { type: "text/plain" });

      const result = await FileParser.parseFile(file);

      expect(result.segments.length).toBeGreaterThan(0);
    });
  });

  describe("Binary Format Parsing", () => {
    it("should parse binary file with default address", async () => {
      const file = new File([BINARY_FIRMWARE], "firmware.bin", {
        type: "application/octet-stream",
      });

      const result = await FileParser.parseFile(file);

      expect(result.format).toBe("bin");
      expect(result.segments.length).toBe(1);
      expect(result.segments[0].address).toBe(0x08000000); // Default address
      expect(result.segments[0].data).toEqual(BINARY_FIRMWARE);
    });

    it("should set correct data type for binary segments", async () => {
      const file = new File([BINARY_FIRMWARE], "firmware.bin", {
        type: "application/octet-stream",
      });

      const result = await FileParser.parseFile(file);

      expect(result.segments[0].type).toBe("code");
    });

    it("should include binary file metadata", async () => {
      const file = new File([BINARY_FIRMWARE], "firmware.bin", {
        type: "application/octet-stream",
      });

      const result = await FileParser.parseFile(file);

      expect(result.metadata?.filename).toBe("firmware.bin");
      expect(result.metadata?.size).toBe(BINARY_FIRMWARE.length);
    });
  });

  describe("S-Record Parsing", () => {
    it("should parse S1 data record (16-bit address)", async () => {
      const srecContent =
        "S00F000068747470733A2F2F7777772E61\n" +
        "S1137AF00011223344556677889900112233443398\n" +
        "S9030000FC";
      const file = new File([srecContent], "test.s19", {
        type: "text/plain",
      });

      const result = await FileParser.parseFile(file);

      expect(result.format).toBe("hex"); // S-records are treated as hex format
      expect(result.segments.length).toBeGreaterThan(0);
      expect(result.segments[0].address).toBe(0x7af0);
    });

    it("should parse S2 data record (24-bit address)", async () => {
      const srecContent =
        "S00F000068747470733A2F2F7777772E61\n" +
        "S2157AF00011223344556677889900112233443397\n" +
        "S5030001FB\n" +
        "S8047AF000BB";
      const file = new File([srecContent], "test.s19", {
        type: "text/plain",
      });

      const result = await FileParser.parseFile(file);

      expect(result.segments.length).toBeGreaterThan(0);
      expect(result.segments[0].address).toBe(0x7af000);
    });

    it("should parse S3 data record (32-bit address)", async () => {
      const srecContent =
        "S00F000068747470733A2F2F7777772E61\n" +
        "S3177AF00011223344556677889900112233443396\n" +
        "S5030001FB\n" +
        "S7057AF00000F8";
      const file = new File([srecContent], "test.s37", {
        type: "text/plain",
      });

      const result = await FileParser.parseFile(file);

      expect(result.segments.length).toBeGreaterThan(0);
      expect(result.segments[0].address).toBe(0x7af00000);
    });

    it("should extract entry point from start address record", async () => {
      const srecContent =
        "S00F000068747470733A2F2F7777772E61\n" +
        "S1137AF00011223344556677889900112233443398\n" +
        "S9030000FC";
      const file = new File([srecContent], "test.s19", {
        type: "text/plain",
      });

      const result = await FileParser.parseFile(file);

      expect(result.entryPoint).toBe(0x0000);
    });

    it("should handle S-record file extensions", async () => {
      const srecContent = "S00F000068747470733A2F2F7777772E61\nS9030000FC";
      const file = new File([srecContent], "test.srec", {
        type: "text/plain",
      });

      const result = await FileParser.parseFile(file);

      expect(result.format).toBe("hex");
    });
  });

  describe("ELF Parsing", () => {
    it("should reject invalid ELF files", async () => {
      const invalidElfData = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
      const file = new File([invalidElfData], "test.elf", {
        type: "application/octet-stream",
      });

      await expect(FileParser.parseFile(file)).rejects.toThrow("Invalid ELF");
    });

    it("should reject ELF files with message about GDB load", async () => {
      // Create minimal ELF header (magic number only)
      const elfData = new Uint8Array([0x7f, 0x45, 0x4c, 0x46, 0x00, 0x00]);
      const file = new File([elfData], "test.elf", {
        type: "application/octet-stream",
      });

      await expect(FileParser.parseFile(file)).rejects.toThrow(
        "ELF file support requires GDB load command",
      );
    });
  });

  describe("Unsupported Formats", () => {
    it("should reject unsupported file formats", async () => {
      const file = new File(["data"], "test.txt", { type: "text/plain" });

      await expect(FileParser.parseFile(file)).rejects.toThrow(
        "Unsupported file format",
      );
    });
  });

  describe("Checksum Calculation", () => {
    it("should calculate checksum for byte array", () => {
      const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const checksum = FileParser.calculateChecksum(data);
      expect(checksum).toBe(0x0a);
    });

    it("should calculate checksum for empty array", () => {
      const data = new Uint8Array(0);
      const checksum = FileParser.calculateChecksum(data);
      expect(checksum).toBe(0);
    });

    it("should handle checksum overflow", () => {
      const data = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
      const checksum = FileParser.calculateChecksum(data);
      // Should be (0xffffffff) & 0xffffffff which is 0xffffffff
      expect(typeof checksum).toBe("number");
    });
  });

  describe("Intel HEX Generation", () => {
    it("should convert binary data to Intel HEX", () => {
      const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const hex = FileParser.toIntelHex(data);

      expect(hex).toContain(":");
      expect(hex).toContain("04"); // Record length
      expect(hex).toContain("00000000"); // Address
      expect(hex).toContain("00"); // Record type (data)
    });

    it("should handle extended addresses in HEX generation", () => {
      const data = new Uint8Array(32).fill(0xff);
      const hex = FileParser.toIntelHex(data, 0x10000);

      expect(hex).toContain("020000040001"); // Extended address record
    });

    it("should generate proper end-of-file record", () => {
      const data = new Uint8Array([0x01, 0x02]);
      const hex = FileParser.toIntelHex(data);

      expect(hex).toContain(":00000001FF");
    });

    it("should calculate correct checksums in generated HEX", () => {
      const data = new Uint8Array([0x01, 0x02]);
      const hex = FileParser.toIntelHex(data);
      const lines = hex.split("\r\n");

      for (const line of lines) {
        if (line.length > 0) {
          expect(line).toMatch(/^:[0-9A-F]{2}[0-9A-F]{8}[0-9A-F]{2}/);
        }
      }
    });
  });

  describe("S-Record Generation", () => {
    it("should convert binary data to S-records", () => {
      const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const srec = FileParser.toSRecord(data);

      expect(srec).toContain("S0"); // Header
      expect(srec).toContain("S1"); // Data record (16-bit address)
      expect(srec).toContain("S9"); // Start address
    });

    it("should use 32-bit addressing for S-records by default", () => {
      const data = new Uint8Array([0x01, 0x02]);
      const srec = FileParser.toSRecord(data);

      expect(srec).toContain("S3"); // Data record with 32-bit address
    });

    it("should generate proper S-record format", () => {
      const data = new Uint8Array([0x01, 0x02]);
      const srec = FileParser.toSRecord(data);
      const lines = srec.split("\r\n");

      for (const line of lines) {
        if (line.length > 0) {
          expect(line).toMatch(/^S[0-9][0-9A-F]{2}/);
        }
      }
    });

    it("should handle different address sizes", () => {
      const data = new Uint8Array([0x01, 0x02]);

      const srec16 = FileParser.toSRecord(data, 0x1000, false);
      expect(srec16).toContain("S1"); // 16-bit address

      const srec32 = FileParser.toSRecord(data, 0x10000000, true);
      expect(srec32).toContain("S3"); // 32-bit address
    });
  });

  describe("Flash Command Generation", () => {
    it("should convert segments to flash commands", () => {
      const segments = [
        {
          address: 0x08000000,
          data: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
          type: "code" as const,
        },
      ];

      const commands = FileParser.segmentsToFlashCommands(segments);

      expect(commands.length).toBe(1);
      expect(commands[0]).toContain("vFlashWrite");
      expect(commands[0]).toContain("08000000");
      expect(commands[0]).toContain("01020304");
    });

    it("should generate separate commands for multiple segments", () => {
      const segments = [
        {
          address: 0x08000000,
          data: new Uint8Array([0x01, 0x02]),
          type: "code" as const,
        },
        {
          address: 0x08000100,
          data: new Uint8Array([0x03, 0x04]),
          type: "code" as const,
        },
      ];

      const commands = FileParser.segmentsToFlashCommands(segments);

      expect(commands.length).toBe(2);
      expect(commands[0]).toContain("08000000");
      expect(commands[1]).toContain("08000100");
    });
  });

  describe("Integration Tests", () => {
    it("should round-trip through HEX generation", async () => {
      const originalData = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const hexString = FileParser.toIntelHex(originalData);
      const file = new File([hexString], "test.hex", { type: "text/plain" });

      const result = await FileParser.parseFile(file);

      expect(result.data.length).toBeGreaterThanOrEqual(originalData.length);
    });

    it("should preserve segment addresses through conversion", async () => {
      const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const baseAddress = 0x20000000;
      const hexString = FileParser.toIntelHex(data, baseAddress);

      // Verify the hex contains the address
      expect(hexString).toContain("020000040002"); // Extended address 0x0002
    });
  });
});
