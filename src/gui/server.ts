/**
 * SWAG GUI Server — Localhost dashboard server for project management,
 * asset review, theme customization, and output previews.
 */

import { createServer, type IncomingMessage, type ServerResponse, type Server } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname } from "node:path";
import { analyzeProject } from "../core/analyzer/index.js";
import { AssetManager } from "../core/assets/index.js";
import { ThemeEngine } from "../core/theme/index.js";
import { BrandKitManager } from "../core/brand/index.js";
import { StyleManager } from "../core/styles/index.js";
import { OutputManager } from "../core/output/index.js";
import { generateDashboardHtml } from "./dashboard-html.js";
import { join, pathExists } from "../utils/fs.js";
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
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".srt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
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
        if (pathname === "/api/project" && req.method === "GET") {
          const result = await analyzeProject({ projectPath });
          this.sendJson(res, result);
          return;
        }

        if (pathname === "/api/assets" && req.method === "GET") {
          const assets = await AssetManager.listAssets(projectPath);
          this.sendJson(res, { success: true, count: assets.length, assets });
          return;
        }

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

        if (pathname === "/api/brand" && req.method === "GET") {
          const result = await BrandKitManager.getBrandKit(projectPath);
          this.sendJson(res, { success: true, ...result });
          return;
        }

        if (pathname === "/api/brand" && req.method === "POST") {
          const body = await this.readJsonBody(req);
          const result = await BrandKitManager.setBrandKit(body.brandKit, body.scope, projectPath);
          this.sendJson(res, { success: true, brandKit: result });
          return;
        }

        if (pathname === "/api/styles" && req.method === "GET") {
          const presets = await StyleManager.getPresets();
          this.sendJson(res, { success: true, presets });
          return;
        }

        if (pathname === "/api/outputs" && req.method === "GET") {
          const outputs = await OutputManager.listOutputs(projectPath);
          this.sendJson(res, { success: true, count: outputs.length, outputs });
          return;
        }

        // --- STATIC FILE SERVING FOR ASSETS & OUTPUTS ---
        if (pathname.startsWith("/assets/")) {
          const relPath = pathname.replace(/^\/assets\//, "");
          const fullPath = join(projectPath, ".swag", "assets", relPath);
          await this.serveFile(res, fullPath);
          return;
        }

        if (pathname.startsWith("/outputs/")) {
          const relPath = pathname.replace(/^\/outputs\//, "");
          const fullPath = join(projectPath, "swag-output", relPath);
          await this.serveFile(res, fullPath);
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

  private static async serveFile(res: ServerResponse, filePath: string): Promise<void> {
    if (!(await pathExists(filePath))) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    try {
      const ext = extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || "application/octet-stream";
      const fileBuffer = await readFile(filePath);
      res.writeHead(200, { "Content-Type": mime });
      res.end(fileBuffer);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
}
