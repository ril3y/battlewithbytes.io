#!/usr/bin/env node

/**
 * Analyze WASM bundle size and provide optimization recommendations
 */

import { readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

const wasmFile = join(packageRoot, 'pkg', 'battlemagic_core_bg.wasm');
const jsFile = join(packageRoot, 'pkg', 'battlemagic_core.js');

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const analyzeWasm = () => {
  try {
    const wasmStats = statSync(wasmFile);
    const jsStats = statSync(jsFile);

    console.log('\n=== WASM Bundle Analysis ===\n');
    console.log(`WASM file:    ${formatSize(wasmStats.size)}`);
    console.log(`JS glue code: ${formatSize(jsStats.size)}`);
    console.log(`Total:        ${formatSize(wasmStats.size + jsStats.size)}\n`);

    // Size recommendations
    const wasmSizeKB = wasmStats.size / 1024;

    if (wasmSizeKB < 100) {
      console.log('✓ Excellent size for web delivery');
    } else if (wasmSizeKB < 300) {
      console.log('✓ Good size, acceptable for most use cases');
    } else if (wasmSizeKB < 500) {
      console.log('⚠ Consider optimization strategies below');
    } else {
      console.log('⚠ Large bundle - optimization highly recommended');
    }

    console.log('\n=== Optimization Tips ===\n');
    console.log('1. Build with --release profile for production');
    console.log('2. Run wasm-opt -O4 for maximum size reduction');
    console.log('3. Use #[wasm_bindgen] sparingly to reduce JS glue code');
    console.log('4. Enable LTO (Link Time Optimization) in Cargo.toml:');
    console.log('   [profile.release]');
    console.log('   lto = true');
    console.log('   opt-level = "z"  # Optimize for size');
    console.log('   codegen-units = 1');
    console.log('5. Strip symbols: strip = true in profile');
    console.log('6. Consider lazy loading WASM module');
    console.log('7. Use wasm-pack --target web for tree-shaking support\n');

    // Compression estimates
    const gzipEstimate = wasmStats.size * 0.6; // Rough estimate
    const brotliEstimate = wasmStats.size * 0.5; // Rough estimate

    console.log('=== Compressed Size Estimates ===\n');
    console.log(`Gzip:    ${formatSize(gzipEstimate)} (~60% of original)`);
    console.log(`Brotli:  ${formatSize(brotliEstimate)} (~50% of original)\n`);

  } catch (error) {
    console.error('Error analyzing WASM bundle:', error.message);
    console.log('\nMake sure to build the WASM package first:');
    console.log('  pnpm run build:wasm');
    process.exit(1);
  }
};

analyzeWasm();
