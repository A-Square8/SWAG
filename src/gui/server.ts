/**
 * SWAG GUI Server — Localhost dashboard server for project management,
 * asset review, theme customization, capture triggers, and output previews.
 */

import { createServer, type IncomingMessage, type ServerResponse, type Server } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { analyzeProject } from "../core/analyzer/index.js";
import { AssetManager } from "../core/assets/index.js";
import { ThemeEngine } from "../core/theme/index.js";
import { BrandKitManager } from "../core/brand/index.js";
import { StyleManager } from "../core/styles/index.js";
import { OutputManager } from "../core/output/index.js";
import { ProjectCapturer } from "../core/capturer/index.js";
import { ImageRenderer } from "../core/renderer/image/index.js";
import { VideoRenderer } from "../core/renderer/video/index.js";
import { generateDashboardHtml } from "./dashboard-html.js";
import { join, pathExists, safeWriteJson } from "../utils/fs.js";
import { logger } from "../utils/logger.js";

const log = logger.child("gui:server");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".srt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

export interface StartGuiServerOptions {
  projectPath: string;
  port?: number;
}

export class GuiServer {
  private static activeServer: Server | null = null;
  private static activePort = 8420;

  /**
   * Start or get existing GUI server instance.
   */
  public static async start(
    options: StartGuiServerOptions,
  ): Promise<{ url: string; port: number }> {
    const { projectPath, port = 8420 } = options;

    if (this.activeServer) {
      log.info(`Reusing existing GUI server on port ${this.activePort}`);
      return { url: `http://localhost:${this.activePort}`, port: this.activePort };
    }

    const server = createServer(async (req, res) => {
      // CORS headers for local access
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      const parsedUrl = new URL(req.url || "/", `http://localhost:${port}`);
      const pathname = parsedUrl.pathname;

      try {
        // --- API ROUTES ---

        // 1. Project Analysis
        if (pathname === "/api/project" && (req.method === "GET" || req.method === "POST")) {
          const result = await analyzeProject({ projectPath });
          this.sendJson(res, result);
          return;
        }

        // 2. Playwright Capture Trigger
        if (pathname === "/api/capture" && req.method === "POST") {
          const body = await this.readJsonBody(req);
          log.info(`Triggering capture for ${projectPath} via GUI`);
          const result = await ProjectCapturer.capture({
            projectPath,
            routes: body.routes && body.routes.length > 0 ? body.routes : ["/"],
            colorSchemes: body.colorSchemes || ["dark"],
            fullPage: Boolean(body.fullPage),
            recordVideo: Boolean(body.recordVideo),
            port: body.port || 3000,
            startServer: body.startServer !== undefined ? body.startServer : true,
          });
          this.sendJson(res, result);
          return;
        }

        // 3. Assets Listing & Deletion
        if (pathname === "/api/assets" && req.method === "GET") {
          const assets = await AssetManager.listAssets(projectPath);
          this.sendJson(res, { success: true, count: assets.length, assets });
          return;
        }

        if (pathname === "/api/asset/delete" && req.method === "POST") {
          const body = await this.readJsonBody(req);
          if (!body.assetId) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "assetId required" }));
            return;
          }
          const deleted = await AssetManager.deleteAsset(projectPath, body.assetId);
          this.sendJson(res, { success: deleted });
          return;
        }

        // 4. Themes & Presets
        if (pathname === "/api/theme" && req.method === "GET") {
          const result = await ThemeEngine.getTheme(projectPath);
          this.sendJson(res, { success: true, ...result });
          return;
        }

        if (pathname === "/api/theme" && req.method === "POST") {
          const body = await this.readJsonBody(req);
          const result = await ThemeEngine.setTheme(projectPath, body.theme, body.preset);
          this.sendJson(res, { success: true, ...result });
          return;
        }

        // 5. Brand Kit
        if (pathname === "/api/brand" && req.method === "GET") {
          const result = await BrandKitManager.getBrandKit(projectPath);
          this.sendJson(res, { success: true, ...result });
          return;
        }

        if (pathname === "/api/brand" && req.method === "POST") {
          const body = await this.readJsonBody(req);
          const result = await BrandKitManager.setBrandKit(body.brandKit, body.scope || "project", projectPath);
          this.sendJson(res, { success: true, brandKit: result });
          return;
        }

        // 6. Style Presets
        if (pathname === "/api/styles" && req.method === "GET") {
          const presets = await StyleManager.getPresets();
          this.sendJson(res, { success: true, presets });
          return;
        }

        // 7. Output Manifests & File Lists
        if (pathname === "/api/outputs" && req.method === "GET") {
          const outputs = await OutputManager.listOutputs(projectPath);
          this.sendJson(res, { success: true, count: outputs.length, outputs });
          return;
        }

        // 8. Render Trigger (Direct GUI Rendering)
        if (pathname === "/api/render" && req.method === "POST") {
          const body = await this.readJsonBody(req);
          const platform = body.platform || "thumbnail";
          const title = body.title || "Project Showcase";
          const subtitle = body.subtitle || "";
          const badgeText = body.badgeText || "NEW RELEASE";
          const assetId = body.assetId || undefined;

          log.info(`GUI trigger render platform: ${platform} for ${projectPath}`);

          if (platform === "thumbnail") {
            const result = await ImageRenderer.renderThumbnail({
              projectPath,
              title,
              subtitle,
              badgeText,
              assetId,
              preview: false,
            });
            this.sendJson(res, { success: true, result });
            return;
          }

          if (platform === "twitter") {
            const result = await ImageRenderer.renderTwitterPost({
              projectPath,
              slide: {
                id: "tw-1",
                type: "title",
                template: "default",
                content: {
                  heading: title,
                  subtitle,
                  assetId,
                },
              },
              caption: title,
              preview: false,
            });
            this.sendJson(res, { success: true, result });
            return;
          }

          if (platform === "linkedin") {
            const result = await ImageRenderer.renderLinkedInPost({
              projectPath,
              plan: {
                platform: "instagram-post",
                format: "carousel",
                aspectRatio: "1:1",
                slides: [
                  {
                    id: "li-1",
                    type: "title",
                    template: "default",
                    content: { heading: title, subtitle },
                  },
                ],
                caption: title,
                hashtags: [],
                altText: title,
              },
              preview: false,
            });
            this.sendJson(res, { success: true, result });
            return;
          }

          if (platform === "github") {
            const result = await ImageRenderer.renderGithubSocial({
              projectPath,
              title,
              subtitle,
              preview: false,
            });
            this.sendJson(res, { success: true, result });
            return;
          }

          if (platform === "instagram-post") {
            const result = await ImageRenderer.renderInstagramPost({
              projectPath,
              plan: {
                platform: "instagram-post",
                format: "carousel",
                aspectRatio: "4:5",
                slides: [
                  {
                    id: "slide-1",
                    type: "title",
                    template: "default",
                    content: {
                      heading: title,
                      subtitle,
                    },
                  },
                  {
                    id: "slide-2",
                    type: "feature",
                    template: "default",
                    content: {
                      heading: "Key Architecture",
                      items: [
                        "Optimized developer experience",
                        "High performance execution",
                        "Clean modular design",
                      ],
                    },
                  },
                  {
                    id: "slide-3",
                    type: "outro",
                    template: "default",
                    content: {
                      heading: "Explore the Project",
                      body: "Star on GitHub and try it out today",
                    },
                  },
                ],
                caption: title,
                hashtags: [],
                altText: title,
              },
            });
            this.sendJson(res, { success: true, result });
            return;
          }

          if (platform === "instagram-reel") {
            const result = await VideoRenderer.renderInstagramReel({
              projectPath,
              plan: {
                platform: "instagram-reel",
                targetDuration: 15,
                scenes: [
                  {
                    id: "scene-1",
                    type: "hook",
                    duration: 5,
                    content: {
                      text: title,
                      narrationText: `${title}. Let's take a look under the hood.`,
                    },
                    transition: "fade",
                  },
                  {
                    id: "scene-2",
                    type: "feature",
                    duration: 5,
                    content: {
                      text: "Fast Execution",
                      narrationText: "Built with high performance and zero friction.",
                    },
                    transition: "fade",
                  },
                  {
                    id: "scene-3",
                    type: "outro",
                    duration: 5,
                    content: {
                      text: "Open Source",
                      narrationText: "Check out the repo on GitHub.",
                    },
                    transition: "fade",
                  },
                ],
                caption: title,
                hashtags: [],
                captions: {
                  enabled: true,
                  style: "highlight",
                  position: "bottom",
                  highlightActiveWord: true,
                  fontSize: 28,
                },
              },
            });
            this.sendJson(res, { success: true, result });
            return;
          }

          if (platform === "youtube") {
            const result = await VideoRenderer.renderYouTubeVideo({
              projectPath,
              plan: {
                platform: "youtube",
                title,
                description: subtitle || title,
                tags: ["developer", "walkthrough"],
                targetDuration: 30,
                subtitleLanguage: "en",
                captions: {
                  enabled: true,
                  style: "highlight",
                  position: "bottom",
                  highlightActiveWord: true,
                  fontSize: 28,
                },
                sections: [
                  {
                    id: "sec-1",
                    title: "Introduction",
                    section: "intro",
                    narrationText: `Welcome to the official walkthrough of ${title}.`,
                    onScreenText: subtitle,
                    assetIds: assetId ? [assetId] : [],
                    estimatedDuration: 10,
                  },
                  {
                    id: "sec-2",
                    title: "Core Architecture",
                    section: "architecture",
                    narrationText: "Let's explore the architectural foundation and capabilities.",
                    assetIds: [],
                    estimatedDuration: 10,
                  },
                  {
                    id: "sec-3",
                    title: "Conclusion & Links",
                    section: "outro",
                    narrationText: "Thank you for watching. Star and clone the repository on GitHub.",
                    assetIds: [],
                    estimatedDuration: 10,
                  },
                ],
              },
            });
            this.sendJson(res, { success: true, result });
            return;
          }

          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: `Unsupported platform: ${platform}` }));
          return;
        }

        // 9. Export Release Bundle
        if (pathname === "/api/export" && req.method === "POST") {
          const allOutputs = await OutputManager.listOutputs(projectPath);
          const bundleManifest = {
            bundleName: "release-bundle",
            exportedAt: new Date().toISOString(),
            totalAssets: allOutputs.reduce((acc, out) => acc + out.paths.length, 0),
            platforms: [...new Set(allOutputs.map((o) => o.platform))],
            outputs: allOutputs,
          };
          const manifestPath = join(projectPath, "swag-output", "release-manifest.json");
          await safeWriteJson(manifestPath, bundleManifest);
          this.sendJson(res, { success: true, manifestPath, bundleManifest });
          return;
        }

        // 10. File Text Content Viewer (for script.md, subtitles.srt, metadata.json)
        if (pathname === "/api/file-content" && req.method === "GET") {
          const filePathParam = parsedUrl.searchParams.get("path");
          if (!filePathParam) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing path parameter" }));
            return;
          }
          const targetPath = filePathParam.startsWith("/")
            ? filePathParam
            : join(projectPath, filePathParam);

          // Security check: ensure path is within projectPath
          const resolvedTarget = resolve(targetPath);
          const resolvedProject = resolve(projectPath);
          if (!resolvedTarget.startsWith(resolvedProject)) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Access denied" }));
            return;
          }

          if (!(await pathExists(resolvedTarget))) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "File not found" }));
            return;
          }

          const content = await readFile(resolvedTarget, "utf-8");
          this.sendJson(res, { success: true, path: resolvedTarget, content });
          return;
        }

        // --- STATIC FILE SERVING FOR ASSETS & OUTPUTS ---

        // Assets serving: handle /assets/<id.ext> or /assets/assets/<id.ext>
        if (pathname.startsWith("/assets/")) {
          let relPath = pathname.replace(/^\/assets\/?/, "");
          while (relPath.startsWith("assets/")) {
            relPath = relPath.replace(/^assets\/?/, "");
          }
          while (relPath.startsWith(".swag/assets/")) {
            relPath = relPath.replace(/^\.swag\/assets\/?/, "");
          }
          const fullPath = join(projectPath, ".swag", "assets", relPath);
          await this.serveFile(req, res, fullPath);
          return;
        }

        // Outputs serving: handle /outputs/... or /outputs/swag-output/...
        if (pathname.startsWith("/outputs/")) {
          let relPath = pathname.replace(/^\/outputs\/?/, "");
          while (relPath.startsWith("swag-output/")) {
            relPath = relPath.replace(/^swag-output\/?/, "");
          }
          const fullPath = join(projectPath, "swag-output", relPath);
          await this.serveFile(req, res, fullPath);
          return;
        }

        // --- DASHBOARD SPA ---
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(generateDashboardHtml(projectPath));
      } catch (err) {
        log.error(`GUI server error on ${pathname}: ${err}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
    });

    await new Promise<void>((resolve, reject) => {
      server.listen(port, "127.0.0.1", () => {
        const addr = server.address();
        if (addr && typeof addr === "object") {
          this.activePort = addr.port;
        } else {
          this.activePort = port;
        }
        this.activeServer = server;
        log.info(`GUI server listening on http://localhost:${this.activePort}`);
        resolve();
      });
      server.on("error", reject);
    });

    return {
      url: `http://localhost:${this.activePort}`,
      port: this.activePort,
    };
  }

  /**
   * Stop the running GUI server.
   */
  public static async stop(): Promise<void> {
    if (this.activeServer) {
      await new Promise<void>((resolve) => {
        this.activeServer!.close(() => {
          this.activeServer = null;
          resolve();
        });
      });
      log.info("GUI server stopped");
    }
  }

  private static sendJson(res: ServerResponse, data: unknown): void {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data, null, 2));
  }

  private static async readJsonBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (err) {
          reject(err);
        }
      });
      req.on("error", reject);
    });
  }

  private static async serveFile(req: IncomingMessage, res: ServerResponse, filePath: string): Promise<void> {
    if (!(await pathExists(filePath))) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    try {
      const ext = extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || "application/octet-stream";
      const fileStat = await stat(filePath);
      const range = req.headers.range;

      // Handle HTTP 206 Partial Content for MP4 and WebM video seeking
      if (range && (ext === ".mp4" || ext === ".webm")) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1;

        if (start >= fileStat.size || end >= fileStat.size) {
          res.writeHead(416, { "Content-Range": `bytes */${fileStat.size}` });
          res.end();
          return;
        }

        const chunksize = end - start + 1;
        const stream = createReadStream(filePath, { start, end });
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": mime,
        });
        stream.pipe(res);
        return;
      }

      // Standard static response
      res.writeHead(200, {
        "Content-Type": mime,
        "Content-Length": fileStat.size,
        "Accept-Ranges": "bytes",
      });
      const stream = createReadStream(filePath);
      stream.pipe(res);
    } catch (err) {
      log.error(`Error serving file ${filePath}: ${err}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
}
