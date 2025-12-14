/**
 * ConnectionPanel Component Tests
 *
 * Tests for the serial connection panel component, including:
 * - Connection state management
 * - Web Serial API integration (mocked)
 * - Quick reconnect functionality
 * - Serial configuration UI
 * - Browser compatibility detection
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConnectionPanel from "../ConnectionPanel";
import { DEFAULT_SERIAL_CONFIG, DeviceInfo } from "../../types";
import * as serialBridge from "../../core/serialBridge";
import * as deviceStorage from "../../utils/deviceStorage";

// Mock dependencies
jest.mock("../../core/serialBridge");
jest.mock("../../utils/deviceStorage");

const mockSerialBridge = serialBridge as jest.Mocked<typeof serialBridge>;
const mockDeviceStorage = deviceStorage as jest.Mocked<typeof deviceStorage>;

describe("ConnectionPanel", () => {
  const mockDeviceInfo: DeviceInfo = {
    vendorId: 0x2e8a,
    productId: 0x000a,
    productName: "uCAN Device",
    manufacturer: "Test Manufacturer",
  };

  const defaultProps = {
    isConnected: false,
    onConnect: jest.fn(),
    onDisconnect: jest.fn(),
    config: DEFAULT_SERIAL_CONFIG,
    onConfigChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSerialBridge.isSerialSupported.mockReturnValue(true);
    mockSerialBridge.getAuthorizedPorts.mockResolvedValue([]);
    mockDeviceStorage.loadLastDevice.mockReturnValue(null);
    mockDeviceStorage.formatDeviceName.mockImplementation((device) =>
      device ? `VID: 0x${device.vendorId?.toString(16)}` : "Unknown Device",
    );
    mockDeviceStorage.isMatchingDevice.mockReturnValue(false);
  });

  describe("Browser Compatibility", () => {
    test("shows warning when Web Serial API is not supported", () => {
      mockSerialBridge.isSerialSupported.mockReturnValue(false);

      render(<ConnectionPanel {...defaultProps} />);

      expect(
        screen.getByText("Web Serial API Not Supported"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Please use Chrome, Edge, or Opera browser/),
      ).toBeInTheDocument();
    });

    test("renders connection UI when Web Serial API is supported", () => {
      mockSerialBridge.isSerialSupported.mockReturnValue(true);

      render(<ConnectionPanel {...defaultProps} />);

      expect(
        screen.queryByText("Web Serial API Not Supported"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Connection")).toBeInTheDocument();
    });
  });

  describe("Connection State - Disconnected", () => {
    test("shows connect button when disconnected", () => {
      render(<ConnectionPanel {...defaultProps} />);

      const connectButton = screen.getByRole("button", {
        name: /Connect to New Device/i,
      });
      expect(connectButton).toBeInTheDocument();
      expect(connectButton).not.toBeDisabled();
    });

    test("calls onConnect when connect button clicked", async () => {
      const user = userEvent.setup();
      const onConnect = jest.fn().mockResolvedValue(undefined);

      render(<ConnectionPanel {...defaultProps} onConnect={onConnect} />);

      const connectButton = screen.getByRole("button", {
        name: /Connect to New Device/i,
      });
      await user.click(connectButton);

      await waitFor(() => {
        expect(onConnect).toHaveBeenCalledWith(
          undefined,
          DEFAULT_SERIAL_CONFIG,
        );
      });
    });

    test("shows loading state while connecting", async () => {
      const user = userEvent.setup();
      const onConnect = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<ConnectionPanel {...defaultProps} onConnect={onConnect} />);

      const connectButton = screen.getByRole("button", {
        name: /Connect to New Device/i,
      });
      await user.click(connectButton);

      expect(screen.getByText("Connecting...")).toBeInTheDocument();
      expect(connectButton).toBeDisabled();
    });
  });

  describe("Connection State - Connected", () => {
    test("shows connected status with device info", () => {
      render(
        <ConnectionPanel
          {...defaultProps}
          isConnected={true}
          deviceInfo={mockDeviceInfo}
        />,
      );

      expect(screen.getByText("Connected")).toBeInTheDocument();
      expect(screen.getByText("uCAN Device")).toBeInTheDocument();
    });

    test("shows disconnect button when connected", () => {
      render(
        <ConnectionPanel
          {...defaultProps}
          isConnected={true}
          deviceInfo={mockDeviceInfo}
        />,
      );

      const disconnectButton = screen.getByRole("button", {
        name: /Disconnect/i,
      });
      expect(disconnectButton).toBeInTheDocument();
    });

    test("calls onDisconnect when disconnect button clicked", async () => {
      const user = userEvent.setup();
      const onDisconnect = jest.fn().mockResolvedValue(undefined);

      render(
        <ConnectionPanel
          {...defaultProps}
          isConnected={true}
          deviceInfo={mockDeviceInfo}
          onDisconnect={onDisconnect}
        />,
      );

      const disconnectButton = screen.getByRole("button", {
        name: /Disconnect/i,
      });
      await user.click(disconnectButton);

      expect(onDisconnect).toHaveBeenCalled();
    });

    test("displays fallback device info when productName not available", () => {
      const deviceInfoNoName = {
        vendorId: 0x2e8a,
        productId: 0x000a,
      };

      render(
        <ConnectionPanel
          {...defaultProps}
          isConnected={true}
          deviceInfo={deviceInfoNoName}
        />,
      );

      expect(screen.getByText(/VID: 0x2e8a, PID: 0xa/i)).toBeInTheDocument();
    });
  });

  describe("Quick Reconnect - Last Device", () => {
    test("shows last connected device when available", async () => {
      const lastDevice = {
        vendorId: 0x2e8a,
        productId: 0x000a,
        lastConnected: Date.now(),
      };

      const mockPort = {
        getInfo: () => ({ usbVendorId: 0x2e8a, usbProductId: 0x000a }),
      } as SerialPort;

      mockDeviceStorage.loadLastDevice.mockReturnValue(lastDevice);
      mockDeviceStorage.isMatchingDevice.mockReturnValue(true);
      mockDeviceStorage.formatDeviceName.mockReturnValue("My uCAN Board");
      mockSerialBridge.getAuthorizedPorts.mockResolvedValue([mockPort]);

      render(<ConnectionPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Last Connected/i)).toBeInTheDocument();
        expect(screen.getByText("My uCAN Board")).toBeInTheDocument();
      });
    });

    test("quick connect button reconnects to last device", async () => {
      const user = userEvent.setup();
      const lastDevice = {
        vendorId: 0x2e8a,
        productId: 0x000a,
        lastConnected: Date.now(),
      };

      const mockPort = {
        getInfo: () => ({ usbVendorId: 0x2e8a, usbProductId: 0x000a }),
      } as SerialPort;

      mockDeviceStorage.loadLastDevice.mockReturnValue(lastDevice);
      mockDeviceStorage.isMatchingDevice.mockReturnValue(true);
      mockDeviceStorage.formatDeviceName.mockReturnValue("My uCAN Board");
      mockSerialBridge.getAuthorizedPorts.mockResolvedValue([mockPort]);

      const onConnect = jest.fn().mockResolvedValue(undefined);

      render(<ConnectionPanel {...defaultProps} onConnect={onConnect} />);

      await waitFor(() => {
        expect(screen.getByText(/Quick Connect/i)).toBeInTheDocument();
      });

      const quickConnectButton = screen.getByRole("button", {
        name: /Quick Connect/i,
      });
      await user.click(quickConnectButton);

      await waitFor(() => {
        expect(onConnect).toHaveBeenCalledWith(mockPort, DEFAULT_SERIAL_CONFIG);
      });
    });

    test("shows warning when last device not currently available", async () => {
      const lastDevice = {
        vendorId: 0x2e8a,
        productId: 0x000a,
        lastConnected: Date.now(),
      };

      mockDeviceStorage.loadLastDevice.mockReturnValue(lastDevice);
      mockDeviceStorage.formatDeviceName.mockReturnValue("My uCAN Board");
      mockSerialBridge.getAuthorizedPorts.mockResolvedValue([]); // No ports available

      render(<ConnectionPanel {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Last Device Not Available/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/My uCAN Board is not currently connected/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Other Authorized Ports", () => {
    test("displays other previously connected devices", async () => {
      const mockPort1 = {
        getInfo: () => ({ usbVendorId: 0x2e8a, usbProductId: 0x000a }),
      } as SerialPort;

      const mockPort2 = {
        getInfo: () => ({ usbVendorId: 0x1234, usbProductId: 0x5678 }),
      } as SerialPort;

      mockSerialBridge.getAuthorizedPorts.mockResolvedValue([
        mockPort1,
        mockPort2,
      ]);

      render(<ConnectionPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Previously Connected:/i)).toBeInTheDocument();
        expect(
          screen.getByText(/VID: 0x2E8A, PID: 0x000A/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/VID: 0x1234, PID: 0x5678/i),
        ).toBeInTheDocument();
      });
    });

    test("can connect to other authorized ports", async () => {
      const user = userEvent.setup();
      const mockPort = {
        getInfo: () => ({ usbVendorId: 0x2e8a, usbProductId: 0x000a }),
      } as SerialPort;

      mockSerialBridge.getAuthorizedPorts.mockResolvedValue([mockPort]);

      const onConnect = jest.fn().mockResolvedValue(undefined);

      render(<ConnectionPanel {...defaultProps} onConnect={onConnect} />);

      await waitFor(() => {
        expect(
          screen.getByText(/VID: 0x2E8A, PID: 0x000A/i),
        ).toBeInTheDocument();
      });

      const portButton = screen.getByText(/VID: 0x2E8A, PID: 0x000A/i);
      await user.click(portButton);

      await waitFor(() => {
        expect(onConnect).toHaveBeenCalledWith(mockPort, DEFAULT_SERIAL_CONFIG);
      });
    });
  });

  describe("Serial Configuration", () => {
    test("shows configuration panel when config button clicked", async () => {
      const user = userEvent.setup();

      render(<ConnectionPanel {...defaultProps} />);

      const configButton = screen.getByRole("button", { name: /Config/i });
      await user.click(configButton);

      expect(screen.getByText("Serial Configuration")).toBeInTheDocument();
      expect(screen.getByLabelText("Baud Rate")).toBeInTheDocument();
    });

    test("allows changing baud rate", async () => {
      const user = userEvent.setup();
      const onConfigChange = jest.fn();

      render(
        <ConnectionPanel {...defaultProps} onConfigChange={onConfigChange} />,
      );

      // Open config panel
      const configButton = screen.getByRole("button", { name: /Config/i });
      await user.click(configButton);

      // Change baud rate
      const baudRateSelect = screen.getByLabelText("Baud Rate");
      await user.selectOptions(baudRateSelect, "230400");

      expect(onConfigChange).toHaveBeenCalledWith({
        ...DEFAULT_SERIAL_CONFIG,
        baudRate: 230400,
      });
    });

    test("allows changing data bits", async () => {
      const user = userEvent.setup();
      const onConfigChange = jest.fn();

      render(
        <ConnectionPanel {...defaultProps} onConfigChange={onConfigChange} />,
      );

      // Open config panel
      const configButton = screen.getByRole("button", { name: /Config/i });
      await user.click(configButton);

      // Change data bits
      const dataBitsSelect = screen.getByLabelText("Data Bits");
      await user.selectOptions(dataBitsSelect, "7");

      expect(onConfigChange).toHaveBeenCalledWith({
        ...DEFAULT_SERIAL_CONFIG,
        dataBits: 7,
      });
    });

    test("displays current configuration summary", () => {
      render(<ConnectionPanel {...defaultProps} />);

      // Should show current config at bottom
      expect(screen.getByText(/115.2k baud, 8N1/i)).toBeInTheDocument();
    });
  });

  describe("Heartbeat Indicator", () => {
    test("shows heartbeat when connected with recent timestamp", () => {
      const lastHeartbeat = new Date();

      render(
        <ConnectionPanel
          {...defaultProps}
          isConnected={true}
          deviceInfo={mockDeviceInfo}
          lastHeartbeat={lastHeartbeat}
        />,
      );

      expect(screen.getByText(/Last heartbeat:/i)).toBeInTheDocument();
      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });

    test("shows time since last heartbeat", () => {
      const lastHeartbeat = new Date(Date.now() - 10000); // 10 seconds ago

      render(
        <ConnectionPanel
          {...defaultProps}
          isConnected={true}
          deviceInfo={mockDeviceInfo}
          lastHeartbeat={lastHeartbeat}
        />,
      );

      expect(screen.getByText(/10s ago/i)).toBeInTheDocument();
    });

    test("does not show heartbeat when disconnected", () => {
      render(<ConnectionPanel {...defaultProps} isConnected={false} />);

      expect(screen.queryByText(/Last heartbeat:/i)).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("all interactive elements are keyboard accessible", () => {
      const { container } = render(<ConnectionPanel {...defaultProps} />);

      const buttons = container.querySelectorAll("button");
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute("tabindex", "-1");
      });
    });

    test("has semantic HTML structure", () => {
      render(<ConnectionPanel {...defaultProps} />);

      // Should have proper heading
      expect(
        screen.getByRole("heading", { name: /Connection/i }),
      ).toBeInTheDocument();
    });
  });
});
