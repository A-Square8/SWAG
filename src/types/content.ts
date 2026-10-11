/**
 * Content planning schemas — for agent-filled post, reel, and video plans.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// PostSlide & PostPlan (Instagram)
// ---------------------------------------------------------------------------
export const PostSlideSchema = z.object({
  id: z.string().describe("Unique slide ID"),
  type: z
    .enum([
      "title",
      "feature",
      "screenshot",
      "tech-stack",
      "code",
      "stats",
      "outro",
      "custom",
    ])
    .describe("Slide archetype"),
  template: z.string().default("default"),
  content: z.object({
    heading: z.string().optional().describe("Main slide headline"),
    subtitle: z.string().optional().describe("Supporting sub-headline"),
    body: z.string().optional().describe("Paragraph or descriptive text"),
    assetId: z
      .string()
      .optional()
      .describe("Asset UUID from list_assets to showcase on this slide"),
    items: z
      .array(z.string())
      .optional()
      .describe("Bulleted items or badges (e.g. tech stack, key takeaways)"),
    ctaText: z.string().optional().describe("Call to action button or prompt"),
    tagline: z.string().optional().describe("Short project tagline"),
  }),
  overrides: z.record(z.unknown()).optional().describe("Optional token overrides"),
});
export type PostSlide = z.infer<typeof PostSlideSchema>;

export const PostPlanSchema = z.object({
  platform: z.literal("instagram-post"),
  format: z
    .enum(["single", "carousel"])
    .default("carousel")
    .describe("Single post (1 slide) or carousel (multiple slides)"),
  aspectRatio: z
    .enum(["4:5", "1:1"])
    .default("4:5")
    .describe("4:5 (1080x1350 portrait) or 1:1 (1080x1080 square)"),
  slides: z.array(PostSlideSchema).min(1).describe("Ordered slides to render"),
  caption: z.string().default("").describe("Agent-written Instagram caption"),
  hashtags: z
    .array(z.string())
    .default([])
    .describe("Targeted hashtags (#dev #coding)"),
  altText: z.string().default("").describe("Accessibility description"),
});
export type PostPlan = z.infer<typeof PostPlanSchema>;

// ---------------------------------------------------------------------------
// Reel Scene & Reel Plan (Instagram)
// ---------------------------------------------------------------------------
export const ReelSceneSchema = z.object({
  id: z.string(),
  type: z.enum(["hook", "feature", "demo", "tech", "outro"]),
  duration: z.number().default(4).describe("Target duration in seconds"),
  content: z.object({
    text: z.string().optional().describe("On-screen caption/headline"),
    assetId: z.string().optional().describe("Asset UUID for video/screenshot"),
    narrationText: z.string().optional().describe("Spoken text for TTS"),
    items: z.array(z.string()).optional().describe("Bullet points or tech stack items"),
  }),
  transition: z.string().default("fade"),
});
export type ReelScene = z.infer<typeof ReelSceneSchema>;

export const CaptionConfigSchema = z.object({
  enabled: z.boolean().default(true),
  style: z.enum(["minimal", "boxed", "highlight", "karaoke"]).default("highlight"),
  position: z.enum(["top", "center", "bottom"]).default("bottom"),
  highlightActiveWord: z.boolean().default(true),
  fontSize: z.number().default(28),
});
export type CaptionConfig = z.infer<typeof CaptionConfigSchema>;

export const ReelPlanSchema = z.object({
  platform: z.literal("instagram-reel"),
  targetDuration: z.number().default(30),
  scenes: z.array(ReelSceneSchema).min(1),
  caption: z.string().default(""),
  hashtags: z.array(z.string()).default([]),
  captions: CaptionConfigSchema.default({}),
});
export type ReelPlan = z.infer<typeof ReelPlanSchema>;

// ---------------------------------------------------------------------------
// Video Section & YouTube Plan
// ---------------------------------------------------------------------------
export const VideoSectionSchema = z.object({
  id: z.string(),
  section: z.enum([
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
  ]),
  title: z.string(),
  narrationText: z.string().describe("Spoken narration text for TTS"),
  onScreenText: z.string().optional(),
  assetIds: z.array(z.string()).default([]),
  estimatedDuration: z.number().default(15),
  lowerThird: z.string().optional(),
  items: z.array(z.string()).optional().describe("Bullet points or tech stack badges"),
});
export type VideoSection = z.infer<typeof VideoSectionSchema>;

export const RawDemoConfigSchema = z.object({
  enabled: z
    .boolean()
    .default(true)
    .describe(
      "Whether to append a raw high quality project demo at the end of the video (full size screen recording with soothing music, no narration)",
    ),
  assetId: z
    .string()
    .optional()
    .describe("Asset UUID from list_assets of the screen recording to use"),
  videoPath: z
    .string()
    .optional()
    .describe("Direct file path to raw demo video recording"),
  title: z
    .string()
    .default("Raw Project Demo (Live Interface)")
    .describe("Chapter title for the raw demo section"),
  duration: z
    .number()
    .optional()
    .describe("Duration in seconds for the demo segment (defaults to video length or full recording)"),
  musicTrack: z
    .string()
    .optional()
    .describe("Optional path to custom audio track or 'soothing' preset"),
  audioVolume: z
    .number()
    .min(0)
    .max(1)
    .default(0.35)
    .describe("Background music volume level (0.0 to 1.0, default: 0.35)"),
});
export type RawDemoConfig = z.infer<typeof RawDemoConfigSchema>;

export const YouTubeVideoPlanSchema = z.object({
  platform: z.literal("youtube"),
  title: z.string().describe("YouTube video title"),
  description: z.string().describe("Full YouTube video description"),
  tags: z.array(z.string()).default([]),
  targetDuration: z.number().default(180),
  sections: z.array(VideoSectionSchema).min(1),
  captions: CaptionConfigSchema.default({}),
  subtitleLanguage: z.string().default("en"),
  rawDemo: RawDemoConfigSchema.optional().describe(
    "Raw high quality project demo appended after the outro (full size screen recording with soothing music and no narration)",
  ),
});
export type YouTubeVideoPlan = z.infer<typeof YouTubeVideoPlanSchema>;

export type PlatformPlan = PostPlan | ReelPlan | YouTubeVideoPlan;

