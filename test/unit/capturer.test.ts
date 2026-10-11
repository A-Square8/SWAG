import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProjectCapturer } from "../../src/core/capturer/index.js";
import { AssetManager } from "../../src/core/assets/index.js";
import { pathExists } from "../../src/utils/fs.js";

describe("ProjectCapturer Integration", () => {
  let tempDir: string;
  let server: Server;
  let testPort: number;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-capturer-test-"));

    // Start a lightweight test HTTP server serving a test web app
    await new Promise<void>((resolve) => {
      server = createServer((req, res) => {
        if (req.url === "/about") {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <!DOCTYPE html>
            <html>
              <body>
                <h1>About Us</h1>
                <p>Welcome to SWAG about page.</p>
                <a href="/">Back Home</a>
              </body>
            </html>
          `);
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>Test App</title></head>
            <body>
              <h1>Welcome to Test Portfolio App</h1>
              <nav>
                <a href="/about">About</a>
              </nav>
              <div>
                <code>API Key: sk-live1234567890abcdef123456</code>
              </div>
            </body>
          </html>
        `);
      });

      server.listen(0, "127.0.0.1", () => {
        const addr = server.address();
        if (addr && typeof addr === "object") {
          testPort = addr.port;
        }
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should capture desktop and mobile screenshots with auto-discovered routes", async () => {
    const result = await ProjectCapturer.capture({
      projectPath: tempDir,
      startServer: false,
      serverUrl: `http://127.0.0.1:${testPort}`,
      colorSchemes: ["dark"],
      viewports: [
        { name: "desktop", width: 1280, height: 720 },
        { name: "mobile", width: 375, height: 667 },
      ],
      blurSensitive: true,
    });

    expect(result.success).toBe(true);
    expect(result.assets.length).toBeGreaterThanOrEqual(2);

    // Verify assets were saved to disk and recorded in catalog
    const screenshots = result.assets.filter((a) => a.type === "screenshot");
    expect(screenshots.length).toBeGreaterThanOrEqual(2);
    const recordings = result.assets.filter((a) => a.type === "recording");
    expect(recordings.length).toBeGreaterThanOrEqual(1);

    for (const asset of result.assets) {
      const fullPath = join(tempDir, asset.filePath);
      const exists = await pathExists(fullPath);
      expect(exists).toBe(true);
      expect(["screenshot", "recording"]).toContain(asset.type);
    }

    // Verify catalog has assets
    const catalogAssets = await AssetManager.listAssets(tempDir);
    expect(catalogAssets.length).toBe(result.assets.length);

    // Verify privacy blur was triggered for the API key
    expect(result.blurDetections.length).toBeGreaterThanOrEqual(1);
    expect(result.blurDetections[0].label).toContain("API Key");
  }, 35000);
});
