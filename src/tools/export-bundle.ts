/**
 * MCP Tool: export_bundle
 *
 * Compiles and indexes all generated visual outputs, video files, captions,
 * and metadata manifests into a release bundle summary.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OutputManager } from "../core/output/index.js";
import { safeWriteJson, join } from "../utils/fs.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:export_bundle");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  bundleName: z.string().optional().default("social-media-kit").describe("Bundle name identifier"),
};

export function registerExportBundle(server: McpServer): void {
  server.tool(
    "export_bundle",
    "Export and package all generated social media assets, slides, videos, and captions into an indexed manifest.",
    InputSchema,
    async (args) => {
      try {
        log.info(`export_bundle called for: ${args.projectPath}`);

        const allOutputs = await OutputManager.listOutputs(args.projectPath);
        const bundleManifest = {
          bundleName: args.bundleName,
          exportedAt: new Date().toISOString(),
          totalAssets: allOutputs.reduce((acc, out) => acc + out.paths.length, 0),
          platforms: [...new Set(allOutputs.map((o) => o.platform))],
          outputs: allOutputs,
        };

        const manifestPath = join(args.projectPath, "swag-output", `${args.bundleName}-manifest.json`);
        await safeWriteJson(manifestPath, bundleManifest);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  bundlePath: manifestPath,
                  summary: {
                    totalPlatforms: bundleManifest.platforms.length,
                    totalFiles: bundleManifest.totalAssets,
                    platforms: bundleManifest.platforms,
                  },
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
                new SwagError("INTERNAL_ERROR", message, "Failed to compile export bundle.").toToolResponse(),
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

  log.debug("Registered tool: export_bundle");
}
