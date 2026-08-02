import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrism from "rehype-prism-plus";
import * as Tabs from "@radix-ui/react-tabs";
import RadixTabs from "./RadixTabs";
import DropCap from "./DropCap";
import CodeBlock from "./CodeBlock";
import ImageWidget from "./ImageWidget";
import HDMIPinout from "./interactive/HDMIPinout/HDMIPinout";
import InteractiveCodeBlock from "./interactive/InteractiveCodeBlock";
import TooltipText from "./TooltipText";
import I2CDetectOutput from "./interactive/I2CDetectOutput";

// Define types for component props
type ComponentProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

/**
 * Shared MDX component map for blog posts and project pages.
 * Styling overrides render on the server; interactive widgets carry
 * their own "use client" directives.
 */
const mdxComponents = {
  h1: (props: ComponentProps) => (
    <h1
      className="text-3xl md:text-4xl font-bold font-mono mb-6 text-white glow-text"
      {...props}
    />
  ),
  h2: (props: ComponentProps) => (
    <h2
      className="text-2xl md:text-3xl font-bold font-mono mt-8 mb-4 text-green-400"
      {...props}
    />
  ),
  h3: (props: ComponentProps) => (
    <h3
      className="text-xl md:text-2xl font-bold font-mono mt-6 mb-3"
      {...props}
    />
  ),
  p: (props: ComponentProps) => (
    <p className="my-4 leading-relaxed" {...props} />
  ),
  a: (props: ComponentProps) => (
    <a className="text-green-400 hover:text-green-300 underline" {...props} />
  ),
  ul: (props: ComponentProps) => (
    <ul className="list-disc list-inside my-4 space-y-2" {...props} />
  ),
  ol: (props: ComponentProps) => (
    <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
  ),
  li: (props: ComponentProps) => <li className="ml-4" {...props} />,
  blockquote: (props: ComponentProps) => (
    <blockquote
      className="border-l-4 border-green-400 pl-4 my-4 italic bg-black/30 p-3"
      {...props}
    />
  ),
  code: (props: { children?: React.ReactNode; className?: string }) => {
    const { className, children, ...rest } = props;
    // Inline code (no language class)
    if (!className) {
      return (
        <code
          className="bg-gray-800 text-green-300 px-1 py-0.5 rounded font-mono text-sm"
          {...rest}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={`${className} block overflow-x-auto`} {...rest}>
        {children}
      </code>
    );
  },
  pre: (
    props: ComponentProps & {
      children?: React.ReactElement<{ className?: string }>;
    },
  ) => {
    const language = props.children?.props?.className
      ? props.children.props.className.replace("language-", "")
      : "";

    return (
      <pre
        className={`prism-code language-${language} bg-gray-900 p-4 rounded-md my-6 overflow-x-auto font-mono text-sm`}
      >
        {props.children}
      </pre>
    );
  },
  table: (props: ComponentProps) => (
    <div className="overflow-x-auto my-6">
      <table
        className="min-w-full bg-black/30 border border-gray-700 rounded-md"
        {...props}
      />
    </div>
  ),
  th: (props: ComponentProps) => (
    <th
      className="border border-gray-700 px-4 py-2 text-left font-mono text-green-400 bg-black/50"
      {...props}
    />
  ),
  td: (props: ComponentProps) => (
    <td className="border border-gray-700 px-4 py-2" {...props} />
  ),
  // Custom components available inside MDX content
  Image,
  Link,
  "Tabs.Root": Tabs.Root,
  "Tabs.List": Tabs.List,
  "Tabs.Trigger": Tabs.Trigger,
  "Tabs.Content": Tabs.Content,
  RadixTabs,
  DropCap,
  CodeBlock,
  HDMIPinout,
  InteractiveCodeBlock,
  TooltipText,
  I2CDetectOutput,
  ImageWidget,
};

interface MdxContentProps {
  /** Raw MDX source (frontmatter already stripped). */
  source: string;
}

/**
 * Server component that compiles and renders MDX at build time, so the
 * exported HTML contains the full article text for crawlers and no-JS
 * readers. Interactive widgets hydrate on the client as usual.
 */
export default function MdxContent({ source }: MdxContentProps) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            // Highlight fenced code blocks at build time so the exported
            // HTML ships coloured code (no post-hydration flash). Code
            // passed to <CodeBlock> as a prop still highlights client-side.
            [rehypePrism, { ignoreMissing: true }],
          ],
          format: "mdx",
        },
        parseFrontmatter: false,
      }}
    />
  );
}
