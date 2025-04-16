"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";

interface BlogCardProps {
  post: {
    slug: string;
    title?: string;
    coverImage?: string;
    tags?: string[];
    excerpt?: string;
    author?: string;
    date?: string;
  };
  formattedDate: string;
}

export default function BlogCard({ post, formattedDate }: BlogCardProps) {
  // Prevent card navigation when clicking a tag
  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="no-underline hover:no-underline text-decoration-none decoration-none group bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1 block focus:outline-none focus:ring-2 focus:ring-green-400"
      style={{ textDecoration: 'none' }}
      tabIndex={0}
      aria-label={post.title || 'Blog post'}
    >
      {post.coverImage ? (
        <div className="relative w-full h-56 md:h-64 overflow-hidden border-b border-gray-800">
          <Image
            src={post.coverImage}
            alt={post.title || "Blog post"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-56 md:h-64 bg-gray-900 flex items-center justify-center border-b border-gray-800">
          <span className="text-green-400 font-mono text-xl">&lt;/&gt;</span>
        </div>
      )}
      <div className="p-6">
        {/* Tags section */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <TagButton tag={tag} key={`${tag}-${index}`} />
            ))}
          </div>
        )}
        {/* Title section */}
        <h2 className="text-xl font-bold mb-3" style={{ textDecoration: 'none' }}>
          {post.title || "Untitled Post"}
        </h2>
        {/* Excerpt section */}
        {post.excerpt && (
          <p className="text-gray-400 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        {/* Author and date section */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span style={{ textDecoration: 'none' }}>{post.author || "Anonymous"}</span>
          <time dateTime={post.date || ""}>{formattedDate}</time>
        </div>
      </div>
    </Link>
  );
}

function TagButton({ tag }: { tag: string }) {
  const router = require('next/navigation').useRouter();
  return (
    <button
      type="button"
      className="no-underline hover:no-underline text-decoration-none decoration-none bg-gray-800 text-green-400 px-2 py-1 rounded-full text-xs font-mono hover:bg-gray-700 transition-colors"
      style={{ textDecoration: 'none' }}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/blog/tag/${tag}`);
      }}
      tabIndex={0}
      aria-label={`View posts tagged ${tag}`}
    >
      #{tag}
    </button>
  );
}
