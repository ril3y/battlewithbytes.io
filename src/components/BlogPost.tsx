"use client";

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

// Define types for component props
type ComponentProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

// Custom components that can be used in MDX
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

interface BlogPostProps {
  content: string;
  metadata: {
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    author: string;
    coverImage?: string;
  };
}

// Function to manually process tables in MDX content
const preprocessMdxContent = (content: string): string => {
  // If the content doesn't contain any tables, return it as is
  if (!content.includes('|')) return content;
  
  // Replace any table content with HTML table elements
  // This is a simple approach - for complex tables, a more robust parser would be needed
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

export default function BlogPost({ content, metadata }: BlogPostProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formattedDate = format(new Date(metadata.date), 'MMMM d, yyyy');
  
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
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header section outside of MDX content */}
      <div className="mb-12">
        {/* Cover image */}
        {metadata.coverImage && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={metadata.coverImage}
              alt={metadata.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {metadata.tags.map((tag: string) => (
            <Link 
              href={`/blog/tag/${tag}`} 
              key={tag}
              className="bg-gray-800 text-green-400 px-3 py-1 rounded-full text-xs font-mono hover:bg-gray-700 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
        
        {/* Title and metadata */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold font-mono mb-4 text-white glow-text">
            {metadata.title}
          </h1>
          <div className="flex items-center text-gray-400 text-sm">
            <span>{metadata.author}</span>
            <span className="mx-2">•</span>
            <time dateTime={metadata.date}>{formattedDate}</time>
          </div>
        </header>
      </div>
      
      {/* MDX Content */}
      <div className="prose prose-invert prose-green max-w-none bg-black/20 p-6 md:p-8 rounded-lg border border-gray-800/50 shadow-lg">
        {error ? (
          <div className="bg-red-900/30 border border-red-500 p-4 rounded-md text-red-300">
            <h3 className="text-xl font-bold mb-2">Error rendering content</h3>
            <p>{error}</p>
            <pre className="mt-4 p-2 bg-black/50 overflow-x-auto text-sm">{content.slice(0, 200)}...</pre>
          </div>
        ) : mdxSource ? (
          <MDXRemote {...mdxSource} components={components} />
        ) : (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-green-400">Loading content...</div>
          </div>
        )}
      </div>
    </article>
  );
}
