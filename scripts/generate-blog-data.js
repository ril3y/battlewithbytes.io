#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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
    
    const blogData = [];

    dirs.forEach(dir => {
      const fullPath = path.join(BLOG_DIR, dir);
      if (fs.statSync(fullPath).isDirectory()) {
        const mdxPath = path.join(fullPath, 'index.mdx');

        if (fs.existsSync(mdxPath)) {
          try {
            const fileContent = fs.readFileSync(mdxPath, 'utf-8');
            const { data: frontmatter } = matter(fileContent);

            // Basic validation
            if (!frontmatter.title || !frontmatter.date || !frontmatter.excerpt) {
              console.warn(`Skipping ${dir}: Missing required frontmatter (title, date, excerpt).`);
              return;
            }

            // Construct post data from frontmatter
            const post = {
              slug: dir, // Use directory name as slug
              metadata: {
                title: frontmatter.title,
                date: frontmatter.date,
                excerpt: frontmatter.excerpt,
                tags: frontmatter.tags || [], // Default to empty array if no tags
                author: frontmatter.author || 'Riley Porter', // Default author
              },
            };
            blogData.push(post);
          } catch (readError) {
            console.error(`Error reading or parsing ${mdxPath}:`, readError);
          }
        }
      }
    });

    // Sort posts by date, newest first
    blogData.sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));

    // Write the blog data to a JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(blogData, null, 2));
    console.log(`Blog data generated successfully: ${blogData.length} posts`);
  } catch (error) {
    console.error(`Error generating blog data: ${error.message}`);
    console.error(error.stack);
  }
}

// Run the function
generateBlogData();
