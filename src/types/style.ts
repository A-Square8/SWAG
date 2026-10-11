import { z } from "zod";

// ---------------------------------------------------------------------------
// StylePreset
// ---------------------------------------------------------------------------
export const StylePresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  builtIn: z.boolean().default(true),
  tone: z.object({
    voice: z.string(),
    vocabulary: z.string(),
    emojiUsage: z.enum(["none", "minimal", "moderate", "heavy"]),
    hashtagStyle: z.string(),
    hookStyle: z.string(),
    exampleHook: z.string().optional(),
  }),
  visual: z.object({
    templateSet: z.string(),
    motionIntensity: z.enum(["subtle", "moderate", "dynamic"]),
    transitionSet: z.array(z.string()),
    pacingBPM: z.number(),
    captionStyle: z.enum(["minimal", "boxed", "highlight", "karaoke"]),
  }),
  defaults: z.object({
    slideCount: z.object({ min: z.number(), max: z.number() }),
    reelDuration: z.object({ min: z.number(), max: z.number() }),
    videoDuration: z.object({ min: z.number(), max: z.number() }),
    hashtagCount: z.number(),
  }),
});
export type StylePreset = z.infer<typeof StylePresetSchema>;
