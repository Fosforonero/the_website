import { getAllPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const [itPosts, enPosts] = await Promise.all([
    getAllPosts("it"),
    getAllPosts("en"),
  ]);

  const lines = [
    "# Fosforonero",
    "",
    `Fosforonero is the independent software studio and lab of ${site.author.name}, based in ${site.author.city}.`,
    "The site publishes software projects, technical notes, experiments, and educational WebGL tools.",
    "",
    "## Core Pages",
    `- Home: ${site.url}/`,
    `- Blog: ${site.url}/blog`,
    `- Identity: ${site.url}/identita`,
    `- Privacy: ${site.url}/privacy`,
    `- Cookies: ${site.url}/cookies`,
    "",
    "## Lab",
    `- Interactive 3D Periodic Table: ${site.url}/lab/tavola-periodica`,
    `- Periodic Table sources and roadmap: ${site.url}/lab/tavola-periodica/about`,
    `- Periodic Table manual IT: ${site.url}/lab/tavola-periodica/manuale`,
    `- Periodic Table manual EN: ${site.url}/en/lab/periodic-table/manual`,
    "",
    "## Blog Posts IT",
    ...itPosts.map((post) => `- ${post.title}: ${site.url}/blog/${post.slug}`),
    "",
    "## Blog Posts EN",
    ...enPosts.map((post) => `- ${post.title}: ${site.url}/en/blog/${post.slug}`),
    "",
    "## Author",
    `- ${site.author.name}: ${site.url}`,
    `- Contact: mailto:${site.email}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
