#!/bin/bash
# Test CI build locally using Docker to simulate Ubuntu environment

set -e

echo "=== Testing CI Build Locally ==="
echo "This simulates the GitHub Actions Ubuntu environment"
echo ""

# Use Ubuntu 24.04 to match CI
MSYS_NO_PATHCONV=1 docker run --rm -v "X:/battlewithbytes.io:/repo" -w /repo ubuntu:24.04 bash -c '
set -e

echo "Installing system dependencies..."
apt-get update -qq
apt-get install -y curl git build-essential

echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "Installing Rust..."
curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown

echo "Installing wasm-pack..."
cargo install wasm-pack

echo "Installing pnpm..."
npm install -g pnpm@9.14.4

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Running lint..."
pnpm run lint

echo "Running build..."
pnpm run build

echo ""
echo "=== ✅ SUCCESS - All CI steps passed locally ==="
'
