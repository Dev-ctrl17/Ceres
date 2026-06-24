/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.image2url.com' },
      { protocol: 'https', hostname: 'lrmljudwbzjawafuztwp.supabase.co' },
      { protocol: 'https', hostname: 'luxurypropertiesltd.com.ng' },
    ],
  },
  async rewrites() {
    return [
      // Keep static landing pages accessible
      { source: '/landing/:path*', destination: '/landing/:path*' },
      // Keep blog HTML files accessible (will be migrated to app router later)
      { source: '/blog/:slug', destination: '/blog/:slug' },
    ];
  },
  experimental: {
    scrollRestoration: true,
  },
};

export default nextConfig;