/**
 * Tests for GDB RSP Parser
 *
 * Comprehensive test suite covering all parser types and edge cases.
 */

import { describe, it, expect } from "@jest/globals";
import {
  RspParser,
  RegisterParser,
  MemoryParser,
  StopReplyParser,
  BreakpointParser,
  MonitorParser,
  ErrorParser,
  StopReason,
} from "./RspParser";

describe("RegisterParser", () => {
  describe("parseArmCortexM", () => {
    it("should parse basic register dump with 16 registers", () => {
      // Create response with R0-R15
      // R0=0x00000000, R1=0x00000001, R2=0x00000002, ... R15=0x0000000F
      // Each register is little-endian: 0x12345678 -> "78563412"
      const registers = [
        "00000000", // R0 = 0
        "01000000", // R1 = 1
        "02000000", // R2 = 2
        "03000000", // R3 = 3
        "04000000", // R4 = 4
        "05000000", // R5 = 5
        "06000000", // R6 = 6
        "07000000", // R7 = 7
        "08000000", // R8 = 8
        "09000000", // R9 = 9
        "0a000000", // R10 = 10
        "0b000000", // R11 = 11
        "0c000000", // R12 = 12
        "00002008", // SP = 0x08200000
        "11223344", // LR = 0x44332211
        "00800008", // PC = 0x08008000
      ].join("");

      const result = RegisterParser.parseArmCortexM(registers);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.r0).toBe(0);
        expect(result.data.r1).toBe(1);
        expect(result.data.r2).toBe(2);
        expect(result.data.r12).toBe(12);
        expect(result.data.sp).toBe(0x08200000);
        expect(result.data.lr).toBe(0x44332211);
        expect(result.data.pc).toBe(0x08008000);
      }
    });

    it("should parse full register dump with special registers", () => {
      const registers = [
        // R0-R15 (zeros for simplicity)
        "00000000".repeat(16),
        // XPSR
        "00000001",
        // MSP
        "00002008",
        // PSP
        "00004008",
        // PRIMASK
        "00000000",
        // BASEPRI
        "00000000",
        // FAULTMASK
        "00000000",
        // CONTROL
        "02000000",
      ].join("");

      const result = RegisterParser.parseArmCortexM(registers);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.xpsr).toBe(0x01000000);
        expect(result.data.msp).toBe(0x08200000);
        expect(result.data.psp).toBe(0x08400000);
        expect(result.data.control).toBe(0x02);
      }
    });

    it("should handle invalid hex characters", () => {
      const result = RegisterParser.parseArmCortexM("GGGGGGGG");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid hex characters");
      }
    });

    it("should reject odd-length responses", () => {
      const result = RegisterParser.parseArmCortexM("0000000");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not multiple of 8");
      }
    });

    it("should reject empty responses", () => {
      const result = RegisterParser.parseArmCortexM("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Empty");
      }
    });
  });

  describe("parseSingleRegister", () => {
    it("should parse PC register", () => {
      // PC = 0x08008000
      const result = RegisterParser.parseSingleRegister("00800008", 15);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.regNum).toBe(15);
        expect(result.data.value).toBe(0x08008000);
        expect(result.data.hex).toBe("00800008");
      }
    });

    it("should parse SP register", () => {
      // SP = 0x20000002 (little-endian: 02 00 00 20 -> "02000020")
      const result = RegisterParser.parseSingleRegister("02000020", 13);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.regNum).toBe(13);
        expect(result.data.value).toBe(0x20000002);
      }
    });
  });

  describe("getRegisterName", () => {
    it("should return correct register names", () => {
      expect(RegisterParser.getRegisterName(0)).toBe("r0");
      expect(RegisterParser.getRegisterName(13)).toBe("sp");
      expect(RegisterParser.getRegisterName(14)).toBe("lr");
      expect(RegisterParser.getRegisterName(15)).toBe("pc");
      expect(RegisterParser.getRegisterName(16)).toBe("xpsr");
      expect(RegisterParser.getRegisterName(99)).toBe(null);
    });
  });

  describe("toHex", () => {
    it("should convert value to little-endian hex", () => {
      expect(RegisterParser.toHex(0x08008000)).toBe("00800008");
      expect(RegisterParser.toHex(0x12345678)).toBe("78563412");
      expect(RegisterParser.toHex(0x00000001)).toBe("01000000");
    });
  });
});

describe("MemoryParser", () => {
  describe("parseMemoryRead", () => {
    it("should parse hex memory data", () => {
      // "Hello" in ASCII
      const hex = "48656c6c6f";
      const result = MemoryParser.parseMemoryRead(hex, 0x20000000, 5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.address).toBe(0x20000000);
        expect(result.data.length).toBe(5);
        expect(result.data.hex).toBe(hex);

        const text = new TextDecoder().decode(result.data.data);
        expect(text).toBe("Hello");
      }
    });

    it("should parse binary data", () => {
      const hex = "00112233445566778899aabbccddeeff";
      const result = MemoryParser.parseMemoryRead(hex, 0x08000000, 16);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.length).toBe(16);
        expect(result.data.data[0]).toBe(0x00);
        expect(result.data.data[1]).toBe(0x11);
        expect(result.data.data[15]).toBe(0xff);
      }
    });

    it("should reject invalid hex", () => {
      const result = MemoryParser.parseMemoryRead("GGGGGG", 0x20000000, 3);
      expect(result.success).toBe(false);
    });

    it("should reject odd-length hex", () => {
      const result = MemoryParser.parseMemoryRead("123", 0x20000000, 1);
      expect(result.success).toBe(false);
    });
  });

  describe("parseMemoryWrite", () => {
    it("should parse OK response", () => {
      const result = MemoryParser.parseMemoryWrite("OK", 0x20000000, 4);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
        expect(result.data.address).toBe(0x20000000);
        expect(result.data.length).toBe(4);
      }
    });

    it("should handle non-OK response", () => {
      const result = MemoryParser.parseMemoryWrite("E01", 0x20000000, 4);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(false);
      }
    });
  });

  describe("readWord", () => {
    it("should read 32-bit little-endian word", () => {
      const data = new Uint8Array([0x78, 0x56, 0x34, 0x12]);
      const value = MemoryParser.readWord(data, 0);
      expect(value).toBe(0x12345678);
    });

    it("should throw on read past end", () => {
      const data = new Uint8Array([0x00, 0x01]);
      expect(() => MemoryParser.readWord(data, 0)).toThrow();
    });
  });

  describe("readHalfword", () => {
    it("should read 16-bit little-endian halfword", () => {
      const data = new Uint8Array([0x34, 0x12]);
      const value = MemoryParser.readHalfword(data, 0);
      expect(value).toBe(0x1234);
    });
  });

  describe("toHex", () => {
    it("should convert bytes to hex string", () => {
      const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const hex = MemoryParser.toHex(data);
      expect(hex).toBe("48656c6c6f");
    });
  });
});

describe("StopReplyParser", () => {
  describe("parseDetailed", () => {
    it("should parse basic T packet with signal only", () => {
      const result = StopReplyParser.parseDetailed("T05");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signal).toBe(5);
        expect(result.data.reason).toBe(StopReason.BREAKPOINT);
      }
    });

    it("should parse T packet with thread info", () => {
      const result = StopReplyParser.parseDetailed("T05thread:01;");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signal).toBe(5);
        expect(result.data.thread).toBe(1);
      }
    });

    it("should parse T packet with software breakpoint", () => {
      const result = StopReplyParser.parseDetailed("T05swbreak:;");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signal).toBe(5);
        expect(result.data.reason).toBe(StopReason.BREAKPOINT);
        expect(result.data.rawInfo.has("swbreak")).toBe(true);
      }
    });

    it("should parse T packet with hardware breakpoint", () => {
      const result = StopReplyParser.parseDetailed("T05hwbreak:;");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reason).toBe(StopReason.BREAKPOINT);
      }
    });

    it("should parse T packet with watchpoint", () => {
      const result = StopReplyParser.parseDetailed("T05watch:20000000;");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reason).toBe(StopReason.WATCHPOINT);
        expect(result.data.watchAddr).toBe(0x20000000);
      }
    });

    it("should parse T packet with register values", () => {
      // PC (register 15) = 0x08008000
      const result = StopReplyParser.parseDetailed("T050f:00800008;");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registers).toBeDefined();
        expect(result.data.registers?.get(15)).toBe(0x08008000);
      }
    });

    it("should parse complex T packet", () => {
      const result = StopReplyParser.parseDetailed(
        "T05thread:01;core:00;swbreak:;0d:00002008;0e:11223344;0f:00800008;",
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signal).toBe(5);
        expect(result.data.thread).toBe(1);
        expect(result.data.core).toBe(0);
        expect(result.data.reason).toBe(StopReason.BREAKPOINT);

        // Check registers: SP, LR, PC
        expect(result.data.registers?.get(13)).toBe(0x08200000); // SP
        expect(result.data.registers?.get(14)).toBe(0x44332211); // LR
        expect(result.data.registers?.get(15)).toBe(0x08008000); // PC
      }
    });

    it("should reject non-T packet", () => {
      const result = StopReplyParser.parseDetailed("S05");
      expect(result.success).toBe(false);
    });

    it("should reject malformed T packet", () => {
      const result = StopReplyParser.parseDetailed("T");
      expect(result.success).toBe(false);
    });
  });

  describe("parseSimple", () => {
    it("should parse S packet", () => {
      const result = StopReplyParser.parseSimple("S05");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signal).toBe(5);
        expect(result.data.reason).toBe(StopReason.BREAKPOINT);
      }
    });

    it("should parse SIGINT", () => {
      const result = StopReplyParser.parseSimple("S02");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signal).toBe(2);
        expect(result.data.reason).toBe(StopReason.SIGNAL);
      }
    });

    it("should reject non-S packet", () => {
      const result = StopReplyParser.parseSimple("T05");
      expect(result.success).toBe(false);
    });

    it("should reject wrong length", () => {
      const result = StopReplyParser.parseSimple("S0");
      expect(result.success).toBe(false);
    });
  });

  describe("parse", () => {
    it("should auto-detect T packet", () => {
      const result = StopReplyParser.parse("T05");
      expect(result.success).toBe(true);
    });

    it("should auto-detect S packet", () => {
      const result = StopReplyParser.parse("S05");
      expect(result.success).toBe(true);
    });

    it("should reject invalid packet", () => {
      const result = StopReplyParser.parse("X05");
      expect(result.success).toBe(false);
    });
  });

  describe("getSignalName", () => {
    it("should return signal names", () => {
      expect(StopReplyParser.getSignalName(2)).toBe("SIGINT");
      expect(StopReplyParser.getSignalName(5)).toBe("SIGTRAP");
      expect(StopReplyParser.getSignalName(11)).toBe("SIGSEGV");
      expect(StopReplyParser.getSignalName(99)).toBe("SIG99");
    });
  });
});

describe("BreakpointParser", () => {
  describe("parseInsert", () => {
    it("should parse successful insert", () => {
      const result = BreakpointParser.parseInsert("OK", 0x08000000, 0);

      expect(result.success).toBe(true);
      expect(result.address).toBe(0x08000000);
      expect(result.type).toBe(0);
    });

    it("should parse error response", () => {
      const result = BreakpointParser.parseInsert("E01", 0x08000000, 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Error code");
    });

    it("should handle empty response", () => {
      const result = BreakpointParser.parseInsert("", 0x08000000, 0);

      expect(result.success).toBe(false);
      expect(result.error).toContain("unsupported");
    });
  });

  describe("parseRemove", () => {
    it("should parse successful remove", () => {
      const result = BreakpointParser.parseRemove("OK", 0x08000000, 0);

      expect(result.success).toBe(true);
      expect(result.address).toBe(0x08000000);
    });
  });

  describe("getTypeName", () => {
    it("should return type names", () => {
      expect(BreakpointParser.getTypeName(0)).toBe("Software Breakpoint");
      expect(BreakpointParser.getTypeName(1)).toBe("Hardware Breakpoint");
      expect(BreakpointParser.getTypeName(2)).toBe("Write Watchpoint");
      expect(BreakpointParser.getTypeName(3)).toBe("Read Watchpoint");
      expect(BreakpointParser.getTypeName(4)).toBe("Access Watchpoint");
    });
  });
});

describe("MonitorParser", () => {
  describe("parse", () => {
    it("should parse hex-encoded output", () => {
      // "Hello" in ASCII hex
      const result = MonitorParser.parse("O48656c6c6f");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.output).toBe("Hello");
        expect(result.data.hex).toBe("48656c6c6f");
      }
    });

    it("should parse empty output", () => {
      const result = MonitorParser.parse("O");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.output).toBe("");
      }
    });

    it("should parse multiline output", () => {
      // "Line 1\nLine 2"
      const hex = "4c696e6520310a4c696e652032";
      const result = MonitorParser.parse(`O${hex}`);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.output).toBe("Line 1\nLine 2");
      }
    });

    it("should reject non-O packet", () => {
      const result = MonitorParser.parse("T05");
      expect(result.success).toBe(false);
    });

    it("should reject invalid hex", () => {
      const result = MonitorParser.parse("OGGGGGG");
      expect(result.success).toBe(false);
    });
  });

  describe("encodeCommand", () => {
    it("should encode ASCII to hex", () => {
      expect(MonitorParser.encodeCommand("version")).toBe("76657273696f6e");
      expect(MonitorParser.encodeCommand("swdp_scan")).toBe(
        "737764705f7363616e",
      );
    });
  });
});

describe("ErrorParser", () => {
  describe("parse", () => {
    it("should parse error with known code", () => {
      const result = ErrorParser.parse("E02");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe("02");
        expect(result.data.codeNum).toBe(2);
        expect(result.data.message).toContain("Invalid memory address");
      }
    });

    it("should parse error with unknown code", () => {
      const result = ErrorParser.parse("Eff");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe("ff");
        expect(result.data.codeNum).toBe(255);
        expect(result.data.message).toContain("Unknown error");
      }
    });

    it("should reject non-E packet", () => {
      const result = ErrorParser.parse("OK");
      expect(result.success).toBe(false);
    });

    it("should reject malformed error", () => {
      const result = ErrorParser.parse("E");
      expect(result.success).toBe(false);
    });
  });
});

describe("RspParser", () => {
  describe("parse", () => {
    it("should detect OK response", () => {
      const result = RspParser.parse("OK");
      expect(result.type).toBe("ok");
    });

    it("should detect error response", () => {
      const result = RspParser.parse("E01");
      expect(result.type).toBe("error");
      expect(result.data).toBeDefined();
    });

    it("should detect stop reply", () => {
      const result = RspParser.parse("T05");
      expect(result.type).toBe("stop");
      expect(result.data).toBeDefined();
    });

    it("should detect monitor output", () => {
      const result = RspParser.parse("O48656c6c6f");
      expect(result.type).toBe("monitor");
      expect(result.data).toBeDefined();
    });

    it("should detect data response", () => {
      const result = RspParser.parse("48656c6c6f");
      expect(result.type).toBe("data");
      expect(result.data).toBe("48656c6c6f");
    });

    it("should detect empty response", () => {
      const result = RspParser.parse("");
      expect(result.type).toBe("empty");
    });
  });

  describe("isSuccess", () => {
    it("should return true for OK", () => {
      expect(RspParser.isSuccess("OK")).toBe(true);
    });

    it("should return true for data", () => {
      expect(RspParser.isSuccess("12345678")).toBe(true);
    });

    it("should return false for error", () => {
      expect(RspParser.isSuccess("E01")).toBe(false);
    });

    it("should return false for empty", () => {
      expect(RspParser.isSuccess("")).toBe(false);
    });
  });

  describe("isError", () => {
    it("should return true for error", () => {
      expect(RspParser.isError("E01")).toBe(true);
    });

    it("should return true for empty", () => {
      expect(RspParser.isError("")).toBe(true);
    });

    it("should return false for OK", () => {
      expect(RspParser.isError("OK")).toBe(false);
    });
  });
});
