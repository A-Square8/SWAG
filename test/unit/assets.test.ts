import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AssetManager } from "../../src/core/assets/index.js";
import type { Asset } from "../../src/types/index.js";

describe("AssetManager", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-asset-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should initialize catalog with empty assets", async () => {
    const catalog = await AssetManager.getCatalog(tempDir);
    expect(catalog.assets).toEqual([]);
    expect(catalog.projectName).toBeTruthy();
  });

  it("should add and retrieve assets", async () => {
    const mockAsset: Asset = {
      id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      type: "screenshot",
      source: "auto-captured",
      filePath: ".swag/assets/sample.png",
      metadata: {
        description: "Homepage desktop preview",
        width: 1920,
        height: 1080,
        device: "desktop",
        colorScheme: "dark",
        route: "/",
      },
    };

    await AssetManager.addAsset(tempDir, mockAsset);

    const asset = await AssetManager.getAsset(tempDir, mockAsset.id);
    expect(asset).toBeDefined();
    expect(asset?.metadata.route).toBe("/");
    expect(asset?.metadata.description).toBe("Homepage desktop preview");
  });

  it("should filter assets by type, source, and route", async () => {
    const asset1: Asset = {
      id: "11111111-1111-4111-8111-111111111111",
      type: "screenshot",
      source: "auto-captured",
      filePath: ".swag/assets/1.png",
      metadata: { description: "Home", width: 1920, height: 1080, route: "/" },
    };
    const asset2: Asset = {
      id: "22222222-2222-4222-8222-222222222222",
      type: "recording",
      source: "auto-captured",
      filePath: ".swag/assets/2.webm",
      metadata: { description: "Demo video", width: 1280, height: 720, route: "/" },
    };
    const asset3: Asset = {
      id: "33333333-3333-4333-8333-333333333333",
      type: "image",
      source: "user-supplied",
      filePath: ".swag/assets/3.png",
      metadata: { description: "Logo", width: 500, height: 500 },
    };

    await AssetManager.addAsset(tempDir, asset1);
    await AssetManager.addAsset(tempDir, asset2);
    await AssetManager.addAsset(tempDir, asset3);

    const screenshots = await AssetManager.listAssets(tempDir, { type: "screenshot" });
    expect(screenshots.length).toBe(1);
    expect(screenshots[0].id).toBe(asset1.id);

    const userSupplied = await AssetManager.listAssets(tempDir, { source: "user-supplied" });
    expect(userSupplied.length).toBe(1);
    expect(userSupplied[0].id).toBe(asset3.id);
  });

  it("should import external asset file into .swag/assets", async () => {
    const sourceFilePath = join(tempDir, "custom-logo.png");
    await writeFile(sourceFilePath, "fake-image-bytes");

    const asset = await AssetManager.importAsset(
      tempDir,
      sourceFilePath,
      "Official Company Logo",
    );

    expect(asset.id).toBeTruthy();
    expect(asset.type).toBe("image");
    expect(asset.source).toBe("user-supplied");
    expect(asset.metadata.description).toBe("Official Company Logo");

    const catalog = await AssetManager.getCatalog(tempDir);
    expect(catalog.assets.some((a) => a.id === asset.id)).toBe(true);
  });
});
