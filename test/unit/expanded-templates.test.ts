import { describe, it, expect } from "vitest";
import {
  PostSlideSchema,
  ReelSceneSchema,
  VideoSectionSchema,
} from "../../src/types/content.js";
import { generateSlideHtml } from "../../src/core/renderer/image/templates.js";
import { generateReelSceneHtml } from "../../src/core/renderer/video/templates.js";
import { generateYouTubeSectionHtml } from "../../src/core/renderer/video/youtube-templates.js";
import { DARK_THEME } from "../../src/core/theme/presets/dark.js";

const dummyBrandKit = {
  brandName: "Acme Dev",
  defaultCTA: "Star on GitHub",
  socials: [
    { platform: "github" as const, handle: "acmedev" },
    { platform: "website" as const, handle: "https://acme.dev" },
  ],
};

describe("Expanded Archetypes & Template Renderers", () => {
  it("should validate all 20 PostSlide archetype types in schema", () => {
    const archetypes = [
      "title",
      "feature",
      "screenshot",
      "tech-stack",
      "code",
      "stats",
      "outro",
      "custom",
      "metrics",
      "bar-chart",
      "pie-chart",
      "radar-chart",
      "comparison",
      "feature-matrix",
      "pipeline",
      "architecture",
      "terminal",
      "code-diff",
      "testimonial",
      "timeline",
    ];

    expect(archetypes).toHaveLength(20);

    for (const type of archetypes) {
      const parsed = PostSlideSchema.safeParse({
        id: `slide-${type}`,
        type,
        content: { heading: `Slide ${type}` },
      });
      expect(parsed.success).toBe(true);
    }
  });

  it("should generate valid HTML for all 20 Instagram slide archetypes", () => {
    const archetypes = [
      "title",
      "feature",
      "screenshot",
      "tech-stack",
      "code",
      "stats",
      "outro",
      "custom",
      "metrics",
      "bar-chart",
      "pie-chart",
      "radar-chart",
      "comparison",
      "feature-matrix",
      "pipeline",
      "architecture",
      "terminal",
      "code-diff",
      "testimonial",
      "timeline",
    ] as const;

    for (let i = 0; i < archetypes.length; i++) {
      const type = archetypes[i];
      const html = generateSlideHtml({
        slide: {
          id: `s-${i}`,
          type,
          template: "default",
          content: {
            heading: `Archetype ${type}`,
            subtitle: "Test subtitle",
            items: ["Item A", "Item B"],
          },
        },
        slideNumber: i + 1,
        totalSlides: archetypes.length,
        theme: DARK_THEME,
        brandKit: dummyBrandKit,
        aspectRatio: "4:5",
      });

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain(`Slide ${i + 1}`);
      expect(html).toContain("slide-content");
      expect(html).toContain("Acme Dev");
    }
  });

  it("should validate and render all 12 Reel scene archetypes", () => {
    const reelTypes = [
      "hook",
      "feature",
      "demo",
      "tech",
      "outro",
      "problem",
      "stats",
      "before-after",
      "pipeline",
      "code",
      "testimonial",
      "chart",
    ] as const;

    expect(reelTypes).toHaveLength(12);

    for (let i = 0; i < reelTypes.length; i++) {
      const type = reelTypes[i];
      const parsed = ReelSceneSchema.safeParse({
        id: `reel-${type}`,
        type,
        duration: 4,
        content: { text: `Scene ${type}`, narrationText: `Spoken narration for ${type}` },
      });
      expect(parsed.success).toBe(true);

      const html = generateReelSceneHtml({
        scene: {
          id: `scene-${i}`,
          type,
          duration: 4,
          content: { text: `Scene ${type}`, narrationText: "Audio text" },
          transition: "fade",
        },
        sceneIndex: i,
        totalScenes: reelTypes.length,
        theme: DARK_THEME,
        brandKit: dummyBrandKit,
      });

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("safe-zone-content");
    }
  });

  it("should validate and render all 21 YouTube video section archetypes", () => {
    const ytSections = [
      "intro",
      "problem",
      "features",
      "how-it-works",
      "tech-stack",
      "demo",
      "challenges",
      "future",
      "outro",
      "raw-demo",
      "custom",
      "metrics",
      "comparison",
      "code-walkthrough",
      "architecture",
      "workflow",
      "testimonials",
      "timeline",
      "benchmarks",
      "git-history",
      "call-to-action",
    ] as const;

    expect(ytSections).toHaveLength(21);

    for (let i = 0; i < ytSections.length; i++) {
      const section = ytSections[i];
      const parsed = VideoSectionSchema.safeParse({
        id: `sec-${section}`,
        section,
        title: `Section ${section}`,
        narrationText: `Narration for section ${section}`,
        assetIds: [],
        estimatedDuration: 15,
      });
      expect(parsed.success).toBe(true);

      const html = generateYouTubeSectionHtml({
        section: {
          id: `sec-${i}`,
          section,
          title: `Section ${section}`,
          narrationText: `Narration for section ${section}`,
          assetIds: [],
          estimatedDuration: 15,
        },
        sectionIndex: i,
        totalSections: ytSections.length,
        theme: DARK_THEME,
        brandKit: dummyBrandKit,
      });

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Section");
    }
  });
});
