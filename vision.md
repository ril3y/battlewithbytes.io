# Battle With Bytes - High-Level Design PRD

## 1. Vision & Purpose

**Battle With Bytes** is a personal hub for sharing insights on cybersecurity, embedded hardware, and software engineering through a diverse mix of content.
**Tagline:** _Ask me about little data._
**Primary Goals:**
- Provide a platform for high-quality, technical blog entries.
- Host multiple single page applications (SPAs), including engineering calculators (e.g., a MOSFET power calculator).
- Create an engaging, hacker-inspired user experience while keeping things minimal and functional.

## 2. Goals & Objectives

- **Content Hub:**  
  - **Blogs:** Create a dynamic blog system where each blog post is authored in Markdown (or MDX) and automatically rendered by Next.js.
  - **Technical Write-Ups:** Include posts on topics like embedded development, cybersecurity, and reverse engineering.

- **Tool Integration:**  
  - **Single Page Applications (SPAs):**  
    - Host independent tools such as a MOSFET calculator.
    - Explore converting existing React.js SPAs into the Next.js ecosystem (as submodules or micro frontends).
  - **Modular Architecture:**  
    - Enable easy addition and maintenance of diverse tools and applications, ensuring each tool is self-contained but integrated under the unified site theme.

- **Deployment & Hosting:**  
  - Leverage GitHub Pages for hosting the static build.
  - Use Next.js export mode for static site generation.
  - Map the custom domain [battlewithbytes.io](https://battlewithbytes.io).

## 3. Technical Approach

### 3.1 Framework & Tooling

- **Next.js (with TypeScript & TailwindCSS):**
  - Build the core site with Next.js using an `app/` directory structure.
  - Set up static site generation (`output: 'export'`) for GitHub Pages compatibility.

- **MDX for Blog Posts:**
  - Enable MDX to write rich Markdown-based blog entries.
  - Organize posts in a dedicated directory (e.g., `src/content/blog`).

- **Single Page Applications:**
  - Integrate tools (e.g., MOSFET calculator) as:
    - **Converted Components:** Rewrite or adapt React.js components to Next.js.
    - **Submodule/iframe Approach:** Temporarily embed the existing tool as an isolated submodule with a dedicated route (e.g., `src/app/tools/mosfet`).

### 3.2 Project Structure

```
/battlewithbytes.io
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage with branding & overview
│   │   ├── blog/                 # Blog routes (index, [slug].tsx)
│   │   ├── tools/                # Tools & calculators routes
│   │   ├── about/                # About/Bio page
│   │   ├── projects/             # Project showcases
│   │   └── uses/                 # Stack, tools, and hardware/software list
│   ├── content/
│   │   └── blog/                 # Blog posts written in MDX
│   └── styles/                   # Tailwind and custom CSS styles
├── next.config.ts                # Next.js configuration for static export & MDX
├── package.json
└── tailwind.config.ts            # Tailwind configuration with custom hacker theme
```

### 3.3 Deployment

- **GitHub Pages Deployment:**
  - Use `next export` to generate a static site.
  - Automate deployment using a script (via `gh-pages`) in the package.json:
    ```json
    "scripts": {
      "build": "next build",
      "export": "next export",
      "deploy": "pnpm build && pnpm export && gh-pages -d out"
    }
    ```
- **Custom Domain Setup:**  
  - Update DNS settings to point `battlewithbytes.io` to GitHub Pages.
  - Configure a CNAME file in the static export folder if necessary.

## 4. Considerations & Open Questions

- **Blog System:**
  - Should blog posts be integrated directly in Next.js or managed via a headless CMS?
  - Evaluate pros/cons: Direct Markdown files are simple but may need additional features (e.g., tagging, search).

- **Tool Integration:**
  - Is the MOSFET calculator best rewritten in Next.js, or can we embed it via an iframe?
  - Assess if other tools warrant standalone conversion or if they can be managed as isolated submodules.

- **Maintenance & Scalability:**
  - Ensure the site structure supports future expansion (additional SPAs, new blog categories, etc.).
  - Keep the codebase modular to allow for easy updates and integration of new features.

## 5. Next Steps

1. **Initialize Project Structure:**  
   Set up directories and required configuration as outlined.

2. **Set Up MDX & Tailwind:**  
   Configure Next.js for MDX for blog posts and establish a custom Tailwind theme.

3. **Convert/Integrate Tools:**  
   Decide on converting the MOSFET calculator and configure it within the `/tools` route.

4. **Deploy & Test:**  
   Perform a full build, deploy to GitHub Pages, and test the site using your domain.

5. **Iterate on Content & Features:**  
   Start adding blog posts, tool demos, and iterate based on feedback.

*End of PRD*
