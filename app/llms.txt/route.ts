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
    "",
    "### Black Hole — real-time general-relativistic ray tracer (Kerr/Schwarzschild geodesics, WebGL/WebGPU)",
    `- Simulator IT: ${site.url}/lab/buco-nero`,
    `- Simulator EN: ${site.url}/en/lab/black-hole`,
    `- WebGPU renderer IT: ${site.url}/lab/buco-nero/webgpu`,
    `- WebGPU renderer EN: ${site.url}/en/lab/black-hole/webgpu`,
    `- Playground (drop stars/planets/comets, tidal disruption) IT: ${site.url}/lab/buco-nero/playground`,
    `- Playground EN: ${site.url}/en/lab/black-hole/playground`,
    `- Orbit demo (exact timelike geodesics, ISCO, precession) IT: ${site.url}/lab/buco-nero/orbite`,
    `- Orbit demo EN: ${site.url}/en/lab/black-hole/orbit`,
    `- FAQ IT: ${site.url}/lab/buco-nero/faq`,
    `- FAQ EN: ${site.url}/en/lab/black-hole/faq`,
    `- Equations, physics and credits (what is exact vs stylized) IT: ${site.url}/lab/buco-nero/about`,
    `- Equations and credits EN: ${site.url}/en/lab/black-hole/about`,
    "",
    "### Solar System — to-scale orbital simulator with real ephemerides (JPL Horizons, SBDB catalog)",
    `- Simulator IT: ${site.url}/lab/sistema-solare`,
    `- Simulator EN: ${site.url}/en/lab/solar-system`,
    `- Manual IT: ${site.url}/lab/sistema-solare/manuale`,
    `- Manual EN: ${site.url}/en/lab/solar-system/manual`,
    `- Sources and roadmap IT: ${site.url}/lab/sistema-solare/about`,
    `- Sources and roadmap EN: ${site.url}/en/lab/solar-system/about`,
    "",
    "### Periodic Table — interactive 3D table, 118 elements, five historical atomic models",
    `- Interactive 3D Periodic Table IT: ${site.url}/lab/tavola-periodica`,
    `- Interactive 3D Periodic Table EN: ${site.url}/en/lab/periodic-table`,
    `- Sources and roadmap (what is exact vs illustrative) IT: ${site.url}/lab/tavola-periodica/about`,
    `- Sources and roadmap EN: ${site.url}/en/lab/periodic-table/about`,
    `- Manual IT: ${site.url}/lab/tavola-periodica/manuale`,
    `- Manual EN: ${site.url}/en/lab/periodic-table/manual`,
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
