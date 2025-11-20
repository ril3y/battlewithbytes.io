# Docker-Based Clang WASM Build System

Complete Docker-based build system for creating a size-optimized Clang WASM compiler with ARM-only backend. **Same Docker image works for local builds AND CI/CD!**

## Quick Start

```bash
# Build Clang WASM using Docker
docker-compose up

# Output will be in dist/clang.wasm.gz
```

That's it! No need to install Emscripten, CMake, Python, or deal with PATH issues.

## Why Docker?

### ✅ Benefits

1. **Reproducible Builds** - Same output every time, any platform
2. **No Local Dependencies** - Everything runs in container
3. **CI/CD Ready** - Use same image in GitHub Actions
4. **Size Control** - ARM-only backend (~5-7 MB compressed)
5. **No PATH Issues** - Emscripten environment handled automatically
6. **Version Locked** - Dockerfile specifies exact versions

### ❌ What We Avoid

- ❌ Local Emscripten installation issues
- ❌ Python PATH problems on Windows
- ❌ CMake version conflicts
- ❌ "Works on my machine" syndrome

## Prerequisites

Only Docker is required:

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **10+ GB free disk space** for build
- **4+ GB RAM** for Docker
- **Optional:** docker-compose (usually included with Docker Desktop)

## Build Methods

### Method 1: Docker Compose (Recommended)

```bash
cd experiments/c-compiler-poc/2-clang-arm

# Build and run
docker-compose up

# Or build in background
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop container
docker-compose down
```

### Method 2: Direct Docker Commands

```bash
# Build the image
docker build -t clang-wasm-builder .

# Run the build
docker run -v $(pwd)/dist:/build/dist clang-wasm-builder

# Or with all volumes for caching
docker run \
  -v $(pwd)/dist:/build/dist \
  -v $(pwd)/build-wasm:/build/build-wasm \
  -v $(pwd)/llvm-project:/build/llvm-project \
  clang-wasm-builder
```

### Method 3: Makefile

```bash
# Using make for convenience
make docker-build    # Build using Docker
make docker-clean    # Remove Docker volumes
```

## Build Output

After successful build:

```
dist/
├── clang.wasm       # Uncompressed (~20-30 MB)
└── clang.wasm.gz    # Compressed (~5-7 MB) ← Use this!
```

## CI/CD Integration

### GitHub Actions

Copy `.github-workflows-clang-build.yml` to `.github/workflows/`:

```bash
mkdir -p .github/workflows
cp .github-workflows-clang-build.yml .github/workflows/clang-build.yml
```

**Features:**
- ✅ Builds on every push/PR
- ✅ Uploads artifact (30 day retention)
- ✅ Creates release on git tags
- ✅ Optional deployment step

**Trigger build:**
```bash
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions will build and create release
```

### GitLab CI

```yaml
# .gitlab-ci.yml
build-clang:
  image: docker:latest
  services:
    - docker:dind
  script:
    - cd experiments/c-compiler-poc/2-clang-arm
    - docker-compose up --build
  artifacts:
    paths:
      - experiments/c-compiler-poc/2-clang-arm/dist/
    expire_in: 30 days
```

### Other CI Systems

The Docker approach works with any CI that supports Docker:
- Jenkins
- CircleCI
- Travis CI
- Azure Pipelines
- Bitbucket Pipelines

## Build Time & Resources

| Configuration | Time | Memory | CPU |
|--------------|------|--------|-----|
| First build | 30-60 min | 6-8 GB | All cores |
| Cached rebuild | 5-10 min | 4-6 GB | All cores |
| CI/CD build | 35-65 min | 8 GB | 2-4 cores |

**Tips to speed up:**
- Use Docker BuildKit: `DOCKER_BUILDKIT=1 docker-compose up`
- Mount volumes for caching (already in docker-compose.yml)
- Use more CPU cores (adjust in docker-compose.yml)

## Dockerfile Explained

```dockerfile
FROM emscripten/emsdk:3.1.50     # ← Base image with Emscripten

# Install build tools
RUN apt-get install cmake ninja-build python3 git

# Copy build script
COPY build-docker.sh /build/

# Configure for ARM-only
ENV LLVM_TARGETS_TO_BUILD=ARM
ENV CMAKE_BUILD_TYPE=MinSizeRel

CMD ["/build/build-docker.sh"]
```

**Key points:**
- Uses official Emscripten Docker image
- ARM-only backend (not x86, RISC-V, etc.)
- MinSizeRel for smallest binary
- Ninja for faster builds than Make

## Customization

### Change LLVM Version

Edit `build-docker.sh`:
```bash
git clone --branch=release/19.x https://github.com/llvm/llvm-project.git
#                    ^^^^^ Change version here
```

### Add More Backends

Edit `Dockerfile`:
```dockerfile
ENV LLVM_TARGETS_TO_BUILD=ARM;RISCV
#                             ^^^^^ Add targets
```

**Warning:** Each backend adds ~3-5 MB to compressed size!

### Change Optimization Level

```dockerfile
ENV CMAKE_BUILD_TYPE=MinSizeRel
# Options: Debug, Release, MinSizeRel, RelWithDebInfo
```

## Troubleshooting

### Docker build fails with "out of memory"

Increase Docker memory:
- Docker Desktop → Settings → Resources → Memory → 8 GB

### Build is too slow

```yaml
# In docker-compose.yml, increase CPU limit:
deploy:
  resources:
    limits:
      cpus: '16'  # Use more cores
```

### Output files not appearing

Check volume mounts:
```bash
docker-compose down -v  # Remove all volumes
docker-compose up       # Rebuild
```

### Want to inspect the container

```bash
# Run interactively
docker run -it clang-wasm-builder /bin/bash

# Check inside container
ls -la /build/
```

## Integration with Web App

After build completes:

```bash
# Copy to web app
cp dist/clang.wasm.gz ../../apps/web/public/compiler/

# Or use in CI/CD to deploy automatically
```

## Comparison: Docker vs Local Build

| Aspect | Docker Build | Local Build |
|--------|--------------|-------------|
| Setup time | 0 min | 30+ min |
| Dependencies | Docker only | Python, CMake, Emscripten, Git |
| Reproducibility | 100% | Varies by machine |
| CI/CD ready | Yes ✅ | No ❌ |
| PATH issues | None | Common on Windows |
| Platform support | Any with Docker | Linux/Mac better |
| **Recommended** | **Yes** ✅ | No |

## Next Steps

1. ✅ Build completes → `dist/clang.wasm.gz`
2. Copy to web app: `apps/web/public/compiler/`
3. Implement WASM loader in TypeScript
4. Replace pattern compiler with real Clang
5. Test real STM32 compilation!

## Files Created

```
.
├── Dockerfile                      # Docker image definition
├── docker-compose.yml              # Easy build orchestration
├── build-docker.sh                 # Build script (runs in container)
├── .github-workflows-clang-build.yml  # GitHub Actions workflow
└── DOCKER_BUILD.md                 # This file
```

## Example: Complete Workflow

```bash
# 1. Build Clang WASM
docker-compose up

# 2. Check output
ls -lh dist/

# 3. Copy to web app
cp dist/clang.wasm.gz ../../apps/web/public/compiler/

# 4. Commit and push
git add dist/clang.wasm.gz
git commit -m "Add compiled Clang WASM"
git push

# 5. GitHub Actions will rebuild on next push (optional)
```

## Production Deployment

```yaml
# In GitHub Actions (already configured)
- name: Deploy to CDN
  run: |
    # Upload to your CDN/static hosting
    aws s3 cp dist/clang.wasm.gz s3://your-bucket/compiler/
    # Or: netlify deploy --prod --dir=dist
    # Or: vercel deploy dist
```

## Conclusion

Docker-based build system provides:

- ✅ **Zero setup** - Just run `docker-compose up`
- ✅ **Reproducible** - Same output everywhere
- ✅ **CI/CD ready** - Works in GitHub Actions
- ✅ **Size optimized** - ARM-only backend
- ✅ **No hassle** - No PATH or dependency issues

**This is the recommended way to build Clang WASM!**
