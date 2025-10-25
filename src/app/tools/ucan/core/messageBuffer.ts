/**
 * uCAN Message Buffer and Filtering
 *
 * Manages message storage, filtering, and statistics
 */

import {
  CANMessage,
  MessageFilter,
  BusStatistics,
  MessageStats,
  MessageDirection
} from '../types';

/**
 * Message Buffer
 * Circular buffer with filtering capabilities
 */
export class MessageBuffer {
  private messages: CANMessage[] = [];
  private maxMessages: number;
  private filter: MessageFilter;
  private onUpdate: (() => void) | null = null;

  constructor(maxMessages: number = 10000) {
    this.maxMessages = maxMessages;
    this.filter = this.createDefaultFilter();
  }

  /**
   * Create default filter (show all)
   */
  private createDefaultFilter(): MessageFilter {
    return {
      directions: new Set<MessageDirection>(['RX', 'TX']),
      canIds: new Set<number>(),
      errorsOnly: false
    };
  }

  /**
   * Set update callback
   */
  setUpdateCallback(callback: () => void): void {
    this.onUpdate = callback;
  }

  /**
   * Add message to buffer
   */
  addMessage(message: CANMessage): void {
    this.messages.push(message);

    // Trim buffer if exceeded max
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    if (this.onUpdate) {
      this.onUpdate();
    }
  }

  /**
   * Add multiple messages
   */
  addMessages(messages: CANMessage[]): void {
    for (const message of messages) {
      this.messages.push(message);
    }

    // Trim buffer if exceeded
    while (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    if (this.onUpdate) {
      this.onUpdate();
    }
  }

  /**
   * Get all messages
   */
  getAllMessages(): CANMessage[] {
    return [...this.messages];
  }

  /**
   * Get filtered messages
   */
  getFilteredMessages(): CANMessage[] {
    return this.messages.filter(msg => this.matchesFilter(msg));
  }

  /**
   * Check if message matches current filter
   */
  private matchesFilter(message: CANMessage): boolean {
    // Filter by direction
    if (!this.filter.directions.has(message.direction)) {
      return false;
    }

    // Filter by CAN ID (if specific IDs are set)
    if (this.filter.canIds.size > 0 && !this.filter.canIds.has(message.canId)) {
      return false;
    }

    // Filter by CAN ID range
    if (this.filter.canIdRange) {
      const { min, max } = this.filter.canIdRange;
      if (message.canId < min || message.canId > max) {
        return false;
      }
    }

    // Filter by data pattern
    if (this.filter.dataPattern) {
      const pattern = this.filter.dataPattern.replace(/\s/g, '').toUpperCase();
      const dataHex = Array.from(message.data)
        .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
        .join('');

      if (!dataHex.includes(pattern)) {
        return false;
      }
    }

    // Filter by search text
    if (this.filter.searchText) {
      const searchLower = this.filter.searchText.toLowerCase();
      const messageText = this.formatMessageForSearch(message);

      if (!messageText.includes(searchLower)) {
        return false;
      }
    }

    // Filter errors only
    if (this.filter.errorsOnly && !message.error) {
      return false;
    }

    return true;
  }

  /**
   * Format message for text search
   */
  private formatMessageForSearch(message: CANMessage): string {
    const parts: string[] = [
      message.direction,
      message.canId.toString(16),
      Array.from(message.data).map(b => b.toString(16)).join('')
    ];

    if (message.error) {
      parts.push(message.error);
    }

    return parts.join(' ').toLowerCase();
  }

  /**
   * Set filter
   */
  setFilter(filter: Partial<MessageFilter>): void {
    this.filter = { ...this.filter, ...filter };

    if (this.onUpdate) {
      this.onUpdate();
    }
  }

  /**
   * Get current filter
   */
  getFilter(): MessageFilter {
    return { ...this.filter };
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages = [];

    if (this.onUpdate) {
      this.onUpdate();
    }
  }

  /**
   * Get message count
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Get filtered message count
   */
  getFilteredMessageCount(): number {
    return this.getFilteredMessages().length;
  }

  /**
   * Get message by ID
   */
  getMessageById(id: string): CANMessage | undefined {
    return this.messages.find(msg => msg.id === id);
  }

  /**
   * Get messages in time range
   */
  getMessagesInTimeRange(startTime: Date, endTime: Date): CANMessage[] {
    return this.messages.filter(
      msg => msg.timestamp >= startTime && msg.timestamp <= endTime
    );
  }

  /**
   * Get messages by CAN ID
   */
  getMessagesByCANId(canId: number): CANMessage[] {
    return this.messages.filter(msg => msg.canId === canId);
  }
}

/**
 * Statistics Calculator
 */
export class StatisticsEngine {
  private startTime: Date = new Date();
  private perIdStats: Map<number, MessageStats> = new Map();
  private rxCount: number = 0;
  private txCount: number = 0;
  private errorCount: number = 0;
  private lastUpdateTime: Date = new Date();
  private messageRateWindow: number[] = []; // Messages per second over time
  private readonly RATE_WINDOW_SIZE = 10; // Keep last 10 seconds

  constructor() {
    this.reset();
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.startTime = new Date();
    this.lastUpdateTime = new Date();
    this.perIdStats.clear();
    this.rxCount = 0;
    this.txCount = 0;
    this.errorCount = 0;
    this.messageRateWindow = [];
  }

  /**
   * Update with new message
   */
  updateMessage(message: CANMessage): void {
    // Update direction counts
    if (message.direction === 'RX') {
      this.rxCount++;
    } else if (message.direction === 'TX') {
      this.txCount++;
    }

    // Update error count
    if (message.error) {
      this.errorCount++;
    }

    // Update per-ID stats
    this.updatePerIdStats(message);

    this.lastUpdateTime = new Date();
  }

  /**
   * Update per-ID statistics
   */
  private updatePerIdStats(message: CANMessage): void {
    const canId = message.canId;
    const existing = this.perIdStats.get(canId);

    if (existing) {
      // Calculate new frequency
      const timeSinceLastSeen = message.timestamp.getTime() - existing.lastSeen.getTime();
      const newInterval =
        (existing.averageInterval * existing.count + timeSinceLastSeen) /
        (existing.count + 1);

      const updated: MessageStats = {
        canId,
        count: existing.count + 1,
        lastSeen: message.timestamp,
        frequency: 1000 / newInterval, // messages per second
        averageInterval: newInterval
      };

      this.perIdStats.set(canId, updated);
    } else {
      // First message for this ID
      this.perIdStats.set(canId, {
        canId,
        count: 1,
        lastSeen: message.timestamp,
        frequency: 0,
        averageInterval: 0
      });
    }
  }

  /**
   * Get current statistics
   */
  getStatistics(): BusStatistics {
    const uptime = new Date().getTime() - this.startTime.getTime();
    const totalMessages = this.rxCount + this.txCount;
    const messagesPerSecond = totalMessages / (uptime / 1000);

    // Estimate bus load (simplified calculation)
    // Assumes standard CAN with 125 kbps and 130 bits per frame average
    const bitsPerSecond = messagesPerSecond * 130;
    const busLoad = Math.min(100, (bitsPerSecond / 125000) * 100);

    return {
      rxCount: this.rxCount,
      txCount: this.txCount,
      errorCount: this.errorCount,
      messagesPerSecond: Math.round(messagesPerSecond * 10) / 10,
      busLoad: Math.round(busLoad * 10) / 10,
      uptime,
      perIdStats: new Map(this.perIdStats)
    };
  }

  /**
   * Get stats for specific CAN ID
   */
  getStatsForId(canId: number): MessageStats | undefined {
    return this.perIdStats.get(canId);
  }

  /**
   * Get all CAN IDs seen
   */
  getAllCANIds(): number[] {
    return Array.from(this.perIdStats.keys()).sort((a, b) => a - b);
  }

  /**
   * Get top N most frequent CAN IDs
   */
  getTopFrequentIds(count: number): MessageStats[] {
    return Array.from(this.perIdStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }
}
