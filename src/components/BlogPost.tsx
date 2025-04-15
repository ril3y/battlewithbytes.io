"use client";

import { useState, useEffect } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

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
  content: MDXRemoteSerializeResult;
  metadata: {
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    author: string;
    coverImage?: string;
  };
}

export default function BlogPost({ content, metadata }: BlogPostProps) {
  const [isClient, setIsClient] = useState(false);
  const formattedDate = format(new Date(metadata.date), 'MMMM d, yyyy');

  // Use useEffect to ensure the MDX content only renders on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

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
        {isClient ? (
          <MDXRemote {...content} components={components} />
        ) : (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
          </div>
        )}
      </div>
    </article>
  );
}
