/**
 * Example usage of Arduino Package Index Parser
 *
 * This file demonstrates how to use the Arduino parser to fetch,
 * parse, and transform Arduino package indices.
 */

import {
  ArduinoIndexParser,
  ARDUINO_INDEX_URLS,
  BoardsToFamilyTransformer,
} from "./index";

/**
 * Example 1: Fetch and parse ESP32 index
 */
export async function exampleFetchESP32() {
  console.log("Fetching ESP32 package index...");

  const result = await ArduinoIndexParser.fetchAndParse(
    ARDUINO_INDEX_URLS.esp32,
  );

  console.log(`Total platforms: ${result.totalPlatforms}`);
  console.log(`Parsed platforms: ${result.parsedPlatforms}`);
  console.log(`Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.error("Parsing errors:");
    result.errors.forEach((error) => {
      console.error(`  - ${error.message}`);
    });
  }

  // Show platforms
  for (const platform of result.platforms.slice(0, 3)) {
    console.log(`\n${platform.platformName} v${platform.version}`);
    console.log(`  Package: ${platform.packageName}`);
    console.log(`  Architecture: ${platform.cpuArchitecture}`);
    console.log(`  Boards: ${platform.boards.length}`);
    console.log(`  Maintainer: ${platform.maintainer}`);
  }

  return result;
}

/**
 * Example 2: Get latest platforms only
 */
export async function exampleGetLatest() {
  const result = await ArduinoIndexParser.fetchAndParse(
    ARDUINO_INDEX_URLS.esp32,
  );

  const latest = ArduinoIndexParser.getLatestPlatforms(result.platforms);

  console.log("\nLatest platforms:");
  for (const platform of latest) {
    console.log(
      `  ${platform.architecture} v${platform.version} - ${platform.boards.length} boards`,
    );
  }

  return latest;
}

/**
 * Example 3: Filter by architecture
 */
export async function exampleFilterArchitecture() {
  const result = await ArduinoIndexParser.fetchAndParse(
    ARDUINO_INDEX_URLS.esp32,
  );

  const esp32s3 = ArduinoIndexParser.filterByArchitecture(result.platforms, [
    "esp32s3",
  ]);

  console.log(`\nFound ${esp32s3.length} ESP32-S3 platforms`);
  for (const platform of esp32s3) {
    console.log(`  v${platform.version} - ${platform.boards.length} boards`);
  }

  return esp32s3;
}

/**
 * Example 4: Transform to PlatformFamily
 */
export async function exampleTransformToFamily() {
  const result = await ArduinoIndexParser.fetchAndParse(
    ARDUINO_INDEX_URLS.esp32,
  );

  const latest = ArduinoIndexParser.getLatestPlatforms(result.platforms);
  const families = BoardsToFamilyTransformer.transformMany(latest);

  console.log(`\nTransformed ${families.length} platform families`);

  for (const family of families) {
    console.log(`\n${family.name} (${family.architecture})`);
    console.log(`  Devices: ${family.devices.length}`);
    console.log(
      `  Frameworks: ${family.frameworks?.map((f) => f.frameworkId).join(", ")}`,
    );

    // Show first device
    if (family.devices.length > 0) {
      const device = family.devices[0];
      console.log(`  Example device: ${device.name}`);
      console.log(`    Flash: ${device.flash / 1024}KB`);
      console.log(`    RAM: ${device.ram / 1024}KB`);
      console.log(`    Linker: ${device.linkerScript}`);
    }
  }

  return families;
}

/**
 * Example 5: Group and merge platforms
 */
export async function exampleGroupAndMerge() {
  const result = await ArduinoIndexParser.fetchAndParse(
    ARDUINO_INDEX_URLS.esp32,
  );

  const merged = BoardsToFamilyTransformer.groupAndMerge(result.platforms);

  console.log(`\nMerged into ${merged.length} unique families`);

  for (const family of merged) {
    console.log(`\n${family.name}`);
    console.log(`  ID: ${family.id}`);
    console.log(`  Architecture: ${family.architecture}`);
    console.log(`  Devices: ${family.devices.length}`);

    // List all devices
    for (const device of family.devices.slice(0, 5)) {
      console.log(
        `    - ${device.name} (${device.flash / 1024}KB flash, ${device.ram / 1024}KB RAM)`,
      );
    }
    if (family.devices.length > 5) {
      console.log(`    ... and ${family.devices.length - 5} more`);
    }
  }

  return merged;
}

/**
 * Example 6: Search platforms
 */
export async function exampleSearch() {
  const result = await ArduinoIndexParser.fetchAndParse(
    ARDUINO_INDEX_URLS.esp32,
  );

  const query = "S3";
  const found = ArduinoIndexParser.search(result.platforms, query);

  console.log(`\nSearch results for "${query}":`);
  for (const platform of found) {
    console.log(`  ${platform.platformName} v${platform.version}`);
    console.log(`    ${platform.boards.length} boards`);
  }

  return found;
}

/**
 * Example 7: Compare RP2040 platforms
 */
export async function exampleRP2040() {
  console.log("\nFetching RP2040 package index...");

  const result = await ArduinoIndexParser.fetchAndParse(
    ARDUINO_INDEX_URLS.rp2040,
  );

  if (result.platforms.length > 0) {
    const platform = result.platforms[0];
    console.log(`Platform: ${platform.platformName} v${platform.version}`);
    console.log(`Architecture: ${platform.cpuArchitecture}`);
    console.log(`Boards: ${platform.boards.length}`);

    // Transform to family
    const family = BoardsToFamilyTransformer.transform(platform);
    if (family) {
      console.log(`\nTransformed to family: ${family.name}`);
      console.log(`  Architecture: ${family.architecture}`);
      console.log(`  Compiler flags: ${family.compilerFlags.join(" ")}`);

      // Show frameworks
      for (const fw of family.frameworks || []) {
        console.log(`\n  Framework: ${fw.framework.name}`);
        console.log(`    Version: ${fw.version}`);
        console.log(
          `    Defines: ${fw.framework.defines.slice(0, 3).join(", ")}...`,
        );
      }
    }
  }

  return result;
}

/**
 * Example 8: Multiple package indices
 */
export async function exampleMultipleIndices() {
  console.log("\nFetching multiple package indices...");

  const indices = [
    { name: "ESP32", url: ARDUINO_INDEX_URLS.esp32 },
    { name: "RP2040", url: ARDUINO_INDEX_URLS.rp2040 },
    // Add more as needed
  ];

  const allPlatforms = [];

  for (const { name, url } of indices) {
    console.log(`\nFetching ${name}...`);
    const result = await ArduinoIndexParser.fetchAndParse(url);
    console.log(
      `  Parsed: ${result.parsedPlatforms} platforms, ${result.errors.length} errors`,
    );
    allPlatforms.push(...result.platforms);
  }

  console.log(`\nTotal platforms collected: ${allPlatforms.length}`);

  // Get latest of each
  const latest = ArduinoIndexParser.getLatestPlatforms(allPlatforms);
  console.log(`Latest unique platforms: ${latest.length}`);

  // Transform all
  const families = BoardsToFamilyTransformer.transformMany(latest);
  console.log(`Transformed to ${families.length} platform families`);

  return families;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  try {
    await exampleFetchESP32();
    await exampleGetLatest();
    await exampleFilterArchitecture();
    await exampleTransformToFamily();
    await exampleGroupAndMerge();
    await exampleSearch();
    await exampleRP2040();
    await exampleMultipleIndices();
  } catch (error) {
    console.error("Error running examples:", error);
  }
}

// Uncomment to run examples:
// runAllExamples();
