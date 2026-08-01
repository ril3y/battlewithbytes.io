import MdxContent from "@/components/MdxContent";

interface ProjectContentProps {
  /** Raw MDX source; compiled server-side at build time. */
  content: string;
}

export default function ProjectContent({ content }: ProjectContentProps) {
  return (
    <article className="max-w-4xl mx-auto">
      <div className="py-4">
        <div className="mdx-content">
          <MdxContent source={content} />
        </div>
      </div>
    </article>
  );
}
