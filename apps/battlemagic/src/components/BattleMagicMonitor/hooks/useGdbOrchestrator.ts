
import { useCallback } from "react";
import { ConnectionState, Target } from "../../../lib/gdb/types";
import { RegisterValue } from "../../RegistersPanel";
import { StackFrame } from "../../StackPanel";
import { Breakpoint } from "../../BreakpointsManager";
import { saveGdbPort, saveUartPort } from "../../../utils/deviceStorage";

// Import types from other hooks
import { GdbConnectionState } from "./useGdbConnection";
import { UartConnectionState } from "./useUartConnection";
import { DebugState } from "./useDebugState";
import { ProjectState } from "./useProjectState";

export function useGdbOrchestrator(
    gdb: GdbConnectionState,
    uart: UartConnectionState,
    debug: DebugState,
    project: ProjectState,
    isClient: boolean
) {
    // GDB Connection handlers
    const handleConnectGdb = useCallback(async () => {
        if (!gdb.gdbClient || !isClient) return;

        // If already connected or connecting, disconnect first
        if (gdb.gdbState !== ConnectionState.DISCONNECTED) {
            gdb.addGdbOutput("[Disconnecting existing connection...]");
            try {
                await gdb.gdbClient.disconnect();
            } catch (error) {
                gdb.addGdbOutput(`[Disconnect failed: ${error}]`);
            }
            // Give it a moment to fully disconnect
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        try {
            // Always show port selection dialog
            gdb.addGdbOutput("[Select Black Magic GDB port from the dialog]");
            const port = await navigator.serial.requestPort({
                filters: [{ usbVendorId: 0x1d50, usbProductId: 0x6018 }],
            });

            if (!port) {
                gdb.addGdbOutput("[Connection cancelled]");
                return;
            }

            gdb.addGdbOutput("[Connecting to GDB port...]");
            await gdb.gdbClient.connect(port, { baudRate: uart.baudRate });
            gdb.addGdbOutput("[GDB Connected successfully]");

            // Save the port info for reference
            const portInfo = port.getInfo();
            saveGdbPort({
                vendorId: portInfo.usbVendorId,
                productId: portInfo.usbProductId,
            });

            // Get version info
            try {
                const version = await gdb.gdbClient.getVersion();
                gdb.setBmpVersion(version);
                gdb.addGdbOutput(`[BMP Version] ${version.firmware}`);
            } catch (error) {
                gdb.addGdbOutput(`[Version query failed: ${error}]`);
            }
        } catch (error) {
            gdb.addGdbOutput(`[Connection failed: ${error}]`);
        }
    }, [gdb, isClient, uart.baudRate]);

    const handleDisconnectGdb = useCallback(async () => {
        if (!gdb.gdbClient || !gdb.gdbClient.isConnected()) return;

        try {
            await gdb.gdbClient.disconnect();
            gdb.setTargets([]);
            gdb.addGdbOutput("[GDB Disconnected]");
        } catch (error) {
            gdb.addGdbOutput(`[GDB Disconnect failed: ${error}]`);
        }
    }, [gdb]);

    // UART Connection handlers
    // Note: readUartData helper is needed here or needs to be passed in
    // Ideally useUartConnection should handle reading internally, but for now we follow pattern

    const handleConnectUart = useCallback(async () => {
        if (!isClient) return;

        try {
            gdb.addGdbOutput("[Select Black Magic UART port from the dialog]");
            const port = await navigator.serial.requestPort({
                filters: [{ usbVendorId: 0x1d50, usbProductId: 0x6018 }],
            });

            if (!port) {
                gdb.addGdbOutput("[UART connection cancelled]");
                return;
            }

            // Open the port (default 115200 baud for UART)
            await port.open({ baudRate: 115200 });
            uart.setUartPort(port);
            uart.setUartConnected(true);
            gdb.addGdbOutput("[UART Connected]");
            uart.addUartOutput("[UART Connected - Ready to receive data]");

            // Save the port info for reference
            const portInfo = port.getInfo();
            saveUartPort({
                vendorId: portInfo.usbVendorId,
                productId: portInfo.usbProductId,
            });

            // Set up reader for UART data
            if (port.readable) {
                const reader = port.readable.getReader();
                uart.setUartReader(reader);

                // Start reading loop
                // We define the loop function inline here to capture scope or effectively fire-and-forget
                const readLoop = async () => {
                    try {
                        while (true) {
                            const { value, done } = await reader.read();
                            if (done) break;

                            // Decode and add to UART output
                            const text = new TextDecoder().decode(value);
                            uart.addUartOutput(text);
                        }
                    } catch (error) {
                        console.error("UART read error:", error);
                        uart.addUartOutput(`[UART read error: ${error}]`);
                    } finally {
                        reader.releaseLock();
                    }
                };
                readLoop();
            }
        } catch (error) {
            gdb.addGdbOutput(`[UART connection failed: ${error}]`);
            uart.addUartOutput(`[UART connection failed: ${error}]`);
        }
    }, [isClient, gdb, uart]);

    const handleDisconnectUart = useCallback(async () => {
        if (!uart.uartPort) return;

        try {
            // Close the reader first
            if (uart.uartReader) {
                try {
                    await uart.uartReader.cancel();
                    uart.uartReader.releaseLock();
                } catch (error) {
                    console.error("Error releasing reader:", error);
                }
                uart.setUartReader(null);
            }

            // Close the port
            await uart.uartPort.close();
            uart.setUartPort(null);
            uart.setUartConnected(false);
            gdb.addGdbOutput("[UART Disconnected]");
            uart.addUartOutput("[UART Disconnected]");
        } catch (error) {
            gdb.addGdbOutput(`[UART disconnect failed: ${error}]`);
            uart.addUartOutput(`[UART disconnect failed: ${error}]`);
        }
    }, [uart, gdb]);

    // Debug helpers
    const handleRefreshRegisters = useCallback(async () => {
        if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;

        try {
            const regs = await gdb.gdbClient.getFormattedRegisters();
            const regValues: RegisterValue[] = Array.from(regs.entries()).map(
                ([name, value]) => ({
                    name,
                    value,
                    size: 32, // ARM debug.registers are 32-bit
                }),
            );

            debug.setRegisters(regValues);

            // Update PC for disassembly view
            const pc = regs.get("pc");
            if (pc !== undefined) {
                debug.setProgramCounter(pc);
            }

            gdb.addGdbOutput("[Registers refreshed]");
        } catch (error) {
            const errorMsg = String(error);
            if (
                errorMsg.includes("EFF") ||
                errorMsg.includes("Failed to read debug.registers")
            ) {
                gdb.addGdbOutput(
                    "[Cannot read debug.registers - target may be running. Try halting first.]",
                );
            } else {
                gdb.addGdbOutput(`[Failed to read registers: ${error}]`);
            }
        }
    }, [gdb.gdbClient, gdb.gdbState, gdb.addGdbOutput, debug]);

    const handleRefreshStack = useCallback(async () => {
        if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;

        try {
            const frames = await gdb.gdbClient.getBacktrace();
            const stackData: StackFrame[] = frames.map((frame) => ({
                level: frame.level,
                address: frame.address,
                function: frame.function,
            }));
            debug.setStackFrames(stackData);
            gdb.addGdbOutput("[Stack refreshed]");
        } catch (error) {
            gdb.addGdbOutput(`[Failed to read stack: ${error}]`);
        }
    }, [gdb.gdbClient, gdb.gdbState, gdb.addGdbOutput, debug]);

    // Target controls
    const handleScanTargets = useCallback(async () => {
        if (!gdb.gdbClient) return;

        try {
            gdb.addGdbOutput("> monitor swdp_scan");
            const result = await gdb.gdbClient.scanSwd();
            gdb.setTargets(result.targets);
            gdb.addGdbOutput(`[Found ${result.targets.length} target(s)]`);
            if (result.voltage !== null) {
                gdb.addGdbOutput(`[Target voltage: ${result.voltage.toFixed(2)}V]`);
            }
            result.targets.forEach((t) => {
                gdb.addGdbOutput(`  ${t.id}: ${t.description}`);
            });
            project.setLastUpdate(new Date());
        } catch (error) {
            gdb.addGdbOutput(`[Scan failed: ${error}]`);
        }
    }, [gdb.gdbClient, gdb.addGdbOutput, project]);

    const handleHalt = useCallback(async () => {
        if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;
        try {
            gdb.addGdbOutput("> Ctrl+C (interrupt)");
            await gdb.gdbClient.halt();
            gdb.addGdbOutput("[Target halted]");
            debug.setExecutionState("stopped");
            project.setLastUpdate(new Date());

            // Auto-refresh panels after halt
            await handleRefreshRegisters();
            await handleRefreshStack();

        } catch (error) {
            gdb.addGdbOutput(`[Halt failed: ${error}]`);
        }
    }, [gdb.gdbClient, gdb.gdbState, gdb.addGdbOutput, debug, project, handleRefreshRegisters, handleRefreshStack]);

    const handleRun = useCallback(async () => {
        if (!gdb.gdbClient) return;
        try {
            gdb.addGdbOutput("> continue");
            gdb.addGdbOutput("[Target running...]");
            debug.setExecutionState("running");
            project.setLastUpdate(new Date());
            gdb.gdbClient.continue();
        } catch (error) {
            gdb.addGdbOutput(`[Run failed: ${error}]`);
        }
    }, [gdb.gdbClient, gdb.addGdbOutput, debug, project]);

    const handleReset = useCallback(async () => {
        if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;
        try {
            gdb.addGdbOutput("> monitor reset");
            await gdb.gdbClient.reset();
            gdb.addGdbOutput("[Target reset]");

            // Auto-refresh panels after reset
            await handleRefreshRegisters();
            await handleRefreshStack();

        } catch (error) {
            gdb.addGdbOutput(`[Reset failed: ${error}]`);
        }
    }, [gdb.gdbClient, gdb.gdbState, gdb.addGdbOutput, handleRefreshRegisters, handleRefreshStack]);

    const handleStep = useCallback(async () => {
        if (!gdb.gdbClient || gdb.gdbState !== ConnectionState.ATTACHED) return;
        try {
            gdb.addGdbOutput("> stepi");
            debug.setExecutionState("stepping");
            await gdb.gdbClient.step();
            gdb.addGdbOutput("[Stepped one instruction]");
            debug.setExecutionState("stopped");
            project.setLastUpdate(new Date());

            // Auto-refresh
            await handleRefreshRegisters();
            await handleRefreshStack();

        } catch (error) {
            gdb.addGdbOutput(`[Step failed: ${error}]`);
            debug.setExecutionState("stopped");
        }
    }, [gdb.gdbClient, gdb.gdbState, gdb.addGdbOutput, debug, project, handleRefreshRegisters, handleRefreshStack]);

    return {
        handleConnectGdb,
        handleDisconnectGdb,
        handleConnectUart,
        handleDisconnectUart,
        handleScanTargets,
        handleHalt,
        handleRun,
        handleReset,
        handleStep,
        handleRefreshRegisters,
        handleRefreshStack
    };
}
