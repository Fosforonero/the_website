import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Best practice 2026: enable strict typed routes
  typedRoutes: true,
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
