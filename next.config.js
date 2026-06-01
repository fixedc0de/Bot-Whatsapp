/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for Vercel serverless
  output: 'standalone',
  // Enable experimental features if needed
  experimental: {
    serverComponentsExternalPackages: ['@whiskeysockets/baileys'],
  },
  // Increase timeout for API routes (Vercel Pro feature)
  api: {
    responseLimit: false,
  },
};

module.exports = nextConfig;
