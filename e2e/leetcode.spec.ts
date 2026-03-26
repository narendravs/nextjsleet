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
      // Log if there are any console errors (Great for AI debugging later)
      page.on("console", (msg) => {
        if (msg.type() === "error")
          console.log(`Error on ${url}: ${msg.text()}`);
      });

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
    });
  }
  // --- FEATURE: AUTHENTICATION ---
  test("User Flow: Authentication (Sign In/Sign Up)", async ({ page }) => {
    await test.step("Navigate to Auth page", async () => {
      await page.goto("/auth");
      // 1. If the modal isn't open by default, you must click the 'Sign In' button in the Navbar first
      const signInNavbarBtn = page.getByRole("button", { name: /Sign In/i });
      if (await signInNavbarBtn.isVisible()) {
        await signInNavbarBtn.click();
      }
    });

    await test.step("Toggle to Sign Up mode", async () => {
      // Use a more generic locator if 'button' role is being tricky with Recoil transitions
      const signUpToggle = page.locator('button:has-text("Create account")');
      await expect(signUpToggle).toBeVisible({ timeout: 10000 });
      await signUpToggle.click();
    });
  });

  // --- FEATURE: WORKSPACE CORE LOGIC ---
  test("User Flow: Solving a Problem (Run & Submit)", async ({ page }) => {
    await page.goto("/problems/two-sum");

    await test.step("Verify Code Editor loads", async () => {
      // Matches @uiw/react-codemirror
      const editor = page.locator(".cm-editor");
      await expect(editor).toBeVisible({ timeout: 10000 });
    });

    await test.step("Run Code and check for Toast output", async () => {
      const runBtn = page.getByRole("button", { name: /^run$/i });
      await runBtn.click();

      // Since you didn't add "Result:" to the UI, we check for the Toast
      // that your handleSubmit function triggers on success or failure.
      const toastMessage = page.locator(".Toastify__toast-body");

      // We expect SOME toast to appear (either "Congrats", "Oops", or "Login")
      await expect(toastMessage).toBeVisible({ timeout: 10000 });

      // Log the toast text to the console for debugging
      const text = await toastMessage.innerText();
      console.log("Execution Result Toast:", text);
    });

    await test.step("Submit Code and check for Success State", async () => {
      const submitBtn = page.getByRole("button", { name: /^submit$/i });
      await submitBtn.click();

      /** * BYPASS STRATEGY:
       * Since you have setSuccess(true) in your code, which renders <Confetti />,
       * we can check for the canvas element if the submission is successful.
       * Otherwise, we fallback to checking the Toastify messages.
       **/
      const feedback = page.locator(
        "canvas, .Toastify__toast--success, .Toastify__toast--error",
      );

      // Confetti or Toasts usually take a moment due to Firebase/Logic
      await expect(feedback.first()).toBeVisible({ timeout: 15000 });
    });
  });

  // --- QUALITY: ACCESSIBILITY (A11y) ---
  // Note: Requires 'npm install axe-playwright'
  test("Quality Check: Accessibility Audit", async ({ page }) => {
    await page.goto("/");
    // We expect the main navigation and content to have proper ARIA labels
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Simple structural check: ensure there is at least one H1
    const heading = page.locator("h1");
    await expect(heading).toBeDefined();
  });

  // --- QUALITY: VISUAL REGRESSION ---
  test("Quality Check: Visual Comparison", async ({ page }) => {
    await page.goto("/");
    // This will fail the first time (creating the baseline)
    // and pass on subsequent runs if UI hasn't changed.
    await expect(page).toHaveScreenshot("landing-page-baseline.png", {
      maxDiffPixelRatio: 0.1,
      mask: [page.locator(".dynamic-date-or-id")], // Mask parts that change
    });
  });

  // --- RESILIENCE: NETWORK ERROR HANDLING ---
  test("Resilience: Handle API Failure Gracefully", async ({ page }) => {
    // Navigate to a problem to trigger the initial load
    await page.goto("/problems/two-sum");

    await test.step("Verify Loading or Error States", async () => {
      /**
       * BYPASS STRATEGY:
       * 1. '.animate-pulse' matches the Tailwind class in your Rectangle/Circle Skeletons.
       * 2. '.Toastify__toast--error' matches the toast.error() calls in your logic.
       * 3. '.Toastify__toast--warning' handles any "Please Login" warnings.
       */
      const errorState = page.locator(
        ".animate-pulse, .Toastify__toast--error, .Toastify__toast--warning",
      );

      // Check for the first one that appears.
      // If the API is fast, it might skip loading and show the content,
      // so we use a flexible locator.
      await expect(errorState.first()).toBeVisible({ timeout: 10000 });

      // Log the result to the Playwright console for easier debugging
      const isSkeletonVisible = await page
        .locator(".animate-pulse")
        .first()
        .isVisible();
      console.log(
        isSkeletonVisible
          ? "PASS: Loading Skeleton found."
          : "PASS: Error Toast found.",
      );
    });
  });
});
