// Temporarily serving the ComingSoon screen at /en. See app/page.tsx for the
// reactivation note.
import { ComingSoon } from "@/components/parts/coming-soon";
// import { Landing } from "@/components/landing";
// import { getAllPosts } from "@/lib/blog";
// import { projectsListLd } from "@/lib/jsonld";

export const revalidate = 3600;

export default function EnHomePage() {
  return <ComingSoon locale="en" />;
}
