import { describe, it, expect } from "vitest";
import {
  formatSrtTimestamp,
  generateSrt,
} from "../../src/core/renderer/subtitles.js";

describe("Subtitles (.srt) generator", () => {
  it("should format timestamps correctly", () => {
    expect(formatSrtTimestamp(0)).toBe("00:00:00,000");
    expect(formatSrtTimestamp(5.5)).toBe("00:00:05,500");
    expect(formatSrtTimestamp(65.123)).toBe("00:01:05,123");
    expect(formatSrtTimestamp(3665.045)).toBe("01:01:05,045");
  });

  it("should generate valid SRT file structure", () => {
    const srt = generateSrt([
      {
        index: 1,
        startTimeSec: 0,
        endTimeSec: 4.5,
        text: "Welcome to the full walkthrough of Taskflow.",
      },
      {
        index: 2,
        startTimeSec: 4.5,
        endTimeSec: 10.2,
        text: "In this video we will explore its real-time architecture.",
      },
    ]);

    expect(srt).toContain("1\n00:00:00,000 --> 00:00:04,500\nWelcome to the full walkthrough of Taskflow.");
    expect(srt).toContain("2\n00:00:04,500 --> 00:00:10,200\nIn this video we will explore its real-time architecture.");
  });
});
