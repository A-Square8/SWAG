/**
 * MCP Tool: validate_plan
 *
 * Validates a content plan against Zod schemas and platform best practices
 * (caption length, hashtags, asset existence, slide counts).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  PostPlanSchema,
  ReelPlanSchema,
  YouTubeVideoPlanSchema,
} from "../types/content.js";
import { AssetManager } from "../core/assets/index.js";
import { getPlatformMetadata } from "../core/output/analytics.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:validate_plan");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  platform: z
    .enum(["instagram-post", "instagram-reel", "youtube"])
    .describe("Platform plan type"),
  plan: z.record(z.unknown()).describe("The raw plan JSON object to validate"),
};

export function registerValidatePlan(server: McpServer): void {
  server.tool(
    "validate_plan",
    "Validate a content plan against schemas and platform publishing best practices before rendering.",
    InputSchema,
    async (args) => {
      try {
        log.info(`validate_plan called for platform: ${args.platform}`);

        const warnings: string[] = [];
        const errors: string[] = [];
        let parsedData: unknown;

        // 1. Schema Parse
        if (args.platform === "instagram-post") {
          const res = PostPlanSchema.safeParse(args.plan);
          if (!res.success) {
            errors.push(...res.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
          } else {
            parsedData = res.data;
          }
        } else if (args.platform === "instagram-reel") {
          const res = ReelPlanSchema.safeParse(args.plan);
          if (!res.success) {
            errors.push(...res.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
          } else {
            parsedData = res.data;
          }
        } else if (args.platform === "youtube") {
          const res = YouTubeVideoPlanSchema.safeParse(args.plan);
          if (!res.success) {
            errors.push(...res.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
          } else {
            parsedData = res.data;
          }
        }

        // 2. Best Practices & Asset Checks if schema is valid
        if (errors.length === 0 && parsedData) {
          const meta = getPlatformMetadata(args.platform);
          const raw = parsedData as Record<string, any>;

          if (raw.caption && raw.caption.length > meta.maxCaptionLength) {
            warnings.push(
              `Caption length (${raw.caption.length}) exceeds recommended maximum of ${meta.maxCaptionLength} chars.`,
            );
          }

          if (raw.hashtags && raw.hashtags.length > meta.maxHashtags) {
            warnings.push(
              `Hashtag count (${raw.hashtags.length}) exceeds platform limit of ${meta.maxHashtags}.`,
            );
          }

          // Check asset references
          const existingAssets = await AssetManager.listAssets(args.projectPath);
          const assetIdSet = new Set(existingAssets.map((a) => a.id));

          if (args.platform === "instagram-post" && raw.slides) {
            raw.slides.forEach((s: any, idx: number) => {
              if (s.content?.assetId && !assetIdSet.has(s.content.assetId)) {
                warnings.push(`Slide ${idx + 1} references missing assetId "${s.content.assetId}".`);
              }
            });
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: errors.length === 0,
                  valid: errors.length === 0,
                  errors,
                  warnings,
                  platformGuidelines: getPlatformMetadata(args.platform),
                },
                null,
                2,
              ),
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
                new SwagError("VALIDATION_FAILED", message, "Failed to validate content plan.").toToolResponse(),
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

  log.debug("Registered tool: validate_plan");
}
