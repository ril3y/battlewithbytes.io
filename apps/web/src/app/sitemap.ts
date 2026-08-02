import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { getBlogSlugs, getBlogPostMetadata } from "@/lib/blog";
import { SITE_URL } from "@/lib/utils/seo";

// Configure for static export
export const dynamic = "force-static";
export const dynamicParams = false;

const TOOL_SLUGS = [
  "mosfet-calculator",
  "ohms-law-calculator",
  "wire-wizard",
  "battleterm",
  "ucan",
  "battleforge",
  "battlemagic",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Core pages
  const routes: MetadataRoute.Sitemap = [
    "",
    "/tools",
    "/blog",
    "/projects",
    "/about",
    "/contact",
    ...TOOL_SLUGS.map((slug) => `/tools/${slug}`),
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Blog posts, dated from frontmatter
  const blogPosts: MetadataRoute.Sitemap = getBlogSlugs()
    .map((slug) => {
      const metadata = getBlogPostMetadata(slug);
      if (!metadata) return null; // disabled or unreadable post
      return {
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: new Date(metadata.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  // Project pages
  let projects: MetadataRoute.Sitemap = [];
  try {
    const projectsDir = path.join(process.cwd(), "src", "content", "projects");
    projects = fs
      .readdirSync(projectsDir)
      .filter((dir) =>
        fs.existsSync(path.join(projectsDir, dir, "index.mdx")),
      )
      .map((slug) => ({
        url: `${SITE_URL}/projects/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.error("Error enumerating projects for sitemap:", error);
  }

  return [...routes, ...blogPosts, ...projects];
}
