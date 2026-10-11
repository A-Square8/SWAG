/**
 * MCP Tool: render_instagram_reel
 *
 * Renders an Instagram Reel (9:16 vertical short video) with Edge TTS voice narration,
 * safe zone card layouts, and versioned MP4 export.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { VideoRenderer } from "../core/renderer/video/index.js";
import { ReelPlanSchema } from "../types/content.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:render_instagram_reel");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  plan: ReelPlanSchema.describe("The agent-constructed ReelPlan with scenes, narration, and captions"),
  preview: z
    .boolean()
    .optional()
    .default(false)
    .describe("Generate faster draft preview (default: false)"),
};

export function registerRenderInstagramReel(server: McpServer): void {
  server.tool(
    "render_instagram_reel",
    "Render an Instagram Reel (vertical 9:16 video) from agent-filled scene plans, complete with neural voice narration, device frame mockups, safe zones, and versioned MP4 generation.",
    InputSchema,
    async (args) => {
      try {
        log.info(
          `render_instagram_reel invoked: ${args.plan.scenes.length} scenes for ${args.projectPath}`,
        );

        const result = await VideoRenderer.renderInstagramReel({
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
        log.error(`Unexpected reel render error: ${message}`);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError(
                  "RENDER_FAILED",
                  message,
                  "Check scene narration texts, assets, and FFmpeg installation.",
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

  log.debug("Registered tool: render_instagram_reel");
}
