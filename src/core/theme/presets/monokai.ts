/**
 * Monokai Pro Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const MONOKAI_THEME: Theme = {
  id: "monokai",
  name: "Monokai Pro",
  source: "preset",
  tokens: {
    colors: {
      background: "#272822",
      foreground: "#f8f8f2",
      primary: "#a6e22e", // Neon Green
      secondary: "#66d9ef", // Neon Cyan
      muted: "#3e3d32",
      mutedForeground: "#75715e",
      border: "#49483e",
      card: "#34352f",
      cardForeground: "#f8f8f2",
      destructive: "#f92672", // Pink/Red
      success: "#a6e22e",
      codeBackground: "#1e1f1c",
      codeForeground: "#fd971f", // Orange
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
      overlay: "rgba(39, 40, 34, 0.8)",
    },
  },
};
