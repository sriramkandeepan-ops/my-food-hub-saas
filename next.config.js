/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Security hardening: hides powered-by-nextjs header metrics
  eslint: {
    // Allows production build tracking to compile smoothly on Vercel 
    // while keeping automated verification tests isolated inside Playwright
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Enforces strict type tracking during production compilation
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;