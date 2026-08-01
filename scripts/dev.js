#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Default ports for each app
const DEFAULT_PORTS = {
  web: 5555,
  "mosfet-calculator": 5561,
  "ohms-law-calculator": 5562,

  battleterm: 5564,
  ucan: 5565,
  battleforge: 5566,
  battlemagic: 5567,
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { app: null, port: null };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--app" || arg === "-a") {
      options.app = args[++i];
    } else if (arg === "--port" || arg === "-p") {
      options.port = parseInt(args[++i], 10);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg === "--list" || arg === "-l") {
      listApps();
      process.exit(0);
    } else if (!arg.startsWith("-")) {
      // Positional argument - treat as app name
      options.app = arg;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage: node scripts/dev.js [app] [options]

Start a development server for a specific app.

Arguments:
  app                    App name to run (e.g., battleterm, ucan, web)

Options:
  -a, --app <name>       App name to run
  -p, --port <number>    Port to run on (overrides default)
  -l, --list             List all available apps and their default ports
  -h, --help             Show this help message

Examples:
  node scripts/dev.js battleterm
  node scripts/dev.js --app ucan --port 3000
  node scripts/dev.js web -p 5555

Available apps:`);

  Object.entries(DEFAULT_PORTS).forEach(([app, port]) => {
    console.log(`  ${app.padEnd(20)} (default port: ${port})`);
  });
}

function listApps() {
  console.log("\nAvailable apps:\n");
  console.log("  App                  Default Port");
  console.log("  " + "-".repeat(35));
  Object.entries(DEFAULT_PORTS).forEach(([app, port]) => {
    console.log(`  ${app.padEnd(20)} ${port}`);
  });
  console.log("");
}

function main() {
  const options = parseArgs();

  if (!options.app) {
    console.error("Error: No app specified.\n");
    printHelp();
    process.exit(1);
  }

  const appName = options.app;
  const appsDir = path.join(__dirname, "..", "apps");
  const appPath = path.join(appsDir, appName);

  // Check if app exists
  if (!fs.existsSync(appPath)) {
    console.error(`Error: App "${appName}" not found in apps/`);
    console.log("\nAvailable apps:");
    Object.keys(DEFAULT_PORTS).forEach((app) => console.log(`  - ${app}`));
    process.exit(1);
  }

  // Determine port
  const port = options.port || DEFAULT_PORTS[appName] || 3000;

  console.log(`\nStarting ${appName} on port ${port}...\n`);

  // Start the dev server
  const child = spawn("pnpm", ["dev", "-p", port.toString()], {
    cwd: appPath,
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error(`Failed to start: ${err.message}`);
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

main();
