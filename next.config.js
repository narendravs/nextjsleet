/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // This stops the 'upstream' error by serving images as-is during tests
    // NOTE: Disabling this for CI/Testing drastically hurts performance scores.
    // It's better to ensure your CI environment can handle image optimization
    // (e.g., by installing `sharp` via `npm i sharp`).
    // Forcing optimization to get accurate Lighthouse scores:
    unoptimized: false,
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
