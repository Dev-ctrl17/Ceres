/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async redirects() {
        return [
            // Fix 3XX redirect chains: point legacy/duplicate URLs directly to canonical
            // destinations with a single 301 hop (no chained redirects).
            {
                source: "/properties/lekki-penthouse-old",
                destination: "/properties/lekki-penthouse",
                permanent: true,
            },
            {
                source: "/listings",
                destination: "/properties",
                permanent: true,
            },
            {
                source: "/homes",
                destination: "/properties",
                permanent: true,
            },
            {
                source: "/referrals",
                destination: "/dashboard/referrals",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;