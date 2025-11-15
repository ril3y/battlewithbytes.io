'use client';

import { useState } from 'react';
import { useWasmModule } from '../hooks/useWasmModule';
import { loadBattleMagicCore, isWasmSupported } from '../lib/wasm-loader';
import { WasmErrorBoundary } from '../components/WasmErrorBoundary';

export default function BattleMagicTestPage() {
  const [output, setOutput] = useState<string[]>([]);
  const wasm = useWasmModule(loadBattleMagicCore, {
    preload: false,
    debug: true
  });

  const addOutput = (line: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, `[${timestamp}] ${line}`]);
  };

  const handleLoadWasm = () => {
    addOutput('Loading WASM module...');
    wasm.load();
  };

  const handleTestVersion = () => {
    if (!wasm.module) {
      addOutput('ERROR: WASM not loaded');
      return;
    }
    try {
      const version = wasm.module.version();
      addOutput(`✓ Version: ${version}`);
    } catch (err) {
      addOutput(`ERROR: ${err}`);
    }
  };

  const handleTestDisassembler = () => {
    if (!wasm.module) {
      addOutput('ERROR: WASM not loaded');
      return;
    }

    try {
      const disasm = new wasm.module.Disassembler(0x08000000);
      addOutput('✓ Created Disassembler instance');

      const testBytes = new Uint8Array([0x00, 0xBF, 0x01, 0x20]);
      addOutput(`Testing with bytes: ${Array.from(testBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);

      const instructions = disasm.disassemble_thumb(testBytes, 10);
      addOutput(`✓ Disassembled ${instructions.length} instructions`);

      instructions.forEach((instr: any, idx: number) => {
        const addr = instr.address?.toString(16).padStart(8, '0') || '????????';
        const mnemonic = instr.mnemonic || '???';
        const operands = instr.operands || '';
        addOutput(`  [${idx}] 0x${addr}: ${mnemonic} ${operands}`);
      });
    } catch (err) {
      addOutput(`ERROR: ${err}`);
    }
  };

  const handleClear = () => {
    setOutput([]);
  };

  const wasmSupported = isWasmSupported();

  return (
    <WasmErrorBoundary>
      <div className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold font-mono mb-2">
              <span className="text-purple-400">&lt;</span>
              {' '}BattleMagic WASM Test{' '}
              <span className="text-purple-400">/&gt;</span>
            </h1>
            <p className="text-gray-400">
              Testing Rust/WASM integration with proof-of-concept ARM disassembler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">WASM Support</div>
              <div className={`font-mono text-lg ${wasmSupported ? 'text-green-400' : 'text-red-400'}`}>
                {wasmSupported ? '✓ Supported' : '✗ Not Supported'}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Module Status</div>
              <div className={`font-mono text-lg ${
                wasm.isInitialized ? 'text-green-400' :
                wasm.isLoading ? 'text-yellow-400' :
                wasm.error ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {wasm.isInitialized ? '✓ Ready' :
                 wasm.isLoading ? '⟳ Loading...' :
                 wasm.error ? '✗ Error' :
                 '○ Not Loaded'}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <div className="font-mono text-lg text-purple-400">
                {wasm.progress}%
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleLoadWasm}
                disabled={wasm.isLoading || wasm.isInitialized}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
              >
                {wasm.isLoading ? 'Loading...' : 'Load WASM'}
              </button>

              <button
                onClick={handleTestVersion}
                disabled={!wasm.isInitialized}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
              >
                Test Version
              </button>

              <button
                onClick={handleTestDisassembler}
                disabled={!wasm.isInitialized}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
              >
                Test Disassembler
              </button>

              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors ml-auto"
              >
                Clear Output
              </button>

              {wasm.error && (
                <button
                  onClick={wasm.reload}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>

          {wasm.error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="font-semibold text-red-300 mb-2">Error Loading WASM</div>
              <div className="text-red-200 text-sm font-mono">
                {wasm.error.message}
              </div>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-sm text-gray-400">Console Output</span>
              </div>
            </div>
            <div className="p-4 font-mono text-sm h-96 overflow-y-auto bg-black/50">
              {output.length === 0 ? (
                <div className="text-gray-600 italic">
                  No output yet. Click Load WASM to begin...
                </div>
              ) : (
                output.map((line, idx) => (
                  <div key={idx} className="mb-1">
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-sm text-blue-200">
              <strong>ℹ️ Info:</strong> This page tests the Rust/WASM integration with a proof-of-concept
              ARM Thumb disassembler. The current implementation is simplified - real Capstone integration
              will be added in Phase 2.
            </div>
          </div>
        </div>
      </div>
    </WasmErrorBoundary>
  );
}
