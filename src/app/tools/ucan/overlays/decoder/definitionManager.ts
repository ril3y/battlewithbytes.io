/**
 * CAN Definition Manager
 *
 * Manages loading, validation, and storage of CAN definition files.
 * Supports both built-in definitions and user-uploaded files.
 */

import type { CANDefinitionFile, MessageDefinition } from '../types';

// Built-in definitions will be imported here
import golfCartDefinition from '../definitions/golf-cart.json';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Definition metadata for listing
 */
export interface DefinitionMetadata {
  id: string;
  name: string;
  description?: string;
  author?: string;
  source: 'builtin' | 'uploaded';
  messageCount: number;
  widgetCount: number;
  layoutCount: number;
}

/**
 * Validate CAN ID format
 */
function validateCANId(id: string): boolean {
  // Accept formats: 0x123, 0X123, 123 (will be normalized)
  const hexPattern = /^(0x)?[0-9A-Fa-f]+$/;
  if (!hexPattern.test(id)) {
    return false;
  }

  // Parse and check range
  const numericId = parseInt(id.replace('0x', '').replace('0X', ''), 16);

  // Standard 11-bit (0x000-0x7FF) or Extended 29-bit (0x00000000-0x1FFFFFFF)
  if (numericId < 0 || numericId > 0x1fffffff) {
    return false;
  }

  return true;
}

/**
 * Validate field definition
 */
function validateField(
  field: unknown,
  errors: string[],
  warnings: string[],
  messageId: string
): void {
  // Type guard
  if (typeof field !== 'object' || field === null) {
    errors.push(`Invalid field in message ${messageId}`);
    return;
  }

  const f = field as Record<string, unknown>;
  const fieldContext = `Field "${f.name}" in message ${messageId}`;

  // Required properties
  if (!f.name || typeof f.name !== 'string') {
    errors.push(`${fieldContext}: missing or invalid "name"`);
  }

  if (typeof f.byteOffset !== 'number' || f.byteOffset < 0 || f.byteOffset > 7) {
    errors.push(`${fieldContext}: "byteOffset" must be 0-7`);
  }

  if (typeof f.bitOffset !== 'number' || f.bitOffset < 0 || f.bitOffset > 7) {
    errors.push(`${fieldContext}: "bitOffset" must be 0-7`);
  }

  if (typeof f.bitLength !== 'number' || f.bitLength < 1 || f.bitLength > 64) {
    errors.push(`${fieldContext}: "bitLength" must be 1-64`);
  }

  // Validate type
  const validTypes = ['boolean', 'uint', 'int', 'float', 'enum', 'raw'];
  if (!validTypes.includes(f.type as string)) {
    errors.push(`${fieldContext}: invalid type "${f.type}"`);
  }

  // Type-specific validation
  if (f.type === 'float' && f.bitLength !== 32) {
    errors.push(`${fieldContext}: float type requires bitLength=32`);
  }

  if (f.type === 'enum' && (!f.enumValues || !Array.isArray(f.enumValues))) {
    errors.push(`${fieldContext}: enum type requires "enumValues" array`);
  }

  // Validate byte order
  if (f.byteOrder && !['little', 'big'].includes(f.byteOrder as string)) {
    errors.push(`${fieldContext}: "byteOrder" must be "little" or "big"`);
  }

  // Check if field extends beyond 8 bytes
  const totalBits = (f.bitOffset as number) + (f.bitLength as number);
  const requiredBytes = (f.byteOffset as number) + Math.ceil(totalBits / 8);
  if (requiredBytes > 8) {
    errors.push(`${fieldContext}: field extends beyond 8 bytes (CAN data limit)`);
  }

  // Warnings for best practices
  if (!f.description) {
    warnings.push(`${fieldContext}: missing "description" (recommended)`);
  }

  if (f.type !== 'boolean' && !f.unit) {
    warnings.push(`${fieldContext}: missing "unit" (recommended for numeric fields)`);
  }
}

/**
 * Validate message definition
 */
function validateMessage(
  message: unknown,
  errors: string[],
  warnings: string[]
): void {
  if (typeof message !== 'object' || message === null) {
    errors.push('Invalid message definition');
    return;
  }

  const m = message as Record<string, unknown>;
  const msgContext = `Message "${m.name || m.id}"`;

  // Required properties
  if (!m.id || typeof m.id !== 'string') {
    errors.push(`${msgContext}: missing or invalid "id"`);
  } else if (!validateCANId(m.id)) {
    errors.push(`${msgContext}: invalid CAN ID format "${m.id}"`);
  }

  if (!m.name || typeof m.name !== 'string') {
    errors.push(`${msgContext}: missing or invalid "name"`);
  }

  if (!m.fields || !Array.isArray(m.fields)) {
    errors.push(`${msgContext}: missing or invalid "fields" array`);
  } else {
    // Validate each field
    for (const field of m.fields) {
      validateField(field, errors, warnings, m.id as string);
    }
  }

  // Optional but validated if present
  if (m.dlc !== undefined) {
    if (typeof m.dlc !== 'number' || m.dlc < 0 || m.dlc > 8) {
      errors.push(`${msgContext}: "dlc" must be 0-8`);
    }
  }
}

/**
 * Validate widget definition
 */
function validateWidget(
  widget: unknown,
  errors: string[],
  warnings: string[],
  messages: Array<Record<string, unknown>>
): void {
  if (typeof widget !== 'object' || widget === null) {
    errors.push('Invalid widget definition');
    return;
  }

  const w = widget as Record<string, unknown>;
  const widgetContext = `Widget "${w.id}"`;

  // Required properties
  if (!w.id || typeof w.id !== 'string') {
    errors.push(`${widgetContext}: missing or invalid "id"`);
  }

  if (!w.messageId || typeof w.messageId !== 'string') {
    errors.push(`${widgetContext}: missing or invalid "messageId"`);
  } else {
    // Check if message exists
    const messageExists = messages.some((m) => m.id === w.messageId);
    if (!messageExists) {
      errors.push(`${widgetContext}: references non-existent message "${w.messageId}"`);
    } else {
      // Check if field exists in message
      const message = messages.find((m) => m.id === w.messageId);
      const fields = message?.fields;
      if (Array.isArray(fields)) {
        const fieldExists = fields.some((f: unknown) => {
          if (typeof f === 'object' && f !== null) {
            return (f as Record<string, unknown>).name === w.fieldName;
          }
          return false;
        });
        if (!fieldExists) {
          errors.push(
            `${widgetContext}: references non-existent field "${w.fieldName}" in message "${w.messageId}"`
          );
        }
      }
    }
  }

  if (!w.fieldName || typeof w.fieldName !== 'string') {
    errors.push(`${widgetContext}: missing or invalid "fieldName"`);
  }

  if (!w.config || typeof w.config !== 'object') {
    errors.push(`${widgetContext}: missing or invalid "config"`);
  } else {
    const config = w.config as Record<string, unknown>;
    if (!config.type) {
      errors.push(`${widgetContext}: config missing "type"`);
    }
  }
}

/**
 * Validate layout definition
 */
function validateLayout(
  layout: unknown,
  errors: string[],
  warnings: string[],
  widgets: Array<Record<string, unknown>>
): void {
  if (typeof layout !== 'object' || layout === null) {
    errors.push('Invalid layout definition');
    return;
  }

  const l = layout as Record<string, unknown>;
  const layoutContext = `Layout "${l.id}"`;

  // Required properties
  if (!l.id || typeof l.id !== 'string') {
    errors.push(`${layoutContext}: missing or invalid "id"`);
  }

  if (!l.name || typeof l.name !== 'string') {
    errors.push(`${layoutContext}: missing or invalid "name"`);
  }

  if (!l.widgets || !Array.isArray(l.widgets)) {
    errors.push(`${layoutContext}: missing or invalid "widgets" array`);
  } else {
    // Validate widget references
    for (const layoutWidget of l.widgets) {
      if (typeof layoutWidget !== 'object' || layoutWidget === null) {
        continue;
      }
      const lw = layoutWidget as Record<string, unknown>;

      if (!lw.widgetId) {
        errors.push(`${layoutContext}: widget missing "widgetId"`);
      } else {
        const widgetExists = widgets.some((w) => w.id === lw.widgetId);
        if (!widgetExists) {
          errors.push(
            `${layoutContext}: references non-existent widget "${lw.widgetId}"`
          );
        }
      }

      if (!lw.position || typeof lw.position !== 'object') {
        errors.push(`${layoutContext}: widget "${lw.widgetId}" missing "position"`);
      } else {
        const position = lw.position as Record<string, unknown>;
        if (typeof position.x !== 'number') {
          errors.push(`${layoutContext}: position.x must be a number`);
        }
        if (typeof position.y !== 'number') {
          errors.push(`${layoutContext}: position.y must be a number`);
        }
      }
    }
  }
}

/**
 * Validate a complete definition file
 */
export function validateDefinition(definition: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof definition !== 'object' || definition === null) {
    return {
      valid: false,
      errors: ['Invalid definition file format'],
      warnings: [],
    };
  }

  const def = definition as Record<string, unknown>;

  // Check root properties
  if (!def.version || typeof def.version !== 'string') {
    errors.push('Missing or invalid "version"');
  }

  if (!def.name || typeof def.name !== 'string') {
    errors.push('Missing or invalid "name"');
  }

  if (!def.messages || !Array.isArray(def.messages)) {
    errors.push('Missing or invalid "messages" array');
  } else {
    // Validate each message
    for (const message of def.messages) {
      validateMessage(message, errors, warnings);
    }

    // Check for duplicate message IDs
    const messageIds = def.messages.map((m: unknown) => {
      if (typeof m === 'object' && m !== null) {
        return (m as Record<string, unknown>).id;
      }
      return undefined;
    });
    const duplicates = messageIds.filter(
      (id: unknown, index: number) => id && messageIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate message IDs: ${duplicates.join(', ')}`);
    }
  }

  const messages = (def.messages as Array<Record<string, unknown>>) || [];

  if (!def.widgets || !Array.isArray(def.widgets)) {
    warnings.push('No widgets defined');
  } else {
    // Validate each widget
    for (const widget of def.widgets) {
      validateWidget(widget, errors, warnings, messages);
    }

    // Check for duplicate widget IDs
    const widgetIds = def.widgets.map((w: unknown) => {
      if (typeof w === 'object' && w !== null) {
        return (w as Record<string, unknown>).id;
      }
      return undefined;
    });
    const duplicates = widgetIds.filter(
      (id: unknown, index: number) => id && widgetIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate widget IDs: ${duplicates.join(', ')}`);
    }
  }

  const widgets = (def.widgets as Array<Record<string, unknown>>) || [];

  if (!def.layouts || !Array.isArray(def.layouts)) {
    warnings.push('No layouts defined');
  } else {
    // Validate each layout
    for (const layout of def.layouts) {
      validateLayout(layout, errors, warnings, widgets);
    }

    // Check for duplicate layout IDs
    const layoutIds = def.layouts.map((l: unknown) => {
      if (typeof l === 'object' && l !== null) {
        return (l as Record<string, unknown>).id;
      }
      return undefined;
    });
    const duplicates = layoutIds.filter(
      (id: unknown, index: number) => id && layoutIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate layout IDs: ${duplicates.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Definition Manager Class
 */
export class DefinitionManager {
  private definitions: Map<string, CANDefinitionFile> = new Map();
  private readonly storageKey = 'ucan_custom_definitions';

  constructor() {
    this.loadBuiltinDefinitions();
    this.loadStoredDefinitions();
  }

  /**
   * Load built-in definitions
   */
  private loadBuiltinDefinitions(): void {
    // Load golf cart definition
    this.definitions.set('builtin:golf-cart', golfCartDefinition as CANDefinitionFile);
  }

  /**
   * Load definitions from localStorage
   */
  private loadStoredDefinitions(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const definitions = JSON.parse(stored) as CANDefinitionFile[];
        for (const def of definitions) {
          const id = `custom:${def.name.replace(/\s+/g, '-').toLowerCase()}`;
          this.definitions.set(id, def);
        }
      }
    } catch (error) {
      console.error('Failed to load stored definitions:', error);
    }
  }

  /**
   * Save custom definitions to localStorage
   */
  private saveStoredDefinitions(): void {
    if (typeof window === 'undefined') return;

    try {
      const customDefs = Array.from(this.definitions.entries())
        .filter(([id]) => id.startsWith('custom:'))
        .map(([, def]) => def);

      localStorage.setItem(this.storageKey, JSON.stringify(customDefs));
    } catch (error) {
      console.error('Failed to save definitions:', error);
    }
  }

  /**
   * Add a definition from uploaded file or object
   */
  addDefinition(definition: CANDefinitionFile): ValidationResult {
    // Validate first
    const validation = validateDefinition(definition);
    if (!validation.valid) {
      return validation;
    }

    // Generate ID
    const id = `custom:${definition.name.replace(/\s+/g, '-').toLowerCase()}`;

    // Store definition
    this.definitions.set(id, definition);

    // Persist to localStorage
    this.saveStoredDefinitions();

    return validation;
  }

  /**
   * Remove a custom definition
   */
  removeDefinition(id: string): boolean {
    if (id.startsWith('builtin:')) {
      return false; // Can't remove built-in definitions
    }

    const removed = this.definitions.delete(id);
    if (removed) {
      this.saveStoredDefinitions();
    }
    return removed;
  }

  /**
   * Get a specific definition
   */
  getDefinition(id: string): CANDefinitionFile | undefined {
    return this.definitions.get(id);
  }

  /**
   * Get all available definitions
   */
  getAllDefinitions(): CANDefinitionFile[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Get metadata for all definitions
   */
  getDefinitionMetadata(): DefinitionMetadata[] {
    return Array.from(this.definitions.entries()).map(([id, def]) => ({
      id,
      name: def.name,
      description: def.description,
      author: def.author,
      source: id.startsWith('builtin:') ? 'builtin' : 'uploaded',
      messageCount: def.messages.length,
      widgetCount: def.widgets.length,
      layoutCount: def.layouts.length,
    }));
  }

  /**
   * Find message definition by CAN ID
   */
  findMessageDefinition(
    canId: string,
    definitionId?: string
  ): MessageDefinition | undefined {
    // Normalize CAN ID for comparison
    const normalizedId = canId.toUpperCase();

    if (definitionId) {
      // Search in specific definition
      const def = this.definitions.get(definitionId);
      return def?.messages.find((m) => m.id.toUpperCase() === normalizedId);
    }

    // Search all definitions
    for (const def of this.definitions.values()) {
      const message = def.messages.find((m) => m.id.toUpperCase() === normalizedId);
      if (message) {
        return message;
      }
    }

    return undefined;
  }

  /**
   * Parse and validate JSON definition file
   */
  static parseDefinitionFile(content: string): CANDefinitionFile {
    try {
      const parsed = JSON.parse(content);
      return parsed as CANDefinitionFile;
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
