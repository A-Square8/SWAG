/**
 * Capturer Orchestrator — launches Playwright, manages viewports, captures screenshots
 * and screen recordings, auto-discovers routes, and applies privacy blurring.
 */

import { randomUUID } from "node:crypto";
import { copyFile, rm } from "node:fs/promises";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { DevServerRunner } from "../runner/index.js";
import { AssetManager } from "../assets/index.js";
import { detectAndBlurSensitiveData } from "./privacy.js";
import { discoverRoutes } from "./explorer.js";
import type { Asset, BlurRegion } from "../../types/index.js";
import { ensureDir, join } from "../../utils/fs.js";
import { SwagError } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

const log = logger.child("capturer");

export interface ViewportConfig {
  name: "desktop" | "tablet" | "mobile";
  width: number;
  height: number;
}

export const DEFAULT_VIEWPORTS: ViewportConfig[] = [
  { name: "desktop", width: 1920, height: 1080 },
  { name: "mobile", width: 390, height: 844 },
];

export interface InteractionStep {
  type: "click" | "type" | "scroll" | "wait";
  selector?: string;
  text?: string;
  delayMs?: number;
}

export interface CaptureOptions {
  projectPath: string;
  startServer?: boolean;
  serverUrl?: string;
  runCommand?: string;
  port?: number;
  viewports?: ViewportConfig[];
  colorSchemes?: Array<"light" | "dark">;
  routes?: string[];
  fullPage?: boolean;
  blurSensitive?: boolean;
  recordVideo?: boolean;
  interactions?: InteractionStep[];
}

export interface CaptureResult {
  success: true;
  assets: Asset[];
  serverLog?: string;
  blurDetections: BlurRegion[];
}

export class ProjectCapturer {
  /**
   * Run full capture pipeline on project.
   */
  public static async capture(options: CaptureOptions): Promise<CaptureResult> {
    const {
      projectPath,
      startServer = true,
      serverUrl,
      runCommand = "npm run dev",
      port = 3000,
      viewports = DEFAULT_VIEWPORTS,
      colorSchemes = ["dark"],
      routes: specifiedRoutes,
      fullPage = false,
      blurSensitive = true,
      recordVideo = true,
      interactions = [],
    } = options;

    log.info(`Starting capture pipeline for project: ${projectPath}`);
    await AssetManager.init(projectPath);

    // 1. Ensure dev server is running
    let baseUrl = serverUrl;
    let serverLog: string | undefined;

    if (startServer) {
      const serverInstance = await DevServerRunner.ensureRunning({
        projectPath,
        runCommand,
        port,
        serverUrl,
      });
      baseUrl = serverInstance.url;
      serverLog = serverInstance.getRecentLogs();
    } else if (!baseUrl) {
      baseUrl = `http://localhost:${port}`;
    }

    log.info(`Target web application URL: ${baseUrl}`);

    // 2. Launch browser
    let browser: Browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (err) {
      throw new SwagError(
        "BROWSER_LAUNCH_FAILED",
        `Failed to launch Chromium browser: ${err instanceof Error ? err.message : String(err)}`,
        "Run 'npx playwright install chromium' or ensure dependencies are installed.",
      );
    }

    const createdAssets: Asset[] = [];
    const allBlurDetections: BlurRegion[] = [];

    try {
      // 3. Discover routes if not explicitly provided
      let targetRoutes = specifiedRoutes && specifiedRoutes.length > 0 ? specifiedRoutes : ["/"];

      if (!specifiedRoutes || specifiedRoutes.length === 0) {
        log.info("Discovering routes from home page...");
        const discoContext = await browser.newContext({
          viewport: { width: 1920, height: 1080 },
        });
        const discoPage = await discoContext.newPage();
        try {
          await discoPage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
          const discovered = await discoverRoutes(discoPage, baseUrl);
          // Combine root + up to 4 discovered routes
          const uniquePaths = new Set(["/", ...discovered.map((d) => d.path)]);
          targetRoutes = Array.from(uniquePaths).slice(0, 5);
          log.info(`Discovered routes to capture: ${targetRoutes.join(", ")}`);
        } catch (err) {
          log.warn(`Route discovery navigation error: ${err}`);
        } finally {
          await discoPage.close();
          await discoContext.close();
        }
      }

      // 4. Capture screenshots for viewports & color schemes
      for (const vp of viewports) {
        for (const scheme of colorSchemes) {
          log.debug(`Capturing ${vp.name} [${scheme}]`);
          const context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
            colorScheme: scheme,
            deviceScaleFactor: 2,
          });

          const page = await context.newPage();

          for (const route of targetRoutes) {
            const pageUrl = new URL(route, baseUrl).toString();
            try {
              log.info(`Navigating to ${pageUrl} (${vp.name}, ${scheme})`);
              await page.goto(pageUrl, {
                waitUntil: "networkidle",
                timeout: 20000,
              }).catch(async () => {
                // If networkidle times out (e.g. streaming/websockets), fall back to domcontentloaded
                await page.waitForLoadState("domcontentloaded");
              });

              // Give a moment for client-side hydration/rendering
              await page.waitForTimeout(500);

              // Privacy blur detection
              if (blurSensitive) {
                const blurRegions = await detectAndBlurSensitiveData(page, true);
                if (blurRegions.length > 0) {
                  allBlurDetections.push(...blurRegions);
                }
              }

              // Take screenshot
              const assetId = randomUUID();
              const relativePath = join(".swag", "assets", `${assetId}.png`);
              const absolutePath = join(projectPath, relativePath);

              await page.screenshot({
                path: absolutePath,
                fullPage,
              });

              const asset: Asset = {
                id: assetId,
                type: "screenshot",
                source: "auto-captured",
                filePath: relativePath,
                metadata: {
                  route,
                  description: `${vp.name.toUpperCase()} screenshot of ${route} (${scheme} mode)`,
                  width: vp.width,
                  height: vp.height,
                  device: vp.name,
                  colorScheme: scheme,
                  capturedAt: new Date().toISOString(),
                },
              };

              await AssetManager.addAsset(projectPath, asset);
              createdAssets.push(asset);
            } catch (err) {
              log.warn(`Failed capturing ${pageUrl}: ${err}`);
            }
          }

          await page.close();
          await context.close();
        }
      }

      // 5. Screen recording / video if requested or interactions provided
      if (recordVideo || interactions.length > 0) {
        log.info("Capturing live interactive screen demo video recording...");
        const tempVideoDir = join(projectPath, ".swag", "temp-video");
        await ensureDir(tempVideoDir);

        const videoContext = await browser.newContext({
          viewport: { width: 1920, height: 1080 },
          recordVideo: {
            dir: tempVideoDir,
            size: { width: 1920, height: 1080 },
          },
        });

        const videoPage = await videoContext.newPage();
        try {
          await videoPage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
          await videoPage.waitForTimeout(1000);

          if (blurSensitive) {
            await detectAndBlurSensitiveData(videoPage, true);
          }

          // Execute interaction steps if explicitly provided
          if (interactions.length > 0) {
            for (const step of interactions) {
              try {
                if (step.type === "click" && step.selector) {
                  await videoPage.waitForSelector(step.selector, { timeout: 3500 });
                  await videoPage.click(step.selector, { timeout: 3000 });
                } else if (step.type === "type" && step.selector && step.text) {
                  await videoPage.waitForSelector(step.selector, { timeout: 3500 });
                  await videoPage.fill(step.selector, step.text, { timeout: 3000 });
                } else if (step.type === "scroll") {
                  await videoPage.evaluate(() => window.scrollBy({ top: 380, behavior: "smooth" }));
                } else if (step.type === "wait") {
                  await videoPage.waitForTimeout(step.delayMs || 1000);
                }
              } catch (stepErr) {
                log.debug(`Interaction step failed: ${stepErr}`);
              }
              await videoPage.waitForTimeout(step.delayMs || 600);
            }
          } else {
            // Intelligent Automated Demo Actions
            try {
              const discovered = await videoPage.evaluate(() => {
                const inputs = Array.from(
                  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
                    "input:not([type='hidden']):not([type='submit']):not([type='button']), textarea",
                  ),
                );
                const buttons = Array.from(
                  document.querySelectorAll<HTMLButtonElement | HTMLElement>(
                    "button, [role='button'], input[type='submit']",
                  ),
                );
                const tabs = Array.from(
                  document.querySelectorAll<HTMLAnchorElement | HTMLElement>(
                    "nav a, [role='tab'], header a, .tab, .filter-btn",
                  ),
                );

                return {
                  inputs: inputs.slice(0, 5).map((el, idx) => ({
                    id: el.id,
                    name: el.name,
                    placeholder: el.placeholder || "",
                    type: el.type || "text",
                    selector: el.id ? `#${el.id}` : el.name ? `[name="${el.name}"]` : `input:nth-of-type(${idx + 1})`,
                  })),
                  buttons: buttons.slice(0, 6).map((btn, idx) => ({
                    text: (btn.textContent || "").trim().slice(0, 30),
                    id: btn.id,
                    selector: btn.id ? `#${btn.id}` : `button:nth-of-type(${idx + 1})`,
                  })),
                  tabs: tabs.slice(0, 4).map((t, idx) => ({
                    text: (t.textContent || "").trim().slice(0, 25),
                    selector: t.id ? `#${t.id}` : `nav a:nth-of-type(${idx + 1})`,
                  })),
                };
              });

              // Exercise forms if present (e.g. adding an expense, typing a note, submitting search)
              if (discovered.inputs.length > 0) {
                log.info(`Demonstrating live interaction across ${discovered.inputs.length} form inputs...`);
                for (const input of discovered.inputs) {
                  let sampleVal = "Demo Feature Showcase";
                  const hint = `${input.name} ${input.placeholder}`.toLowerCase();
                  if (/amount|price|cost|expense|value|fee|rate|budget|total/.test(hint)) {
                    sampleVal = "45.00";
                  } else if (/item|desc|title|name|task|label|note|expense|activity/.test(hint)) {
                    sampleVal = "Quarterly Cloud Infrastructure";
                  } else if (/email/.test(hint)) {
                    sampleVal = "alex@developer.demo";
                  } else if (/category|tag|type/.test(hint)) {
                    sampleVal = "Engineering";
                  } else if (input.type === "number") {
                    sampleVal = "120";
                  }

                  try {
                    await videoPage.fill(input.selector, sampleVal, { timeout: 2000 });
                    await videoPage.waitForTimeout(400);
                  } catch (fillErr) {
                    log.debug(`Input fill skipped: ${fillErr}`);
                  }
                }

                // Look for submit or add button
                const submitBtn =
                  discovered.buttons.find((b) =>
                    /add|save|submit|create|post|enter|track|send|apply|new/i.test(b.text),
                  ) || discovered.buttons[0];

                if (submitBtn) {
                  try {
                    await videoPage.click(submitBtn.selector, { timeout: 2500 });
                    await videoPage.waitForTimeout(1000);
                  } catch (btnErr) {
                    log.debug(`Button click skipped: ${btnErr}`);
                  }
                }
              }

              // Toggle tab / nav if available
              if (discovered.tabs.length > 1) {
                try {
                  await videoPage.click(discovered.tabs[1].selector, { timeout: 2000 });
                  await videoPage.waitForTimeout(800);
                } catch {}
              }

              // Smooth scroll down to highlight results/content
              for (let i = 0; i < 3; i++) {
                await videoPage.evaluate(() => window.scrollBy({ top: 320, behavior: "smooth" }));
                await videoPage.waitForTimeout(700);
              }

              // Scroll back to top
              await videoPage.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
              await videoPage.waitForTimeout(800);
            } catch (autoErr) {
              log.warn(`Automated interactive demo error: ${autoErr}`);
            }
          }

          await videoPage.waitForTimeout(1000);
          const videoRef = videoPage.video();
          await videoPage.close();
          await videoContext.close();

          if (videoRef) {
            const tempVideoPath = await videoRef.path();
            const assetId = randomUUID();
            const finalRelativePath = join(".swag", "assets", `${assetId}.webm`);
            const finalAbsolutePath = join(projectPath, finalRelativePath);

            await copyFile(tempVideoPath, finalAbsolutePath);
            await rm(tempVideoDir, { recursive: true, force: true }).catch(() => {});

            const videoAsset: Asset = {
              id: assetId,
              type: "recording",
              source: "auto-captured",
              filePath: finalRelativePath,
              metadata: {
                route: "/",
                description: "Live interactive project demonstration with real actions",
                width: 1920,
                height: 1080,
                duration: 8,
                capturedAt: new Date().toISOString(),
              },
            };

            await AssetManager.addAsset(projectPath, videoAsset);
            createdAssets.push(videoAsset);
          }
        } catch (videoErr) {
          log.warn(`Screen recording failed: ${videoErr}`);
          await videoPage.close().catch(() => {});
          await videoContext.close().catch(() => {});
        }
      }
    } finally {
      await browser.close();
    }

    log.info(`Capture complete: generated ${createdAssets.length} assets`);

    return {
      success: true,
      assets: createdAssets,
      serverLog,
      blurDetections: allBlurDetections,
    };
  }
}
