/**
 * Image Renderer — renders Instagram post slides using HTML templates and Playwright.
 */

import { readFile } from "node:fs/promises";
import { chromium, type Browser } from "playwright";
import type { PostPlan, PostRenderResult } from "../../../types/index.js";
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
}
