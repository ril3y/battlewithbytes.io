/**
 * Circular Buffer Implementation
 *
 * Memory-efficient buffer that maintains a fixed maximum size
 * by overwriting oldest entries when capacity is reached.
 * Prevents unbounded memory growth in logging scenarios.
 */

export class CircularBuffer<T> {
  private buffer: T[];
  private writeIndex: number = 0;
  private size: number = 0;
  private readonly capacity: number;

  /**
   * Create a new circular buffer
   * @param capacity - Maximum number of items to store
   */
  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error("Capacity must be positive");
    }
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  /**
   * Add an item to the buffer
   * @param item - Item to add
   */
  push(item: T): void {
    this.buffer[this.writeIndex] = item;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    if (this.size < this.capacity) {
      this.size++;
    }
  }

  /**
   * Add multiple items to the buffer
   * @param items - Items to add
   */
  pushMany(items: T[]): void {
    for (const item of items) {
      this.push(item);
    }
  }

  /**
   * Get all items in order (oldest to newest)
   * @returns Array of items
   */
  toArray(): T[] {
    if (this.size < this.capacity) {
      return this.buffer.slice(0, this.size);
    }

    // Buffer is full, need to reconstruct in order
    const result: T[] = [];
    const startIndex = this.writeIndex;

    for (let i = 0; i < this.capacity; i++) {
      const index = (startIndex + i) % this.capacity;
      result.push(this.buffer[index]);
    }

    return result;
  }

  /**
   * Get the last N items
   * @param count - Number of items to retrieve
   * @returns Array of most recent items
   */
  getRecent(count: number): T[] {
    const items = this.toArray();
    return items.slice(-count);
  }

  /**
   * Clear all items from the buffer
   */
  clear(): void {
    this.buffer = new Array(this.capacity);
    this.writeIndex = 0;
    this.size = 0;
  }

  /**
   * Get the number of items currently in the buffer
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Check if the buffer is empty
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Check if the buffer is at capacity
   */
  isFull(): boolean {
    return this.size === this.capacity;
  }
}
