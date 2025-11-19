/**
 * Infinite Scroll Hook
 *
 * Detects when user scrolls near top/bottom of the disassembly view.
 * Triggers loading of previous/next memory chunks.
 * Uses IntersectionObserver for efficient scroll detection.
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadPrevious?: () => void;
  onLoadNext?: () => void;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  topSentinelRef: React.RefObject<HTMLDivElement | null>;
  bottomSentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for infinite scroll detection
 *
 * @param options - Configuration options
 * @returns Refs for top and bottom sentinel elements
 */
export function useInfiniteScroll({
  onLoadPrevious,
  onLoadNext,
  threshold = 0.1,
  rootMargin = '50px', // Reduced from 200px to prevent over-eager loading
  enabled = true
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const loadingPrevious = useRef(false);
  const loadingNext = useRef(false);
  const lastLoadTimestamp = useRef({ top: 0, bottom: 0 });

  // Minimum delay between loads (ms) - prevents rapid re-triggers
  const MIN_LOAD_DELAY = 1000;

  // Handle top sentinel intersection (load previous chunk)
  const handleTopIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimestamp.current.top;

    // Only trigger if:
    // 1. Sentinel is actually intersecting (not just entering viewport)
    // 2. Not currently loading
    // 3. Enabled
    // 4. Callback exists
    // 5. Enough time has passed since last load (debouncing)
    // 6. Intersection ratio is significant (>= 10% of sentinel visible)
    if (
      entry.isIntersecting &&
      entry.intersectionRatio >= 0.1 &&
      !loadingPrevious.current &&
      enabled &&
      onLoadPrevious &&
      timeSinceLastLoad >= MIN_LOAD_DELAY
    ) {
      console.log('[InfiniteScroll] Top sentinel visible - loading previous chunk');
      loadingPrevious.current = true;
      lastLoadTimestamp.current.top = now;
      onLoadPrevious();

      // Reset loading flag after operation completes
      setTimeout(() => {
        loadingPrevious.current = false;
      }, 2000);
    }
  }, [enabled, onLoadPrevious]);

  // Handle bottom sentinel intersection (load next chunk)
  const handleBottomIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimestamp.current.bottom;

    // Only trigger if:
    // 1. Sentinel is actually intersecting (not just entering viewport)
    // 2. Not currently loading
    // 3. Enabled
    // 4. Callback exists
    // 5. Enough time has passed since last load (debouncing)
    // 6. Intersection ratio is significant (>= 10% of sentinel visible)
    if (
      entry.isIntersecting &&
      entry.intersectionRatio >= 0.1 &&
      !loadingNext.current &&
      enabled &&
      onLoadNext &&
      timeSinceLastLoad >= MIN_LOAD_DELAY
    ) {
      console.log('[InfiniteScroll] Bottom sentinel visible - loading next chunk');
      loadingNext.current = true;
      lastLoadTimestamp.current.bottom = now;
      onLoadNext();

      // Reset loading flag after operation completes
      setTimeout(() => {
        loadingNext.current = false;
      }, 2000);
    }
  }, [enabled, onLoadNext]);

  // Set up intersection observers
  useEffect(() => {
    if (!enabled) return;

    const topObserver = new IntersectionObserver(handleTopIntersection, {
      threshold,
      rootMargin
    });

    const bottomObserver = new IntersectionObserver(handleBottomIntersection, {
      threshold,
      rootMargin
    });

    const topElement = topSentinelRef.current;
    const bottomElement = bottomSentinelRef.current;

    if (topElement) {
      topObserver.observe(topElement);
    }

    if (bottomElement) {
      bottomObserver.observe(bottomElement);
    }

    return () => {
      if (topElement) {
        topObserver.unobserve(topElement);
      }
      if (bottomElement) {
        bottomObserver.unobserve(bottomElement);
      }
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, [enabled, threshold, rootMargin, handleTopIntersection, handleBottomIntersection]);

  return {
    topSentinelRef,
    bottomSentinelRef
  };
}
