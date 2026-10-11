import { z } from "zod";

// ---------------------------------------------------------------------------
// Feature
// ---------------------------------------------------------------------------
export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  route: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  include: z.boolean().default(true),
});
export type Feature = z.infer<typeof FeatureSchema>;

// ---------------------------------------------------------------------------
// TechStackItem
// ---------------------------------------------------------------------------
export const TechStackItemSchema = z.object({
  name: z.string(),
  category: z.enum([
    "framework",
    "language",
    "database",
    "styling",
    "tooling",
    "deployment",
    "other",
  ]),
  icon: z.string().optional(),
  version: z.string().optional(),
});
export type TechStackItem = z.infer<typeof TechStackItemSchema>;

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const RouteSchema = z.object({
  path: z.string(),
  label: z.string(),
  isProtected: z.boolean().default(false),
  capturable: z.boolean().default(true),
});
export type Route = z.infer<typeof RouteSchema>;

// ---------------------------------------------------------------------------
// ProjectProfile
// ---------------------------------------------------------------------------
export const ProjectProfileSchema = z.object({
  name: z.string(),
  tagline: z.string().default(""),
  description: z.string().default(""),
  features: z.array(FeatureSchema).default([]),
  techStack: z.array(TechStackItemSchema).default([]),
  architecture: z.string().default(""),
  routes: z.array(RouteSchema).default([]),
  runCommand: z.string().default(""),
  port: z.number().default(3000),
  entryPoints: z.array(z.string()).default([]),
  projectType: z.enum(["web", "other"]).default("web"),
  packageManager: z
    .enum(["npm", "yarn", "pnpm", "bun"])
    .nullable()
    .default(null),
  hasAuth: z.boolean().default(false),
  detectedAt: z.string().default(() => new Date().toISOString()),
  confidence: z.number().min(0).max(1).default(0.5),
  raw: z.object({
    readme: z.string().optional(),
    packageJson: z.record(z.unknown()).optional(),
    folderStructure: z.string().default(""),
  }),
});
export type ProjectProfile = z.infer<typeof ProjectProfileSchema>;
