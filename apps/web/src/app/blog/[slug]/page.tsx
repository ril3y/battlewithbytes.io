import {
  getBlogPostBySlug,
  getBlogSlugs,
  getBlogPostMetadata,
} from "@/lib/blog";
import BlogPost from "@/components/BlogPost";
import MdxContent from "@/components/MdxContent";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata, generateArticleSchema } from "@/lib/utils/seo";

// Define the params type
type Params = {
  slug: string;
};

// Define the page props according to Next.js 15 requirements
interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Await the params before using them
  const resolvedParams = await params;
  // Fetch only metadata using the dedicated function
  const postMetadata = getBlogPostMetadata(resolvedParams.slug);

  // Handle case where post is not found
  if (!postMetadata) {
    return {
      title: "Post Not Found | Battle With Bytes",
      description: "The requested blog post could not be found.",
    };
  }

  return buildMetadata({
    title: postMetadata.title,
    description: postMetadata.excerpt,
    keywords: postMetadata.tags,
    canonical: `/blog/${resolvedParams.slug}`,
    ogImage: postMetadata.coverImage,
    type: "article",
    publishedAt: postMetadata.date,
  });
}

export function generateStaticParams(): Array<Params> {
  const slugs = getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
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

  const articleSchema = generateArticleSchema(
    post.metadata.title,
    post.metadata.excerpt,
    `/blog/${resolvedParams.slug}`,
    post.metadata.date,
    undefined,
    post.metadata.coverImage,
  );

  return (
    <main className="min-h-screen py-16 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* MDX compiles server-side; BlogPost is the interactive client shell */}
      <BlogPost metadata={post.metadata}>
        <MdxContent source={post.content} />
      </BlogPost>
    </main>
  );
}
