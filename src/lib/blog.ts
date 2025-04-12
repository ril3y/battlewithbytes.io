import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

// Add cache busting for development
const isDev = process.env.NODE_ENV === 'development';

export interface BlogPost {
  slug: string;
  metadata: {
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    author: string;
    coverImage?: string;
  };
  content: string;
}

export function getBlogSlugs(): string[] {
  return fs.readdirSync(BLOG_DIR).filter(dir => {
    const fullPath = path.join(BLOG_DIR, dir);
    return fs.statSync(fullPath).isDirectory() && 
           fs.existsSync(path.join(fullPath, 'index.mdx'));
  });
}

export function getBlogPostBySlug(slug: string): BlogPost {
  const contentPath = path.join(BLOG_DIR, slug, 'index.mdx');
  const metaPath = path.join(BLOG_DIR, slug, 'meta.txt');
  
  // Read content file
  const content = fs.readFileSync(contentPath, 'utf8');
  
  // Debug: Log meta file path and existence
  console.log(`[DEBUG] Reading meta from: ${metaPath}, exists: ${fs.existsSync(metaPath)}`);
  
  // Read and parse metadata file
  const metaContent = fs.readFileSync(metaPath, 'utf8');
  
  // Debug: Log raw meta content
  console.log(`[DEBUG] Raw meta content for ${slug}:`, metaContent);
  
  // Fix: Add frontmatter delimiters if they don't exist
  const contentWithDelimiters = metaContent.trim().startsWith('---') 
    ? metaContent 
    : `---\n${metaContent}\n---`;
  
  const { data } = matter(contentWithDelimiters);
  
  // Debug: Log parsed metadata
  console.log(`[DEBUG] Parsed metadata for ${slug}:`, data);
  
  // Process cover image path if it exists and is relative
  let coverImage = data.coverImage;
  if (coverImage && coverImage.startsWith('./')) {
    // Convert relative path to absolute path for Next.js Image component
    // For example, "./images/cover.png" becomes "/images/blog/lora-without-lorawan/cover.png"
    const imageName = path.basename(coverImage); // Get 'cover.png'
    coverImage = `/images/blog/${slug}/${imageName}`; // Construct path relative to public dir
 
    // Add cache busting for development
    if (isDev) {
      coverImage = `${coverImage}?t=${new Date().toISOString().split('T')[0]}`;
    }
  }
  
  return {
    slug,
    metadata: {
      title: data.title || '',
      date: data.date || new Date().toISOString().split('T')[0],
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      author: data.author || 'Battle With Bytes',
      coverImage: coverImage,
    },
    content,
  };
}

// Use a more compatible approach for development
let cachedPosts: BlogPost[] | null = null;

export function getAllBlogPosts(): BlogPost[] {
  // In development, always reload the data
  if (isDev || !cachedPosts) {
    const slugs = getBlogSlugs();
    console.log(`[DEBUG] Found blog slugs:`, slugs);
    
    const posts = slugs
      .map(slug => getBlogPostBySlug(slug))
      .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
    
    // Debug: Log processed posts data
    console.log(`[DEBUG] Processed posts:`, posts.map(p => ({
      slug: p.slug,
      title: p.metadata.title,
      titleType: typeof p.metadata.title,
      titleLength: p.metadata.title ? p.metadata.title.length : 0
    })));
    
    cachedPosts = posts;
  } else {
    console.log(`[DEBUG] Using cached posts`);
  }
  
  return cachedPosts;
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return getAllBlogPosts().filter(post => 
    post.metadata.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllBlogPosts();
  const tagCounts: Record<string, number> = {};
  
  posts.forEach(post => {
    post.metadata.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
