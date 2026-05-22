// Global MDX component overrides. Use this to swap in <Link>, <Image>,
// custom callouts, etc., when MDX content uses those tags.
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // Example: add a custom <Callout> usable in any .mdx file
  };
}
