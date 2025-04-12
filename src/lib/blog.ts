import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

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
  
  // Read and parse metadata file
  const metaContent = fs.readFileSync(metaPath, 'utf8');
  const { data } = matter(metaContent);
  
  return {
    slug,
    metadata: {
      title: data.title || '',
      date: data.date || new Date().toISOString().split('T')[0],
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      author: data.author || 'Battle With Bytes',
      coverImage: data.coverImage,
    },
    content,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  const slugs = getBlogSlugs();
  
  const posts = slugs
    .map(slug => getBlogPostBySlug(slug))
    .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
  
  return posts;
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
