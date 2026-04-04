/** @type {import('next').NextConfig} */
const nextConfig = {
  // THE FIX: Stops the "Maximum call stack size" error immediately
  outputFileTracing: false,
  // OPTIONAL: Since you are on Vercel, this is the modern standard
  output: "standalone",

  // Ensures your Tailwind/PostCSS works correctly in production
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
};

module.exports = nextConfig;
