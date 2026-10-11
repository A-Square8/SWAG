import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VideoRenderer } from "../../src/core/renderer/video/index.js";
import type { YouTubeVideoPlan } from "../../src/types/index.js";
import { pathExists, safeReadFile, safeReadJson } from "../../src/utils/fs.js";

describe("VideoRenderer YouTube Integration", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-yt-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should render 16:9 YouTube video with .srt subtitles, chapters, and script.md", async () => {
    const mockPlan: YouTubeVideoPlan = {
      platform: "youtube",
      title: "Taskflow — Complete Architecture Walkthrough",
      description: "An in-depth look at building real-time apps with TypeScript and Next.js.",
      tags: ["web development", "typescript", "architecture"],
      targetDuration: 180,
      subtitleLanguage: "en",
      captions: {
        enabled: true,
        style: "boxed",
        position: "bottom",
        highlightActiveWord: false,
        fontSize: 24,
      },
      sections: [
        {
          id: "sec-1",
          section: "intro",
          title: "Introduction & Motivation",
          narrationText: "Welcome! In this video we are breaking down the architecture of Taskflow.",
          estimatedDuration: 3,
          lowerThird: "Taskflow Overview",
          assetIds: [],
        },
        {
          id: "sec-2",
          section: "features",
          title: "Standout Capabilities",
          narrationText: "Here are the top capabilities built for speed and reliability.",
          estimatedDuration: 3,
          lowerThird: "Core Features",
          assetIds: [],
        },
        {
          id: "sec-3",
          section: "outro",
          title: "Wrap-up & Resources",
          narrationText: "Thanks for watching! Star the project on GitHub and subscribe for more.",
          estimatedDuration: 3,
          lowerThird: "Get the Code",
          assetIds: [],
        },
      ],
    };

    const result = await VideoRenderer.renderYouTubeVideo({
      projectPath: tempDir,
      plan: mockPlan,
      preview: true,
    });

    expect(result.success).toBe(true);
    expect(result.version).toBe(1);
    expect(result.actualDuration).toBeGreaterThan(3);

    // Verify all 4 output artifacts exist
    expect(await pathExists(result.outputPath)).toBe(true);
    expect(await pathExists(result.srtPath)).toBe(true);
    expect(await pathExists(result.scriptPath)).toBe(true);
    expect(await pathExists(result.metadataPath)).toBe(true);

    // Verify chapters
    expect(result.chapters.length).toBe(3);
    expect(result.chapters[0].startTime).toBe("0:00");
    expect(result.chapters[0].title).toBe("Introduction & Motivation");

    // Verify .srt content
    const srtContent = await safeReadFile(result.srtPath);
    expect(srtContent).toContain("Taskflow");
    expect(srtContent).toContain("-->");

    // Verify script.md content
    const scriptContent = await safeReadFile(result.scriptPath);
    expect(scriptContent).toContain("# Taskflow — Complete Architecture Walkthrough");
    expect(scriptContent).toContain("### Video Chapters");

    // Verify metadata.json
    const metadata = (await safeReadJson(result.metadataPath)) as Record<string, unknown>;
    expect(metadata.platform).toBe("youtube");
    expect(metadata.sectionCount).toBe(3);
  }, 120000);

  it("should append full-size raw project demo with soothing music after outro", async () => {
    // Generate dummy 2-second demo video in tempDir
    const demoVideoPath = join(tempDir, "demo-recording.mp4");
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execFileAsync = promisify(execFile);

    await execFileAsync("ffmpeg", [
      "-f",
      "lavfi",
      "-i",
      "testsrc=duration=2:size=1920x1080:rate=30",
      "-pix_fmt",
      "yuv420p",
      demoVideoPath,
      "-y",
    ]);

    const mockPlan: YouTubeVideoPlan = {
      platform: "youtube",
      title: "Quick App Walkthrough",
      description: "Walkthrough with raw demo appended.",
      tags: ["demo"],
      targetDuration: 30,
      subtitleLanguage: "en",
      sections: [
        {
          id: "sec-1",
          section: "intro",
          title: "Introduction",
          narrationText: "Welcome to this brief overview.",
          estimatedDuration: 3,
        },
        {
          id: "sec-2",
          section: "outro",
          title: "Outro & Links",
          narrationText: "Thank you for watching.",
          estimatedDuration: 3,
        },
      ],
      rawDemo: {
        enabled: true,
        videoPath: demoVideoPath,
        title: "Raw Project Demo (Live Interface)",
        duration: 3,
        audioVolume: 0.3,
      },
    };

    const result = await VideoRenderer.renderYouTubeVideo({
      projectPath: tempDir,
      plan: mockPlan,
      preview: true,
    });

    expect(result.success).toBe(true);
    expect(result.hasRawDemo).toBe(true);
    expect(result.chapters.length).toBe(3); // 2 sections + 1 raw demo
    expect(result.chapters[2].title).toBe("Raw Project Demo (Live Interface)");

    // Script should include raw demo section
    const scriptContent = await safeReadFile(result.scriptPath);
    expect(scriptContent).toContain("Raw Project Demo (Live Interface)");

    // Metadata should reflect raw demo
    const metadata = (await safeReadJson(result.metadataPath)) as Record<string, unknown>;
    expect(metadata.hasRawDemo).toBe(true);
    expect(metadata.sectionCount).toBe(3);
  }, 120000);
});
