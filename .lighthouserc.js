const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { execSync } = require("child_process");

// 1. Setup Paths
const urlFilePath = path.join(__dirname, ".lhci-urls");

// 2. Run the generator synchronously (runs immediately when file is loaded)
try {
  console.log("🛠️  Syncing URLs from sitemap...");
  execSync("node get-urls.js", { stdio: "inherit" });
} catch (err) {
  console.warn("⚠️  URL Sync failed.");
}

// 3. Read the file into a variable
let finalUrls = ["http://localhost:7000/"];
if (fs.existsSync(urlFilePath)) {
  const content = fs.readFileSync(urlFilePath, "utf8").trim();
  if (content) {
    finalUrls = content
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
  }
}

console.log("🚀 LHCI will audit these URLs:", finalUrls);

// 4. THE FIX: Export a PLAIN OBJECT, not a function
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npx dotenv -e .env -- npm run start",
      url: finalUrls, // No extra brackets, just the array
      numberOfRuns: 1,
      startServerReadyPattern: "ready",
      startServerReadyTimeout: 90000,
      settings: {
        maxWaitForFcp: 90000,
        pauseAfterLoadMs: 5000,
        // ADD THESE to disable mobile throttling for debugging
        throttlingMethod: "provided",
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
        chromeFlags: "--no-sandbox --disable-gpu",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "lhci",
      serverBaseUrl: process.env.LHCI_REMOTE_SERVER,
      token: process.env.LHCI_REMOTE_BUILD_TOKEN,
    },
  },
};
