/**
 * Style System — manages style presets and tone guidelines for content creation.
 */

import type { StylePreset } from "../../types/index.js";
import { ALL_STYLE_PRESETS, PROFESSIONAL_STYLE } from "./presets.js";

export {
  ALL_STYLE_PRESETS,
  PROFESSIONAL_STYLE,
  CASUAL_STYLE,
  MINIMALIST_STYLE,
  ARTISTIC_STYLE,
  HUMOROUS_STYLE,
} from "./presets.js";

export class StyleManager {
  /**
   * Return all available style presets.
   */
  public static async getPresets(): Promise<StylePreset[]> {
    return ALL_STYLE_PRESETS;
  }

  /**
   * Look up a style preset by its ID.
   */
  public static async getPreset(id?: string): Promise<StylePreset> {
    if (!id) return PROFESSIONAL_STYLE;
    const found = ALL_STYLE_PRESETS.find(
      (p) => p.id.toLowerCase() === id.toLowerCase(),
    );
    return found || PROFESSIONAL_STYLE;
  }
}
