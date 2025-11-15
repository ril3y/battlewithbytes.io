# Turborepo Pipeline Diagram

## Task Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     TURBOREPO PIPELINE                           │
│                                                                  │
│  Task: turbo run build                                          │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Rust/WASM Compilation (Parallel)
┌───────────────────────────────────────┐
│  battlemagic-core                     │
│  ┌─────────────────────────────────┐  │
│  │  Task: build:wasm               │  │
│  │  ├─ cargo build --release       │  │
│  │  ├─ wasm-pack build             │  │
│  │  └─ wasm-opt -O4                │  │
│  │                                 │  │
│  │  Inputs:                        │  │
│  │  • src/**/*.rs                  │  │
│  │  • Cargo.toml                   │  │
│  │  • Cargo.lock                   │  │
│  │                                 │  │
│  │  Outputs:                       │  │
│  │  • pkg/battlemagic_core.js      │  │
│  │  • pkg/battlemagic_core.d.ts    │  │
│  │  • pkg/*.wasm                   │  │
│  │                                 │  │
│  │  Cache Key:                     │  │
│  │  hash(inputs + WASM_PACK_PROFILE)│ │
│  │                                 │  │
│  │  Duration: 60-120s (cold)       │  │
│  │           2-5s (cache hit)      │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
                  ↓
         ┌────────┴────────┐
         │                 │
         ↓                 ↓

STEP 2: Package Builds (Parallel after deps ready)
┌─────────────────────────┐  ┌─────────────────────────┐
│  battleterm             │  │  battlemagic-ui         │
│  ┌───────────────────┐  │  │  ┌───────────────────┐  │
│  │ Task: build       │  │  │  │ Task: build       │  │
│  │ ├─ tsc            │  │  │  │ ├─ tsc            │  │
│  │                   │  │  │  │                   │  │
│  │ Inputs:           │  │  │  │ Inputs:           │  │
│  │ • src/**/*.ts     │  │  │  │ • src/**/*.ts     │  │
│  │ • tsconfig.json   │  │  │  │ • tsconfig.json   │  │
│  │                   │  │  │  │ • ^battlemagic-   │  │
│  │ Outputs:          │  │  │  │   core (dep)      │  │
│  │ • dist/**         │  │  │  │                   │  │
│  │                   │  │  │  │ Outputs:          │  │
│  │ Duration: 10s     │  │  │  │ • dist/**         │  │
│  │          1s (✓)   │  │  │  │                   │  │
│  └───────────────────┘  │  │  │ Duration: 10s     │  │
└─────────────────────────┘  │  │          1s (✓)   │  │
                             │  └───────────────────┘  │
                             └─────────────────────────┘
         ↓                                ↓
         └────────────┬───────────────────┘
                      ↓

STEP 3: Application Builds (Parallel after deps ready)
┌──────────────────────────┐  ┌──────────────────────────┐
│  apps/web                │  │  apps/battleterm-pwa     │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │ Task: build        │  │  │  │ Task: build        │  │
│  │ ├─ next build      │  │  │  │ ├─ next build      │  │
│  │                    │  │  │  │                    │  │
│  │ Inputs:            │  │  │  │ Inputs:            │  │
│  │ • src/**/*         │  │  │  │ • src/**/*         │  │
│  │ • next.config.js   │  │  │  │ • next.config.js   │  │
│  │ • ^battlemagic-ui  │  │  │  │ • ^battleterm      │  │
│  │ • ^battleterm      │  │  │  │                    │  │
│  │                    │  │  │  │ Outputs:           │  │
│  │ Outputs:           │  │  │  │ • .next/**         │  │
│  │ • .next/**         │  │  │  │                    │  │
│  │                    │  │  │  │ Duration: 45s      │  │
│  │ Duration: 45s      │  │  │  │          3s (✓)    │  │
│  │          3s (✓)    │  │  │  └────────────────────┘  │
│  └────────────────────┘  │  └──────────────────────────┘
└──────────────────────────┘
```

## Cache Hit Scenario

```
┌────────────────────────────────────────────────────────┐
│  Cache Hit Flow (30x faster!)                          │
└────────────────────────────────────────────────────────┘

battlemagic-core: build:wasm
  ├─ Check inputs: hash(src/**/*.rs, Cargo.*, .cargo/*)
  ├─ Generate cache key: abc123def...
  ├─ Look up in cache: FOUND! ✓
  ├─ Restore outputs: pkg/**, target/**
  └─ Duration: 2s (vs 120s cold)

battlemagic-ui: build
  ├─ Check inputs: hash(src/**/*.ts, tsconfig.json)
  ├─ Check dependency: battlemagic-core (cached)
  ├─ Generate cache key: xyz789abc...
  ├─ Look up in cache: FOUND! ✓
  ├─ Restore outputs: dist/**
  └─ Duration: 1s (vs 10s cold)

apps/web: build
  ├─ Check inputs: hash(src/**, next.config.js)
  ├─ Check dependencies: battlemagic-ui, battleterm (cached)
  ├─ Generate cache key: def456ghi...
  ├─ Look up in cache: FOUND! ✓
  ├─ Restore outputs: .next/**
  └─ Duration: 3s (vs 45s cold)

────────────────────────────────────────────────
Total: 6s (vs 175s = 29x speedup!)
```

## Development Mode Flow

```
┌────────────────────────────────────────────────────────┐
│  turbo run dev                                         │
└────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Initial Build                                      │
│  ├─ battlemagic-core: build:wasm (if no cache)     │
│  ├─ battlemagic-ui: build (if no cache)            │
│  └─ battleterm: build (if no cache)                │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  Start Dev Servers (persistent tasks)               │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ battlemagic-core: dev:wasm                  │   │
│  │ • Watch: src/**/*.rs, Cargo.toml            │   │
│  │ • On change: rebuild WASM (dev profile)     │   │
│  │ • Duration: 5-15s per rebuild               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ battlemagic-ui: dev                         │   │
│  │ • tsc --watch                               │   │
│  │ • Auto rebuild on .ts changes               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ apps/web: dev                               │   │
│  │ • next dev (port 3000)                      │   │
│  │ • Fast refresh enabled                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ apps/battleterm-pwa: dev                    │   │
│  │ • next dev (port 3001)                      │   │
│  │ • Fast refresh enabled                      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

On Rust File Change:
┌────────────────────────────────────────┐
│ 1. src/lib.rs modified                 │
│ 2. Chokidar detects change (500ms)     │
│ 3. WASM rebuild starts (dev profile)   │
│ 4. pkg/ updated (5-15s)                │
│ 5. TypeScript detects change           │
│ 6. battlemagic-ui rebuilds (1-2s)      │
│ 7. Next.js fast refresh (instant)      │
│ 8. Browser updates                     │
└────────────────────────────────────────┘
```

## Remote Cache Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Remote Cache Flow                      │
└─────────────────────────────────────────────────────────┘

Developer 1 (First Build)
  ├─ Build battlemagic-core
  ├─ Generate cache key: abc123...
  ├─ Upload artifacts to Vercel cache
  └─ Duration: 120s

Developer 2 (Later Build)
  ├─ Build battlemagic-core
  ├─ Generate cache key: abc123... (same!)
  ├─ Download artifacts from Vercel cache
  └─ Duration: 3s (40x faster!)

CI/CD Pipeline
  ├─ Build battlemagic-core
  ├─ Generate cache key: abc123... (same!)
  ├─ Download artifacts from Vercel cache
  └─ Duration: 3s (skip Rust compilation!)

┌──────────────────────────────────────┐
│  Vercel Remote Cache                 │
│  ┌────────────────────────────────┐  │
│  │ Cache Keys:                    │  │
│  │ • abc123: battlemagic-core     │  │
│  │ • xyz789: battlemagic-ui       │  │
│  │ • def456: apps/web             │  │
│  │                                │  │
│  │ Accessible by:                 │  │
│  │ • All team members             │  │
│  │ • CI/CD pipelines              │  │
│  │ • Multiple machines            │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Task Dependency Graph

```
                  build:wasm
                 (battlemagic-core)
                       │
           ┌───────────┴───────────┐
           │                       │
           ↓                       ↓
        build                    build
    (battleterm)           (battlemagic-ui)
           │                       │
           └───────────┬───────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ↓                       ↓
        build                    build
     (apps/web)          (apps/battleterm-pwa)
```

## Cache Invalidation Strategy

```
┌──────────────────────────────────────────────────────┐
│  What Invalidates Cache?                             │
└──────────────────────────────────────────────────────┘

battlemagic-core:
  ✓ Changed: src/**/*.rs → Rebuild
  ✓ Changed: Cargo.toml → Rebuild
  ✓ Changed: WASM_PACK_PROFILE → Rebuild
  ✗ Changed: README.md → Use cache

battlemagic-ui:
  ✓ Changed: src/**/*.ts → Rebuild
  ✓ Changed: tsconfig.json → Rebuild
  ✓ Dependency changed: battlemagic-core → Rebuild
  ✗ Changed: package.json (non-dep) → Use cache

apps/web:
  ✓ Changed: src/**/* → Rebuild
  ✓ Changed: next.config.js → Rebuild
  ✓ Dependency changed: battlemagic-ui → Rebuild
  ✗ Changed: public/images/* → Use cache
```

## Performance Comparison

```
┌─────────────────────────────────────────────────────┐
│  Cold Build vs Cached Build                         │
└─────────────────────────────────────────────────────┘

Cold Build (No Cache):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 120s (battlemagic-core)
━━━━ 10s (battleterm)
━━━━━ 12s (battlemagic-ui)
━━━━━━━━━━━━━━━━━━━━━━━━ 45s (apps/web)
━━━━━━━━━━━━━━━━━━━━━━━━ 45s (apps/battleterm-pwa)
───────────────────────────────────────
Total: ~175s (2m 55s)

Cached Build (100% Hit):
━ 2s (battlemagic-core)
━ 1s (battleterm)
━ 1s (battlemagic-ui)
━━ 3s (apps/web)
━━ 3s (apps/battleterm-pwa)
───────────────────────────────────────
Total: ~6s

Speedup: 29x faster!
```

## Legend

```
┌─────────────────────────────────────┐
│  Symbol Legend                      │
├─────────────────────────────────────┤
│  ✓ = Cache hit                      │
│  ✗ = Cache miss                     │
│  → = Causes rebuild                 │
│  ↓ = Dependency flow                │
│  ^ = Depends on (workspace)         │
│  ━ = Time duration bar              │
│  • = List item                      │
└─────────────────────────────────────┘
```
