/**
 * MCP Tool: render_linkedin_post
 *
 * Renders a 1080x1080 square LinkedIn carousel or document post.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImageRenderer } from "../core/renderer/image/index.js";
import { PostPlanSchema } from "../types/content.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:render_linkedin_post");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  plan: PostPlanSchema.describe("The PostPlan for the LinkedIn post/carousel"),
  preview: z.boolean().optional().default(false).describe("Fast 1x draft preview"),
};

export function registerRenderLinkedInPost(server: McpServer): void {
  server.tool(
    "render_linkedin_post",
    "Render a 1080x1080 square carousel or single post for LinkedIn with professional design tokens and metadata.",
    InputSchema,
    async (args) => {
      try {
        log.info(`render_linkedin_post called for: ${args.projectPath}`);

        const result = await ImageRenderer.renderLinkedInPost({
          projectPath: args.projectPath,
          plan: args.plan,
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
                new SwagError("RENDER_FAILED", message, "Failed to render LinkedIn post.").toToolResponse(),
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

  log.debug("Registered tool: render_linkedin_post");
}
