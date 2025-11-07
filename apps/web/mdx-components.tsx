import RadixTabs from './src/components/RadixTabs';
import ImageWidget from './src/components/ImageWidget';
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    RadixTabs,
    ImageWidget,
    ...components,
  };
}
