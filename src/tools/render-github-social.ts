/**
 * MCP Tool: render_github_social
 *
 * Renders a 1280x640 GitHub social preview image for repository headers.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImageRenderer } from "../core/renderer/image/index.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:render_github_social");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  title: z.string().describe("Repository title / project headline"),
  subtitle: z.string().optional().describe("Tagline or brief description"),
  techStack: z.array(z.string()).optional().describe("Tech stack badge labels"),
  assetId: z.string().optional().describe("Asset UUID for preview image"),
  preview: z.boolean().optional().default(false).describe("Fast 1x draft preview"),
};

export function registerRenderGithubSocial(server: McpServer): void {
  server.tool(
    "render_github_social",
    "Render a 1280x640 GitHub repository social preview card with branding, badges, and metadata.",
    InputSchema,
    async (args) => {
      try {
        log.info(`render_github_social called for: ${args.projectPath}`);

        const result = await ImageRenderer.renderGithubSocial({
          projectPath: args.projectPath,
          title: args.title,
          subtitle: args.subtitle,
          techStack: args.techStack,
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
                new SwagError("RENDER_FAILED", message, "Failed to render GitHub social preview.").toToolResponse(),
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

  log.debug("Registered tool: render_github_social");
}
