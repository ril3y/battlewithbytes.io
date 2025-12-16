#!/usr/bin/env node
/**
 * Upload WASM files to GitHub Releases
 *
 * Creates a new release on battlewithbytes/battleforge_boards with WASM compiler binaries.
 *
 * Prerequisites:
 *   - GitHub CLI (gh) installed and authenticated
 *   - WASM files built in public/wasm/
 *
 * Usage:
 *   node scripts/upload-wasm-release.js [--tag v1.0.0] [--draft]
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  repo: 'battlewithbytes/battleforge_boards',
  wasmDir: path.join(__dirname, '..', 'public', 'wasm'),
  manifestFile: 'manifest.json',

  // Files to include in release
  includePatterns: [
    'clang_arm/*.wasm',
    'clang_arm/*.js',
    'clang_riscv/*.wasm',
    'clang_riscv/*.js',
    'clang_xtensa/*.wasm',
    'clang_xtensa/*.js',
    'capstone/*.wasm',
    'capstone/*.js',
    'unicorn/*.wasm',
    'unicorn/*.js',
    'manifest.json',
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
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function logStep(msg) {
  console.log('');
  log(`=== ${msg} ===`, 'cyan');
}

/**
 * Calculate SHA256 hash of a file
 */
function sha256(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
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
 * Find all files matching patterns
 */
function findFiles(baseDir, patterns) {
  const files = [];

  for (const pattern of patterns) {
    const parts = pattern.split('/');

    if (parts.length === 1) {
      // Single file
      const filePath = path.join(baseDir, pattern);
      if (fs.existsSync(filePath)) {
        files.push({ path: filePath, name: pattern });
      }
    } else {
      // Directory pattern
      const dir = path.join(baseDir, parts[0]);
      const filePattern = parts[1];

      if (fs.existsSync(dir)) {
        const dirFiles = fs.readdirSync(dir);
        for (const file of dirFiles) {
          if (filePattern === '*' ||
              (filePattern.startsWith('*.') && file.endsWith(filePattern.slice(1)))) {
            files.push({
              path: path.join(dir, file),
              name: `${parts[0]}/${file}`
            });
          }
        }
      }
    }
  }

  return files;
}

/**
 * Check if gh CLI is available and authenticated
 */
function checkGhCli() {
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current WASM version from manifest
 */
function getVersion() {
  const manifestPath = path.join(CONFIG.wasmDir, CONFIG.manifestFile);
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    // Use clang-arm version as the primary version
    const armCompiler = manifest.compilers?.find(c => c.id === 'clang-arm');
    if (armCompiler?.version) {
      return `clang-${armCompiler.version}`;
    }
  }
  return null;
}

/**
 * Create release notes
 */
function createReleaseNotes(files) {
  const manifest = JSON.parse(fs.readFileSync(path.join(CONFIG.wasmDir, CONFIG.manifestFile), 'utf8'));

  let notes = `# BattleForge WASM Compilers\n\n`;
  notes += `Released: ${new Date().toISOString().split('T')[0]}\n\n`;

  notes += `## Included Compilers\n\n`;
  for (const compiler of manifest.compilers || []) {
    if (compiler.status === 'coming_soon') continue;
    notes += `- **${compiler.name}** v${compiler.version}\n`;
    notes += `  - Architectures: ${compiler.architectures?.join(', ') || 'N/A'}\n`;
  }

  notes += `\n## Files\n\n`;
  notes += `| File | Size | SHA256 |\n`;
  notes += `|------|------|--------|\n`;

  for (const file of files) {
    if (file.name.endsWith('.wasm')) {
      const stats = fs.statSync(file.path);
      const hash = sha256(file.path).slice(0, 16) + '...';
      notes += `| ${file.name} | ${humanSize(stats.size)} | ${hash} |\n`;
    }
  }

  notes += `\n## Usage\n\n`;
  notes += `These files are automatically downloaded by BattleForge during build.\n`;
  notes += `\n\`\`\`bash\n`;
  notes += `# Manual download\n`;
  notes += `cd apps/battleforge\n`;
  notes += `node scripts/download-wasm.js\n`;
  notes += `\`\`\`\n`;

  return notes;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  let tag = args.find(a => a.startsWith('--tag='))?.split('=')[1];
  const isDraft = args.includes('--draft');
  const dryRun = args.includes('--dry-run');

  logStep('Checking prerequisites');

  // Check gh CLI
  if (!checkGhCli()) {
    log('GitHub CLI (gh) not found or not authenticated.', 'red');
    log('Install: https://cli.github.com/', 'yellow');
    log('Then run: gh auth login', 'yellow');
    process.exit(1);
  }
  log('GitHub CLI authenticated', 'green');

  // Check WASM directory
  if (!fs.existsSync(CONFIG.wasmDir)) {
    log(`WASM directory not found: ${CONFIG.wasmDir}`, 'red');
    process.exit(1);
  }

  // Find files to upload
  logStep('Finding files to upload');
  const files = findFiles(CONFIG.wasmDir, CONFIG.includePatterns);

  if (files.length === 0) {
    log('No WASM files found to upload', 'red');
    process.exit(1);
  }

  let totalSize = 0;
  for (const file of files) {
    const stats = fs.statSync(file.path);
    totalSize += stats.size;
    log(`  ${file.name} (${humanSize(stats.size)})`, 'blue');
  }
  log(`\nTotal: ${files.length} files, ${humanSize(totalSize)}`, 'green');

  // Determine tag
  if (!tag) {
    const version = getVersion();
    if (version) {
      tag = `wasm-${version}`;
    } else {
      tag = `wasm-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
    }
  }

  logStep(`Creating release: ${tag}`);

  if (dryRun) {
    log('Dry run - would create release with:', 'yellow');
    log(`  Repository: ${CONFIG.repo}`, 'blue');
    log(`  Tag: ${tag}`, 'blue');
    log(`  Draft: ${isDraft}`, 'blue');
    log(`  Files: ${files.length}`, 'blue');
    return;
  }

  // Create release notes file
  const notesPath = path.join(CONFIG.wasmDir, 'RELEASE_NOTES.md');
  const notes = createReleaseNotes(files);
  fs.writeFileSync(notesPath, notes);

  // Build gh release command
  const ghArgs = [
    'release', 'create', tag,
    '--repo', CONFIG.repo,
    '--title', `WASM Compilers ${tag}`,
    '--notes-file', notesPath,
  ];

  if (isDraft) {
    ghArgs.push('--draft');
  }

  // Add all files
  for (const file of files) {
    ghArgs.push(file.path);
  }

  log(`Running: gh ${ghArgs.join(' ').slice(0, 100)}...`, 'blue');

  try {
    const result = execSync(`gh ${ghArgs.join(' ')}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    log('\nRelease created successfully!', 'green');
    log(result.trim(), 'cyan');

    // Clean up
    fs.unlinkSync(notesPath);

  } catch (err) {
    log(`Failed to create release: ${err.message}`, 'red');
    if (err.stderr) log(err.stderr, 'red');
    process.exit(1);
  }

  logStep('Done!');
  log(`View release: https://github.com/${CONFIG.repo}/releases/tag/${tag}`, 'green');
}

main().catch(err => {
  log(`Error: ${err.message}`, 'red');
  process.exit(1);
});
