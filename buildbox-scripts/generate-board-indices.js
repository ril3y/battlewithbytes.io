#!/usr/bin/env node

/**
 * Generate Board Indices
 *
 * This script scans the boards directory and generates hierarchical index files:
 * - Vendor index: /boards/{platform}/{vendor}/index.json
 * - Platform index: /boards/{platform}/index.json
 * - Updates root registry.json to remove boards array and add metadata
 *
 * Usage: node generate-board-indices.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BOARDS_DIR = path.join(__dirname, '..', 'apps', 'web', 'public', 'boards');
const REGISTRY_PATH = path.join(BOARDS_DIR, 'registry.json');

// Platform directories to scan (excluding non-platform directories)
const EXCLUDED_DIRS = ['images', 'libraries', 'platforms', 'schema', '.git'];

/**
 * Read and parse a JSON file
 */
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Write JSON to file with pretty formatting
 */
function writeJSON(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Extract board summary from full board manifest
 */
function extractBoardSummary(boardData, vendorId, platformId, relativePath) {
  const summary = {
    id: boardData.id,
    name: boardData.name,
    vendor: vendorId,
    family: boardData.chip?.family || platformId,
    path: relativePath
  };

  // Add optional fields if they exist
  if (boardData.assets?.thumbnail) {
    summary.thumbnail = boardData.assets.thumbnail;
  }

  if (boardData.features && Array.isArray(boardData.features)) {
    summary.features = boardData.features;
  }

  if (boardData.tags && Array.isArray(boardData.tags)) {
    summary.tags = boardData.tags;
  }

  if (boardData.examples && Array.isArray(boardData.examples)) {
    summary.exampleCount = boardData.examples.length;
  } else {
    summary.exampleCount = 0;
  }

  return summary;
}

/**
 * Get vendor name from the first board (or use capitalized vendor ID as fallback)
 */
function getVendorName(vendorId) {
  const vendorNames = {
    'adafruit': 'Adafruit',
    'espressif': 'Espressif',
    'nordic': 'Nordic Semiconductor',
    'sparkfun': 'SparkFun',
    'raspberry_pi': 'Raspberry Pi',
    'generic': 'Generic'
  };

  return vendorNames[vendorId] || vendorId.charAt(0).toUpperCase() + vendorId.slice(1);
}

/**
 * Scan a vendor directory and generate vendor index
 */
function generateVendorIndex(platformId, vendorId, vendorPath) {
  console.log(`  Scanning vendor: ${vendorId}`);

  const boards = [];
  const files = fs.readdirSync(vendorPath);

  // Process all JSON files except index.json
  for (const file of files) {
    if (file === 'index.json' || !file.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(vendorPath, file);
    const stats = fs.statSync(filePath);

    if (!stats.isFile()) {
      continue;
    }

    const boardData = readJSON(filePath);
    if (!boardData) {
      console.warn(`    ⚠ Skipping invalid JSON: ${file}`);
      continue;
    }

    // Create relative path from boards directory
    const relativePath = path.join(platformId, vendorId, file).replace(/\\/g, '/');

    const boardSummary = extractBoardSummary(boardData, vendorId, platformId, relativePath);
    boards.push(boardSummary);

    console.log(`    ✓ ${boardSummary.name}`);
  }

  if (boards.length === 0) {
    console.log(`    No boards found in ${vendorId}`);
    return null;
  }

  // Generate vendor index
  const vendorIndex = {
    vendor: vendorId,
    vendorName: getVendorName(vendorId),
    platform: platformId,
    boards: boards
  };

  const indexPath = path.join(vendorPath, 'index.json');
  if (writeJSON(indexPath, vendorIndex)) {
    console.log(`    ✓ Generated vendor index: ${boards.length} board(s)`);
  }

  return {
    id: vendorId,
    name: getVendorName(vendorId),
    boardCount: boards.length,
    indexPath: `${vendorId}/index.json`,
    boards: boards
  };
}

/**
 * Scan a platform directory and generate platform index
 */
function generatePlatformIndex(platformId, platformPath) {
  console.log(`\nProcessing platform: ${platformId}`);

  const vendors = [];
  const allBoards = [];
  const entries = fs.readdirSync(platformPath);

  // Process all subdirectories (vendors)
  for (const entry of entries) {
    const entryPath = path.join(platformPath, entry);
    const stats = fs.statSync(entryPath);

    if (!stats.isDirectory()) {
      continue;
    }

    const vendorData = generateVendorIndex(platformId, entry, entryPath);
    if (vendorData) {
      vendors.push({
        id: vendorData.id,
        name: vendorData.name,
        boardCount: vendorData.boardCount,
        indexPath: vendorData.indexPath
      });
      allBoards.push(...vendorData.boards);
    }
  }

  if (vendors.length === 0) {
    console.log(`  No vendors found in ${platformId}`);
    return null;
  }

  // Generate platform index
  const platformIndex = {
    platform: platformId,
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split('T')[0],
    vendors: vendors,
    boards: allBoards
  };

  const indexPath = path.join(platformPath, 'index.json');
  if (writeJSON(indexPath, platformIndex)) {
    console.log(`✓ Generated platform index: ${vendors.length} vendor(s), ${allBoards.length} board(s)`);
  }

  return {
    platform: platformId,
    boardCount: allBoards.length,
    vendorCount: vendors.length,
    indexPath: `${platformId}/index.json`
  };
}

/**
 * Update the root registry.json file
 */
function updateRegistry(platformStats) {
  console.log('\nUpdating registry.json...');

  const registry = readJSON(REGISTRY_PATH);
  if (!registry) {
    console.error('Failed to read registry.json');
    return false;
  }

  // Remove the boards array
  delete registry.boards;

  // Update platforms with board metadata
  if (registry.platforms && Array.isArray(registry.platforms)) {
    registry.platforms = registry.platforms.map(platform => {
      const stats = platformStats.find(s => s.platform === platform.platform);

      if (stats) {
        return {
          ...platform,
          boardCount: stats.boardCount,
          indexPath: stats.indexPath
        };
      }

      return platform;
    });
  }

  // Update lastUpdated
  registry.lastUpdated = new Date().toISOString().split('T')[0];

  if (writeJSON(REGISTRY_PATH, registry)) {
    console.log('✓ Registry updated successfully');
    return true;
  }

  return false;
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(60));
  console.log('Board Index Generator');
  console.log('='.repeat(60));
  console.log(`Boards directory: ${BOARDS_DIR}\n`);

  // Check if boards directory exists
  if (!fs.existsSync(BOARDS_DIR)) {
    console.error(`Error: Boards directory not found: ${BOARDS_DIR}`);
    process.exit(1);
  }

  // Get all platform directories
  const entries = fs.readdirSync(BOARDS_DIR);
  const platformDirs = entries.filter(entry => {
    if (EXCLUDED_DIRS.includes(entry)) {
      return false;
    }

    const entryPath = path.join(BOARDS_DIR, entry);
    const stats = fs.statSync(entryPath);
    return stats.isDirectory();
  });

  console.log(`Found ${platformDirs.length} platform(s): ${platformDirs.join(', ')}\n`);

  // Process each platform
  const platformStats = [];
  for (const platformId of platformDirs) {
    const platformPath = path.join(BOARDS_DIR, platformId);
    const stats = generatePlatformIndex(platformId, platformPath);

    if (stats) {
      platformStats.push(stats);
    }
  }

  // Update registry
  updateRegistry(platformStats);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));

  let totalBoards = 0;
  let totalVendors = 0;

  for (const stats of platformStats) {
    console.log(`${stats.platform.toUpperCase()}: ${stats.vendorCount} vendor(s), ${stats.boardCount} board(s)`);
    totalBoards += stats.boardCount;
    totalVendors += stats.vendorCount;
  }

  console.log('-'.repeat(60));
  console.log(`TOTAL: ${platformStats.length} platform(s), ${totalVendors} vendor(s), ${totalBoards} board(s)`);
  console.log('='.repeat(60));
  console.log('\n✓ All index files generated successfully!');
}

// Run the script
main();
