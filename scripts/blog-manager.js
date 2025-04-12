#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const { Command } = require('commander');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask a question and get user input
function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

// Path to blog content directory
const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

// Ensure the blog directory exists
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
}

// Function to sanitize a string for use as a slug
function sanitizeSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with a single one
    .trim();
}

// Function to list all blog posts
async function listBlogPosts() {
  console.log(chalk.green.bold('\nBlog Posts:\n'));
  
  try {
    const dirs = fs.readdirSync(BLOG_DIR);
    
    if (dirs.length === 0) {
      console.log(chalk.yellow('No blog posts found.'));
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
      })
      .sort((a, b) => {
        // Sort by date (newest first)
        const dateA = new Date(a.metadata.date || '');
        const dateB = new Date(b.metadata.date || '');
        return dateB - dateA;
      });
    
    // Display the posts
    posts.forEach((post, index) => {
      console.log(chalk.cyan(`${index + 1}. ${post.metadata.title || 'Untitled'}`));
      console.log(`   Slug: ${chalk.yellow(post.slug)}`);
      console.log(`   Date: ${chalk.yellow(post.metadata.date || 'No date')}`);
      console.log(`   Tags: ${chalk.yellow(Array.isArray(post.metadata.tags) ? post.metadata.tags.join(', ') : 'No tags')}`);
      console.log('');
    });
    
    console.log(chalk.green(`Total: ${posts.length} blog posts`));
  } catch (error) {
    console.error(chalk.red(`Error listing blog posts: ${error.message}`));
  }
}

// Function to create a new blog post
async function createBlogPost() {
  console.log(chalk.green.bold('\nCreate New Blog Post\n'));
  
  try {
    // Get blog post details from user
    const title = await question(chalk.cyan('Title: '));
    if (!title) {
      console.log(chalk.red('Title is required.'));
      return;
    }
    
    // Generate slug from title or let user specify
    const defaultSlug = sanitizeSlug(title);
    const slugInput = await question(chalk.cyan(`Slug (default: ${defaultSlug}): `));
    const slug = slugInput ? sanitizeSlug(slugInput) : defaultSlug;
    
    // Check if slug already exists
    const postDir = path.join(BLOG_DIR, slug);
    if (fs.existsSync(postDir)) {
      console.log(chalk.red(`A blog post with slug "${slug}" already exists.`));
      return;
    }
    
    // Get other metadata
    const date = await question(chalk.cyan(`Date (default: ${new Date().toISOString().split('T')[0]}): `));
    const excerpt = await question(chalk.cyan('Excerpt: '));
    const tagsInput = await question(chalk.cyan('Tags (comma-separated): '));
    const author = await question(chalk.cyan('Author (default: Battle With Bytes): '));
    
    // Create post directory
    fs.mkdirSync(postDir);
    
    // Create images directory
    const imagesDir = path.join(postDir, 'images');
    fs.mkdirSync(imagesDir);
    
    // Prepare metadata
    const metadata = {
      title: title,
      date: date || new Date().toISOString().split('T')[0],
      excerpt: excerpt,
      tags: tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [],
      author: author || 'Battle With Bytes',
      coverImage: `/images/blog/${slug}/cover.png`
    };
    
    // Create meta.txt file
    const metaContent = Object.entries(metadata)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(item => `"${item}"`).join(', ')}]`;
        } else if (typeof value === 'string') {
          return `${key}: "${value}"`;
        }
        return `${key}: ${value}`;
      })
      .join('\n');
    
    fs.writeFileSync(path.join(postDir, 'meta.txt'), metaContent);
    
    // Create initial content
    const initialContent = `# ${title}\n\nYour content here...`;
    fs.writeFileSync(path.join(postDir, 'index.mdx'), initialContent);
    
    console.log(chalk.green(`\nBlog post created successfully!`));
    console.log(chalk.yellow(`Path: ${postDir}`));
    console.log(chalk.yellow(`Edit the content in: ${path.join(postDir, 'index.mdx')}`));
    console.log(chalk.yellow(`Add images to: ${imagesDir}`));
  } catch (error) {
    console.error(chalk.red(`Error creating blog post: ${error.message}`));
  }
}

// Function to delete a blog post
async function deleteBlogPost() {
  console.log(chalk.green.bold('\nDelete Blog Post\n'));
  
  try {
    const dirs = fs.readdirSync(BLOG_DIR);
    
    // Filter valid blog posts
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
          title: metadata.title || 'Untitled'
        };
      });
    
    if (posts.length === 0) {
      console.log(chalk.yellow('No blog posts found.'));
      return;
    }
    
    // Display the posts
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${chalk.cyan(post.title)} (${chalk.yellow(post.slug)})`);
    });
    
    // Ask which post to delete
    const indexInput = await question(chalk.cyan(`\nEnter the number of the post to delete (1-${posts.length}): `));
    const index = parseInt(indexInput, 10) - 1;
    
    if (isNaN(index) || index < 0 || index >= posts.length) {
      console.log(chalk.red('Invalid selection.'));
      return;
    }
    
    const selectedPost = posts[index];
    
    // Confirm deletion
    const confirmation = await question(chalk.red(`Are you sure you want to delete "${selectedPost.title}"? This cannot be undone. (y/N): `));
    
    if (confirmation.toLowerCase() !== 'y') {
      console.log(chalk.yellow('Deletion cancelled.'));
      return;
    }
    
    // Delete the post directory
    const postDir = path.join(BLOG_DIR, selectedPost.slug);
    fs.rmSync(postDir, { recursive: true, force: true });
    
    console.log(chalk.green(`Blog post "${selectedPost.title}" deleted successfully.`));
  } catch (error) {
    console.error(chalk.red(`Error deleting blog post: ${error.message}`));
  }
}

// Main menu function
async function showMainMenu() {
  console.log(chalk.green.bold('\n=== Battle With Bytes Blog Manager ===\n'));
  console.log('1. List blog posts');
  console.log('2. Create new blog post');
  console.log('3. Delete blog post');
  console.log('4. Exit');
  
  const choice = await question(chalk.cyan('\nEnter your choice (1-4): '));
  
  switch (choice) {
    case '1':
      await listBlogPosts();
      break;
    case '2':
      await createBlogPost();
      break;
    case '3':
      await deleteBlogPost();
      break;
    case '4':
      console.log(chalk.green('Exiting...'));
      rl.close();
      return;
    default:
      console.log(chalk.red('Invalid choice.'));
  }
  
  // Return to main menu
  await showMainMenu();
}

// Command-line interface setup
const program = new Command();

program
  .name('blog-manager')
  .description('CLI tool to manage blog posts for Battle With Bytes')
  .version('1.0.0');

program
  .command('list')
  .description('List all blog posts')
  .action(async () => {
    await listBlogPosts();
    rl.close();
  });

program
  .command('create')
  .description('Create a new blog post')
  .action(async () => {
    await createBlogPost();
    rl.close();
  });

program
  .command('delete')
  .description('Delete a blog post')
  .action(async () => {
    await deleteBlogPost();
    rl.close();
  });

// If no command is provided, show the interactive menu
if (process.argv.length <= 2) {
  showMainMenu();
} else {
  program.parse(process.argv);
}
