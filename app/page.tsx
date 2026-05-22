// IT (default locale) home page. Server Component.
import { Landing } from "@/components/landing";
import { getAllPosts } from "@/lib/blog";
import { projectsListLd } from "@/lib/jsonld";

export const revalidate = 3600; // ISR every hour — cheap, keeps blog in sync.

export default async function HomePage() {
  const posts = await getAllPosts("it");
  return (
    <>
      <Landing locale="it" posts={posts} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsListLd()) }}
      />
    </>
  );
}
