/**
 * Tokyo Night Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const TOKYO_NIGHT_THEME: Theme = {
  id: "tokyo-night",
  name: "Tokyo Night",
  source: "preset",
  tokens: {
    colors: {
      background: "#1a1b26",
      foreground: "#a9b1d6",
      primary: "#7aa2f7", // Tokyo Blue
      secondary: "#bb9af7", // Tokyo Purple
      muted: "#24283b",
      mutedForeground: "#565f89",
      border: "#414868",
      card: "#24283b",
      cardForeground: "#c0caf5",
      destructive: "#f7768e",
      success: "#9ece6a",
      codeBackground: "#16161e",
      codeForeground: "#7dcfff", // Cyan
    },
    typography: {
      headingFamily: "Inter, sans-serif",
      bodyFamily: "Inter, sans-serif",
      codeFamily: "JetBrains Mono, monospace",
      baseFontSize: 16,
      headingSizes: { h1: 56, h2: 38, h3: 26 },
      lineHeight: 1.4,
      fontWeight: { normal: 400, medium: 500, bold: 700 },
    },
    spacing: {
      unit: 8,
      borderRadius: 16,
      containerPadding: 54,
    },
    effects: {
      shadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
      blur: "blur(16px)",
      overlay: "rgba(26, 27, 38, 0.8)",
    },
  },
};
