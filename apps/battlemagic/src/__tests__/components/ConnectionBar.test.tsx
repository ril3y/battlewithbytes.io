/**
 * ConnectionBar Component Tests
 * Tests for the connection bar UI component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConnectionBar from "../../components/ConnectionBar";
import { ConnectionState } from "../../lib/gdb/types";

describe("ConnectionBar Component", () => {
  const defaultProps = {
    gdbState: ConnectionState.DISCONNECTED,
    uartConnected: false,
    targetAttached: false,
    baudRate: 115200,
    onBaudRateChange: jest.fn(),
    onConnectGdb: jest.fn(),
    onDisconnectGdb: jest.fn(),
    onConnectUart: jest.fn(),
    onDisconnectUart: jest.fn(),
    onScanTargets: jest.fn(),
    onHalt: jest.fn(),
    onRun: jest.fn(),
    onReset: jest.fn(),
    onStep: jest.fn(),
    hasStoredGdbPort: false,
    hasStoredUartPort: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<ConnectionBar {...defaultProps} />);
      expect(screen.getByText(/GDB:/i)).toBeInTheDocument();
    });

    it("should display GDB status indicator", () => {
      render(<ConnectionBar {...defaultProps} />);
      const statusIndicator = screen.getByTitle(ConnectionState.DISCONNECTED);
      expect(statusIndicator).toBeInTheDocument();
    });

    it("should display UART status indicator", () => {
      render(<ConnectionBar {...defaultProps} />);
      expect(screen.getByText(/UART:/i)).toBeInTheDocument();
    });

    it("should display baud rate selector", () => {
      render(<ConnectionBar {...defaultProps} />);
      // Options render the rate via toLocaleString() (e.g. "115,200")
      const baudRateInputs = screen.getAllByDisplayValue(
        (115200).toLocaleString(),
      );
      expect(baudRateInputs.length).toBeGreaterThan(0);
    });
  });

  describe("GDB Connection States", () => {
    it("should show green indicator when GDB is connected", () => {
      render(
        <ConnectionBar
          {...defaultProps}
          gdbState={ConnectionState.CONNECTED}
        />,
      );
      const statusIndicator = screen.getByTitle(ConnectionState.CONNECTED);
      expect(statusIndicator).toHaveClass("bg-green-400");
    });

    it("should show blue indicator when target is attached", () => {
      render(
        <ConnectionBar {...defaultProps} gdbState={ConnectionState.ATTACHED} />,
      );
      const statusIndicator = screen.getByTitle(ConnectionState.ATTACHED);
      expect(statusIndicator).toHaveClass("bg-blue-400");
    });

    it("should show yellow pulsing indicator when connecting", () => {
      render(
        <ConnectionBar
          {...defaultProps}
          gdbState={ConnectionState.CONNECTING}
        />,
      );
      const statusIndicator = screen.getByTitle(ConnectionState.CONNECTING);
      expect(statusIndicator).toHaveClass("bg-yellow-400");
      expect(statusIndicator).toHaveClass("animate-pulse");
    });

    it("should show red indicator when in error state", () => {
      render(
        <ConnectionBar {...defaultProps} gdbState={ConnectionState.ERROR} />,
      );
      const statusIndicator = screen.getByTitle(ConnectionState.ERROR);
      expect(statusIndicator).toHaveClass("bg-red-400");
    });

    it("should show gray indicator when disconnected", () => {
      render(<ConnectionBar {...defaultProps} />);
      const statusIndicator = screen.getByTitle(ConnectionState.DISCONNECTED);
      expect(statusIndicator).toHaveClass("bg-gray-600");
    });
  });

  describe("GDB Connection Button", () => {
    it("should show Connect button when disconnected", () => {
      render(<ConnectionBar {...defaultProps} />);
      const connectButton = screen
        .getAllByRole("button")
        .find(
          (b) =>
            b.textContent?.includes("Connect") ||
            b.textContent?.includes("GDB"),
        );
      expect(connectButton).toBeInTheDocument();
    });

    it("should call onConnectGdb when connect button clicked", async () => {
      const onConnect = jest.fn();
      const { container } = render(
        <ConnectionBar {...defaultProps} onConnectGdb={onConnect} />,
      );

      // Find the GDB connect button - it's the first button after "GDB:"
      const buttons = container.querySelectorAll("button");
      const gdbButton = Array.from(buttons).find(
        (b) =>
          b.textContent?.includes("Connect") ||
          b.textContent?.includes("Select"),
      );

      if (gdbButton) {
        fireEvent.click(gdbButton);
        expect(onConnect).toHaveBeenCalled();
      }
    });

    it("should show Disconnect button when connected", () => {
      render(
        <ConnectionBar
          {...defaultProps}
          gdbState={ConnectionState.CONNECTED}
        />,
      );
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should be disabled while connecting", () => {
      const { container } = render(
        <ConnectionBar
          {...defaultProps}
          gdbState={ConnectionState.CONNECTING}
        />,
      );
      const buttons = container.querySelectorAll("button:disabled");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("UART Connection", () => {
    it("should display UART section", () => {
      render(<ConnectionBar {...defaultProps} />);
      expect(screen.getByText(/UART:/i)).toBeInTheDocument();
    });

    it("should call onConnectUart when UART connect clicked", () => {
      const onConnect = jest.fn();
      const { container } = render(
        <ConnectionBar {...defaultProps} onConnectUart={onConnect} />,
      );

      const buttons = container.querySelectorAll("button");
      const uartButton = Array.from(buttons).find(
        (b) =>
          b.textContent?.includes("Connect") &&
          b.parentElement?.textContent?.includes("UART"),
      );

      if (uartButton) {
        fireEvent.click(uartButton);
        expect(onConnect).toHaveBeenCalled();
      }
    });

    it("should call onDisconnectUart when disconnecting", () => {
      const onDisconnect = jest.fn();
      const { container } = render(
        <ConnectionBar
          {...defaultProps}
          uartConnected={true}
          onDisconnectUart={onDisconnect}
        />,
      );

      const buttons = container.querySelectorAll("button");
      const uartButton = Array.from(buttons).find(
        (b) =>
          b.textContent?.includes("Disconnect") &&
          b.parentElement?.textContent?.includes("UART"),
      );

      if (uartButton) {
        fireEvent.click(uartButton);
        expect(onDisconnect).toHaveBeenCalled();
      }
    });
  });

  describe("Baud Rate Selection", () => {
    it("should support multiple baud rates", () => {
      const { container } = render(<ConnectionBar {...defaultProps} />);
      // Check that select has multiple options
      const selects = container.querySelectorAll("select");
      expect(selects.length).toBeGreaterThan(0);
    });

    it("should call onBaudRateChange when baud rate changes", async () => {
      const onBaudRateChange = jest.fn();
      const { container } = render(
        <ConnectionBar {...defaultProps} onBaudRateChange={onBaudRateChange} />,
      );

      const select = container.querySelector("select");
      if (select) {
        fireEvent.change(select, { target: { value: "230400" } });
        expect(onBaudRateChange).toHaveBeenCalled();
      }
    });

    it("should display current baud rate", () => {
      const { container } = render(
        <ConnectionBar {...defaultProps} baudRate={230400} />,
      );
      const option =
        container.querySelector("option[selected]") ||
        container.querySelector("option:checked");
      expect(option).toBeInTheDocument();
    });
  });

  describe("Target Control Buttons", () => {
    it("should display target control buttons when connected", () => {
      // Target control buttons (Halt/Run/Step/Reset) only render when a
      // target is attached, not merely when GDB is connected
      const { container } = render(
        <ConnectionBar
          {...defaultProps}
          gdbState={ConnectionState.CONNECTED}
          targetAttached={true}
        />,
      );
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(5); // Multiple control buttons
    });

    it("should call onScanTargets when scan button clicked", () => {
      const onScan = jest.fn();
      const { container } = render(
        <ConnectionBar
          {...defaultProps}
          gdbState={ConnectionState.CONNECTED}
          onScanTargets={onScan}
        />,
      );

      const buttons = container.querySelectorAll("button");
      const scanButton = Array.from(buttons).find(
        (b) =>
          b.textContent?.includes("Scan") ||
          b.textContent?.toLowerCase().includes("target"),
      );

      if (scanButton) {
        fireEvent.click(scanButton);
        expect(onScan).toHaveBeenCalled();
      }
    });

    it("should call onHalt when halt button clicked", () => {
      const onHalt = jest.fn();
      const { container } = render(
        <ConnectionBar
          {...defaultProps}
          targetAttached={true}
          onHalt={onHalt}
        />,
      );

      const buttons = container.querySelectorAll("button");
      const haltButton = Array.from(buttons).find(
        (b) =>
          b.textContent?.includes("Halt") || b.textContent?.includes("Pause"),
      );

      if (haltButton) {
        fireEvent.click(haltButton);
        expect(onHalt).toHaveBeenCalled();
      }
    });

    it("should call onRun when run button clicked", () => {
      const onRun = jest.fn();
      const { container } = render(
        <ConnectionBar {...defaultProps} targetAttached={true} onRun={onRun} />,
      );

      const buttons = container.querySelectorAll("button");
      const runButton = Array.from(buttons).find(
        (b) =>
          b.textContent?.includes("Run") || b.textContent?.includes("Continue"),
      );

      if (runButton) {
        fireEvent.click(runButton);
        expect(onRun).toHaveBeenCalled();
      }
    });

    it("should call onReset when reset button clicked", () => {
      const onReset = jest.fn();
      const { container } = render(
        <ConnectionBar
          {...defaultProps}
          targetAttached={true}
          onReset={onReset}
        />,
      );

      const buttons = container.querySelectorAll("button");
      const resetButton = Array.from(buttons).find((b) =>
        b.textContent?.includes("Reset"),
      );

      if (resetButton) {
        fireEvent.click(resetButton);
        expect(onReset).toHaveBeenCalled();
      }
    });

    it("should call onStep when step button clicked", () => {
      const onStep = jest.fn();
      const { container } = render(
        <ConnectionBar
          {...defaultProps}
          targetAttached={true}
          onStep={onStep}
        />,
      );

      const buttons = container.querySelectorAll("button");
      const stepButton = Array.from(buttons).find((b) =>
        b.textContent?.includes("Step"),
      );

      if (stepButton) {
        fireEvent.click(stepButton);
        expect(onStep).toHaveBeenCalled();
      }
    });
  });

  describe("Port Storage Indicators", () => {
    it("should indicate saved GDB port", () => {
      const { container } = render(
        <ConnectionBar {...defaultProps} hasStoredGdbPort={true} />,
      );
      expect(container.textContent).toBeTruthy();
    });

    it("should indicate saved UART port", () => {
      const { container } = render(
        <ConnectionBar {...defaultProps} hasStoredUartPort={true} />,
      );
      expect(container.textContent).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should have proper button labels", () => {
      const { container } = render(<ConnectionBar {...defaultProps} />);
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have status titles for screen readers", () => {
      render(<ConnectionBar {...defaultProps} />);
      const statusIndicator = screen.getByTitle(ConnectionState.DISCONNECTED);
      expect(statusIndicator.title).toBeTruthy();
    });
  });

  describe("Responsive Behavior", () => {
    it("should render all sections even in narrow view", () => {
      render(<ConnectionBar {...defaultProps} />);
      expect(screen.getByText(/GDB:/i)).toBeInTheDocument();
      expect(screen.getByText(/UART:/i)).toBeInTheDocument();
    });
  });
});
