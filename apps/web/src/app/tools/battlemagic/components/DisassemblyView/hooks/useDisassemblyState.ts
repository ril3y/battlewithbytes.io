import { useState } from 'react';
import type { DisassemblyLine, ViewMode } from '../types';
import type { DisassembledInstruction } from '../../../lib/disasm/ArmDisassembler';

/**
 * Hook for managing all disassembly state
 *
 * Centralizes all useState declarations for the disassembly view,
 * providing a single source of truth for component state.
 *
 * @returns Object containing all state variables and their setters
 */
export function useDisassemblyState() {
  // Display state
  const [lines, setLines] = useState<DisassemblyLine[]>([]);
  const [rawInstructions, setRawInstructions] = useState<DisassembledInstruction[]>([]);

  // Address and navigation state
  const [baseAddress, setBaseAddress] = useState<number>(0x08000000); // Default flash base
  const [addressInput, setAddressInput] = useState<string>('0x08000000');
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [jumpedToAddress, setJumpedToAddress] = useState<number | null>(null);

  // View configuration state
  const [bytesToRead, setBytesToRead] = useState<number>(512); // Increased default for better initial view
  const [showBytes, setShowBytes] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('linear');

  // Modal state
  const [showGoToModal, setShowGoToModal] = useState(false);
  const [goToAddress, setGoToAddress] = useState('');
  const [goToError, setGoToError] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');

  // UI interaction state
  const [isMouseOverPanel, setIsMouseOverPanel] = useState(false);

  // Symbol state (TODO: Implement symbol loading)
  const [symbols] = useState<Map<number, string>>(new Map());

  return {
    // Display state
    lines,
    setLines,
    rawInstructions,
    setRawInstructions,

    // Address and navigation state
    baseAddress,
    setBaseAddress,
    addressInput,
    setAddressInput,
    selectedAddress,
    setSelectedAddress,
    jumpedToAddress,
    setJumpedToAddress,

    // View configuration state
    bytesToRead,
    setBytesToRead,
    showBytes,
    setShowBytes,
    viewMode,
    setViewMode,

    // Modal state
    showGoToModal,
    setShowGoToModal,
    goToAddress,
    setGoToAddress,
    goToError,
    setGoToError,
    showCommentModal,
    setShowCommentModal,
    commentText,
    setCommentText,

    // UI interaction state
    isMouseOverPanel,
    setIsMouseOverPanel,

    // Symbol state
    symbols
  };
}
