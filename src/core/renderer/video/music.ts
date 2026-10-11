/**
 * Soothing Background Music Generator — generates lush, ambient harmonic background tracks
 * offline without external dependencies or cloud API keys.
 */

import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { resolvePath, pathExists, ensureDir } from "../../../utils/fs.js";
import { logger } from "../../../utils/logger.js";

const log = logger.child("renderer:video:music");

export class SoothingMusicGenerator {
  /**
   * Synthesize a lush, soothing ambient background music track in 16-bit 44.1kHz stereo WAV format.
   *
   * @param outputPath Output WAV file destination path
   * @param durationSeconds Duration of ambient music to generate (seconds)
   * @returns Path to generated WAV file
   */
  public static async generate(
    outputPath: string,
    durationSeconds: number = 30,
  ): Promise<string> {
    const dur = Math.max(3, durationSeconds);
    log.info(`Synthesizing ${dur}s soothing ambient background music track...`);

    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * dur);
    const headerSize = 44;
    const buffer = Buffer.alloc(headerSize + numSamples * 4); // 2 channels * 16-bit (2 bytes)

    // 1. Write standard RIFF WAV header
    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + numSamples * 4, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16); // PCM chunk size
    buffer.writeUInt16LE(1, 20); // PCM format
    buffer.writeUInt16LE(2, 22); // Stereo 2 channels
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 4, 28); // byte rate (sampleRate * 2 channels * 2 bytes)
    buffer.writeUInt16LE(4, 32); // block align
    buffer.writeUInt16LE(16, 34); // bits per sample
    buffer.write("data", 36);
    buffer.writeUInt32LE(numSamples * 4, 40);

    // 2. Harmonic chord progression (warm meditative ambient chords)
    const chords = [
      [130.81, 196.0, 246.94, 293.66, 329.63], // Cmaj9
      [110.0, 164.81, 196.0, 261.63, 246.94], // Am9
      [87.31, 130.81, 220.0, 329.63, 246.94], // Fmaj7#11
      [98.0, 146.83, 196.0, 261.63, 293.66], // Gsus4 / G6
      [130.81, 174.61, 220.0, 261.63, 329.63], // Fmaj9 / C
    ];
    const chordLen = 6.0; // 6 seconds per chord

    let offset = headerSize;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;

      // Master envelope: smooth fade in and gentle fade out
      const masterFade =
        Math.min(1, t / 2.0) * Math.min(1, (dur - t) / 2.5);

      let left = 0;
      let right = 0;

      for (let c = 0; c < chords.length; c++) {
        const chordProgress = (t / chordLen) % chords.length;
        let dist = Math.abs(chordProgress - c);
        if (dist > chords.length / 2) {
          dist = chords.length - dist;
        }
        const chordWeight = Math.max(0, 1 - dist);
        if (chordWeight <= 0) continue;

        const freqs = chords[c];
        for (let f = 0; f < freqs.length; f++) {
          const baseFreq = freqs[f];
          // Gentle detuning LFO for spacious stereo chorus and warm acoustic pad
          const lfo = 1 + 0.0018 * Math.sin(2 * Math.PI * 0.22 * t + f);
          const toneL =
            Math.sin(2 * Math.PI * (baseFreq * 0.9982) * lfo * t) +
            0.28 * Math.sin(4 * Math.PI * (baseFreq * 0.9982) * lfo * t) +
            0.12 * Math.sin(6 * Math.PI * (baseFreq * 0.9982) * lfo * t);
          const toneR =
            Math.sin(2 * Math.PI * (baseFreq * 1.0018) * lfo * t) +
            0.28 * Math.sin(4 * Math.PI * (baseFreq * 1.0018) * lfo * t) +
            0.12 * Math.sin(6 * Math.PI * (baseFreq * 1.0018) * lfo * t);

          left += toneL * chordWeight * 0.075;
          right += toneR * chordWeight * 0.075;
        }
      }

      // Soft limiting & normalization
      left = Math.max(-0.95, Math.min(0.95, left * masterFade));
      right = Math.max(-0.95, Math.min(0.95, right * masterFade));

      buffer.writeInt16LE(Math.round(left * 32767), offset);
      buffer.writeInt16LE(Math.round(right * 32767), offset + 2);
      offset += 4;
    }

    await ensureDir(dirname(outputPath));
    await writeFile(outputPath, buffer);
    log.info(`Saved soothing ambient soundtrack: ${outputPath} (${dur}s)`);

    return outputPath;
  }

  /**
   * Resolve an audio track for background music:
   * uses custom track if provided and exists, otherwise generates a soothing ambient track.
   */
  public static async resolveMusicTrack(
    projectPath: string,
    customTrack: string | undefined,
    durationSeconds: number,
    fallbackOutputPath: string,
  ): Promise<string> {
    if (customTrack && customTrack.trim() && customTrack.toLowerCase() !== "soothing") {
      const resolved = resolvePath(projectPath, customTrack);
      if (await pathExists(resolved)) {
        log.info(`Using user-supplied soothing music track: ${resolved}`);
        return resolved;
      }
      log.warn(`Custom music track not found at ${resolved}. Falling back to synthesized soothing music.`);
    }

    return await this.generate(fallbackOutputPath, durationSeconds);
  }
}
