import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VideoRenderer } from "../../src/core/renderer/video/index.js";
import type { ReelPlan } from "../../src/types/index.js";
import { pathExists, safeReadJson } from "../../src/utils/fs.js";

describe("VideoRenderer Reel Integration", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-reel-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should render vertical 9:16 Reel MP4 with Edge TTS audio and metadata", async () => {
    const mockPlan: ReelPlan = {
      platform: "instagram-reel",
      targetDuration: 10,
      caption: "Check out this ultra-fast developer showcase! #coding #webdev",
      hashtags: ["#coding", "#webdev", "#devlife"],
      captions: {
        enabled: true,
        style: "highlight",
        position: "bottom",
        highlightActiveWord: true,
        fontSize: 28,
      },
      scenes: [
        {
          id: "scene-1",
          type: "hook",
          duration: 3,
          content: {
            text: "How to Build Full-Stack Apps Faster",
            narrationText: "Here is how you build full-stack apps twice as fast.",
          },
          transition: "fade",
        },
        {
          id: "scene-2",
          type: "feature",
          duration: 3,
          content: {
            text: "Instant Real-time Sync",
            narrationText: "Sub-second synchronization across all your team devices.",
          },
          transition: "slide-up",
        },
        {
          id: "scene-3",
          type: "outro",
          duration: 3,
          content: {
            text: "Star on GitHub Today",
            narrationText: "Follow for more daily open-source developer tools.",
          },
          transition: "fade",
        },
      ],
    };

    const result = await VideoRenderer.renderInstagramReel({
      projectPath: tempDir,
      plan: mockPlan,
      preview: true,
    });

    expect(result.success).toBe(true);
    expect(result.version).toBe(1);
    expect(result.actualDuration).toBeGreaterThan(3);
    expect(await pathExists(result.outputPath)).toBe(true);
    expect(await pathExists(result.metadataPath)).toBe(true);

    const metadata = (await safeReadJson(result.metadataPath)) as Record<string, unknown>;
    expect(metadata.platform).toBe("instagram-reel");
    expect(metadata.sceneCount).toBe(3);
  }, 120000);
});
