/**
 * SWAG MCP Server — Entry point
 *
 * Connects the MCP server to stdio transport for universal IDE compatibility.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolve } from "node:path";

import { createServer } from "./server.js";
import { GuiServer } from "./gui/server.js";
import { logger } from "./utils/logger.js";

const log = logger.child("main");

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // CLI Help
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
SWAG — Developer Social Media Engine (MCP Server)

Usage:
  swag-mcp [options]

Options:
  --gui [path]        Launch interactive web dashboard (default: current directory)
  --port <number>     Port for GUI server (default: 8420)
  --version, -v       Show version
  --help, -h          Show help

When run without arguments or invoked by an MCP client, runs as an MCP stdio server.
`);
    process.exit(0);
  }

  // CLI Version
  if (args.includes("--version") || args.includes("-v")) {
    console.log("swag-mcp v0.1.0");
    process.exit(0);
  }

  // Standalone GUI mode
  if (args.includes("--gui")) {
    let port = 8420;
    const portIdx = args.indexOf("--port");
    if (portIdx !== -1 && args[portIdx + 1]) {
      port = parseInt(args[portIdx + 1], 10) || 8420;
    }

    const guiIdx = args.indexOf("--gui");
    let projectDir = process.cwd();
    if (args[guiIdx + 1] && !args[guiIdx + 1].startsWith("-")) {
      projectDir = resolve(process.cwd(), args[guiIdx + 1]);
    }

    log.info(`Starting SWAG GUI for project: ${projectDir}`);
    const { url } = await GuiServer.start({ projectPath: projectDir, port });
    console.log(`\n✨ SWAG Dashboard running at: ${url}\nPress Ctrl+C to stop.\n`);

    const shutdown = async () => {
      await GuiServer.stop();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    return;
  }

  // Default: MCP stdio server mode
  log.info("Starting SWAG MCP server...");

  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  log.info("SWAG MCP server running on stdio");

  // Handle graceful shutdown
  const shutdown = async () => {
    log.info("Shutting down...");
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Keep alive — the transport handles stdio communication
  process.stdin.resume();
}

main().catch((err) => {
  log.error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
