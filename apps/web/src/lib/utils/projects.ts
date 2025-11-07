import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const projectsDirectory = path.join(process.cwd(), 'src/content/projects');

export interface ProjectMetadata {
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  contentFile?: string; 
  date?: string;
  tags?: string[];
  author?: string;
  github?: string;
  demo?: string;
  enabled?: boolean;
  useThemeOverlay?: boolean; // Controls whether to apply a color overlay to project image
}

export function getAllProjects(): ProjectMetadata[] {
  const projectSlugs = fs.readdirSync(projectsDirectory);

  const projects = projectSlugs
    .map((slug) => {
      const fullPath = path.join(projectsDirectory, slug, 'index.mdx');
      if (!fs.existsSync(fullPath)) {
        return null; 
      }
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      if (typeof data.enabled !== 'undefined' && data.enabled === false) {
        return null;
      }

      return {
        slug,
        title: data.title || 'Untitled Project',
        description: data.description || data.excerpt || 'No description available.', 
        coverImage: data.coverImage || undefined,
        contentFile: data.contentFile || undefined, 
        date: data.date || undefined,
        tags: data.tags || [],
        author: data.author || undefined,
        github: data.github || undefined,
        demo: data.demo || undefined,
        enabled: typeof data.enabled !== 'undefined' ? data.enabled : true,
        useThemeOverlay: typeof data.useThemeOverlay !== 'undefined' ? data.useThemeOverlay : true, // Default to true
      } as ProjectMetadata;
    })
    .filter((project): project is ProjectMetadata => project !== null)
    .sort((a, b) => a.title.localeCompare(b.title));

  return projects;
}
