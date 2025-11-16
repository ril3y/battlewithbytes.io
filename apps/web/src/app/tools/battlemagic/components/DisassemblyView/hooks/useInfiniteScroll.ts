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
  topSentinelRef: React.RefObject<HTMLDivElement>;
  bottomSentinelRef: React.RefObject<HTMLDivElement>;
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
  rootMargin = '200px',
  enabled = true
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const loadingPrevious = useRef(false);
  const loadingNext = useRef(false);

  // Handle top sentinel intersection (load previous chunk)
  const handleTopIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !loadingPrevious.current && enabled && onLoadPrevious) {
      console.log('[InfiniteScroll] Top sentinel visible - loading previous chunk');
      loadingPrevious.current = true;
      onLoadPrevious();
      // Reset loading flag after a delay to prevent rapid re-triggers
      setTimeout(() => {
        loadingPrevious.current = false;
      }, 500);
    }
  }, [enabled, onLoadPrevious]);

  // Handle bottom sentinel intersection (load next chunk)
  const handleBottomIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !loadingNext.current && enabled && onLoadNext) {
      console.log('[InfiniteScroll] Bottom sentinel visible - loading next chunk');
      loadingNext.current = true;
      onLoadNext();
      // Reset loading flag after a delay to prevent rapid re-triggers
      setTimeout(() => {
        loadingNext.current = false;
      }, 500);
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
