// src/app/projects/[slug]/page.tsx
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { getAllProjects, ProjectMetadata } from '@/lib/utils/projects';
import { Metadata } from 'next';
import { generateSEO, SEOProps } from '@/lib/utils/seo'; 
import Image from 'next/image';
import ProjectContent from '@/components/projects/ProjectContent';

const projectsDirectory = path.join(process.cwd(), 'src/content/projects');

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

async function getProjectData(slug: string): Promise<{ metadata: ProjectMetadata; content: string } | null> {
  const indexPath = path.join(projectsDirectory, slug, 'index.mdx');
  let contentFilePath = '';
  let indexData: matter.GrayMatterFile<string>;
  try {
    const indexFileContents = await fs.readFile(indexPath, 'utf8');
    indexData = matter(indexFileContents);
    const contentFileName = indexData.data.contentFile || 'content.mdx';
    contentFilePath = path.join(projectsDirectory, slug, contentFileName);
  } catch (error) {
      console.error(`Error reading index file for slug "${slug}":`, error);
      return null;
  }

  try {
    const contentFileContents = await fs.readFile(contentFilePath, 'utf8');
    const { content } = matter(contentFileContents);

    return {
      metadata: {
        slug,
        title: indexData.data.title || 'Untitled Project',
        description: indexData.data.description || 'No description',
        coverImage: indexData.data.coverImage || undefined,
        contentFile: indexData.data.contentFile || 'content.mdx',
      },
      content: content,
    };
  } catch (error) {
    console.error(`Error reading content file "${contentFilePath}" for slug "${slug}":`, error);
     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn(`Content file not found for slug "${slug}", returning empty content.`);
        return {
            metadata: {
                slug,
                title: indexData.data.title || 'Untitled Project',
                description: indexData.data.description || 'No description',
                coverImage: indexData.data.coverImage || undefined,
                contentFile: indexData.data.contentFile || 'content.mdx',
            },
            content: '', 
        };
    } else {
        return null;
    }
  }
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params: { slug } }: ProjectPageProps): Promise<Metadata> { 
    const projectData = await getProjectData(slug);
    if (!projectData) {
        const seoNotFound = generateSEO({ title: 'Project Not Found' });
        return {
            title: seoNotFound.title,
            description: seoNotFound.description,
        };
    }

    const seoProps: SEOProps = generateSEO({
        title: projectData.metadata.title,
        description: projectData.metadata.description,
        ogImage: projectData.metadata.coverImage, 
        type: 'article', 
        canonical: `/projects/${slug}`, 
    });

    return {
        title: seoProps.title,
        description: seoProps.description,
        keywords: seoProps.keywords,
        openGraph: {
            title: seoProps.title,
            description: seoProps.description,
            url: seoProps.canonical,
            type: 'article', // Explicitly set to 'article' for project pages
            images: seoProps.ogImage ? [{ url: seoProps.ogImage }] : [],
            siteName: 'Battle With Bytes', 
        },
        twitter: {
            card: 'summary_large_image',
            title: seoProps.title,
            description: seoProps.description,
            images: seoProps.ogImage ? [seoProps.ogImage] : [],
        },
        alternates: {
            canonical: seoProps.canonical,
        },
    };
}


export default async function ProjectPage({ params: { slug } }: ProjectPageProps) { 
  const projectData = await getProjectData(slug);

  if (!projectData) {
    notFound();
  }

  const { metadata, content } = projectData;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-green-400 tracking-wider font-orbitron">
          {metadata.title}
        </h1>
        
        {metadata.coverImage && (
          <div className="relative mb-8 aspect-video w-full max-h-[400px] overflow-hidden rounded-lg border border-green-500/30 bg-gray-900/50">
            <Image 
              src={metadata.coverImage} 
              alt={`${metadata.title} cover image`}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="mt-8 bg-gray-900/30 backdrop-blur-sm border border-green-500/30 rounded-lg shadow-lg p-6">
          {content ? (
            <ProjectContent content={content} metadata={metadata} />
          ) : (
            <p className="text-gray-400 italic">Content coming soon...</p>
          )}
        </div>
      </div>
    </div>
  );
}
