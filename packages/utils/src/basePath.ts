/**
 * Get the base path for the application
 * This handles Next.js basePath configuration for both dev and production
 * Auto-detects from URL pattern /tools/*
 */
export function getBasePath(): string {
  if (typeof window !== 'undefined') {
    // Auto-detect basePath from URL pattern /tools/<app-name>
    const match = window.location.pathname.match(/^(\/tools\/[^/]+)/);
    if (match) {
      return match[1];
    }
  }
  return '';
}

/**
 * Prefix a path with the application's base path
 * Use this for all fetch() calls to local resources and image src attributes
 *
 * @example
 * // In production at /tools/battlemagic
 * withBasePath('/logo.png') // returns '/tools/battlemagic/logo.png'
 *
 * // In development
 * withBasePath('/logo.png') // returns '/logo.png'
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
