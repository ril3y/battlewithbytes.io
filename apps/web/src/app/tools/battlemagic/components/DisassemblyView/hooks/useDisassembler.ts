import { useEffect, useRef, useState } from 'react';
import { WasmDisassembler } from '../../../lib/disasm/WasmDisassembler';
import { ArmDisassembler } from '../../../lib/arch/arm/disasm';

/**
 * Hook for managing disassembler initialization
 *
 * Initializes WASM disassembler with fallback to ArmDisassembler.
 * Handles loading state and cleanup on unmount.
 *
 * @param onOutput - Optional callback for status messages
 * @returns Disassembler reference and ready state
 */
export function useDisassembler(onOutput?: (message: string) => void) {
  const disassembler = useRef<WasmDisassembler | ArmDisassembler | null>(null);
  const [disassemblerReady, setDisassemblerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDisassembler = async () => {
      try {
        console.log('[DisassemblyView] Initializing WASM disassembler...');
        setIsLoading(true);
        const wasm = new WasmDisassembler();
        await wasm.initialize();
        disassembler.current = wasm;
        setDisassemblerReady(true);
        setIsLoading(false);
        console.log('[DisassemblyView] WASM disassembler initialized successfully');
      } catch (err) {
        console.error('[DisassemblyView] Failed to initialize WASM, falling back to ArmDisassembler:', err);
        // Fallback to custom ARM disassembler
        disassembler.current = new ArmDisassembler();
        setDisassemblerReady(true);
        setIsLoading(false);
        setError(null); // Clear error since we have a fallback
        console.log('[DisassemblyView] Using ArmDisassembler fallback');
        onOutput?.('[Using ArmDisassembler (WASM failed to load)]');
      }
    };

    initDisassembler();

    return () => {
      // Cleanup on unmount
      if (disassembler.current && 'dispose' in disassembler.current) {
        disassembler.current.dispose();
      }
    };
  }, [onOutput]);

  return {
    disassembler,
    disassemblerReady,
    isLoading,
    error,
    setError
  };
}
