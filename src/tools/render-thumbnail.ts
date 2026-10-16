/**
 * MCP Tool: render_thumbnail
 *
 * Renders a high-contrast 1280x720 YouTube video thumbnail with text overlay.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImageRenderer } from "../core/renderer/image/index.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:render_thumbnail");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  title: z.string().describe("Bold headline for the thumbnail"),
  subtitle: z.string().optional().describe("Supporting sub-text"),
  badgeText: z.string().optional().describe("Pill badge text (e.g. 'FULL WALKTHROUGH', 'NEW RELEASE')"),
  assetId: z.string().optional().describe("Asset UUID from list_assets"),
  preview: z.boolean().optional().default(false).describe("Fast 1x draft preview"),
};

export function registerRenderThumbnail(server: McpServer): void {
  server.tool(
    "render_thumbnail",
    "Render a 1280x720 YouTube video thumbnail with high-contrast text overlay, badges, and gradient glow.",
    InputSchema,
    async (args) => {
      try {
        log.info(`render_thumbnail called for: ${args.projectPath}`);

        const result = await ImageRenderer.renderThumbnail({
          projectPath: args.projectPath,
          title: args.title,
          subtitle: args.subtitle,
          badgeText: args.badgeText,
          assetId: args.assetId,
          preview: args.preview,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
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
                new SwagError("RENDER_FAILED", message, "Failed to render video thumbnail.").toToolResponse(),
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

  log.debug("Registered tool: render_thumbnail");
}
