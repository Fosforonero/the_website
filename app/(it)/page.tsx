import { Landing } from "@/components/landing";
import { getAllPosts } from "@/lib/blog";
import { projectsListLd } from "@/lib/jsonld";

export const revalidate = 3600;

export default async function HomePage() {
  const posts = await getAllPosts("it");
  const jsonLd = projectsListLd();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing locale="it" posts={posts} />
    </>
  );
}
