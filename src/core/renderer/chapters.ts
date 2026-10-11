/**
 * YouTube Chapters generator — formats timestamp markers for descriptions.
 */

export interface Chapter {
  title: string;
  startTime: string; // e.g. "0:00", "1:45"
  seconds: number;
}

/**
 * Format seconds into YouTube chapter timestamp (M:SS or H:MM:SS).
 */
export function formatChapterTime(seconds: number): string {
  const totalSec = Math.floor(seconds);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);

  const pad = (n: number) => String(n).padStart(2, "0");

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
}

/**
 * Build structured chapters list from video sections.
 */
export function generateChapters(
  sections: Array<{ title: string; startTimeSec: number }>,
): Chapter[] {
  return sections.map((sec, idx) => ({
    title: sec.title,
    // First chapter MUST start at 0:00 for YouTube chapter parsing
    startTime: idx === 0 ? "0:00" : formatChapterTime(sec.startTimeSec),
    seconds: idx === 0 ? 0 : sec.startTimeSec,
  }));
}

/**
 * Format chapters into a block of text suitable for pasting into YouTube descriptions.
 */
export function formatChaptersForDescription(chapters: Chapter[]): string {
  return chapters.map((c) => `${c.startTime} ${c.title}`).join("\n");
}
