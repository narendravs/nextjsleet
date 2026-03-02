/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // This stops the 'upstream' error by serving images as-is during tests
    unoptimized: process.env.NODE_ENV === "test" || !!process.env.CI,

    // Allows PNG, JPG, WebP (Defaults)
    formats: ["image/avif", "image/webp"],

    // Allows SVG
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Remote images (if you ever use them)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
