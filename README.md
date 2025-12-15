# Battle With Bytes

A modern, cyber-hacker themed personal website focused on cybersecurity, embedded hardware, and software engineering. Built with Next.js, featuring a professional dark theme, neon green accents, terminal-inspired design, and a modular, extensible content structure.

---

## 🚀 Features

- **Cyberpunk Aesthetic:** Dark background, neon green/blue/purple accents, monospace fonts, and terminal-inspired UI.
- **QuakeTerminal:** Drop-down terminal activated by pressing `~`.
- **Home, Blog, Tools, Projects, About:** Modular sections for all your content.
- **SEO Optimized:** Centralized SEO utilities, OpenGraph, JSON-LD, sitemap, robots.txt.
- **MDX Content:** Blogs and projects written in MDX with rich frontmatter.
- **Custom Tools:** Interactive calculators and engineering tools with a cohesive UI.
- **Fully Client-side:** Designed for GitHub Pages/static export—no server-side code.
- **Automated Content Management:** Scripts for creating, updating, and managing blog posts and projects.

---

## 🗂️ Directory Structure

```
├── public/
│   └── images/
│       ├── blog/
│       └── projects/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── content/
│   │   ├── blog/         # Blog posts (MDX)
│   │   └── projects/     # Projects (MDX)
│   └── lib/utils/seo.ts  # SEO utilities
├── scripts/              # Content management scripts
│   ├── blog-manager.js
│   ├── create-blog-post.js
│   ├── project-manager.js
│   └── ...
├── package.json
├── README.md
└── ...
```

---

## ⚡ Getting Started

### 1. **Install Dependencies**

```sh
pnpm install
```

### 2. **Run the Development Server**

```sh
pnpm dev
```

- Open [http://localhost:3000](http://localhost:3000) to view your site.

### 3. **Build for Production**

```sh
pnpm build
```

### 4. **Export Static Site**

```sh
pnpm export
```

### 5. **Deploy to GitHub Pages**

```sh
pnpm deploy
```

---

## 📝 Content Management Scripts

### **Blog Management**

- **Interactive Blog Manager:**
  ```sh
  pnpm blog
  ```

  - List, create, update, or delete blog posts interactively.
- **Create Blog Post (Quick):**
  ```sh
  node scripts/create-blog-post.js
  ```

  - Guided prompts for title, slug, excerpt, tags, etc.

### **Project Management**

- **Interactive Project Manager:**
  ```sh
  pnpm project
  ```

  - List, create, update, delete, enable, or disable projects interactively.

### **Other Scripts**

- **generate-blog-data.js:** Generates blog data for static export.
- **deploy-gh-pages.js:** Deploys the site to GitHub Pages.

---

## ✍️ Writing Content (Blog & Projects)

- **Blog posts:** Place MDX files in `src/content/blog/[slug]/index.mdx`.
- **Projects:** Place MDX files in `src/content/projects/[slug]/index.mdx`.
- **Frontmatter Example:**

  ```md
  ---
  title: "Your Title"
  date: "2025-04-17"
  excerpt: "Short summary of your post or project."
  tags: ["tag1", "tag2"]
  author: "Battle With Bytes"
  enabled: true
  ---

  Your content goes here...
  ```

- **Images:** Place in `public/images/blog/[slug]/` or `public/images/projects/[slug]/`.
- **Cover Images:** Reference as `/images/blog/[slug]/cover.png` or `/images/projects/[slug]/cover.png`.

---

## 🎨 Design & Aesthetic

- **Theme:** Dark, high-contrast, neon-accented cyberpunk.
- **Fonts:** Monospace (Geist Mono), modern sans (Geist Sans).
- **Terminal UI:** Includes a drop-down QuakeTerminal and terminal-inspired elements.
- **Accessibility:** Semantic HTML, alt text for images, keyboard navigation.

---

## 🔒 Security & Best Practices

- No server-side code—fully static and safe for GitHub Pages.
- Follows Next.js, ESLint, and Prettier conventions.
- Sensitive data should always use environment variables (never hardcoded).
- All interactive elements use best practices for accessibility and security.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15+
- **Languages:** TypeScript, JavaScript, MDX
- **Styling:** Tailwind CSS, Custom CSS
- **Content:** MDX, Markdown
- **Deployment:** GitHub Pages, gh-pages
- **SEO:** OpenGraph, JSON-LD, sitemap.xml, robots.txt

---

## 🧑‍💻 Developer Notes

- **Scripts:** All content management is handled via interactive scripts (`pnpm blog`, `pnpm project`).
- **Image Optimization:** Optimize images manually or with VS Code extensions before placing in `public/images`.
- **Testing:** Run `pnpm test` to ensure all tests pass before deploying.
- **Customization:** Update theme colors, accent variables, and fonts in `src/app/globals.css`.
- **Adding Tools:** Place new calculators or utilities in `src/components/tools/` and register them in the Tools page.

---

## 🤝 Contributing & Feedback

- Pull requests are welcome!
- For feature requests or bug reports, open an issue on GitHub.

---

## 📚 Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [MDX Documentation](https://mdxjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GitHub Pages](https://pages.github.com/)

---

> _Battle With Bytes: A hub for hackers, makers, and engineers._
