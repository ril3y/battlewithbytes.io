import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://battlewithbytes.io';
  
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

  return routes;
}
