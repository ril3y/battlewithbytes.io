import { create } from 'zustand';

interface LogEntry {
    id: string;
    text: string;
    timestamp: number;
    source: 'gdb' | 'uart' | 'system';
}

interface LogState {
    gdbLogs: LogEntry[];
    uartLogs: LogEntry[];

    addGdbLog: (text: string) => void;
    addUartLog: (text: string) => void;
    clearGdbLogs: () => void;
    clearUartLogs: () => void;
}

export const useLogStore = create<LogState>((set) => ({
    gdbLogs: [],
    uartLogs: [],

    addGdbLog: (text) => set((state) => {
        // Limit to 1000 logs to prevent memory issues
        const newLogs = [...state.gdbLogs, {
            id: Math.random().toString(36).substr(2, 9),
            text,
            timestamp: Date.now(),
            source: 'gdb' as const
        }];
        if (newLogs.length > 1000) newLogs.shift();
        return { gdbLogs: newLogs };
    }),

    addUartLog: (text) => set((state) => {
        // Limit to 1000 logs
        const newLogs = [...state.uartLogs, {
            id: Math.random().toString(36).substr(2, 9),
            text,
            timestamp: Date.now(),
            source: 'uart' as const
        }];
        if (newLogs.length > 1000) newLogs.shift();
        return { uartLogs: newLogs };
    }),

    clearGdbLogs: () => set({ gdbLogs: [] }),
    clearUartLogs: () => set({ uartLogs: [] }),
}));
