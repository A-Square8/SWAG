/**
 * Solarized Light Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const SOLARIZED_LIGHT_THEME: Theme = {
  id: "solarized-light",
  name: "Solarized Light",
  source: "preset",
  tokens: {
    colors: {
      background: "#fdf6e3",
      foreground: "#657b83",
      primary: "#268bd2", // Blue
      secondary: "#2aa198", // Cyan
      muted: "#eee8d5",
      mutedForeground: "#93a1a1",
      border: "#d33682",
      card: "#eee8d5",
      cardForeground: "#586e75",
      destructive: "#dc322f",
      success: "#859900",
      codeBackground: "#f5efdc",
      codeForeground: "#cb4b16",
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
      shadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
      blur: "blur(12px)",
      overlay: "rgba(253, 246, 227, 0.8)",
    },
  },
};
