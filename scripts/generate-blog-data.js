#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to blog content directory
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const OUTPUT_FILE = path.join(process.cwd(), 'public/blog-data.json');

// Function to generate blog data
function generateBlogData() {
  console.log('Generating blog data...');
  
  try {
    if (!fs.existsSync(BLOG_DIR)) {
      console.error(`Blog directory not found: ${BLOG_DIR}`);
      return;
    }
    
    const dirs = fs.readdirSync(BLOG_DIR);
    
    if (dirs.length === 0) {
      console.log('No blog posts found.');
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify([]));
      return;
    }
    
    // Get all valid blog posts (directories with index.mdx and meta.txt)
    const posts = dirs
      .filter(dir => {
        const fullPath = path.join(BLOG_DIR, dir);
        return fs.statSync(fullPath).isDirectory() && 
               fs.existsSync(path.join(fullPath, 'index.mdx')) &&
               fs.existsSync(path.join(fullPath, 'meta.txt'));
      })
      .map(slug => {
        // Read metadata from meta.txt
        const metaPath = path.join(BLOG_DIR, slug, 'meta.txt');
        const metaContent = fs.readFileSync(metaPath, 'utf8');
        
        // Parse metadata
        const metadata = {};
        metaContent.split('\n').forEach(line => {
          if (line.trim() === '') return;
          
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Handle arrays (tags)
            if (value.startsWith('[') && value.endsWith(']')) {
              value = value.slice(1, -1).split(',').map(item => item.trim().replace(/"/g, ''));
            } else if (value.startsWith('"') && value.endsWith('"')) {
              // Handle quoted strings
              value = value.slice(1, -1);
            }
            
            metadata[key] = value;
          }
        });
        
        return {
          slug,
          metadata
        };
      });
    
    // Write the blog data to a JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
    console.log(`Blog data generated successfully: ${posts.length} posts`);
  } catch (error) {
    console.error(`Error generating blog data: ${error.message}`);
  }
}

// Run the function
generateBlogData();
