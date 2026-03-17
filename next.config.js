/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
};

module.exports = nextConfig;
