import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: `Sviluppo software indipendente — ${site.author.name}, ${site.author.city}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#FBFBFA",
    theme_color: "#FBFBFA",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    lang: "it",
  };
}
