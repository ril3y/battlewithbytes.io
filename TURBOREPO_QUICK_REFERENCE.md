# Turborepo Rust/WASM Quick Reference

## Build Graph

```
battlemagic-core (Rust/WASM)
    ↓
battlemagic-ui (React + WASM)
    ↓
apps/web (Next.js)
apps/battleterm-pwa (Next.js)
```

## Essential Commands

### Development
```bash
pnpm run dev                    # Start all dev servers
pnpm run dev:battlemagic        # Only BattleMagic packages
pnpm run dev:wasm               # WASM watch mode only
```

### Building
```bash
pnpm run build                  # Full production build
pnpm run build:wasm             # Build all WASM packages
pnpm run build:battlemagic-core # Build specific WASM package
```

### Testing
```bash
pnpm run test                   # All tests (TS + Rust)
pnpm run test:rust              # Rust tests only
```

### Linting
```bash
pnpm run lint                   # Lint all (TS + Rust)
pnpm run lint:rust              # Clippy + rustfmt
pnpm run format:rust            # Auto-fix Rust formatting
```

### Cleaning
```bash
pnpm run clean                  # Clean all build artifacts
turbo run clean:wasm            # Clean WASM artifacts only
```

## WASM Build Profiles

| Profile | Speed | Size | Debug | Use Case |
|---------|-------|------|-------|----------|
| `dev` | Fast (5-10s) | Large | Yes | Development |
| `profiling` | Medium (30-60s) | Medium | Yes | Performance testing |
| `release` | Slow (60-120s) | Small | No | Production |

Set via: `WASM_PACK_PROFILE=dev pnpm run build:wasm`

## Turborepo Tasks

### Task Dependencies

```
build:wasm (Rust → WASM)
    ↓
build (TypeScript/Next.js)
    ↓
test, lint, type-check
```

### Caching Behavior

| Task | Cached | Inputs | Outputs |
|------|--------|--------|---------|
| `build:wasm` | Yes | .rs, Cargo.* | pkg/**, target/** |
| `build` | Yes | .ts, .tsx, tsconfig.json | .next/**, dist/** |
| `dev` | No | - | - |
| `dev:wasm` | No | - | - |
| `test` | Yes | .test.*, test/** | coverage/** |
| `lint` | Yes | .eslintrc, source files | - |

## Selective Builds

```bash
# Build only changed packages since main
turbo run build --filter=...[origin/main]

# Build specific package and dependencies
turbo run build --filter=@battlewithbytes/battlemagic-ui...

# Build package and dependents
turbo run build --filter=...@battlewithbytes/battlemagic-core

# Force rebuild (ignore cache)
turbo run build --force
```

## Remote Cache

```bash
# Setup (once per machine)
turbo login
turbo link

# Verify cache usage
turbo run build --summarize
```

## Troubleshooting

### WASM Not Building
```bash
# Check Rust installation
rustc --version

# Check wasm-pack
wasm-pack --version

# Reinstall wasm-pack
cargo install wasm-pack --force
```

### Cache Issues
```bash
# Clear Turbo cache
rm -rf .turbo

# Clear Cargo cache
cd packages/battlemagic-core && cargo clean
```

### Types Not Found
```bash
# Rebuild WASM with types
cd packages/battlemagic-core
pnpm run build:wasm
```

## Performance Tips

1. Use dev profile in development: `WASM_PACK_PROFILE=dev`
2. Enable remote cache: `turbo login && turbo link`
3. Use selective builds: `--filter`
4. Parallelize with: `turbo run build test lint` (runs in parallel)

## File Locations

| File | Purpose |
|------|---------|
| `turbo.json` | Pipeline configuration |
| `packages/battlemagic-core/Cargo.toml` | Rust package config |
| `packages/battlemagic-core/scripts/build-wasm.mjs` | WASM build script |
| `packages/battlemagic-core/scripts/watch-wasm.mjs` | WASM watch mode |
| `rust-toolchain.toml` | Rust version pinning |

## Environment Variables

| Variable | Values | Purpose |
|----------|--------|---------|
| `WASM_PACK_PROFILE` | dev, profiling, release | Build optimization level |
| `WASM_OPT` | true, false | Enable wasm-opt |
| `WASM_FEATURES` | Comma-separated | Enable Rust features |
| `RUSTFLAGS` | Compiler flags | Pass flags to rustc |

## Size Optimization Checklist

- [ ] Use `release` profile
- [ ] Enable LTO in Cargo.toml: `lto = true`
- [ ] Optimize for size: `opt-level = "z"`
- [ ] Strip symbols: `strip = true`
- [ ] Run wasm-opt: `wasm-opt -O4`
- [ ] Enable compression (gzip/brotli)
- [ ] Lazy load WASM module
- [ ] Code split large features
