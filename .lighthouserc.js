const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { execSync } = require("child_process");

// Check if we are running the server or the auditor
const isServer = process.argv.includes("server");

//  Declare the variable in the outer scope with a default value
let finalUrls = ["http://localhost:7000/"];

// ONLY run the URL scraping logic if we are NOT the server
if (!isServer) {
  const urlFilePath = path.join(__dirname, ".lhci-urls");
  try {
    console.log("🛠️  Syncing URLs from sitemap...");
    execSync("node get-urls.js", { stdio: "inherit" });

    if (fs.existsSync(urlFilePath)) {
      const content = fs.readFileSync(urlFilePath, "utf8").trim();
      if (content) {
        finalUrls = content
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean);
      }
    }
  } catch (err) {
    console.warn("⚠️  URL Sync failed.");
  }
}

// THE FIX: Export a PLAIN OBJECT, not a function
module.exports = {
  ci: {
    // SERVER CONFIG (This is what Render uses)
    server: {
      port: process.env.PORT || 10000,
      storage: {
        storageMethod: "sql",
        sqlDialect: "postgres",
        sqlConnectionUrl: process.env.LHCI_REMOTE_STORAGE__SQL_CONNECTION_URL,
      },
    },
    // COLLECT CONFIG (This is what GitHub Actions uses)
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
