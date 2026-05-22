import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin Turbopack to this project root — there's an outer package-lock.json
  // higher up the filesystem that Turbopack would otherwise infer.
  turbopack: {
    root: path.resolve(),
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // typedRoutes disabled: getLocalePath / interpolated href strings can't
  // satisfy Next 16's literal route types. Re-enable when navigation is
  // refactored around the Route<T> helper.
  typedRoutes: false,
  // Long-term immutable caching for static assets is handled by Next; we only
  // override response headers where SEO requires it.
  async headers() {
    return [
      {
        // Static OG images & icons: aggressive cache
        source: "/(favicon.ico|icon.svg|apple-icon.png|opengraph-image|twitter-image)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
