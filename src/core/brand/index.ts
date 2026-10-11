/**
 * Brand Kit Manager — manages logo, brand name, social handles, and outro configuration.
 */

import { homedir } from "node:os";
import type { BrandKit } from "../../types/index.js";
import { BrandKitSchema } from "../../types/brand.js";
import { safeReadJson, safeWriteJson, pathExists, join } from "../../utils/fs.js";
import { logger } from "../../utils/logger.js";

const log = logger.child("brand");

const PROJECT_BRAND_FILE = join(".swag", "brand.json");
const GLOBAL_SWAG_DIR = join(homedir(), ".swag");
const GLOBAL_BRAND_FILE = join(GLOBAL_SWAG_DIR, "brand.json");

export const DEFAULT_BRAND_KIT: BrandKit = {
  brandName: "",
  tagline: "",
  defaultCTA: "Follow for more developer projects",
  socials: [
    {
      platform: "github",
      handle: "@developer",
      displayOrder: 1,
    },
  ],
  outro: {
    enabled: true,
    duration: {
      reel: 4,
      youtube: 8,
      post: true,
    },
    layout: "centered",
    showLogo: true,
    showSocials: true,
    showCTA: true,
    showQR: false,
    animation: "fade",
  },
};

export class BrandKitManager {
  /**
   * Get brand kit, merging project-level overrides with global settings.
   */
  public static async getBrandKit(
    projectPath?: string,
  ): Promise<{ brandKit: BrandKit; source: "project" | "global" | "default" }> {
    // 1. Check project-level .swag/brand.json
    if (projectPath) {
      const projectPathFile = join(projectPath, PROJECT_BRAND_FILE);
      if (await pathExists(projectPathFile)) {
        const raw = await safeReadJson<BrandKit>(projectPathFile);
        if (raw) {
          const parsed = BrandKitSchema.safeParse(raw);
          if (parsed.success) {
            log.info(`Loaded project brand kit from ${projectPathFile}`);
            return { brandKit: parsed.data, source: "project" };
          }
        }
      }
    }

    // 2. Check global ~/.swag/brand.json
    if (await pathExists(GLOBAL_BRAND_FILE)) {
      const raw = await safeReadJson<BrandKit>(GLOBAL_BRAND_FILE);
      if (raw) {
        const parsed = BrandKitSchema.safeParse(raw);
        if (parsed.success) {
          log.info(`Loaded global brand kit from ${GLOBAL_BRAND_FILE}`);
          return { brandKit: parsed.data, source: "global" };
        }
      }
    }

    // 3. Fallback to default
    return { brandKit: DEFAULT_BRAND_KIT, source: "default" };
  }

  /**
   * Set brand kit at project or global scope.
   */
  public static async setBrandKit(
    brandKitUpdate: Partial<BrandKit>,
    scope: "project" | "global" = "project",
    projectPath?: string,
  ): Promise<BrandKit> {
    const current = await this.getBrandKit(projectPath);
    const merged: BrandKit = {
      ...current.brandKit,
      ...brandKitUpdate,
      socials: brandKitUpdate.socials ?? current.brandKit.socials,
      outro: {
        ...current.brandKit.outro,
        ...(brandKitUpdate.outro ?? {}),
      },
    };

    if (scope === "global") {
      await safeWriteJson(GLOBAL_BRAND_FILE, merged);
      log.info(`Saved global brand kit to ${GLOBAL_BRAND_FILE}`);
    } else {
      if (!projectPath) {
        throw new Error("projectPath is required when saving project-level brand kit");
      }
      const targetFile = join(projectPath, PROJECT_BRAND_FILE);
      await safeWriteJson(targetFile, merged);
      log.info(`Saved project brand kit to ${targetFile}`);
    }

    return merged;
  }
}
