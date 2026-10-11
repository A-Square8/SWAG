import { describe, it, expect } from "vitest";
import {
  parseColor,
  getRelativeLuminance,
  getContrastRatio,
  validateThemeContrast,
} from "../../src/core/theme/contrast.js";

describe("Contrast & WCAG Validator", () => {
  it("should correctly parse hex colors and rgb strings", () => {
    expect(parseColor("#ffffff")).toEqual([255, 255, 255]);
    expect(parseColor("#000000")).toEqual([0, 0, 0]);
    expect(parseColor("#fff")).toEqual([255, 255, 255]);
    expect(parseColor("rgb(100, 150, 200)")).toEqual([100, 150, 200]);
  });

  it("should calculate correct contrast ratios", () => {
    // White on Black is 21:1
    const maxRatio = getContrastRatio("#ffffff", "#000000");
    expect(maxRatio).toBeCloseTo(21, 0);

    // Black on Black is 1:1
    const minRatio = getContrastRatio("#000000", "#000000");
    expect(minRatio).toBeCloseTo(1, 1);

    // Light text on dark bg
    const darkRatio = getContrastRatio("#f8fafc", "#090d16");
    expect(darkRatio).toBeGreaterThan(15);
  });

  it("should emit warnings for low contrast colors", () => {
    const warnings = validateThemeContrast({
      background: "#ffffff",
      foreground: "#e2e8f0", // Very light grey on white -> fails 4.5:1
      primary: "#cbd5e1",
    });

    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings[0]).toContain("WCAG AA requires ≥ 4.5:1");
  });

  it("should pass for obsidian night dark theme", () => {
    const warnings = validateThemeContrast({
      background: "#090d16",
      foreground: "#f8fafc",
      primary: "#6366f1",
    });

    expect(warnings.length).toBe(0);
  });
});
