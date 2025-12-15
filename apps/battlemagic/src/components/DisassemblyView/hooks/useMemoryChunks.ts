/**
 * Memory Chunk Manager Hook
 *
 * Tracks which memory address ranges have been loaded.
 * Prevents duplicate loads and manages memory window.
 * Keeps ~2KB in memory (current chunk + 1 above + 1 below).
 */

import { useState, useCallback } from "react";

export interface MemoryChunk {
  startAddress: number;
  endAddress: number;
  loadedAt: number;
}

interface UseMemoryChunksReturn {
  chunks: MemoryChunk[];
  isAddressLoaded: (address: number) => boolean;
  isRangeLoaded: (startAddress: number, endAddress: number) => boolean;
  addChunk: (startAddress: number, endAddress: number) => void;
  removeChunk: (startAddress: number) => void;
  clearChunks: () => void;
  pruneDistantChunks: (centerAddress: number, maxDistance: number) => void;
  getLoadedRange: () => { min: number; max: number } | null;
}

/**
 * Hook for managing loaded memory chunks
 *
 * @param maxChunks - Maximum number of chunks to keep in memory (default: 5)
 * @returns Memory chunk management functions
 */
export function useMemoryChunks(maxChunks: number = 5): UseMemoryChunksReturn {
  const [chunks, setChunks] = useState<MemoryChunk[]>([]);

  /**
   * Check if a specific address is already loaded
   */
  const isAddressLoaded = useCallback(
    (address: number): boolean => {
      return chunks.some(
        (chunk) => address >= chunk.startAddress && address < chunk.endAddress,
      );
    },
    [chunks],
  );

  /**
   * Check if an entire range is already loaded
   */
  const isRangeLoaded = useCallback(
    (startAddress: number, endAddress: number): boolean => {
      return chunks.some(
        (chunk) =>
          startAddress >= chunk.startAddress && endAddress <= chunk.endAddress,
      );
    },
    [chunks],
  );

  /**
   * Add a new chunk to the loaded set
   * Merges overlapping chunks automatically
   */
  const addChunk = useCallback((startAddress: number, endAddress: number) => {
    setChunks((prevChunks) => {
      const newChunk: MemoryChunk = {
        startAddress,
        endAddress,
        loadedAt: Date.now(),
      };

      // Check for overlaps and merge if necessary
      const overlappingChunks = prevChunks.filter(
        (chunk) =>
          !(
            endAddress <= chunk.startAddress || startAddress >= chunk.endAddress
          ),
      );

      if (overlappingChunks.length === 0) {
        // No overlap, just add the new chunk
        return [...prevChunks, newChunk];
      }

      // Merge overlapping chunks
      const mergedStart = Math.min(
        startAddress,
        ...overlappingChunks.map((c) => c.startAddress),
      );
      const mergedEnd = Math.max(
        endAddress,
        ...overlappingChunks.map((c) => c.endAddress),
      );
      const mergedChunk: MemoryChunk = {
        startAddress: mergedStart,
        endAddress: mergedEnd,
        loadedAt: Date.now(),
      };

      // Remove overlapping chunks and add merged chunk
      const nonOverlappingChunks = prevChunks.filter(
        (chunk) => !overlappingChunks.includes(chunk),
      );

      return [...nonOverlappingChunks, mergedChunk];
    });
  }, []);

  /**
   * Remove a specific chunk
   */
  const removeChunk = useCallback((startAddress: number) => {
    setChunks((prevChunks) =>
      prevChunks.filter((chunk) => chunk.startAddress !== startAddress),
    );
  }, []);

  /**
   * Clear all chunks
   */
  const clearChunks = useCallback(() => {
    setChunks([]);
  }, []);

  /**
   * Remove chunks that are far from the center address
   * Keeps memory usage under control
   */
  const pruneDistantChunks = useCallback(
    (centerAddress: number, maxDistance: number) => {
      setChunks((prevChunks) => {
        // Keep chunks that are within maxDistance of centerAddress
        const nearbyChunks = prevChunks.filter((chunk) => {
          const chunkCenter = (chunk.startAddress + chunk.endAddress) / 2;
          const distance = Math.abs(chunkCenter - centerAddress);
          return distance <= maxDistance;
        });

        // If we have too many chunks, remove oldest ones
        if (nearbyChunks.length > maxChunks) {
          return nearbyChunks
            .sort((a, b) => b.loadedAt - a.loadedAt)
            .slice(0, maxChunks);
        }

        return nearbyChunks;
      });
    },
    [maxChunks],
  );

  /**
   * Get the min and max addresses of all loaded chunks
   */
  const getLoadedRange = useCallback((): {
    min: number;
    max: number;
  } | null => {
    if (chunks.length === 0) return null;

    const min = Math.min(...chunks.map((c) => c.startAddress));
    const max = Math.max(...chunks.map((c) => c.endAddress));

    return { min, max };
  }, [chunks]);

  return {
    chunks,
    isAddressLoaded,
    isRangeLoaded,
    addChunk,
    removeChunk,
    clearChunks,
    pruneDistantChunks,
    getLoadedRange,
  };
}
