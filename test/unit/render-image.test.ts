import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ImageRenderer } from "../../src/core/renderer/image/index.js";
import { OutputManager } from "../../src/core/output/index.js";
import type { PostPlan } from "../../src/types/index.js";
import { pathExists, safeReadJson } from "../../src/utils/fs.js";

describe("ImageRenderer Integration", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-render-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should render high-DPI Instagram slides and write metadata", async () => {
    const mockPlan: PostPlan = {
      platform: "instagram-post",
      format: "carousel",
      aspectRatio: "4:5",
      caption: "Check out our new modern full-stack web application!",
      hashtags: ["#webdev", "#typescript", "#buildinpublic"],
      altText: "Slide carousel showing project features and tech stack",
      slides: [
        {
          id: "slide-1",
          type: "title",
          template: "default",
          content: {
            heading: "Taskflow v2",
            subtitle: "The ultra-fast project manager for developer teams",
            tagline: "Featured Project",
            items: ["React", "TypeScript", "Tailwind CSS"],
          },
        },
        {
          id: "slide-2",
          type: "feature",
          template: "default",
          content: {
            heading: "Real-time Collaboration",
            body: "Instant synchronization with zero latency using modern websockets.",
            items: ["Sub-50ms sync", "End-to-end encryption", "Offline first"],
          },
        },
        {
          id: "slide-3",
          type: "tech-stack",
          template: "default",
          content: {
            heading: "Built for Performance",
            body: "A modern modular TypeScript architecture.",
            items: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
          },
        },
        {
          id: "slide-4",
          type: "outro",
          template: "default",
          content: {
            heading: "Ready to explore?",
            body: "Check out the repo and star the project on GitHub!",
            ctaText: "Link in bio",
          },
        },
      ],
    };

    // Render version 1 (preview = true for fast test execution)
    const resultV1 = await ImageRenderer.renderInstagramPost({
      projectPath: tempDir,
      plan: mockPlan,
      preview: true,
    });

    expect(resultV1.success).toBe(true);
    expect(resultV1.version).toBe(1);
    expect(resultV1.outputPaths.length).toBe(4);

    // Verify files exist on disk
    for (const filePath of resultV1.outputPaths) {
      expect(await pathExists(filePath)).toBe(true);
    }
    expect(await pathExists(resultV1.metadataPath)).toBe(true);

    const metadata = (await safeReadJson(resultV1.metadataPath)) as Record<string, unknown>;
    expect(metadata.caption).toBe(mockPlan.caption);
    expect(metadata.slideCount).toBe(4);

    // Render version 2 to verify non-overwriting incremental versioning
    const resultV2 = await ImageRenderer.renderInstagramPost({
      projectPath: tempDir,
      plan: mockPlan,
      preview: true,
    });

    expect(resultV2.version).toBe(2);
    expect(resultV2.outputPaths[0]).toContain("/v2/");

    // Verify OutputManager.listOutputs sees both
    const outputs = await OutputManager.listOutputs(tempDir, "instagram-post");
    expect(outputs.length).toBe(2);
    expect(outputs[0].version).toBe(2);
    expect(outputs[1].version).toBe(1);
  }, 45000);
});
