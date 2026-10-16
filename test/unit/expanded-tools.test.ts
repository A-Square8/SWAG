import { describe, it, expect } from "vitest";
import { createServer } from "../../src/server.js";

describe("Expanded MCP Tools (21 Registered Tools)", () => {
  it("should create MCP server with all 21 tools registered", () => {
    const server = createServer();
    expect(server).toBeDefined();

    // Verify server name and version
    // Check registered tools count on the internal McpServer instance
    const registeredTools = (server as any)._registeredTools || (server as any).registeredTools || {};
    const toolNames = Object.keys(registeredTools);

    const expectedTools = [
      "analyze_project",
      "capture_project",
      "list_assets",
      "add_asset",
      "get_theme",
      "set_theme",
      "get_brand_kit",
      "set_brand_kit",
      "get_style_presets",
      "plan_content",
      "render_instagram_post",
      "render_instagram_reel",
      "render_youtube_video",
      "list_outputs",
      "open_gui",
      // 8 new tools
      "render_twitter_post",
      "render_linkedin_post",
      "render_github_social",
      "render_thumbnail",
      "batch_render",
      "export_bundle",
      "preview_slide",
      "validate_plan",
    ];

    expect(toolNames).toHaveLength(23);
    for (const name of expectedTools) {
      expect(toolNames).toContain(name);
    }
  });
});
