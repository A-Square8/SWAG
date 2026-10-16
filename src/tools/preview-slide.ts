/**
 * MCP Tool: preview_slide
 *
 * Fast single-slide preview without writing a permanent version folder or executing full pipeline.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImageRenderer } from "../core/renderer/image/index.js";
import { PostSlideSchema } from "../types/content.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:preview_slide");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  slide: PostSlideSchema.describe("Single slide configuration to preview"),
  aspectRatio: z.enum(["4:5", "1:1"]).optional().default("4:5").describe("Aspect ratio for slide preview"),
};

export function registerPreviewSlide(server: McpServer): void {
  server.tool(
    "preview_slide",
    "Quickly preview a single slide or visual archetype in fast draft mode without incrementing output versions.",
    InputSchema,
    async (args) => {
      try {
        log.info(`preview_slide called for: ${args.projectPath}`);

        const result = await ImageRenderer.previewSlide({
          projectPath: args.projectPath,
          slide: args.slide,
          aspectRatio: args.aspectRatio,
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
                new SwagError("RENDER_FAILED", message, "Failed to render slide preview.").toToolResponse(),
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

  log.debug("Registered tool: preview_slide");
}
