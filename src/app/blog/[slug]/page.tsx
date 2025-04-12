import { getBlogPostBySlug, getBlogSlugs } from '@/lib/blog';
import BlogPost from '@/components/BlogPost';
import { Metadata } from 'next';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPostBySlug(params.slug);
  
  return {
    title: `${post.metadata.title} | Battle With Bytes`,
    description: post.metadata.excerpt,
  };
}

export function generateStaticParams() {
  const slugs = getBlogSlugs();
  return slugs.map(slug => ({ slug }));
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const post = getBlogPostBySlug(slug);
  
  return (
    <main className="min-h-screen py-16 px-4">
      <BlogPost content={post.content} metadata={post.metadata} />
    </main>
  );
}
