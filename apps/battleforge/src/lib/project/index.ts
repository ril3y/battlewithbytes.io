/**
 * Project Infrastructure Module
 *
 * Exports all project-related types, storage, and templates.
 */

export * from "./types";
export * from "./ProjectStorage";
// Templates are now loaded from data/boards/templates/ via TemplateLoader
export * from "./TemplateLoader";
export * from "./ProjectConfig";
