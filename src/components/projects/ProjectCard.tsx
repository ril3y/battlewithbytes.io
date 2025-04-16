import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { ProjectMetadata } from '@/lib/utils/projects'; 

interface ProjectCardProps {
  project: ProjectMetadata;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="bg-gray-900/50 border border-green-500/30 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-green-500/20 flex flex-col focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
      style={{ textDecoration: 'none' }}
      aria-label={`View project: ${project.title}`}
    >
      {project.coverImage && (
        <div className="relative w-full h-48">
          <Image
            src={project.coverImage}
            alt={`${project.title} cover image`}
            layout="fill"
            objectFit="cover"
            className="opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      )}
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-semibold text-green-400 mb-3 tracking-wide">
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm font-mono leading-relaxed">
          {project.description}
        </p>
      </div>
    </Link>
  );
};

export default ProjectCard;
