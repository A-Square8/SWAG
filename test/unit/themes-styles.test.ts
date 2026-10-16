import { describe, it, expect } from "vitest";
import { ThemeEngine, BUILTIN_THEMES } from "../../src/core/theme/index.js";
import { ALL_STYLE_PRESETS } from "../../src/core/styles/presets.js";
import { StyleManager } from "../../src/core/styles/index.js";
import { validateThemeContrast } from "../../src/core/theme/contrast.js";

describe("Theme & Style Presets (12 Themes, 10 Styles)", () => {
  it("should have all 12 built-in themes registered", () => {
    const builtin = ThemeEngine.getBuiltinThemes();
    const expectedThemeIds = [
      "dark",
      "light",
      "nord",
      "dracula",
      "monokai",
      "solarized-dark",
      "solarized-light",
      "github-dark",
      "catppuccin",
      "tokyo-night",
      "rose-pine",
      "cyberpunk",
    ];

    expect(Object.keys(builtin)).toHaveLength(12);
    for (const id of expectedThemeIds) {
      expect(builtin[id]).toBeDefined();
      expect(builtin[id].tokens.colors.background).toBeDefined();
      expect(builtin[id].tokens.colors.foreground).toBeDefined();
    }
  });

  it("should validate contrast tokens for all 12 themes without breaking", () => {
    for (const [id, theme] of Object.entries(BUILTIN_THEMES)) {
      const warnings = validateThemeContrast(theme.tokens.colors);
      expect(Array.isArray(warnings)).toBe(true);
    }
  });

  it("should have all 10 style presets registered", async () => {
    expect(ALL_STYLE_PRESETS).toHaveLength(10);
    const expectedStyleIds = [
      "professional",
      "casual",
      "minimalist",
      "artistic",
      "humorous",
      "storyteller",
      "tutorial",
      "hype",
      "corporate",
      "indie",
    ];

    for (const id of expectedStyleIds) {
      const preset = await StyleManager.getPreset(id);
      expect(preset.id).toBe(id);
      expect(preset.tone.voice).toBeDefined();
      expect(preset.tone.hookStyle).toBeDefined();
      expect(preset.visual.templateSet).toBeDefined();
    }
  });
});
