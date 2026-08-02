#!/usr/bin/env node
/**
 * Fail the build when a shipped image is oversized.
 *
 * With `output: 'export'` and `images.unoptimized`, everything under
 * public/ is served byte-for-byte as authored, so a stray multi-MB PNG
 * silently becomes someone's LCP. Keep that regression out of the repo.
 *
 * Usage: node scripts/check-image-sizes.js [--max-kb=600]
 */

const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const CONTENT_DIR = path.join(__dirname, "..", "src", "content");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"]);

const maxKbArg = process.argv.find((a) => a.startsWith("--max-kb="));
const MAX_KB = maxKbArg ? Number(maxKbArg.split("=")[1]) : 600;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

const repoRoot = path.join(__dirname, "..", "..", "..");
const offenders = [...walk(PUBLIC_DIR), ...walk(CONTENT_DIR)]
  .map((file) => ({ file, kb: fs.statSync(file).size / 1024 }))
  .filter(({ kb }) => kb > MAX_KB)
  .sort((a, b) => b.kb - a.kb);

if (offenders.length === 0) {
  console.log(`All shipped images are under ${MAX_KB}KB.`);
  process.exit(0);
}

console.error(`\nImages larger than ${MAX_KB}KB (${offenders.length}):\n`);
for (const { file, kb } of offenders) {
  console.error(`  ${Math.round(kb)}KB  ${path.relative(repoRoot, file)}`);
}
console.error(
  "\nRecompress or convert to WebP before committing, e.g.\n" +
    "  npx sharp-cli --input <file> --output <file> resize 1600 --withoutEnlargement\n" +
    "or raise the budget deliberately with --max-kb= if the asset justifies it.\n",
);
process.exit(1);
