import React from 'react';
import { Metadata } from 'next';
import { getAllProjects } from '@/lib/utils/projects'; // Utility to fetch project data
import ProjectCard from '@/components/projects/ProjectCard'; // Component to display each project
import { generateSEO } from '@/lib/utils/seo'; // SEO utility

// Generate metadata for the projects page
export const metadata: Metadata = generateSEO({
  title: 'Projects',
  description: 'A collection of personal projects spanning cybersecurity, embedded systems, software development, and more.',
  keywords: ['projects', 'portfolio', 'cybersecurity', 'embedded systems', 'software engineering', 'hardware', 'reverse engineering', 'DIY'],
});

const ProjectsPage = () => {
  const projects = getAllProjects(); // Fetch all project metadata

  return (
    <div 
      className="py-12 min-h-screen"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.9)), url('/images/black.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-green-400 tracking-wider font-orbitron">
          PROJECTS
        </h1>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto font-mono">
          Exploring the intersections of hardware, software, and security. Here are some of the things I&apos;m currently working on or have built.
        </p>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 font-mono">No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
