#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const matter = require('gray-matter');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

const PROJECTS_DIR = path.join(process.cwd(), 'src', 'content', 'projects');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'projects');

if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function sanitizeSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

async function listProjects() {
  const dirs = fs.readdirSync(PROJECTS_DIR);
  let count = 0;
  for (const dir of dirs) {
    const fullPath = path.join(PROJECTS_DIR, dir);
    if (fs.statSync(fullPath).isDirectory()) {
      const mdxPath = path.join(fullPath, 'index.mdx');
      if (fs.existsSync(mdxPath)) {
        const fileContent = fs.readFileSync(mdxPath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);
        if (frontmatter.title) {
          count++;
          console.log(chalk.green(`${count}. ${frontmatter.title} (${dir})`));
        }
      }
    }
  }
  if (count === 0) console.log(chalk.yellow('No projects found.'));
}

async function createProject() {
  console.log(chalk.cyan('\nCreate New Project'));
  const title = await question('Title: ');
  let slugInput = await question('Slug (URL-friendly name): ');
  const slug = sanitizeSlug(slugInput);
  console.log(`Using sanitized slug: "${slug}"`);
  const excerpt = await question('Short description: ');
  const tagsInput = await question('Tags (comma-separated): ');
  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  const author = await question('Author (default: "Battle With Bytes"): ') || 'Battle With Bytes';
  const github = await question('GitHub URL (optional): ');
  const demo = await question('Live Demo URL (optional): ');

  const projectDir = path.join(PROJECTS_DIR, slug);
  const imageDir = path.join(IMAGES_DIR, slug);

  if (fs.existsSync(projectDir)) {
    console.log(chalk.red(`\nError: Project with slug "${slug}" already exists!`));
    return;
  }
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(imageDir, { recursive: true });

  const today = new Date().toISOString().split('T')[0];
  const mdxContent = `---\ntitle: "${title}"\ndate: "${today}"\nexcerpt: "${excerpt}"\ntags: [${tags.map(t => `"${t}"`).join(', ')}]\nauthor: "${author}"\ngithub: "${github}"\ndemo: "${demo}"\n---\n\n// Write your project content here\n`;
  fs.writeFileSync(path.join(projectDir, 'index.mdx'), mdxContent);
  console.log(chalk.green(`\nProject "${title}" created at ${projectDir}`));
}

async function updateProject() {
  console.log(chalk.cyan('\nUpdate Project'));
  const dirs = fs.readdirSync(PROJECTS_DIR).filter(dir => fs.statSync(path.join(PROJECTS_DIR, dir)).isDirectory());
  if (dirs.length === 0) {
    console.log(chalk.yellow('No projects to update.'));
    return;
  }
  dirs.forEach((dir, i) => console.log(`${i + 1}. ${dir}`));
  const idx = parseInt(await question('Select project number to update: '), 10) - 1;
  if (idx < 0 || idx >= dirs.length) {
    console.log(chalk.red('Invalid selection.'));
    return;
  }
  const projectDir = path.join(PROJECTS_DIR, dirs[idx]);
  const mdxPath = path.join(projectDir, 'index.mdx');
  if (!fs.existsSync(mdxPath)) {
    console.log(chalk.red('Project MDX file not found.'));
    return;
  }
  let { data: frontmatter, content } = matter(fs.readFileSync(mdxPath, 'utf-8'));
  console.log(chalk.yellow('Leave blank to keep existing value.'));
  const title = await question(`Title (${frontmatter.title}): `) || frontmatter.title;
  const excerpt = await question(`Short description (${frontmatter.excerpt}): `) || frontmatter.excerpt;
  const tagsInput = await question(`Tags (comma-separated) (${frontmatter.tags.join(', ')}): `);
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : frontmatter.tags;
  const author = await question(`Author (${frontmatter.author}): `) || frontmatter.author;
  const github = await question(`GitHub URL (${frontmatter.github || ''}): `) || frontmatter.github || '';
  const demo = await question(`Live Demo URL (${frontmatter.demo || ''}): `) || frontmatter.demo || '';
  const today = frontmatter.date || new Date().toISOString().split('T')[0];
  const newFrontmatter = { title, date: today, excerpt, tags, author, github, demo };
  const newContent = matter.stringify(content, newFrontmatter);
  fs.writeFileSync(mdxPath, newContent);
  console.log(chalk.green('Project updated.'));
}

async function deleteProject() {
  console.log(chalk.cyan('\nDelete Project'));
  const dirs = fs.readdirSync(PROJECTS_DIR).filter(dir => fs.statSync(path.join(PROJECTS_DIR, dir)).isDirectory());
  if (dirs.length === 0) {
    console.log(chalk.yellow('No projects to delete.'));
    return;
  }
  dirs.forEach((dir, i) => console.log(`${i + 1}. ${dir}`));
  const idx = parseInt(await question('Select project number to delete: '), 10) - 1;
  if (idx < 0 || idx >= dirs.length) {
    console.log(chalk.red('Invalid selection.'));
    return;
  }
  const projectDir = path.join(PROJECTS_DIR, dirs[idx]);
  const confirm = await question(`Are you sure you want to delete "${dirs[idx]}"? This cannot be undone! (yes/no): `);
  if (confirm.toLowerCase() === 'yes') {
    fs.rmSync(projectDir, { recursive: true, force: true });
    const imageDir = path.join(IMAGES_DIR, dirs[idx]);
    if (fs.existsSync(imageDir)) fs.rmSync(imageDir, { recursive: true, force: true });
    console.log(chalk.green('Project deleted.'));
  } else {
    console.log(chalk.yellow('Delete cancelled.'));
  }
}

async function toggleProjectEnabled() {
  console.log(chalk.cyan('\nEnable/Disable Project'));
  const dirs = fs.readdirSync(PROJECTS_DIR).filter(dir => fs.statSync(path.join(PROJECTS_DIR, dir)).isDirectory());
  if (dirs.length === 0) {
    console.log(chalk.yellow('No projects to enable/disable.'));
    return;
  }
  dirs.forEach((dir, i) => console.log(`${i + 1}. ${dir}`));
  const idx = parseInt(await question('Select project number: '), 10) - 1;
  if (idx < 0 || idx >= dirs.length) {
    console.log(chalk.red('Invalid selection.'));
    return;
  }
  const projectDir = path.join(PROJECTS_DIR, dirs[idx]);
  const mdxPath = path.join(projectDir, 'index.mdx');
  if (!fs.existsSync(mdxPath)) {
    console.log(chalk.red('Project MDX file not found.'));
    return;
  }
  let { data: frontmatter, content } = matter(fs.readFileSync(mdxPath, 'utf-8'));
  const currentlyEnabled = frontmatter.enabled === true;
  console.log(`Current status: ${currentlyEnabled ? chalk.green('Enabled') : chalk.red('Disabled')}`);
  const action = await question('Do you want to enable or disable this project? (enable/disable/cancel): ');
  if (action.toLowerCase() === 'enable') {
    if (currentlyEnabled) {
      console.log(chalk.yellow('Project is already enabled.'));
      return;
    }
    frontmatter.enabled = true;
    const newContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(mdxPath, newContent);
    console.log(chalk.green('Project enabled.'));
  } else if (action.toLowerCase() === 'disable') {
    if (!currentlyEnabled) {
      console.log(chalk.yellow('Project is already disabled.'));
      return;
    }
    frontmatter.enabled = false;
    const newContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(mdxPath, newContent);
    console.log(chalk.green('Project disabled.'));
  } else {
    console.log(chalk.yellow('No changes made.'));
  }
}

async function showMainMenu() {
  while (true) {
    console.log(chalk.magenta('\n--- Project Manager ---'));
    console.log('1. List projects');
    console.log('2. Create new project');
    console.log('3. Update project');
    console.log('4. Delete project');
    console.log('5. Enable/Disable project');
    console.log('6. Exit');
    const choice = await question('Select an option: ');
    switch (choice) {
      case '1': await listProjects(); break;
      case '2': await createProject(); break;
      case '3': await updateProject(); break;
      case '4': await deleteProject(); break;
      case '5': await toggleProjectEnabled(); break;
      case '6': rl.close(); return;
      default: console.log(chalk.red('Invalid choice.'));
    }
  }
}

showMainMenu();
