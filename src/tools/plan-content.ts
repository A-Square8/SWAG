/**
 * MCP Tool: plan_content — The creative handoff.
 *
 * Prepares the schema, project context, available assets, and style guidelines
 * for the host agent's LLM to write copy, pick assets, and structure slides/scenes.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { analyzeProject } from "../core/analyzer/index.js";
import { AssetManager } from "../core/assets/index.js";
import { StyleManager } from "../core/styles/index.js";
import { PostPlanSchema, ReelPlanSchema, YouTubeVideoPlanSchema } from "../types/content.js";
import { SwagError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const log = logger.child("tool:plan_content");

const InputSchema = {
  projectPath: z.string().describe("Absolute path to the project root directory"),
  platforms: z
    .array(z.enum(["instagram-post", "instagram-reel", "youtube"]))
    .min(1)
    .describe("Platforms to generate content plans for"),
  style: z
    .string()
    .optional()
    .default("professional")
    .describe("Style preset ID (professional, casual, minimalist, artistic, humorous)"),
  overrides: z
    .record(z.unknown())
    .optional()
    .describe("Optional constraints or topic overrides"),
};

const TEMPLATE_DOCS = {
  "instagram-post": {
    slideArchetypes: [
      {
        type: "title",
        purpose: "Opening slide with high visual impact. Hook the audience.",
        fields: {
          heading: "Compelling headline (e.g. 'How We Built an AI-Powered Pipeline')",
          subtitle: "Clear one-liner clarifying what it is",
          tagline: "Short category or project name",
          items: "Optional 2-4 highlight chips",
          assetId: "Optional screenshot ID for embedded browser preview",
        },
      },
      {
        type: "feature",
        purpose: "Deep dive into a specific capability or benefit.",
        fields: {
          heading: "Feature name",
          body: "Why this matters or how it works",
          items: "3-4 bullet benefits or workflow steps",
          assetId: "Optional screenshot ID demonstrating the feature",
        },
      },
      {
        type: "screenshot",
        purpose: "Full device frame showcasing actual UI screenshot.",
        fields: {
          heading: "View or page title",
          body: "Brief explanatory caption",
          assetId: "REQUIRED: Asset ID from availableAssets",
        },
      },
      {
        type: "tech-stack",
        purpose: "Architecture & engineering overview.",
        fields: {
          heading: "Architecture highlight headline",
          body: "Short engineering note",
          items: "Array of frameworks/tools used (e.g. ['React', 'TypeScript', 'Tailwind', 'PostgreSQL'])",
        },
      },
      {
        type: "outro",
        purpose: "Final slide with call-to-action and social handles.",
        fields: {
          heading: "Call to action headline (e.g. 'Explore the Source Code')",
          body: "Next step (e.g. 'Link in bio • Star on GitHub')",
          ctaText: "Swipe/Follow reminder",
        },
      },
    ],
  },
};

export function registerPlanContent(server: McpServer): void {
  server.tool(
    "plan_content",
    "Prepares a content planning package for the host agent: returns the target JSON Schema, project profile, captured assets list, and style tone guidance so the agent's LLM can write copy and construct plans.",
    InputSchema,
    async (args) => {
      try {
        log.info(`plan_content called for platforms: ${args.platforms.join(", ")}`);

        // 1. Analyze project profile
        const analysis = await analyzeProject({ projectPath: args.projectPath });

        // 2. Load available assets
        const assets = await AssetManager.listAssets(args.projectPath);

        // 3. Load style preset
        const stylePreset = await StyleManager.getPreset(args.style);

        // 4. Construct schemas and templates for requested platforms
        const targetSchemas: Record<string, unknown> = {};
        if (args.platforms.includes("instagram-post")) {
          targetSchemas["instagram-post"] = {
            formatDescription: "PostPlan JSON object to pass to render_instagram_post",
            exampleStructure: {
              platform: "instagram-post",
              format: "carousel",
              aspectRatio: "4:5",
              slides: [
                {
                  id: "slide-1",
                  type: "title",
                  content: {
                    heading: analysis.profile.name,
                    subtitle: analysis.profile.description || "Modern Web Application",
                    tagline: "Featured Project",
                    assetId: assets[0]?.id,
                  },
                },
                {
                  id: "slide-2",
                  type: "feature",
                  content: {
                    heading: analysis.profile.features[0]?.name || "Core Features",
                    body: analysis.profile.features[0]?.description || "Key capabilities",
                    items: analysis.profile.features.slice(0, 3).map((f) => f.name),
                  },
                },
                {
                  id: "slide-3",
                  type: "tech-stack",
                  content: {
                    heading: "Built with Modern Stack",
                    items: analysis.profile.techStack.slice(0, 6).map((t) => t.name),
                  },
                },
                {
                  id: "slide-4",
                  type: "outro",
                  content: {
                    heading: "Explore the Code",
                    body: "Check out the repository and try it out!",
                    ctaText: "Follow for more developer showcases",
                  },
                },
              ],
              caption: `Introducing ${analysis.profile.name}! Built with ${analysis.profile.techStack.slice(0, 3).map((t) => t.name).join(", ")}.`,
              hashtags: [
                "#webdev",
                "#softwareengineer",
                "#buildinpublic",
                ...analysis.profile.techStack.slice(0, 3).map((t) => `#${t.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`),
              ],
              },
          };
        }

        if (args.platforms.includes("instagram-reel")) {
          targetSchemas["instagram-reel"] = {
            formatDescription: "ReelPlan JSON object to pass to render_instagram_reel",
            exampleStructure: {
              platform: "instagram-reel",
              targetDuration: 30,
              scenes: [
                {
                  id: "scene-1",
                  type: "hook",
                  duration: 4,
                  content: {
                    text: `How We Built ${analysis.profile.name}`,
                    narrationText: `Here is how we built ${analysis.profile.name} using ${analysis.profile.techStack[0]?.name || "modern tech"}.`,
                    assetId: assets[0]?.id,
                  },
                },
                {
                  id: "scene-2",
                  type: "feature",
                  duration: 5,
                  content: {
                    text: analysis.profile.features[0]?.name || "Core Features",
                    narrationText: analysis.profile.features[0]?.description || "Let's dive into the core features.",
                    assetId: assets[1]?.id || assets[0]?.id,
                  },
                },
                {
                  id: "scene-3",
                  type: "tech",
                  duration: 4,
                  content: {
                    text: "Modern Tech Stack",
                    narrationText: `Powered by ${analysis.profile.techStack.slice(0, 3).map((t) => t.name).join(", ")}.`,
                  },
                },
                {
                  id: "scene-4",
                  type: "outro",
                  duration: 4,
                  content: {
                    text: "Star on GitHub",
                    narrationText: "Check out the repo and follow for more dev projects.",
                  },
                },
              ],
              caption: `Deep dive into ${analysis.profile.name}! Built with ${analysis.profile.techStack.slice(0, 3).map((t) => t.name).join(", ")}.`,
              hashtags: ["#webdev", "#coding", "#softwareengineer", "#buildinpublic"],
            },
          };
        }

        if (args.platforms.includes("youtube")) {
          const videoAsset = assets.find((a) => a.type === "recording");
          targetSchemas["youtube"] = {
            formatDescription: "YouTubeVideoPlan JSON object to pass to render_youtube_video. Demonstrates real project video recordings (type 'recording') in demo/features sections to showcase actual user actions (e.g. adding expenses, clicking buttons, submitting data).",
            exampleStructure: {
              platform: "youtube",
              title: `${analysis.profile.name} — Full Architecture & Walkthrough`,
              description: `In this video, we explore the complete architecture and features of ${analysis.profile.name}.\n\nTimestamps and source code included below.`,
              tags: ["programming", "web development", ...analysis.profile.techStack.slice(0, 5).map((t) => t.name.toLowerCase())],
              targetDuration: 180,
              sections: [
                {
                  id: "sec-1",
                  section: "intro",
                  title: `Introducing ${analysis.profile.name}`,
                  narrationText: `Welcome to the walkthrough of ${analysis.profile.name}. In this video, we will explore why we built it, the problems it solves, and how the architecture works under the hood.`,
                  assetIds: assets[0] ? [assets[0].id] : [],
                  estimatedDuration: 15,
                  lowerThird: `${analysis.profile.name} Overview`,
                },
                {
                  id: "sec-2",
                  section: "demo",
                  title: "Live Project Demonstration",
                  narrationText: `Here is the application in action. Notice how smoothly we can interact with the controls, perform key workflow actions, and receive immediate real-time feedback.`,
                  assetIds: videoAsset ? [videoAsset.id] : assets[1] ? [assets[1].id] : [],
                  estimatedDuration: 25,
                  lowerThird: "Live Project Walkthrough",
                },
                {
                  id: "sec-3",
                  section: "tech-stack",
                  title: "Tech Stack & Engineering",
                  narrationText: `Under the hood, the project is powered by ${analysis.profile.techStack.slice(0, 4).map((t) => t.name).join(", ")}. We prioritized strong typing, modularity, and rapid rendering.`,
                  assetIds: [],
                  estimatedDuration: 20,
                  lowerThird: "Architecture & Stack",
                },
                {
                  id: "sec-4",
                  section: "outro",
                  title: "Getting Started & Source Code",
                  narrationText: `Thank you for watching! All the source code, documentation, and installation instructions are available in the link in the description. Don't forget to like and subscribe for more developer deep-dives.`,
                  assetIds: [],
                  estimatedDuration: 15,
                  lowerThird: "Star on GitHub",
                },
              ],
            },
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message:
                    "Creative handoff ready. Fill the schema using the project profile, assets, and style guidance, then call render_*.",
                  styleGuidance: stylePreset.tone,
                  styleDefaults: stylePreset.defaults,
                  availableAssets: assets.map((a) => ({
                    id: a.id,
                    type: a.type,
                    description: a.metadata.description,
                    route: a.metadata.route,
                    device: a.metadata.device,
                    dimensions: `${a.metadata.width}x${a.metadata.height}`,
                  })),
                  projectProfile: {
                    name: analysis.profile.name,
                    description: analysis.profile.description,
                    techStack: analysis.profile.techStack.map((t) => t.name),
                    features: analysis.profile.features,
                    routes: analysis.profile.routes,
                  },
                  templateInfo: TEMPLATE_DOCS,
                  targetSchemas,
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
                new SwagError("INTERNAL_ERROR", message, "Failed to prepare content plan.").toToolResponse(),
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

  log.debug("Registered tool: plan_content");
}
