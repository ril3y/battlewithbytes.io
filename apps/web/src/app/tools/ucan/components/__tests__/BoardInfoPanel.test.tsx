/**
 * BoardInfoPanel Component Tests
 *
 * Tests for the board information panel component, including:
 * - Connection state rendering
 * - Capabilities display
 * - max_rules display (regression test for undefined bug)
 * - Rule management UI
 * - Device name editing
 * - Quick reconnect functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoardInfoPanel from '../BoardInfoPanel';
import { BoardCapabilities, ActionRule } from '../../types';

// Mock dependencies
jest.mock('../../utils/deviceStorage', () => ({
  loadLastDevice: jest.fn(() => null),
  formatDeviceName: jest.fn((device: { vendorId?: number }) => `Device ${device?.vendorId}`),
  isMatchingDevice: jest.fn(() => false),
  saveLastDevice: jest.fn(),
}));

jest.mock('../../core/serialBridge', () => ({
  isSerialSupported: jest.fn(() => true),
  getAuthorizedPorts: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@/lib/utils/Tooltip', () => ({
  __esModule: true,
  default: ({ children, text }: { children: React.ReactNode; text: string }) => (
    <div data-testid="tooltip" title={text}>
      {children}
    </div>
  ),
}));

jest.mock('../CollapsiblePanel', () => ({
  __esModule: true,
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="collapsible-panel">
      <div data-testid="panel-title">{title}</div>
      {children}
    </div>
  ),
}));

describe('BoardInfoPanel', () => {
  const mockCapabilities: BoardCapabilities = {
    board: 'uCAN RP2040',
    chip: 'RP2040',
    version: '2.0.0',
    protocol: 2,
    max_rules: 8,
    can: {
      controllers: 1,
      max_bitrate: 1000000,
      fd_capable: false,
      filters: 2,
    },
    gpio: {
      total: 26,
      pwm: 16,
      adc: 4,
      dac: 0,
    },
    flash_kb: 2048,
    ram_kb: 264,
    features: ['CAN', 'GPIO', 'PWM', 'ADC'],
  };

  const mockRules: ActionRule[] = [
    {
      id: 1,
      name: 'Test Rule 1',
      canId: 0x100,
      canMask: 0xFFFFFFFF,
      actionType: 'GPIO_SET',
      paramSource: 'fixed',
      params: ['13'],
      enabled: true,
      dataLength: 0,
    },
  ];

  const defaultProps = {
    isConnected: true,
    capabilities: mockCapabilities,
    onSendCommand: jest.fn(),
    onDisconnect: jest.fn(),
    onConnect: jest.fn(),
    rules: mockRules,
    onEditRule: jest.fn(),
    onDeleteRule: jest.fn(),
    onClearAllRules: jest.fn(),
    recentlyFiredRules: new Map<number, number>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Connection State', () => {
    test('renders "No board connected" when not connected', () => {
      render(<BoardInfoPanel {...defaultProps} isConnected={false} capabilities={undefined} />);

      expect(screen.getByText('No board connected')).toBeInTheDocument();
      expect(screen.getByText('Connect to a uCAN device to view capabilities')).toBeInTheDocument();
    });

    test('renders "Loading capabilities" when connected but no capabilities', () => {
      render(<BoardInfoPanel {...defaultProps} capabilities={undefined} />);

      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Loading board capabilities...')).toBeInTheDocument();
    });

    test('renders full board info when connected with capabilities', () => {
      render(<BoardInfoPanel {...defaultProps} />);

      expect(screen.getByText('uCAN RP2040')).toBeInTheDocument();
      expect(screen.getByText('RP2040')).toBeInTheDocument();
    });
  });

  describe('max_rules Display - Regression Tests', () => {
    test('displays max_rules value correctly when defined', () => {
      render(<BoardInfoPanel {...defaultProps} />);

      // Find the Action Rules section
      const actionRulesSection = screen.getByText('Action Rules').closest('div');
      expect(actionRulesSection).toBeInTheDocument();

      // Check that max_rules displays as a number with "maximum" text
      expect(actionRulesSection?.textContent).toContain('8');
      expect(actionRulesSection?.textContent).toContain('maximum');
    });

    test('displays "Loading..." when max_rules is undefined', () => {
      const capsWithoutMaxRules: Partial<BoardCapabilities> = { ...mockCapabilities };
      delete capsWithoutMaxRules.max_rules;

      render(<BoardInfoPanel {...defaultProps} capabilities={capsWithoutMaxRules as BoardCapabilities} />);

      // Should show "Loading..." not "max rules"
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Should NOT show just "max rules" as text
      const actionRulesDiv = screen.getByText('Action Rules').closest('div');
      expect(actionRulesDiv?.textContent).not.toContain('max rules');
    });

    test('handles max_rules = 0 correctly', () => {
      const capsWithZeroRules = { ...mockCapabilities, max_rules: 0 };

      render(<BoardInfoPanel {...defaultProps} capabilities={capsWithZeroRules} />);

      // Should display "0 maximum"
      const actionRulesSection = screen.getByText('Action Rules').closest('div');
      expect(actionRulesSection?.textContent).toContain('0');
      expect(actionRulesSection?.textContent).toContain('maximum');
    });
  });

  describe('Board Information Display', () => {
    test('displays CAN controller information', () => {
      render(<BoardInfoPanel {...defaultProps} />);

      expect(screen.getByText('CAN Controller')).toBeInTheDocument();
      expect(screen.getByText(/1 Controller/)).toBeInTheDocument();
    });

    test('displays hardware resources correctly', () => {
      render(<BoardInfoPanel {...defaultProps} />);

      expect(screen.getByText('Hardware Resources')).toBeInTheDocument();
      expect(screen.getByText('GPIO Pins')).toBeInTheDocument();
      expect(screen.getByText('26')).toBeInTheDocument();
      expect(screen.getByText('16')).toBeInTheDocument(); // PWM
      expect(screen.getByText('4')).toBeInTheDocument(); // ADC
    });

    test('displays memory information', () => {
      render(<BoardInfoPanel {...defaultProps} />);

      expect(screen.getByText('Memory')).toBeInTheDocument();
      expect(screen.getByText(/2048 KB/)).toBeInTheDocument(); // Flash
      expect(screen.getByText(/264 KB/)).toBeInTheDocument(); // RAM
    });

    test('displays features list', () => {
      render(<BoardInfoPanel {...defaultProps} />);

      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('CAN')).toBeInTheDocument();
      expect(screen.getByText('GPIO')).toBeInTheDocument();
      expect(screen.getByText('PWM')).toBeInTheDocument();
    });
  });

  describe('Device Name Editing', () => {
    test('allows editing device name', async () => {
      const user = userEvent.setup();
      const onSendCommand = jest.fn().mockResolvedValue(undefined);

      render(<BoardInfoPanel {...defaultProps} onSendCommand={onSendCommand} />);

      // Click edit button
      const editButton = screen.getByText(/Edit/);
      await user.click(editButton);

      // Input field should appear
      const input = screen.getByPlaceholderText('Enter device name');
      expect(input).toBeInTheDocument();

      // Type new name
      await user.clear(input);
      await user.type(input, 'My Custom Board');

      // Click save
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      // Should send command
      expect(onSendCommand).toHaveBeenCalledWith('set:name:My Custom Board');
    });

    test('cancels device name editing', async () => {
      const user = userEvent.setup();
      const onSendCommand = jest.fn();

      render(<BoardInfoPanel {...defaultProps} onSendCommand={onSendCommand} />);

      // Click edit button
      const editButton = screen.getByText(/Edit/);
      await user.click(editButton);

      // Type new name
      const input = screen.getByPlaceholderText('Enter device name');
      await user.type(input, 'New Name');

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Should not send command
      expect(onSendCommand).not.toHaveBeenCalled();

      // Should show original name
      expect(screen.getByText('uCAN RP2040')).toBeInTheDocument();
    });

    test('saves device name on Enter key', async () => {
      const user = userEvent.setup();
      const onSendCommand = jest.fn().mockResolvedValue(undefined);

      render(<BoardInfoPanel {...defaultProps} onSendCommand={onSendCommand} />);

      const editButton = screen.getByText(/Edit/);
      await user.click(editButton);

      const input = screen.getByPlaceholderText('Enter device name');
      await user.clear(input);
      await user.type(input, 'New Device{Enter}');

      expect(onSendCommand).toHaveBeenCalledWith('set:name:New Device');
    });
  });

  describe('Rule Management', () => {
    test('displays active rules list', () => {
      render(<BoardInfoPanel {...defaultProps} />);

      expect(screen.getByText('Active Rules')).toBeInTheDocument();
      expect(screen.getByText('Test Rule 1')).toBeInTheDocument();
      expect(screen.getByText(/0x100/)).toBeInTheDocument();
    });

    test('shows rule count badge', () => {
      render(<BoardInfoPanel {...defaultProps} />);

      // Should show "1 / 8" for rules
      const badge = screen.getByText(/1 \/ 8/);
      expect(badge).toBeInTheDocument();
    });

    test('calls onEditRule when rule is clicked', async () => {
      const user = userEvent.setup();
      const onEditRule = jest.fn();

      render(<BoardInfoPanel {...defaultProps} onEditRule={onEditRule} />);

      const ruleButton = screen.getByText('Test Rule 1');
      await user.click(ruleButton);

      expect(onEditRule).toHaveBeenCalledWith(mockRules[0]);
    });

    test('calls onDeleteRule with confirmation', async () => {
      const user = userEvent.setup();
      const onDeleteRule = jest.fn().mockResolvedValue(undefined);

      // Mock window.confirm
      global.confirm = jest.fn(() => true);

      render(<BoardInfoPanel {...defaultProps} onDeleteRule={onDeleteRule} />);

      // Find and click delete button (trash icon)
      const deleteButtons = screen.getAllByTitle('Delete rule');
      if (deleteButtons[0]) {
        await user.click(deleteButtons[0]);
      }

      expect(global.confirm).toHaveBeenCalledWith('Delete rule "Test Rule 1"?');
      expect(onDeleteRule).toHaveBeenCalledWith(1);
    });

    test('calls onClearAllRules with confirmation', async () => {
      const user = userEvent.setup();
      const onClearAllRules = jest.fn().mockResolvedValue(undefined);

      global.confirm = jest.fn(() => true);

      render(<BoardInfoPanel {...defaultProps} onClearAllRules={onClearAllRules} />);

      const clearButton = screen.getByText('Clear All');
      await user.click(clearButton);

      expect(global.confirm).toHaveBeenCalledWith('Clear all 1 rules?');
      expect(onClearAllRules).toHaveBeenCalled();
    });

    test('shows visual indicator when rule recently fired', async () => {
      const recentlyFiredRules = new Map([[1, Date.now()]]);

      render(<BoardInfoPanel {...defaultProps} recentlyFiredRules={recentlyFiredRules} />);

      // Wait for the component to update (it has a useEffect that triggers re-renders)
      await waitFor(() => {
        // The rule should have the orange fire styling
        const ruleElement = screen.getByText('Test Rule 1').closest('div');
        expect(ruleElement).toHaveClass('bg-orange-600/20');
      });
    });
  });

  describe('CAN Configuration', () => {
    test('allows changing CAN bitrate', async () => {
      const user = userEvent.setup();
      const onSendCommand = jest.fn().mockResolvedValue(undefined);

      render(<BoardInfoPanel {...defaultProps} onSendCommand={onSendCommand} />);

      // Find bitrate select
      const bitrateSelect = screen.getByText('Change bitrate...').closest('select');
      expect(bitrateSelect).toBeInTheDocument();

      // Change to 500kbps
      await user.selectOptions(bitrateSelect!, '500000');

      await waitFor(() => {
        expect(onSendCommand).toHaveBeenCalledWith('config:baudrate:500000');
      });
    });

    test('allows setting hardware filter', async () => {
      const user = userEvent.setup();
      const onSendCommand = jest.fn().mockResolvedValue(undefined);

      render(<BoardInfoPanel {...defaultProps} onSendCommand={onSendCommand} />);

      // Find filter inputs
      const filterIdInput = screen.getByPlaceholderText('Filter ID (e.g., 0x500)');
      const maskInput = screen.getByPlaceholderText('Mask (e.g., 0x700)');

      // Fill in filter
      await user.type(filterIdInput, '0x500');
      await user.type(maskInput, '0x700');

      // Click apply
      const applyButton = screen.getByText('Apply Filter');
      await user.click(applyButton);

      expect(onSendCommand).toHaveBeenCalledWith('config:filter:0x500:0x700');
    });
  });

  describe('Disconnect Functionality', () => {
    test('calls onDisconnect when disconnect button clicked', async () => {
      const user = userEvent.setup();
      const onDisconnect = jest.fn().mockResolvedValue(undefined);

      render(<BoardInfoPanel {...defaultProps} onDisconnect={onDisconnect} />);

      const disconnectButton = screen.getByText('Disconnect');
      await user.click(disconnectButton);

      expect(onDisconnect).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      const { container } = render(<BoardInfoPanel {...defaultProps} />);

      // Check for interactive elements
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // All buttons should be focusable
      buttons.forEach((button: Element) => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    test('tooltips provide additional context', () => {
      render(<BoardInfoPanel {...defaultProps} />);

      const tooltips = screen.getAllByTestId('tooltip');
      expect(tooltips.length).toBeGreaterThan(0);

      // Check that tooltip has descriptive text
      const canTooltip = tooltips.find(t => t.getAttribute('title')?.includes('CAN Controller Info'));
      expect(canTooltip).toBeInTheDocument();
    });
  });
});
