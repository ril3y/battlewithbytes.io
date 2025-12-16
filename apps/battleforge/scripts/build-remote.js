#!/usr/bin/env node
/**
 * Remote WASM Build Script
 *
 * Builds Clang WASM compilers on the buildbox and copies results back.
 *
 * Usage:
 *   node scripts/build-remote.js arm      # Build ARM compiler
 *   node scripts/build-remote.js riscv    # Build RISC-V compiler
 *   node scripts/build-remote.js xtensa   # Build Xtensa compiler
 *   node scripts/build-remote.js all      # Build all compilers
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configuration
const CONFIG = {
  host: '192.168.1.62',
  user: 'builder',
  sshKey: path.join(os.homedir(), '.ssh', 'buildbox_key'),

  // Remote paths
  remoteBuildDir: '~/clang-wasm-builds',
  remoteScriptsDir: '~/',

  // Local paths
  localScriptsDir: path.join(__dirname),
  localOutputDir: path.join(__dirname, '..', 'public', 'wasm'),

  // Build scripts and their outputs
  compilers: {
    arm: {
      script: 'build-clang-arm.sh',
      output: 'clang-arm.wasm.gz',
      outputDir: 'output',
      remoteBuildDir: '~/clang-wasm-builds',
    },
    riscv: {
      script: 'build-clang-riscv.sh',
      output: 'clang-riscv.wasm.gz',
      outputDir: 'output',
      remoteBuildDir: '~/clang-wasm-builds',
    },
    xtensa: {
      script: 'build-clang-xtensa.sh',
      output: 'clang-xtensa.wasm.gz',
      outputDir: 'output',
      remoteBuildDir: '~/clang-wasm-builds',
    },
    lld: {
      script: 'build-lld-universal.sh',
      output: 'lld.wasm.gz',
      outputDir: 'output',
      remoteBuildDir: '~/clang-wasm-builds',
      isLinker: true,  // Flag to update linkers section in manifest
    },
    capstone: {
      script: 'build-capstone-wasm.sh',
      output: 'capstone-arm.wasm.gz',
      outputDir: 'output',
      remoteBuildDir: '~/capstone-wasm-build',
      isDisassembler: true,  // Flag to update disassemblers section in manifest
      localSubdir: 'capstone',  // Output to public/wasm/capstone/
      additionalFiles: ['capstone-arm.js', 'capstone-api.js'],
    },
    unicorn: {
      script: 'build-unicorn-arm.sh',
      output: 'unicorn-arm.wasm.gz',
      outputDir: 'output',
      remoteBuildDir: '~/unicorn-wasm-builds',
      isEmulator: true,  // Flag to update emulators section in manifest
      localSubdir: 'unicorn',  // Output to public/wasm/unicorn/
      additionalFiles: ['unicorn-arm.js'],
    },
  },
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(message) {
  console.log('');
  log('='.repeat(60), 'green');
  log(message, 'green');
  log('='.repeat(60), 'green');
  console.log('');
}

function logInfo(message) {
  log(`[INFO] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`[SUCCESS] ${message}`, 'green');
}

function logError(message) {
  log(`[ERROR] ${message}`, 'red');
}

function logWarning(message) {
  log(`[WARNING] ${message}`, 'yellow');
}

/**
 * Execute a command and return a promise
 */
function exec(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    logInfo(`Running: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      ...options,
    });

    let stdout = '';
    let stderr = '';

    if (options.silent) {
      proc.stdout?.on('data', (data) => { stdout += data; });
      proc.stderr?.on('data', (data) => { stderr += data; });
    }

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    proc.on('error', reject);
  });
}

/**
 * Execute SSH command on buildbox
 */
async function ssh(command, options = {}) {
  const args = [
    '-i', CONFIG.sshKey,
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'BatchMode=yes',
    `${CONFIG.user}@${CONFIG.host}`,
    command,
  ];
  return exec('ssh', args, options);
}

/**
 * Copy file to buildbox
 */
async function scpTo(localPath, remotePath) {
  const args = [
    '-i', CONFIG.sshKey,
    '-o', 'StrictHostKeyChecking=no',
    localPath,
    `${CONFIG.user}@${CONFIG.host}:${remotePath}`,
  ];
  return exec('scp', args);
}

/**
 * Copy file from buildbox
 */
async function scpFrom(remotePath, localPath) {
  const args = [
    '-i', CONFIG.sshKey,
    '-o', 'StrictHostKeyChecking=no',
    `${CONFIG.user}@${CONFIG.host}:${remotePath}`,
    localPath,
  ];
  return exec('scp', args);
}

/**
 * Check if buildbox is reachable
 */
async function checkConnection() {
  logStep('Checking buildbox connection');

  // Check SSH key exists
  if (!fs.existsSync(CONFIG.sshKey)) {
    throw new Error(`SSH key not found: ${CONFIG.sshKey}`);
  }
  logInfo(`SSH key found: ${CONFIG.sshKey}`);

  // Test SSH connection
  try {
    await ssh('echo "Connection successful"', { silent: true });
    logSuccess('Connected to buildbox');
  } catch (err) {
    throw new Error(`Cannot connect to buildbox: ${err.message}`);
  }

  // Get system info
  try {
    const { stdout } = await ssh('nproc', { silent: true });
    logInfo(`Buildbox CPUs: ${stdout.trim()}`);
  } catch {
    // Ignore system info errors
  }
}

/**
 * Upload build script to buildbox
 */
async function uploadScript(compiler) {
  const config = CONFIG.compilers[compiler];
  const localScript = path.join(CONFIG.localScriptsDir, config.script);

  logStep(`Uploading ${config.script}`);

  if (!fs.existsSync(localScript)) {
    throw new Error(`Build script not found: ${localScript}`);
  }

  await scpTo(localScript, `${CONFIG.remoteScriptsDir}${config.script}`);

  // Fix line endings (use sed in-place to avoid Windows shell interpreting pipes/redirects)
  await ssh(`sed -i 's/\\r$//' /home/builder/${config.script}`);
  await ssh(`chmod +x /home/builder/${config.script}`);

  logSuccess(`Uploaded ${config.script}`);
}

/**
 * Run build on buildbox
 */
async function runBuild(compiler) {
  const config = CONFIG.compilers[compiler];

  logStep(`Building ${compiler} compiler`);
  logWarning('This may take 15-60 minutes depending on the compiler...');

  // Run build script with full path
  await ssh(`/home/builder/${config.script}`);

  logSuccess(`${compiler} build complete`);
}

/**
 * Download build output
 * Tries compressed file first, falls back to uncompressed
 */
async function downloadOutput(compiler) {
  const config = CONFIG.compilers[compiler];
  const remoteBuildDir = config.remoteBuildDir || CONFIG.remoteBuildDir;

  logStep(`Downloading ${config.output}`);

  // Determine local output directory (may have subdirectory for tools)
  let localDir = CONFIG.localOutputDir;
  if (config.localSubdir) {
    localDir = path.join(CONFIG.localOutputDir, config.localSubdir);
  }

  // Ensure output directory exists
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const remotePath = `${remoteBuildDir}/${config.outputDir}/${config.output}`;
  const localPath = path.join(localDir, config.output);

  let downloadedPath = localPath;
  let downloadedFile = config.output;

  try {
    await scpFrom(remotePath, localPath);
    const stats = fs.statSync(localPath);
    logSuccess(`Downloaded ${config.output} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } catch {
    // If compressed file doesn't exist, try uncompressed
    if (config.output.endsWith('.gz')) {
      const uncompressedFile = config.output.replace('.gz', '');
      const remoteUncompressed = `${remoteBuildDir}/${config.outputDir}/${uncompressedFile}`;
      const localUncompressed = path.join(localDir, uncompressedFile);

      logWarning(`${config.output} not found, trying ${uncompressedFile}...`);

      try {
        await scpFrom(remoteUncompressed, localUncompressed);
        const stats = fs.statSync(localUncompressed);
        logSuccess(`Downloaded ${uncompressedFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        downloadedPath = localUncompressed;
        downloadedFile = uncompressedFile;

        // Compress it locally
        logInfo(`Compressing ${uncompressedFile}...`);
        const { execSync } = require('child_process');
        execSync(`gzip -9 -f -k "${localUncompressed}"`, { stdio: 'pipe' });
        logSuccess(`Created ${config.output}`);
      } catch (err) {
        logWarning(`Could not download ${uncompressedFile}: ${err.message}`);
      }
    } else {
      throw new Error(`Failed to download ${config.output}`);
    }
  }

  // Also download uncompressed version if we got compressed
  if (downloadedFile.endsWith('.gz')) {
    const wasmFile = config.output.replace('.gz', '');
    const remoteWasmPath = `${remoteBuildDir}/${config.outputDir}/${wasmFile}`;
    const localWasmPath = path.join(localDir, wasmFile);

    try {
      await scpFrom(remoteWasmPath, localWasmPath);
      logInfo(`Also downloaded uncompressed ${wasmFile}`);
    } catch {
      logWarning(`Uncompressed ${wasmFile} not available`);
    }
  }

  // Download additional files (JS glue code, API wrappers)
  if (config.additionalFiles) {
    for (const file of config.additionalFiles) {
      const remoteFilePath = `${remoteBuildDir}/${config.outputDir}/${file}`;
      const localFilePath = path.join(localDir, file);
      try {
        await scpFrom(remoteFilePath, localFilePath);
        logInfo(`Downloaded ${file}`);
      } catch {
        logWarning(`Additional file ${file} not available`);
      }
    }
  }

  return downloadedPath;
}

/**
 * Get SHA256 hash of remote file
 * Tries compressed file first, then uncompressed
 */
async function getRemoteHash(compiler) {
  const config = CONFIG.compilers[compiler];
  const remoteBuildDir = config.remoteBuildDir || CONFIG.remoteBuildDir;
  const remotePath = `${remoteBuildDir}/${config.outputDir}/${config.output}`;

  // Try the expected file first
  try {
    const { stdout } = await ssh(`sha256sum ${remotePath}`, { silent: true });
    const hash = stdout.split(' ')[0];
    logInfo(`SHA256: ${hash}`);
    return hash;
  } catch {
    // If compressed file doesn't exist, try uncompressed
    if (config.output.endsWith('.gz')) {
      const uncompressedPath = remotePath.replace('.gz', '');
      logWarning(`${config.output} not found, trying uncompressed version...`);
      try {
        const { stdout } = await ssh(`sha256sum ${uncompressedPath}`, { silent: true });
        const hash = stdout.split(' ')[0];
        logInfo(`SHA256 (uncompressed): ${hash}`);
        return hash;
      } catch {
        logWarning(`Could not hash ${compiler} output - file may not exist`);
        return 'pending';
      }
    }
    logWarning(`Could not hash ${compiler} output`);
    return 'pending';
  }
}

/**
 * Update manifest.json with new tool info
 * Preserves existing structure and fields, only updates hash/size
 */
async function updateManifest(compiler, hash) {
  const manifestPath = path.join(CONFIG.localOutputDir, 'manifest.json');
  const config = CONFIG.compilers[compiler];

  // Determine the ID and which array to update based on tool type
  let itemId;
  let arrayName;

  if (config.isDisassembler) {
    itemId = 'capstone-arm';
    arrayName = 'disassemblers';
  } else if (config.isEmulator) {
    itemId = 'unicorn-arm';
    arrayName = 'emulators';
  } else if (config.isLinker) {
    itemId = 'lld-universal';
    arrayName = 'linkers';
  } else {
    itemId = `clang-${compiler}`;
    arrayName = 'compilers';
  }

  if (!fs.existsSync(manifestPath)) {
    logWarning(`manifest.json not found at ${manifestPath}, skipping update`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Ensure the array exists
  if (!manifest[arrayName]) {
    logWarning(`${arrayName} array not found in manifest, skipping update`);
    return;
  }

  // Find existing entry in the appropriate array
  const itemIndex = manifest[arrayName].findIndex(c => c.id === itemId);
  if (itemIndex === -1) {
    logWarning(`${itemId} not found in manifest.${arrayName}, skipping update`);
    return;
  }

  // Get local file path (may be in subdirectory)
  let localDir = CONFIG.localOutputDir;
  if (config.localSubdir) {
    localDir = path.join(CONFIG.localOutputDir, config.localSubdir);
  }
  const localPath = path.join(localDir, config.output);
  const stats = fs.statSync(localPath);

  // For compilers, try to detect version from build
  let version = manifest[arrayName][itemIndex].fullVersion || manifest[arrayName][itemIndex].version || 'unknown';
  if (!config.isDisassembler && !config.isEmulator) {
    try {
      // Try Espressif fork pattern first (xtensa_release_18.1.2)
      let { stdout } = await ssh(`cd ~/clang-wasm-builds/llvm-* && git branch --show-current 2>/dev/null || echo ""`, { silent: true });
      const branch = stdout.trim();

      if (branch.includes('xtensa_release_')) {
        version = branch.replace('xtensa_release_', '') + '-esp';
      } else {
        // Try upstream LLVM pattern
        ({ stdout } = await ssh(`grep -o 'llvmorg-[0-9.]*' ~/clang-wasm-builds/llvm-*/llvm-src/.git/config 2>/dev/null | head -1`, { silent: true }));
        if (stdout.trim()) {
          version = stdout.trim().replace('llvmorg-', '');
        }
      }
    } catch {
      // Keep existing version if detection fails
    }
  }

  // Update the entry, preserving existing fields
  const existingEntry = manifest[arrayName][itemIndex];

  // Use v2 format with hashes object
  manifest[arrayName][itemIndex] = {
    ...existingEntry,
    size: stats.size,
    hashes: {
      ...existingEntry.hashes,
      compressed: `sha256:${hash}`,
    },
  };

  // For non-tools (compilers), also update version
  if (!config.isDisassembler && !config.isEmulator) {
    manifest[arrayName][itemIndex].version = version;
  }

  // Remove "coming_soon" status since it's now built
  if (manifest[arrayName][itemIndex].status === 'coming_soon') {
    delete manifest[arrayName][itemIndex].status;
  }

  // Update lastUpdated
  manifest.lastUpdated = new Date().toISOString().split('T')[0];

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  logSuccess(`Updated manifest.json for ${itemId}`);
  logInfo(`  Version: ${version}`);
  logInfo(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  logInfo(`  Hash: sha256:${hash.slice(0, 16)}...`);
}

/**
 * Build a single compiler
 */
async function buildCompiler(compiler) {
  const startTime = Date.now();

  logStep(`Starting ${compiler.toUpperCase()} compiler build`);

  await uploadScript(compiler);
  await runBuild(compiler);

  const hash = await getRemoteHash(compiler);
  await downloadOutput(compiler);
  await updateManifest(compiler, hash);

  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  logSuccess(`${compiler.toUpperCase()} compiler built in ${duration} minutes`);
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Remote WASM Build Script

Usage:
  node scripts/build-remote.js <target>

Targets:
  arm      Build Clang ARM compiler (STM32, nRF52, RP2040)
  riscv    Build Clang RISC-V compiler (ESP32-C3, ESP32-C6)
  xtensa   Build Clang Xtensa compiler (ESP32, ESP32-S2, ESP32-S3)
  lld      Build Universal LLD linker (ARM + RISC-V + Xtensa)
  capstone Build Capstone ARM disassembler
  unicorn  Build Unicorn ARM emulator
  all      Build all tools

Options:
  --check  Only check buildbox connection
  --help   Show this help message

Examples:
  node scripts/build-remote.js arm
  node scripts/build-remote.js lld
  node scripts/build-remote.js capstone unicorn
  node scripts/build-remote.js all
  node scripts/build-remote.js --check
`);
    process.exit(0);
  }

  try {
    await checkConnection();

    if (args.includes('--check')) {
      logSuccess('Buildbox connection verified');
      process.exit(0);
    }

    const compilers = args[0] === 'all'
      ? Object.keys(CONFIG.compilers)
      : args.filter(a => !a.startsWith('--'));

    // Validate compiler names
    for (const compiler of compilers) {
      if (!CONFIG.compilers[compiler]) {
        throw new Error(`Unknown compiler: ${compiler}. Valid options: ${Object.keys(CONFIG.compilers).join(', ')}`);
      }
    }

    // Build each compiler
    for (const compiler of compilers) {
      await buildCompiler(compiler);
    }

    logStep('Build Complete!');
    logSuccess(`Output directory: ${CONFIG.localOutputDir}`);

  } catch (err) {
    logError(err.message);
    process.exit(1);
  }
}

main();
