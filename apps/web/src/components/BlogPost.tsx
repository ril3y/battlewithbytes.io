"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import Prism from "prismjs";
import GiscusComments from "./GiscusComments";

// Import Prism core styles
import "prismjs/themes/prism-tomorrow.css";

// Import Prism language components and styles
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

interface BlogPostProps {
  /** Server-rendered MDX content (see MdxContent). */
  children: React.ReactNode;
  metadata: {
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    author: string;
    coverImage?: string;
  };
}

export default function BlogPost({ children, metadata }: BlogPostProps) {
  const formattedDate = format(new Date(metadata.date), "MMMM d, yyyy");

  // Syntax-highlight code blocks after hydration; the article HTML itself
  // is prerendered at build time so crawlers and no-JS readers get the
  // full text.
  useEffect(() => {
    Prism.highlightAll();
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
            <p className="text-green-300 text-xl font-mono mb-4">
              {metadata.excerpt}
            </p>
          )}
        </header>
      </div>

      {/* MDX content, rendered on the server and passed in as children */}
      <div className="prose prose-invert prose-green max-w-none bg-black/20 p-6 md:p-8 rounded-lg border border-gray-800/50 shadow-lg">
        {children}
      </div>
      {/* Byline below content */}
      <div className="flex items-center justify-end text-gray-500 text-xs mt-4 font-mono">
        <span>{metadata.author}</span>
        <span className="mx-2">•</span>
        <time dateTime={metadata.date}>{formattedDate}</time>
      </div>

      {/* Comments */}
      <GiscusComments />
    </article>
  );
}
