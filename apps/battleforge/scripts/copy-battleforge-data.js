/**
 * Copy BattleForge data from submodule to public for static serving
 *
 * Source: src/data/boards/ (git submodule - battleforge_boards repo)
 * Dest:   public/
 *
 * The submodule contains:
 *   - boards (esp32/, stm32/, nrf/, rp2040/, etc.)
 *   - libraries/
 *   - platforms/
 *   - schema/
 *   - registry.json
 *
 * This is needed because Next.js static export requires files to be in public/
 */

const fs = require('fs');
const path = require('path');

const SUBMODULE_DIR = path.join(__dirname, '../src/data/boards');
const PUBLIC_DIR = path.join(__dirname, '../public');

// What to copy from the submodule
const COPIES = [
  { from: '.', to: 'boards', description: 'Board definitions' },           // Full submodule as boards/
  { from: 'platforms', to: 'platforms', description: 'Platform configs' }, // Also at top level for cleaner URLs
  { from: 'libraries', to: 'libraries', description: 'Curated libraries' }, // Also at top level
];

// Additional copies from outside submodule (icons, etc.)
const EXTERNAL_COPIES = [
  { from: path.join(__dirname, '../src/data/platforms/icons'), to: 'platforms/icons', description: 'Platform icons' },
];

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    return false;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip .git directory
      if (entry.name === '.git') {
        continue;
      }
      copyRecursive(srcPath, destPath);
    } else {
      // Copy common file types for embedded dev
      const validExts = ['.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.h', '.c', '.ld', '.s', '.S'];
      const ext = path.extname(entry.name).toLowerCase();

      // Also copy .tar.gz and .gz files
      if (validExts.includes(ext) || entry.name.endsWith('.tar.gz') || entry.name.endsWith('.gz')) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  return true;
}

function cleanDestination(dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
}

function countFiles(dir) {
  let count = 0;
  if (!fs.existsSync(dir)) return 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

console.log('Copying BattleForge data from submodule to public...');
console.log(`  Submodule: ${SUBMODULE_DIR}`);
console.log(`  Public:    ${PUBLIC_DIR}`);

if (!fs.existsSync(SUBMODULE_DIR)) {
  console.log('  Submodule not initialized, skipping...');
  console.log('  Run: git submodule update --init --recursive');
  process.exit(0);
}

let totalFiles = 0;

for (const { from, to, description } of COPIES) {
  const src = from === '.' ? SUBMODULE_DIR : path.join(SUBMODULE_DIR, from);
  const dest = path.join(PUBLIC_DIR, to);

  console.log(`  ${to}/ - ${description}`);

  if (!fs.existsSync(src)) {
    console.log(`    Skipped (not found: ${from})`);
    continue;
  }

  cleanDestination(dest);
  copyRecursive(src, dest);

  const fileCount = countFiles(dest);
  totalFiles += fileCount;
  console.log(`    Copied: ${fileCount} files`);
}

// Copy external files (icons, etc.)
for (const { from, to, description } of EXTERNAL_COPIES) {
  const dest = path.join(PUBLIC_DIR, to);

  console.log(`  ${to}/ - ${description}`);

  if (!fs.existsSync(from)) {
    console.log(`    Skipped (not found)`);
    continue;
  }

  // Don't clean - just add to existing directory
  copyRecursive(from, dest);

  const fileCount = countFiles(dest);
  totalFiles += fileCount;
  console.log(`    Copied: ${fileCount} files`);
}

console.log(`\nBattleForge data copied: ${totalFiles} total files`);
