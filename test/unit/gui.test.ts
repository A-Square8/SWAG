import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GuiServer } from "../../src/gui/server.js";
import { OutputManager } from "../../src/core/output/index.js";
import { AssetManager } from "../../src/core/assets/index.js";

describe("GUI Server & Output Manager Integration", () => {
  let tempDir: string;
  let serverUrl: string;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-gui-test-"));

    // Set up mock project structure
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({
        name: "test-gui-project",
        dependencies: { react: "^18.0.0", vite: "^5.0.0" },
      }),
    );
    await writeFile(
      join(tempDir, "README.md"),
      "# Test GUI Project\n\nA modern web project for testing.",
    );

    // Add an asset via importAsset
    const sampleImgPath = join(tempDir, "sample.png");
    const sampleImg = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await writeFile(sampleImgPath, sampleImg);
    await AssetManager.importAsset(tempDir, sampleImgPath, "Home Page screenshot", "image");

    // Create a mock output
    const { dirPath, metadataPath } = await OutputManager.getNextVersionFolder(
      tempDir,
      "instagram-post",
    );
    await writeFile(join(dirPath, "slide-01.png"), sampleImg);
    await OutputManager.writeMetadata(metadataPath, {
      platform: "instagram-post",
      styleUsed: "minimalist",
      contentSummary: "Single slide teaser for Instagram",
      files: [
        {
          name: "slide-01.png",
          type: "image",
          relativePath: "slide-01.png",
          sizeBytes: sampleImg.length,
        },
      ],
    });

    // Start GUI server on an ephemeral/chosen test port
    const res = await GuiServer.start({ projectPath: tempDir, port: 8431 });
    serverUrl = res.url;
  });

  afterAll(async () => {
    await GuiServer.stop();
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should serve dashboard HTML with modern UI", async () => {
    const res = await fetch(`${serverUrl}/`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("SWAG");
    expect(text).toContain("Developer Social Media Engine");
  });

  it("should return analyzed project data via /api/project", async () => {
    const res = await fetch(`${serverUrl}/api/project`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.profile.name).toBe("Test GUI Project");
    expect(json.profile.techStack).toBeDefined();
  });

  it("should return project assets via /api/assets", async () => {
    const res = await fetch(`${serverUrl}/api/assets`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBeGreaterThanOrEqual(1);
    expect(json.assets[0].metadata.description).toBe("Home Page screenshot");
  });

  it("should return theme and update theme via /api/theme", async () => {
    const getRes = await fetch(`${serverUrl}/api/theme`);
    expect(getRes.status).toBe(200);
    const getJson = (await getRes.json()) as any;
    expect(getJson.success).toBe(true);
    expect(getJson.theme).toBeDefined();

    const postRes = await fetch(`${serverUrl}/api/theme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset: "light" }),
    });
    expect(postRes.status).toBe(200);
    const postJson = (await postRes.json()) as any;
    expect(postJson.success).toBe(true);
    expect(postJson.theme.id).toBe("preset-light");
    expect(postJson.theme.name).toBe("Alabaster Clean (Light)");
  });

  it("should return style presets via /api/styles", async () => {
    const res = await fetch(`${serverUrl}/api/styles`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.presets.length).toBe(5);
  });

  it("should return output history via /api/outputs", async () => {
    const res = await fetch(`${serverUrl}/api/outputs`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBe(1);
    expect(json.outputs[0].platform).toBe("instagram-post");
    expect(json.outputs[0].version).toBe(1);
  });
});
