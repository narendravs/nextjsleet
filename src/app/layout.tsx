import type { Metadata } from "next";
import Providers from "@/providers/Providers";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "LeetCode",
  description:
    "Web application that contains leetcode problems and video solutions.",
};

// Next.js 14+ separate viewport export for PWA optimization
export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white p-2 rounded">Skip to main content</a>
        <Providers>
          <main id="main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
