/**
 * MCP Tool: render_youtube_video
 *
 * Renders a full 16:9 widescreen YouTube walkthrough video with Edge TTS voice narration,
 * lower thirds, tech badges, auto-generated .srt subtitles, and chapter markers.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { VideoRenderer } from "../core/renderer/video/index.js";
import { YouTubeVideoPlanSchema } from "../types/content.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:render_youtube_video");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  plan: YouTubeVideoPlanSchema.describe("The agent-constructed YouTubeVideoPlan with sections and narration"),
  preview: z
    .boolean()
    .optional()
    .default(false)
    .describe("Generate faster draft preview at 1x resolution (default: false)"),
};

export function registerRenderYoutubeVideo(server: McpServer): void {
  server.tool(
    "render_youtube_video",
    "Render a full widescreen 16:9 YouTube video walkthrough (3-4 minutes) from agent-filled sections, complete with voice narration, lower thirds, device mockups, .srt subtitles, chapter markers, and script.md.",
    InputSchema,
    async (args) => {
      try {
        log.info(
          `render_youtube_video invoked: ${args.plan.sections.length} sections for ${args.projectPath}`,
        );

        const result = await VideoRenderer.renderYouTubeVideo({
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
        log.error(`Unexpected YouTube render error: ${message}`);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError(
                  "RENDER_FAILED",
                  message,
                  "Check YouTube sections, narration text, assets, and FFmpeg setup.",
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

  log.debug("Registered tool: render_youtube_video");
}
