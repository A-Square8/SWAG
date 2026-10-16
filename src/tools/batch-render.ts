/**
 * MCP Tool: batch_render
 *
 * Renders multiple social assets (e.g. Instagram post + Twitter card + GitHub preview)
 * in a single unified execution.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImageRenderer } from "../core/renderer/image/index.js";
import { PostPlanSchema } from "../types/content.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:batch_render");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  instagramPlan: PostPlanSchema.optional().describe("PostPlan for Instagram/LinkedIn"),
  renderTwitter: z.boolean().optional().default(false).describe("Also render Twitter card"),
  renderGithub: z.boolean().optional().default(false).describe("Also render GitHub social preview"),
  preview: z.boolean().optional().default(false).describe("Fast 1x draft preview"),
};

export function registerBatchRender(server: McpServer): void {
  server.tool(
    "batch_render",
    "Render multiple social content packages across platforms in a single batch call.",
    InputSchema,
    async (args) => {
      try {
        log.info(`batch_render called for: ${args.projectPath}`);
        const results: Record<string, unknown> = {};

        // 1. Instagram Post
        if (args.instagramPlan) {
          log.info("Batch: Rendering Instagram post...");
          results.instagram = await ImageRenderer.renderInstagramPost({
            projectPath: args.projectPath,
            plan: args.instagramPlan,
            preview: args.preview,
          });

          // 2. Twitter card from first slide
          if (args.renderTwitter && args.instagramPlan.slides.length > 0) {
            log.info("Batch: Rendering Twitter card...");
            results.twitter = await ImageRenderer.renderTwitterPost({
              projectPath: args.projectPath,
              slide: args.instagramPlan.slides[0],
              caption: args.instagramPlan.caption,
              preview: args.preview,
            });
          }
        }

        // 3. GitHub Social preview
        if (args.renderGithub) {
          log.info("Batch: Rendering GitHub social preview...");
          results.github = await ImageRenderer.renderGithubSocial({
            projectPath: args.projectPath,
            title: args.instagramPlan?.slides[0]?.content.heading || "Developer Project",
            subtitle: args.instagramPlan?.slides[0]?.content.subtitle,
            techStack: args.instagramPlan?.slides[0]?.content.items,
            preview: args.preview,
          });
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  renderedPlatforms: Object.keys(results),
                  results,
                },
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
                new SwagError("RENDER_FAILED", message, "Batch rendering failed.").toToolResponse(),
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

  log.debug("Registered tool: batch_render");
}
