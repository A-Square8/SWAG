/**
 * Render types and schemas for rendered outputs and metadata.
 */

import { z } from "zod";

export const OutputEntrySchema = z.object({
  version: z.number(),
  platform: z.enum(["instagram-post", "instagram-reel", "youtube"]),
  createdAt: z.string(),
  paths: z.array(z.string()),
  metadataPath: z.string(),
  metadata: z.record(z.unknown()).optional(),
});
export type OutputEntry = z.infer<typeof OutputEntrySchema>;

export const PostRenderResultSchema = z.object({
  success: z.literal(true),
  outputPaths: z.array(z.string()),
  metadataPath: z.string(),
  version: z.number(),
});
export type PostRenderResult = z.infer<typeof PostRenderResultSchema>;

export const ReelRenderResultSchema = z.object({
  success: z.literal(true),
  outputPath: z.string(),
  metadataPath: z.string(),
  actualDuration: z.number(),
  version: z.number(),
});
export type ReelRenderResult = z.infer<typeof ReelRenderResultSchema>;

export const YouTubeRenderResultSchema = z.object({
  success: z.literal(true),
  outputPath: z.string(),
  srtPath: z.string(),
  scriptPath: z.string(),
  metadataPath: z.string(),
  chapters: z.array(
    z.object({
      title: z.string(),
      startTime: z.string(),
      seconds: z.number(),
    }),
  ),
  actualDuration: z.number(),
  version: z.number(),
});
export type YouTubeRenderResult = z.infer<typeof YouTubeRenderResultSchema>;
