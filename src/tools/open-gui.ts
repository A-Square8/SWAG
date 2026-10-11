/**
 * MCP Tool: open_gui
 *
 * Launches the SWAG web dashboard server on localhost and returns the active URL.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GuiServer } from "../gui/server.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:open_gui");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  port: z
    .number()
    .optional()
    .default(8420)
    .describe("Port to listen on (default: 8420)"),
};

export function registerOpenGui(server: McpServer): void {
  server.tool(
    "open_gui",
    "Open the SWAG interactive web dashboard on localhost to visually review project details, browse captured screenshots, adjust design tokens and themes, and view rendered outputs.",
    InputSchema,
    async (args) => {
      try {
        log.info(`open_gui invoked on port ${args.port} for: ${args.projectPath}`);

        const result = await GuiServer.start({
          projectPath: args.projectPath,
          port: args.port,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `SWAG Web Dashboard is live at: ${result.url}`,
                  url: result.url,
                  port: result.port,
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
                new SwagError("INTERNAL_ERROR", message, "Failed to start GUI server.").toToolResponse(),
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

  log.debug("Registered tool: open_gui");
}
