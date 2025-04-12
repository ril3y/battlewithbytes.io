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
}

export function getAllProjects(): ProjectMetadata[] {
  const projectSlugs = fs.readdirSync(projectsDirectory);

  const projects = projectSlugs
    .map((slug) => {
      const fullPath = path.join(projectsDirectory, slug, 'index.mdx');
      if (!fs.existsSync(fullPath)) {
        return null; // Skip if index.mdx doesn't exist
      }
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || 'Untitled Project',
        description: data.description || 'No description available.',
        coverImage: data.coverImage || undefined,
        contentFile: data.contentFile || undefined,
      } as ProjectMetadata;
    })
    .filter((project): project is ProjectMetadata => project !== null)
    .sort((a, b) => a.title.localeCompare(b.title));

  return projects;
}
