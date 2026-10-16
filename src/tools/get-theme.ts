/**
 * MCP Tools: get_theme and set_theme
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ThemeEngine } from "../core/theme/index.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:theme");

export function registerGetTheme(server: McpServer): void {
  server.tool(
    "get_theme",
    "Get the active design theme and tokens for a project, including IDE theme auto-detection and WCAG contrast check warnings.",
    {
      projectPath: z.string().describe("Absolute path to the project root directory"),
    },
    async (args) => {
      try {
        log.info(`get_theme called for: ${args.projectPath}`);
        const result = await ThemeEngine.getTheme(args.projectPath);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, ...result }, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError("INTERNAL_ERROR", message, "Failed to get theme.").toToolResponse(),
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );
}

export function registerSetTheme(server: McpServer): void {
  server.tool(
    "set_theme",
    "Set or override the project's design theme tokens (colors, typography, spacing) or apply a preset (e.g. 'nord', 'dracula', 'catppuccin', 'tokyo-night', 'cyberpunk', etc.).",
    {
      projectPath: z.string().describe("Absolute path to the project root directory"),
      preset: z
        .enum([
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
        ])
        .optional()
        .describe("Apply built-in preset"),
      theme: z.record(z.unknown()).optional().describe("Partial theme or token overrides"),
    },
    async (args) => {
      try {
        log.info(`set_theme called for: ${args.projectPath}`);
        const result = await ThemeEngine.setTheme(
          args.projectPath,
          args.theme as any,
          args.preset,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, ...result }, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError("INTERNAL_ERROR", message, "Failed to set theme.").toToolResponse(),
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );
}
