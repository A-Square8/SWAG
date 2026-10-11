/**
 * Audio Utilities — audio duration measurement via ffprobe and word-count estimation.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { logger } from "../../utils/logger.js";

const execFileAsync = promisify(execFile);
const log = logger.child("tts:audio-utils");

/**
 * Measure duration of an audio file in seconds using ffprobe.
 */
export async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    const duration = parseFloat(stdout.trim());
    if (!isNaN(duration) && duration > 0) {
      return duration;
    }
  } catch (err) {
    log.debug(`ffprobe measurement failed for ${filePath}: ${err}`);
  }

  // Fallback estimation: return 3 seconds minimum
  return 3.0;
}

/**
 * Estimate narration duration based on text length (~140 words per minute = 2.33 words/sec).
 */
export function estimateTextDuration(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const seconds = Math.max(2, Math.round((words / 2.33) * 10) / 10);
  return seconds;
}
