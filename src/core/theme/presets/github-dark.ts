/**
 * GitHub Dimmed / Dark Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const GITHUB_DARK_THEME: Theme = {
  id: "github-dark",
  name: "GitHub Dimmed",
  source: "preset",
  tokens: {
    colors: {
      background: "#0d1117",
      foreground: "#c9d1d9",
      primary: "#58a6ff", // GitHub Blue
      secondary: "#7ee787", // Green
      muted: "#161b22",
      mutedForeground: "#8b949e",
      border: "#30363d",
      card: "#161b22",
      cardForeground: "#c9d1d9",
      destructive: "#f85149",
      success: "#3fb950",
      codeBackground: "#030712",
      codeForeground: "#a5d6ff",
    },
    typography: {
      headingFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      bodyFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      codeFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace",
      baseFontSize: 16,
      headingSizes: { h1: 56, h2: 38, h3: 26 },
      lineHeight: 1.4,
      fontWeight: { normal: 400, medium: 500, bold: 700 },
    },
    spacing: {
      unit: 8,
      borderRadius: 12,
      containerPadding: 54,
    },
    effects: {
      shadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
      blur: "blur(16px)",
      overlay: "rgba(13, 17, 23, 0.8)",
    },
  },
};
