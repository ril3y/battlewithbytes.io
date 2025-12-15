"use client";

/**
 * Registers Panel Component
 *
 * Displays CPU registers from the target device
 */

import React from "react";

export interface RegisterValue {
  name: string;
  value: number;
  size: number; // in bits (32 for ARM)
}

interface RegistersPanelProps {
  registers: RegisterValue[];
  onRefresh: () => void;
  isConnected: boolean;
  onAddressClick?: (address: number) => void;
}

export default function RegistersPanel({
  registers,
  onRefresh,
  isConnected,
  onAddressClick,
}: RegistersPanelProps) {
  // Debug log to see what we're receiving
  React.useEffect(() => {
    if (registers.length > 0) {
      console.log(
        "[RegistersPanel] First 5 registers:",
        registers
          .slice(0, 5)
          .map((r) => `${r.name}=0x${r.value.toString(16)} (${r.value})`),
      );
    }
  }, [registers]);

  // Group registers for better organization
  const coreRegisters = registers.filter((r) => r.name.match(/^r\d+$/));
  const specialRegisters = registers.filter((r) =>
    ["sp", "lr", "pc", "xpsr", "msp", "psp"].includes(r.name.toLowerCase()),
  );
  const otherRegisters = registers.filter(
    (r) =>
      !r.name.match(/^r\d+$/) &&
      !["sp", "lr", "pc", "xpsr", "msp", "psp"].includes(r.name.toLowerCase()),
  );

  const formatValue = (value: number, size: number = 32): string => {
    const hexStr = value
      .toString(16)
      .toUpperCase()
      .padStart(size / 4, "0");
    return `0x${hexStr}`;
  };

  const RegisterGroup = ({
    title,
    regs,
  }: {
    title: string;
    regs: RegisterValue[];
  }) => {
    return (
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase">
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-1 text-xs font-mono">
          {regs.map((reg) => {
            // Determine if this register should be clickable (address registers)
            const isAddressRegister =
              ["pc", "sp", "lr", "msp", "psp"].includes(
                reg.name.toLowerCase(),
              ) || reg.name.match(/^r\d+$/);

            return (
              <div
                key={reg.name}
                className="flex items-center justify-between bg-gray-800 px-2 py-1 rounded"
              >
                <span className="text-green-400 font-bold">
                  {reg.name.toUpperCase()}:
                </span>
                <span
                  className={`text-gray-300 ${
                    isAddressRegister && onAddressClick
                      ? "cursor-pointer hover:underline hover:text-cyan-400"
                      : ""
                  }`}
                  onClick={() => {
                    if (isAddressRegister && onAddressClick) {
                      onAddressClick(reg.value);
                    }
                  }}
                  title={
                    isAddressRegister && onAddressClick
                      ? "Click to jump to address"
                      : ""
                  }
                >
                  {formatValue(reg.value, reg.size)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-bold text-green-400">REGISTERS</h2>
        <button
          onClick={onRefresh}
          disabled={!isConnected}
          className="px-3 py-1 text-xs rounded border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Registers Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {!isConnected ? (
          <div className="text-gray-500 text-xs text-center mt-4">
            Connect to target to view registers
          </div>
        ) : registers.length === 0 ? (
          <div className="text-gray-500 text-xs text-center mt-4">
            No register data available
          </div>
        ) : (
          <>
            {/* Core Registers (r0-r12) */}
            {coreRegisters.length > 0 && (
              <RegisterGroup title="Core Registers" regs={coreRegisters} />
            )}

            {/* Special Registers (SP, LR, PC, etc) */}
            {specialRegisters.length > 0 && (
              <RegisterGroup
                title="Special Registers"
                regs={specialRegisters}
              />
            )}

            {/* Other Registers */}
            {otherRegisters.length > 0 && (
              <RegisterGroup title="Other Registers" regs={otherRegisters} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
