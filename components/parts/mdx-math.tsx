// KaTeX-rendered math for MDX blog posts. The blog uses next-mdx-remote/rsc
// without a math plugin (remark-math/rehype-katex aren't installed), so we expose
// <Math> (display) and <Mi> (inline) as MDX components that render server-side
// with the katex already in the bundle. Authoring note: pass LaTeX in the `tex`
// prop with SINGLE backslashes — a double-quoted MDX/JSX attribute is a literal
// string and is NOT JS-escaped, so `\\mu` would reach KaTeX as a line break plus
// the text "mu". Write it as you would in a .tex file, e.g.
//   <Math tex="\dot M_{\rm fb} \propto t^{-5/3}" />
// (In .tsx files — like the about page's `eqs` arrays — strings ARE JS-escaped,
//  so there you do need doubled backslashes: "\\dot M".)
import katex from "katex";

export function Math({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: true });
  return (
    <span
      className="blog-math"
      style={{ display: "block", overflowX: "auto", overflowY: "hidden", margin: "1.4em 0" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function Mi({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
