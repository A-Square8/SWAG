/**
 * Output Manager — manages output directory versioning and metadata.json generation.
 */

import { readdir } from "node:fs/promises";
import type { OutputEntry } from "../../types/index.js";
import { ensureDir, join, pathExists, safeReadJson, safeWriteJson } from "../../utils/fs.js";
import { logger } from "../../utils/logger.js";

const log = logger.child("output");

export interface OutputFolderInfo {
  version: number;
  dirPath: string;
  metadataPath: string;
}

export class OutputManager {
  /**
   * Determine the next incremental version folder for a given platform.
   */
  public static async getNextVersionFolder(
    projectPath: string,
    platform: "instagram-post" | "instagram-reel" | "youtube",
    baseOutputDir = "swag-output",
  ): Promise<OutputFolderInfo> {
    const platformDir = join(projectPath, baseOutputDir, platform);
    await ensureDir(platformDir);

    let highestVersion = 0;
    try {
      const entries = await readdir(platformDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith("v")) {
          const num = parseInt(entry.name.slice(1), 10);
          if (!isNaN(num) && num > highestVersion) {
            highestVersion = num;
          }
        }
      }
    } catch {
      // Directory newly created
    }

    const nextVersion = highestVersion + 1;
    const versionDir = join(platformDir, `v${nextVersion}`);
    await ensureDir(versionDir);

    return {
      version: nextVersion,
      dirPath: versionDir,
      metadataPath: join(versionDir, "metadata.json"),
    };
  }

  /**
   * Write metadata.json into the output version folder.
   */
  public static async writeMetadata(
    metadataPath: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const fullMetadata = {
      ...data,
      generatedAt: new Date().toISOString(),
      generator: "SWAG MCP",
    };
    await safeWriteJson(metadataPath, fullMetadata);
    log.info(`Wrote output metadata to: ${metadataPath}`);
  }

  /**
   * List all generated outputs across platforms.
   */
  public static async listOutputs(
    projectPath: string,
    platformFilter?: "instagram-post" | "instagram-reel" | "youtube",
    baseOutputDir = "swag-output",
  ): Promise<OutputEntry[]> {
    const baseDir = join(projectPath, baseOutputDir);
    if (!(await pathExists(baseDir))) {
      return [];
    }

    const platforms = platformFilter
      ? [platformFilter]
      : (["instagram-post", "instagram-reel", "youtube"] as const);

    const results: OutputEntry[] = [];

    for (const p of platforms) {
      const pDir = join(baseDir, p);
      if (!(await pathExists(pDir))) continue;

      try {
        const entries = await readdir(pDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith("v")) {
            const vNum = parseInt(entry.name.slice(1), 10);
            const vDir = join(pDir, entry.name);
            const metaPath = join(vDir, "metadata.json");

            let metadata: Record<string, unknown> = {};
            if (await pathExists(metaPath)) {
              metadata = (await safeReadJson(metaPath)) || {};
            }

            const files = await readdir(vDir);
            const filePaths = files
              .filter((f) => f !== "metadata.json")
              .map((f) => join(vDir, f));

            results.push({
              version: vNum,
              platform: p,
              createdAt: (metadata.generatedAt as string) || new Date().toISOString(),
              paths: filePaths,
              metadataPath: metaPath,
              metadata,
            });
          }
        }
      } catch (err) {
        log.warn(`Error scanning outputs for ${p}: ${err}`);
      }
    }

    return results.sort((a, b) => b.version - a.version);
  }
}
