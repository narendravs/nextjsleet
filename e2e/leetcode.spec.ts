import { test, expect } from "@playwright/test";
import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import path from "path";

// 1. Read and parse the sitemap you just generated
const sitemapPath = path.resolve(__dirname, "../public/sitemap-0.xml");
const sitemapXml = fs.readFileSync(sitemapPath, "utf8");
const parser = new XMLParser();
const sitemapJson = parser.parse(sitemapXml);

// 2. Extract the URLs from the <urlset><url><loc> structure
const urls = sitemapJson.urlset.url.map((entry: any) => {
  const fullUrl = entry.loc;
  // Convert http://localhost:7000/path to just /path for the test runner
  return new URL(fullUrl).pathname;
});

test.describe("Sitemap Smoke Tests", () => {
  for (const url of urls) {
    // Skip the sitemap itself if it's in the list
    if (url.endsWith(".xml")) continue;

    test(`Verify page loads: ${url}`, async ({ page }) => {
      // Navigate to the page
      await page.goto(url, {
        waitUntil: url === "/auth" ? "networkidle" : "domcontentloaded",
        timeout: 60000,
      });

      // Check for common failure signs
      await expect(page).not.toHaveTitle(/404/);

      // Verify main content exists (adjust selector to your app's main container)
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Log if there are any console errors (Great for AI debugging later)
      page.on("console", (msg) => {
        if (msg.type() === "error")
          console.log(`Error on ${url}: ${msg.text()}`);
      });
    });
  }
});
