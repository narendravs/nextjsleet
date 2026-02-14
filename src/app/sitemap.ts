import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7000";

  // You can fetch dynamic data here (e.g., list of problems) to generate URLs
  // Sitemaps do not support regex (e.g., /problems/*). You must list every URL explicitly.

  // Example: Fetch problem IDs from your database or constants
  const problemIds = ["two-sum", "reverse-integer", "palindrome-number"];
  const problemUrls: MetadataRoute.Sitemap = problemIds.map((id) => ({
    url: `${baseUrl}/problems/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    ...problemUrls,
  ];
}
