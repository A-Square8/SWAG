/**
 * TTS Provider — Keyless text-to-speech using Microsoft Edge TTS with offline fallback.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { TTSOptions, TTSResult } from "../../types/index.js";
import { ensureDir, pathExists } from "../../utils/fs.js";
import { dirname } from "node:path";
import { getAudioDuration, estimateTextDuration } from "./audio-utils.js";
import { logger } from "../../utils/logger.js";

const execFileAsync = promisify(execFile);
const log = logger.child("tts");

export class TTSManager {
  /**
   * Synthesize spoken narration audio from text.
   */
  public static async synthesize(options: TTSOptions): Promise<TTSResult> {
    const {
      text,
      voice = "en-US-ChristopherNeural",
      outputFilePath,
    } = options;

    await ensureDir(dirname(outputFilePath));

    let synthesized = false;

    // 1. Try Microsoft Edge TTS (keyless, neural voice)
    try {
      log.info(`Synthesizing TTS with voice "${voice}": "${text.slice(0, 50)}..."`);
      // Dynamic import to handle ESM / CJS module boundary safely
      const edgeModule = await import("node-edge-tts");
      const EdgeTTS = edgeModule.EdgeTTS || (edgeModule as any).default?.EdgeTTS;

      if (EdgeTTS) {
        const tts = new EdgeTTS({ voice });
        await tts.ttsPromise(text, outputFilePath);
        synthesized = await pathExists(outputFilePath);
      }
    } catch (err) {
      log.warn(`Edge TTS synthesis error: ${err}. Falling back to timed audio.`);
    }

    // 2. Fallback to silent timed audio if offline or service unavailable
    if (!synthesized) {
      const estimatedSecs = estimateTextDuration(text);
      log.info(`Generating fallback audio track (${estimatedSecs}s)`);
      try {
        await execFileAsync("ffmpeg", [
          "-f",
          "lavfi",
          "-i",
          "anullsrc=r=24000:cl=mono",
          "-t",
          String(estimatedSecs),
          "-acodec",
          "libmp3lame",
          outputFilePath,
          "-y",
        ]);
      } catch (fallbackErr) {
        log.error(`Fallback audio generation failed: ${fallbackErr}`);
      }
    }

    // 3. Measure actual audio duration
    const durationSeconds = await getAudioDuration(outputFilePath);
    log.info(`TTS audio generated: ${outputFilePath} (${durationSeconds.toFixed(2)}s)`);

    return {
      audioFilePath: outputFilePath,
      durationSeconds,
      voice,
    };
  }
}
