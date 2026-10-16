/**
 * Neon Cyberpunk Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const CYBERPUNK_THEME: Theme = {
  id: "cyberpunk",
  name: "Neon Cyberpunk",
  source: "preset",
  tokens: {
    colors: {
      background: "#0a0a0a",
      foreground: "#fefefe",
      primary: "#00fff5", // Neon Cyan
      secondary: "#ff007f", // Neon Magenta
      muted: "#18181b",
      mutedForeground: "#a1a1aa",
      border: "#27272a",
      card: "#121214",
      cardForeground: "#fefefe",
      destructive: "#ff3366",
      success: "#00ff66",
      codeBackground: "#050505",
      codeForeground: "#ffe600", // Neon Yellow
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
      borderRadius: 8,
      containerPadding: 54,
    },
    effects: {
      shadow: "0 20px 50px rgba(0, 255, 245, 0.2)",
      blur: "blur(16px)",
      overlay: "rgba(10, 10, 10, 0.85)",
    },
  },
};
