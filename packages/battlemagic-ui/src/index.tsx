import React, { useEffect, useState } from 'react';

// Import WASM module
// Note: This will be loaded asynchronously
let wasmModule: typeof import('@battlewithbytes/battlemagic-core') | null = null;

/**
 * Hook to load and initialize the WASM module
 */
export function useBattleMagicCore() {
  const [core, setCore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadWasm = async () => {
      try {
        // Dynamic import of WASM module
        const module = await import('@battlewithbytes/battlemagic-core');

        if (!mounted) return;

        wasmModule = module;
        const instance = new module.BattleMagicCore();
        instance.init();

        setCore(instance);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
        setLoading(false);
      }
    };

    loadWasm();

    return () => {
      mounted = false;
    };
  }, []);

  return { core, loading, error };
}

/**
 * Provider component for BattleMagic
 */
interface BattleMagicProviderProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

export function BattleMagicProvider({ children, onError }: BattleMagicProviderProps) {
  const { core, loading, error } = useBattleMagicCore();

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (loading) {
    return <div>Loading BattleMagic...</div>;
  }

  if (error) {
    return <div>Error loading BattleMagic: {error.message}</div>;
  }

  return <>{children}</>;
}

export { wasmModule };
