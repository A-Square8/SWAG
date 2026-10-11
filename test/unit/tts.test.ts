import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TTSManager } from "../../src/core/tts/index.js";
import { pathExists } from "../../src/utils/fs.js";

describe("TTSManager", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-tts-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should synthesize narration audio and return valid duration", async () => {
    const audioPath = join(tempDir, "sample-narration.mp3");

    const result = await TTSManager.synthesize({
      text: "Welcome to SWAG, the social media automation engine for developers.",
      voice: "en-US-ChristopherNeural",
      outputFilePath: audioPath,
    });

    expect(result.audioFilePath).toBe(audioPath);
    expect(result.durationSeconds).toBeGreaterThan(0.5);
    expect(await pathExists(audioPath)).toBe(true);
  }, 20000);
});
