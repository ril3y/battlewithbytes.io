/**
 * Get the base path for the application
 * This handles Next.js basePath configuration for both dev and production
 */
export function getBasePath(): string {
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/tools/battleterm')) {
      return '/tools/battleterm';
    }
  }
  return '';
}

/**
 * Prefix a path with the application's base path
 * Use this for all asset URLs
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
