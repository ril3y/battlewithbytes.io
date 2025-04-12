import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts } from '@/lib/blog';
import { format } from 'date-fns';

export const metadata = {
  title: 'Blog | Battle With Bytes',
  description: 'Technical articles on cybersecurity, embedded hardware, and software engineering',
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const formattedDate = format(new Date(post.metadata.date), 'MMMM d, yyyy');
            
            return (
              <article 
                key={post.slug}
                className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                {post.metadata.coverImage && (
                  <Link href={`/blog/${post.slug}`} className="block relative w-full h-48">
                    <Image
                      src={post.metadata.coverImage}
                      alt={post.metadata.title}
                      fill
                      className="object-cover"
                    />
                  </Link>
                )}
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.metadata.tags.slice(0, 3).map((tag: string) => (
                      <Link 
                        href={`/blog/tag/${tag}`} 
                        key={tag}
                        className="bg-gray-800 text-green-400 px-2 py-1 rounded-full text-xs font-mono hover:bg-gray-700 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-green-400 transition-colors">
                      {post.metadata.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {post.metadata.excerpt}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{post.metadata.author}</span>
                    <time dateTime={post.metadata.date}>{formattedDate}</time>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
