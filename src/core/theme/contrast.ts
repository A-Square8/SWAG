/**
 * WCAG AA Contrast Ratio Checker.
 */

import { logger } from "../../utils/logger.js";

const log = logger.child("theme:contrast");

/**
 * Parse hex color (#RRGGBB or #RGB) into [r, g, b] (0-255).
 */
export function parseColor(color: string): [number, number, number] | null {
  const hex = color.trim().toLowerCase();
  if (hex.startsWith("#")) {
    const raw = hex.slice(1);
    if (raw.length === 3) {
      return [
        parseInt(raw[0] + raw[0], 16),
        parseInt(raw[1] + raw[1], 16),
        parseInt(raw[2] + raw[2], 16),
      ];
    }
    if (raw.length === 6) {
      return [
        parseInt(raw.slice(0, 2), 16),
        parseInt(raw.slice(2, 4), 16),
        parseInt(raw.slice(4, 6), 16),
      ];
    }
  }

  // Handle rgb(r, g, b)
  const rgbMatch = hex.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  return null;
}

/**
 * Calculate relative luminance according to WCAG 2.1 formula.
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors (e.g. 1 to 21).
 */
export function getContrastRatio(color1: string, color2: string): number | null {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  if (!rgb1 || !rgb2) return null;

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate contrast of design token colors against background.
 */
export function validateThemeContrast(colors: {
  background: string;
  foreground: string;
  primary: string;
  mutedForeground?: string;
  card?: string;
  cardForeground?: string;
}): string[] {
  const warnings: string[] = [];

  // Foreground vs Background (minimum 4.5:1 for normal text)
  const fgRatio = getContrastRatio(colors.foreground, colors.background);
  if (fgRatio !== null && fgRatio < 4.5) {
    warnings.push(
      `Foreground color (${colors.foreground}) on background (${colors.background}) has contrast ratio ${fgRatio.toFixed(2)}:1 (WCAG AA requires ≥ 4.5:1).`,
    );
  }

  // Primary vs Background (minimum 3.0:1 for graphical objects / large text)
  const primaryRatio = getContrastRatio(colors.primary, colors.background);
  if (primaryRatio !== null && primaryRatio < 3.0) {
    warnings.push(
      `Primary accent color (${colors.primary}) on background (${colors.background}) has low contrast ratio ${primaryRatio.toFixed(2)}:1 (recommended ≥ 3.0:1).`,
    );
  }

  // Card Foreground vs Card
  if (colors.card && colors.cardForeground) {
    const cardRatio = getContrastRatio(colors.cardForeground, colors.card);
    if (cardRatio !== null && cardRatio < 4.5) {
      warnings.push(
        `Card foreground (${colors.cardForeground}) on card background (${colors.card}) has contrast ratio ${cardRatio.toFixed(2)}:1 (WCAG AA requires ≥ 4.5:1).`,
      );
    }
  }

  return warnings;
}
