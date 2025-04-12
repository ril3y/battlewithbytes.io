"use client";

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProjectMetadata } from '@/lib/utils/projects';

// Define types for component props
type ComponentProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

// Custom components that can be used in MDX - matching your blog styling
const components = {
  // Override default elements with custom styling
  h1: (props: ComponentProps) => (
    <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 text-white glow-text" {...props} />
  ),
  h2: (props: ComponentProps) => (
    <h2 className="text-2xl md:text-3xl font-bold font-mono mt-8 mb-4 text-green-400" {...props} />
  ),
  h3: (props: ComponentProps) => (
    <h3 className="text-xl md:text-2xl font-bold font-mono mt-6 mb-3" {...props} />
  ),
  p: (props: ComponentProps) => (
    <p className="my-4 leading-relaxed" {...props} />
  ),
  a: (props: ComponentProps) => (
    <a className="text-green-400 hover:text-green-300 underline" {...props} />
  ),
  ul: (props: ComponentProps) => (
    <ul className="list-disc list-inside my-4 space-y-2" {...props} />
  ),
  ol: (props: ComponentProps) => (
    <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
  ),
  li: (props: ComponentProps) => (
    <li className="ml-4" {...props} />
  ),
  blockquote: (props: ComponentProps) => (
    <blockquote className="border-l-4 border-green-400 pl-4 my-4 italic bg-black/30 p-3" {...props} />
  ),
  code: (props: { children?: React.ReactNode; className?: string }) => {
    const { className } = props;
    // If it's an inline code block (no language specified)
    if (!className) {
      return (
        <code className="bg-gray-800 text-green-300 px-1 py-0.5 rounded font-mono text-sm" {...props} />
      );
    }
    // For code blocks with language
    return (
      <code className={`${className} block overflow-x-auto`} {...props} />
    );
  },
  pre: (props: ComponentProps) => (
    <pre className="bg-gray-900 p-4 rounded-md my-6 overflow-x-auto font-mono text-sm" {...props} />
  ),
  table: (props: ComponentProps) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full bg-black/30 border border-gray-700 rounded-md" {...props} />
    </div>
  ),
  th: (props: ComponentProps) => (
    <th className="border border-gray-700 px-4 py-2 text-left font-mono text-green-400 bg-black/50" {...props} />
  ),
  td: (props: ComponentProps) => (
    <td className="border border-gray-700 px-4 py-2" {...props} />
  ),
  // Custom components
  Image,
  Link,
};

interface ProjectContentProps {
  content: string;
  metadata: ProjectMetadata;
}

// Function to manually process tables in MDX content
const preprocessMdxContent = (content: string): string => {
  // If the content doesn't contain any tables, return it as is
  if (!content.includes('|')) return content;
  
  // Replace any table content with HTML table elements
  const lines = content.split('\n');
  let inTable = false;
  let tableContent = '';
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a table line
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableContent = '<table className="min-w-full bg-black/30 border border-gray-700 rounded-md">\n<tbody>\n';
      }
      
      // Process header separator line (e.g., |---|---|)
      if (line.includes('---')) {
        continue; // Skip the separator line
      }
      
      // Process table row
      const cells = line.split('|').filter(cell => cell.trim() !== '');
      const isHeader = i > 0 && lines[i-1].includes('|') && lines[i+1] && lines[i+1].includes('---');
      
      tableContent += '<tr>\n';
      cells.forEach(cell => {
        if (isHeader) {
          tableContent += `  <th className="border border-gray-700 px-4 py-2 text-left font-mono text-green-400 bg-black/50">${cell.trim()}</th>\n`;
        } else {
          tableContent += `  <td className="border border-gray-700 px-4 py-2">${cell.trim()}</td>\n`;
        }
      });
      tableContent += '</tr>\n';
    } else {
      if (inTable) {
        inTable = false;
        tableContent += '</tbody>\n</table>';
        processedLines.push(tableContent);
        tableContent = '';
      }
      processedLines.push(line);
    }
  }
  
  // If we ended while still in a table
  if (inTable) {
    tableContent += '</tbody>\n</table>';
    processedLines.push(tableContent);
  }
  
  return processedLines.join('\n');
};

export default function ProjectContent({ content, metadata }: ProjectContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processMdx = async () => {
      try {
        // Preprocess content to handle tables
        const processedContent = preprocessMdxContent(content);
        
        const mdxSource = await serialize(processedContent, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            development: process.env.NODE_ENV === 'development',
          },
          parseFrontmatter: false,
        });
        setMdxSource(mdxSource);
        setError(null);
      } catch (err: unknown) {
        console.error('Error processing MDX:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error processing MDX content';
        setError(errorMessage);
      }
    };
    
    processMdx();
  }, [content]);
  
  return (
    <article className="max-w-4xl mx-auto">
      {/* Cover image already handled in the parent component */}
      
      {/* Content section with MDX */}
      <div className="py-4">
        {error ? (
          <div className="text-red-500 bg-red-900/20 p-4 rounded-md border border-red-500">
            <h3 className="font-bold mb-2">Error Rendering Content</h3>
            <p>{error}</p>
          </div>
        ) : mdxSource ? (
          <div className="mdx-content">
            <MDXRemote {...mdxSource} components={components} />
          </div>
        ) : (
          <div className="flex justify-center items-center p-12">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-gray-700 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-gray-700 rounded col-span-2"></div>
                    <div className="h-2 bg-gray-700 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
