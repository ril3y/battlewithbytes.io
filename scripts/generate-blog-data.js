#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Path to blog content directory
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const OUTPUT_FILE = path.join(process.cwd(), 'public/blog-data.json');
const PUBLIC_BLOG_IMAGES_DIR = path.join(process.cwd(), 'public/images/blog');

// Function to generate blog data
function generateBlogData() {
  console.log('Generating blog data...');
  
  try {
    if (!fs.existsSync(BLOG_DIR)) {
      console.error(`Blog directory not found: ${BLOG_DIR}`);
      return;
    }
    
    // Ensure the public blog images directory exists
    if (!fs.existsSync(PUBLIC_BLOG_IMAGES_DIR)) {
      fs.mkdirSync(PUBLIC_BLOG_IMAGES_DIR, { recursive: true });
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

            // Process the cover image to make it publicly accessible
            let coverImage = frontmatter.coverImage || null;
            if (coverImage && coverImage.startsWith('./')) {
              // Get source path
              const sourcePath = path.join(fullPath, coverImage.substring(2));
              
              // Set the expected public URL path regardless of copy operation
              const publicPath = `/images/blog/${dir}/${path.basename(coverImage.substring(2))}`;
              
              // Create destination directory if it doesn't exist
              const destDir = path.join(PUBLIC_BLOG_IMAGES_DIR, dir);
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }
              
              // Copy the image to the public directory if it exists in the source
              const destPath = path.join(destDir, path.basename(coverImage.substring(2)));
              if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
              } else {
                // Check if image already exists in public directory
                if (!fs.existsSync(destPath)) {
                  console.warn(`Cover image not found: ${sourcePath}`);
                }
              }
              
              // Use the public URL path regardless
              coverImage = publicPath;
            }
            
            // Construct post data from frontmatter
            const post = {
              slug: frontmatter.slug || dir, // Use frontmatter slug or fallback to directory name
              metadata: {
                title: frontmatter.title,
                date: frontmatter.date,
                excerpt: frontmatter.excerpt,
                tags: frontmatter.tags || [], // Default to empty array if no tags
                author: frontmatter.author || 'Riley Porter', // Default author
                coverImage: coverImage, // Use the processed cover image path
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
    console.error('Error generating blog data:', error);
  }
}

// Run the function
generateBlogData();
