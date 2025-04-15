import { getBlogPostBySlug, getBlogSlugs, getBlogPostMetadata } from '@/lib/blog';
import BlogPost from '@/components/BlogPost';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Define the params type
type Params = {
  slug: string;
};

// Define the page props according to Next.js 15 requirements
interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await the params before using them
  const resolvedParams = await params;
  // Fetch only metadata using the dedicated function
  const postMetadata = getBlogPostMetadata(resolvedParams.slug);
  
  // Handle case where post is not found
  if (!postMetadata) {
    return {
      title: 'Post Not Found | Battle With Bytes',
      description: 'The requested blog post could not be found.',
    };
  }
  
  return {
    title: `${postMetadata.title} | Battle With Bytes`,
    description: postMetadata.excerpt,
  };
}

export function generateStaticParams(): Array<Params> {
  const slugs = getBlogSlugs();
  return slugs.map(slug => ({ slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  // Await the params before using them
  const resolvedParams = await params;
  // Fetch the full post with serialized content, awaiting the promise
  const post = await getBlogPostBySlug(resolvedParams.slug);
  
  // If post is not found, render 404 page
  if (!post) {
    notFound();
  }
  
  return (
    <main className="min-h-screen py-16 px-4">
      {/* Pass the serialized content and metadata */}
      <BlogPost content={post.content} metadata={post.metadata} />
    </main>
  );
}
