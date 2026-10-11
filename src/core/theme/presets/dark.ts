/**
 * Modern Dark Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const DARK_THEME: Theme = {
  id: "dark",
  name: "Obsidian Night (Dark)",
  source: "preset",
  tokens: {
    colors: {
      background: "#090d16",
      foreground: "#f8fafc",
      primary: "#6366f1", // Indigo 500
      secondary: "#0ea5e9", // Sky 500
      muted: "#1e293b",
      mutedForeground: "#94a3b8",
      border: "#334155",
      card: "#0f172a",
      cardForeground: "#f8fafc",
      destructive: "#ef4444",
      success: "#10b981",
      codeBackground: "#020617",
      codeForeground: "#38bdf8",
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
      overlay: "rgba(9, 13, 22, 0.75)",
    },
  },
};
