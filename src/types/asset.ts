import { z } from "zod";

// ---------------------------------------------------------------------------
// BlurRegion
// ---------------------------------------------------------------------------
export const BlurRegionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  label: z.string().optional(),
  autoDetected: z.boolean().default(false),
});
export type BlurRegion = z.infer<typeof BlurRegionSchema>;

// ---------------------------------------------------------------------------
// Asset
// ---------------------------------------------------------------------------
export const AssetSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["screenshot", "recording", "image", "gif", "video"]),
  source: z.enum(["auto-captured", "user-supplied"]),
  filePath: z.string(),
  thumbnailPath: z.string().optional(),
  metadata: z.object({
    route: z.string().optional(),
    description: z.string().default(""),
    width: z.number().default(0),
    height: z.number().default(0),
    duration: z.number().optional(),
    device: z.enum(["desktop", "tablet", "mobile"]).optional(),
    colorScheme: z.enum(["light", "dark"]).optional(),
    capturedAt: z.string().optional(),
    blurRegions: z.array(BlurRegionSchema).optional(),
  }),
});
export type Asset = z.infer<typeof AssetSchema>;

// ---------------------------------------------------------------------------
// AssetCatalog
// ---------------------------------------------------------------------------
export const AssetCatalogSchema = z.object({
  projectName: z.string(),
  assets: z.array(AssetSchema).default([]),
  updatedAt: z.string().default(() => new Date().toISOString()),
});
export type AssetCatalog = z.infer<typeof AssetCatalogSchema>;
