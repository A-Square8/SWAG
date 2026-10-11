import { describe, it, expect } from "vitest";
import {
  formatChapterTime,
  generateChapters,
  formatChaptersForDescription,
} from "../../src/core/renderer/chapters.js";

describe("YouTube Chapters generator", () => {
  it("should format timestamps into M:SS or H:MM:SS", () => {
    expect(formatChapterTime(0)).toBe("0:00");
    expect(formatChapterTime(45)).toBe("0:45");
    expect(formatChapterTime(125)).toBe("2:05");
    expect(formatChapterTime(3670)).toBe("1:01:10");
  });

  it("should generate chapter list ensuring first chapter starts at 0:00", () => {
    const chapters = generateChapters([
      { title: "Introduction & Overview", startTimeSec: 0 },
      { title: "Architecture & Stack", startTimeSec: 45 },
      { title: "Interactive Demo", startTimeSec: 130 },
      { title: "Outro & Source Code", startTimeSec: 215 },
    ]);

    expect(chapters[0].startTime).toBe("0:00");
    expect(chapters[1].startTime).toBe("0:45");
    expect(chapters[2].startTime).toBe("2:10");
    expect(chapters[3].startTime).toBe("3:35");

    const descriptionText = formatChaptersForDescription(chapters);
    expect(descriptionText).toBe(
      "0:00 Introduction & Overview\n0:45 Architecture & Stack\n2:10 Interactive Demo\n3:35 Outro & Source Code",
    );
  });
});
