import Link from 'next/link';
import Image from 'next/image';
import { getBlogPostsMetadata } from '@/lib/blog';
import { format } from 'date-fns';
import BlogCard from '@/components/BlogCard';

export const metadata = {
  title: 'Blog | Battle With Bytes',
  description: 'Technical articles on cybersecurity, embedded hardware, and software engineering',
};

export default function BlogPage() {
  const posts = getBlogPostsMetadata();
  
  // Debug: Log posts received by the page component
  console.log('[DEBUG PAGE] Posts received:', posts.map(p => ({
    slug: p.slug, 
    title: p.title,
    titleExists: Boolean(p.title)
  })));
  
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 glow-text">
            <span className="text-green-400">&lt;</span> Blog <span className="text-green-400">/&gt;</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Insights on cybersecurity, embedded hardware, and software engineering.
          </p>
        </header>
        
        {/* Debug info - only visible in development
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-700 rounded">
            <h3 className="text-lg font-mono mb-2">Debug Info:</h3>
            <p className="mb-2">Found {posts.length} posts</p>
            <ul className="list-disc pl-5 space-y-1">
              {posts.map(post => (
                <li key={post.slug}>
                  Slug: {post.slug} | Title: "{post.title}" | 
                  Title type: {typeof post.title} | 
                  Title empty: {String(!post.title)}
                </li>
              ))}
            </ul>
          </div>
        )} */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts && posts.length > 0 ? posts.map((post) => {
            let formattedDate = "No date";
            try {
              formattedDate = format(new Date(post.date || new Date()), 'MMMM d, yyyy');
            } catch (e) {
              console.error("Error formatting date:", e);
            }
            return (
              <BlogCard key={post.slug} post={post} formattedDate={formattedDate} />
            );
          }) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-400 text-lg">No blog posts found.</p>
              <p className="text-gray-500 mt-2">Check back soon for new content!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
