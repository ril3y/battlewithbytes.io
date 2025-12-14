# Turborepo Rust/WASM Integration Guide

## Overview

This guide explains the Turborepo pipeline configuration for integrating Rust/WASM packages into the BattleWithBytes monorepo. The setup enables efficient caching of slow Rust compilation while maintaining fast development workflows.

## Architecture

### Package Structure

```
battlewithbytes.io/
├── apps/
│   ├── web/                    # Main Next.js app
│   └── battleterm-pwa/         # PWA app
├── packages/
│   ├── battleterm/             # Shared React components
│   ├── battlemagic-core/       # Rust/WASM core (NEW)
│   └── battlemagic-ui/         # React UI for debugger (NEW)
└── turbo.json                  # Turborepo configuration
```

### Dependency Graph

```
┌─────────────────────────────────────────────────────────┐
│                     Build Graph                          │
└─────────────────────────────────────────────────────────┘

1. battlemagic-core (Rust → WASM)
   ├─ build:wasm → pkg/battlemagic_core.js
   └─ Outputs: pkg/**, target/wasm32-unknown-unknown/release/*.wasm

2. battlemagic-ui (TypeScript)
   ├─ Depends on: battlemagic-core (workspace:*)
   ├─ build → dist/**
   └─ Imports WASM dynamically

3. apps/web (Next.js)
   ├─ Depends on: battlemagic-ui, battleterm
   └─ build → .next/**

4. apps/battleterm-pwa (Next.js)
   ├─ Depends on: battleterm
   └─ build → .next/**
```

## Turborepo Pipeline Configuration

### Key Tasks

#### 1. `build:wasm` - Rust/WASM Compilation

**Purpose**: Compiles Rust code to WebAssembly using wasm-pack

**Configuration**:

```json
{
  "build:wasm": {
    "cache": true,
    "inputs": [
      "src/**/*.rs", // All Rust source files
      "Cargo.toml", // Dependencies and metadata
      "Cargo.lock", // Locked dependency versions
      ".cargo/**" // Cargo configuration
    ],
    "outputs": [
      "pkg/**", // wasm-pack output directory
      "target/wasm32-unknown-unknown/release/*.wasm"
    ],
    "env": [
      "WASM_PACK_PROFILE" // dev | profiling | release
    ]
  }
}
```

**Why This Works**:

- **Inputs**: Turborepo only rebuilds when Rust files or dependencies change
- **Outputs**: Cached artifacts include both the pkg directory and compiled WASM
- **Cache Key**: Generated from input file hashes + environment variables
- **Cache Hit**: Restores pkg/ and target/ directories instantly (seconds vs minutes)

#### 2. `build` - TypeScript/Next.js Build

**Updated Configuration**:

```json
{
  "build": {
    "dependsOn": ["^build", "^build:wasm"],
    "inputs": ["$TURBO_DEFAULT$", ".env*"],
    "outputs": [".next/**", "dist/**"]
  }
}
```

**Key Change**: Added `^build:wasm` to `dependsOn`

- `^build`: Depends on `build` task in dependencies
- `^build:wasm`: Depends on `build:wasm` task in dependencies
- Ensures WASM is built before TypeScript packages that import it

#### 3. `dev:wasm` - Watch Mode for Rust

**Configuration**:

```json
{
  "dev:wasm": {
    "cache": false,
    "persistent": true
  }
}
```

**Behavior**:

- Runs continuously in watch mode
- Monitors .rs files for changes
- Triggers incremental rebuilds
- No caching (always fresh in dev)

#### 4. `dev` - Development Mode

**Updated Configuration**:

```json
{
  "dev": {
    "cache": false,
    "persistent": true,
    "dependsOn": ["^build", "^build:wasm"]
  }
}
```

**Workflow**:

1. Initial build of WASM (or restore from cache)
2. Start TypeScript/Next.js dev servers
3. WASM changes trigger rebuilds via dev:wasm task

## Caching Strategy

### What Gets Cached

#### WASM Builds (battlemagic-core)

```
Cache Key: hash(
  src/**/*.rs,
  Cargo.toml,
  Cargo.lock,
  .cargo/**,
  WASM_PACK_PROFILE
)

Cached Outputs:
  - pkg/battlemagic_core.js
  - pkg/battlemagic_core.d.ts
  - pkg/battlemagic_core_bg.wasm
  - target/wasm32-unknown-unknown/release/*.wasm
```

**Size Optimization**:

- Release builds: ~100-500KB WASM (optimized with wasm-opt)
- Dev builds: Larger but faster to compile
- Cache stores compressed artifacts

#### TypeScript Builds

```
Cache Key: hash(
  src/**/*.ts,
  src/**/*.tsx,
  tsconfig.json,
  dependencies (from package.json)
)

Cached Outputs:
  - dist/** (for packages)
  - .next/** (for apps)
```

### Cache Performance

**Without Cache (Cold Build)**:

```
battlemagic-core build:wasm  120s  (Rust compilation)
battlemagic-ui build          10s  (TypeScript)
apps/web build                45s  (Next.js)
────────────────────────────────
Total:                       175s
```

**With Cache (Warm Build)**:

```
battlemagic-core build:wasm   2s  (Cache restore)
battlemagic-ui build          1s  (Cache restore)
apps/web build                3s  (Cache restore)
────────────────────────────────
Total:                        6s
```

**30x faster with cache!**

### Local vs Remote Caching

#### Local Cache

- Stored in `.turbo/cache/`
- Shared across branches on same machine
- Automatically managed by Turborepo

#### Remote Cache (Vercel)

```bash
# Enable remote caching
turbo login
turbo link

# All builds now share cache across:
# - Team members
# - CI/CD pipelines
# - Different machines
```

**Setup**:

```json
// turbo.json
{
  "remoteCache": {
    "signature": true // Verify cache integrity
  }
}
```

## Development Workflow

### Initial Setup

```bash
# Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install WASM target
rustup target add wasm32-unknown-unknown

# Install wasm-pack
cargo install wasm-pack

# Optional: Install wasm-opt for size optimization
# npm install -g wasm-opt
# Or download from: https://github.com/WebAssembly/binaryen/releases

# Install dependencies
pnpm install
```

### Building WASM Packages

```bash
# Build all WASM packages (production)
pnpm run build:wasm

# Build specific package
pnpm run build:battlemagic-core

# Build with profiling (optimized but with debug info)
cd packages/battlemagic-core
WASM_PACK_PROFILE=profiling pnpm run build:wasm

# Analyze bundle size
pnpm run size
```

### Development Mode

```bash
# Start all dev servers (including WASM watch)
pnpm run dev

# Or start specific packages
pnpm run dev:battlemagic  # Only battlemagic packages

# Watch WASM only
cd packages/battlemagic-core
pnpm run dev:wasm
```

**What Happens**:

1. Turborepo starts all `dev` tasks in dependency order
2. `battlemagic-core`: Enters watch mode, monitors .rs files
3. `battlemagic-ui`: TypeScript watch mode, hot reload
4. `apps/web`: Next.js dev server with fast refresh

**On Rust File Change**:

1. Chokidar detects .rs file modification
2. Debounced rebuild triggers (500ms delay)
3. wasm-pack compiles (dev profile, ~5-15s)
4. pkg/ directory updated
5. TypeScript sees change, triggers rebuild
6. Next.js fast refresh updates browser

### Testing

```bash
# Run all tests (TS + Rust)
pnpm run test

# TypeScript tests only
pnpm run test --filter=!@battlewithbytes/battlemagic-core

# Rust tests only
pnpm run test:rust

# Or in specific package
cd packages/battlemagic-core
cargo test --all-features
```

### Linting

```bash
# Lint all code (TS + Rust)
pnpm run lint

# TypeScript linting
pnpm run lint --filter=!@battlewithbytes/battlemagic-core

# Rust linting (clippy + fmt)
pnpm run lint:rust

# Auto-fix Rust formatting
pnpm run format:rust
```

## Production Builds

### Optimization Levels

#### Development (`WASM_PACK_PROFILE=dev`)

- Fast compilation (~5-10s)
- Larger bundle size (~2-5x)
- Debug symbols included
- No wasm-opt

#### Profiling (`WASM_PACK_PROFILE=profiling`)

- Medium compilation (~30-60s)
- Optimized but debuggable
- Some debug info included
- Basic wasm-opt

#### Release (`WASM_PACK_PROFILE=release`, default)

- Slow compilation (~60-120s)
- Minimal bundle size
- No debug symbols
- Full wasm-opt -O4

### Build Commands

```bash
# Full production build (all packages)
pnpm run build

# Build with remote cache
turbo run build --remote-cache

# Force rebuild (ignore cache)
turbo run build --force

# Build specific app and dependencies
pnpm run build --filter=@battlewithbytes/web
```

### Size Optimization Tips

From `packages/battlemagic-core/scripts/analyze-size.mjs`:

1. **Use release profile** (Cargo.toml):

```toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link-time optimization
codegen-units = 1   # Better optimization
panic = "abort"     # Smaller panic handler
strip = true        # Remove symbols
```

2. **Run wasm-opt**:

```bash
wasm-opt pkg/battlemagic_core_bg.wasm -O4 -o pkg/battlemagic_core_bg.wasm
```

3. **Enable compression** (Next.js config):

```javascript
// next.config.js
module.exports = {
  compress: true, // gzip
  // Or use Brotli in production
};
```

4. **Lazy load WASM**:

```typescript
// Don't import at top level
// Instead:
const loadWasm = async () => {
  const module = await import("@battlewithbytes/battlemagic-core");
  return new module.BattleMagicCore();
};
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Setup Rust
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown

      # Cache Rust dependencies
      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: packages/battlemagic-core

      # Setup Node.js
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      # Setup pnpm
      - uses: pnpm/action-setup@v2

      # Install dependencies
      - run: pnpm install

      # Build with Turborepo (uses remote cache)
      - run: |
          turbo login <<< "${{ secrets.TURBO_TOKEN }}"
          turbo run build test lint
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

### Cache Effectiveness in CI

**First Run (No Cache)**:

- Downloads dependencies
- Compiles Rust from scratch
- Builds all packages
- ~10-15 minutes

**Subsequent Runs (With Cache)**:

- Restores Turbo cache
- Restores Cargo cache
- Only rebuilds changed packages
- ~2-5 minutes (or less with no changes)

## Troubleshooting

### WASM Build Fails

**Problem**: `wasm-pack not found`

```bash
# Install wasm-pack
cargo install wasm-pack
```

**Problem**: `target not found: wasm32-unknown-unknown`

```bash
# Add WASM target
rustup target add wasm32-unknown-unknown
```

**Problem**: Out of memory during build

```bash
# Reduce parallel jobs
CARGO_BUILD_JOBS=2 pnpm run build:wasm
```

### Cache Issues

**Problem**: Stale cache causing issues

```bash
# Clear Turborepo cache
rm -rf .turbo

# Clear Cargo cache
cd packages/battlemagic-core
cargo clean
```

**Problem**: Cache not being used

```bash
# Check Turbo cache hits
turbo run build --summarize

# View detailed logs
turbo run build --output-logs=hash-only
```

### Development Issues

**Problem**: Changes not triggering rebuild

```bash
# Restart watch mode
# Ctrl+C, then:
pnpm run dev:wasm
```

**Problem**: TypeScript can't find WASM types

```bash
# Rebuild WASM package
cd packages/battlemagic-core
pnpm run build:wasm

# Regenerate types in UI package
cd ../battlemagic-ui
pnpm run type-check
```

## Performance Tips

### 1. Use Dev Profile in Development

```bash
# Faster builds, larger bundles (OK for dev)
WASM_PACK_PROFILE=dev pnpm run dev:wasm
```

### 2. Incremental Builds

Cargo's incremental compilation is enabled by default for dev builds.

### 3. Parallel Builds

Turborepo runs independent tasks in parallel:

```bash
# Build multiple packages simultaneously
pnpm run build  # Automatically parallelized
```

### 4. Selective Rebuilds

```bash
# Only rebuild affected packages
turbo run build --filter=...[origin/main]
```

### 5. Remote Cache

Enable team-wide cache sharing:

```bash
turbo login
turbo link
```

## Advanced Configuration

### Custom WASM Features

Enable Rust features conditionally:

```bash
# Build with specific features
WASM_FEATURES="simd,threads" pnpm run build:wasm
```

In `Cargo.toml`:

```toml
[features]
default = []
simd = []
threads = ["wasm-bindgen-rayon"]
```

### Multiple WASM Targets

For different environments:

```json
// turbo.json
{
  "tasks": {
    "build:wasm:web": {
      "cache": true,
      "inputs": ["src/**/*.rs", "Cargo.toml"],
      "outputs": ["pkg-web/**"]
    },
    "build:wasm:node": {
      "cache": true,
      "inputs": ["src/**/*.rs", "Cargo.toml"],
      "outputs": ["pkg-node/**"]
    }
  }
}
```

### Debugging WASM

Enable debug info in release builds:

```toml
[profile.profiling]
inherits = "release"
debug = true
strip = false
```

Use browser DevTools:

1. Enable WASM debugging in Chrome/Firefox
2. Source maps are generated automatically
3. Set breakpoints in Rust code

## Summary

This Turborepo configuration provides:

1. **Fast Builds**: Intelligent caching reduces Rust compilation from minutes to seconds
2. **Efficient Development**: Watch mode with incremental rebuilds
3. **Type Safety**: Full TypeScript support for WASM modules
4. **Optimization**: Multiple build profiles for different use cases
5. **Scalability**: Remote caching for team collaboration
6. **Maintainability**: Clear dependency graph and task organization

The pipeline ensures WASM packages are always built before their dependents while maximizing cache reuse and parallel execution.
