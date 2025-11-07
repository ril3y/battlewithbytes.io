import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

// Configure for static export
export const dynamic = 'force-static';
export const dynamicParams = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://ril3y.github.io/battlewithbytes.io'
    : 'https://battlewithbytes.io';
  
  // Core pages
  const routes = [
    '',
    '/tools',
    '/tools/mosfet-calculator',
    '/tools/ohms-law-calculator',
    '/blog',
    '/projects',
    '/about',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Get blog posts for dynamic routes
  try {
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
    const blogPosts = fs.existsSync(blogDir) 
      ? fs.readdirSync(blogDir)
        .filter(file => fs.statSync(path.join(blogDir, file)).isDirectory())
        .map(slug => ({
          url: `${baseUrl}/blog/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
      : [];

    return [...routes, ...blogPosts];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
