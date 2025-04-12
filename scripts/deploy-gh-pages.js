#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Helper function to recursively delete directory
function deleteFolderRecursive(pathToDelete) {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach((file) => {
      const curPath = path.join(pathToDelete, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToDelete);
  }
}

// Set the environment variable for production
process.env.NODE_ENV = 'production';

console.log('🚀 Starting GitHub Pages deployment...');

try {
  // Step 1: Generate blog data
  console.log('📝 Generating blog data...');
  execSync('node scripts/generate-blog-data.js', { stdio: 'inherit' });

  // Step 2: Clean the output directory if it exists
  const outDir = path.join(process.cwd(), 'out');
  if (fs.existsSync(outDir)) {
    console.log('🧹 Cleaning output directory...');
    deleteFolderRecursive(outDir);
  }

  // Step 3: Run the build command
  console.log('🏗️ Building static site...');
  execSync('pnpm next build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Step 4: Deploy to GitHub Pages
  console.log('🚀 Deploying to GitHub Pages...');
  execSync('pnpm gh-pages -d out', { 
    stdio: 'inherit'
  });

  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
