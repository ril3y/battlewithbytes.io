# Turborepo Migration Plan: battlewithbytes.io

**Migration Type**: Next.js monolith → pnpm workspace + Turborepo monorepo
**Target Structure**: Incremental extraction with zero downtime
**Primary Goal**: Extract tools into standalone packages for modularity and Electron packaging
**Current Branch**: `blackmagicprobe` (will create migration branch)

---

## Table of Contents

1. [Project Analysis](#project-analysis)
2. [Phase 0: Pre-Migration Preparation](#phase-0-pre-migration-preparation)
3. [Phase 1: Turborepo Foundation Setup](#phase-1-turborepo-foundation-setup)
4. [Phase 2: Migrate Next.js to apps/web](#phase-2-migrate-nextjs-to-appsweb)
5. [Phase 3: Extract BattleTerm Package](#phase-3-extract-battleterm-package)
6. [Phase 4: Create Shared Packages](#phase-4-create-shared-packages)
7. [Phase 5: Update CI/CD Pipeline](#phase-5-update-cicd-pipeline)
8. [Phase 6: Extract Remaining Tools](#phase-6-extract-remaining-tools)
9. [Post-Migration Optimization](#post-migration-optimization)
10. [Rollback Strategies](#rollback-strategies)

---

## Project Analysis

### Current Structure Overview

```
battlewithbytes.io/
├── src/
│   ├── app/
│   │   ├── tools/
│   │   │   ├── serial-terminal/     # BattleTerm (4KB)
│   │   │   ├── battlemagic/         # BattleMagic (9.1MB - largest)
│   │   │   ├── ucan/                # uCAN (705KB)
│   │   │   ├── wiremapper/          # WireMapper (8KB)
│   │   │   ├── mosfet-calculator/   # Calculator tools (4KB each)
│   │   │   └── ohms-law-calculator/
│   │   └── ...
│   ├── components/
│   │   └── tools/
│   │       ├── SerialTerminal/      # BattleTerm component (21 files)
│   │       ├── MosfetCalculator/
│   │       ├── OhmsLawCalculator/
│   │       └── WireMapper/
│   └── lib/
├── scripts/                         # Build scripts (generate-blog-data.js, etc.)
├── public/
├── package.json                     # 67 dependencies + 28 devDependencies
├── next.config.js                   # Static export config
└── .github/workflows/deploy.yml     # GitHub Pages deployment
```

### Key Dependencies

**Critical for Tools:**
- `@xterm/xterm` + addons (BattleTerm)
- `@alexaltea/capstone-js` (BattleMagic disassembler)
- `reactflow` (BattleMagic CFG view)
- `zustand` (state management)
- `classnames`, `clsx`, `tailwind-merge` (styling)

**Build/Deploy:**
- Next.js 15.3.0 with static export (`output: 'export'`)
- pnpm 9.14.4 (already using pnpm!)
- GitHub Actions deployment to GitHub Pages

**Special Considerations:**
- Custom domain: `battlewithbytes.io`
- Blog system with MDX (`scripts/generate-blog-data.js` runs pre-build)
- RSS feed generation (`scripts/generate-rss.js`)
- TypeScript path alias: `@/*` → `./src/*`

### Target Monorepo Structure

```
battlewithbytes.io/
├── apps/
│   └── web/                         # Next.js main site
│       ├── src/
│       ├── public/
│       ├── scripts/
│       ├── package.json
│       ├── next.config.js
│       └── tsconfig.json
├── packages/
│   ├── battleterm/                  # Extracted BattleTerm
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── battlemagic/                 # Extracted BattleMagic (Phase 6)
│   ├── ucan/                        # Extracted uCAN (Phase 6)
│   ├── shared-ui/                   # Shared React components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── shared-types/                # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared-utils/                # Shared utilities
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── pnpm-workspace.yaml
├── turbo.json
├── package.json                     # Root package.json
├── tsconfig.json                    # Base TypeScript config
└── .github/workflows/deploy.yml     # Updated for monorepo
```

---

## Phase 0: Pre-Migration Preparation

**Goal**: Create backup, validate current build, establish baseline
**Duration**: 15-30 minutes
**Risk Level**: Low
**Parallelizable**: No (sequential validation steps)

### Step 0.1: Create Migration Branch

```bash
cd X:\battlewithbytes.io
git checkout -b turborepo-migration
git push -u origin turborepo-migration
```

### Step 0.2: Backup Current Working State

```bash
# Create a backup tag
git tag -a pre-turborepo-migration -m "Backup before Turborepo migration"
git push origin pre-turborepo-migration

# Create full backup archive (optional but recommended)
cd ..
tar -czf battlewithbytes-backup-$(date +%Y%m%d).tar.gz battlewithbytes.io/
```

### Step 0.3: Validate Current Build

```bash
cd X:\battlewithbytes.io

# Clean existing build artifacts
rm -rf .next out node_modules

# Fresh install
pnpm install

# Test development server
pnpm run dev
# → Verify http://localhost:3000 works
# → Test at least one tool (e.g., /tools/serial-terminal)
# → Ctrl+C to stop

# Test production build
pnpm run build
# → Should complete without errors
# → Should generate 'out' directory

# Verify static export
ls -la out/
# → Should contain index.html, _next/, tools/, etc.
```

### Step 0.4: Document Current Build Performance

```bash
# Time the build for baseline comparison
time pnpm run build

# Example output:
# real    2m 15s
# user    8m 30s
# sys     0m 45s
```

**Record these metrics:**
- Total build time: `_______`
- Number of pages generated: `_______` (check `out/` directory)
- Build artifact size: `_______` (run `du -sh out/`)

### Step 0.5: Run Existing Tests

```bash
# Run test suite to ensure everything passes
pnpm run test

# Record results:
# Tests passed: _______
# Tests failed: _______
```

### Validation Checklist

- [ ] Current branch: `turborepo-migration`
- [ ] Backup tag created: `pre-turborepo-migration`
- [ ] Clean build succeeds
- [ ] Static export generates correctly
- [ ] Dev server runs without errors
- [ ] All tests pass
- [ ] Build performance metrics recorded

**Rollback**: `git checkout blackmagicprobe && git branch -D turborepo-migration`

---

## Phase 1: Turborepo Foundation Setup

**Goal**: Set up workspace, install Turborepo, create base configuration
**Duration**: 30-45 minutes
**Risk Level**: Low (no code moved yet)
**Parallelizable**: Steps 1.3, 1.4, 1.5 can be done in parallel after 1.2

### Step 1.1: Install Turborepo

```bash
cd X:\battlewithbytes.io
pnpm add -D -w turbo
```

**Expected output**: `turbo` added as workspace devDependency

### Step 1.2: Create Workspace Configuration

Create `pnpm-workspace.yaml` in root:

```bash
cat > pnpm-workspace.yaml << 'EOF'
# pnpm workspace configuration
packages:
  # Main Next.js application
  - 'apps/*'

  # Shared packages and extracted tools
  - 'packages/*'
EOF
```

### Step 1.3: Create Root package.json

Update the existing `package.json` at root to become the workspace root:

```bash
# Backup current package.json
cp package.json package.json.backup

# Create new root package.json
cat > package.json << 'EOF'
{
  "name": "@battlewithbytes/monorepo",
  "version": "0.1.0",
  "private": true,
  "description": "BattleWithBytes.io monorepo",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules .turbo",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "^3.1.1"
  },
  "engines": {
    "node": ">=20.10.0",
    "pnpm": ">=8.6.2"
  },
  "packageManager": "pnpm@9.14.4"
}
EOF
```

### Step 1.4: Create Turborepo Configuration

Create `turbo.json` in root:

```bash
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env.production.local",
        ".env.local",
        ".env.production",
        ".env"
      ],
      "outputs": [
        ".next/**",
        "!.next/cache/**",
        "out/**",
        "dist/**"
      ],
      "env": [
        "NODE_ENV",
        "NEXT_TELEMETRY_DISABLED",
        "NEXT_PUBLIC_*"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        "**/__tests__/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "jest.config.js",
        "jest.setup.js"
      ],
      "outputs": [
        "coverage/**"
      ]
    },
    "lint": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".eslintrc.json",
        "eslint.config.mjs"
      ]
    },
    "clean": {
      "cache": false
    },
    "type-check": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        "tsconfig.json"
      ],
      "outputs": [
        "tsconfig.tsbuildinfo"
      ]
    }
  },
  "globalEnv": [
    "NODE_ENV"
  ],
  "globalDependencies": [
    "tsconfig.json",
    "pnpm-workspace.yaml"
  ]
}
EOF
```

**Key Configuration Decisions:**

1. **`dependsOn: ["^build"]`**: Ensures dependencies are built before dependents
2. **`outputs`**: Defines cacheable artifacts (Next.js `.next/`, `out/`, package `dist/`)
3. **`inputs`**: Specifies files that invalidate cache (source files, configs, env vars)
4. **`cache: false` for dev**: Development mode shouldn't be cached
5. **`persistent: true` for dev**: Keeps dev server running
6. **Environment variables**: Captures Next.js public env vars for cache keys

### Step 1.5: Create Base TypeScript Configuration

Create `tsconfig.base.json` in root:

```bash
cat > tsconfig.base.json << 'EOF'
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "exclude": ["node_modules"]
}
EOF
```

### Step 1.6: Update .gitignore

Add Turborepo-specific ignores:

```bash
cat >> .gitignore << 'EOF'

# Turborepo
.turbo
dist/
build/

# Workspace
apps/*/node_modules
packages/*/node_modules
apps/*/.next
apps/*/out
packages/*/dist
EOF
```

### Step 1.7: Create Directory Structure

```bash
# Create apps and packages directories
mkdir -p apps packages

# Verify structure
tree -L 1 .
# Expected output:
# .
# ├── apps/
# ├── packages/
# ├── pnpm-workspace.yaml
# ├── turbo.json
# └── ...existing files
```

### Step 1.8: Initialize Turborepo

```bash
# Test Turborepo installation
pnpm turbo --version
# → Should output turbo version (e.g., 2.x.x)

# Verify workspace configuration
pnpm -r list --depth -1
# → Should currently show empty (no workspace packages yet)
```

### Validation Checklist

- [ ] `turbo` installed as devDependency
- [ ] `pnpm-workspace.yaml` created
- [ ] Root `package.json` updated for workspace
- [ ] `turbo.json` configuration created
- [ ] `tsconfig.base.json` created
- [ ] `.gitignore` updated
- [ ] `apps/` and `packages/` directories created
- [ ] `pnpm turbo --version` works

### Test Phase 1

```bash
# Verify workspace is recognized
pnpm -r list --depth -1

# Try running turbo (should warn about no tasks found - that's expected)
pnpm turbo build
# → Expected: "No tasks found in your projects"
```

**Rollback**:
```bash
git restore pnpm-workspace.yaml turbo.json tsconfig.base.json .gitignore package.json
pnpm remove -D -w turbo
rm -rf apps packages
```

**Commit Point**:
```bash
git add .
git commit -m "feat: add Turborepo foundation configuration

- Add pnpm workspace configuration
- Add turbo.json with optimized task pipeline
- Create base TypeScript configuration
- Set up apps/ and packages/ directory structure
- Update .gitignore for Turborepo artifacts

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 2: Migrate Next.js to apps/web

**Goal**: Move existing Next.js app to `apps/web` without breaking functionality
**Duration**: 1-2 hours
**Risk Level**: Medium (major file movement)
**Parallelizable**: Steps 2.4-2.6 can be done in parallel after 2.3

### Step 2.1: Create apps/web Structure

```bash
# Create web app directory
mkdir -p apps/web

# Create initial package.json for web app
cat > apps/web/package.json << 'EOF'
{
  "name": "@battlewithbytes/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "node scripts/generate-blog-data.js && next dev",
    "prebuild": "node scripts/generate-blog-data.js && node scripts/generate-rss.js",
    "build": "next build",
    "export": "next export",
    "build:static": "next build",
    "start": "next start",
    "predeploy": "pnpm run build:static",
    "deploy": "gh-pages -d out",
    "blog": "node scripts/blog-manager.js",
    "project": "node scripts/project-manager.js",
    "kill-port": "npx kill-port 3000",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ucan": "jest src/app/tools/ucan",
    "lint": "next lint",
    "clean": "rm -rf .next out node_modules"
  },
  "dependencies": {
    "@alexaltea/capstone-js": "^3.0.5",
    "@babel/runtime": "^7.27.0",
    "@headlessui/react": "^2.2.2",
    "@heroicons/react": "^2.2.0",
    "@mdx-js/loader": "^3.1.0",
    "@mdx-js/react": "^3.1.0",
    "@radix-ui/react-tabs": "^1.1.4",
    "@types/lodash.debounce": "^4.0.9",
    "@types/nodemailer": "^6.4.17",
    "@types/prismjs": "^1.26.5",
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/addon-web-links": "^0.11.0",
    "@xterm/xterm": "^5.5.0",
    "classnames": "^2.5.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.3.1",
    "dom-to-image-more": "^3.6.0",
    "esprima": "4.0.1",
    "framer-motion": "^12.11.0",
    "gh-pages": "^6.3.0",
    "gray-matter": "^4.0.3",
    "immer": "^10.1.1",
    "jspdf": "^3.0.1",
    "lodash.debounce": "^4.0.8",
    "nanoid": "^5.1.5",
    "next": "15.3.0",
    "next-mdx-remote": "^5.0.0",
    "nodemailer": "^6.10.0",
    "prismjs": "^1.30.0",
    "react": "^19.0.0",
    "react-console-emulator": "^5.0.2",
    "react-dom": "^19.0.0",
    "react-embed-gist": "^1.0.29",
    "reactflow": "^11.11.4",
    "recharts": "^2.15.2",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-prism-plus": "^2.0.1",
    "rehype-sanitize": "^6.0.0",
    "rehype-slug": "^6.0.0",
    "rehype-stringify": "^10.0.1",
    "remark": "^15.0.1",
    "remark-gfm": "^4.0.1",
    "remark-html": "^16.0.1",
    "tailwind-merge": "^2.6.0",
    "zustand": "^5.0.4"
  },
  "homepage": "https://ril3y.github.io/battlewithbytes.io",
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4.1.3",
    "@tailwindcss/typography": "^0.5.16",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^29.5.14",
    "@types/mdx": "^2.0.13",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-loader": "^10.0.0",
    "chalk": "^4.1.2",
    "commander": "^13.1.0",
    "cross-env": "^7.0.3",
    "eslint": "^9",
    "eslint-config-next": "15.3.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^30.2.0",
    "kill-port": "^2.0.1",
    "rss": "^1.2.2",
    "tailwindcss": "^4",
    "ts-jest": "^29.3.1",
    "typescript": "^5"
  }
}
EOF
```

### Step 2.2: Move Files to apps/web

```bash
# Move directories
mv src apps/web/
mv public apps/web/
mv scripts apps/web/

# Move configuration files
mv next.config.js apps/web/
mv next.config.ts apps/web/
mv next-env.d.ts apps/web/
mv jest.config.js apps/web/
mv jest.setup.js apps/web/
mv postcss.config.mjs apps/web/
mv mdx-components.tsx apps/web/

# Copy TypeScript config (will customize)
cp tsconfig.json apps/web/tsconfig.json

# Move test files
mv tests apps/web/ 2>/dev/null || true

# Move ESLint config
mv .eslintrc.json apps/web/ 2>/dev/null || true
mv eslint.config.mjs apps/web/ 2>/dev/null || true
```

### Step 2.3: Update apps/web/tsconfig.json

```bash
cat > apps/web/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "src"
  ],
  "exclude": ["node_modules"]
}
EOF
```

### Step 2.4: Update apps/web/next.config.js

The config should remain mostly the same, but verify it:

```bash
cat > apps/web/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// In production, don't use paths for custom domain
const isUsingCustomDomain = true; // Set to true since you're using battlewithbytes.io

const nextConfig = {
  output: 'export',
  // Only use basePath and assetPrefix if NOT using a custom domain and in production
  basePath: isProd && !isUsingCustomDomain ? '/battlewithbytes.io' : '',
  assetPrefix: isProd && !isUsingCustomDomain ? '/battlewithbytes.io/' : '',
  reactStrictMode: false,
  images: {
    unoptimized: true, // Stays true for static export compatibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.flux.ai',
        port: '',
        pathname: '/static/media/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore Node.js-specific modules when bundling for the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  // Your other Next.js configurations can go here
};

module.exports = nextConfig;
EOF
```

### Step 2.5: Create Tailwind Config in apps/web

```bash
# Copy existing tailwind config if it exists
cp tailwind.config.js apps/web/ 2>/dev/null || \
cat > apps/web/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
EOF
```

### Step 2.6: Install Dependencies in Workspace

```bash
# Install dependencies from workspace root
pnpm install

# Verify apps/web dependencies installed
ls apps/web/node_modules | head -n 10
```

### Step 2.7: Test apps/web Build

```bash
# Change to apps/web directory
cd apps/web

# Test development server
pnpm run dev
# → Visit http://localhost:3000
# → Verify homepage loads
# → Test at least one tool: http://localhost:3000/tools/serial-terminal
# → Ctrl+C to stop

# Test production build
pnpm run build
# → Should complete without errors
# → Should generate 'out' directory

# Verify static export
ls -la out/
# → Should contain index.html, _next/, tools/, etc.
```

### Step 2.8: Test Turborepo Integration

```bash
# Return to root
cd ../..

# Test Turborepo commands
pnpm turbo build
# → Should build apps/web

pnpm turbo dev
# → Should start apps/web dev server

# Ctrl+C to stop
```

### Step 2.9: Clean Up Root Directory

```bash
# Remove old files from root (now in apps/web)
# BE CAREFUL - double check these are moved before deleting
rm -rf .next out tsconfig.tsbuildinfo

# Verify root is clean
ls -la
# → Should NOT have src/, public/, scripts/ anymore
# → Should have apps/, packages/, pnpm-workspace.yaml, turbo.json
```

### Validation Checklist

- [ ] `apps/web/` directory created with all files
- [ ] `apps/web/package.json` has all dependencies
- [ ] `apps/web/tsconfig.json` extends base config
- [ ] `pnpm install` completes successfully
- [ ] `cd apps/web && pnpm run build` succeeds
- [ ] Static export generates correctly in `apps/web/out/`
- [ ] Dev server works: `cd apps/web && pnpm run dev`
- [ ] Turborepo commands work from root: `pnpm turbo build`
- [ ] Root directory cleaned of moved files

### Common Issues & Solutions

**Issue**: Build fails with "Cannot find module '@/...'"
**Solution**: Verify `apps/web/tsconfig.json` has correct `paths` configuration

**Issue**: MDX files not loading
**Solution**: Check `next.config.js` webpack configuration is moved correctly

**Issue**: Styles not applying
**Solution**: Verify `tailwind.config.js` content paths are correct for new structure

**Rollback**:
```bash
cd X:\battlewithbytes.io
git restore .
git clean -fd
pnpm install
```

**Commit Point**:
```bash
git add .
git commit -m "feat: migrate Next.js app to apps/web monorepo structure

- Move all Next.js files to apps/web/
- Create dedicated package.json for web app
- Update TypeScript config to extend base
- Preserve all build scripts and configurations
- Verify static export still works correctly

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 3: Extract BattleTerm Package

**Goal**: Extract serial-terminal tool into standalone `@battlewithbytes/battleterm` package
**Duration**: 2-3 hours
**Risk Level**: Medium-High (first extraction, establishes pattern)
**Parallelizable**: Step 3.4 (Update web) can be done in parallel with 3.3 (Package dev)

### Step 3.1: Create Package Structure

```bash
# Create battleterm package
mkdir -p packages/battleterm/src/{components,lib,types}

# Create package.json
cat > packages/battleterm/package.json << 'EOF'
{
  "name": "@battlewithbytes/battleterm",
  "version": "1.0.0",
  "description": "Browser-based serial terminal for embedded development",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --external react --external react-dom --external @xterm/xterm",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "keywords": [
    "serial",
    "terminal",
    "xterm",
    "embedded",
    "arduino",
    "esp32",
    "web-serial-api"
  ],
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/addon-web-links": "^0.11.0",
    "@xterm/xterm": "^5.5.0",
    "classnames": "^2.5.1",
    "zustand": "^5.0.4"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tsup": "^8.0.1",
    "typescript": "^5"
  }
}
EOF
```

### Step 3.2: Create TypeScript Configuration

```bash
cat > packages/battleterm/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "jsx": "react-jsx",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
EOF
```

### Step 3.3: Move BattleTerm Code

```bash
# Copy component files from apps/web
cp -r apps/web/src/components/tools/SerialTerminal/* packages/battleterm/src/components/

# Create index.ts to export public API
cat > packages/battleterm/src/index.ts << 'EOF'
// Main exports
export { default as SerialTerminal } from './components/SerialTerminalClient';
export { default as SerialTerminalPageClient } from './components/SerialTerminalPageClient';

// Types
export type {
  SerialConfig,
  ConnectionState,
  TerminalTheme,
  MacroConfig,
} from './components/serialTerminal.types';

// Utilities
export {
  formatBytes,
  escapeControlChars,
  hexDump,
} from './components/serialUtils';

// Config manager
export {
  saveConfiguration,
  loadConfiguration,
  deleteConfiguration,
  listConfigurations,
} from './components/configManager';

// Version
export { VERSION } from './components/version';
EOF
```

### Step 3.4: Update Import Paths in Package

The component files currently have imports like `@/...` which won't work in the package. We need to update them to relative imports:

```bash
# This is a manual step - you'll need to update imports in each file
# Example transformations:
# Before: import { formatBytes } from '@/lib/utils'
# After:  import { formatBytes } from '../lib/utils'
#
# Or if the utility is in the same package:
# After:  import { formatBytes } from './serialUtils'

# Files to update (do this carefully):
# - packages/battleterm/src/components/SerialTerminalClient.tsx
# - packages/battleterm/src/components/ConnectionPanel.tsx
# - packages/battleterm/src/components/ConfigurationModal.tsx
# - packages/battleterm/src/components/AdvancedControls.tsx
# - And all other component files...
```

**Manual Task**: Update all imports in `packages/battleterm/src/components/*.tsx` to use relative paths instead of `@/` aliases.

### Step 3.5: Build BattleTerm Package

```bash
cd packages/battleterm

# Install dependencies
pnpm install

# Build the package
pnpm run build

# Verify dist output
ls -la dist/
# → Should contain: index.js, index.mjs, index.d.ts, etc.

cd ../..
```

### Step 3.6: Update apps/web to Use Package

Update `apps/web/package.json` to add the local package dependency:

```bash
# Add to apps/web/package.json dependencies:
cat > /tmp/package-snippet.json << 'EOF'
{
  "@battlewithbytes/battleterm": "workspace:*"
}
EOF

# Manually add this line to apps/web/package.json dependencies section
```

Then update the serial-terminal page to import from the package:

```bash
cat > apps/web/src/app/tools/serial-terminal/page.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { generateToolSchema } from '@/lib/utils/seo';
import SerialTerminal from '@battlewithbytes/battleterm';

export default function SerialTerminalPage() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitHint, setShowExitHint] = useState(false);

  useEffect(() => {
    // Detect if running in PWA/standalone mode
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true;
    const isAndroidApp = document.referrer.includes('android-app://');

    setIsStandalone(isDisplayStandalone || isIOSStandalone || isAndroidApp);
  }, []);

  // Handle ESC key to exit fullscreen (use capture to intercept before xterm)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        e.stopPropagation();
        setIsFullscreen(false);
        setShowExitHint(false);
      }
    };

    // Use capture phase to intercept ESC before xterm.js terminal gets it
    window.addEventListener('keydown', handleEscape, { capture: true });
    return () => window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [isFullscreen]);

  // Show exit hint briefly when entering fullscreen
  useEffect(() => {
    if (isFullscreen && !isStandalone) {
      setShowExitHint(true);
      const timer = setTimeout(() => setShowExitHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, isStandalone]);

  const toolSchema = generateToolSchema(
    'BattleTerm - Browser Serial Terminal',
    'Free browser-based serial terminal for Arduino, ESP32, Raspberry Pi & embedded devices. Professional serial communication tool with ANSI colors, hex view, macros, and command history. No installation required.',
    '/tools/serial-terminal'
  );

  // Hide header if PWA mode OR user toggled fullscreen
  const hideHeader = isStandalone || isFullscreen;

  return (
    <main className={hideHeader ? 'h-screen' : 'min-h-screen py-16 px-4'}>
      <Script id="serial-terminal-schema" type="application/ld+json">
        {JSON.stringify(toolSchema)}
      </Script>

      <div className={hideHeader ? 'h-full flex flex-col' : 'max-w-7xl mx-auto'}>
        {/* Header - show only in browser mode when not fullscreen */}
        {!hideHeader && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-5xl font-bold font-mono glow-text">
              <span className="text-green-400">&lt;</span> BattleTerm <span className="text-green-400">/&gt;</span>
            </h1>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded border border-green-500/30 hover:border-green-500/60 transition-colors font-mono text-sm"
              title="Toggle fullscreen terminal view"
            >
              ⛶ Fullscreen
            </button>
          </div>
        )}

        {/* Exit fullscreen hint when in fullscreen mode (but not PWA) */}
        {showExitHint && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="px-4 py-2 bg-gray-900/95 text-gray-300 rounded-lg border border-green-500/30 shadow-lg font-mono text-sm">
              Press <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-green-400">ESC</kbd> to exit fullscreen
            </div>
          </div>
        )}

        {/* BattleTerm Component */}
        <SerialTerminal isStandalone={hideHeader} />
      </div>
    </main>
  );
}
EOF
```

### Step 3.7: Configure Next.js to Transpile Package

Update `apps/web/next.config.js` to add `transpilePackages`:

```bash
cat > apps/web/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// In production, don't use paths for custom domain
const isUsingCustomDomain = true;

const nextConfig = {
  output: 'export',
  basePath: isProd && !isUsingCustomDomain ? '/battlewithbytes.io' : '',
  assetPrefix: isProd && !isUsingCustomDomain ? '/battlewithbytes.io/' : '',
  reactStrictMode: false,

  // Transpile workspace packages
  transpilePackages: [
    '@battlewithbytes/battleterm',
  ],

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.flux.ai',
        port: '',
        pathname: '/static/media/**',
      },
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
EOF
```

### Step 3.8: Rebuild and Test

```bash
# From root, rebuild everything
pnpm install
pnpm turbo build

# Test the web app
cd apps/web
pnpm run dev
# → Visit http://localhost:3000/tools/serial-terminal
# → Verify BattleTerm loads and functions correctly
# → Test connecting to a serial device
# → Verify all UI controls work
# Ctrl+C to stop

cd ../..
```

### Step 3.9: Test Package Independently

```bash
# Create a minimal test harness (optional but recommended)
mkdir -p test-harness
cd test-harness

# Create minimal Next.js app to test package
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Add battleterm package
pnpm add @battlewithbytes/battleterm@workspace:*

# Create test page
mkdir -p app/test
cat > app/test/page.tsx << 'EOF'
'use client';
import SerialTerminal from '@battlewithbytes/battleterm';

export default function TestPage() {
  return <SerialTerminal />;
}
EOF

# Test
pnpm run dev
# → Visit http://localhost:3000/test
# → Verify component works standalone

cd ..
rm -rf test-harness
```

### Validation Checklist

- [ ] `packages/battleterm/` package created
- [ ] Package builds successfully: `cd packages/battleterm && pnpm run build`
- [ ] `dist/` output contains `.js`, `.mjs`, `.d.ts` files
- [ ] `apps/web/package.json` references `@battlewithbytes/battleterm`
- [ ] `apps/web/next.config.js` includes package in `transpilePackages`
- [ ] Serial terminal page imports from package
- [ ] `pnpm turbo build` builds both package and web app
- [ ] Dev server works: BattleTerm loads at `/tools/serial-terminal`
- [ ] All BattleTerm features work (connection, ANSI colors, macros, etc.)

### Common Issues & Solutions

**Issue**: "Cannot find module '@battlewithbytes/battleterm'"
**Solution**: Run `pnpm install` from root to link workspace packages

**Issue**: "Module parse failed: Unexpected token" in browser
**Solution**: Verify `transpilePackages` is configured in `next.config.js`

**Issue**: Styles not loading
**Solution**: Import package styles: `import '@battlewithbytes/battleterm/styles.css'`

**Issue**: TypeScript errors about missing types
**Solution**: Verify `tsup` is generating `.d.ts` files in build output

**Rollback**:
```bash
git restore apps/web/src/app/tools/serial-terminal/page.tsx
git restore apps/web/package.json
git restore apps/web/next.config.js
rm -rf packages/battleterm
pnpm install
```

**Commit Point**:
```bash
git add .
git commit -m "feat: extract BattleTerm into standalone package

- Create @battlewithbytes/battleterm package
- Move serial terminal components to packages/battleterm
- Set up tsup build configuration for dual CJS/ESM output
- Update web app to consume battleterm package
- Configure Next.js to transpile workspace package
- Verify all functionality preserved

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 4: Create Shared Packages

**Goal**: Extract common code into shared packages to reduce duplication
**Duration**: 2-3 hours
**Risk Level**: Medium
**Parallelizable**: All three packages (shared-ui, shared-types, shared-utils) can be created in parallel

### Step 4.1: Create shared-types Package

```bash
mkdir -p packages/shared-types/src

cat > packages/shared-types/package.json << 'EOF'
{
  "name": "@battlewithbytes/shared-types",
  "version": "1.0.0",
  "description": "Shared TypeScript types for BattleWithBytes tools",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "tsup": "^8.0.1",
    "typescript": "^5"
  }
}
EOF

cat > packages/shared-types/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

cat > packages/shared-types/src/index.ts << 'EOF'
// Common tool types
export interface ToolMetadata {
  name: string;
  description: string;
  version: string;
  author?: string;
  keywords?: string[];
}

// Connection state types
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// Common configuration types
export interface BaseConfiguration {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Export more shared types as you identify common patterns
EOF

cd packages/shared-types && pnpm install && pnpm run build && cd ../..
```

### Step 4.2: Create shared-ui Package

```bash
mkdir -p packages/shared-ui/src/{components,hooks,utils}

cat > packages/shared-ui/package.json << 'EOF'
{
  "name": "@battlewithbytes/shared-ui",
  "version": "1.0.0",
  "description": "Shared React components and UI utilities for BattleWithBytes tools",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --external react --external react-dom",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "classnames": "^2.5.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tsup": "^8.0.1",
    "typescript": "^5"
  }
}
EOF

cat > packages/shared-ui/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "jsx": "react-jsx",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create some common UI components
cat > packages/shared-ui/src/components/Button.tsx << 'EOF'
import React from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'rounded font-medium transition-colors',
          {
            'bg-green-600 hover:bg-green-700 text-white': variant === 'primary',
            'bg-gray-600 hover:bg-gray-700 text-white': variant === 'secondary',
            'bg-red-600 hover:bg-red-700 text-white': variant === 'danger',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
EOF

cat > packages/shared-ui/src/utils/cn.ts << 'EOF'
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF

cat > packages/shared-ui/src/index.ts << 'EOF'
// Components
export { Button } from './components/Button';

// Utilities
export { cn } from './utils/cn';
EOF

cd packages/shared-ui && pnpm install && pnpm run build && cd ../..
```

### Step 4.3: Create shared-utils Package

```bash
mkdir -p packages/shared-utils/src

cat > packages/shared-utils/package.json << 'EOF'
{
  "name": "@battlewithbytes/shared-utils",
  "version": "1.0.0",
  "description": "Shared utility functions for BattleWithBytes tools",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "test": "jest"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "jest": "^29.7.0",
    "tsup": "^8.0.1",
    "typescript": "^5"
  }
}
EOF

cat > packages/shared-utils/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF

cat > packages/shared-utils/src/format.ts << 'EOF'
/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}
EOF

cat > packages/shared-utils/src/validation.ts << 'EOF'
/**
 * Validate hex string
 */
export function isValidHex(str: string): boolean {
  return /^[0-9A-Fa-f]+$/.test(str);
}

/**
 * Validate IPv4 address
 */
export function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && part === num.toString();
  });
}

/**
 * Validate port number
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 0 && port <= 65535;
}
EOF

cat > packages/shared-utils/src/index.ts << 'EOF'
// Format utilities
export { formatBytes, formatNumber, formatDuration } from './format';

// Validation utilities
export { isValidHex, isValidIPv4, isValidPort } from './validation';
EOF

cd packages/shared-utils && pnpm install && pnpm run build && cd ../..
```

### Step 4.4: Update Packages to Use Shared Code

Update `packages/battleterm/package.json` to add shared dependencies:

```json
{
  "dependencies": {
    "@battlewithbytes/shared-types": "workspace:*",
    "@battlewithbytes/shared-ui": "workspace:*",
    "@battlewithbytes/shared-utils": "workspace:*",
    // ... existing dependencies
  }
}
```

Update imports in battleterm to use shared utilities where applicable.

### Step 4.5: Update apps/web to Use Shared Packages

Add to `apps/web/package.json`:

```json
{
  "dependencies": {
    "@battlewithbytes/shared-types": "workspace:*",
    "@battlewithbytes/shared-ui": "workspace:*",
    "@battlewithbytes/shared-utils": "workspace:*",
    // ... existing dependencies
  }
}
```

Update `apps/web/next.config.js`:

```javascript
transpilePackages: [
  '@battlewithbytes/battleterm',
  '@battlewithbytes/shared-ui',
  '@battlewithbytes/shared-types',
  '@battlewithbytes/shared-utils',
],
```

### Step 4.6: Build and Test Everything

```bash
# Install all dependencies
pnpm install

# Build all packages (Turborepo will handle dependency order)
pnpm turbo build

# Verify build output
ls packages/*/dist/

# Test web app
cd apps/web
pnpm run dev
# → Test all tools still work
# Ctrl+C

cd ../..
```

### Validation Checklist

- [ ] All three shared packages created
- [ ] Each package builds successfully
- [ ] `pnpm turbo build` builds all packages in correct order
- [ ] battleterm uses shared packages
- [ ] apps/web uses shared packages
- [ ] Dev server works with shared packages
- [ ] No duplicate code between packages

**Commit Point**:
```bash
git add .
git commit -m "feat: create shared packages for common code

- Create @battlewithbytes/shared-types for TypeScript types
- Create @battlewithbytes/shared-ui for React components
- Create @battlewithbytes/shared-utils for utility functions
- Update battleterm to use shared packages
- Update web app to use shared packages
- Configure Turborepo to build packages in dependency order

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 5: Update CI/CD Pipeline

**Goal**: Update GitHub Actions workflow for monorepo build and deployment
**Duration**: 30-60 minutes
**Risk Level**: Medium (affects deployment)
**Parallelizable**: No (must be done carefully to avoid breaking deployments)

### Step 5.1: Update GitHub Actions Workflow

Update `.github/workflows/deploy.yml`:

```yaml
name: Deploy Next.js site to Pages

on:
  push:
    branches: ["master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # Step 1: Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.10.0"

      # Step 2: Setup pnpm
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.14.4
          run_install: false

      # Step 3: Get pnpm store directory
      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      # Step 4: Setup Turborepo cache
      - name: Setup Turborepo cache
        uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      # Step 5: Install dependencies
      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # Step 6: Build with Turborepo
      - name: Build with Turborepo
        run: pnpm turbo build --filter=@battlewithbytes/web
        env:
          NEXT_TELEMETRY_DISABLED: 1

      # Step 7: Upload artifact
      - name: Upload artifact for deployment
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./apps/web/out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Key Changes Explained:**

1. **Turborepo cache**: Added caching for `.turbo` directory to speed up CI builds
2. **Build command**: Changed to `pnpm turbo build --filter=@battlewithbytes/web` to build only web app and its dependencies
3. **Artifact path**: Updated to `./apps/web/out` (new location of static export)
4. **Frozen lockfile**: Added `--frozen-lockfile` for reproducible builds
5. **Removed MDX loader downgrade**: No longer needed (should be resolved in monorepo)

### Step 5.2: Create Turbo CI Configuration (Optional)

For faster CI builds, you can use Vercel Remote Caching (free for open source):

```bash
cat > .github/workflows/turbo-cache.yml << 'EOF'
name: Setup Turbo Remote Cache

on:
  workflow_call:

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Turbo token
        run: echo "TURBO_TOKEN=${{ secrets.TURBO_TOKEN }}" >> $GITHUB_ENV

      - name: Setup Turbo team
        run: echo "TURBO_TEAM=${{ secrets.TURBO_TEAM }}" >> $GITHUB_ENV
EOF
```

To enable remote caching:
1. Sign up at https://vercel.com/docs/concepts/monorepos/remote-caching
2. Get `TURBO_TOKEN` and `TURBO_TEAM`
3. Add as GitHub repository secrets
4. Include in workflow env vars

### Step 5.3: Test Workflow Locally (Optional)

You can test GitHub Actions locally using `act`:

```bash
# Install act (Windows)
choco install act-cli

# Or use Docker
docker run -it --rm -v ${PWD}:/repo nektos/act -W /repo/.github/workflows/deploy.yml

# Run dry-run
act push --dryrun
```

### Step 5.4: Create Test Deployment Workflow

Before merging to master, test on a separate branch:

```yaml
# .github/workflows/test-build.yml
name: Test Monorepo Build

on:
  pull_request:
    branches: ["master", "turborepo-migration"]
  push:
    branches: ["turborepo-migration"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.10.0"

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.14.4
          run_install: false

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build all packages
        run: pnpm turbo build

      - name: Run tests
        run: pnpm turbo test

      - name: Verify web app output
        run: |
          if [ ! -d "apps/web/out" ]; then
            echo "Error: apps/web/out directory not found"
            exit 1
          fi
          if [ ! -f "apps/web/out/index.html" ]; then
            echo "Error: index.html not found in output"
            exit 1
          fi
          echo "Build verification successful"
```

### Step 5.5: Update Package Scripts for CI

Add CI-specific scripts to root `package.json`:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "build:web": "turbo run build --filter=@battlewithbytes/web",
    "test": "turbo run test",
    "test:ci": "turbo run test --force",
    "lint": "turbo run lint",
    "lint:ci": "turbo run lint --force",
    "clean": "turbo run clean && rm -rf node_modules .turbo",
    "ci": "pnpm install --frozen-lockfile && pnpm run build && pnpm run test:ci",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  }
}
```

### Validation Checklist

- [ ] `.github/workflows/deploy.yml` updated for monorepo
- [ ] Test workflow created: `.github/workflows/test-build.yml`
- [ ] CI scripts added to root `package.json`
- [ ] Turborepo cache configured in workflow
- [ ] Build artifact path updated to `apps/web/out`

### Test the Workflow

```bash
# Push to trigger test workflow
git add .
git commit -m "feat: update CI/CD for Turborepo monorepo"
git push origin turborepo-migration

# Monitor the GitHub Actions run
# → Go to: https://github.com/ril3y/battlewithbytes.io/actions
# → Verify "Test Monorepo Build" workflow runs
# → Check that all steps pass
# → Verify build artifacts are generated
```

**Important**: DO NOT merge to master until test workflow passes successfully!

### Rollback

If workflow fails, you can quickly revert:

```bash
git restore .github/workflows/deploy.yml
git commit -m "revert: CI/CD changes"
git push
```

**Commit Point** (after successful test):
```bash
git add .
git commit -m "feat: update CI/CD pipeline for Turborepo monorepo

- Update deploy workflow for monorepo structure
- Add Turborepo cache to speed up CI builds
- Create test workflow for PR validation
- Update build artifact path to apps/web/out
- Add CI-specific scripts to root package.json

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 6: Extract Remaining Tools

**Goal**: Extract BattleMagic, uCAN, and other tools into packages
**Duration**: 2-4 hours per tool
**Risk Level**: Low (pattern established with BattleTerm)
**Parallelizable**: Can extract multiple tools simultaneously after pattern is proven

### Tool Extraction Priority

Based on size and complexity:

1. **BattleMagic** (9.1MB) - Most complex, highest value
2. **uCAN** (705KB) - Medium complexity
3. **WireMapper** (8KB) - Simple
4. **Calculator Tools** (4KB each) - Simplest, can be combined

### Step 6.1: Extract BattleMagic

```bash
mkdir -p packages/battlemagic/src/{components,lib}

cat > packages/battlemagic/package.json << 'EOF'
{
  "name": "@battlewithbytes/battlemagic",
  "version": "1.0.0",
  "description": "Browser-based debugger for Black Magic Probe",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --external react --external react-dom",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "test": "jest"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "@alexaltea/capstone-js": "^3.0.5",
    "@battlewithbytes/shared-types": "workspace:*",
    "@battlewithbytes/shared-ui": "workspace:*",
    "@battlewithbytes/shared-utils": "workspace:*",
    "classnames": "^2.5.1",
    "reactflow": "^11.11.4",
    "zustand": "^5.0.4"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tsup": "^8.0.1",
    "typescript": "^5",
    "jest": "^29.7.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.9.1"
  }
}
EOF

# Copy BattleMagic files
cp -r apps/web/src/app/tools/battlemagic/* packages/battlemagic/src/

# Create index.ts
cat > packages/battlemagic/src/index.ts << 'EOF'
// Main component exports
export { default as BattleMagicMonitor } from './components/BattleMagicMonitor';
export { default as DebuggerView } from './components/DebuggerView';
export { default as GdbPanel } from './components/GdbPanel';
export { default as MemoryPanel } from './components/MemoryPanel';

// Lib exports
export * from './lib/gdb';
export * from './lib/cfg';
export * from './lib/flash';
export * from './lib/swo';

// Types
export type * from './lib/gdb/index';
EOF

# Build
cd packages/battlemagic
pnpm install
pnpm run build
cd ../..
```

**Manual Steps for BattleMagic:**
1. Update all `@/` imports to relative imports
2. Move test files to `__tests__` directory
3. Update web app to import from package
4. Add to transpilePackages in next.config.js

### Step 6.2: Extract uCAN

```bash
mkdir -p packages/ucan/src/{components,lib}

cat > packages/ucan/package.json << 'EOF'
{
  "name": "@battlewithbytes/ucan",
  "version": "1.0.0",
  "description": "uCAN bus analyzer and decoder",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --external react --external react-dom",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "test": "jest"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "@battlewithbytes/shared-types": "workspace:*",
    "@battlewithbytes/shared-ui": "workspace:*",
    "@battlewithbytes/shared-utils": "workspace:*",
    "classnames": "^2.5.1",
    "zustand": "^5.0.4"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tsup": "^8.0.1",
    "typescript": "^5"
  }
}
EOF

# Copy and build (similar to BattleMagic)
cp -r apps/web/src/app/tools/ucan/* packages/ucan/src/
cd packages/ucan && pnpm install && pnpm run build && cd ../..
```

### Step 6.3: Extract Calculator Tools (Combined Package)

```bash
mkdir -p packages/calculators/src/{mosfet,ohms-law}

cat > packages/calculators/package.json << 'EOF'
{
  "name": "@battlewithbytes/calculators",
  "version": "1.0.0",
  "description": "Electronics calculators (Ohm's Law, MOSFET, etc.)",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./mosfet": {
      "import": "./dist/mosfet.mjs",
      "require": "./dist/mosfet.js",
      "types": "./dist/mosfet.d.ts"
    },
    "./ohms-law": {
      "import": "./dist/ohms-law.mjs",
      "require": "./dist/ohms-law.js",
      "types": "./dist/ohms-law.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts src/mosfet.ts src/ohms-law.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts src/mosfet.ts src/ohms-law.ts --format esm,cjs --dts --watch",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "@battlewithbytes/shared-ui": "workspace:*",
    "@battlewithbytes/shared-utils": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.0.1",
    "typescript": "^5"
  }
}
EOF

# Copy components
cp -r apps/web/src/components/tools/MosfetCalculator/* packages/calculators/src/mosfet/
cp -r apps/web/src/components/tools/OhmsLawCalculator/* packages/calculators/src/ohms-law/

# Build
cd packages/calculators && pnpm install && pnpm run build && cd ../..
```

### Step 6.4: Update Web App to Use All Packages

Update `apps/web/package.json` dependencies:

```json
{
  "dependencies": {
    "@battlewithbytes/battleterm": "workspace:*",
    "@battlewithbytes/battlemagic": "workspace:*",
    "@battlewithbytes/ucan": "workspace:*",
    "@battlewithbytes/calculators": "workspace:*",
    "@battlewithbytes/shared-types": "workspace:*",
    "@battlewithbytes/shared-ui": "workspace:*",
    "@battlewithbytes/shared-utils": "workspace:*",
    // ... other dependencies
  }
}
```

Update `apps/web/next.config.js`:

```javascript
transpilePackages: [
  '@battlewithbytes/battleterm',
  '@battlewithbytes/battlemagic',
  '@battlewithbytes/ucan',
  '@battlewithbytes/calculators',
  '@battlewithbytes/shared-ui',
  '@battlewithbytes/shared-types',
  '@battlewithbytes/shared-utils',
],
```

### Step 6.5: Update Tool Pages

Update each tool page in `apps/web/src/app/tools/*/page.tsx` to import from packages:

```typescript
// Before: import Component from '@/components/tools/SerialTerminal'
// After:  import Component from '@battlewithbytes/battleterm'

// apps/web/src/app/tools/battlemagic/page.tsx
import { BattleMagicMonitor } from '@battlewithbytes/battlemagic';

// apps/web/src/app/tools/ucan/page.tsx
import { UCANAnalyzer } from '@battlewithbytes/ucan';

// apps/web/src/app/tools/mosfet-calculator/page.tsx
import { MosfetCalculator } from '@battlewithbytes/calculators/mosfet';

// apps/web/src/app/tools/ohms-law-calculator/page.tsx
import { OhmsLawCalculator } from '@battlewithbytes/calculators/ohms-law';
```

### Step 6.6: Remove Old Component Files

After verifying everything works with packages:

```bash
# Remove old component directories (BE CAREFUL - verify packages work first!)
rm -rf apps/web/src/components/tools/SerialTerminal
rm -rf apps/web/src/components/tools/MosfetCalculator
rm -rf apps/web/src/components/tools/OhmsLawCalculator
rm -rf apps/web/src/components/tools/WireMapper

# Remove old tool source directories (keep page.tsx files)
# DO NOT remove apps/web/src/app/tools/*/page.tsx - only component source
```

### Step 6.7: Build and Test Everything

```bash
# Clean rebuild
pnpm turbo clean
pnpm install
pnpm turbo build

# Test web app
cd apps/web
pnpm run dev
# → Test each tool:
#   - /tools/serial-terminal (BattleTerm)
#   - /tools/battlemagic (BattleMagic)
#   - /tools/ucan (uCAN)
#   - /tools/mosfet-calculator
#   - /tools/ohms-law-calculator
#   - /tools/wiremapper
# Ctrl+C

# Test production build
pnpm run build
# → Verify all pages generate
# → Check output size

cd ../..
```

### Validation Checklist

- [ ] All tool packages created and build successfully
- [ ] Web app imports from packages
- [ ] `transpilePackages` configured for all packages
- [ ] All tools work in development mode
- [ ] Production build succeeds
- [ ] Static export generates correctly
- [ ] Old component directories removed
- [ ] No TypeScript errors
- [ ] No build warnings

### Performance Comparison

Record new build times after extraction:

```bash
time pnpm turbo build

# Compare to Phase 0.4 baseline
# Expected improvements:
# - Initial build: Similar or slightly slower (more packages)
# - Cached rebuild: Much faster (only changed packages rebuild)
# - Incremental: Significantly faster (package-level caching)
```

**Commit Point**:
```bash
git add .
git commit -m "feat: extract all tools into standalone packages

- Extract BattleMagic into @battlewithbytes/battlemagic
- Extract uCAN into @battlewithbytes/ucan
- Extract calculators into @battlewithbytes/calculators
- Update web app to import from packages
- Remove old component directories
- Configure transpilePackages for all tool packages
- Verify all tools work with package imports

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Post-Migration Optimization

### Leveraging Turborepo Caching

#### Remote Caching Setup

1. **Sign up for Vercel (free for open source)**:
   ```bash
   pnpm dlx turbo login
   pnpm dlx turbo link
   ```

2. **Configure remote caching in CI**:
   Add to GitHub repository secrets:
   - `TURBO_TOKEN`: Your Vercel token
   - `TURBO_TEAM`: Your team slug

3. **Update workflow to use remote cache**:
   ```yaml
   env:
     TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
     TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
   ```

#### Local Caching Best Practices

```bash
# View cache hits
pnpm turbo build --summarize

# Force rebuild (ignore cache)
pnpm turbo build --force

# Dry run to see what would run
pnpm turbo build --dry-run

# Run only affected tasks
pnpm turbo build --filter=...[HEAD^]
```

### Parallel Execution Examples

```bash
# Run all dev servers in parallel (opens multiple terminals)
pnpm turbo dev --parallel

# Build only specific package and its dependencies
pnpm turbo build --filter=@battlewithbytes/battlemagic

# Run tests for changed packages since last commit
pnpm turbo test --filter=...[HEAD^]

# Build everything except web app
pnpm turbo build --filter=!@battlewithbytes/web
```

### Package Scripts Reference

Add these convenience scripts to root `package.json`:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=@battlewithbytes/web",
    "dev:battleterm": "turbo run dev --filter=@battlewithbytes/battleterm",
    "build": "turbo run build",
    "build:web": "turbo run build --filter=@battlewithbytes/web",
    "build:packages": "turbo run build --filter=!@battlewithbytes/web",
    "test": "turbo run test",
    "test:changed": "turbo run test --filter=...[HEAD^]",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint -- --fix",
    "clean": "turbo run clean && rm -rf node_modules .turbo",
    "clean:cache": "rm -rf .turbo",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "type-check": "turbo run type-check",
    "graph": "turbo run build --graph=dependency-graph.html"
  }
}
```

### Visualize Dependency Graph

```bash
# Generate interactive dependency graph
pnpm turbo build --graph=dependency-graph.html

# Open in browser
start dependency-graph.html  # Windows
open dependency-graph.html   # macOS
xdg-open dependency-graph.html  # Linux
```

### Extracting Electron App from Package

Now that tools are packages, creating an Electron app is straightforward:

```bash
mkdir -p apps/electron

cat > apps/electron/package.json << 'EOF'
{
  "name": "@battlewithbytes/electron",
  "version": "1.0.0",
  "description": "BattleTerm Electron Desktop App",
  "main": "dist/main.js",
  "scripts": {
    "dev": "electron .",
    "build": "tsc && electron-builder",
    "package": "electron-builder --dir",
    "dist": "electron-builder"
  },
  "dependencies": {
    "@battlewithbytes/battleterm": "workspace:*",
    "electron": "^28.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "electron-builder": "^24.9.1",
    "typescript": "^5"
  },
  "build": {
    "appId": "io.battlewithbytes.battleterm",
    "productName": "BattleTerm",
    "files": [
      "dist/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"]
    },
    "mac": {
      "target": ["dmg", "zip"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
EOF
```

The Electron app can now import `@battlewithbytes/battleterm` directly!

### CI/CD Pipeline Optimization

**Expected Build Time Improvements:**

| Scenario | Before (Monolith) | After (Turborepo) | Improvement |
|----------|-------------------|-------------------|-------------|
| Full clean build | ~2m 15s | ~2m 30s | -10% (initial overhead) |
| Rebuild with no changes | ~2m 15s | ~5s | 96% faster (full cache hit) |
| Change one package | ~2m 15s | ~30s | 77% faster (partial cache) |
| Change shared package | ~2m 15s | ~1m 20s | 40% faster (affected packages) |

**Cache Hit Rate Monitoring:**

Add this to CI workflow:

```yaml
- name: Build with cache stats
  run: pnpm turbo build --summarize | tee build-summary.txt

- name: Upload build summary
  uses: actions/upload-artifact@v4
  with:
    name: build-summary
    path: build-summary.txt
```

---

## Rollback Strategies

### Full Rollback (Nuclear Option)

If something goes catastrophically wrong:

```bash
# Switch back to pre-migration tag
git checkout pre-turborepo-migration

# Create rollback branch
git checkout -b rollback-turborepo

# Merge back to main branch
git checkout blackmagicprobe
git merge rollback-turborepo

# Verify everything works
pnpm install
pnpm run build
pnpm run dev

# Push
git push origin blackmagicprobe
```

**Recovery time**: ~5 minutes
**Data loss**: None (all changes preserved in `turborepo-migration` branch)

### Partial Rollback (Phase-by-Phase)

#### Rollback Phase 6 (Tool Extractions)

```bash
# Revert tool packages but keep monorepo structure
git revert $(git log --grep="extract.*tools" --format="%H")

# Or cherry-pick specific commits to keep
git log --oneline --grep="extract"
git revert <commit-hash>
```

#### Rollback Phase 5 (CI/CD)

```bash
# Restore old workflow
git restore --source=pre-turborepo-migration .github/workflows/deploy.yml
git commit -m "revert: restore pre-turborepo CI/CD"
```

#### Rollback Phase 3-4 (Packages)

```bash
# Remove packages but keep workspace structure
rm -rf packages/*
git add .
git commit -m "revert: remove extracted packages"

# Restore original components
git restore --source=pre-turborepo-migration apps/web/src/components/tools/
```

#### Rollback Phase 2 (Move to apps/web)

```bash
# Move everything back to root
mv apps/web/* .
rm -rf apps/
git add .
git commit -m "revert: move back from apps/web"
```

#### Rollback Phase 1 (Foundation)

```bash
# Remove Turborepo
pnpm remove -D -w turbo
rm pnpm-workspace.yaml turbo.json tsconfig.base.json
rm -rf apps packages .turbo
git add .
git commit -m "revert: remove Turborepo foundation"
```

### Targeted Rollbacks

#### Fix Broken Tool

If one tool breaks after extraction:

```bash
# Restore old component for that tool only
git restore --source=pre-turborepo-migration apps/web/src/components/tools/SerialTerminal/

# Update page to use old import
# Edit apps/web/src/app/tools/serial-terminal/page.tsx

# Keep package but don't use it yet
# Continue migration for other tools
```

#### Fix Build Issues

If build breaks but code is fine:

```bash
# Clear all caches
pnpm turbo clean
rm -rf .turbo .next node_modules apps/*/node_modules packages/*/node_modules

# Fresh install
pnpm install

# Rebuild
pnpm turbo build
```

### Rollback Decision Matrix

| Issue | Rollback Strategy | Recovery Time |
|-------|------------------|---------------|
| Single tool broken | Restore old component, fix package later | 10-15 min |
| Build fails | Clear caches, fresh install | 5-10 min |
| CI/CD broken | Revert workflow, fix locally first | 15-30 min |
| Multiple packages broken | Rollback Phase 6, fix systematically | 1-2 hours |
| Entire migration broken | Full rollback to tag | 5-10 min |

---

## Migration Gotchas & Common Issues

### Import Path Changes

**Issue**: TypeScript errors about `@/` imports in packages

**Symptoms**:
```
Cannot find module '@/components/Button'
Module not found: Can't resolve '@/lib/utils'
```

**Solution**:
```typescript
// ❌ Wrong (works in Next.js app but not in package)
import { Button } from '@/components/Button';

// ✅ Correct (relative import in package)
import { Button } from './components/Button';

// ✅ Correct (import from another package)
import { Button } from '@battlewithbytes/shared-ui';
```

**Prevention**:
- Use `eslint-plugin-import` to enforce relative imports in packages
- Create a script to validate imports before extraction

### Circular Dependencies

**Issue**: Packages depend on each other creating a cycle

**Symptoms**:
```
pnpm ERR! Circular dependency detected:
  @battlewithbytes/shared-ui -> @battlewithbytes/shared-types -> @battlewithbytes/shared-ui
```

**Solution**:
```bash
# Identify cycles
pnpm turbo build --graph=graph.html
# → Open graph.html, look for cycles

# Break the cycle by:
# 1. Move shared types to more primitive package
# 2. Use dependency injection
# 3. Extract common code to new shared package
```

**Prevention**:
- Keep dependency direction: shared → tools → apps
- Never import from apps/ in packages/
- Document package dependency rules

### Next.js transpilePackages Not Working

**Issue**: Package not being transpiled, causing browser errors

**Symptoms**:
```
Unexpected token 'export'
Module parse failed: Unexpected token
```

**Solution**:
```javascript
// apps/web/next.config.js
const nextConfig = {
  transpilePackages: [
    // ✅ Include all workspace packages
    '@battlewithbytes/battleterm',
    '@battlewithbytes/shared-ui',
    // ✅ Include transitive dependencies if needed
    'some-esm-only-dep',
  ],
};
```

**Alternative**: Configure packages to output both CJS and ESM:
```javascript
// packages/*/package.json
{
  "main": "./dist/index.js",      // CJS
  "module": "./dist/index.mjs",   // ESM
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

### TypeScript Composite Project Errors

**Issue**: TypeScript complains about project references

**Symptoms**:
```
Project references may not form a cycle
Cannot find type definitions for module
```

**Solution**:
```json
// tsconfig.json (root)
{
  "files": [],
  "references": [
    { "path": "./apps/web" },
    { "path": "./packages/battleterm" },
    { "path": "./packages/shared-ui" }
  ]
}

// packages/battleterm/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,  // ✅ Enable composite mode
    "declaration": true,
    "declarationMap": true
  },
  "references": [
    { "path": "../shared-ui" }  // ✅ Reference dependencies
  ]
}
```

### Turborepo Cache Not Working

**Issue**: Build always runs even with no changes

**Symptoms**:
```
pnpm turbo build
# Always shows "cache miss" even for unchanged packages
```

**Solution**:
```json
// turbo.json
{
  "tasks": {
    "build": {
      "outputs": [
        ".next/**",
        "!.next/cache/**",  // ✅ Exclude volatile cache dir
        "dist/**"
      ],
      "inputs": [
        "$TURBO_DEFAULT$",  // ✅ Include default inputs
        "!**/*.test.ts",    // ✅ Exclude test files
        "!**/*.md"          // ✅ Exclude docs
      ]
    }
  }
}
```

**Debug cache issues**:
```bash
# See why cache missed
pnpm turbo build --dry-run=json | jq '.tasks[] | select(.cache.status == "MISS")'

# Force cache hit
pnpm turbo build --force

# Clear cache and rebuild
rm -rf .turbo && pnpm turbo build
```

### Static Export Path Issues

**Issue**: Static export missing files or broken paths

**Symptoms**:
- `/tools/serial-terminal` returns 404
- Assets have wrong path
- `out/` directory incomplete

**Solution**:
```javascript
// apps/web/next.config.js
const nextConfig = {
  output: 'export',

  // ✅ Verify these match your deployment
  basePath: '',
  assetPrefix: '',

  // ✅ Ensure trailing slash handling
  trailingSlash: true,
};
```

**Verify export**:
```bash
cd apps/web
pnpm run build

# Check output
tree out -L 2
# Should see:
# out/
# ├── index.html
# ├── tools/
# │   ├── serial-terminal.html (or serial-terminal/index.html)
# │   └── battlemagic.html
# └── _next/

# Serve locally to test
npx http-server out -p 8080
# → Visit http://localhost:8080
```

### pnpm Workspace Link Issues

**Issue**: Changes to package not reflected in app

**Symptoms**:
- Edit package code, but app still uses old version
- "Module not found" for newly exported symbols

**Solution**:
```bash
# Re-link workspace packages
pnpm install

# If that doesn't work, clear all node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install

# Rebuild packages
pnpm turbo build --force
```

### GitHub Actions Deployment Fails

**Issue**: Workflow succeeds but site doesn't update

**Symptoms**:
- Workflow shows green checkmark
- Site still shows old version
- `apps/web/out` is empty or missing

**Solution**:
```yaml
# .github/workflows/deploy.yml

# ✅ Verify build output exists before upload
- name: Verify build output
  run: |
    if [ ! -d "apps/web/out" ]; then
      echo "Error: apps/web/out not found"
      exit 1
    fi
    ls -la apps/web/out

# ✅ Upload correct directory
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./apps/web/out  # Not ./out !
```

---

## Post-Migration Benefits Summary

### Build Performance

**Before Turborepo (Monolith)**:
- Every change rebuilds entire app (~2m 15s)
- No build cache between runs
- No parallelization
- CI rebuilds everything every time

**After Turborepo (Monorepo)**:
- Only changed packages rebuild
- Intelligent cache reuse (96% faster on cache hit)
- Parallel package builds
- CI caches artifacts across runs
- Incremental builds by default

**Real-World Example**:
```bash
# Change one line in BattleTerm component
# Before: 2m 15s full rebuild
# After:  15s (rebuild BattleTerm + apps/web)

# Change shared-ui Button component
# Before: 2m 15s full rebuild
# After:  45s (rebuild shared-ui, battleterm, ucan, apps/web)

# No changes (CI rebuild)
# Before: 2m 15s
# After:  5s (full cache hit)
```

### Developer Experience

**Package Isolation**:
- Each tool is independently testable
- Clear dependency boundaries
- Easier to reason about code
- Faster unit tests (only test changed package)

**Parallel Development**:
```bash
# Run multiple dev servers simultaneously
pnpm turbo dev --parallel

# Work on BattleTerm while BattleMagic builds
pnpm turbo dev --filter=battleterm --filter=web &
pnpm turbo build --filter=battlemagic
```

**Easier Onboarding**:
- New contributors can work on single package
- Clear package boundaries
- Self-documenting structure

### Tool Reusability

**Electron Apps**:
```bash
# Create desktop app from any tool package
mkdir apps/electron-battleterm
cd apps/electron-battleterm

# Just import the package!
import SerialTerminal from '@battlewithbytes/battleterm';
```

**Standalone NPM Packages**:
```bash
# Publish individual tools to npm
cd packages/battleterm
npm publish --access public

# Others can use your tool
npm install @battlewithbytes/battleterm
```

**Embed in Other Projects**:
```bash
# Use in another Next.js project
pnpm add @battlewithbytes/battleterm

# Use in vanilla React
import { SerialTerminal } from '@battlewithbytes/battleterm';
```

### Maintenance & Scalability

**Dependency Management**:
- Shared dependencies in shared packages
- Tool-specific deps in tool packages
- Clear dependency graph
- Easier to update dependencies incrementally

**Testing**:
```bash
# Test only changed packages
pnpm turbo test --filter=...[HEAD^]

# Test specific tool
pnpm turbo test --filter=battleterm

# Test everything
pnpm turbo test
```

**Code Sharing**:
- Extract common patterns to shared packages
- Enforce consistent patterns through shared-ui
- Share types through shared-types
- Reduce code duplication

---

## Migration Checklist

### Pre-Migration (Phase 0)
- [ ] Create `turborepo-migration` branch
- [ ] Create backup tag: `pre-turborepo-migration`
- [ ] Clean build succeeds
- [ ] Record baseline build time
- [ ] All tests pass

### Foundation (Phase 1)
- [ ] Install `turbo` package
- [ ] Create `pnpm-workspace.yaml`
- [ ] Create root `package.json`
- [ ] Create `turbo.json`
- [ ] Create `tsconfig.base.json`
- [ ] Update `.gitignore`
- [ ] Create `apps/` and `packages/` directories
- [ ] Commit: "feat: add Turborepo foundation configuration"

### Move to apps/web (Phase 2)
- [ ] Create `apps/web/package.json`
- [ ] Move `src/`, `public/`, `scripts/` to `apps/web/`
- [ ] Move config files to `apps/web/`
- [ ] Create `apps/web/tsconfig.json`
- [ ] Run `pnpm install`
- [ ] Test build: `cd apps/web && pnpm run build`
- [ ] Test dev: `cd apps/web && pnpm run dev`
- [ ] Test Turbo: `pnpm turbo build`
- [ ] Clean up root directory
- [ ] Commit: "feat: migrate Next.js app to apps/web monorepo structure"

### Extract BattleTerm (Phase 3)
- [ ] Create `packages/battleterm/` structure
- [ ] Create package.json with tsup
- [ ] Move SerialTerminal components
- [ ] Update imports to relative paths
- [ ] Create public API exports
- [ ] Build package: `cd packages/battleterm && pnpm run build`
- [ ] Add package to `apps/web/package.json`
- [ ] Configure `transpilePackages` in `next.config.js`
- [ ] Update serial-terminal page to import from package
- [ ] Test: `pnpm turbo build && cd apps/web && pnpm run dev`
- [ ] Verify BattleTerm works
- [ ] Commit: "feat: extract BattleTerm into standalone package"

### Create Shared Packages (Phase 4)
- [ ] Create `packages/shared-types/`
- [ ] Create `packages/shared-ui/`
- [ ] Create `packages/shared-utils/`
- [ ] Build all shared packages
- [ ] Update battleterm to use shared packages
- [ ] Update apps/web to use shared packages
- [ ] Configure transpilePackages for shared packages
- [ ] Test: `pnpm turbo build`
- [ ] Commit: "feat: create shared packages for common code"

### Update CI/CD (Phase 5)
- [ ] Update `.github/workflows/deploy.yml` for monorepo
- [ ] Add Turborepo cache to workflow
- [ ] Update artifact path to `apps/web/out`
- [ ] Create `.github/workflows/test-build.yml`
- [ ] Push and test workflow
- [ ] Verify workflow passes
- [ ] Commit: "feat: update CI/CD pipeline for Turborepo monorepo"

### Extract Remaining Tools (Phase 6)
- [ ] Extract BattleMagic (`packages/battlemagic/`)
- [ ] Extract uCAN (`packages/ucan/`)
- [ ] Extract calculators (`packages/calculators/`)
- [ ] Update all tool pages to import from packages
- [ ] Update `transpilePackages` for all tools
- [ ] Remove old component directories
- [ ] Test all tools work
- [ ] Test production build
- [ ] Commit: "feat: extract all tools into standalone packages"

### Final Validation
- [ ] Clean build from scratch: `pnpm turbo clean && pnpm install && pnpm turbo build`
- [ ] All tools work in dev mode
- [ ] Production build succeeds
- [ ] Static export generates correctly
- [ ] All tests pass: `pnpm turbo test`
- [ ] No TypeScript errors: `pnpm turbo type-check`
- [ ] No linting errors: `pnpm turbo lint`
- [ ] GitHub Actions workflow passes
- [ ] Deployment to GitHub Pages works
- [ ] Site loads correctly on production URL

### Merge to Master
- [ ] Create pull request: `turborepo-migration` → `master`
- [ ] Request code review
- [ ] Address feedback
- [ ] Ensure CI passes
- [ ] Merge pull request
- [ ] Monitor deployment
- [ ] Verify production site works
- [ ] Delete migration branch (optional, or keep for reference)

---

## Next Steps After Migration

### 1. Optimize Turborepo Configuration
- [ ] Set up remote caching (Vercel)
- [ ] Fine-tune cache inputs/outputs
- [ ] Add more granular tasks
- [ ] Create task dependencies

### 2. Create Electron Apps
- [ ] Create `apps/electron-battleterm/`
- [ ] Configure electron-builder
- [ ] Set up code signing
- [ ] Create installers for Windows/Mac/Linux

### 3. Publish Packages to NPM
- [ ] Set up npm organization: `@battlewithbytes`
- [ ] Add npm publish scripts
- [ ] Create README for each package
- [ ] Publish initial versions

### 4. Improve Developer Experience
- [ ] Add VS Code workspace configuration
- [ ] Create debug configurations
- [ ] Add pre-commit hooks (lint-staged + husky)
- [ ] Set up Changesets for versioning

### 5. Documentation
- [ ] Create CONTRIBUTING.md
- [ ] Document package architecture
- [ ] Add examples for each package
- [ ] Create API documentation

### 6. Advanced Features
- [ ] Set up Storybook for component development
- [ ] Add visual regression testing
- [ ] Implement E2E tests with Playwright
- [ ] Set up bundle size tracking

---

## Resources & References

### Official Documentation
- **Turborepo**: https://turbo.build/repo/docs
- **pnpm Workspaces**: https://pnpm.io/workspaces
- **Next.js + Turborepo**: https://turbo.build/repo/docs/getting-started/existing-monorepo
- **TypeScript Project References**: https://www.typescriptlang.org/docs/handbook/project-references.html

### Example Repositories
- **Vercel Turborepo Examples**: https://github.com/vercel/turbo/tree/main/examples
- **Next.js Monorepo**: https://github.com/vercel/next.js/tree/canary/packages
- **tRPC Monorepo**: https://github.com/trpc/trpc

### Community Resources
- **Turborepo Discord**: https://turbore.build/discord
- **Turborepo GitHub Discussions**: https://github.com/vercel/turbo/discussions

### Migration Tools
- **codemod**: Automate import path changes
- **jscodeshift**: Write custom transforms
- **turborepo-migrate**: Official migration tool (if available)

---

## Support & Troubleshooting

If you encounter issues during migration:

1. **Check this document** for common issues and solutions
2. **Review Turborepo logs**: `pnpm turbo build --verbosity=2`
3. **Check package builds**: `pnpm turbo build --dry-run=json`
4. **Verify workspace links**: `pnpm list -r --depth=0`
5. **Clear caches**: `pnpm turbo clean && rm -rf .turbo node_modules`

For persistent issues:
- Check GitHub Issues for similar problems
- Ask in Turborepo Discord
- Review package build outputs
- Use rollback strategies above

---

## Conclusion

This migration plan transforms your Next.js monolith into a well-structured, performant Turborepo monorepo. The incremental approach ensures you can:

- ✅ Continue working on the site during migration
- ✅ Test each phase independently
- ✅ Rollback specific phases if needed
- ✅ Maintain zero downtime for GitHub Pages deployment

**Expected Timeline**:
- Phase 0-1: 1 hour (foundation)
- Phase 2: 2 hours (move to apps/web)
- Phase 3: 3 hours (extract BattleTerm)
- Phase 4: 2 hours (shared packages)
- Phase 5: 1 hour (CI/CD)
- Phase 6: 6 hours (remaining tools)

**Total**: ~15 hours spread across multiple sessions

**Post-Migration Benefits**:
- 96% faster cached builds
- 77% faster incremental builds
- Isolated, reusable packages
- Easy Electron app creation
- Better developer experience
- Scalable architecture

Good luck with your migration! Remember: take it one phase at a time, commit frequently, and test thoroughly at each step.
