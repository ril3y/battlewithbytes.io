# Fast Rebuild Guide for CI/CD

This guide shows how to rebuild Clang WASM in **1-5 minutes** instead of 30-60 minutes.

## The Problem

When you modify WASM code or need to rebuild in CI/CD, the traditional Docker build takes 30-60 minutes because it:
1. Clones LLVM source (1-2 min)
2. Configures LLVM (2-3 min)
3. Compiles 2500+ LLVM files (30-60 min)

**This is unacceptable for rapid iteration.**

## The Solution: Multi-Stage Cached Builds

We use Docker multi-stage builds to cache the LLVM compilation layer.

### Architecture

```
┌─────────────────────────────────────────────┐
│ Stage 1: llvm-source                        │
│ - Base Emscripten image                     │
│ - LLVM source code                          │
│ - CACHED (changes only when LLVM updates)   │
│ Time: 1-2 min first time, then cached       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Stage 2: llvm-build                         │
│ - LLVM compiled to WASM                     │
│ - Clang binary built                        │
│ - CACHED (changes only when config changes) │
│ Time: 30-60 min first time, then cached     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Stage 3: custom-wasm                        │
│ - Your custom modifications                 │
│ - Incremental rebuild (only changed files)  │
│ - FAST (rebuilds in seconds to minutes)     │
│ Time: 1-5 min ✅                            │
└─────────────────────────────────────────────┘
```

## Setup (One-Time)

### Step 1: Build and Push Cache Image

```bash
cd experiments/c-compiler-poc/2-clang-arm

# Build the cached LLVM layer (takes 30-60 min)
docker build --target llvm-build \
  -t battlewithbytes/llvm-wasm-arm:18.x \
  -f Dockerfile.multistage \
  .

# Push to Docker Hub for CI/CD
docker push battlewithbytes/llvm-wasm-arm:18.x
```

**You only do this once per LLVM version.**

### Step 2: Configure CI/CD

Copy the cached workflow to your `.github/workflows/`:

```bash
cp .github-workflows-clang-cached.yml ../../.github/workflows/clang-cached.yml
```

Add these secrets to GitHub repository settings:
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_TOKEN`: Your Docker Hub access token

## Daily Development Usage

### Fast Local Rebuild

```bash
# Build using cached layers
docker build --target custom-wasm \
  -f Dockerfile.multistage \
  -o dist \
  .
```

**Time: 1-5 minutes** ✅ (vs 30-60 minutes without cache)

### What Gets Cached vs Rebuilt

| Layer | Cached? | Rebuild When | Time |
|-------|---------|--------------|------|
| Emscripten base | ✅ Yes | Never (unless Dockerfile changes) | Instant |
| LLVM source | ✅ Yes | LLVM version changes | 1-2 min |
| LLVM build | ✅ Yes | CMake config changes | 30-60 min |
| Your modifications | ❌ No | Every build | 1-5 min |

### Modifying WASM Code Example

Let's say you want to add a custom optimization pass:

```bash
# 1. Add your code to custom-patches/
mkdir -p custom-patches
cat > custom-patches/my-optimization.patch <<'EOF'
diff --git a/llvm/lib/Transforms/Scalar/MyOptimization.cpp
...your patch...
EOF

# 2. Update Dockerfile.multistage Stage 3:
# Uncomment and modify the custom-wasm stage:
# COPY custom-patches/ /build/custom-patches/
# RUN cd build-wasm && \
#     patch -p1 < /build/custom-patches/my-optimization.patch && \
#     ninja clang

# 3. Rebuild (uses cache)
docker build --target custom-wasm -f Dockerfile.multistage -o dist .
```

**Time: 1-5 minutes** because:
- Stage 1 (llvm-source): Cached ✅
- Stage 2 (llvm-build): Cached ✅
- Stage 3 (custom-wasm): Rebuilds only changed files (~100 files, not 2500)

## CI/CD Workflow

The cached workflow (`.github-workflows-clang-cached.yml`) does this automatically:

1. **Pull cached image** from Docker Hub (~30 sec)
2. **Build your changes** on top of cache (~1-5 min)
3. **Upload artifact** to GitHub
4. **Deploy to web app** (if on main branch)

### Triggering CI/CD Builds

```bash
# Regular commit (uses cache)
git add .
git commit -m "Add custom optimization"
git push
# CI/CD completes in 2-6 minutes ✅

# Force rebuild cache (rare, only when updating LLVM)
gh workflow run "Build Clang WASM (Cached)" \
  --field rebuild_cache=true
# Takes 35-65 minutes, but then all future builds are fast
```

## Performance Comparison

| Scenario | Traditional | Cached | Savings |
|----------|-------------|--------|---------|
| First build | 30-60 min | 30-60 min | Same |
| Rebuild (no changes) | 30-60 min | 30 sec | **99% faster** |
| Rebuild (small patch) | 30-60 min | 1-5 min | **90% faster** |
| Rebuild (major changes) | 30-60 min | 5-15 min | **70% faster** |
| CI/CD build | 35-65 min | 2-6 min | **90% faster** |

## Cache Management

### Update Cache When...

1. **LLVM version changes** (e.g., 18.x → 19.x)
   ```bash
   # Update build-docker.sh line 13
   git clone --branch=release/19.x ...

   # Rebuild cache
   docker build --target llvm-build -t llvm-wasm-arm:19.x -f Dockerfile.multistage .
   docker push llvm-wasm-arm:19.x
   ```

2. **Build configuration changes** (e.g., add MIPS backend)
   ```bash
   # Update Dockerfile.multistage build args
   ARG LLVM_TARGETS="ARM;Mips"

   # Rebuild cache
   docker build --target llvm-build -t llvm-wasm-arm-mips:18.x -f Dockerfile.multistage .
   docker push llvm-wasm-arm-mips:18.x
   ```

3. **Emscripten version changes**
   ```dockerfile
   # Update Dockerfile line 1
   FROM emscripten/emsdk:3.1.51
   ```

### Don't Rebuild Cache When...

- Adding custom patches ✅ (just rebuild stage 3)
- Modifying source files ✅ (incremental build)
- Testing different flags ✅ (quick iteration)
- Fixing bugs ✅ (only affected files rebuild)

## Multi-Architecture Builds

Cache works across architectures:

```bash
# Build MIPS cache
docker build --target llvm-build \
  --build-arg LLVM_TARGETS=Mips \
  -t llvm-wasm-mips:18.x \
  -f Dockerfile.multistage .

# Build RISC-V cache
docker build --target llvm-build \
  --build-arg LLVM_TARGETS=RISCV \
  -t llvm-wasm-riscv:18.x \
  -f Dockerfile.multistage .
```

Now you can rebuild any architecture in 1-5 minutes!

## Troubleshooting

### Cache not being used

**Symptom:** Build takes 30-60 minutes every time

**Fix:**
```bash
# Verify cache exists
docker pull battlewithbytes/llvm-wasm-arm:18.x

# Check Dockerfile.multistage has correct cache-from
--cache-from type=registry,ref=battlewithbytes/llvm-wasm-arm:18.x
```

### Cache is stale

**Symptom:** Build uses old LLVM version

**Fix:**
```bash
# Force rebuild cache
docker build --no-cache --target llvm-build \
  -t llvm-wasm-arm:18.x \
  -f Dockerfile.multistage .
```

### CI/CD can't pull cache

**Symptom:** CI shows "failed to pull cache"

**Fix:** Verify Docker Hub credentials in GitHub secrets:
- `DOCKER_USERNAME`
- `DOCKER_TOKEN`

## Summary

✅ **First build:** Same time (30-60 min) - builds cache
✅ **Subsequent builds:** 1-5 min (90% faster)
✅ **CI/CD friendly:** Same cache works locally and in CI
✅ **Storage efficient:** Cache image ~2-3 GB (one-time download)
✅ **Multi-arch:** Same approach works for ARM, MIPS, RISC-V, etc.

**Bottom line:** After the one-time cache build, you can iterate on WASM code at the speed of a typical C++ project (minutes, not hours).
