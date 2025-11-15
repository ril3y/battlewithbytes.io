#!/usr/bin/env node

/**
 * Build script for Rust -> WASM compilation with wasm-pack
 *
 * Environment variables:
 * - WASM_PACK_PROFILE: dev | profiling | release (default: release)
 * - WASM_OPT: Enable wasm-opt optimization (default: true for release)
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

// Configuration
const profile = process.env.WASM_PACK_PROFILE || 'release';
const enableWasmOpt = process.env.WASM_OPT !== 'false' && profile === 'release';

// Profile-specific settings
const profileConfig = {
  dev: {
    wasmPackArgs: ['--dev'],
    optimizationLevel: 0,
    debugInfo: true,
  },
  profiling: {
    wasmPackArgs: ['--profiling'],
    optimizationLevel: 2,
    debugInfo: true,
  },
  release: {
    wasmPackArgs: ['--release'],
    optimizationLevel: 3,
    debugInfo: false,
  },
};

const config = profileConfig[profile] || profileConfig.release;

console.log(`Building WASM package (profile: ${profile})...`);
console.log(`Optimization: ${config.optimizationLevel}, Debug info: ${config.debugInfo}`);

// Check if wasm-pack is installed
const checkWasmPack = () => {
  return new Promise((resolve, reject) => {
    const check = spawn('wasm-pack', ['--version'], { shell: true });
    check.on('error', () => reject(new Error('wasm-pack not found. Install: cargo install wasm-pack')));
    check.on('close', (code) => (code === 0 ? resolve() : reject(new Error('wasm-pack check failed'))));
  });
};

// Run wasm-pack build
const buildWasm = () => {
  return new Promise((resolve, reject) => {
    const args = [
      'build',
      '--target', 'web',
      '--out-dir', 'pkg',
      '--out-name', 'battlemagic_core',
      ...config.wasmPackArgs,
    ];

    // Add features if needed
    if (process.env.WASM_FEATURES) {
      args.push('--features', process.env.WASM_FEATURES);
    }

    console.log(`Running: wasm-pack ${args.join(' ')}`);

    const build = spawn('wasm-pack', args, {
      cwd: packageRoot,
      stdio: 'inherit',
      shell: true,
    });

    build.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`wasm-pack build failed with code ${code}`));
      }
    });

    build.on('error', (err) => {
      reject(err);
    });
  });
};

// Post-build optimization
const optimizeWasm = async () => {
  if (!enableWasmOpt) {
    console.log('Skipping wasm-opt (disabled or not in release mode)');
    return;
  }

  console.log('Running wasm-opt for size optimization...');

  const wasmFile = join(packageRoot, 'pkg', 'battlemagic_core_bg.wasm');

  if (!existsSync(wasmFile)) {
    console.warn(`WASM file not found: ${wasmFile}`);
    return;
  }

  return new Promise((resolve, reject) => {
    const args = [
      wasmFile,
      '-O4',           // Maximum optimization
      '--strip-debug', // Remove debug info
      '--strip-producers',
      '--dce',         // Dead code elimination
      '-o', wasmFile,  // Output to same file
    ];

    const opt = spawn('wasm-opt', args, {
      stdio: 'inherit',
      shell: true,
    });

    opt.on('close', (code) => {
      if (code === 0) {
        console.log('WASM optimization complete');
        resolve();
      } else {
        console.warn(`wasm-opt failed with code ${code} (continuing anyway)`);
        resolve(); // Don't fail build if wasm-opt fails
      }
    });

    opt.on('error', (err) => {
      console.warn('wasm-opt not available:', err.message);
      resolve(); // Don't fail build if wasm-opt not available
    });
  });
};

// Display build size
const displaySize = () => {
  const wasmFile = join(packageRoot, 'pkg', 'battlemagic_core_bg.wasm');

  if (existsSync(wasmFile)) {
    const fs = await import('fs/promises');
    const stats = await fs.stat(wasmFile);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`\nWASM size: ${sizeKB} KB`);

    if (stats.size > 500 * 1024) {
      console.warn('Warning: WASM file is larger than 500KB. Consider code splitting or optimization.');
    }
  }
};

// Main build process
const main = async () => {
  try {
    const startTime = Date.now();

    await checkWasmPack();
    await buildWasm();
    await optimizeWasm();
    await displaySize();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\nBuild completed in ${duration}s`);
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
};

main();
