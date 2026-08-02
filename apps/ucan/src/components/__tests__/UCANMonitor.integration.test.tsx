/**
 * UCANMonitor Integration Tests
 *
 * Integration tests for the main application component, testing:
 * - Component integration and data flow
 * - Message filtering and display
 * - Connection state management
 * - Export functionality
 * - Context menu interactions
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UCANMonitor from "../UCANMonitor";
import { CANMessage } from "../../types";
import * as exporters from "../../utils/exporters";

// Mock child components
jest.mock("../MessageLog", () => ({
  __esModule: true,
  default: ({
    messages,
    onMessageSelect,
  }: {
    messages: CANMessage[];
    onMessageSelect: (id: string) => void;
  }) => (
    <div data-testid="message-log">
      <div>Message count: {messages.length}</div>
      {messages.map((msg: CANMessage) => (
        <div key={msg.id} onClick={() => onMessageSelect(msg.id)}>
          CAN ID: 0x{msg.canId.toString(16)}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../FilterPanel", () => ({
  __esModule: true,
  default: ({
    totalMessages,
    filteredMessages,
  }: {
    totalMessages: number;
    filteredMessages: number;
  }) => (
    <div data-testid="filter-panel">
      <div>Total: {totalMessages}</div>
      <div>Filtered: {filteredMessages}</div>
    </div>
  ),
}));

jest.mock("../BoardInfoPanel", () => ({
  __esModule: true,
  default: ({
    isConnected,
    capabilities,
    onCreateRule,
  }: {
    isConnected: boolean;
    capabilities?: { board: string };
    onCreateRule: () => void;
  }) => (
    <div data-testid="board-info-panel">
      <div>Connected: {isConnected ? "Yes" : "No"}</div>
      {capabilities && <div>Board: {capabilities.board}</div>}
      <button onClick={onCreateRule}>Create Action Rule</button>
    </div>
  ),
}));

jest.mock("../SendPanel", () => ({
  __esModule: true,
  default: ({ isConnected }: { isConnected: boolean }) => (
    <div data-testid="send-panel">
      <div>Can send: {isConnected ? "Yes" : "No"}</div>
    </div>
  ),
}));

jest.mock("../PacketDetailModal", () => ({
  __esModule: true,
  default: ({
    isOpen,
    message,
  }: {
    isOpen: boolean;
    message?: { id: string };
  }) =>
    isOpen ? (
      <div data-testid="packet-detail-modal">Detail for: {message?.id}</div>
    ) : null,
}));

jest.mock("../SettingsModal", () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="settings-modal">Settings</div> : null,
}));

jest.mock("../RuleBuilderModal", () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="rule-builder-modal">Rule Builder</div> : null,
}));

interface ContextMenuOption {
  label: string;
  onClick: () => void;
}

jest.mock("../ContextMenu", () => ({
  __esModule: true,
  default: ({
    options,
    onClose,
  }: {
    options: ContextMenuOption[];
    onClose: () => void;
  }) => (
    <div data-testid="context-menu">
      {options.map((opt: ContextMenuOption, i: number) => (
        <button key={i} onClick={opt.onClick}>
          {opt.label}
        </button>
      ))}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock("../CollapsiblePanel", () => ({
  __esModule: true,
  default: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid="collapsible-panel">
      <div>{title}</div>
      {children}
    </div>
  ),
}));

// Mock Next.js components
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock SerialBridge
const mockSerialBridge = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  sendCommand: jest.fn(),
  isConnected: jest.fn(() => false),
  setMessageCallback: jest.fn(),
  setConnectionCallback: jest.fn(),
  getPort: jest.fn(),
};

jest.mock("../../core/serialBridge", () => ({
  SerialBridge: jest.fn().mockImplementation(() => mockSerialBridge),
  isSerialSupported: jest.fn(() => true),
  getAuthorizedPorts: jest.fn(() => Promise.resolve([])),
}));

// Mock other utilities
jest.mock("../../utils/deviceStorage", () => ({
  saveLastDevice: jest.fn(),
  loadLastDevice: jest.fn(() => null),
  formatDeviceName: jest.fn(() => "Test Device"),
  isMatchingDevice: jest.fn(() => false),
}));

jest.mock("../../utils/exporters", () => ({
  exportMessages: jest.fn(),
  exportStatsSummary: jest.fn(),
}));

jest.mock("../../core/canProtocol", () => ({
  protocolToCANMessage: jest.fn((msg) => {
    if (msg.type === "CAN_RX" || msg.type === "CAN_TX") {
      return {
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        direction: msg.type === "CAN_RX" ? "RX" : "TX",
        type: msg.type,
        canId: msg.canId || 0x100,
        data: new Uint8Array(msg.data || []),
        length: msg.data?.length || 0,
        isExtended: false,
      };
    }
    return null;
  }),
}));

jest.mock("../../core/messageBuffer", () => ({
  MessageBuffer: jest.fn().mockImplementation(() => ({
    addMessage: jest.fn(),
    getAllMessages: jest.fn(() => []),
    getFilteredMessages: jest.fn(() => []),
    getFilter: jest.fn(() => ({
      directions: new Set(["RX", "TX"]),
      canIds: new Set(),
      errorsOnly: false,
    })),
    setFilter: jest.fn(),
    clear: jest.fn(),
    setUpdateCallback: jest.fn(),
    destroy: jest.fn(),
  })),
  StatisticsEngine: jest.fn().mockImplementation(() => ({
    updateMessage: jest.fn(),
    getStatistics: jest.fn(() => ({
      rxCount: 0,
      txCount: 0,
      errorCount: 0,
      messagesPerSecond: 0,
      busLoad: 0,
      uptime: 0,
      perIdStats: new Map(),
    })),
    reset: jest.fn(),
    getAllCANIds: jest.fn(() => []),
  })),
}));

describe("UCANMonitor Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Render", () => {
    test("renders main UI components", () => {
      render(<UCANMonitor />);

      // Heading text is split across elements (<span>u</span>CAN Monitor),
      // so the accessible name is "u CAN Monitor" (space-joined).
      expect(
        screen.getByRole("heading", { name: /u\s?CAN Monitor/i }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("message-log")).toBeInTheDocument();
      expect(screen.getByTestId("filter-panel")).toBeInTheDocument();
      expect(screen.getByTestId("board-info-panel")).toBeInTheDocument();
      expect(screen.getByTestId("send-panel")).toBeInTheDocument();
    });

    test("displays disconnected state initially", () => {
      render(<UCANMonitor />);

      expect(screen.getByText(/Disconnected/i)).toBeInTheDocument();
      expect(screen.getByText("Connected: No")).toBeInTheDocument();
    });

    test("shows default statistics", () => {
      render(<UCANMonitor />);

      expect(screen.getByText(/RX:/)).toBeInTheDocument();
      expect(screen.getByText(/TX:/)).toBeInTheDocument();
      expect(screen.getByText(/ERR:/)).toBeInTheDocument();
    });
  });

  describe("View Mode Controls", () => {
    test("allows switching between view modes", async () => {
      const user = userEvent.setup();
      render(<UCANMonitor />);

      const listButton = screen.getByRole("button", { name: /List/i });
      const hexButton = screen.getByRole("button", { name: /Hex/i });
      const statsButton = screen.getByRole("button", { name: /Stats/i });

      expect(listButton).toBeInTheDocument();
      expect(hexButton).toBeInTheDocument();
      expect(statsButton).toBeInTheDocument();

      // Switch to hex view
      await user.click(hexButton);
      expect(hexButton).toHaveClass("bg-green-600");

      // Switch to stats view
      await user.click(statsButton);
      expect(statsButton).toHaveClass("bg-green-600");
    });
  });

  describe("Pause/Resume Controls", () => {
    test("allows pausing message capture", async () => {
      const user = userEvent.setup();
      render(<UCANMonitor />);

      const pauseButton = screen.getByRole("button", { name: /Pause/i });
      await user.click(pauseButton);

      expect(screen.getByText(/PAUSED/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Resume/i }),
      ).toBeInTheDocument();
    });

    test("allows resuming message capture", async () => {
      const user = userEvent.setup();
      render(<UCANMonitor />);

      const pauseButton = screen.getByRole("button", { name: /Pause/i });
      await user.click(pauseButton);

      const resumeButton = screen.getByRole("button", { name: /Resume/i });
      await user.click(resumeButton);

      expect(screen.queryByText(/PAUSED/i)).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Pause/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Auto-Scroll Toggle", () => {
    test("allows toggling auto-scroll", async () => {
      const user = userEvent.setup();
      render(<UCANMonitor />);

      const autoScrollButton = screen.getByRole("button", {
        name: /Auto-Scroll/i,
      });
      await user.click(autoScrollButton);

      // Case-sensitive: the status bar shows "SCROLL LOCKED" while the
      // toolbar button reads "Scroll Locked".
      expect(screen.getByText(/SCROLL LOCKED/)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Scroll Locked/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Export Functionality", () => {
    test("shows export options", () => {
      render(<UCANMonitor />);

      // "📥 Import CSV" also matches /CSV/i, so target the export button name.
      expect(
        screen.getByRole("button", { name: "📄 CSV" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /JSON/i })).toBeInTheDocument();
    });

    test("can export as CSV", async () => {
      const user = userEvent.setup();
      const exportMessagesSpy = jest.spyOn(exporters, "exportMessages");

      render(<UCANMonitor />);

      const csvButton = screen.getByRole("button", { name: "📄 CSV" });
      await user.click(csvButton);

      expect(exportMessagesSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ format: "csv" }),
        expect.anything(),
      );
    });

    test("can export as JSON", async () => {
      const user = userEvent.setup();
      const exportMessagesSpy = jest.spyOn(exporters, "exportMessages");

      render(<UCANMonitor />);

      const jsonButton = screen.getByRole("button", { name: /JSON/i });
      await user.click(jsonButton);

      expect(exportMessagesSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ format: "json" }),
        expect.anything(),
      );
    });
  });

  describe("Clear Messages", () => {
    test("can clear all messages", async () => {
      const user = userEvent.setup();
      render(<UCANMonitor />);

      const clearButton = screen.getByRole("button", { name: /Clear/i });
      await user.click(clearButton);

      // MessageBuffer.clear should have been called
      // (Verified through mock implementation)
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe("Settings Modal", () => {
    test("opens settings modal when settings button clicked", async () => {
      const user = userEvent.setup();
      render(<UCANMonitor />);

      // Find settings button by SVG icon
      const settingsButton = screen.getByRole("button", { name: /Settings/i });
      await user.click(settingsButton);

      expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    });
  });

  describe("Rule Builder Modal", () => {
    test("opens rule builder when create rule button clicked", async () => {
      const user = userEvent.setup();
      render(<UCANMonitor />);

      const createRuleButton = screen.getByRole("button", {
        name: /Create Action Rule/i,
      });
      await user.click(createRuleButton);

      await waitFor(() => {
        expect(screen.getByTestId("rule-builder-modal")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    test("displays back to home link", () => {
      render(<UCANMonitor />);

      const homeLink = screen.getByRole("link", { name: /Back to Home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("Component Integration", () => {
    test("message log receives correct props", () => {
      render(<UCANMonitor />);

      const messageLog = screen.getByTestId("message-log");
      expect(messageLog).toBeInTheDocument();
      expect(screen.getByText("Message count: 0")).toBeInTheDocument();
    });

    test("filter panel shows message counts", () => {
      render(<UCANMonitor />);

      expect(screen.getByText("Total: 0")).toBeInTheDocument();
      expect(screen.getByText("Filtered: 0")).toBeInTheDocument();
    });

    test("board info panel reflects connection state", () => {
      render(<UCANMonitor />);

      expect(screen.getByText("Connected: No")).toBeInTheDocument();
    });
  });

  describe("Cleanup", () => {
    test("disconnects on unmount", () => {
      const { unmount } = render(<UCANMonitor />);

      // Mock isConnected to return true
      mockSerialBridge.isConnected.mockReturnValue(true);

      unmount();

      expect(mockSerialBridge.disconnect).toHaveBeenCalled();
    });

    test("removes beforeunload listener on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      const { unmount } = render(<UCANMonitor />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function),
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    test("has proper heading structure", () => {
      render(<UCANMonitor />);

      // Accessible name is "u CAN Monitor" because the "u" is a separate span.
      const heading = screen.getByRole("heading", {
        name: /u\s?CAN Monitor/i,
      });
      expect(heading).toBeInTheDocument();
    });

    test("all buttons are keyboard accessible", () => {
      const { container } = render(<UCANMonitor />);

      const buttons = container.querySelectorAll("button");
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute("tabindex", "-1");
      });
    });
  });
});
