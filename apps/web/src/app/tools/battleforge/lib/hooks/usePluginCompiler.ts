/**
 * usePluginCompiler Hook
 *
 * React hook for using compilers with a plugin architecture.
 * Supports ClangWasmLoader for ARM embedded compilation.
 */

import { useState, useCallback, useEffect } from 'react';
import { ClangWasmLoader, ClangExecutionOptions, ClangExecutionResult } from '../compiler/ClangWasmLoader';

export type CompilerType = 'clang-arm';

export interface CompilerPlugin {
  type: CompilerType;
  name: string;
  load(): Promise<void>;
  execute(options: unknown): Promise<unknown>;
  getVersion(): Promise<string>;
  isReady(): boolean;
}

export interface ClangPlugin extends CompilerPlugin {
  type: 'clang-arm';
  instance: ClangWasmLoader;
  execute(options: ClangExecutionOptions): Promise<ClangExecutionResult>;
}

export type AnyCompilerPlugin = ClangPlugin;

export interface UsePluginCompilerOptions {
  autoLoad?: boolean;
}

export interface UsePluginCompilerReturn {
  compiler: AnyCompilerPlugin | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  version: string | null;
  loadCompiler: (plugin: AnyCompilerPlugin) => Promise<void>;
  execute: (options: unknown) => Promise<unknown>;
  getVersion: () => Promise<string>;
}

/**
 * Create a Clang ARM compiler plugin
 */
export function createClangPlugin(loader: ClangWasmLoader): ClangPlugin {
  return {
    type: 'clang-arm',
    name: 'Clang ARM',
    instance: loader,
    load: () => loader.load(),
    execute: (options: ClangExecutionOptions) => loader.execute(options),
    getVersion: () => loader.getVersion(),
    isReady: () => loader.isReady()
  };
}

/**
 * React hook for using compilers with a plugin architecture
 */
export function usePluginCompiler(
  initialPlugin?: AnyCompilerPlugin,
  options: UsePluginCompilerOptions = {}
): UsePluginCompilerReturn {
  const [compiler, setCompiler] = useState<AnyCompilerPlugin | null>(initialPlugin || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  /**
   * Load a compiler plugin
   */
  const loadCompiler = useCallback(async (plugin: AnyCompilerPlugin) => {
    setIsLoading(true);
    setError(null);
    setIsReady(false);

    try {
      await plugin.load();
      setCompiler(plugin);
      setIsReady(true);

      // Get version
      try {
        const ver = await plugin.getVersion();
        setVersion(ver);
      } catch (err) {
        console.warn('Failed to get compiler version:', err);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('[usePluginCompiler] Failed to load compiler:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Execute compiler with given options
   */
  const execute = useCallback(async (options: unknown) => {
    if (!compiler) {
      throw new Error('No compiler loaded');
    }

    if (!compiler.isReady()) {
      throw new Error('Compiler not ready');
    }

    return compiler.execute(options as ClangExecutionOptions);
  }, [compiler]);

  /**
   * Get compiler version
   */
  const getVersion = useCallback(async () => {
    if (!compiler) {
      throw new Error('No compiler loaded');
    }

    return compiler.getVersion();
  }, [compiler]);

  /**
   * Auto-load initial compiler if specified
   */
  useEffect(() => {
    if (options.autoLoad && initialPlugin && !isReady && !isLoading) {
      loadCompiler(initialPlugin);
    }
  }, [options.autoLoad, initialPlugin, isReady, isLoading, loadCompiler]);

  return {
    compiler,
    isLoading,
    isReady,
    error,
    version,
    loadCompiler,
    execute,
    getVersion
  };
}
