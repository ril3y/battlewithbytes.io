import { getBlogPostsByTag, getAllTags } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Metadata } from 'next';

// Define the params type
type Params = {
  tag: string;
};

// Define the page props according to Next.js 15 requirements
type PageProps = {
  params: Params;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Use destructuring to get the tag
  const { tag } = params;
  
  return {
    title: `Posts Tagged with ${tag} | Battle With Bytes`,
    description: `Browse all blog posts tagged with ${tag} on Battle With Bytes.`,
  };
}

export function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(({ tag }) => ({ tag }));
}

export default async function TagPage({ params }: PageProps) {
  // Use destructuring to get the tag
  const { tag } = params;
  const posts = getBlogPostsByTag(tag);
  
  if (posts.length === 0) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">No posts found</h1>
          <p className="mb-8">No posts were found with the tag &quot;{tag}&quot;.</p>
          <Link href="/blog" className="button">Back to Blog</Link>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-block bg-gray-800 text-green-400 px-4 py-2 rounded-full text-lg font-mono mb-4">
            #{tag}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-mono mb-4">
            Posts Tagged with &quot;{tag}&quot;
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
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
                    {post.metadata.tags.map((t: string) => (
                      <Link 
                        href={`/blog/tag/${t}`} 
                        key={t}
                        className={`bg-gray-800 px-2 py-1 rounded-full text-xs font-mono ${
                          t.toLowerCase() === tag.toLowerCase() 
                            ? 'text-white border border-green-400' 
                            : 'text-green-400'
                        }`}
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-green-400 transition-colors">
                      {post.metadata.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-400 mb-4 text-sm line-clamp-3">
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
        
        <div className="mt-12 text-center">
          <Link 
            href="/blog" 
            className="inline-block bg-transparent border border-green-400 text-green-400 px-6 py-3 rounded-md font-mono hover:bg-green-400 hover:text-black transition-colors"
          >
            Back to All Posts
          </Link>
        </div>
      </div>
    </main>
  );
}
