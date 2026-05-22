import { Landing } from "@/components/landing";
import { getAllPosts } from "@/lib/blog";
import { projectsListLd } from "@/lib/jsonld";

export const revalidate = 3600;

export default async function EnHomePage() {
  const posts = await getAllPosts("en");
  return (
    <>
      <Landing locale="en" posts={posts} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsListLd()) }}
      />
    </>
  );
}
