import { getBlogPostBySlug, getBlogSlugs } from '@/lib/blog';
import BlogPost from '@/components/BlogPost';
import { Metadata } from 'next';

// Define the params type
type Params = {
  slug: string;
};

// Define the page props according to Next.js 15 requirements
type PageProps = {
  params: Params;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Use destructuring to get the slug
  const { slug } = params;
  const post = getBlogPostBySlug(slug);
  
  return {
    title: `${post.metadata.title} | Battle With Bytes`,
    description: post.metadata.excerpt,
  };
}

export function generateStaticParams(): Array<Params> {
  const slugs = getBlogSlugs();
  return slugs.map(slug => ({ slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  // Use destructuring to get the slug
  const { slug } = params;
  const post = getBlogPostBySlug(slug);
  
  return (
    <main className="min-h-screen py-16 px-4">
      <BlogPost content={post.content} metadata={post.metadata} />
    </main>
  );
}
