import { describe, it, expect } from "vitest";
import { IconEngine } from "../../src/core/icons/index.js";
import { ICON_CATALOG } from "../../src/core/icons/catalog.js";
import { generateSlideHtml } from "../../src/core/renderer/image/templates.js";
import { generateReelSceneHtml } from "../../src/core/renderer/video/templates.js";
import { generateYouTubeSectionHtml } from "../../src/core/renderer/video/youtube-templates.js";
import type { BrandKit, PostSlide, ReelScene, VideoSection } from "../../src/types/index.js";
import { DARK_THEME } from "../../src/core/theme/presets/dark.js";

describe("IconEngine & Professional Vector Icons", () => {
  it("should have over 100 professional official icons in the catalog", () => {
    const iconKeys = IconEngine.listAvailableIcons();
    expect(iconKeys.length).toBeGreaterThanOrEqual(100);
  });

  it("should resolve official social and platform icons", () => {
    expect(IconEngine.hasIcon("youtube")).toBe(true);
    expect(IconEngine.hasIcon("github")).toBe(true);
    expect(IconEngine.hasIcon("instagram")).toBe(true);
    expect(IconEngine.hasIcon("x")).toBe(true);
    expect(IconEngine.hasIcon("twitter")).toBe(true);
    expect(IconEngine.hasIcon("linkedin")).toBe(true);
    expect(IconEngine.hasIcon("discord")).toBe(true);
    expect(IconEngine.hasIcon("globe")).toBe(true);
    expect(IconEngine.hasIcon("web")).toBe(true);
    expect(IconEngine.hasIcon("npm")).toBe(true);
    expect(IconEngine.hasIcon("git")).toBe(true);
  });

  it("should resolve major tech stack languages and frameworks", () => {
    const techStacks = [
      "python",
      "javascript",
      "typescript",
      "nodejs",
      "react",
      "nextjs",
      "vue",
      "svelte",
      "angular",
      "tailwindcss",
      "docker",
      "postgresql",
      "mongodb",
      "redis",
      "fastapi",
      "django",
      "rust",
      "go",
      "java",
      "cpp",
      "csharp",
      "php",
      "ruby",
      "html5",
      "css3",
      "vite",
      "webpack",
      "aws",
      "kubernetes",
    ];

    for (const tech of techStacks) {
      expect(IconEngine.hasIcon(tech), `Expected icon for ${tech}`).toBe(true);
    }
  });

  it("should normalize tech aliases correctly", () => {
    expect(IconEngine.resolveKey("py")).toBe("python");
    expect(IconEngine.resolveKey("Python 3")).toBe("python");
    expect(IconEngine.resolveKey("ts")).toBe("typescript");
    expect(IconEngine.resolveKey("js")).toBe("javascript");
    expect(IconEngine.resolveKey("node.js")).toBe("nodejs");
    expect(IconEngine.resolveKey("Node")).toBe("nodejs");
    expect(IconEngine.resolveKey("Next.js")).toBe("nextjs");
    expect(IconEngine.resolveKey("React.js")).toBe("react");
    expect(IconEngine.resolveKey("c++")).toBe("cpp");
    expect(IconEngine.resolveKey("c#")).toBe("csharp");
    expect(IconEngine.resolveKey("golang")).toBe("go");
    expect(IconEngine.resolveKey("tailwind")).toBe("tailwindcss");
    expect(IconEngine.resolveKey("postgres")).toBe("postgresql");
    expect(IconEngine.resolveKey("mongo")).toBe("mongodb");
    expect(IconEngine.resolveKey("yt")).toBe("youtube");
    expect(IconEngine.resolveKey("insta")).toBe("instagram");
  });

  it("should generate crisp SVG markup with custom size and color", () => {
    const svg = IconEngine.getSvg("python", { size: 48, color: "#3776AB", className: "tech-icon" });
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('width="48"');
    expect(svg).toContain('height="48"');
    expect(svg).toContain('color: #3776AB');
    expect(svg).toContain('class="tech-icon"');
  });

  it("should generate data URL for inline usage", () => {
    const dataUrl = IconEngine.getDataUrl("github");
    expect(dataUrl.startsWith("data:image/svg+xml;base64,")).toBe(true);
  });
});

describe("Uncropped Scaling & Sizing in Templates", () => {
  const mockBrandKit: BrandKit = {
    brandName: "Acme Dev",
    defaultCTA: "Link in bio to view project",
    socials: [
      { platform: "youtube", handle: "@acmedev" },
      { platform: "github", handle: "acmedev" },
      { platform: "instagram", handle: "@acme_dev" },
    ],
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  it("should use object-fit: contain in Instagram post slide templates to prevent screenshot cropping", () => {
    const mockSlide: PostSlide = {
      id: "slide-1",
      type: "screenshot",
      content: {
        heading: "Feature Walkthrough",
        body: "Clean dashboard overview",
        assetId: "mock-asset-id",
      },
    };

    const html = generateSlideHtml({
      slide: mockSlide,
      slideNumber: 1,
      totalSlides: 3,
      theme: DARK_THEME,
      brandKit: mockBrandKit,
      aspectRatio: "4:5",
      assetDataUrl: "data:image/png;base64,mock",
    });

    expect(html).toContain("object-fit: contain");
    expect(html).toContain(".large-frame .browser-viewport");
    expect(html).toContain("height: 800px");
  });

  it("should make Reel mockup cover at least 60% of the screen height (1180px) and use contain scaling", () => {
    const mockScene: ReelScene = {
      id: "scene-1",
      type: "feature",
      duration: 4,
      content: {
        text: "Interactive Expense Tracking",
        assetId: "mock-id",
      },
    };

    const html = generateReelSceneHtml({
      scene: mockScene,
      sceneIndex: 0,
      totalScenes: 3,
      theme: DARK_THEME,
      brandKit: mockBrandKit,
      assetDataUrl: "data:image/png;base64,mock",
    });

    // 1180px out of 1920px is ~61.45% of screen height
    expect(html).toContain("height: 1180px");
    expect(html).toContain("object-fit: contain");
    expect(html).toContain("mockup-viewport");
  });

  it("should use official SVG icons in YouTube templates instead of cheap emojis", () => {
    const mockSection: VideoSection = {
      id: "sec-1",
      section: "tech-stack",
      title: "Built with Modern Stack",
      narrationText: "Powered by React, TypeScript, and Tailwind CSS.",
      assetIds: [],
    };

    const html = generateYouTubeSectionHtml({
      section: mockSection,
      sectionIndex: 0,
      totalSections: 4,
      theme: DARK_THEME,
      brandKit: mockBrandKit,
    });

    // Contains SVG element for official tech icons
    expect(html).toContain("<svg xmlns=\"http://www.w3.org/2000/svg\"");
    expect(html).not.toContain("⚡");
  });

  it("should accurately resolve multi-word tech queries without false R programming language matches", () => {
    expect(IconEngine.resolveKey("Gemini 1.5 Flash (Concurrent Reasoning)")).toBe("sparkles");
    expect(IconEngine.resolveKey("Gemini 1.5 Pro (Deep Synthesis)")).toBe("sparkles");
    expect(IconEngine.resolveKey("Gradio Custom Obsidian & Gold CSS")).toBe("layers");
    expect(IconEngine.resolveKey("Async Python Real-time Streaming")).toBe("python");
    expect(IconEngine.resolveKey("Zero-Secret Client Security")).toBe("shield");
    expect(IconEngine.resolveKey("React")).toBe("react");
    expect(IconEngine.resolveKey("R")).toBe("r");
  });
});
