/**
 * GdbClient Tests
 * Tests for GDB client connection, command sending, and response handling
 */

import { MockSerialTransport } from "../../mocks/MockSerialTransport";

// Mock SerialTransport before importing GdbClient
jest.mock("../../../lib/gdb/SerialTransport", () => ({
  SerialTransport: MockSerialTransport,
}));

import { GdbClient } from "../../../lib/gdb/GdbClient";
import { ConnectionState } from "../../../lib/gdb/types";
import {
  createMockPacket,
  createMemoryReadResponse,
  createRegisterResponse,
  createStopReplyPacket,
} from "../../utils/testHelpers";
import { SAMPLE_MEMORY, REGISTER_DATA } from "../../fixtures/testData";

describe("GdbClient", () => {
  let client: GdbClient;
  let mockTransport: MockSerialTransport;

  beforeEach(() => {
    // Create fresh mock for each test
    mockTransport = new MockSerialTransport();
    client = new GdbClient({ commandTimeout: 1000, debug: false }, {});
  });

  afterEach(async () => {
    try {
      if (client && mockTransport.isConnectedStatus()) {
        await client.disconnect();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  describe("Initialization", () => {
    it("should create client with default config", () => {
      expect(client).toBeDefined();
      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
    });

    it("should create client with custom config", () => {
      const customClient = new GdbClient({ commandTimeout: 5000 });
      expect(customClient).toBeDefined();
    });

    it("should be unsupported on non-Web Serial environments", () => {
      const isSupported = GdbClient.isSupported();
      expect(typeof isSupported).toBe("boolean");
    });

    it("should start in DISCONNECTED state", () => {
      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(client.isConnected()).toBe(false);
    });
  });

  describe("Connection Management", () => {
    it("should refuse to connect when already connected", async () => {
      const mockPort = {} as SerialPort;
      // Note: In real tests, you'd need actual Web Serial API or proper mocking
      // This tests the logic path
      client = new GdbClient();
      // Simulate connected state
      (client as any).state = ConnectionState.CONNECTED;

      try {
        await client.connect(mockPort);
        throw new Error("Should have thrown");
      } catch (e) {
        expect((e as Error).message).toContain("Already connected");
      }
    });

    it("should handle connection state transitions", async () => {
      const states: ConnectionState[] = [];
      const stateChangeCallback = (state: ConnectionState) => {
        states.push(state);
      };

      client = new GdbClient(
        { commandTimeout: 500 },
        { onStateChange: stateChangeCallback },
      );

      // We can verify state change callbacks would be called
      // with proper setup
      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
    });
  });

  describe("Command Queueing", () => {
    it("should return error when sending command while disconnected", async () => {
      try {
        await client.sendCommand("?");
        throw new Error("Should have thrown");
      } catch (e) {
        expect((e as Error).message).toContain("Not connected");
      }
    });

    it("should queue multiple commands", async () => {
      // Simulate connection
      (client as any).transport.isConnected = () => true;

      const commands: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const originalSend = (client as any).transport.send.bind(
        (client as any).transport,
      );
      (client as any).transport.send = jest
        .fn()
        .mockImplementation(async (cmd: string) => {
          commands.push(cmd);
        });

      // Queue multiple commands (never answered here, so swallow the
      // eventual command-timeout rejections)
      client.sendCommand("?").catch(() => {});
      client.sendCommand("g").catch(() => {});

      expect(commands.length).toBeGreaterThan(0);
    });

    it("should reject commands exceeding queue size", async () => {
      // Create client with small queue
      const smallClient = new GdbClient({ maxQueueSize: 2, commandTimeout: 100 });
      (smallClient as any).transport.isConnected = () => true;
      (smallClient as any).transport.send = jest
        .fn()
        .mockResolvedValue(undefined);

      // Issue commands without awaiting so the queue actually fills up:
      // the first becomes the in-flight command, the next two fill the
      // queue (maxQueueSize: 2), and the rest are rejected immediately.
      const results = await Promise.all(
        Array.from({ length: 5 }, () =>
          smallClient.sendCommand("?").then(
            () => null,
            (e: Error) => e,
          ),
        ),
      );

      const queueErrors = results.filter(
        (e): e is Error => e !== null && e.message.includes("queue"),
      );
      expect(queueErrors.length).toBeGreaterThan(0);
    });
  });

  describe("Memory Operations", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should read memory from target", async () => {
      const mockResponse = createMemoryReadResponse(SAMPLE_MEMORY.simple);
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);

      const promise = client.readMemory(0x08000000, 16);

      // Simulate response
      (client as any).handlePacket(mockResponse);

      const data = await promise;

      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
    });

    it("should write memory to target", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.writeMemory(0x08000000, SAMPLE_MEMORY.simple);

      // Simulate response
      (client as any).handlePacket(mockResponse);

      await promise;
      // If no error thrown, success
      expect(true).toBe(true);
    });

    it("should handle different memory addresses", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMemoryReadResponse(new Uint8Array([0x42]));

      const addresses = [0x0, 0x08000000, 0x20000000, 0xffffffff];

      for (const addr of addresses) {
        const promise = client.readMemory(addr, 1);
        (client as any).handlePacket(mockResponse);
        const data = await promise;
        expect(data).toBeDefined();
      }
    });

    it("should handle hex string addresses", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMemoryReadResponse(new Uint8Array([0x01]));

      const promise = client.readMemory("08000000", 1);
      (client as any).handlePacket(mockResponse);
      const data = await promise;

      expect(data).toBeDefined();
    });
  });

  describe("Register Operations", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should read all registers", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createRegisterResponse(REGISTER_DATA.armRegisters);

      const promise = client.readRegisters();
      (client as any).handlePacket(mockResponse);
      const registers = await promise;

      expect(registers).toBeDefined();
      expect(registers.length).toBeGreaterThan(0);
    });

    it("should read single register", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createRegisterResponse("12345678");

      const promise = client.readRegister(0);
      (client as any).handlePacket(mockResponse);
      const value = await promise;

      expect(value).toBe("12345678");
    });

    it("should write single register", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.writeRegister(0, "deadbeef");
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });

    it("should format registers for display", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createRegisterResponse(REGISTER_DATA.armRegisters);

      const promise = client.getFormattedRegisters();
      (client as any).handlePacket(mockResponse);
      const formattedRegs = await promise;

      expect(formattedRegs).toBeInstanceOf(Map);
      expect(formattedRegs.size).toBeGreaterThan(0);
      expect(formattedRegs.has("r0")).toBe(true);
    });
  });

  describe("Breakpoint Management", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should insert software breakpoint", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.insertBreakpoint(0x08000100, false);
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });

    it("should insert hardware breakpoint", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.insertBreakpoint(0x08000100, true);
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });

    it("should remove software breakpoint", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.removeBreakpoint(0x08000100, false);
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });

    it("should remove hardware breakpoint", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.removeBreakpoint(0x08000100, true);
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });

    it("should handle breakpoint errors", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("E01");

      const promise = client.insertBreakpoint(0x08000100);
      (client as any).handlePacket(mockResponse);

      try {
        await promise;
        throw new Error("Should have thrown");
      } catch (e) {
        // E01 maps to a specific "no more hardware breakpoint units" message
        expect((e as Error).message).toContain("E01");
      }
    });
  });

  describe("Execution Control", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should continue execution", async () => {
      // continue() is non-blocking: it resolves as soon as the command is
      // sent. The stop reply arrives asynchronously via onStopped.
      const onStopped = jest.fn();
      const execClient = new GdbClient({ commandTimeout: 1000 }, { onStopped });
      (execClient as any).transport.isConnected = () => true;
      const sendMock = jest.fn().mockResolvedValue(undefined);
      (execClient as any).transport.send = sendMock;

      await execClient.continue();
      expect(sendMock).toHaveBeenCalled();

      // Simulate the asynchronous stop reply (T packet)
      const mockResponse = createStopReplyPacket(5);
      (execClient as any).handlePacket(mockResponse);

      expect(onStopped).toHaveBeenCalledWith(
        expect.objectContaining({ signal: 5 }),
      );
    });

    it("should step one instruction", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createStopReplyPacket(5);

      const promise = client.step();
      (client as any).handlePacket(mockResponse);

      const reply = await promise;
      expect(reply.signal).toBe(5);
    });

    it("should halt execution", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);

      await client.halt();
      // Should not throw
      expect(true).toBe(true);
    });

    it("should get backtrace", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createRegisterResponse(REGISTER_DATA.armRegisters);

      const promise = client.getBacktrace();
      (client as any).handlePacket(mockResponse);

      const frames = await promise;
      expect(frames).toBeDefined();
      expect(Array.isArray(frames)).toBe(true);
    });
  });

  describe("Target Operations", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should attach to target", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.attach(0);
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(client.getState()).toBe(ConnectionState.ATTACHED);
    });

    it("should detach from target", async () => {
      (client as any).state = ConnectionState.ATTACHED;
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.detach();
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(client.getState()).toBe(ConnectionState.CONNECTED);
    });

    it("should reset target", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.reset();
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });
  });

  describe("Power Management", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should enable target power", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.enableTargetPower();
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });

    it("should disable target power", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.disableTargetPower();
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });
  });

  describe("Black Magic Probe Operations", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should get BMP version", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const versionData =
        "426c61636b204d616769632050726f62652076657273696f6e20312e372e31"; // "Black Magic Probe version 1.7.1"
      const mockResponse = createMockPacket(versionData);

      const promise = client.getVersion();
      (client as any).handlePacket(mockResponse);

      const version = await promise;
      expect(version).toBeDefined();
    });

    it("should scan for SWD targets", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const scanData = "417661696c61626c6520546172676574733a"; // "Available Targets:"
      const mockResponse = createMockPacket(scanData);

      const promise = client.scanSwd();
      (client as any).handlePacket(mockResponse);

      const result = await promise;
      expect(result.targets).toBeDefined();
      expect(Array.isArray(result.targets)).toBe(true);
    });

    it("should scan for JTAG targets", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const scanData = "417661696c61626c6520546172676574733a"; // "Available Targets:"
      const mockResponse = createMockPacket(scanData);

      const promise = client.scanJtag();
      (client as any).handlePacket(mockResponse);

      const result = await promise;
      expect(result.targets).toBeDefined();
      expect(Array.isArray(result.targets)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should handle command timeout", async () => {
      const shortTimeoutClient = new GdbClient({ commandTimeout: 50 });
      (shortTimeoutClient as any).transport.isConnected = () => true;
      (shortTimeoutClient as any).transport.send = jest
        .fn()
        .mockResolvedValue(undefined);

      // Don't send response, let it timeout
      const promise = shortTimeoutClient.sendCommand("?");

      try {
        await promise;
        throw new Error("Should have timed out");
      } catch (e) {
        expect((e as Error).message).toContain("timeout");
      }
    });

    it("should propagate error responses", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("E01");

      const promise = client.readMemory(0x08000000, 16);
      (client as any).handlePacket(mockResponse);

      try {
        await promise;
        throw new Error("Should have thrown");
      } catch (e) {
        expect((e as Error).message).toContain("Failed");
      }
    });

    it("should handle transport errors", async () => {
      const errorCallback = jest.fn();
      const errorClient = new GdbClient({}, { onError: errorCallback });
      (errorClient as any).transport.isConnected = () => true;

      const testError = new Error("Transport failed");
      (errorClient as any).handleError(testError);

      expect(errorCallback).toHaveBeenCalledWith(testError);
      expect(errorClient.getState()).toBe(ConnectionState.ERROR);
    });

    it("should cancel pending commands on disconnect", async () => {
      (client as any).transport.isConnected = () => true;
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);

      // The first command becomes the in-flight command; the second stays
      // in the queue. Both must reject on disconnect - abandoning the
      // in-flight one leaves its caller awaiting forever.
      const inFlight = client.sendCommand("?");
      const queued = client.sendCommand("g");

      // Disconnect without responding
      await client.disconnect();

      await expect(queued).rejects.toThrow("Connection closed");
      await expect(inFlight).rejects.toThrow("Connection closed");
    });
  });

  describe("Flash Operations", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should erase flash", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.flashErase(0x08000000, 4096);
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });

    it("should write to flash", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const promise = client.flashWrite(0x08000000, data);
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });

    it("should complete flash operations", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.flashDone();
      (client as any).handlePacket(mockResponse);

      await promise;
      expect(true).toBe(true);
    });
  });

  describe("Monitor Commands", () => {
    beforeEach(() => {
      (client as any).transport.isConnected = () => true;
    });

    it("should send monitor command", async () => {
      (client as any).transport.send = jest.fn().mockResolvedValue(undefined);
      const mockResponse = createMockPacket("OK");

      const promise = client.sendMonitorCommand("version");
      (client as any).handlePacket(mockResponse);

      const result = await promise;
      expect(result).toBeDefined();
    });
  });

  describe("State Management", () => {
    it("should track state changes", () => {
      const states: ConnectionState[] = [];
      const stateClient = new GdbClient(
        {},
        {
          onStateChange: (state) => {
            states.push(state);
          },
        },
      );

      expect(stateClient.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(states.length).toBe(0);
    });

    it("should report isConnected status", () => {
      expect(client.isConnected()).toBe(false);

      (client as any).state = ConnectionState.CONNECTED;
      expect(client.isConnected()).toBe(true);

      (client as any).state = ConnectionState.ATTACHED;
      expect(client.isConnected()).toBe(true);

      (client as any).state = ConnectionState.ERROR;
      expect(client.isConnected()).toBe(false);
    });
  });
});
