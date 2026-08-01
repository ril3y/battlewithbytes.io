// src/app/projects/[slug]/page.tsx
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { ProjectMetadata } from "@/lib/utils/projects";
import { Metadata } from "next";
import { buildMetadata } from "@/lib/utils/seo";
import Image from "next/image";
import ProjectContent from "@/components/projects/ProjectContent";

const projectsDirectory = path.join(process.cwd(), "src/content/projects");

// Define the params type
type Params = {
  slug: string;
};

// Define the page props type - aligning with Next.js 15
interface ProjectPageProps {
  params: Promise<Params>; // Params is now a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>; // searchParams is also a Promise
}

// Function to get project data (metadata and raw MDX content)
async function getProjectData(slug: string): Promise<{
  metadata: ProjectMetadata;
  content: string | null;
} | null> {
  const indexPath = path.join(projectsDirectory, slug, "index.mdx");
  let indexData: matter.GrayMatterFile<string>;
  try {
    const indexFileContents = await fs.readFile(indexPath, "utf8");
    indexData = matter(indexFileContents);
  } catch (error) {
    console.error(`Error reading index file for slug "${slug}":`, error);
    return null;
  }

  const metadata: ProjectMetadata = {
    slug,
    title: indexData.data.title || "Untitled Project",
    description: indexData.data.description || "No description",
    coverImage: indexData.data.coverImage || undefined,
  };

  return {
    metadata,
    content: indexData.content.trim() ? indexData.content : null,
  };
}

// Static paths generation
export async function generateStaticParams(): Promise<Params[]> {
  const projectFiles = await fs.readdir(projectsDirectory);
  return projectFiles.map((projectDir) => ({ slug: projectDir }));
}

// Metadata generation
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  // Await the params Promise
  const resolvedParams = await params;
  const projectData = await getProjectData(resolvedParams.slug);

  if (!projectData) {
    // Return metadata for a 404 page if project not found
    return buildMetadata({
      title: "Project Not Found",
      description: "The requested project could not be found.",
    });
  }

  const { metadata } = projectData;

  return buildMetadata({
    title: metadata.title,
    description: metadata.description,
    canonical: `/projects/${resolvedParams.slug}`,
    ogImage: metadata.coverImage,
    type: "article",
  });
}

// The actual page component - corrected
export default async function ProjectPage({ params }: ProjectPageProps) {
  // Accept the props object
  // Await the params Promise before accessing slug
  const resolvedParams = await params;
  const { slug } = resolvedParams;

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
            <ProjectContent content={content} />
          ) : (
            <p className="text-gray-400 italic">Content coming soon...</p>
          )}
        </div>
      </div>
    </div>
  );
}
