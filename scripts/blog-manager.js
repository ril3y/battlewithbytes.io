#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const { Command } = require('commander');
const matter = require('gray-matter'); // Import gray-matter

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
const IMAGES_DIR_NAME = 'images'; // Standard name for image directories

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
    let postCount = 0;

    for (const dir of dirs) {
      const fullPath = path.join(BLOG_DIR, dir);
      if (fs.statSync(fullPath).isDirectory()) {
        const mdxPath = path.join(fullPath, 'index.mdx');

        if (fs.existsSync(mdxPath)) {
          try {
            const fileContent = fs.readFileSync(mdxPath, 'utf-8');
            const { data: frontmatter } = matter(fileContent);

            if (frontmatter.title && frontmatter.date) {
              postCount++;
              console.log(chalk.cyan(`- ${frontmatter.title}`));
              console.log(`  Slug: ${dir}`);
              console.log(`  Date: ${frontmatter.date}`);
              if (frontmatter.excerpt) {
                console.log(`  Excerpt: ${frontmatter.excerpt.substring(0, 60)}...`);
              }
              if (frontmatter.tags && frontmatter.tags.length > 0) {
                console.log(`  Tags: ${frontmatter.tags.join(', ')}`);
              }
              console.log(''); // Add spacing
            } else {
               console.log(chalk.yellow(`- ${dir} (Missing title or date in frontmatter)`));
               console.log('');
            }
          } catch (readError) {
            console.warn(chalk.yellow(`Could not read or parse frontmatter for ${dir}: ${readError.message}`));
          }
        }
      }
    }

    if (postCount === 0) {
      console.log(chalk.yellow('No valid blog posts found.'));
    }
  } catch (error) {
    console.error(chalk.red('Error listing blog posts:'), error);
  }
}


// Function to update blog data JSON (Calls the separate generation script)
async function updateBlogData() {
    console.log(chalk.blue('Updating blog data JSON...'));
    try {
      // Assuming generate-blog-data.js is executable and in the same directory
      require('./generate-blog-data.js'); // Execute the script
    } catch (error) {
      console.error(chalk.red('Failed to update blog data:'), error);
    }
  }

// Function to create a new blog post
async function createBlogPost() {
  console.log(chalk.blue.bold('\nCreate New Blog Post\n'));

  const title = await question(chalk.yellow('Enter post title: '));
  if (!title) {
    console.log(chalk.red('Title cannot be empty. Aborting.'));
    return;
  }

  const slug = sanitizeSlug(title);
  const postDir = path.join(BLOG_DIR, slug);

  if (fs.existsSync(postDir)) {
    console.log(chalk.red(`Directory already exists for slug: ${slug}. Aborting.`));
    return;
  }

  const date = new Date().toISOString().split('T')[0]; // Default to today's date YYYY-MM-DD
  const excerpt = await question(chalk.yellow(`Enter excerpt (short summary): `));
  const tagsInput = await question(chalk.yellow(`Enter tags (comma-separated, optional): `));
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  const author = await question(chalk.yellow(`Enter author (default: Riley Porter): `)) || 'Riley Porter';


  // Create directories
  const imagesDir = path.join(postDir, IMAGES_DIR_NAME);
  const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'blog', slug);
  
  fs.mkdirSync(postDir, { recursive: true });
  fs.mkdirSync(imagesDir); // Create images subdirectory in content folder
  fs.mkdirSync(publicImagesDir, { recursive: true }); // Create corresponding public images directory
  
  console.log(chalk.green(`\nDirectories created:`));
  console.log(`  Content: ${imagesDir}`);
  console.log(`  Public: ${publicImagesDir}`);

  // Create frontmatter string
  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
slug: "${slug}"
date: "${date}"
excerpt: "${excerpt.replace(/"/g, '\\"')}"
tags: [${tags.map(tag => `"${tag.replace(/"/g, '\\"')}"`).join(', ')}]
author: "${author.replace(/"/g, '\\"')}"
coverImage: "./images/cover.png"
---

# ${title}

Start writing your blog post content here...

<!-- Example image: -->
<!-- ![Alt text](./images/your-image.png) -->

<!-- Remember to add your cover image to the images directory and update the coverImage field in the frontmatter above. -->
`;

  // Create index.mdx file
  const mdxPath = path.join(postDir, 'index.mdx');
  fs.writeFileSync(mdxPath, frontmatter);

  console.log(chalk.green(`\nBlog post created successfully!`));
  console.log(`  Directory: ${postDir}`);
  console.log(`  MDX File: ${mdxPath}`);
  console.log(`  Images Dir: ${imagesDir}`);

  await updateBlogData(); // Update blog data after creating post
}


// Function to delete a blog post
async function deleteBlogPost() {
    console.log(chalk.red.bold('\nDelete Blog Post\n'));

    const dirs = fs.readdirSync(BLOG_DIR)
        .filter(dir => fs.statSync(path.join(BLOG_DIR, dir)).isDirectory());

    if (dirs.length === 0) {
        console.log(chalk.yellow('No blog posts found to delete.'));
        return;
    }

    console.log(chalk.yellow('Select a post to delete:'));
    dirs.forEach((dir, index) => {
        console.log(`${index + 1}: ${dir}`);
    });
    console.log('0: Cancel');

    const choice = await question(chalk.yellow('Enter the number of the post to delete: '));
    const index = parseInt(choice, 10) - 1;

    if (isNaN(index) || index < -1 || index >= dirs.length) {
        console.log(chalk.red('Invalid choice. Aborting.'));
        return;
    }

    if (index === -1) {
      console.log(chalk.blue('Deletion cancelled.'));
      return;
    }

    const slugToDelete = dirs[index];
    const postDirToDelete = path.join(BLOG_DIR, slugToDelete);

    const confirm = await question(chalk.red(`Are you sure you want to permanently delete "${slugToDelete}" and its contents? (yes/no): `));

    if (confirm.toLowerCase() === 'yes') {
        try {
            fs.rmSync(postDirToDelete, { recursive: true, force: true });
            console.log(chalk.green(`Successfully deleted post: ${slugToDelete}`));
            await updateBlogData(); // Update blog data after deleting post
        } catch (error) {
            console.error(chalk.red(`Error deleting post ${slugToDelete}:`), error);
        }
    } else {
        console.log(chalk.blue('Deletion cancelled.'));
    }
}

// Main menu function
async function showMainMenu() {
  console.log(chalk.magenta.bold('\n--- Blog Manager ---'));
  console.log('1: List Blog Posts');
  console.log('2: Create New Blog Post');
  console.log('3: Delete Blog Post');
  console.log('4: Update Blog Data JSON');
  console.log('0: Exit');

  const choice = await question(chalk.yellow('Choose an option: '));

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
      await updateBlogData();
      break;
    case '0':
      console.log(chalk.blue('Exiting Blog Manager.'));
      rl.close();
      process.exit(0); // Ensure the process exits cleanly
      return; // Added return for clarity, though process.exit stops execution
    default:
      console.log(chalk.red('Invalid choice. Please try again.'));
  }

  // Keep the menu looping unless explicitly exiting
   if (choice !== '0') {
      await showMainMenu(); // Recursive call to show menu again
   }
}

// Command-line interface setup using Commander
const program = new Command();

program
  .name('blog-manager')
  .description('CLI tool to manage blog posts')
  .version('1.1.0'); // Updated version

program
  .command('list')
  .description('List all blog posts')
  .action(async () => {
    await listBlogPosts();
    rl.close(); // Close readline after action
  });

program
  .command('create')
  .description('Create a new blog post')
  .action(async () => {
    await createBlogPost();
    rl.close(); // Close readline after action
  });

program
  .command('delete')
  .description('Delete a blog post')
  .action(async () => {
    await deleteBlogPost();
    rl.close(); // Close readline after action
  });

program
  .command('update-data')
  .description('Generate the blog data JSON file')
  .action(async () => {
    await updateBlogData();
    rl.close(); // Close readline after action
  });


// If no command is specified, show the interactive menu
if (process.argv.length <= 2) {
    showMainMenu();
} else {
    program.parse(process.argv);
}

// Ensure readline closes if Commander handles the command
// This might be redundant if actions always close rl, but adds safety
program.on('command:*', () => {
    if (!rl.closed) {
        rl.close();
    }
});