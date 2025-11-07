'use client';

/**
 * Statistics Panel Component
 *
 * Display bus statistics and per-ID message counts
 */

import React from 'react';
import { BusStatistics } from '../types';
import { formatNumber, formatDuration, formatPercentage, formatRate } from '../utils/formatters';

interface StatsPanelProps {
  stats: BusStatistics;
  onExport?: () => void;
}

export default function StatsPanel({ stats, onExport }: StatsPanelProps) {
  const totalMessages = stats.rxCount + stats.txCount;
  const topIds = Array.from(stats.perIdStats.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">📊 Statistics</h2>
        {onExport && (
          <button
            onClick={onExport}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 transition-colors"
          >
            Export
          </button>
        )}
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="RX Messages"
          value={formatNumber(stats.rxCount)}
          color="text-green-400"
          icon="🟢"
        />
        <StatCard
          label="TX Messages"
          value={formatNumber(stats.txCount)}
          color="text-blue-400"
          icon="🔵"
        />
        <StatCard
          label="Errors"
          value={formatNumber(stats.errorCount)}
          color="text-red-400"
          icon="❌"
        />
        <StatCard
          label="Total"
          value={formatNumber(totalMessages)}
          color="text-white"
          icon="📦"
        />
      </div>

      {/* Performance Metrics */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <MetricRow
          label="Message Rate"
          value={formatRate(stats.messagesPerSecond)}
          color="text-yellow-400"
        />
        <MetricRow
          label="Bus Load"
          value={formatPercentage(stats.busLoad)}
          color={stats.busLoad > 80 ? 'text-red-400' : stats.busLoad > 50 ? 'text-yellow-400' : 'text-green-400'}
        />
        <MetricRow
          label="Uptime"
          value={formatDuration(stats.uptime)}
          color="text-gray-400"
        />
        <MetricRow
          label="Unique IDs"
          value={stats.perIdStats.size.toString()}
          color="text-cyan-400"
        />
      </div>

      {/* Top CAN IDs */}
      {topIds.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Top CAN IDs</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {topIds.map((idStat) => {
              const percentage = (idStat.count / totalMessages) * 100;
              return (
                <div
                  key={idStat.canId}
                  className="flex items-center justify-between p-2 bg-gray-950 rounded border border-gray-700 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-green-400 font-semibold">
                      0x{idStat.canId.toString(16).toUpperCase().padStart(3, '0')}
                    </span>
                    <span className="text-gray-500">({idStat.canId})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300">{formatNumber(idStat.count)}</span>
                    <span className="text-gray-500 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-yellow-400 w-16 text-right">
                      {idStat.frequency.toFixed(1)} msg/s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {stats.perIdStats.size > 10 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              +{stats.perIdStats.size - 10} more IDs
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {totalMessages === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No messages captured yet</p>
          <p className="text-sm mt-1">Statistics will appear once messages are received</p>
        </div>
      )}
    </div>
  );
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  label: string;
  value: string;
  color: string;
  icon: string;
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div className="bg-gray-950 border border-gray-700 rounded p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

/**
 * Metric Row Component
 */
interface MetricRowProps {
  label: string;
  value: string;
  color: string;
}

function MetricRow({ label, value, color }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}
