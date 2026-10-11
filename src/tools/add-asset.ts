/**
 * MCP Tool: add_asset
 *
 * Allows the user or agent to manually import an existing image or video
 * file into the project's asset catalog.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AssetManager } from "../core/assets/index.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:add_asset");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  filePath: z.string().describe("Absolute path to the image or video file to import"),
  description: z
    .string()
    .describe("Human-readable description of what this asset depicts"),
  type: z
    .enum(["screenshot", "recording", "image", "gif", "video"])
    .optional()
    .describe("Override automatic type detection"),
};

export function registerAddAsset(server: McpServer): void {
  server.tool(
    "add_asset",
    "Manually import an external screenshot, video, or diagram into the project's SWAG asset catalog.",
    InputSchema,
    async (args) => {
      try {
        log.info(`add_asset called for: ${args.filePath}`);

        const asset = await AssetManager.importAsset(
          args.projectPath,
          args.filePath,
          args.description,
          args.type,
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, asset }, null, 2),
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
                new SwagError("INTERNAL_ERROR", message, "Failed to import asset.").toToolResponse(),
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

  log.debug("Registered tool: add_asset");
}
