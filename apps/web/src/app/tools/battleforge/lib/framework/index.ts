/**
 * Framework Module
 *
 * Lazy-loading and caching for framework core files (Arduino, Mbed, etc.)
 */

export { FrameworkCache } from "./FrameworkCache";
export {
  FrameworkManager,
  frameworkManager,
  clearCachedFramework,
  hasCachedFramework,
  type LoadFrameworkProgress,
} from "./FrameworkManager";
