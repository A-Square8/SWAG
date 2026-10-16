/**
 * Rosé Pine Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const ROSE_PINE_THEME: Theme = {
  id: "rose-pine",
  name: "Rosé Pine",
  source: "preset",
  tokens: {
    colors: {
      background: "#191724",
      foreground: "#e0def4",
      primary: "#c4a7e7", // Iris
      secondary: "#ebbcba", // Rose
      muted: "#26233a",
      mutedForeground: "#908caa",
      border: "#403d52",
      card: "#26233a",
      cardForeground: "#e0def4",
      destructive: "#eb6f92", // Love
      success: "#9ccfd8", // Foam
      codeBackground: "#13101e",
      codeForeground: "#f6c177", // Gold
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
      overlay: "rgba(25, 23, 36, 0.8)",
    },
  },
};
