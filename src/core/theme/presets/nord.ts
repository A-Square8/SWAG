/**
 * Aurora Nord Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const NORD_THEME: Theme = {
  id: "nord",
  name: "Aurora Nord",
  source: "preset",
  tokens: {
    colors: {
      background: "#2e3440",
      foreground: "#eceff4",
      primary: "#88c0d0", // Frost Cyan
      secondary: "#81a1c1", // Frost Blue
      muted: "#3b4252",
      mutedForeground: "#d8dee9",
      border: "#4c566a",
      card: "#3b4252",
      cardForeground: "#eceff4",
      destructive: "#bf616a",
      success: "#a3be8c",
      codeBackground: "#242933",
      codeForeground: "#8fbcbb",
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
      shadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
      blur: "blur(16px)",
      overlay: "rgba(46, 52, 64, 0.8)",
    },
  },
};
