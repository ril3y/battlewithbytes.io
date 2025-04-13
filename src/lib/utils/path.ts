/**
 * Utility function to get the base path for the application
 * This ensures assets and links work correctly in both development and production (GitHub Pages)
 */
export function getBasePath(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In the browser, we can use the PUBLIC_URL environment variable or fallback to empty string
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
  }
  
  // In Node.js environment during build/SSR
  return process.env.NODE_ENV === 'production' ? '/battlewithbytes.io' : '';
}

/**
 * Creates a URL with the correct base path for the current environment
 * @param path The path to append to the base path
 * @returns The complete URL with base path
 */
export function createUrl(path: string): string {
  const basePath = getBasePath();
  
  // Ensure path starts with a slash if it's not empty
  const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  
  // Combine base path with the provided path
  return `${basePath}${normalizedPath}`;
}
