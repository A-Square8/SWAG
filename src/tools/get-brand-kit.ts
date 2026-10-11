/**
 * MCP Tools: get_brand_kit and set_brand_kit
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BrandKitManager } from "../core/brand/index.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:brand");

export function registerGetBrandKit(server: McpServer): void {
  server.tool(
    "get_brand_kit",
    "Get brand identity kit (logo, brand name, social handles, outro configuration) for project or global profile.",
    {
      projectPath: z
        .string()
        .optional()
        .describe("Optional project root. Falls back to global brand kit if omitted."),
    },
    async (args) => {
      try {
        log.info("get_brand_kit called");
        const result = await BrandKitManager.getBrandKit(args.projectPath);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, ...result }, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError("INTERNAL_ERROR", message, "Failed to get brand kit.").toToolResponse(),
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
}

export function registerSetBrandKit(server: McpServer): void {
  server.tool(
    "set_brand_kit",
    "Configure brand identity kit (logo path, brand name, social handles, outro config). Can be saved to current project or globally across all projects.",
    {
      projectPath: z
        .string()
        .optional()
        .describe("Project root (required if scope is 'project')"),
      scope: z
        .enum(["project", "global"])
        .default("project")
        .describe("Whether to save for this project only or globally across projects"),
      brandKit: z.record(z.unknown()).describe("Brand kit properties to update"),
    },
    async (args) => {
      try {
        log.info(`set_brand_kit called (scope: ${args.scope})`);
        const result = await BrandKitManager.setBrandKit(
          args.brandKit as any,
          args.scope,
          args.projectPath,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: true, brandKit: result }, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError("INTERNAL_ERROR", message, "Failed to set brand kit.").toToolResponse(),
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
}
