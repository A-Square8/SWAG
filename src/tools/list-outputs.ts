/**
 * MCP Tool: list_outputs
 *
 * Lists all generated social media content outputs (Instagram posts, Reels, YouTube videos)
 * with versions, file paths, timestamps, and metadata.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OutputManager } from "../core/output/index.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:list_outputs");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  platform: z
    .enum(["instagram-post", "instagram-reel", "youtube"])
    .optional()
    .describe("Filter outputs by target social media platform"),
};

export function registerListOutputs(server: McpServer): void {
  server.tool(
    "list_outputs",
    "List all rendered publishable assets (Instagram post slides, Reels MP4s, YouTube videos, subtitles, and captions) across version history.",
    InputSchema,
    async (args) => {
      try {
        log.info(`list_outputs called for: ${args.projectPath}`);

        const outputs = await OutputManager.listOutputs(
          args.projectPath,
          args.platform,
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { success: true, count: outputs.length, outputs },
                null,
                2,
              ),
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
                new SwagError("INTERNAL_ERROR", message, "Failed to list outputs.").toToolResponse(),
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

  log.debug("Registered tool: list_outputs");
}
