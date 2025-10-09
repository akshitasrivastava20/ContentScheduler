/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Cloudflare Pages compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
