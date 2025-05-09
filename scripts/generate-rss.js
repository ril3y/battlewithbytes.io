const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const matter = require('gray-matter');

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');
const SITE_URL = 'https://battlewithbytes.io'; // From seo.ts
const SITE_TITLE = 'Battle With Bytes | Cybersecurity, Hardware & Software Engineering'; // From seo.ts
const SITE_DESCRIPTION = 'Explore cybersecurity concepts, hardware projects, and software engineering tools with interactive calculators and in-depth tutorials.'; // From seo.ts

async function generateRSSFeed() {
  console.log('Generating RSS feed...');

  const feed = new RSS({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    feed_url: `${SITE_URL}/rss.xml`,
    site_url: SITE_URL,
    image_url: `${SITE_URL}/images/logo.png`, // Assuming you have a logo at public/images/logo.png
    managingEditor: 'Riley Porter', // Or your name/contact
    webMaster: 'Riley Porter',
    copyright: `${new Date().getFullYear()} Riley Porter`,
    language: 'en',
    categories: ['Cybersecurity', 'Hardware', 'Software Engineering', 'Technology'],
    pubDate: new Date().toUTCString(),
    ttl: 60, // Time to live in minutes
  });

  try {
    const postDirs = fs.readdirSync(BLOG_DIR);
    const allPosts = [];

    for (const dir of postDirs) {
      const fullPath = path.join(BLOG_DIR, dir);
      if (fs.statSync(fullPath).isDirectory()) {
        const mdxPath = path.join(fullPath, 'index.mdx');
        if (fs.existsSync(mdxPath)) {
          try {
            const fileContent = fs.readFileSync(mdxPath, 'utf-8');
            const { data: frontmatter } = matter(fileContent);

            if (frontmatter.title && frontmatter.date && frontmatter.excerpt && dir) {
              allPosts.push({
                title: frontmatter.title,
                description: frontmatter.excerpt,
                url: `${SITE_URL}/blog/${dir}`, // Use directory name as slug
                guid: `${SITE_URL}/blog/${dir}`, // Unique identifier
                categories: frontmatter.tags || [],
                author: frontmatter.author || 'Riley Porter',
                date: new Date(frontmatter.date), // Ensure it's a Date object for sorting and RSS
                // enclosure: frontmatter.coverImage ? { url: `${SITE_URL}${frontmatter.coverImage}` } : undefined,
              });
            } else {
              console.warn(`Skipping ${dir}: missing title, date, excerpt, or slug.`);
            }
          } catch (readError) {
            console.warn(`Could not read or parse frontmatter for ${dir}: ${readError.message}`);
          }
        }
      }
    }

    // Sort posts by date, newest first
    allPosts.sort((a, b) => b.date - a.date);

    // Add sorted posts to the feed
    allPosts.forEach(post => {
      feed.item(post);
    });

    const rssXml = feed.xml({ indent: true });
    fs.writeFileSync(path.join(process.cwd(), 'public', 'rss.xml'), rssXml);
    console.log('RSS feed generated successfully at public/rss.xml');

  } catch (error) {
    console.error('Error generating RSS feed:', error);
  }
}

if (require.main === module) {
  generateRSSFeed().catch(err => console.error(err));
}

module.exports = generateRSSFeed; // Export for potential programmatic use
