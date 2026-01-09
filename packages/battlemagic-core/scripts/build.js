const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m"
};

console.log(`${colors.cyan}Building BattleMagic WASM core...${colors.reset}`);

// Check for wasm-pack
try {
    execSync('wasm-pack --version', { stdio: 'ignore' });
} catch (e) {
    console.error(`${colors.red}Error: wasm-pack not found!${colors.reset}`);
    console.error("Install it with: cargo install wasm-pack");
    process.exit(1);
}

const args = process.argv.slice(2);
const isDev = args.includes('--dev');

const cmd = isDev
    ? 'wasm-pack build --target web --out-dir pkg --dev'
    : 'wasm-pack build --target web --out-dir pkg --release';

console.log(isDev ? "Building in development mode..." : "Building in release mode...");

try {
    execSync(cmd, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    console.log(`${colors.green}WASM build complete! Output in pkg/${colors.reset}`);
} catch (error) {
    console.error(`${colors.red}Build failed!${colors.reset}`);
    process.exit(1);
}
