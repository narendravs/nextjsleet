/** @type {import('next').NextConfig} */
const nextConfig = {
  // OPTIONAL: Since you are on Vercel, this is the modern standard
  output: "standalone",

  // Ensures your Tailwind/PostCSS works correctly in production
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  experimental: {
    optimizePackageImports: ["react-icons"],
    outputFileTracingExcludes: {
      "*": [
        "node_modules/@playwright/**",
        "node_modules/lighthouse/**",
        "node_modules/puppeteer/**",
        "node_modules/@lhci/**",
      ],
    },
  },
};

module.exports = nextConfig;
