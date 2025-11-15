#!/usr/bin/env node

/**
 * Watch mode for Rust -> WASM development
 * Watches .rs files and rebuilds on changes
 */

import chokidar from 'chokidar';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');

let building = false;
let queuedRebuild = false;

const debounceDelay = 500; // ms
let debounceTimer = null;

console.log(chalk.blue('Starting WASM watch mode...'));
console.log(chalk.gray('Watching: src/**/*.rs, Cargo.toml, Cargo.lock\n'));

// Build function
const buildWasm = () => {
  if (building) {
    queuedRebuild = true;
    return;
  }

  building = true;
  queuedRebuild = false;

  const startTime = Date.now();
  console.log(chalk.yellow('Building WASM...'));

  const build = spawn('node', ['scripts/build-wasm.mjs'], {
    cwd: packageRoot,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      WASM_PACK_PROFILE: 'dev', // Use dev profile for faster builds
      WASM_OPT: 'false',        // Skip optimization in dev mode
    },
  });

  build.on('close', (code) => {
    building = false;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (code === 0) {
      console.log(chalk.green(`✓ Build completed in ${duration}s\n`));
    } else {
      console.log(chalk.red(`✗ Build failed in ${duration}s\n`));
    }

    // If a rebuild was queued during the build, start it now
    if (queuedRebuild) {
      console.log(chalk.gray('Starting queued rebuild...\n'));
      buildWasm();
    }
  });

  build.on('error', (err) => {
    building = false;
    console.error(chalk.red('Build error:'), err);
  });
};

// Debounced build function
const debouncedBuild = (path) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    console.log(chalk.cyan(`Change detected: ${path}`));
    buildWasm();
  }, debounceDelay);
};

// Watch Rust source files
const watcher = chokidar.watch(
  [
    'src/**/*.rs',
    'Cargo.toml',
    'Cargo.lock',
  ],
  {
    cwd: packageRoot,
    persistent: true,
    ignoreInitial: false,
    ignored: [
      '**/target/**',
      '**/pkg/**',
      '**/.git/**',
    ],
  }
);

watcher
  .on('ready', () => {
    console.log(chalk.green('Watcher ready. Initial build starting...\n'));
    buildWasm();
  })
  .on('change', (path) => {
    if (!building) {
      debouncedBuild(path);
    }
  })
  .on('add', (path) => {
    if (!building) {
      debouncedBuild(path);
    }
  })
  .on('unlink', (path) => {
    if (!building) {
      debouncedBuild(path);
    }
  })
  .on('error', (error) => {
    console.error(chalk.red('Watcher error:'), error);
  });

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nStopping watcher...'));
  watcher.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  watcher.close();
  process.exit(0);
});
