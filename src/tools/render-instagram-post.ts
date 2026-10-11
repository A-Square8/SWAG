/**
 * MCP Tool: render_instagram_post
 *
 * Validates the agent-filled PostPlan and renders high-DPI slide PNGs and metadata.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImageRenderer } from "../core/renderer/image/index.js";
import { PostPlanSchema } from "../types/content.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:render_instagram_post");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  plan: PostPlanSchema.describe("The agent-constructed PostPlan with slides, caption, and hashtags"),
  preview: z
    .boolean()
    .optional()
    .default(false)
    .describe("Generate faster draft preview at 1x scale (default: false, 2x retina)"),
};

export function registerRenderInstagramPost(server: McpServer): void {
  server.tool(
    "render_instagram_post",
    "Render an Instagram single-image or multi-slide carousel post into publish-ready high-DPI PNGs, complete with design tokens, glassmorphism, browser mockups, and metadata.json.",
    InputSchema,
    async (args) => {
      try {
        log.info(
          `render_instagram_post invoked: ${args.plan.slides.length} slides for ${args.projectPath}`,
        );

        const result = await ImageRenderer.renderInstagramPost({
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
          log.error(`${err.code}: ${err.message}`);
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
        log.error(`Unexpected render error: ${message}`);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError(
                  "RENDER_FAILED",
                  message,
                  "Check slide configuration and asset references in the plan.",
                ).toToolResponse(),
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

  log.debug("Registered tool: render_instagram_post");
}
