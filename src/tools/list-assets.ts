/**
 * MCP Tool: list_assets
 *
 * Lists all cataloged assets for a project with optional filtering.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AssetManager } from "../core/assets/index.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:list_assets");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  filter: z
    .object({
      type: z
        .enum(["screenshot", "recording", "image", "gif", "video"])
        .optional()
        .describe("Filter by asset type"),
      source: z
        .enum(["auto-captured", "user-supplied"])
        .optional()
        .describe("Filter by source"),
      route: z.string().optional().describe("Filter by associated web route"),
    })
    .optional()
    .describe("Optional filters"),
};

export function registerListAssets(server: McpServer): void {
  server.tool(
    "list_assets",
    "List all captured and uploaded assets in the project's asset catalog. Filter by type, source, or route.",
    InputSchema,
    async (args) => {
      try {
        log.info(`list_assets called for: ${args.projectPath}`);

        const assets = await AssetManager.listAssets(args.projectPath, args.filter);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, count: assets.length, assets }, null, 2),
            },
          ],
        };
      } catch (err) {
        if (err instanceof SwagError) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(err.toToolResponse(), null, 2),
              },
            ],
            isError: true,
          };
        }

        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError("INTERNAL_ERROR", message, "Failed to list assets.").toToolResponse(),
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

  log.debug("Registered tool: list_assets");
}
