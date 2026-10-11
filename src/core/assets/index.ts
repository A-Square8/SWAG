/**
 * Asset Manager — catalog CRUD, asset importing, and persistence.
 */

import { randomUUID } from "node:crypto";
import { extname, basename } from "node:path";
import { copyFile, stat } from "node:fs/promises";
import type { Asset, AssetCatalog } from "../../types/index.js";
import { AssetCatalogSchema, AssetSchema } from "../../types/asset.js";
import {
  ensureDir,
  join,
  pathExists,
  safeReadJson,
  safeWriteJson,
} from "../../utils/fs.js";
import { SwagError } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

const log = logger.child("assets");

const SWAG_DIR = ".swag";
const ASSETS_DIR = join(SWAG_DIR, "assets");
const CATALOG_FILE = join(SWAG_DIR, "catalog.json");

export interface ListAssetsFilter {
  type?: Asset["type"];
  source?: Asset["source"];
  route?: string;
}

export class AssetManager {
  /**
   * Ensure .swag/ and .swag/assets/ directories exist.
   */
  public static async init(projectPath: string): Promise<void> {
    await ensureDir(join(projectPath, ASSETS_DIR));
    const catalogPath = join(projectPath, CATALOG_FILE);
    if (!(await pathExists(catalogPath))) {
      const initialCatalog: AssetCatalog = {
        projectName: basename(projectPath),
        assets: [],
        updatedAt: new Date().toISOString(),
      };
      await safeWriteJson(catalogPath, initialCatalog);
    }
  }

  /**
   * Load the asset catalog from .swag/catalog.json.
   */
  public static async getCatalog(projectPath: string): Promise<AssetCatalog> {
    await this.init(projectPath);
    const catalogPath = join(projectPath, CATALOG_FILE);
    const data = await safeReadJson<AssetCatalog>(catalogPath);

    if (!data) {
      return {
        projectName: basename(projectPath),
        assets: [],
        updatedAt: new Date().toISOString(),
      };
    }

    const parsed = AssetCatalogSchema.safeParse(data);
    if (!parsed.success) {
      log.warn(`Invalid catalog.json schema, resetting corrupted file: ${parsed.error.message}`);
      return {
        projectName: basename(projectPath),
        assets: [],
        updatedAt: new Date().toISOString(),
      };
    }

    return parsed.data;
  }

  /**
   * Save the asset catalog to .swag/catalog.json.
   */
  public static async saveCatalog(
    projectPath: string,
    catalog: AssetCatalog,
  ): Promise<void> {
    await this.init(projectPath);
    const catalogPath = join(projectPath, CATALOG_FILE);
    catalog.updatedAt = new Date().toISOString();
    await safeWriteJson(catalogPath, catalog);
  }

  /**
   * Add a new asset to the catalog.
   */
  public static async addAsset(
    projectPath: string,
    asset: Asset,
  ): Promise<Asset> {
    const catalog = await this.getCatalog(projectPath);
    // Replace if exists, else append
    const idx = catalog.assets.findIndex((a) => a.id === asset.id);
    if (idx >= 0) {
      catalog.assets[idx] = asset;
    } else {
      catalog.assets.push(asset);
    }
    await this.saveCatalog(projectPath, catalog);
    log.info(`Added asset ${asset.id} (${asset.type}) to catalog`);
    return asset;
  }

  /**
   * Find an asset by ID.
   */
  public static async getAsset(
    projectPath: string,
    assetId: string,
  ): Promise<Asset | undefined> {
    const catalog = await this.getCatalog(projectPath);
    return catalog.assets.find((a) => a.id === assetId);
  }

  /**
   * List assets with optional filtering.
   */
  public static async listAssets(
    projectPath: string,
    filter?: ListAssetsFilter,
  ): Promise<Asset[]> {
    const catalog = await this.getCatalog(projectPath);
    let results = catalog.assets;

    if (filter?.type) {
      results = results.filter((a) => a.type === filter.type);
    }
    if (filter?.source) {
      results = results.filter((a) => a.source === filter.source);
    }
    if (filter?.route) {
      results = results.filter((a) => a.metadata.route === filter.route);
    }

    return results;
  }

  /**
   * Import an external file into .swag/assets and add to catalog.
   */
  public static async importAsset(
    projectPath: string,
    sourceFilePath: string,
    description: string,
    typeOverride?: Asset["type"],
  ): Promise<Asset> {
    if (!(await pathExists(sourceFilePath))) {
      throw new SwagError(
        "FILE_NOT_FOUND",
        `Source file does not exist: ${sourceFilePath}`,
        "Please provide an existing file path to add as an asset.",
      );
    }

    await this.init(projectPath);

    const ext = extname(sourceFilePath).toLowerCase();
    const id = randomUUID();
    const targetFileName = `${id}${ext}`;
    const targetRelativePath = join(ASSETS_DIR, targetFileName);
    const targetAbsolutePath = join(projectPath, targetRelativePath);

    // Copy file
    await copyFile(sourceFilePath, targetAbsolutePath);

    // Determine type
    let assetType: Asset["type"] = "image";
    if (typeOverride) {
      assetType = typeOverride;
    } else if (ext === ".mp4" || ext === ".webm" || ext === ".mov") {
      assetType = "video";
    } else if (ext === ".gif") {
      assetType = "gif";
    } else if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp") {
      assetType = "image";
    }

    const fileStat = await stat(targetAbsolutePath);

    const asset: Asset = {
      id,
      type: assetType,
      source: "user-supplied",
      filePath: targetRelativePath,
      metadata: {
        description: description || basename(sourceFilePath),
        width: 0,
        height: 0,
        capturedAt: new Date().toISOString(),
      },
    };

    return await this.addAsset(projectPath, asset);
  }
}
