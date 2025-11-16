import { useEffect } from 'react';

/**
 * Hook for managing keyboard shortcuts
 *
 * Handles global keyboard events for the disassembly view.
 * Currently supports:
 * - G key: Opens Go To Address modal (when mouse is over panel)
 * - ; key: Opens Add Comment modal (when mouse is over panel)
 *
 * @param isMouseOverPanel - Whether mouse is currently over the disassembly panel
 * @param showGoToModal - Whether the Go To modal is currently visible
 * @param setShowGoToModal - Setter for modal visibility
 * @param setGoToAddress - Setter for Go To address input
 * @param setGoToError - Setter for Go To error message
 * @param showCommentModal - Whether the Comment modal is currently visible
 * @param setShowCommentModal - Setter for comment modal visibility
 * @param selectedAddress - Currently selected address (null if none)
 */
export function useKeyboardShortcuts(
  isMouseOverPanel: boolean,
  showGoToModal: boolean,
  setShowGoToModal: (show: boolean) => void,
  setGoToAddress: (address: string) => void,
  setGoToError: (error: string | null) => void,
  showCommentModal?: boolean,
  setShowCommentModal?: (show: boolean) => void,
  selectedAddress?: number | null
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Only handle G key when mouse is over this panel and modal is not already open
      if ((e.key === 'g' || e.key === 'G') && isMouseOverPanel && !showGoToModal) {
        e.preventDefault();
        setShowGoToModal(true);
        setGoToAddress('');
        setGoToError(null);
      }

      // Handle ; key for comments (only when address is selected and mouse is over panel)
      if (e.key === ';' && isMouseOverPanel && selectedAddress !== null && selectedAddress !== undefined && !showCommentModal && setShowCommentModal) {
        e.preventDefault();
        setShowCommentModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMouseOverPanel, showGoToModal, setShowGoToModal, setGoToAddress, setGoToError, showCommentModal, setShowCommentModal, selectedAddress]);
}
