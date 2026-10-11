import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright";
import {
  SENSITIVE_PATTERNS,
  detectAndBlurSensitiveData,
} from "../../src/core/capturer/privacy.js";

describe("Privacy Blur Detection", () => {
  describe("Sensitive Regex Patterns", () => {
    it("should match OpenAI / generic API keys", () => {
      const apiKeyRule = SENSITIVE_PATTERNS.find((r) => r.name.includes("API Key"))!;
      expect(apiKeyRule.pattern.test("sk-abcdefghijklmnopqrstuvwxyz123456")).toBe(true);
      expect(apiKeyRule.pattern.test("pk_live_1234567890abcdefghijklmn")).toBe(true);
      expect(apiKeyRule.pattern.test("regular-word")).toBe(false);
    });

    it("should match AWS access keys", () => {
      const awsRule = SENSITIVE_PATTERNS.find((r) => r.name.includes("AWS"))!;
      expect(awsRule.pattern.test("AKIAIOSFODNN7EXAMPLE")).toBe(true);
      expect(awsRule.pattern.test("AKIA123")).toBe(false);
    });

    it("should match GitHub personal access tokens", () => {
      const ghRule = SENSITIVE_PATTERNS.find((r) => r.name.includes("GitHub"))!;
      expect(
        ghRule.pattern.test("ghp_123456789012345678901234567890123456"),
      ).toBe(true);
    });

    it("should match email addresses", () => {
      const emailRule = SENSITIVE_PATTERNS.find((r) => r.name.includes("Email"))!;
      expect(emailRule.pattern.test("dev.user@example.com")).toBe(true);
      expect(emailRule.pattern.test("not-an-email")).toBe(false);
    });
  });

  describe("Playwright In-DOM Detection and Blurring", () => {
    let browser: Browser;

    beforeAll(async () => {
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    });

    afterAll(async () => {
      await browser?.close();
    }, 20000);

    it("should detect sensitive text in DOM elements and apply blur", async () => {
      const page = await browser.newPage();
      try {
        await page.setContent(`
          <!DOCTYPE html>
          <html>
            <body>
              <header>
                <h1>Welcome to Admin Dashboard</h1>
              </header>
              <main>
                <div id="api-key-container">
                  <span>API Key: </span>
                  <code id="api-key">sk-1234567890abcdefghijklmnopqrstuvwxyz</code>
                </div>
                <div id="contact-info">
                  <p>Support: <span id="email">support@portfolio-swag.com</span></p>
                </div>
              </main>
            </body>
          </html>
        `);

        const blurRegions = await detectAndBlurSensitiveData(page, true);

        expect(blurRegions.length).toBeGreaterThanOrEqual(2);
        expect(blurRegions.some((r) => r.label.includes("API Key"))).toBe(true);
        expect(blurRegions.some((r) => r.label.includes("Email"))).toBe(true);

        // Verify CSS blur was applied to the elements
        const codeBlur = await page.$eval("#api-key", (el) =>
          window.getComputedStyle(el).filter,
        );
        expect(codeBlur).toContain("blur");

        const emailBlur = await page.$eval("#email", (el) =>
          window.getComputedStyle(el).filter,
        );
        expect(emailBlur).toContain("blur");
      } finally {
        await page.close();
      }
    });
  });
});
