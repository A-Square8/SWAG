/**
 * Subtitle (.srt) generation for video rendering.
 */

export interface SubtitleEntry {
  index: number;
  startTimeSec: number;
  endTimeSec: number;
  text: string;
}

/**
 * Format seconds into standard SRT timestamp HH:MM:SS,mmm.
 */
export function formatSrtTimestamp(seconds: number): string {
  const totalMs = Math.round(seconds * 1000);
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);

  const pad = (n: number, z = 2) => String(n).padStart(z, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

/**
 * Format a list of subtitle entries into valid SubRip (.srt) file content.
 */
export function generateSrt(entries: SubtitleEntry[]): string {
  return entries
    .map((e) => {
      const start = formatSrtTimestamp(e.startTimeSec);
      const end = formatSrtTimestamp(e.endTimeSec);
      return `${e.index}\n${start} --> ${end}\n${e.text.trim()}\n`;
    })
    .join("\n");
}
