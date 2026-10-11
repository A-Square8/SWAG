import { z } from "zod";

export const TTSOptionsSchema = z.object({
  text: z.string(),
  voice: z.string().default("en-US-ChristopherNeural"),
  rate: z.string().default("+0%"),
  pitch: z.string().default("+0Hz"),
  volume: z.string().default("+0%"),
  outputFilePath: z.string(),
});
export type TTSOptions = {
  text: string;
  voice?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
  outputFilePath: string;
};

export const TTSResultSchema = z.object({
  audioFilePath: z.string(),
  durationSeconds: z.number(),
  voice: z.string(),
});
export type TTSResult = z.infer<typeof TTSResultSchema>;
