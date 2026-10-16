/**
 * Solarized Dark Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const SOLARIZED_DARK_THEME: Theme = {
  id: "solarized-dark",
  name: "Solarized Dark",
  source: "preset",
  tokens: {
    colors: {
      background: "#002b36",
      foreground: "#839496",
      primary: "#268bd2", // Blue
      secondary: "#2aa198", // Cyan
      muted: "#073642",
      mutedForeground: "#657b83",
      border: "#586e75",
      card: "#073642",
      cardForeground: "#93a1a1",
      destructive: "#dc322f",
      success: "#859900",
      codeBackground: "#001e26",
      codeForeground: "#b58900",
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
      overlay: "rgba(0, 43, 54, 0.8)",
    },
  },
};
