import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with appropriate units (K, M, G, etc.)
 */
export function formatNumber(value: number, decimals: number = 2): string {
  const units = ['', 'K', 'M', 'G', 'T'];
  let unitIndex = 0;
  let formattedValue = value;

  while (Math.abs(formattedValue) >= 1000 && unitIndex < units.length - 1) {
    formattedValue /= 1000;
    unitIndex++;
  }

  return `${formattedValue.toFixed(decimals)}${units[unitIndex]}`;
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Generate a random ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}