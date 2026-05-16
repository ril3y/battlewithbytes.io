/**
 * Wire Wizard History Hook
 * Manages undo/redo functionality
 */

import { useState } from 'react';
import { DiagramData } from '../core/types';

const HISTORY_LIMIT = 50;

export function useHistory(initialState: DiagramData) {
  const [history, setHistory] = useState<DiagramData[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveToHistory = (state: DiagramData) => {
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);

    // Add new state
    newHistory.push(state);

    // Limit history to HISTORY_LIMIT entries
    if (newHistory.length > HISTORY_LIMIT) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }

    setHistory(newHistory);
  };

  const undo = (): DiagramData | null => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  };

  const redo = (): DiagramData | null => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory: (state: DiagramData) => {
      setHistory([state]);
      setHistoryIndex(0);
    },
    historyIndex,
    historyLength: history.length
  };
}
