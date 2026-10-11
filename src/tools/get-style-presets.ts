/**
 * MCP Tool: get_style_presets
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StyleManager } from "../core/styles/index.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:styles");

export function registerGetStylePresets(server: McpServer): void {
  server.tool(
    "get_style_presets",
    "Get all available content creation style presets (Professional, Casual, Minimalist, Artistic, Humorous) with tone guidelines, vocabulary, and pacing.",
    {
      includeCustom: z.boolean().optional().default(false),
    },
    async () => {
      log.info("get_style_presets called");
      const presets = await StyleManager.getPresets();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, count: presets.length, presets }, null, 2),
          },
        ],
      };
    },
  );
}
