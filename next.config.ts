import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 restricts `quality` to this allowlist and silently coerces
    // any other value to the nearest match — without it, quality={90}/{92}
    // in HeroBanner/HeroDetailModal get coerced to the [75] default.
    qualities: [75, 90, 92],
    remotePatterns: [
      // HTTPS sources (Unsplash demos, CDNs, any external image host)
      { protocol: "https", hostname: "**" },
      // HTTP sources (self-hosted backend on LAN / dev server)
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/upload/:path*',
        destination: `${apiUrl}/upload/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
