#!/usr/bin/env node
/**
 * Download WASM files from GitHub Releases
 *
 * Downloads pre-built WASM compiler binaries from battlewithbytes/battleforge_boards releases.
 *
 * Usage:
 *   node scripts/download-wasm.js                    # Download latest release
 *   node scripts/download-wasm.js --tag wasm-v1.0.0  # Download specific release
 *   node scripts/download-wasm.js --check            # Check if WASM files exist
 *   node scripts/download-wasm.js --force            # Force re-download even if exists
 *
 * Environment Variables:
 *   GITHUB_TOKEN - Optional, for higher rate limits
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  owner: 'battlewithbytes',
  repo: 'battleforge_boards',
  wasmDir: path.join(__dirname, '..', 'public', 'wasm'),

  // Required files for a working installation
  requiredFiles: [
    'clang_arm/clang.wasm',
    'clang_arm/clang.js',
    'clang_arm/lld.wasm',
    'clang_arm/lld.js',
    'manifest.json',
  ],

  // Optional files (don't fail if missing)
  optionalFiles: [
    'clang_arm/llvm-ar.wasm',
    'clang_arm/llvm-objdump.wasm',
    'clang_riscv/clang-riscv.wasm',
    'clang_xtensa/clang-xtensa.wasm',
    'capstone/capstone-arm.wasm',
  ],
};

// Colors
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function logStep(msg) {
  console.log('');
  log(`=== ${msg} ===`, 'cyan');
}

/**
 * Make HTTPS request with redirect following
 */
function httpsGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'BattleForge-WASM-Downloader/1.0',
      ...options.headers,
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const req = https.get(url, { headers }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsGet(res.headers.location, options).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }

      if (options.stream) {
        resolve(res);
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Download file with progress
 */
async function downloadFile(url, destPath, fileName) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const res = await httpsGet(url, { stream: true });
  const totalSize = parseInt(res.headers['content-length'] || '0', 10);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    let downloaded = 0;
    let lastPercent = -1;

    res.on('data', (chunk) => {
      downloaded += chunk.length;
      if (totalSize > 0) {
        const percent = Math.floor((downloaded / totalSize) * 100);
        if (percent !== lastPercent && percent % 10 === 0) {
          process.stdout.write(`\r  ${fileName}: ${percent}%`);
          lastPercent = percent;
        }
      }
    });

    res.pipe(file);

    file.on('finish', () => {
      process.stdout.write(`\r  ${fileName}: done (${humanSize(downloaded)})    \n`);
      file.close(resolve);
    });

    file.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Get file size in human readable format
 */
function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Get latest release info from GitHub API
 */
async function getLatestRelease() {
  const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/releases`;
  const data = await httpsGet(url);
  const releases = JSON.parse(data.toString());

  // Find latest WASM release (tags starting with 'wasm-')
  const wasmReleases = releases.filter(r => r.tag_name.startsWith('wasm-'));

  if (wasmReleases.length === 0) {
    return null;
  }

  return wasmReleases[0];
}

/**
 * Get specific release by tag
 */
async function getReleaseByTag(tag) {
  const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/releases/tags/${tag}`;
  try {
    const data = await httpsGet(url);
    return JSON.parse(data.toString());
  } catch {
    return null;
  }
}

/**
 * Check if required WASM files exist
 */
function checkWasmFiles() {
  const missing = [];
  const existing = [];

  for (const file of CONFIG.requiredFiles) {
    const filePath = path.join(CONFIG.wasmDir, file);
    if (fs.existsSync(filePath)) {
      existing.push(file);
    } else {
      missing.push(file);
    }
  }

  return { missing, existing };
}

/**
 * Try to use gh CLI for download (faster, handles auth)
 */
function tryGhDownload(tag, destDir) {
  try {
    execSync('gh --version', { stdio: 'pipe' });

    log('Using GitHub CLI for download...', 'blue');
    execSync(`gh release download ${tag} --repo ${CONFIG.owner}/${CONFIG.repo} --dir "${destDir}" --clobber`, {
      stdio: 'inherit',
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Reorganize downloaded files into expected directory structure
 * GitHub Releases flattens directory structure, so we need to move files
 */
function reorganizeFiles() {
  const wasmDir = CONFIG.wasmDir;

  // Map of flat file names to their expected locations
  const fileMap = {
    // Clang ARM compiler files
    'clang.wasm': 'clang_arm/clang.wasm',
    'clang.js': 'clang_arm/clang.js',
    'lld.wasm': 'clang_arm/lld.wasm',
    'lld.js': 'clang_arm/lld.js',
    'clang-standalone.wasm': 'clang_arm/clang-standalone.wasm',
    'clang-standalone.js': 'clang_arm/clang-standalone.js',
    'llvm-ar.wasm': 'clang_arm/llvm-ar.wasm',
    'llvm-ar.js': 'clang_arm/llvm-ar.js',
    'llvm-objdump.wasm': 'clang_arm/llvm-objdump.wasm',
    'llvm-objdump.js': 'clang_arm/llvm-objdump.js',
    // Capstone disassembler files
    'capstone-arm.wasm': 'capstone/capstone-arm.wasm',
    'capstone-arm.js': 'capstone/capstone-arm.js',
    'capstone-api.js': 'capstone/capstone-api.js',
  };

  let moved = 0;
  for (const [flatName, targetPath] of Object.entries(fileMap)) {
    const srcPath = path.join(wasmDir, flatName);
    const destPath = path.join(wasmDir, targetPath);

    if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
      // Ensure target directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Move file
      fs.renameSync(srcPath, destPath);
      log(`  Moved ${flatName} -> ${targetPath}`, 'dim');
      moved++;
    }
  }

  if (moved > 0) {
    log(`Reorganized ${moved} files into expected structure`, 'green');
  }
}

/**
 * Download using GitHub API (fallback)
 */
async function apiDownload(release) {
  const assets = release.assets || [];

  if (assets.length === 0) {
    throw new Error('No assets found in release');
  }

  log(`Found ${assets.length} assets to download`, 'blue');

  for (const asset of assets) {
    const destPath = path.join(CONFIG.wasmDir, asset.name);

    // Handle directory structure in asset names
    if (asset.name.includes('/')) {
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    await downloadFile(asset.browser_download_url, destPath, asset.name);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  let tag = args.find(a => a.startsWith('--tag='))?.split('=')[1];
  const checkOnly = args.includes('--check');
  const force = args.includes('--force');

  // No explicit tag: use the pinned release from wasm-release.json so
  // builds are reproducible and Turbo cache-busts when the pin changes.
  if (!tag) {
    const pinPath = path.join(__dirname, '..', 'wasm-release.json');
    if (fs.existsSync(pinPath)) {
      try {
        tag = JSON.parse(fs.readFileSync(pinPath, 'utf8')).tag;
        if (tag) log(`Using pinned release from wasm-release.json: ${tag}`, 'dim');
      } catch (err) {
        log(`Could not read wasm-release.json (${err.message}), falling back to latest`, 'yellow');
      }
    }
  }

  // Check mode - just verify files exist
  if (checkOnly) {
    const { missing, existing } = checkWasmFiles();

    if (missing.length === 0) {
      log('All required WASM files present', 'green');
      for (const file of existing) {
        log(`  ✓ ${file}`, 'dim');
      }
      process.exit(0);
    } else {
      log('Missing required WASM files:', 'yellow');
      for (const file of missing) {
        log(`  ✗ ${file}`, 'red');
      }
      process.exit(1);
    }
  }

  // Check if download needed
  if (!force) {
    const { missing } = checkWasmFiles();
    if (missing.length === 0) {
      log('WASM files already present. Use --force to re-download.', 'green');
      process.exit(0);
    }
    log(`Missing ${missing.length} required WASM files, downloading...`, 'yellow');
  }

  logStep('Fetching release info');

  let release;
  if (tag) {
    release = await getReleaseByTag(tag);
    if (!release) {
      log(`Release not found: ${tag}`, 'red');
      process.exit(1);
    }
  } else {
    release = await getLatestRelease();
    if (!release) {
      log('No WASM releases found in repository', 'red');
      log(`Create one with: node scripts/upload-wasm-release.js`, 'yellow');
      process.exit(1);
    }
  }

  log(`Release: ${release.tag_name}`, 'green');
  log(`Published: ${release.published_at}`, 'dim');

  logStep('Downloading WASM files');

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.wasmDir)) {
    fs.mkdirSync(CONFIG.wasmDir, { recursive: true });
  }

  // Try gh CLI first (faster, handles large files better)
  if (tryGhDownload(release.tag_name, CONFIG.wasmDir)) {
    log('Download complete via GitHub CLI', 'green');
  } else {
    // Fall back to API download
    log('GitHub CLI not available, using API...', 'yellow');
    await apiDownload(release);
  }

  // Reorganize flat files into expected directory structure
  logStep('Reorganizing files');
  reorganizeFiles();

  // Verify download
  logStep('Verifying download');
  const { missing } = checkWasmFiles();

  if (missing.length > 0) {
    log('Warning: Some required files still missing:', 'yellow');
    for (const file of missing) {
      log(`  ✗ ${file}`, 'red');
    }
  } else {
    log('All required WASM files downloaded successfully!', 'green');
  }

  logStep('Done!');
}

main().catch(err => {
  log(`Error: ${err.message}`, 'red');
  process.exit(1);
});
