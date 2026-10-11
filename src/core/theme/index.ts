/**
 * Theme Engine — manages themes, IDE theme auto-detection, and contrast verification.
 */

import type { Theme } from "../../types/index.js";
import { ThemeSchema } from "../../types/theme.js";
import { safeReadJson, safeWriteJson, pathExists, join } from "../../utils/fs.js";
import { logger } from "../../utils/logger.js";
import { DARK_THEME } from "./presets/dark.js";
import { LIGHT_THEME } from "./presets/light.js";
import { detectIdeTheme } from "./ide-detector.js";
import { validateThemeContrast } from "./contrast.js";

const log = logger.child("theme");
const THEME_FILE = join(".swag", "theme.json");

export interface ThemeResult {
  theme: Theme;
  autoDetected: boolean;
  contrastWarnings: string[];
}

export class ThemeEngine {
  /**
   * Get the active theme for a project.
   */
  public static async getTheme(projectPath: string): Promise<ThemeResult> {
    const themePath = join(projectPath, THEME_FILE);

    // 1. Check if project has an explicit saved theme in .swag/theme.json
    if (await pathExists(themePath)) {
      const saved = await safeReadJson<Theme>(themePath);
      if (saved) {
        const parsed = ThemeSchema.safeParse(saved);
        if (parsed.success) {
          const warnings = validateThemeContrast(parsed.data.tokens.colors);
          return {
            theme: parsed.data,
            autoDetected: parsed.data.source === "auto-detected",
            contrastWarnings: warnings,
          };
        }
      }
    }

    // 2. Try IDE auto-detection
    const ideTheme = await detectIdeTheme(projectPath);
    if (ideTheme) {
      log.info(`Auto-detected IDE theme: ${ideTheme.name}`);
      const warnings = validateThemeContrast(ideTheme.tokens.colors);
      return {
        theme: ideTheme,
        autoDetected: true,
        contrastWarnings: warnings,
      };
    }

    // 3. Fallback to dark preset
    log.info("Using default Obsidian Night (dark) theme");
    const warnings = validateThemeContrast(DARK_THEME.tokens.colors);
    return {
      theme: DARK_THEME,
      autoDetected: false,
      contrastWarnings: warnings,
    };
  }

  /**
   * Set or update the active theme for a project.
   */
  public static async setTheme(
    projectPath: string,
    themeUpdate?: Partial<Theme>,
    preset?: "dark" | "light",
  ): Promise<{ theme: Theme; contrastWarnings: string[] }> {
    let baseTheme = DARK_THEME;

    if (preset === "light") {
      baseTheme = LIGHT_THEME;
    } else if (preset === "dark") {
      baseTheme = DARK_THEME;
    } else {
      const current = await this.getTheme(projectPath);
      baseTheme = current.theme;
    }

    const mergedTokens = {
      ...baseTheme.tokens,
      ...(themeUpdate?.tokens || {}),
      colors: {
        ...baseTheme.tokens.colors,
        ...(themeUpdate?.tokens?.colors || {}),
      },
      typography: {
        ...baseTheme.tokens.typography,
        ...(themeUpdate?.tokens?.typography || {}),
      },
      spacing: {
        ...baseTheme.tokens.spacing,
        ...(themeUpdate?.tokens?.spacing || {}),
      },
      effects: {
        ...baseTheme.tokens.effects,
        ...(themeUpdate?.tokens?.effects || {}),
      },
    };

    const finalTheme: Theme = {
      id: themeUpdate?.id || (preset ? `preset-${preset}` : "custom"),
      name: themeUpdate?.name || (preset ? (preset === "dark" ? DARK_THEME.name : LIGHT_THEME.name) : "Custom Theme"),
      source: preset ? "preset" : "custom",
      tokens: mergedTokens,
    };

    const themePath = join(projectPath, THEME_FILE);
    await safeWriteJson(themePath, finalTheme);

    const warnings = validateThemeContrast(finalTheme.tokens.colors);
    log.info(`Theme set: "${finalTheme.name}" with ${warnings.length} contrast warnings`);

    return {
      theme: finalTheme,
      contrastWarnings: warnings,
    };
  }
}
