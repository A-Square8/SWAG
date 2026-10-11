import { z } from "zod";

// ---------------------------------------------------------------------------
// PlatformFilter
// ---------------------------------------------------------------------------
export const PlatformFilterSchema = z.object({
  instagramPost: z.boolean().default(true),
  instagramReel: z.boolean().default(true),
  youtube: z.boolean().default(true),
});
export type PlatformFilter = z.infer<typeof PlatformFilterSchema>;

// ---------------------------------------------------------------------------
// LogoConfig
// ---------------------------------------------------------------------------
export const LogoConfigSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      return { filePath: val };
    }
    return val;
  },
  z.object({
    filePath: z.string(),
    position: z
      .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
      .default("bottom-right"),
    size: z.number().default(48),
    opacity: z.number().min(0).max(1).default(1),
    margin: z.number().default(24),
    showOn: PlatformFilterSchema.default({}),
    showOnSlides: z
      .union([
        z.enum(["all", "first", "last", "first-last"]),
        z.array(z.number()),
      ])
      .default("all"),
  }),
);
export type LogoConfig = z.infer<typeof LogoConfigSchema>;

// ---------------------------------------------------------------------------
// SocialLink
// ---------------------------------------------------------------------------
export const SocialLinkSchema = z.object({
  platform: z.enum([
    "instagram",
    "youtube",
    "github",
    "linkedin",
    "x",
    "website",
    "email",
    "custom",
  ]),
  handle: z.string(),
  url: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.number().default(0),
});
export type SocialLink = z.infer<typeof SocialLinkSchema>;

// ---------------------------------------------------------------------------
// OutroConfig
// ---------------------------------------------------------------------------
export const OutroConfigSchema = z.object({
  enabled: z.boolean().default(true),
  duration: z
    .object({
      reel: z.number().default(4),
      youtube: z.number().default(8),
      post: z.boolean().default(true),
    })
    .default({ reel: 4, youtube: 8, post: true }),
  layout: z.enum(["centered", "split", "stacked", "minimal"]).default("centered"),
  showLogo: z.boolean().default(true),
  showSocials: z.boolean().default(true),
  showCTA: z.boolean().default(true),
  showQR: z.boolean().default(false),
  qrUrl: z.string().optional(),
  ctaText: z.string().optional(),
  animation: z.enum(["fade", "slide-up", "scale", "none"]).default("fade"),
  narrationLine: z.string().optional(),
});
export type OutroConfig = z.infer<typeof OutroConfigSchema>;

// ---------------------------------------------------------------------------
// BrandKit
// ---------------------------------------------------------------------------
export const BrandKitSchema = z.preprocess(
  (raw) => {
    if (raw && typeof raw === "object") {
      const obj = { ...(raw as Record<string, unknown>) };
      if (!obj.logo && obj.logoPath) {
        obj.logo = obj.logoPath;
      }
      return obj;
    }
    return raw;
  },
  z.object({
    logo: LogoConfigSchema.optional(),
    brandName: z.string().optional(),
    tagline: z.string().optional(),
    defaultCTA: z.string().default("Follow for more projects"),
    socials: z.array(SocialLinkSchema).default([]),
    outro: OutroConfigSchema.default({
      enabled: true,
      duration: { reel: 4, youtube: 8, post: true },
      layout: "centered",
      showLogo: true,
      showSocials: true,
      showCTA: true,
      showQR: false,
      animation: "fade",
    }),
  }),
);
export type BrandKit = z.infer<typeof BrandKitSchema>;
