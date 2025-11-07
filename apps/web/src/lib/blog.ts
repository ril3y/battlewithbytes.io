import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const isDev = process.env.NODE_ENV === 'development';

// Define the structure for blog post metadata
export interface BlogMetadata {
  title: string;
  slug: string; // Add slug here for convenience
  date: string;
  excerpt: string;
  tags: string[];
  author: string;
  coverImage?: string;
}

// Define the structure for a full blog post with serialized content
export interface BlogPost {
  metadata: BlogMetadata;
  content: MDXRemoteSerializeResult; // Changed from string
}

export function getBlogSlugs(): string[] {
  try {
    return fs.readdirSync(BLOG_DIR).filter(dir => {
      const fullPath = path.join(BLOG_DIR, dir);
      // Ensure it's a directory and contains index.mdx
      return fs.statSync(fullPath).isDirectory() && 
             fs.existsSync(path.join(fullPath, 'index.mdx'));
    });
  } catch (error) {
    console.error("Error reading blog directory:", error);
    return [];
  }
}

// Synchronous function to get only metadata for a single post
export function getBlogPostMetadata(slug: string): BlogMetadata | null {
  const contentPath = path.join(BLOG_DIR, slug, 'index.mdx');
  if (!fs.existsSync(contentPath)) {
    console.warn(`[Metadata] index.mdx not found for slug: ${slug}`);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(contentPath, 'utf8');
    const { data } = matter(fileContent);

    // If enabled is explicitly false, skip this post
    if (typeof data.enabled !== 'undefined' && data.enabled === false) {
      return null;
    }

    // Process cover image path
    let coverImage = data.coverImage;
    if (coverImage && coverImage.startsWith('./')) {
      const imageName = path.basename(coverImage);
      coverImage = `/images/blog/${slug}/${imageName}`;
      if (isDev) {
        coverImage = `${coverImage}?t=${new Date().toISOString().split('T')[0]}`;
      }
    }

    // Basic validation
    if (!data.title || !data.date || !data.excerpt) {
        console.warn(`[Metadata] Missing required fields (title, date, excerpt) for slug: ${slug}`);
        // Provide defaults or handle as needed, here returning basic info
    }

    return {
      slug: slug, // Include the slug
      title: data.title || 'Untitled Post',
      date: data.date || new Date().toISOString().split('T')[0],
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      author: data.author || 'Battle With Bytes',
      coverImage: coverImage,
    };
  } catch (error) {
    console.error(`Error reading or parsing metadata for slug ${slug}:`, error);
    return null;
  }
}

// Synchronous function to get metadata for all posts, sorted by date
export function getBlogPostsMetadata(): BlogMetadata[] {
  const slugs = getBlogSlugs();
  console.log(`[DEBUG] Found blog slugs for metadata:`, slugs);
  
  const posts = slugs
    .map(slug => getBlogPostMetadata(slug))
    .filter((post): post is BlogMetadata => post !== null) // Type guard to remove nulls
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  console.log(`[DEBUG] Processed metadata for ${posts.length} posts.`);
  return posts;
}

// Async function to get a single post with *serialized* content
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const contentPath = path.join(BLOG_DIR, slug, 'index.mdx');
   if (!fs.existsSync(contentPath)) {
    console.warn(`[Content] index.mdx not found for slug: ${slug}`);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(contentPath, 'utf8');
    const { data, content } = matter(fileContent); // Get both data and content

    // If enabled is explicitly false, skip this post
    if (typeof data.enabled !== 'undefined' && data.enabled === false) {
      return null;
    }

    // Serialize the MDX content
    const mdxSource = await serialize(content, {
        // Optionally pass scope variables available to MDX
        // scope: data,
        mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
                rehypeSlug, // Add slugs to headings
                [rehypeAutolinkHeadings, {behavior: 'wrap'}] // Add links to headings
            ],
            format: 'mdx' // Ensure format is set if needed
        },
        parseFrontmatter: false // We already parsed it with gray-matter
    });

    // Process cover image path (duplicated from getBlogPostMetadata - consider refactoring)
    let coverImage = data.coverImage;
    if (coverImage && coverImage.startsWith('./')) {
      const imageName = path.basename(coverImage);
      coverImage = `/images/blog/${slug}/${imageName}`;
      if (isDev) {
        coverImage = `${coverImage}?t=${new Date().toISOString().split('T')[0]}`;
      }
    }

    return {
      metadata: {
        slug: slug,
        title: data.title || 'Untitled Post',
        date: data.date || new Date().toISOString().split('T')[0],
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        author: data.author || 'Battle With Bytes',
        coverImage: coverImage,
      },
      content: mdxSource, // Return the serialized content
    };
  } catch (error) {
      console.error(`Error processing or serializing blog post ${slug}:`, error);
      return null;
  }
}


// Use a more compatible approach for development (CACHE REMOVED as static generation handles this)
// let cachedPosts: BlogMetadata[] | null = null; // Changed to BlogMetadata

// REMOVED getAllBlogPosts function as getBlogPostsMetadata serves the listing purpose
// export function getAllBlogPosts(): BlogMetadata[] { ... }

export function getBlogPostsByTag(tag: string): BlogMetadata[] {
  return getBlogPostsMetadata().filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getBlogPostsMetadata(); // Use metadata function
  const tagCounts: Record<string, number> = {};
  
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
