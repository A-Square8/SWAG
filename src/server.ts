/**
 * MCP Server setup — registers all tools and configures the server.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerAnalyzeProject } from "./tools/analyze-project.js";
import { registerCaptureProject } from "./tools/capture-project.js";
import { registerListAssets } from "./tools/list-assets.js";
import { registerAddAsset } from "./tools/add-asset.js";
import { registerGetTheme, registerSetTheme } from "./tools/get-theme.js";
import { registerGetBrandKit, registerSetBrandKit } from "./tools/get-brand-kit.js";
import { registerGetStylePresets } from "./tools/get-style-presets.js";
import { registerPlanContent } from "./tools/plan-content.js";
import { registerRenderInstagramPost } from "./tools/render-instagram-post.js";
import { registerRenderInstagramReel } from "./tools/render-instagram-reel.js";
import { registerRenderYoutubeVideo } from "./tools/render-youtube-video.js";
import { registerListOutputs } from "./tools/list-outputs.js";
import { registerOpenGui } from "./tools/open-gui.js";
import { logger } from "./utils/logger.js";

const log = logger.child("server");

/**
 * Create and configure the MCP server with all tools registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "swag-mcp",
    version: "0.1.0",
  });

  log.info("Registering tools...");

  // M1: Analysis
  registerAnalyzeProject(server);

  // M2: Capture & Assets
  registerCaptureProject(server);
  registerListAssets(server);
  registerAddAsset(server);

  // M3: Theme, Style, Brand, Instagram Posts
  registerGetTheme(server);
  registerSetTheme(server);
  registerGetBrandKit(server);
  registerSetBrandKit(server);
  registerGetStylePresets(server);
  registerPlanContent(server);
  registerRenderInstagramPost(server);

  // M4: Reels
  registerRenderInstagramReel(server);

  // M5: YouTube
  registerRenderYoutubeVideo(server);

  // M6: GUI + Outputs
  registerListOutputs(server);
  registerOpenGui(server);

  log.info("All tools registered");

  return server;
}
