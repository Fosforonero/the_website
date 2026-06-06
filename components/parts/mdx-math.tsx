// KaTeX-rendered math for MDX blog posts. The blog uses next-mdx-remote/rsc
// without a math plugin (remark-math/rehype-katex aren't installed), so we expose
// <Math> (display) and <Mi> (inline) as MDX components that render server-side
// with the katex already in the bundle. Authoring note: pass LaTeX in the `tex`
// prop with DOUBLED backslashes (MDX strings are JS-escaped), e.g.
//   <Math tex="\\dot M_{\\rm fb} \\propto t^{-5/3}" />
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
