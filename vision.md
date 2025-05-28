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

---

## 6. Site Analysis & Improvement Recommendations (2025 Update)

### 6.1 Current State Assessment

**Existing Content & Tools:**
- **Blog Posts (5):** Custom protocol decoders, I2C/HDMI hacks, PicoTag project, LoRa communication, IoT device analysis
- **Tools (3):** MOSFET Calculator, Ohm's Law Calculator, Wire Mapper
- **Components:** Well-structured with modular approach, good TypeScript coverage

### 6.2 Code Unification & Architecture Improvements

**Component Standardization Needed:**
1. **Styling Consistency:** 
   - Mix of CSS modules, Tailwind, and inline styles across components
   - **Recommendation:** Standardize on Tailwind with CSS modules only for complex animations
   - Create design system with consistent spacing, colors, typography

2. **TypeScript Interface Consistency:**
   - Some components use inline interfaces, others import from types
   - **Recommendation:** Create shared type definitions in `src/types/` for common patterns

3. **Component Organization:**
   - Move specialized components (HDMIPinout, I2CDetectOutput) to `src/components/interactive/`
   - Create shared UI components library in `src/components/ui/`

4. **State Management Patterns:**
   - Wire Mapper uses Zustand, other tools use useState
   - **Recommendation:** Standardize on Zustand for complex state, useState for simple forms

### 6.3 Suggested New Tools

**Hardware Engineering Tools:**
1. **Resistor Color Code Calculator**
   - Visual resistor with interactive color bands
   - Supports 4, 5, and 6-band resistors
   - Tolerance and PPM calculations

2. **PCB Trace Width Calculator**
   - Current carrying capacity calculator
   - Temperature rise calculations
   - Via sizing recommendations

3. **Signal Integrity Calculator**
   - Transmission line impedance
   - Rise time vs. trace length
   - Via inductance calculator

4. **Power Supply Design Calculator**
   - Buck/Boost converter calculations
   - Ripple calculations
   - Component selection helper

5. **Crystal Oscillator Calculator**
   - Load capacitance calculations
   - Frequency stability analysis
   - Temperature coefficient calculations

**Software/Security Tools:**
6. **CRC Calculator**
   - Multiple polynomial support (CRC8, CRC16, CRC32)
   - Visual bit-by-bit calculation
   - Code generation for embedded systems

7. **Number Base Converter**
   - Binary, Decimal, Hex, Octal
   - IEEE 754 floating point visualization
   - Two's complement calculator

8. **UART Baud Rate Calculator**
   - Error percentage calculations
   - Clock divider recommendations
   - Common baud rate reference

9. **Memory Layout Visualizer**
   - C struct padding visualization
   - Memory alignment calculator
   - Embedded memory map designer

10. **Checksum Generator**
    - Multiple algorithms (MD5, SHA1, SHA256, Fletcher)
    - File upload support
    - Embedded checksum code generation

### 6.4 Blog Post Ideas

**Hardware Deep Dives:**
1. **"Building a Logic Analyzer with RP2040"**
   - PIO programming for protocol capture
   - USB streaming implementation
   - Sigrok integration

2. **"Reverse Engineering Proprietary Protocols"**
   - Traffic analysis techniques
   - Pattern recognition in binary data
   - Custom decoder development

3. **"FPGA-based Signal Processing"**
   - DSP implementation in Verilog/VHDL
   - Real-time filtering techniques
   - Hardware acceleration patterns

4. **"Embedded Security: Hardware Root of Trust"**
   - Secure boot implementation
   - Hardware security modules
   - Side-channel attack mitigation

**Software Engineering:**
5. **"Building Real-time Systems with Rust"**
   - Embassy framework exploration
   - Memory safety in embedded contexts
   - Performance optimization techniques

6. **"WebAssembly for Embedded Visualization"**
   - Porting C algorithms to WASM
   - Performance comparison with JavaScript
   - Real-time data visualization

7. **"Modern C++ for Microcontrollers"**
   - C++20 features on embedded systems
   - Memory-efficient design patterns
   - Template metaprogramming for hardware abstraction

**Cybersecurity:**
8. **"Firmware Extraction and Analysis"**
   - JTAG/SWD debugging techniques
   - Flash memory dumping
   - Binary analysis workflows

9. **"Hardware Hacking: From PCB to Pwn"**
   - Circuit board reverse engineering
   - Finding test points and debug interfaces
   - Privilege escalation through hardware

10. **"Building a Hardware Security Testing Lab"**
    - Essential tools and equipment
    - Testing methodologies
    - Automated vulnerability discovery

### 6.5 Interactive Component Ideas

**Educational Visualizations:**
1. **Op-Amp Configuration Visualizer**
   - Interactive circuit diagrams
   - Real-time gain calculations
   - Frequency response plots

2. **Digital Filter Designer**
   - Visual filter design interface
   - Frequency response visualization
   - Code generation for different platforms

3. **Microcontroller Pinout Explorer**
   - Interactive pinout diagrams
   - Function multiplexing visualization
   - Code generation for pin configurations

4. **Protocol Decoder Playground**
   - Visual protocol analysis
   - Custom protocol definition
   - Sample data generation

### 6.6 Site Architecture Improvements

**Performance Optimizations:**
1. **Code Splitting:** Implement lazy loading for tool components
2. **Image Optimization:** WebP format with fallbacks
3. **Bundle Analysis:** Identify and remove unused dependencies

**User Experience:**
1. **Tool Integration:** Shared workspace for multiple tools
2. **Export Functionality:** PDF/PNG export for calculations
3. **Bookmarking:** Save and share tool configurations
4. **Mobile Optimization:** Touch-friendly interfaces for tools

**SEO & Discoverability:**
1. **Tool Sitemap:** Dedicated sitemap for tools
2. **Rich Snippets:** Structured data for tool results
3. **Social Sharing:** Tool-specific Open Graph images
4. **RSS Feed:** Tool updates and new releases

### 6.7 Technical Debt & Maintenance

**Priority Fixes:**
1. **Consistent Error Handling:** Standardize error boundaries and user feedback
2. **Accessibility:** ARIA labels, keyboard navigation, screen reader support
3. **Testing:** Unit tests for calculation functions, E2E tests for critical paths
4. **Documentation:** Component documentation, tool usage guides

**Code Quality:**
1. **ESLint Rules:** Enforce consistent code style
2. **Type Safety:** Eliminate any remaining `any` types
3. **Performance:** Memoization for expensive calculations
4. **Security:** Input validation and sanitization

### 6.8 Content Strategy

**Target Audience Expansion:**
- **Beginners:** Step-by-step tutorials with theory explanations
- **Professionals:** Advanced techniques and optimization strategies
- **Students:** Educational content with interactive examples

**Content Calendar Suggestions:**
- Monthly tool releases
- Bi-weekly blog posts
- Quarterly project showcases
- Annual technology review posts

*End of Updated PRD*
