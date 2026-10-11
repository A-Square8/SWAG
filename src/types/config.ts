import { z } from "zod";

// ---------------------------------------------------------------------------
// SwagConfig — project-level config from swag.config.json
// ---------------------------------------------------------------------------

const ViewportSchema = z.object({
  width: z.number(),
  height: z.number(),
  label: z.string().optional(),
  deviceScaleFactor: z.number().optional(),
});

export const SwagConfigSchema = z.object({
  // Project overrides
  projectName: z.string().optional(),
  runCommand: z.string().optional(),
  port: z.number().optional(),
  devServerReadyPattern: z.string().optional(),

  // Capture
  capture: z
    .object({
      viewports: z.array(ViewportSchema).optional(),
      colorSchemes: z.array(z.enum(["light", "dark"])).optional(),
      routes: z
        .object({
          include: z.array(z.string()).optional(),
          exclude: z.array(z.string()).optional(),
        })
        .optional(),
      auth: z
        .object({
          url: z.string().optional(),
          username: z.string().optional(),
          password: z.string().optional(),
        })
        .optional(),
      seedScript: z.string().optional(),
      waitAfterNavigation: z.number().optional(),
      slowMotion: z.number().optional(),
      cursorHighlight: z.boolean().optional(),
    })
    .optional(),

  // Theme
  theme: z.record(z.unknown()).optional(),

  // Brand
  brand: z.record(z.unknown()).optional(),

  // Style
  defaultStyle: z.string().optional(),

  // Output
  output: z
    .object({
      directory: z.string().default("swag-output"),
      namingPattern: z.string().optional(),
    })
    .optional(),

  // Content
  content: z
    .object({
      defaultSlideCount: z.number().optional(),
      defaultReelDuration: z.number().optional(),
      defaultVideoDuration: z.number().optional(),
      hashtagCount: z.number().optional(),
      fixedHashtags: z.array(z.string()).optional(),
      bannedWords: z.array(z.string()).optional(),
      narrationLanguage: z.string().optional(),
      subtitleLanguage: z.string().optional(),
      deviceFrame: z.enum(["browser", "phone", "none"]).optional(),
      deviceFrameShadow: z.boolean().optional(),
      kenBurns: z.boolean().optional(),
    })
    .optional(),

  // TTS
  tts: z
    .object({
      provider: z
        .enum(["piper", "edge-tts", "deepgram", "elevenlabs"])
        .optional(),
      voice: z.string().optional(),
      speed: z.number().optional(),
      gender: z.enum(["male", "female", "neutral"]).optional(),
      accent: z.string().optional(),
    })
    .optional(),

  // Per-platform overrides
  platformOverrides: z.record(z.record(z.unknown())).optional(),
});
export type SwagConfig = z.infer<typeof SwagConfigSchema>;
