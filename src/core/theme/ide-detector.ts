/**
 * IDE Theme Detector — discovers editor theme settings from VS Code, Cursor, Zed, or Windsurf.
 */

import { homedir } from "node:os";
import type { Theme } from "../../types/index.js";
import { safeReadJson, pathExists, join } from "../../utils/fs.js";
import { logger } from "../../utils/logger.js";
import { DARK_THEME } from "./presets/dark.js";

const log = logger.child("theme:ide-detector");

// Common popular editor theme color maps
const KNOWN_THEMES: Record<string, Partial<Theme["tokens"]["colors"]>> = {
  tokyo: {
    background: "#1a1b26",
    foreground: "#c0caf5",
    primary: "#7aa2f7",
    secondary: "#bb9af7",
    muted: "#24283b",
    mutedForeground: "#565f89",
    border: "#414868",
    card: "#1f2335",
    cardForeground: "#c0caf5",
    codeBackground: "#16161e",
    codeForeground: "#7dcfff",
  },
  dracula: {
    background: "#282a36",
    foreground: "#f8f8f2",
    primary: "#bd93f9",
    secondary: "#ff79c6",
    muted: "#44475a",
    mutedForeground: "#6272a4",
    border: "#6272a4",
    card: "#343746",
    cardForeground: "#f8f8f2",
    codeBackground: "#21222c",
    codeForeground: "#8be9fd",
  },
  catppuccin: {
    background: "#1e1e2e",
    foreground: "#cdd6f4",
    primary: "#cba6f7",
    secondary: "#89b4fa",
    muted: "#313244",
    mutedForeground: "#6c7086",
    border: "#45475a",
    card: "#181825",
    cardForeground: "#cdd6f4",
    codeBackground: "#11111b",
    codeForeground: "#89dceb",
  },
  nord: {
    background: "#2e3440",
    foreground: "#eceff4",
    primary: "#88c0d0",
    secondary: "#81a1c1",
    muted: "#3b4252",
    mutedForeground: "#7b88a1",
    border: "#4c566a",
    card: "#3b4252",
    cardForeground: "#eceff4",
    codeBackground: "#242933",
    codeForeground: "#8fbcbb",
  },
  one_dark: {
    background: "#282c34",
    foreground: "#abb2bf",
    primary: "#61afef",
    secondary: "#c678dd",
    muted: "#353b45",
    mutedForeground: "#5c6370",
    border: "#3e4451",
    card: "#21252b",
    cardForeground: "#abb2bf",
    codeBackground: "#1e2227",
    codeForeground: "#98c379",
  },
  github_dark: {
    background: "#0d1117",
    foreground: "#c9d1d9",
    primary: "#58a6ff",
    secondary: "#bc8cff",
    muted: "#21262d",
    mutedForeground: "#8b949e",
    border: "#30363d",
    card: "#161b22",
    cardForeground: "#c9d1d9",
    codeBackground: "#010409",
    codeForeground: "#79c0ff",
  },
};

/**
 * Attempt to detect IDE theme from settings files.
 */
export async function detectIdeTheme(projectPath?: string): Promise<Theme | null> {
  const home = homedir();

  const candidatePaths: string[] = [];

  if (projectPath) {
    candidatePaths.push(join(projectPath, ".vscode", "settings.json"));
  }

  // VS Code / Cursor / Windsurf paths
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || join(home, "AppData", "Roaming");
    candidatePaths.push(join(appData, "Code", "User", "settings.json"));
    candidatePaths.push(join(appData, "Cursor", "User", "settings.json"));
  } else if (process.platform === "darwin") {
    candidatePaths.push(
      join(home, "Library", "Application Support", "Code", "User", "settings.json"),
      join(home, "Library", "Application Support", "Cursor", "User", "settings.json"),
      join(home, ".config", "zed", "settings.json"),
    );
  } else {
    // Linux
    candidatePaths.push(
      join(home, ".config", "Code", "User", "settings.json"),
      join(home, ".config", "Cursor", "User", "settings.json"),
      join(home, ".config", "zed", "settings.json"),
    );
  }

  for (const settingsPath of candidatePaths) {
    if (await pathExists(settingsPath)) {
      const settings = await safeReadJson<Record<string, unknown>>(settingsPath);
      const themeName =
        (settings?.["workbench.colorTheme"] as string) ||
        (settings?.["theme"] as string);

      if (themeName) {
        log.info(`Found IDE theme "${themeName}" in ${settingsPath}`);
        const lower = themeName.toLowerCase().replace(/[\s-_]+/g, "");

        for (const [key, colors] of Object.entries(KNOWN_THEMES)) {
          if (lower.includes(key.replace("_", ""))) {
            return {
              id: `ide-${key}`,
              name: themeName,
              source: "auto-detected",
              tokens: {
                ...DARK_THEME.tokens,
                colors: {
                  ...DARK_THEME.tokens.colors,
                  ...colors,
                },
              },
            };
          }
        }

        // Generic detected theme using theme name
        return {
          id: `ide-${lower}`,
          name: themeName,
          source: "auto-detected",
          tokens: DARK_THEME.tokens,
        };
      }
    }
  }

  return null;
}
