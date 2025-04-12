const fs = require('fs');
const path = require('path');

// Path to the blog directory
const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

describe('Battle With Bytes Blog System', () => {
  describe('Blog Structure', () => {
    it('should have the correct blog directory structure', () => {
      expect(fs.existsSync(BLOG_DIR)).toBe(true);
    });
    
    it('should have at least one blog post', () => {
      const blogPosts = fs.readdirSync(BLOG_DIR).filter(dir => {
        const fullPath = path.join(BLOG_DIR, dir);
        return fs.statSync(fullPath).isDirectory();
      });
      
      expect(blogPosts.length).toBeGreaterThan(0);
    });
  });
  
  describe('Blog Post Format', () => {
    let blogPost;
    let blogPostPath;
    
    beforeAll(() => {
      // Find a blog post to test
      const blogPosts = fs.readdirSync(BLOG_DIR).filter(dir => {
        const fullPath = path.join(BLOG_DIR, dir);
        return fs.statSync(fullPath).isDirectory();
      });
      
      if (blogPosts.length > 0) {
        blogPost = blogPosts[0];
        blogPostPath = path.join(BLOG_DIR, blogPost);
      }
    });
    
    it('should have index.mdx and meta.txt files', () => {
      expect(blogPost).toBeDefined();
      expect(fs.existsSync(path.join(blogPostPath, 'index.mdx'))).toBe(true);
      expect(fs.existsSync(path.join(blogPostPath, 'meta.txt'))).toBe(true);
    });
    
    it('should have properly formatted meta.txt file', () => {
      const metaPath = path.join(blogPostPath, 'meta.txt');
      const metaContent = fs.readFileSync(metaPath, 'utf8');
      
      // Check required metadata fields
      expect(metaContent).toMatch(/title:\s*"[^"]+"/);
      expect(metaContent).toMatch(/date:\s*"[^"]+"/);
      expect(metaContent).toMatch(/excerpt:\s*"[^"]+"/);
      expect(metaContent).toMatch(/tags:\s*\[.*\]/);
      expect(metaContent).toMatch(/author:\s*"[^"]+"/);
    });
    
    it('should have properly formatted index.mdx file without frontmatter', () => {
      const mdxPath = path.join(blogPostPath, 'index.mdx');
      const mdxContent = fs.readFileSync(mdxPath, 'utf8');
      
      // MDX file should not contain frontmatter delimiters
      const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
      expect(mdxContent.match(frontmatterRegex)).toBeNull();
      
      // Should start with a heading
      expect(mdxContent.trim().startsWith('#')).toBe(true);
    });
  });
});
