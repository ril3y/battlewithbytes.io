/**
 * Generates a simple pseudo-random unique ID.
 * Note: For truly unique IDs in a distributed system, consider UUID libraries.
 */
export const generateUniqueId = (): string => {
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
};
