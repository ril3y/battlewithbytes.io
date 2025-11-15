'use client';

/**
 * Threads Panel Component
 *
 * Displays active threads and allows switching between them.
 * Shows thread ID, state, PC, and name/function.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GdbClient } from '../lib/gdb/GdbClient';

interface ThreadInfo {
  id: number;
  state: 'running' | 'stopped' | 'unknown';
  pc?: number;
  name?: string;
  targetId?: string;
}

interface ThreadsPanelProps {
  gdbClient?: GdbClient | null;
  isConnected: boolean;
  currentThreadId?: number;
  onThreadSelect?: (threadId: number) => void;
  onOutput?: (message: string) => void;
}

export default function ThreadsPanel({
  gdbClient,
  isConnected,
  currentThreadId,
  onThreadSelect,
  onOutput
}: ThreadsPanelProps) {
  const [threads, setThreads] = useState<ThreadInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load thread list
  const loadThreads = useCallback(async () => {
    if (!gdbClient || !isConnected) {
      setThreads([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Query threads using GDB qfThreadInfo/qsThreadInfo
      // For now, we'll show a single thread (most M4 MCUs are single-threaded)
      // TODO: Implement proper thread querying when multi-threading is supported

      const mockThreads: ThreadInfo[] = [
        {
          id: 1,
          state: 'stopped',
          name: 'main',
        }
      ];

      setThreads(mockThreads);
    } catch (err) {
      setError(`Failed to load threads: ${err}`);
      console.error('[ThreadsPanel] Error loading threads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gdbClient, isConnected]);

  // Auto-load threads when connected
  useEffect(() => {
    if (isConnected) {
      loadThreads();
    } else {
      setThreads([]);
    }
  }, [isConnected, loadThreads]);

  // Handle thread selection
  const handleThreadClick = useCallback((threadId: number) => {
    if (onThreadSelect) {
      onThreadSelect(threadId);
      onOutput?.(`[Switched to thread ${threadId}]`);
    }
  }, [onThreadSelect, onOutput]);

  // Format address
  const formatAddress = (addr?: number): string => {
    if (addr === undefined) return '—';
    return `0x${addr.toString(16).toUpperCase().padStart(8, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">Threads</h3>
        <button
          onClick={loadThreads}
          disabled={!isConnected || isLoading}
          className="px-2 py-1 text-xs font-mono bg-gray-800 text-green-400 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Status */}
      {error && (
        <div className="px-3 py-2 bg-red-900/20 border-b border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Thread List */}
      <div className="flex-1 overflow-auto">
        {!isConnected ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Connect to target to view threads
          </div>
        ) : threads.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No threads found
          </div>
        ) : (
          <table className="w-full text-xs font-mono">
            <thead className="bg-gray-900 sticky top-0">
              <tr className="text-gray-400 text-left">
                <th className="px-3 py-2 w-8"></th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2">PC</th>
                <th className="px-3 py-2">Name</th>
              </tr>
            </thead>
            <tbody>
              {threads.map((thread) => (
                <tr
                  key={thread.id}
                  className={`
                    border-b border-gray-800 cursor-pointer hover:bg-gray-800
                    ${thread.id === currentThreadId ? 'bg-blue-900/20' : ''}
                  `}
                  onClick={() => handleThreadClick(thread.id)}
                >
                  <td className="px-3 py-2 text-center">
                    {thread.id === currentThreadId && (
                      <span className="text-green-400">▶</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-cyan-400">{thread.id}</td>
                  <td className="px-3 py-2">
                    <span className={`
                      ${thread.state === 'running' ? 'text-yellow-400' :
                        thread.state === 'stopped' ? 'text-gray-400' :
                        'text-gray-600'}
                    `}>
                      {thread.state}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-400">
                    {formatAddress(thread.pc)}
                  </td>
                  <td className="px-3 py-2 text-gray-300">
                    {thread.name || thread.targetId || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 bg-gray-900 border-t border-gray-700 text-xs text-gray-400">
        {threads.length > 0 && `${threads.length} thread${threads.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  );
}
