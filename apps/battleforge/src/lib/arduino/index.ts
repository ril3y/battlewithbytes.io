/**
 * Arduino Package Index Parser
 *
 * Utilities for parsing Arduino package_index.json files and converting
 * Arduino board definitions to BattleForge PlatformFamily format.
 *
 * @example
 * ```typescript
 * import { ArduinoIndexParser, ARDUINO_INDEX_URLS } from './arduino';
 *
 * // Fetch and parse ESP32 index
 * const result = await ArduinoIndexParser.fetchAndParse(
 *   ARDUINO_INDEX_URLS.esp32
 * );
 *
 * // Get latest platforms only
 * const latest = ArduinoIndexParser.getLatestPlatforms(result.platforms);
 *
 * // Transform to PlatformFamily format
 * const families = BoardsToFamilyTransformer.transformMany(latest);
 * ```
 */

export * from "./types";
export * from "./ArduinoIndexParser";
export * from "./BoardsToFamily";
