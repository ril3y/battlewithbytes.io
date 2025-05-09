"use client";

import { useState, useEffect } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import Prism from 'prismjs';
import * as Tabs from '@radix-ui/react-tabs';
import RadixTabs from './RadixTabs';
import DropCap from './DropCap';
import CodeBlock from './CodeBlock';
import HDMIPinout from './HDMIPinout/HDMIPinout';
import InteractiveCodeBlock from './InteractiveCodeBlock';
import TooltipText from './TooltipText';
import I2CDetectOutput from './I2CDetectOutput';
import { useMDXComponents } from '../../mdx-components';

// Import Prism core styles
import 'prismjs/themes/prism-tomorrow.css';

// Import Prism language components and styles
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// Define types for component props
type ComponentProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

// Custom components that can be used in MDX
const localComponents = {
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
    const { className, children, ...rest } = props;
    // If it's an inline code block (no language specified)
    if (!className) {
      return (
        <code className="bg-gray-800 text-green-300 px-1 py-0.5 rounded font-mono text-sm" {...rest}>
          {children}
        </code>
      );
    }
    
    // For code blocks with language specified by ```language
    const language = className.replace('language-', ''); // eslint-disable-line @typescript-eslint/no-unused-vars -- This specific variable is unused in this component's return
    return (
      <code className={`${className} block overflow-x-auto`} {...rest}>
        {children}
      </code>
    );
  },
  pre: (props: ComponentProps & { children?: React.ReactElement<{ className?: string }> }) => {
    // Extract the language from the className of the code element
    const language = props.children?.props?.className
      ? props.children.props.className.replace('language-', '')
      : '';
      
    return (
      <pre className={`prism-code language-${language} bg-gray-900 p-4 rounded-md my-6 overflow-x-auto font-mono text-sm`}>
        {props.children}
      </pre>
    );
  },
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
  Image, // This refers to the imported 'Image' from 'next/image'
  Link,  // This refers to the imported 'Link' from 'next/link'
  'Tabs.Root': Tabs.Root,
  'Tabs.List': Tabs.List,
  'Tabs.Trigger': Tabs.Trigger,
  'Tabs.Content': Tabs.Content,
  RadixTabs,
  DropCap,
  CodeBlock,
  HDMIPinout,
  InteractiveCodeBlock,
  TooltipText,
  I2CDetectOutput,
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

  // Combine global MDX components with local ones
  const mdxComponents = useMDXComponents(localComponents);

  // Use useEffect to ensure the MDX content only renders on the client side
  // and to initialize Prism.js highlighting
  useEffect(() => {
    setIsClient(true);
    // Use setTimeout to ensure DOM has been populated with code blocks
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        Prism.highlightAll();
      }
    }, 0);
  }, []);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header section outside of MDX content */}
      <div className="mb-6">
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
        <header className="mb-4">
          <h1 className="text-3xl md:text-5xl font-bold font-mono mb-4 text-white glow-text">
            {metadata.title}
          </h1>
          {metadata.excerpt && (
            <p className="text-green-300 text-xl font-mono mb-4">{metadata.excerpt}</p>
          )}
        </header>
      </div>
      
      {/* MDX Content */}
      <div className="prose prose-invert prose-green max-w-none bg-black/20 p-6 md:p-8 rounded-lg border border-gray-800/50 shadow-lg">
        {isClient ? (
          <MDXRemote {...content} components={mdxComponents} />
        ) : (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
          </div>
        )}
      </div>
      {/* Byline below content */}
      <div className="flex items-center justify-end text-gray-500 text-xs mt-4 font-mono">
        <span>{metadata.author}</span>
        <span className="mx-2">•</span>
        <time dateTime={metadata.date}>{formattedDate}</time>
      </div>
    </article>
  );
}
