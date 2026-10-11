/**
 * Clean Light Theme Preset.
 */

import type { Theme } from "../../../types/index.js";

export const LIGHT_THEME: Theme = {
  id: "light",
  name: "Alabaster Clean (Light)",
  source: "preset",
  tokens: {
    colors: {
      background: "#ffffff",
      foreground: "#0f172a",
      primary: "#4f46e5", // Indigo 600
      secondary: "#0284c7",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      card: "#f8fafc",
      cardForeground: "#0f172a",
      destructive: "#dc2626",
      success: "#059669",
      codeBackground: "#f1f5f9",
      codeForeground: "#0369a1",
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
      overlay: "rgba(255, 255, 255, 0.8)",
    },
  },
};
