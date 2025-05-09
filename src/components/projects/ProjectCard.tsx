"use client";

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
      className="bg-gray-900/90 border border-green-500/30 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-green-500/20 flex flex-col focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
      style={{ textDecoration: 'none' }}
      aria-label={`View project: ${project.title}`}
    >
      {project.coverImage && (
        <div className="relative w-full h-48 group"> 
          <Image
            src={project.coverImage}
            alt={`${project.title} cover image`}
            layout="fill"
            objectFit="cover"
            className="opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />
          {/* Optional theme overlay - uses green color from the theme */}
          {project.useThemeOverlay !== false && (
            <div 
              className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-gray-900/60 mix-blend-multiply"
              aria-hidden="true"
            />
          )}
        </div>
      )}
      <div className="p-6 flex-grow relative"> 
        <h3 className="text-xl font-semibold text-green-400 mb-3 tracking-wide pr-8"> 
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm font-mono leading-relaxed">
          {project.description}
        </p>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevent Link navigation when clicking icon
            aria-label={`${project.title} GitHub repository`}
            className="absolute bottom-4 right-4 z-10 p-1 bg-gray-800 bg-opacity-0 rounded-full hover:bg-opacity-25 transition-colors duration-200" 
          >
            <svg
              width="24" 
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.304.762-1.604-2.665-.3-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.241 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        )}
      </div>
    </Link>
  );
};

export default ProjectCard;
