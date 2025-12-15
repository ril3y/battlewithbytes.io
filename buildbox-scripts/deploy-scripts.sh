#!/bin/bash
#
# Deploy build scripts to the buildbox
# Run from the project root on your local machine
#
# Usage: ./buildbox-scripts/deploy-scripts.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILDBOX_HOST="${BUILDBOX_HOST:-builder@192.168.1.62}"
SSH_KEY="${SSH_KEY:-${HOME}/.ssh/buildbox_key}"

echo "Deploying build scripts to ${BUILDBOX_HOST}..."

# Check if SSH key exists
if [ -f "${SSH_KEY}" ]; then
    SSH_CMD="ssh -i ${SSH_KEY}"
    SCP_CMD="scp -i ${SSH_KEY}"
else
    echo "SSH key not found at ${SSH_KEY}, using default SSH"
    SSH_CMD="ssh"
    SCP_CMD="scp"
fi

# Copy scripts
echo "Copying build scripts..."
${SCP_CMD} "${SCRIPT_DIR}/build-clang-riscv.sh" "${BUILDBOX_HOST}:~/"
${SCP_CMD} "${SCRIPT_DIR}/build-clang-xtensa.sh" "${BUILDBOX_HOST}:~/"
${SCP_CMD} "${SCRIPT_DIR}/setup-buildbox.sh" "${BUILDBOX_HOST}:~/"

# Make executable
echo "Setting permissions..."
${SSH_CMD} "${BUILDBOX_HOST}" "chmod +x ~/build-clang-*.sh ~/setup-buildbox.sh"

echo ""
echo "Scripts deployed successfully!"
echo ""
echo "Available commands on buildbox:"
echo "  ${SSH_CMD} ${BUILDBOX_HOST}"
echo "  ./setup-buildbox.sh    # Run once to set up environment"
echo "  ./build-clang-riscv.sh # Build RISC-V backend"
echo "  ./build-clang-xtensa.sh # Build Xtensa backend"
echo ""
echo "To retrieve built files:"
echo "  ${SCP_CMD} ${BUILDBOX_HOST}:~/clang-wasm-builds/output/clang-riscv.wasm.gz ."
echo "  ${SCP_CMD} ${BUILDBOX_HOST}:~/clang-wasm-builds/output/clang-xtensa.wasm.gz ."
