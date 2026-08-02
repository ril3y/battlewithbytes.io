#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

// Default ports for each app
const APP_PORTS = {
  web: 5555,
  battleterm: 5564,
  ucan: 5565,
  battleforge: 5566,
  battlemagic: 5567,
  "mosfet-calculator": 5561,
  "ohms-law-calculator": 5562,

};

// App groups for convenience
const APP_GROUPS = {
  tools: [
    "mosfet-calculator",
    "ohms-law-calculator",

    "battleterm",
    "ucan",
    "battleforge",
    "battlemagic",
  ],
  calculators: ["mosfet-calculator", "ohms-law-calculator"],
  engineering: ["battleterm", "ucan", "battleforge", "battlemagic"],
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    apps: [],
    exclude: [],
    group: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg === "--list" || arg === "-l") {
      listApps();
      process.exit(0);
    } else if (arg === "--apps" || arg === "-a") {
      // Next arg should be comma-separated list of apps
      const appList = args[++i];
      if (appList) {
        options.apps = appList.split(",").map((s) => s.trim());
      }
    } else if (arg === "--exclude" || arg === "-e") {
      // Next arg should be comma-separated list of apps to exclude
      const excludeList = args[++i];
      if (excludeList) {
        options.exclude = excludeList.split(",").map((s) => s.trim());
      }
    } else if (arg === "--group" || arg === "-g") {
      options.group = args[++i];
    } else if (!arg.startsWith("-")) {
      // Positional arguments are app names
      options.apps.push(arg);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage: node scripts/dev-all.js [apps...] [options]

Run multiple apps concurrently in development mode.

Arguments:
  apps...                Specific apps to run (e.g., web battleterm ucan)

Options:
  -a, --apps <list>      Comma-separated list of apps to run
  -e, --exclude <list>   Comma-separated list of apps to exclude
  -g, --group <name>     Run a predefined group of apps
  -l, --list             List all available apps and groups
  -h, --help             Show this help message

Examples:
  node scripts/dev-all.js                    # Run all apps
  node scripts/dev-all.js web battleterm     # Run specific apps
  node scripts/dev-all.js --exclude web      # Run all except web
  node scripts/dev-all.js --group tools      # Run all tools (excluding web)
  node scripts/dev-all.js -a web,ucan        # Run web and ucan

Available apps:`);

  Object.entries(APP_PORTS).forEach(([app, port]) => {
    console.log(`  ${app.padEnd(25)} (port ${port})`);
  });

  console.log(`\nAvailable groups:`);
  Object.entries(APP_GROUPS).forEach(([group, apps]) => {
    console.log(`  ${group.padEnd(25)} [${apps.join(", ")}]`);
  });
}

function listApps() {
  console.log("\n┌─────────────────────────────────────────────────┐");
  console.log("│  BattleWithBytes.io Development Apps           │");
  console.log("├─────────────────────────────────────────────────┤");
  console.log("│  App                       Port                │");
  console.log("├─────────────────────────────────────────────────┤");

  Object.entries(APP_PORTS).forEach(([app, port]) => {
    const appDisplay = app.padEnd(25);
    const portDisplay = port.toString().padStart(4);
    console.log(`│  ${appDisplay} ${portDisplay}               │`);
  });

  console.log("└─────────────────────────────────────────────────┘");

  console.log("\n┌─────────────────────────────────────────────────┐");
  console.log("│  App Groups                                     │");
  console.log("└─────────────────────────────────────────────────┘");

  Object.entries(APP_GROUPS).forEach(([group, apps]) => {
    console.log(`\n  ${group}:`);
    apps.forEach((app) => {
      console.log(`    - ${app} (${APP_PORTS[app]})`);
    });
  });

  console.log("");
}

function getAppsToRun(options) {
  let apps = [];

  if (options.group) {
    if (!APP_GROUPS[options.group]) {
      console.error(`Error: Unknown group "${options.group}"`);
      console.log("\nAvailable groups:");
      Object.keys(APP_GROUPS).forEach((g) => console.log(`  - ${g}`));
      process.exit(1);
    }
    apps = [...APP_GROUPS[options.group]];
  } else if (options.apps.length > 0) {
    apps = [...options.apps];
  } else {
    // Default: run all apps
    apps = Object.keys(APP_PORTS);
  }

  // Apply exclusions
  if (options.exclude.length > 0) {
    apps = apps.filter((app) => !options.exclude.includes(app));
  }

  // Validate all apps exist
  const invalidApps = apps.filter((app) => !APP_PORTS[app]);
  if (invalidApps.length > 0) {
    console.error(`Error: Unknown app(s): ${invalidApps.join(", ")}`);
    console.log("\nAvailable apps:");
    Object.keys(APP_PORTS).forEach((app) => console.log(`  - ${app}`));
    process.exit(1);
  }

  return apps;
}

function buildTurboFilter(apps) {
  // Build turbo filter string
  const filters = apps.map((app) => {
    // Map app name to package name
    const packageName = `@battlewithbytes/${app === "web" ? "web" : app === "battleterm" ? "battleterm-app" : app}`;
    return `--filter=${packageName}`;
  });

  return filters;
}

function printSummary(apps) {
  console.log("\n┌─────────────────────────────────────────────────┐");
  console.log("│  Starting Development Servers                   │");
  console.log("└─────────────────────────────────────────────────┘\n");

  apps.forEach((app) => {
    const port = APP_PORTS[app];
    console.log(`  ✓ ${app.padEnd(25)} → http://localhost:${port}`);
  });

  console.log("\n  Press Ctrl+C to stop all servers\n");
  console.log("─".repeat(53) + "\n");
}

function main() {
  const options = parseArgs();
  const apps = getAppsToRun(options);

  if (apps.length === 0) {
    console.error("Error: No apps to run");
    process.exit(1);
  }

  printSummary(apps);

  // Build the turbo command with filters
  const filters = buildTurboFilter(apps);
  const args = ["run", "dev", ...filters];

  // Start turbo with all filters
  const child = spawn("turbo", args, {
    cwd: path.join(__dirname, ".."),
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

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log("\n\nStopping all development servers...");
    child.kill("SIGINT");
  });
}

main();
