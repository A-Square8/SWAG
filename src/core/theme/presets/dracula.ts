/**
 * Dracula Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const DRACULA_THEME: Theme = {
  id: "dracula",
  name: "Dracula Purple",
  source: "preset",
  tokens: {
    colors: {
      background: "#282a36",
      foreground: "#f8f8f2",
      primary: "#bd93f9", // Purple
      secondary: "#ff79c6", // Pink
      muted: "#44475a",
      mutedForeground: "#6272a4",
      border: "#6272a4",
      card: "#343746",
      cardForeground: "#f8f8f2",
      destructive: "#ff5555",
      success: "#50fa7b",
      codeBackground: "#1e1f29",
      codeForeground: "#8be9fd",
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
      overlay: "rgba(40, 42, 54, 0.8)",
    },
  },
};
