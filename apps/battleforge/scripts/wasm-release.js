#!/usr/bin/env node
/**
 * WASM Release Pipeline
 *
 * Unified script for building WASM tools on buildbox and creating GitHub releases.
 *
 * Usage:
 *   node scripts/wasm-release.js                    # Build all + create release
 *   node scripts/wasm-release.js --build-only       # Build only, no release
 *   node scripts/wasm-release.js --release-only     # Release only (use existing files)
 *   node scripts/wasm-release.js --tools-only       # Build capstone + unicorn only
 *   node scripts/wasm-release.js --compilers-only   # Build clang compilers only
 *   node scripts/wasm-release.js --tag v2.0.0       # Specify release tag
 *   node scripts/wasm-release.js --draft            # Create as draft release
 *   node scripts/wasm-release.js --dry-run          # Show what would be done
 *   node scripts/wasm-release.js --ci               # CI mode (no buildbox, expect pre-built files)
 *
 * Environment:
 *   BUILDBOX_HOST     - Override buildbox host (default: 192.168.1.62)
 *   BUILDBOX_USER     - Override buildbox user (default: builder)
 *   BUILDBOX_KEY      - Override SSH key path
 *   SKIP_COMPILERS    - Skip building compilers (set to "true")
 *   SKIP_TOOLS        - Skip building tools (set to "true")
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  host: process.env.BUILDBOX_HOST || '192.168.1.62',
  user: process.env.BUILDBOX_USER || 'builder',
  sshKey: process.env.BUILDBOX_KEY || path.join(os.homedir(), '.ssh', 'buildbox_key'),
  repo: 'battlewithbytes/battleforge_boards',
  wasmDir: path.join(__dirname, '..', 'public', 'wasm'),
  scriptsDir: __dirname,

  // Tool groups
  compilers: ['arm', 'riscv', 'xtensa', 'lld'],
  tools: ['capstone', 'unicorn'],
};

// Colors
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function logStep(msg) {
  console.log('');
  log('═'.repeat(60), 'cyan');
  log(`  ${msg}`, 'cyan');
  log('═'.repeat(60), 'cyan');
}

function logSubstep(msg) {
  log(`  → ${msg}`, 'blue');
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function sha256(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    buildOnly: args.includes('--build-only'),
    releaseOnly: args.includes('--release-only'),
    toolsOnly: args.includes('--tools-only'),
    compilersOnly: args.includes('--compilers-only'),
    tag: args.find(a => a.startsWith('--tag='))?.split('=')[1] ||
         args.find((a, i) => args[i - 1] === '--tag'),
    draft: args.includes('--draft'),
    dryRun: args.includes('--dry-run'),
    ci: args.includes('--ci'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
WASM Release Pipeline

Usage: node scripts/wasm-release.js [options]

Options:
  --build-only       Build WASM files only, don't create release
  --release-only     Create release only, use existing files
  --tools-only       Build only tools (capstone, unicorn)
  --compilers-only   Build only compilers (arm, riscv, xtensa, lld)
  --tag <version>    Specify release tag (e.g., --tag v2.0.0)
  --draft            Create release as draft
  --dry-run          Show what would be done without doing it
  --ci               CI mode: skip buildbox builds, expect pre-built files
  --help, -h         Show this help

Examples:
  node scripts/wasm-release.js                     # Full pipeline
  node scripts/wasm-release.js --tools-only        # Build tools only
  node scripts/wasm-release.js --release-only --tag wasm-v2.0.0
  node scripts/wasm-release.js --ci --release-only # CI: release existing files
`);
}

/**
 * Check prerequisites
 */
function checkPrerequisites(opts) {
  log('Checking prerequisites...', 'blue');

  // Check gh CLI
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    logSubstep('GitHub CLI: authenticated');
  } catch {
    if (!opts.buildOnly) {
      log('GitHub CLI not authenticated. Run: gh auth login', 'red');
      process.exit(1);
    }
  }

  // Check buildbox connectivity (unless CI mode or release-only)
  if (!opts.ci && !opts.releaseOnly) {
    try {
      execSync(`ssh -i "${CONFIG.sshKey}" -o ConnectTimeout=5 ${CONFIG.user}@${CONFIG.host} "echo ok"`, {
        stdio: 'pipe'
      });
      logSubstep(`Buildbox: connected to ${CONFIG.host}`);
    } catch {
      log(`Cannot connect to buildbox ${CONFIG.host}`, 'red');
      log('Options:', 'yellow');
      log('  1. Ensure buildbox is running and accessible', 'yellow');
      log('  2. Use --release-only to skip building', 'yellow');
      log('  3. Use --ci mode for CI/CD environments', 'yellow');
      process.exit(1);
    }
  }

  // Check WASM directory
  if (!fs.existsSync(CONFIG.wasmDir)) {
    fs.mkdirSync(CONFIG.wasmDir, { recursive: true });
    logSubstep(`Created WASM directory: ${CONFIG.wasmDir}`);
  } else {
    logSubstep(`WASM directory: ${CONFIG.wasmDir}`);
  }
}

/**
 * Build WASM files on buildbox
 */
async function buildWasm(targets, opts) {
  logStep(`Building WASM: ${targets.join(', ')}`);

  if (opts.dryRun) {
    log('Dry run - would build:', 'yellow');
    targets.forEach(t => log(`  - ${t}`, 'blue'));
    return true;
  }

  const buildScript = path.join(CONFIG.scriptsDir, 'build-remote.js');

  for (const target of targets) {
    logSubstep(`Building ${target}...`);

    try {
      execSync(`node "${buildScript}" ${target}`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
      });
      log(`  ✓ ${target} built successfully`, 'green');
    } catch (err) {
      log(`  ✗ ${target} build failed`, 'red');
      return false;
    }
  }

  return true;
}

/**
 * Update manifest with current file info
 */
function updateManifest(opts) {
  logStep('Updating manifest');

  if (opts.dryRun) {
    log('Dry run - would update manifest', 'yellow');
    return;
  }

  const manifestPath = path.join(CONFIG.wasmDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    log('Manifest not found, skipping update', 'yellow');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.lastUpdated = new Date().toISOString().split('T')[0];

  // Update hashes for all tools
  const toolDirs = ['capstone', 'unicorn'];
  for (const dir of toolDirs) {
    const toolDir = path.join(CONFIG.wasmDir, dir);
    if (!fs.existsSync(toolDir)) continue;

    const files = fs.readdirSync(toolDir);
    for (const file of files) {
      const filePath = path.join(toolDir, file);
      const stats = fs.statSync(filePath);
      const hash = sha256(filePath);

      // Update in manifest based on file type
      if (file.endsWith('.wasm.gz') || file.endsWith('.wasm')) {
        logSubstep(`${dir}/${file}: ${humanSize(stats.size)}, sha256:${hash.slice(0, 16)}...`);
      }
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  log('Manifest updated', 'green');
}

/**
 * Find files for release
 */
function findReleaseFiles() {
  const files = [];
  const patterns = [
    { dir: 'clang_arm', exts: ['.wasm.gz', '.wasm', '.js'] },
    { dir: 'clang_riscv', exts: ['.wasm.gz', '.wasm', '.js'] },
    { dir: 'clang_xtensa', exts: ['.wasm.gz', '.wasm', '.js'] },
    { dir: 'capstone', exts: ['.wasm.gz', '.wasm', '.js'] },
    { dir: 'unicorn', exts: ['.wasm.gz', '.wasm', '.js'] },
    { dir: '', exts: ['manifest.json', 'lld.wasm.gz', 'lld.js'] },
  ];

  for (const { dir, exts } of patterns) {
    const baseDir = dir ? path.join(CONFIG.wasmDir, dir) : CONFIG.wasmDir;
    if (!fs.existsSync(baseDir)) continue;

    const dirFiles = fs.readdirSync(baseDir);
    for (const file of dirFiles) {
      const matchesExt = exts.some(ext =>
        ext.startsWith('.') ? file.endsWith(ext) : file === ext
      );
      if (matchesExt) {
        const filePath = path.join(baseDir, file);
        const name = dir ? `${dir}/${file}` : file;
        files.push({ path: filePath, name });
      }
    }
  }

  return files;
}

/**
 * Create GitHub release
 */
async function createRelease(opts) {
  logStep('Creating GitHub Release');

  const files = findReleaseFiles();
  if (files.length === 0) {
    log('No files found for release', 'red');
    return false;
  }

  // Calculate total size
  let totalSize = 0;
  log('Files to release:', 'blue');
  for (const file of files) {
    const stats = fs.statSync(file.path);
    totalSize += stats.size;
    log(`  ${file.name} (${humanSize(stats.size)})`, 'blue');
  }
  log(`Total: ${files.length} files, ${humanSize(totalSize)}`, 'green');

  // Determine tag
  let tag = opts.tag;
  if (!tag) {
    const manifestPath = path.join(CONFIG.wasmDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const arm = manifest.compilers?.find(c => c.id === 'clang-arm');
      if (arm?.fullVersion) {
        tag = `wasm-clang-${arm.fullVersion}`;
      }
    }
    if (!tag) {
      tag = `wasm-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
    }
  }

  log(`\nRelease tag: ${tag}`, 'cyan');

  if (opts.dryRun) {
    log('Dry run - would create release', 'yellow');
    return true;
  }

  // Create release notes
  const notes = createReleaseNotes(files);
  const notesPath = path.join(CONFIG.wasmDir, 'RELEASE_NOTES.md');
  fs.writeFileSync(notesPath, notes);

  // Build gh command
  const ghArgs = [
    'release', 'create', tag,
    '--repo', CONFIG.repo,
    '--title', `WASM Tools ${tag}`,
    '--notes-file', notesPath,
  ];

  if (opts.draft) {
    ghArgs.push('--draft');
  }

  // Add files
  for (const file of files) {
    ghArgs.push(file.path);
  }

  try {
    log(`\nCreating release...`, 'blue');
    const result = execSync(`gh ${ghArgs.join(' ')}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    log('Release created successfully!', 'green');
    log(result.trim(), 'cyan');

    // Cleanup
    fs.unlinkSync(notesPath);

    return true;
  } catch (err) {
    log(`Failed to create release: ${err.message}`, 'red');
    if (err.stderr) log(err.stderr, 'red');

    // Check if release already exists
    if (err.stderr?.includes('already exists')) {
      log('\nRelease already exists. To upload to existing release:', 'yellow');
      log(`  gh release upload ${tag} ${files.map(f => `"${f.path}"`).join(' ')} --repo ${CONFIG.repo}`, 'blue');
    }

    return false;
  }
}

/**
 * Create release notes
 */
function createReleaseNotes(files) {
  const manifestPath = path.join(CONFIG.wasmDir, 'manifest.json');
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : {};

  let notes = `# BattleForge WASM Tools\n\n`;
  notes += `Released: ${new Date().toISOString().split('T')[0]}\n\n`;

  // Compilers
  notes += `## Compilers\n\n`;
  for (const compiler of manifest.compilers || []) {
    if (compiler.status === 'coming_soon') continue;
    notes += `- **${compiler.name}** v${compiler.fullVersion || compiler.softwareVersion}\n`;
    notes += `  - Architectures: ${compiler.architectures?.join(', ') || 'N/A'}\n`;
  }

  // Linkers
  if (manifest.linkers?.length) {
    notes += `\n## Linkers\n\n`;
    for (const linker of manifest.linkers) {
      notes += `- **${linker.name}** v${linker.fullVersion || linker.softwareVersion}\n`;
    }
  }

  // Tools
  if (manifest.disassemblers?.length || manifest.emulators?.length) {
    notes += `\n## Tools\n\n`;
    for (const tool of [...(manifest.disassemblers || []), ...(manifest.emulators || [])]) {
      notes += `- **${tool.name}** v${tool.fullVersion || tool.softwareVersion}\n`;
    }
  }

  // File table
  notes += `\n## Files\n\n`;
  notes += `| File | Size | SHA256 |\n`;
  notes += `|------|------|--------|\n`;

  for (const file of files) {
    const stats = fs.statSync(file.path);
    const hash = sha256(file.path).slice(0, 16) + '...';
    notes += `| ${file.name} | ${humanSize(stats.size)} | ${hash} |\n`;
  }

  notes += `\n## Usage\n\n`;
  notes += `These files are automatically downloaded by BattleForge.\n`;
  notes += `\n\`\`\`bash\n`;
  notes += `# Manual download\n`;
  notes += `pnpm wasm:download\n`;
  notes += `\`\`\`\n`;

  return notes;
}

/**
 * Main entry point
 */
async function main() {
  const opts = parseArgs();

  if (opts.help) {
    showHelp();
    return;
  }

  console.log('');
  log('╔════════════════════════════════════════════════════════════╗', 'magenta');
  log('║         BattleForge WASM Release Pipeline                  ║', 'magenta');
  log('╚════════════════════════════════════════════════════════════╝', 'magenta');

  checkPrerequisites(opts);

  // Determine what to build
  let buildTargets = [];
  if (!opts.releaseOnly && !opts.ci) {
    if (opts.toolsOnly) {
      buildTargets = CONFIG.tools;
    } else if (opts.compilersOnly) {
      buildTargets = CONFIG.compilers;
    } else {
      buildTargets = [...CONFIG.compilers, ...CONFIG.tools];
    }

    // Check environment overrides
    if (process.env.SKIP_COMPILERS === 'true') {
      buildTargets = buildTargets.filter(t => !CONFIG.compilers.includes(t));
    }
    if (process.env.SKIP_TOOLS === 'true') {
      buildTargets = buildTargets.filter(t => !CONFIG.tools.includes(t));
    }
  }

  // Build phase
  if (buildTargets.length > 0) {
    const buildSuccess = await buildWasm(buildTargets, opts);
    if (!buildSuccess) {
      log('Build failed, aborting', 'red');
      process.exit(1);
    }
  }

  // Update manifest
  if (!opts.releaseOnly) {
    updateManifest(opts);
  }

  // Release phase
  if (!opts.buildOnly) {
    const releaseSuccess = await createRelease(opts);
    if (!releaseSuccess) {
      process.exit(1);
    }
  }

  logStep('Pipeline Complete');
  log('Done!', 'green');
}

main().catch(err => {
  log(`Error: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});
