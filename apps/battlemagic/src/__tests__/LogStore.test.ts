
import { useLogStore } from '../lib/stores/LogStore';
import { act, renderHook } from '@testing-library/react';

describe('LogStore', () => {
    beforeEach(() => {
        const store = useLogStore.getState();
        store.clearGdbLogs();
        store.clearUartLogs();
    });

    it('should initially have empty logs', () => {
        const { result } = renderHook(() => useLogStore());
        expect(result.current.gdbLogs).toEqual([]);
        expect(result.current.uartLogs).toEqual([]);
    });

    it('should add gdb logs correctly', () => {
        const { result } = renderHook(() => useLogStore());

        act(() => {
            result.current.addGdbLog('Test GDB message');
        });

        expect(result.current.gdbLogs).toHaveLength(1);
        expect(result.current.gdbLogs[0].text).toBe('Test GDB message');
        expect(result.current.gdbLogs[0].source).toBe('gdb');
    });

    it('should add uart logs correctly', () => {
        const { result } = renderHook(() => useLogStore());

        act(() => {
            result.current.addUartLog('Test UART message');
        });

        expect(result.current.uartLogs).toHaveLength(1);
        expect(result.current.uartLogs[0].text).toBe('Test UART message');
        expect(result.current.uartLogs[0].source).toBe('uart');
    });

    it('should respect the max log limit (1000)', () => {
        const { result } = renderHook(() => useLogStore());

        act(() => {
            // Add 1100 logs
            for (let i = 0; i < 1100; i++) {
                result.current.addGdbLog(`Message ${i}`);
            }
        });

        expect(result.current.gdbLogs.length).toBeLessThanOrEqual(1000);
        expect(result.current.gdbLogs[result.current.gdbLogs.length - 1].text).toBe('Message 1099');
    });

    it('should clear logs', () => {
        const { result } = renderHook(() => useLogStore());

        act(() => {
            result.current.addGdbLog('Test message');
        });

        expect(result.current.gdbLogs).toHaveLength(1);

        act(() => {
            result.current.clearGdbLogs();
        });

        expect(result.current.gdbLogs).toHaveLength(0);
    });
});
