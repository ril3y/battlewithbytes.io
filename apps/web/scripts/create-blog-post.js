#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

// Function to sanitize a string for use as a slug/directory name
function sanitizeSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
    .replace(/--+/g, '-');       // Replace multiple hyphens with single hyphen
}

async function createBlogPost() {
  console.log('\x1b[32m%s\x1b[0m', '🔥 Battle With Bytes - Blog Post Generator 🔥');
  console.log('This script will create a new blog post with the proper structure.\n');

  try {
    // Get blog post details
    const title = await question('Title: ');
    let slugInput = await question('Slug (URL-friendly name, e.g., "lora-without-lorawan"): ');
    
    // Sanitize the slug
    const slug = sanitizeSlug(slugInput);
    console.log(`\nUsing sanitized slug: "${slug}"`);
    
    const excerpt = await question('Excerpt (short description): ');
    const tagsInput = await question('Tags (comma-separated, e.g., "embedded,hardware,wireless"): ');
    const tags = tagsInput.split(',').map(tag => tag.trim());
    const author = await question('Author (default: "Battle With Bytes"): ') || 'Battle With Bytes';
    
    // Create directory structure
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog', slug);
    const imageDir = path.join(process.cwd(), 'public', 'images', 'blog', slug);
    
    if (fs.existsSync(blogDir)) {
      console.log('\x1b[31m%s\x1b[0m', `\nError: Blog post with slug "${slug}" already exists!`);
      rl.close();
      return;
    }
    
    fs.mkdirSync(blogDir, { recursive: true });
    fs.mkdirSync(imageDir, { recursive: true });
    
    // Create the MDX file with frontmatter
    const today = new Date().toISOString().split('T')[0];
    const mdxContent = `---
title: "${title}"
date: "${today}"
excerpt: "${excerpt}"
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
author: "${author}"
coverImage: "/images/blog/${slug}/cover.jpg"
---

# ${title}

Write your blog post content here. This is a Markdown file with support for MDX components.

## Section 1

Your content goes here...

## Section 2

More content...

`;
    
    fs.writeFileSync(path.join(blogDir, 'index.mdx'), mdxContent);
    
    // Create a placeholder cover image text file
    fs.writeFileSync(
      path.join(imageDir, 'README.txt'), 
      `Place your cover image here named "cover.jpg"\n`
    );
    
    console.log('\x1b[32m%s\x1b[0m', '\nBlog post created successfully! 🎉');
    console.log('\x1b[36m%s\x1b[0m', `\nBlog post location: ${blogDir}`);
    console.log('\x1b[36m%s\x1b[0m', `Cover image location: ${imageDir}`);
    console.log('\nNext steps:');
    console.log('1. Add your cover image to the images directory');
    console.log('2. Edit the blog post content in the index.mdx file');
    console.log('3. Run the development server to preview your post');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `\nError: ${error.message}`);
  } finally {
    rl.close();
  }
}

createBlogPost();
