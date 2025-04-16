import RadixTabs from './src/components/RadixTabs';
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    RadixTabs,
    ...components,
  };
}
