import { useEffect } from 'react';
import type { CommentType } from '../../../lib/db/AnalysisDatabase';

/**
 * Hook for managing keyboard shortcuts
 *
 * Handles global keyboard events for the disassembly view.
 * Currently supports:
 * - G key: Opens Go To Address modal (when mouse is over panel)
 * - N key: Opens Rename Function modal (when function is selected)
 * - ; key: Opens Add Comment modal (standard comment)
 * - Shift+; (:): Opens Add Comment modal (repeatable comment)
 * - Ins key: Opens Add Comment modal (anterior comment)
 * - Ctrl+Shift+; (:): Opens Add Comment modal (block comment)
 *
 * @param isMouseOverPanel - Whether mouse is currently over the disassembly panel
 * @param showGoToModal - Whether the Go To modal is currently visible
 * @param setShowGoToModal - Setter for modal visibility
 * @param setGoToAddress - Setter for Go To address input
 * @param setGoToError - Setter for Go To error message
 * @param showCommentModal - Whether the Comment modal is currently visible
 * @param setShowCommentModal - Setter for comment modal visibility
 * @param selectedAddress - Currently selected address (null if none)
 * @param setCommentType - Setter for comment type
 * @param showRenameModal - Whether the Rename Function modal is currently visible
 * @param setShowRenameModal - Setter for rename modal visibility
 * @param selectedFunctionAddress - Address of currently selected function (null if none)
 */
export function useKeyboardShortcuts(
  isMouseOverPanel: boolean,
  showGoToModal: boolean,
  setShowGoToModal: (show: boolean) => void,
  setGoToAddress: (address: string) => void,
  setGoToError: (error: string | null) => void,
  showCommentModal?: boolean,
  setShowCommentModal?: (show: boolean) => void,
  selectedAddress?: number | null,
  setCommentType?: (type: CommentType) => void,
  showRenameModal?: boolean,
  setShowRenameModal?: (show: boolean) => void,
  selectedFunctionAddress?: number | null
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

      // Handle N key for function renaming (when function is selected and mouse is over panel)
      if ((e.key === 'n' || e.key === 'N') && isMouseOverPanel && !showRenameModal && setShowRenameModal && selectedFunctionAddress !== null && selectedFunctionAddress !== undefined) {
        e.preventDefault();
        setShowRenameModal(true);
      }

      // Handle comment shortcuts (only when address is selected and mouse is over panel)
      if (isMouseOverPanel && selectedAddress !== null && selectedAddress !== undefined && !showCommentModal && setShowCommentModal && setCommentType) {
        // ; key: Standard comment
        if (e.key === ';' && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          setCommentType('standard');
          setShowCommentModal(true);
        }
        // Shift+; (:): Repeatable comment
        else if (e.key === ':' && e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          setCommentType('repeatable');
          setShowCommentModal(true);
        }
        // Insert key: Anterior comment
        else if (e.key === 'Insert' && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          setCommentType('anterior');
          setShowCommentModal(true);
        }
        // Ctrl+Shift+; (:): Block comment (less common, needs modifier to prevent conflicts)
        else if (e.key === ':' && e.shiftKey && e.ctrlKey) {
          e.preventDefault();
          setCommentType('block');
          setShowCommentModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMouseOverPanel, showGoToModal, setShowGoToModal, setGoToAddress, setGoToError, showCommentModal, setShowCommentModal, selectedAddress, setCommentType, showRenameModal, setShowRenameModal, selectedFunctionAddress]);
}
