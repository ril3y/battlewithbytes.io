/**
 * Wire Wizard File Operations
 * Handles save/load to localStorage and JSON import/export
 */

import { DiagramData } from '../core/types';

export const DEFAULT_STORAGE_KEY = 'wire-wizard-diagram';

/**
 * Minimal typings for the parts of the File System Access API we use.
 * `showSaveFilePicker` is not in TypeScript's DOM lib, so we declare only the
 * surface this module actually touches rather than pulling in a polyfill types
 * package.
 */
interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{ description: string; accept: Record<string, string[]> }>;
}

interface WritableFileStreamLike {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface SaveFileHandleLike {
  createWritable(): Promise<WritableFileStreamLike>;
}

type WindowWithSaveFilePicker = Window & {
  showSaveFilePicker(options?: SaveFilePickerOptions): Promise<SaveFileHandleLike>;
};

/**
 * Load diagram data from localStorage. Pass `null` for `storageKey` to disable.
 */
export function loadFromLocalStorage(storageKey: string | null = DEFAULT_STORAGE_KEY): DiagramData | null {
  if (!storageKey) return null;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved diagram:', e);
      }
    }
  }
  return null;
}

/**
 * Save diagram data to localStorage. Pass `null` for `storageKey` to disable.
 */
export function saveToLocalStorage(data: DiagramData, storageKey: string | null = DEFAULT_STORAGE_KEY): void {
  if (!storageKey) return;
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

/**
 * Export diagram data to JSON file
 * Uses File System Access API (showSaveFilePicker) when available for "Save As" dialog
 * Falls back to direct download for unsupported browsers
 */
export async function exportToFile(data: DiagramData): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });

  // Try to use the File System Access API for a proper "Save As" dialog
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as WindowWithSaveFilePicker).showSaveFilePicker({
        suggestedName: `wire-wizard-${new Date().toISOString().slice(0, 10)}.json`,
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      // User cancelled the save dialog (browsers throw a DOMException, which
      // extends Error, with name 'AbortError').
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Fall through to legacy download if API fails
      console.warn('File System Access API failed, falling back to download:', err);
    }
  }

  // Fallback: direct download (Firefox, Safari, or if API fails)
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wire-wizard-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import diagram data from JSON file
 */
export function importFromFile(
  onSuccess: (data: DiagramData) => void,
  onError?: (error: string) => void
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data: DiagramData = JSON.parse(event.target?.result as string);
          onSuccess(data);
        } catch {
          const errorMsg = 'Failed to load file. Invalid JSON format.';
          if (onError) {
            onError(errorMsg);
          } else {
            alert(errorMsg);
          }
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

/**
 * Clear all data (with confirmation)
 */
export function clearAllData(
  onConfirm: () => void,
  confirmMessage: string = 'Clear all blocks and wires? This cannot be undone.'
): void {
  if (confirm(confirmMessage)) {
    onConfirm();
  }
}
