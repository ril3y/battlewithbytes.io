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
    },
    riscv: {
      script: 'build-clang-riscv.sh',
      output: 'clang-riscv.wasm.gz',
      outputDir: 'output',
    },
    xtensa: {
      script: 'build-clang-xtensa.sh',
      output: 'clang-xtensa.wasm.gz',
      outputDir: 'output',
    },
    lld: {
      script: 'build-lld-universal.sh',
      output: 'lld.wasm.gz',
      outputDir: 'output',
      isLinker: true,  // Flag to update linkers section in manifest
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
 */
async function downloadOutput(compiler) {
  const config = CONFIG.compilers[compiler];

  logStep(`Downloading ${config.output}`);

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.localOutputDir)) {
    fs.mkdirSync(CONFIG.localOutputDir, { recursive: true });
  }

  const remotePath = `${CONFIG.remoteBuildDir}/${config.outputDir}/${config.output}`;
  const localPath = path.join(CONFIG.localOutputDir, config.output);

  await scpFrom(remotePath, localPath);

  // Get file info
  const stats = fs.statSync(localPath);
  logSuccess(`Downloaded ${config.output} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  // Also download the uncompressed version for hash calculation
  const wasmFile = config.output.replace('.gz', '');
  const remoteWasmPath = `${CONFIG.remoteBuildDir}/${config.outputDir}/${wasmFile}`;
  const localWasmPath = path.join(CONFIG.localOutputDir, wasmFile);

  try {
    await scpFrom(remoteWasmPath, localWasmPath);
    logInfo(`Also downloaded uncompressed ${wasmFile}`);
  } catch {
    logWarning(`Uncompressed ${wasmFile} not available`);
  }

  return localPath;
}

/**
 * Get SHA256 hash of remote file
 */
async function getRemoteHash(compiler) {
  const config = CONFIG.compilers[compiler];
  const remotePath = `${CONFIG.remoteBuildDir}/${config.outputDir}/${config.output}`;

  const { stdout } = await ssh(`sha256sum ${remotePath}`, { silent: true });
  const hash = stdout.split(' ')[0];

  logInfo(`SHA256: ${hash}`);
  return hash;
}

/**
 * Update manifest.json with new compiler/linker info
 * Preserves existing structure and fields, only updates hash/size/version
 */
async function updateManifest(compiler, hash) {
  const manifestPath = path.join(CONFIG.localOutputDir, 'manifest.json');
  const config = CONFIG.compilers[compiler];
  const isLinker = config.isLinker || false;

  // Determine the ID and which array to update
  const itemId = isLinker ? 'lld-universal' : `clang-${compiler}`;
  const arrayName = isLinker ? 'linkers' : 'compilers';

  if (!fs.existsSync(manifestPath)) {
    logWarning(`manifest.json not found at ${manifestPath}, skipping update`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Find existing entry in the appropriate array
  const itemIndex = manifest[arrayName].findIndex(c => c.id === itemId);
  if (itemIndex === -1) {
    logWarning(`${itemId} not found in manifest.${arrayName}, skipping update`);
    return;
  }

  const localPath = path.join(CONFIG.localOutputDir, config.output);
  const stats = fs.statSync(localPath);

  // Get version from build - try different patterns for different forks
  let version = manifest[arrayName][itemIndex].version || 'unknown';
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

  // Update the entry, preserving existing fields
  const existingEntry = manifest[arrayName][itemIndex];
  manifest[arrayName][itemIndex] = {
    ...existingEntry,
    version,
    size: stats.size,
    hash: `sha256:${hash}`,
  };

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
  all      Build all compilers (not including lld)

Options:
  --check  Only check buildbox connection
  --help   Show this help message

Examples:
  node scripts/build-remote.js arm
  node scripts/build-remote.js lld
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
