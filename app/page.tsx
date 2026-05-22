// IT (default locale) home page. Server Component.
//
// Temporarily serving the ComingSoon screen at "/" while the full landing
// is being finalised. The other routes (/blog, /privacy, /cookies, etc.)
// stay live. To restore the full landing: swap ComingSoon for Landing and
// re-enable the projectsListLd JSON-LD script (the import is below for
// quick reactivation).
import { ComingSoon } from "@/components/parts/coming-soon";
// import { Landing } from "@/components/landing";
// import { getAllPosts } from "@/lib/blog";
// import { projectsListLd } from "@/lib/jsonld";

export const revalidate = 3600;

export default function HomePage() {
  return <ComingSoon locale="it" />;
}
