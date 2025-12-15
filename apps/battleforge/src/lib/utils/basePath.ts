/**
 * Get the base path for the application
 * This handles Next.js basePath configuration for both dev and production
 */
export function getBasePath(): string {
  // In production, basePath is set via next.config.js
  // We can detect it from the current URL or use the known value
  if (typeof window !== 'undefined') {
    // Check if we're running under /tools/battleforge
    if (window.location.pathname.startsWith('/tools/battleforge')) {
      return '/tools/battleforge';
    }
  }
  return '';
}

/**
 * Prefix a path with the application's base path
 * Use this for all fetch() calls to local resources
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
