/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "http://localhost:7000",
  generateRobotsTxt: true, // This automatically creates the robots.txt file
  sitemapSize: 7000,
  // Optional: exclude specific pages (like admin panels)
  exclude: ["/auth"],
  // This is the key:
  additionalPaths: async (config) => {
    // Manually define the slugs you have in your problems map
    const slugs = [
      "two-sum",
      "reverse-linked-list",
      "jump-game",
      "search-a-2d-matrix",
      "valid-parentheses",
    ];
    // Map them into the format next-sitemap expects
    return slugs.map((slug) => ({
      loc: `/problems/${slug}`,
      changefreq: "daily",
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }));
  },
};
