/**
 * Config loader — reads swag.config.json from the project root,
 * merges with defaults, and validates.
 */

import { SwagConfigSchema } from "../../types/index.js";
import type { SwagConfig } from "../../types/index.js";
import { safeReadJson, pathExists, join } from "../../utils/fs.js";
import { SwagError } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

const log = logger.child("config");

const CONFIG_FILENAME = "swag.config.json";

/** Default config when no file exists */
const DEFAULT_CONFIG: SwagConfig = {
  output: { directory: "swag-output" },
  content: {
    hashtagCount: 15,
    deviceFrame: "browser",
    narrationLanguage: "en",
    subtitleLanguage: "en",
  },
  tts: {
    provider: "edge-tts",
    speed: 1.0,
  },
};

/**
 * Load and validate config from the project root.
 * Returns defaults if no config file exists.
 */
export async function loadConfig(projectPath: string): Promise<SwagConfig> {
  const configPath = join(projectPath, CONFIG_FILENAME);

  if (!(await pathExists(configPath))) {
    log.debug("No swag.config.json found, using defaults");
    return DEFAULT_CONFIG;
  }

  log.info(`Loading config from ${configPath}`);

  const raw = await safeReadJson(configPath);
  if (!raw) {
    throw new SwagError(
      "CONFIG_INVALID",
      `Could not parse ${CONFIG_FILENAME}`,
      `Check that ${CONFIG_FILENAME} is valid JSON. You can delete it to use defaults.`,
    );
  }

  const result = SwagConfigSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new SwagError(
      "CONFIG_INVALID",
      `Invalid ${CONFIG_FILENAME}:\n${issues}`,
      `Fix the issues above in ${CONFIG_FILENAME}, or delete the file to use defaults.`,
    );
  }

  // Deep merge with defaults
  const merged = deepMerge(DEFAULT_CONFIG, result.data) as SwagConfig;
  log.debug("Config loaded and merged with defaults");

  return merged;
}

/**
 * Simple deep merge (target is overridden by source).
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof result[key] === "object" &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export { CONFIG_FILENAME };
