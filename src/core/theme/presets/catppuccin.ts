/**
 * Catppuccin Mocha Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const CATPPUCCIN_THEME: Theme = {
  id: "catppuccin",
  name: "Catppuccin Mocha",
  source: "preset",
  tokens: {
    colors: {
      background: "#1e1e2e",
      foreground: "#cdd6f4",
      primary: "#cba6f7", // Mauve
      secondary: "#89b4fa", // Blue
      muted: "#313244",
      mutedForeground: "#a6adc8",
      border: "#45475a",
      card: "#313244",
      cardForeground: "#cdd6f4",
      destructive: "#f38ba8", // Red
      success: "#a6e3a1", // Green
      codeBackground: "#181825",
      codeForeground: "#f9e2af", // Yellow
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
      overlay: "rgba(30, 30, 46, 0.8)",
    },
  },
};
