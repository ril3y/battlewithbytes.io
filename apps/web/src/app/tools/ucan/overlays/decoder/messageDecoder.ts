/**
 * CAN Message Decoder Engine
 *
 * Extracts and decodes fields from CAN message data according to field definitions.
 * Supports bit-level extraction, multi-byte fields, byte order, and type conversion.
 */

import type {
  FieldDefinition,
  DecodedField,
  MessageDefinition,
  DecodedMessage,
  ByteOrder,
} from "../types";

/**
 * Extract bits from a byte array
 *
 * @param data - Raw CAN data bytes
 * @param byteOffset - Starting byte (0-7)
 * @param bitOffset - Starting bit within byte (0-7, LSB=0)
 * @param bitLength - Number of bits to extract (1-64)
 * @param byteOrder - Byte order for multi-byte values
 * @returns Extracted value as number or array of bytes for raw
 */
export function extractBits(
  data: number[],
  byteOffset: number,
  bitOffset: number,
  bitLength: number,
  byteOrder: ByteOrder = "little",
): number {
  // Validate inputs
  if (byteOffset < 0 || byteOffset >= data.length) {
    throw new Error(`Byte offset ${byteOffset} out of range`);
  }
  if (bitOffset < 0 || bitOffset > 7) {
    throw new Error(`Bit offset ${bitOffset} must be 0-7`);
  }
  if (bitLength < 1 || bitLength > 64) {
    throw new Error(`Bit length ${bitLength} must be 1-64`);
  }

  let result = 0;
  let bitsExtracted = 0;

  // Handle little-endian (default) vs big-endian
  if (byteOrder === "little") {
    // Little-endian: LSB first, extract left to right
    let currentByteIdx = byteOffset;
    let currentBitOffset = bitOffset;

    while (bitsExtracted < bitLength && currentByteIdx < data.length) {
      const byte = data[currentByteIdx];
      const bitsAvailableInByte = 8 - currentBitOffset;
      const bitsToExtract = Math.min(
        bitLength - bitsExtracted,
        bitsAvailableInByte,
      );

      // Create mask for the bits we want
      const mask = ((1 << bitsToExtract) - 1) << currentBitOffset;
      const extractedBits = (byte & mask) >> currentBitOffset;

      // Add to result at the correct position
      result |= extractedBits << bitsExtracted;

      bitsExtracted += bitsToExtract;
      currentByteIdx++;
      currentBitOffset = 0; // After first byte, always start at bit 0
    }
  } else {
    // Big-endian: MSB first, extract from high bytes to low bytes
    let currentByteIdx = byteOffset;
    let currentBitOffset = bitOffset;

    while (bitsExtracted < bitLength && currentByteIdx < data.length) {
      const byte = data[currentByteIdx];
      const bitsAvailableInByte = 8 - currentBitOffset;
      const bitsToExtract = Math.min(
        bitLength - bitsExtracted,
        bitsAvailableInByte,
      );

      // Create mask for the bits we want (from MSB side)
      const mask = ((1 << bitsToExtract) - 1) << currentBitOffset;
      const extractedBits = (byte & mask) >> currentBitOffset;

      // For big-endian, we build from MSB down
      const shiftAmount = bitLength - bitsExtracted - bitsToExtract;
      result |= extractedBits << shiftAmount;

      bitsExtracted += bitsToExtract;
      currentByteIdx++;
      currentBitOffset = 0;
    }
  }

  return result;
}

/**
 * Convert raw extracted bits to typed value
 */
export function convertToType(
  rawValue: number,
  field: FieldDefinition,
): number | boolean | string {
  switch (field.type) {
    case "boolean":
      return rawValue !== 0;

    case "uint":
      return rawValue;

    case "int": {
      // Two's complement conversion
      const bitLength = field.bitLength;
      const signBit = 1 << (bitLength - 1);
      if (rawValue & signBit) {
        // Negative number - extend sign
        const mask = (1 << bitLength) - 1;
        return rawValue | ~mask;
      }
      return rawValue;
    }

    case "float": {
      // IEEE 754 32-bit float
      if (field.bitLength !== 32) {
        throw new Error("Float type requires 32-bit field");
      }
      // Convert uint32 to float32
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint32(0, rawValue, true); // true = little-endian
      return view.getFloat32(0, true);
    }

    case "enum": {
      // Find matching enum value
      const enumDef = field.enumValues?.find((e) => e.value === rawValue);
      return enumDef ? enumDef.label : `UNKNOWN(${rawValue})`;
    }

    case "raw":
      return rawValue;

    default:
      return rawValue;
  }
}

/**
 * Apply scaling and offset to a value
 */
export function applyTransform(
  value: number | boolean | string,
  field: FieldDefinition,
): number | boolean | string {
  // Only transform numeric values
  if (typeof value !== "number") {
    return value;
  }

  let result = value;

  // Apply scale
  if (field.scale !== undefined) {
    result *= field.scale;
  }

  // Apply offset
  if (field.offset !== undefined) {
    result += field.offset;
  }

  return result;
}

/**
 * Validate a value against field constraints
 */
export function validateValue(
  value: number | boolean | string,
  field: FieldDefinition,
): boolean {
  // Only validate numeric values
  if (typeof value !== "number") {
    return true;
  }

  if (field.min !== undefined && value < field.min) {
    return false;
  }

  if (field.max !== undefined && value > field.max) {
    return false;
  }

  return true;
}

/**
 * Decode a single field from CAN data
 */
export function decodeField(
  data: number[],
  field: FieldDefinition,
): DecodedField {
  try {
    // Extract raw bits
    const rawValue = extractBits(
      data,
      field.byteOffset,
      field.bitOffset,
      field.bitLength,
      field.byteOrder || "little",
    );

    // Convert to typed value
    const typedValue = convertToType(rawValue, field);

    // Apply transformations
    const transformedValue = applyTransform(typedValue, field);

    // Validate
    const valid = validateValue(transformedValue, field);

    return {
      name: field.name,
      rawValue,
      value: transformedValue,
      unit: field.unit,
      valid,
      description: field.description,
    };
  } catch (error) {
    // Return invalid field on error
    return {
      name: field.name,
      rawValue: 0,
      value: 0,
      unit: field.unit,
      valid: false,
      description: `Decode error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Decode all fields in a CAN message
 */
export function decodeMessage(
  canId: string,
  data: number[],
  definition: MessageDefinition,
  timestamp: number = Date.now(),
): DecodedMessage {
  const fields: Record<string, DecodedField> = {};

  // Decode each field
  for (const fieldDef of definition.fields) {
    const decodedField = decodeField(data, fieldDef);
    fields[fieldDef.name] = decodedField;
  }

  return {
    messageId: canId,
    timestamp,
    fields,
    definition,
  };
}

/**
 * Format a decoded field for display
 */
export function formatDecodedField(field: DecodedField): string {
  let valueStr: string;

  if (typeof field.value === "boolean") {
    valueStr = field.value ? "true" : "false";
  } else if (typeof field.value === "number") {
    // Format numbers with appropriate precision
    if (Number.isInteger(field.value)) {
      valueStr = field.value.toString();
    } else {
      valueStr = field.value.toFixed(2);
    }
  } else {
    valueStr = String(field.value);
  }

  // Add unit if present
  if (field.unit) {
    valueStr += ` ${field.unit}`;
  }

  // Add validity indicator if invalid
  if (!field.valid) {
    valueStr += " ⚠️";
  }

  return valueStr;
}

/**
 * Format entire decoded message for display
 */
export function formatDecodedMessage(decoded: DecodedMessage): string {
  const lines: string[] = [];

  if (decoded.definition) {
    lines.push(`${decoded.definition.name} (${decoded.messageId})`);
  }

  for (const [name, field] of Object.entries(decoded.fields)) {
    const formatted = formatDecodedField(field);
    lines.push(`  ${name}: ${formatted}`);
  }

  return lines.join("\n");
}

/**
 * Get inline hex annotation for a decoded message
 * Returns an array of annotations for each byte
 */
export function getInlineAnnotations(
  decoded: DecodedMessage,
): Array<{ byteIndex: number; annotation: string }> {
  const annotations: Array<{ byteIndex: number; annotation: string }> = [];

  for (const field of Object.values(decoded.fields)) {
    const fieldDef = decoded.definition?.fields.find(
      (f) => f.name === field.name,
    );
    if (!fieldDef) continue;

    // Create annotation for this field's starting byte
    const annotation = `${field.name}=${formatDecodedField(field)}`;

    // Add annotation to the field's starting byte
    annotations.push({
      byteIndex: fieldDef.byteOffset,
      annotation,
    });
  }

  return annotations;
}

/**
 * Helper to normalize CAN ID format
 * Always returns format: 0x### (lowercase prefix, uppercase hex digits, padded to 3 chars)
 */
export function normalizeCANId(id: string | number): string {
  if (typeof id === "number") {
    return `0x${id.toString(16).toUpperCase().padStart(3, "0")}`;
  }

  // Remove any 0x or 0X prefix and convert hex digits to uppercase
  const hexPart = id.replace(/^0[xX]/, "").toUpperCase();

  // Pad to 3 characters minimum
  const paddedHex = hexPart.padStart(3, "0");

  // Return with lowercase 0x prefix
  return `0x${paddedHex}`;
}

/**
 * Check if a message matches a definition
 */
export function matchesDefinition(
  canId: string,
  definition: MessageDefinition,
): boolean {
  const normalizedCanId = normalizeCANId(canId);
  const normalizedDefId = normalizeCANId(definition.id);
  return normalizedCanId === normalizedDefId;
}
