/**
 * MCP Tool: analyze_project
 *
 * Analyzes a project directory and returns a structured ProjectProfile
 * containing tech stack, features, routes, run command, and more.
 */

import { z } from "zod";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { analyzeProject } from "../core/analyzer/index.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:analyze_project");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  hints: z
    .object({
      runCommand: z
        .string()
        .optional()
        .describe("Override the detected dev server run command"),
      port: z
        .number()
        .optional()
        .describe("Override the detected dev server port"),
      techStack: z
        .array(z.string())
        .optional()
        .describe("Additional tech stack items to include"),
      projectName: z
        .string()
        .optional()
        .describe("Override the detected project name"),
    })
    .optional()
    .describe("Optional hints to override or supplement automatic detection"),
};

export function registerAnalyzeProject(server: McpServer): void {
  server.tool(
    "analyze_project",
    "Analyze a web project directory to detect its tech stack, features, routes, run command, and structure. Returns a ProjectProfile that the agent can review and correct before proceeding to capture or content generation.",
    InputSchema,
    async (args) => {
      try {
        log.info(`analyze_project called for: ${args.projectPath}`);

        const result = await analyzeProject({
          projectPath: args.projectPath,
          hints: args.hints,
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
        log.error(`Unexpected error: ${message}`);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError(
                  "INTERNAL_ERROR",
                  message,
                  "This is an unexpected error. Please report it.",
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

  log.debug("Registered tool: analyze_project");
}
