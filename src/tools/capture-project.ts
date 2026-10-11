/**
 * MCP Tool: capture_project
 *
 * Runs the dev server and captures screenshots / recordings across viewports and themes,
 * discovering routes and applying privacy blurring.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ProjectCapturer } from "../core/capturer/index.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:capture_project");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  startServer: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to automatically start the dev server (default: true)"),
  serverUrl: z
    .string()
    .optional()
    .describe("Override URL if the dev server is already running (e.g. http://localhost:3000)"),
  runCommand: z
    .string()
    .optional()
    .describe("Override dev server start command"),
  port: z
    .number()
    .optional()
    .describe("Override dev server port"),
  viewports: z
    .array(
      z.object({
        name: z.enum(["desktop", "tablet", "mobile"]),
        width: z.number(),
        height: z.number(),
      }),
    )
    .optional()
    .describe("Viewports to capture (defaults to desktop and mobile)"),
  colorSchemes: z
    .array(z.enum(["light", "dark"]))
    .optional()
    .describe("Color schemes to capture (defaults to ['dark'])"),
  routes: z
    .array(z.string())
    .optional()
    .describe("Specific route paths to capture (e.g. ['/', '/dashboard'])"),
  fullPage: z
    .boolean()
    .optional()
    .default(false)
    .describe("Capture full scrollable page instead of viewport (default: false)"),
  blurSensitive: z
    .boolean()
    .optional()
    .default(true)
    .describe("Automatically detect and blur API keys, tokens, emails (default: true)"),
  recordVideo: z
    .boolean()
    .optional()
    .default(true)
    .describe("Record a live demo video of page interactions (default: true)"),
  interactions: z
    .array(
      z.object({
        type: z.enum(["click", "type", "scroll", "wait"]),
        selector: z.string().optional().describe("CSS selector of target element"),
        text: z.string().optional().describe("Text to type if type action"),
        delayMs: z.number().optional().describe("Delay to pause after action in ms"),
      }),
    )
    .optional()
    .describe("Optional explicit sequence of demo actions (e.g. typing an expense, clicking submit button)"),
};

export function registerCaptureProject(server: McpServer): void {
  server.tool(
    "capture_project",
    "Capture screenshots and screen recordings of a web project across devices and themes. Automatically starts the dev server (if needed), discovers routes, executes live demo actions, and applies privacy blurs to sensitive data.",
    InputSchema,
    async (args) => {
      try {
        log.info(`capture_project invoked for: ${args.projectPath}`);

        const result = await ProjectCapturer.capture({
          projectPath: args.projectPath,
          startServer: args.startServer,
          serverUrl: args.serverUrl,
          runCommand: args.runCommand,
          port: args.port,
          viewports: args.viewports,
          colorSchemes: args.colorSchemes,
          routes: args.routes,
          fullPage: args.fullPage,
          blurSensitive: args.blurSensitive,
          recordVideo: args.recordVideo,
          interactions: args.interactions,
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
        log.error(`Unexpected error in capture_project: ${message}`);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                new SwagError(
                  "INTERNAL_ERROR",
                  message,
                  "An unexpected error occurred during capture. Check the logs.",
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

  log.debug("Registered tool: capture_project");
}
