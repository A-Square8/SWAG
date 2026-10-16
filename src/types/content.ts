/**
 * Content planning schemas — for agent-filled post, reel, and video plans.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// PostSlide & PostPlan (Instagram)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Expanded Data Schemas for Tables, Checklists, Bullet Points & Diagrams
// ---------------------------------------------------------------------------
export const ComparisonTableRowSchema = z.union([
  z.object({
    feature: z.string().optional(),
    label: z.string().optional(),
    values: z.array(z.union([z.string(), z.boolean(), z.number()])),
    highlight: z.boolean().optional(),
  }),
  z.array(z.union([z.string(), z.boolean(), z.number()])),
]);
export type ComparisonTableRow = z.infer<typeof ComparisonTableRowSchema>;

export const ComparisonTableDataSchema = z.object({
  headers: z.array(z.string()).optional().describe("Column header titles (e.g. ['Feature', 'Our Tool', 'Alternative A'])"),
  rows: z.array(ComparisonTableRowSchema).optional().describe("Dynamic rows of comparison values"),
  items: z.array(z.record(z.unknown())).optional().describe("Optional structured item array"),
  ourColumnIndex: z.number().optional().default(1).describe("0-based index of our product column to highlight"),
});
export type ComparisonTableData = z.infer<typeof ComparisonTableDataSchema>;

export const ChecklistItemSchema = z.object({
  label: z.string().describe("Task or capability title"),
  checked: z.boolean().default(true).describe("Whether item is checked/completed"),
  badge: z.string().optional().describe("Status pill tag (e.g. 'VERIFIED', 'AUTOMATED', 'READY')"),
  detail: z.string().optional().describe("Supporting detail description"),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const BulletPointItemSchema = z.object({
  title: z.string().describe("Key takeaway or bullet headline"),
  desc: z.string().optional().describe("Supporting explanation or details"),
  icon: z.string().optional().describe("Icon name (e.g. zap, shield, terminal, cpu, layers)"),
  badge: z.string().optional().describe("Step badge or label (e.g. '01', 'FAST', 'SECURE')"),
});
export type BulletPointItem = z.infer<typeof BulletPointItemSchema>;

export const FlowchartNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["process", "decision", "start", "end"]).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  color: z.string().optional(),
});
export type FlowchartNode = z.infer<typeof FlowchartNodeSchema>;

export const FlowchartEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  type: z.enum(["solid", "dashed"]).optional(),
});
export type FlowchartEdge = z.infer<typeof FlowchartEdgeSchema>;

export const FlowchartDataSchema = z.object({
  nodes: z.array(FlowchartNodeSchema).describe("Nodes in the flowchart or decision tree"),
  edges: z.array(FlowchartEdgeSchema).describe("Directed edges connecting nodes"),
  title: z.string().optional(),
});
export type FlowchartData = z.infer<typeof FlowchartDataSchema>;

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
      // Visual archetypes
      "metrics",
      "bar-chart",
      "pie-chart",
      "radar-chart",
      "comparison",
      "feature-matrix",
      "comparison-table",
      "pipeline",
      "workflow",
      "architecture",
      "terminal",
      "code-diff",
      "testimonial",
      "timeline",
      // New interactive visual widgets
      "checklist",
      "bullet-points",
      "decision-graph",
      "flowchart",
    ])
    .describe("Slide archetype"),
  template: z.string().default("default"),
  content: z
    .object({
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
      // Chart / Diagram / Widget data fields
      chartData: z.array(z.record(z.unknown())).optional(),
      diagramData: z.record(z.unknown()).optional(),
      tableData: z.record(z.unknown()).optional().describe("Comparison table data"),
      checklistData: z.array(z.record(z.unknown())).optional().describe("Checklist items"),
      steps: z.array(z.record(z.unknown())).optional().describe("Pipeline / workflow steps"),
      nodes: z.array(FlowchartNodeSchema).optional().describe("Flowchart nodes"),
      edges: z.array(FlowchartEdgeSchema).optional().describe("Flowchart edges"),
      widgetData: z.record(z.unknown()).optional(),
      command: z.string().optional(),
      codeDiff: z.record(z.unknown()).optional(),
      rating: z.number().optional(),
      author: z.string().optional(),
      role: z.string().optional(),
      company: z.string().optional(),
      avatarUrl: z.string().optional(),
      quote: z.string().optional(),
      metrics: z.array(z.record(z.unknown())).optional(),
      matrix: z.record(z.unknown()).optional(),
      terminalLines: z.array(z.unknown()).optional(),
      deviceFrame: z
        .enum(["macbook", "iphone", "ipad", "multidevice"])
        .optional(),
      pattern: z
        .enum(["dots", "circuit", "mesh", "noise", "topo"])
        .optional(),
      variant: z.string().optional(),
      data: z.record(z.unknown()).optional(),
    })
    .passthrough(),
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
  type: z.enum([
    "hook",
    "feature",
    "demo",
    "tech",
    "outro",
    // Reel scene types
    "problem",
    "stats",
    "before-after",
    "pipeline",
    "code",
    "testimonial",
    "chart",
    // New archetypes
    "comparison",
    "comparison-table",
    "checklist",
    "bullet-points",
    "decision-graph",
    "flowchart",
  ]),
  duration: z.number().default(4).describe("Target duration in seconds"),
  content: z
    .object({
      text: z.string().optional().describe("On-screen caption/headline"),
      assetId: z.string().optional().describe("Asset UUID for video/screenshot"),
      narrationText: z.string().optional().describe("Spoken text for TTS"),
      items: z.array(z.string()).optional().describe("Bullet points or tech stack items"),
      chartData: z.array(z.record(z.unknown())).optional(),
      chartType: z.enum(["bar", "pie", "radar"]).optional(),
      metrics: z.array(z.record(z.unknown())).optional(),
      tableData: z.record(z.unknown()).optional(),
      checklistData: z.array(z.record(z.unknown())).optional(),
      diagramData: z.record(z.unknown()).optional(),
      steps: z.array(z.record(z.unknown())).optional(),
      nodes: z.array(FlowchartNodeSchema).optional(),
      edges: z.array(FlowchartEdgeSchema).optional(),
      author: z.string().optional(),
      role: z.string().optional(),
      quote: z.string().optional(),
      codeSnippet: z.string().optional(),
      command: z.string().optional(),
      beforeText: z.string().optional(),
      afterText: z.string().optional(),
      deviceFrame: z
        .enum(["macbook", "iphone", "ipad", "multidevice"])
        .optional(),
      data: z.record(z.unknown()).optional(),
    })
    .passthrough(),
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
export const VideoSectionSchema = z
  .object({
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
      // Visual YouTube sections
      "metrics",
      "comparison",
      "comparison-table",
      "code-walkthrough",
      "architecture",
      "workflow",
      "testimonials",
      "timeline",
      "benchmarks",
      "git-history",
      "call-to-action",
      // New interactive visual widgets
      "checklist",
      "bullet-points",
      "decision-graph",
      "flowchart",
    ]),
    title: z.string(),
    narrationText: z.string().describe("Spoken narration text for TTS"),
    onScreenText: z.string().optional(),
    assetIds: z.array(z.string()).default([]),
    estimatedDuration: z.number().default(15),
    lowerThird: z.string().optional(),
    items: z.array(z.string()).optional().describe("Bullet points or tech stack badges"),
    data: z.record(z.unknown()).optional(),
    tableData: z.record(z.unknown()).optional().describe("Dynamic comparison table data with headers and rows"),
    checklistData: z.array(z.record(z.unknown())).optional().describe("Checklist items with label, checked, badge, detail"),
    steps: z.array(z.record(z.unknown())).optional().describe("Workflow pipeline steps"),
    nodes: z.array(FlowchartNodeSchema).optional().describe("Flowchart / Decision tree nodes"),
    edges: z.array(FlowchartEdgeSchema).optional().describe("Flowchart / Decision tree edges"),
    chartData: z.array(z.record(z.unknown())).optional(),
    diagramData: z.record(z.unknown()).optional(),
    widgetData: z.record(z.unknown()).optional(),
    metrics: z.array(z.record(z.unknown())).optional(),
    codeSnippet: z.string().optional(),
    command: z.string().optional(),
    ctaUrl: z.string().optional(),
  })
  .passthrough();
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
