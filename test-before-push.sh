#!/bin/bash
# Quick local CI check before pushing to master
# This runs the same commands as CI but using your local environment

set -e

echo "=== Pre-Push CI Check ==="
echo ""

# Only test if on master or about to merge to master
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

echo "Running lint..."
pnpm run lint
echo "✅ Lint passed"
echo ""

echo "Running build..."
pnpm run build
echo "✅ Build passed"
echo ""

echo "=== ✅ All checks passed! Safe to push to master ==="
