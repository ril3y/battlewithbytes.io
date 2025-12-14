# Setting Up Rust/WASM Development Environment

## Prerequisites

To build the BattleMagic WASM core, you need:

### 1. Rust Toolchain

**Windows (recommended):**
Download and run: https://rustup.rs/
Or use winget:

```powershell
winget install Rustlang.Rustup
```

**Linux/macOS:**

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Verify installation:**

```bash
rustc --version
cargo --version
```

### 2. WASM Target

Add the WASM compilation target:

```bash
rustup target add wasm32-unknown-unknown
```

### 3. wasm-pack

Install the WASM build tool:

```bash
cargo install wasm-pack
```

**Verify:**

```bash
wasm-pack --version
```

## First Build

Once tools are installed:

```bash
# Navigate to the WASM package
cd packages/battlemagic-core

# Build in development mode (faster)
pnpm build:dev

# Or production mode (optimized)
pnpm build
```

**Expected output:**

```
packages/battlemagic-core/pkg/
├── battlemagic_core.js        # JavaScript wrapper
├── battlemagic_core.d.ts      # TypeScript definitions
├── battlemagic_core_bg.wasm   # WebAssembly binary
└── package.json               # Package metadata
```

## Building the Entire Monorepo

From the root directory:

```bash
# Install all dependencies (including the WASM package)
pnpm install

# Build everything with Turborepo
pnpm turbo build

# Run dev servers
pnpm turbo dev
```

## Troubleshooting

### "rustc: command not found"

- Restart your terminal after installing Rust
- Ensure `~/.cargo/bin` is in your PATH
- On Windows, may need to restart VS Code

### "wasm32-unknown-unknown target not found"

```bash
rustup target add wasm32-unknown-unknown
```

### "wasm-pack not found"

```bash
cargo install wasm-pack
# Wait for installation, then restart terminal
```

### Build errors in Rust code

```bash
# Update Rust to latest stable
rustup update stable

# Check for common issues
cargo check

# See detailed errors
cargo build --verbose
```

### WASM doesn't load in Next.js

- Ensure you ran `pnpm install` from root after building WASM
- Check that `packages/battlemagic-core/pkg/` directory exists
- Clear Next.js cache: `rm -rf apps/web/.next`

## Quick Start (Summary)

```bash
# 1. Install Rust (one-time setup)
# Windows: https://rustup.rs/
# macOS/Linux: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Add WASM target
rustup target add wasm32-unknown-unknown

# 3. Install wasm-pack
cargo install wasm-pack

# 4. Build WASM package
cd packages/battlemagic-core
pnpm build

# 5. Install dependencies
cd ../..
pnpm install

# 6. Build everything
pnpm turbo build

# 7. Run dev server
pnpm turbo dev
```

## Development Tips

**Fast iterations:**

```bash
# In one terminal: watch Rust files and rebuild
cd packages/battlemagic-core
cargo watch -s "pnpm build:dev"

# In another: run Next.js dev server
cd apps/web
pnpm dev
```

**Check WASM size:**

```bash
cd packages/battlemagic-core
pnpm build
ls -lh pkg/*.wasm
```

**Rust linting:**

```bash
cargo clippy      # Linter
cargo fmt         # Formatter
cargo test        # Run tests
```

## Next Steps

After setup is complete, see `TURBOREPO_RUST_WASM_PHASE1_SUMMARY.md` for architecture details and next development steps.
