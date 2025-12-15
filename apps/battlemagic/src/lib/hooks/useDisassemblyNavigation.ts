import { useState, useCallback, useEffect } from "react";

export type ViewMode = "linear" | "graph";

interface NavigationEntry {
  address: number;
  viewMode: ViewMode;
}

interface UseDisassemblyNavigationProps {
  onNavigate: (address: number, viewMode: ViewMode) => void;
  onFollowPCChange?: (enabled: boolean) => void;
}

export interface UseDisassemblyNavigationReturn {
  navigationHistory: NavigationEntry[];
  historyIndex: number;
  addToHistory: (address: number, viewMode: ViewMode) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

/**
 * Custom hook for managing disassembly navigation history
 *
 * Provides browser-like back/forward navigation with keyboard support:
 * - Backspace or Left Arrow: Go back
 * - Right Arrow: Go forward
 *
 * @param onNavigate - Callback when navigating to a history entry
 * @param onFollowPCChange - Optional callback when Follow PC should be disabled
 */
export function useDisassemblyNavigation({
  onNavigate,
  onFollowPCChange,
}: UseDisassemblyNavigationProps): UseDisassemblyNavigationReturn {
  const [navigationHistory, setNavigationHistory] = useState<NavigationEntry[]>(
    [],
  );
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Add to navigation history
  const addToHistory = useCallback(
    (address: number, viewMode: ViewMode) => {
      setNavigationHistory((prev) => {
        // Remove any forward history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Add new entry
        newHistory.push({ address, viewMode });
        // Limit history to 50 entries
        if (newHistory.length > 50) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));

      // Disable Follow PC when manually navigating
      if (onFollowPCChange) {
        onFollowPCChange(false);
      }
    },
    [historyIndex, onFollowPCChange],
  );

  // Navigate back in history
  const navigateBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const entry = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      onNavigate(entry.address, entry.viewMode);
      console.log("[Navigation] Back to:", entry.address.toString(16));

      // Disable Follow PC when navigating through history
      if (onFollowPCChange) {
        onFollowPCChange(false);
      }
    }
  }, [historyIndex, navigationHistory, onNavigate, onFollowPCChange]);

  // Navigate forward in history
  const navigateForward = useCallback(() => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const entry = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      onNavigate(entry.address, entry.viewMode);
      console.log("[Navigation] Forward to:", entry.address.toString(16));

      // Disable Follow PC when navigating through history
      if (onFollowPCChange) {
        onFollowPCChange(false);
      }
    }
  }, [historyIndex, navigationHistory, onNavigate, onFollowPCChange]);

  // Keyboard navigation (Backspace/Left = back, Right = forward)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Backspace" || e.key === "ArrowLeft") {
        e.preventDefault();
        navigateBack();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateBack, navigateForward]);

  return {
    navigationHistory,
    historyIndex,
    addToHistory,
    navigateBack,
    navigateForward,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < navigationHistory.length - 1,
  };
}
