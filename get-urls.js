const fs = require("fs");
const path = require("path");

function getUrlsFromDisk() {
  try {
    // 1. Look for the sitemap file in your build output
    // Note: The exact path can vary by Next.js version, usually it's here:
    const possiblePath = path.join(
      process.cwd(),
      ".next/server/app/sitemap.xml.body",
    );
    // If it's a .meta file, it might be JSON. If it's .body, it's the XML.

    if (!fs.existsSync(possiblePath)) {
      console.log(
        "Sitemap file not found in build. Falling back to public/sitemap.xml",
      );
      // Check your public folder if the build one isn't there
      return ["http://localhost:7000/"];
    }

    const xml = fs.readFileSync(possiblePath, "utf8");

    // 2. Extract URLs using Regex (No sitemapper library needed!)
    const matches = xml.match(/<loc>(.*?)<\/loc>/g);
    if (!matches) return ["http://localhost:7000/"];

    const urls = matches
      .map((tag) => tag.replace(/<\/?loc>/g, ""))
      .map((url) => {
        // Change production URL to localhost:7000
        const pathOnly = new URL(url).pathname;
        return `http://localhost:7000${pathOnly}`;
      });

    fs.writeFileSync(".lhci-urls", urls.join(","));
    console.log("✅ URLs extracted from build files.");
  } catch (err) {
    console.error("❌ Failed to read disk:", err.message);
    fs.writeFileSync(".lhci-urls", "http://localhost:7000/");
  }
}

getUrlsFromDisk();
