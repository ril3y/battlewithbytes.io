import Link from 'next/link';
import Image from 'next/image';
import { getBlogPostsMetadata } from '@/lib/blog';
import { format } from 'date-fns';

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
            // Safely format the date, using a fallback if the date is invalid
            let formattedDate = "No date";
            try {
              formattedDate = format(new Date(post.date || new Date()), 'MMMM d, yyyy');
            } catch (e) {
              console.error("Error formatting date:", e);
            }
            
            return (
              <article 
                key={post.slug}
                className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.coverImage ? (
                    <div className="relative w-full h-56 md:h-64 overflow-hidden border-b border-gray-800">
                      <Image
                        src={post.coverImage}
                        alt={post.title || "Blog post"}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-56 md:h-64 bg-gray-900 flex items-center justify-center border-b border-gray-800">
                      <span className="text-green-400 font-mono text-xl">&lt;/&gt;</span>
                    </div>
                  )}
                </Link>
                
                <div className="p-6">
                  {/* Tags section */}
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Link 
                          href={`/blog/tag/${tag}`} 
                          key={`${tag}-${index}`}
                          className="bg-gray-800 text-green-400 px-2 py-1 rounded-full text-xs font-mono hover:bg-gray-700 transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Title section */}
                  <h2 className="text-xl font-bold mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-green-400 transition-colors">
                      {post.title || "Untitled Post"}
                    </Link>
                  </h2>
                  
                  {/* Excerpt section */}
                  {post.excerpt && (
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  
                  {/* Author and date section */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{post.author || "Anonymous"}</span>
                    <time dateTime={post.date || ""}>{formattedDate}</time>
                  </div>
                </div>
              </article>
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
