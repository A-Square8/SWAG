/**
 * MCP Tool: render_twitter_post
 *
 * Renders a 1200x675 Twitter / X social media card image with metadata.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImageRenderer } from "../core/renderer/image/index.js";
import { PostSlideSchema } from "../types/content.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:render_twitter_post");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  slide: PostSlideSchema.describe("The slide content to render as a Twitter card"),
  caption: z.string().optional().describe("Accompanying tweet text"),
  preview: z.boolean().optional().default(false).describe("Fast 1x draft preview"),
};

export function registerRenderTwitterPost(server: McpServer): void {
  server.tool(
    "render_twitter_post",
    "Render a 1200x675 landscape Twitter/X preview card image complete with branding, code mockups, and metadata.json.",
    InputSchema,
    async (args) => {
      try {
        log.info(`render_twitter_post called for: ${args.projectPath}`);

        const result = await ImageRenderer.renderTwitterPost({
          projectPath: args.projectPath,
          slide: args.slide,
          caption: args.caption,
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
                new SwagError("RENDER_FAILED", message, "Failed to render Twitter post card.").toToolResponse(),
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

  log.debug("Registered tool: render_twitter_post");
}
