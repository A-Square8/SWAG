/**
 * Image Renderer — renders Instagram post slides using HTML templates and Playwright.
 */

import { readFile } from "node:fs/promises";
import { chromium, type Browser } from "playwright";
import type { PostPlan, PostRenderResult, PostSlide } from "../../../types/index.js";
import { ThemeEngine } from "../../theme/index.js";
import { BrandKitManager } from "../../brand/index.js";
import { AssetManager } from "../../assets/index.js";
import { OutputManager } from "../../output/index.js";
import { generateSlideHtml } from "./templates.js";
import { join, resolvePath, fileToDataUrl } from "../../../utils/fs.js";
import { SwagError } from "../../../utils/errors.js";
import { logger } from "../../../utils/logger.js";

const log = logger.child("renderer:image");

export interface RenderInstagramPostOptions {
  projectPath: string;
  plan: PostPlan;
  preview?: boolean;
}

export class ImageRenderer {
  /**
   * Render an Instagram post plan into versioned PNG slide images.
   */
  public static async renderInstagramPost(
    options: RenderInstagramPostOptions,
  ): Promise<PostRenderResult> {
    const { projectPath, plan, preview = false } = options;

    log.info(
      `Rendering Instagram post (${plan.slides.length} slides, ${plan.aspectRatio}) for: ${projectPath}`,
    );

    // 1. Load theme & brand kit
    const { theme } = await ThemeEngine.getTheme(projectPath);
    const { brandKit } = await BrandKitManager.getBrandKit(projectPath);

    // 2. Prepare output folder (e.g. swag-output/instagram-post/v1/)
    const folderInfo = await OutputManager.getNextVersionFolder(
      projectPath,
      "instagram-post",
    );

    const width = 1080;
    const height = plan.aspectRatio === "4:5" ? 1350 : 1080;

    // 3. Launch Playwright
    let browser: Browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (err) {
      throw new SwagError(
        "RENDER_FAILED",
        `Could not launch browser for image rendering: ${err instanceof Error ? err.message : String(err)}`,
        "Ensure Playwright Chromium is installed via 'npx playwright install chromium'.",
      );
    }

    const outputPaths: string[] = [];

    try {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: preview ? 1 : 2,
      });

      const page = await context.newPage();

      // Read logo as data URL if available
      let logoDataUrl: string | undefined;
      const logoFilePath = await BrandKitManager.resolveLogoFilePath(projectPath, brandKit);
      if (logoFilePath) {
        const dataUrl = await fileToDataUrl(logoFilePath);
        if (dataUrl) {
          logoDataUrl = dataUrl;
          log.info(`Resolved brand logo from: ${logoFilePath}`);
        }
      }

      // 4. Render each slide
      for (let i = 0; i < plan.slides.length; i++) {
        const slide = plan.slides[i];
        const slideNumber = i + 1;
        const totalSlides = plan.slides.length;

        // Resolve asset data URL if referenced
        let assetDataUrl: string | undefined;
        if (slide.content.assetId) {
          const asset = await AssetManager.getAsset(projectPath, slide.content.assetId);
          if (asset) {
            const assetPath = resolvePath(projectPath, asset.filePath);
            const dataUrl = await fileToDataUrl(assetPath);
            if (dataUrl) {
              assetDataUrl = dataUrl;
            }
          }
        }

        const html = generateSlideHtml({
          slide,
          slideNumber,
          totalSlides,
          theme,
          brandKit,
          aspectRatio: plan.aspectRatio,
          assetDataUrl,
          logoDataUrl,
        });

        await page.setContent(html, { waitUntil: "domcontentloaded" });
        // Brief pause for web fonts to load
        await page.waitForTimeout(300);

        const slideFileName = `slide-${String(slideNumber).padStart(2, "0")}.png`;
        const slideFilePath = join(folderInfo.dirPath, slideFileName);

        await page.screenshot({
          path: slideFilePath,
          type: "png",
        });

        outputPaths.push(slideFilePath);
        log.info(`Rendered slide ${slideNumber}/${totalSlides}: ${slideFileName}`);
      }

      await page.close();
      await context.close();
    } finally {
      await browser.close();
    }

    // 5. Write metadata.json
    await OutputManager.writeMetadata(folderInfo.metadataPath, {
      version: folderInfo.version,
      platform: "instagram-post",
      format: plan.format,
      aspectRatio: plan.aspectRatio,
      slideCount: plan.slides.length,
      caption: plan.caption,
      hashtags: plan.hashtags,
      altText: plan.altText,
      slides: plan.slides,
      files: outputPaths,
    });

    log.info(`Instagram post render complete: version v${folderInfo.version}`);

    return {
      success: true,
      outputPaths,
      metadataPath: folderInfo.metadataPath,
      version: folderInfo.version,
    };
  }

  /**
   * Render a Twitter/X social post image (1200x675).
   */
  public static async renderTwitterPost(options: {
    projectPath: string;
    slide: PostSlide;
    caption?: string;
    preview?: boolean;
  }): Promise<{ success: boolean; outputPaths: string[]; metadataPath: string; version: number }> {
    const { projectPath, slide, caption = "", preview = false } = options;
    const { theme } = await ThemeEngine.getTheme(projectPath);
    const { brandKit } = await BrandKitManager.getBrandKit(projectPath);
    const folderInfo = await OutputManager.getNextVersionFolder(projectPath, "twitter");

    const width = 1200;
    const height = 675;

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const outputPaths: string[] = [];

    try {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: preview ? 1 : 2,
      });
      const page = await context.newPage();

      let assetDataUrl: string | undefined;
      if (slide.content.assetId) {
        const asset = await AssetManager.getAsset(projectPath, slide.content.assetId);
        if (asset) {
          const assetPath = resolvePath(projectPath, asset.filePath);
          assetDataUrl = (await fileToDataUrl(assetPath)) || undefined;
        }
      }

      const html = generateSlideHtml({
        slide,
        slideNumber: 1,
        totalSlides: 1,
        theme,
        brandKit,
        aspectRatio: "1:1",
        assetDataUrl,
      });

      await page.setContent(html, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(200);

      const filePath = join(folderInfo.dirPath, "twitter-card.png");
      await page.screenshot({ path: filePath, type: "png" });
      outputPaths.push(filePath);

      await page.close();
      await context.close();
    } finally {
      await browser.close();
    }

    await OutputManager.writeMetadata(folderInfo.metadataPath, {
      version: folderInfo.version,
      platform: "twitter",
      caption,
      files: outputPaths,
    });

    return {
      success: true,
      outputPaths,
      metadataPath: folderInfo.metadataPath,
      version: folderInfo.version,
    };
  }

  /**
   * Render a LinkedIn carousel post (1080x1080 square).
   */
  public static async renderLinkedInPost(options: {
    projectPath: string;
    plan: PostPlan;
    preview?: boolean;
  }): Promise<PostRenderResult> {
    const squarePlan: PostPlan = {
      ...options.plan,
      aspectRatio: "1:1",
    };
    return this.renderInstagramPost({
      projectPath: options.projectPath,
      plan: squarePlan,
      preview: options.preview,
    });
  }

  /**
   * Render a GitHub repository social preview image (1280x640).
   */
  public static async renderGithubSocial(options: {
    projectPath: string;
    title: string;
    subtitle?: string;
    techStack?: string[];
    assetId?: string;
    preview?: boolean;
  }): Promise<{ success: boolean; outputPaths: string[]; metadataPath: string; version: number }> {
    const { projectPath, title, subtitle = "", techStack = [], assetId, preview = false } = options;
    const { theme } = await ThemeEngine.getTheme(projectPath);
    const { brandKit } = await BrandKitManager.getBrandKit(projectPath);
    const folderInfo = await OutputManager.getNextVersionFolder(projectPath, "github");

    const width = 1280;
    const height = 640;

    let assetDataUrl: string | undefined;
    if (assetId) {
      const asset = await AssetManager.getAsset(projectPath, assetId);
      if (asset) {
        const assetPath = resolvePath(projectPath, asset.filePath);
        assetDataUrl = (await fileToDataUrl(assetPath)) || undefined;
      }
    }

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const outputPaths: string[] = [];

    try {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: preview ? 1 : 2,
      });
      const page = await context.newPage();

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              width: ${width}px;
              height: ${height}px;
              background: #0d1117;
              color: #c9d1d9;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 56px 64px;
              position: relative;
              overflow: hidden;
            }
            body::before {
              content: "";
              position: absolute;
              top: -100px;
              right: -100px;
              width: 500px;
              height: 500px;
              border-radius: 50%;
              background: radial-gradient(circle, #58a6ff 0%, transparent 70%);
              opacity: 0.18;
              filter: blur(60px);
            }
            .header-bar {
              display: flex;
              align-items: center;
              gap: 12px;
              font-size: 18px;
              font-weight: 600;
              color: #8b949e;
            }
            .badge-repo {
              background: rgba(88, 166, 255, 0.15);
              color: #58a6ff;
              border: 1px solid rgba(88, 166, 255, 0.4);
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .title-block {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            h1 {
              font-size: 54px;
              font-weight: 800;
              color: #f0f6fc;
              letter-spacing: -0.02em;
            }
            p {
              font-size: 22px;
              color: #8b949e;
              max-width: 900px;
              line-height: 1.4;
            }
            .tech-pills {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 8px;
            }
            .pill {
              background: #161b22;
              border: 1px solid #30363d;
              color: #f0f6fc;
              padding: 6px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              font-family: ui-monospace, monospace;
            }
            .footer-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 15px;
              color: #6e7681;
              border-top: 1px solid #21262d;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <span class="badge-repo">OPEN SOURCE</span>
            <span>${brandKit.brandName || "GitHub Repository"}</span>
          </div>
          <div class="title-block">
            <h1>${title}</h1>
            ${subtitle ? `<p>${subtitle}</p>` : ""}
            ${
              techStack.length > 0
                ? `<div class="tech-pills">${techStack.map((t) => `<span class="pill">${t}</span>`).join("")}</div>`
                : ""
            }
          </div>
          <div class="footer-bar">
            <span>Verified with SWAG MCP</span>
            <span>github.com/${(brandKit.brandName || "project").toLowerCase()}</span>
          </div>
        </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(200);

      const filePath = join(folderInfo.dirPath, "github-social-preview.png");
      await page.screenshot({ path: filePath, type: "png" });
      outputPaths.push(filePath);

      await page.close();
      await context.close();
    } finally {
      await browser.close();
    }

    await OutputManager.writeMetadata(folderInfo.metadataPath, {
      version: folderInfo.version,
      platform: "github",
      title,
      files: outputPaths,
    });

    return {
      success: true,
      outputPaths,
      metadataPath: folderInfo.metadataPath,
      version: folderInfo.version,
    };
  }

  /**
   * Render a 1280x720 YouTube video thumbnail.
   */
  public static async renderThumbnail(options: {
    projectPath: string;
    title: string;
    subtitle?: string;
    badgeText?: string;
    assetId?: string;
    preview?: boolean;
  }): Promise<{ success: boolean; outputPaths: string[]; metadataPath: string; version: number }> {
    const { projectPath, title, subtitle = "", badgeText = "FULL WALKTHROUGH", assetId, preview = false } = options;
    const { theme } = await ThemeEngine.getTheme(projectPath);
    const folderInfo = await OutputManager.getNextVersionFolder(projectPath, "thumbnail");

    const width = 1280;
    const height = 720;

    let assetDataUrl: string | undefined;
    if (assetId) {
      const asset = await AssetManager.getAsset(projectPath, assetId);
      if (asset) {
        const assetPath = resolvePath(projectPath, asset.filePath);
        assetDataUrl = (await fileToDataUrl(assetPath)) || undefined;
      }
    }

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const outputPaths: string[] = [];

    try {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: preview ? 1 : 2,
      });
      const page = await context.newPage();

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              width: ${width}px;
              height: ${height}px;
              background: #090d16;
              color: #f8fafc;
              font-family: Inter, sans-serif;
              display: flex;
              align-items: center;
              padding: 72px 84px;
              position: relative;
              overflow: hidden;
            }
            body::before {
              content: "";
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 60%),
                          radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.25) 0%, transparent 60%);
              pointer-events: none;
            }
            .content {
              position: relative;
              z-index: 10;
              display: flex;
              flex-direction: column;
              gap: 16px;
              max-width: 860px;
            }
            .badge {
              display: inline-block;
              background: #ef4444;
              color: #ffffff;
              font-size: 16px;
              font-weight: 800;
              letter-spacing: 1.5px;
              padding: 6px 18px;
              border-radius: 8px;
              width: fit-content;
              box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
            }
            h1 {
              font-size: 68px;
              font-weight: 900;
              line-height: 1.1;
              letter-spacing: -0.03em;
              text-shadow: 0 4px 20px rgba(0,0,0,0.6);
            }
            p {
              font-size: 26px;
              color: #94a3b8;
              font-weight: 600;
              line-height: 1.4;
            }
            .highlight-tag {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.15);
              padding: 8px 20px;
              border-radius: 12px;
              font-size: 18px;
              font-weight: 700;
              color: #38bdf8;
              width: fit-content;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="content">
            <span class="badge">${badgeText}</span>
            <h1>${title}</h1>
            ${subtitle ? `<p>${subtitle}</p>` : ""}
            <div class="highlight-tag">⚡ ZERO DEPENDENCIES • INLINE VECTOR</div>
          </div>
        </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(200);

      const filePath = join(folderInfo.dirPath, "youtube-thumbnail.png");
      await page.screenshot({ path: filePath, type: "png" });
      outputPaths.push(filePath);

      await page.close();
      await context.close();
    } finally {
      await browser.close();
    }

    await OutputManager.writeMetadata(folderInfo.metadataPath, {
      version: folderInfo.version,
      platform: "thumbnail",
      title,
      files: outputPaths,
    });

    return {
      success: true,
      outputPaths,
      metadataPath: folderInfo.metadataPath,
      version: folderInfo.version,
    };
  }

  /**
   * Fast preview of a single slide without creating a permanent version folder.
   */
  public static async previewSlide(options: {
    projectPath: string;
    slide: PostSlide;
    aspectRatio?: "4:5" | "1:1";
  }): Promise<{ success: boolean; previewPath: string }> {
    const { projectPath, slide, aspectRatio = "4:5" } = options;
    const { theme } = await ThemeEngine.getTheme(projectPath);
    const { brandKit } = await BrandKitManager.getBrandKit(projectPath);

    const width = 1080;
    const height = aspectRatio === "4:5" ? 1350 : 1080;

    let assetDataUrl: string | undefined;
    if (slide.content.assetId) {
      const asset = await AssetManager.getAsset(projectPath, slide.content.assetId);
      if (asset) {
        const assetPath = resolvePath(projectPath, asset.filePath);
        assetDataUrl = (await fileToDataUrl(assetPath)) || undefined;
      }
    }

    const html = generateSlideHtml({
      slide,
      slideNumber: 1,
      totalSlides: 1,
      theme,
      brandKit,
      aspectRatio,
      assetDataUrl,
    });

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const previewDir = join(projectPath, ".swag");
    const previewPath = join(previewDir, "preview.png");

    try {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1, // Fast 1x draft
      });
      const page = await context.newPage();
      await page.setContent(html, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(200);
      await page.screenshot({ path: previewPath, type: "png" });
      await page.close();
      await context.close();
    } finally {
      await browser.close();
    }

    return {
      success: true,
      previewPath,
    };
  }
}
