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
    .describe(
      "Style preset ID (professional, casual, minimalist, artistic, humorous, storyteller, tutorial, hype, corporate, indie)",
    ),
  overrides: z
    .record(z.unknown())
    .optional()
    .describe("Optional constraints or topic overrides"),
};

const TEMPLATE_DOCS = {
  "instagram-post": {
    slideArchetypes: [
      { type: "title", purpose: "Opening slide with high visual impact. Hook the audience." },
      { type: "feature", purpose: "Deep dive into a specific capability or benefit with checkmark list." },
      { type: "screenshot", purpose: "Full device frame (browser or iPhone) showcasing actual UI screenshot." },
      { type: "tech-stack", purpose: "Architecture & engineering overview with tech badges." },
      { type: "metrics", purpose: "Big-number KPI cards with sparklines and progress rings." },
      { type: "bar-chart", purpose: "Horizontal or vertical SVG bar chart for benchmarks." },
      { type: "pie-chart", purpose: "Donut or pie chart with legend showing architecture/language distribution." },
      { type: "radar-chart", purpose: "Spider/radar chart showing multidimensional project strengths." },
      { type: "comparison", purpose: "Side-by-side Before/After comparison panels." },
      { type: "feature-matrix", purpose: "✅/❌ feature comparison table vs legacy solutions." },
      { type: "comparison-table", purpose: "Multi-column comparison table with checkmarks, metrics, and highlighted our-column. Accepts markdown tables or pipe strings." },
      { type: "checklist", purpose: "Specification checklist cards with animated glowing ticks, status badges, and details." },
      { type: "bullet-points", purpose: "Key takeaways grid with dynamic keyword-matched official SVG icons and badges." },
      { type: "pipeline", purpose: "Linear workflow pipeline steps with connecting arrows. Accepts items: ['01 Step: desc', ...]." },
      { type: "decision-graph", purpose: "Decision flowchart with start, decision diamonds, branching paths (YES/NO), and arrowheads." },
      { type: "flowchart", purpose: "Complete interactive flowchart and DAG architecture." },
      { type: "architecture", purpose: "Microservices & system topology block diagram." },
      { type: "terminal", purpose: "macOS dark terminal window showing installation or run commands." },
      { type: "code-diff", purpose: "Syntax diff with green additions and red deletions." },
      { type: "testimonial", purpose: "Quote card with author, avatar, company, and star rating." },
      { type: "timeline", purpose: "Vertical roadmap milestone progression with glowing nodes." },
      { type: "outro", purpose: "Final slide with call-to-action and social handles." },
    ],
  },
  "instagram-reel": {
    sceneArchetypes: [
      { type: "hook", purpose: "0-3s high-impact opening that stops the scroll." },
      { type: "feature", purpose: "Showcase a standout capability with smooth narration." },
      { type: "demo", purpose: "Live interactive screen recording or responsive mobile frame." },
      { type: "tech", purpose: "Engineering highlights and architecture tech stack badges." },
      { type: "problem", purpose: "Dramatic problem statement callout with warning badge." },
      { type: "stats", purpose: "Rapid-fire KPI reveal with big numbers and circular progress rings." },
      { type: "before-after", purpose: "Vertical split showing transformation from problem to solution." },
      { type: "comparison-table", purpose: "Vertical feature matrix comparison vs alternatives." },
      { type: "checklist", purpose: "Punchy capability checklist with animated checkmark pop-ins." },
      { type: "bullet-points", purpose: "Key architecture highlights with glowing icons." },
      { type: "pipeline", purpose: "Animated-feel pipeline workflow progression with dynamic steps." },
      { type: "decision-graph", purpose: "Vertical decision tree flowchart with branching." },
      { type: "code", purpose: "Terminal execution with real-time output display." },
      { type: "testimonial", purpose: "Social proof quote overlay with 5-star rating." },
      { type: "chart", purpose: "Full-screen benchmark or distribution chart." },
      { type: "outro", purpose: "Call to action with GitHub link and social handles." },
    ],
  },
  youtube: {
    sectionArchetypes: [
      { type: "intro", purpose: "16:9 widescreen video hook with lower third." },
      { type: "problem", purpose: "Explore legacy limitations and design motivation." },
      { type: "features", purpose: "Grid showcase of core application capabilities." },
      { type: "how-it-works", purpose: "Deep dive into mechanisms and workflows with dynamic steps." },
      { type: "tech-stack", purpose: "Official vector tech stack badges and architecture." },
      { type: "demo", purpose: "Interactive browser walkthrough with narration." },
      { type: "metrics", purpose: "Dashboard KPI cards with sparklines and progress rings." },
      { type: "comparison", purpose: "Split-view feature matrix comparison table." },
      { type: "comparison-table", purpose: "Dynamic multi-column comparison table with check/cross, metrics, and highlighted our-column. Accepts markdown tables, pipe strings, or objects." },
      { type: "checklist", purpose: "Verified specification checklist cards with glowing tick animations." },
      { type: "bullet-points", purpose: "Highlight cards with dynamic official icons and numbered badges." },
      { type: "code-walkthrough", purpose: "Code diff or terminal walkthrough with side notes." },
      { type: "architecture", purpose: "Full-width system architecture and topology diagram." },
      { type: "workflow", purpose: "Dynamic step-by-step CI/CD or data pipeline. Accepts custom steps or items." },
      { type: "decision-graph", purpose: "Complete decision logic flowchart with decision diamonds, YES/NO branches, and directed arrows." },
      { type: "flowchart", purpose: "Full DAG / flowchart process diagram." },
      { type: "testimonials", purpose: "Community reviews and star ratings." },
      { type: "timeline", purpose: "Project milestones and future roadmap." },
      { type: "benchmarks", purpose: "Operations/sec throughput comparison bar charts." },
      { type: "git-history", purpose: "Git commit branch graph and changelog highlights." },
      { type: "call-to-action", purpose: "Mid/outro CTA with QR code to repo." },
      { type: "outro", purpose: "Wrap-up with social links and subscribe prompt." },
      { type: "raw-demo", purpose: "Appended full-size live project demo with ambient music." },
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
                  type: "comparison-table",
                  content: {
                    heading: "Competitive Matrix",
                    subtitle: `How ${analysis.profile.name} compares with alternatives`,
                    tableData: {
                      headers: ["Capability", analysis.profile.name, "Alternative"],
                      highlightColumnIndex: 1,
                      rows: [
                        { feature: "Execution Mode", values: ["✓ 100% Local", "✗ Cloud Required"] },
                        { feature: "Setup Latency", values: ["✓ Instant (<10ms)", "✗ High (>2s)"] },
                        { feature: "License", values: ["✓ Open Source", "✗ Proprietary"] },
                      ],
                    },
                  },
                },
                {
                  id: "slide-3",
                  type: "checklist",
                  content: {
                    heading: "Production Checklist",
                    subtitle: "Engineered to strict standards",
                    items: [
                      "- [x] Strict Type Safety [VERIFIED]: 100% TypeScript with zero any",
                      "- [x] High Performance [OPTIMIZED]: Sub-50ms render pipeline",
                      "- [x] Zero Telemetry [PRIVATE]: All data remains strictly local",
                      "- [ ] Multi-Node Sync [PLANNED]: Coming in next release",
                    ],
                  },
                },
                {
                  id: "slide-4",
                  type: "pipeline",
                  content: {
                    heading: "Execution Pipeline",
                    subtitle: "From raw project code to publishable assets",
                    items: [
                      "1. Discovery: Deep analyze project architecture",
                      "2. Capture: High-DPI browser screenshot capture",
                      "3. Synthesize: Rich comparison tables & checklists",
                      "4. Export: Studio-grade 4K output generation",
                    ],
                  },
                },
                {
                  id: "slide-5",
                  type: "tech-stack",
                  content: {
                    heading: "Built with Modern Stack",
                    items: analysis.profile.techStack.slice(0, 6).map((t) => t.name),
                  },
                },
                {
                  id: "slide-6",
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
                  type: "comparison-table",
                  duration: 5,
                  content: {
                    text: "Feature Comparison",
                    narrationText: `Compared to traditional solutions, ${analysis.profile.name} eliminates cloud costs and runs completely on your machine.`,
                    tableData: {
                      headers: ["Metric", analysis.profile.name, "Alternative"],
                      rows: [
                        { feature: "Hosting Cost", values: ["✓ $0 / month", "✗ $49 / month"] },
                        { feature: "Latency", values: ["✓ Instant (<10ms)", "✗ Slow (>500ms)"] },
                        { feature: "Privacy", values: ["✓ 100% Local", "✗ Cloud Tracked"] },
                      ],
                    },
                  },
                },
                {
                  id: "scene-3",
                  type: "checklist",
                  duration: 4,
                  content: {
                    text: "Production Checklist",
                    narrationText: "Every release passes automated verification: strict type safety, zero dependencies on external clouds, and sub-50ms latency.",
                    items: [
                      "- [x] 100% Strict TypeScript [VERIFIED]",
                      "- [x] Sub-50ms Local Execution [OPTIMIZED]",
                      "- [x] Zero API Keys Required [PRIVATE]",
                    ],
                  },
                },
                {
                  id: "scene-4",
                  type: "pipeline",
                  duration: 4,
                  content: {
                    text: "Execution Flow",
                    narrationText: "The execution workflow handles discovery, asset capture, dynamic synthesis, and instant rendering in seconds.",
                    items: [
                      "1. Code Discovery",
                      "2. Asset Capture",
                      "3. Visual Synthesis",
                      "4. Instant Export",
                    ],
                  },
                },
                {
                  id: "scene-5",
                  type: "tech",
                  duration: 4,
                  content: {
                    text: "Modern Tech Stack",
                    narrationText: `Powered by ${analysis.profile.techStack.slice(0, 3).map((t) => t.name).join(", ")}.`,
                  },
                },
                {
                  id: "scene-6",
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
            formatDescription: "YouTubeVideoPlan JSON object to pass to render_youtube_video. Supports narrated walkthrough sections plus an appended full-size raw screen recording demo (rawDemo) after the outro with soothing background music and zero narration.",
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
                  section: "comparison-table",
                  title: "Architectural & Performance Comparison",
                  narrationText: `Let's take a look at how ${analysis.profile.name} compares with industry standards across performance, security, and developer experience. Notice the dramatic reduction in complexity.`,
                  estimatedDuration: 20,
                  lowerThird: "Direct Comparison",
                  tableData: {
                    headers: ["Evaluation Metric", analysis.profile.name, "Industry Standard", "Custom Script"],
                    highlightColumnIndex: 1,
                    rows: [
                      { feature: "Cold Start Latency", values: ["✓ 12ms", "✗ 450ms", "✗ 1200ms"] },
                      { feature: "API Key Requirement", values: ["✓ Keyless / Zero", "✗ Paid API Key", "✗ Custom Auth"] },
                      { feature: "Vector Diagram Fidelity", values: ["✓ Studio SVG 4K", "✗ Low-res Raster", "✗ None"] },
                      { feature: "Type Safety", values: ["✓ Strict Zod + TS", "✗ Partial", "✗ Untyped"] },
                    ],
                  },
                },
                {
                  id: "sec-3",
                  section: "checklist",
                  title: "Engineering & Compliance Checklist",
                  narrationText: "We held ourselves to strict engineering standards throughout development. Here is the verified verification checklist.",
                  estimatedDuration: 18,
                  lowerThird: "Verification Checklist",
                  checklistData: {
                    items: [
                      { label: "Zero MCP Sampling Violations", checked: true, badge: "VERIFIED", details: "100% deterministic schema handoff" },
                      { label: "No Secrets or Credentials Logged", checked: true, badge: "SECURE", details: "Safe masking on all stdio & log streams" },
                      { label: "Deterministic Rendering", checked: true, badge: "TESTED", details: "Zero frame drops across 60fps exports" },
                      { label: "Multi-Platform Asset Support", checked: true, badge: "EXPANDED", details: "Reels, Posts, YouTube 16:9 widescreen" },
                    ],
                  },
                },
                {
                  id: "sec-4",
                  section: "workflow",
                  title: "Core Dataflow & Execution Pipeline",
                  narrationText: "Here is the exact step-by-step pipeline executed when processing projects from raw code to final social bundle.",
                  estimatedDuration: 20,
                  lowerThird: "Pipeline Architecture",
                  steps: [
                    { title: "Project Scanner", description: "Detects package manifests, framework archetypes, and routes" },
                    { title: "Asset Harvester", description: "Captures high-res browser viewport screenshots and recordings" },
                    { title: "Design Theming", description: "Applies curated HSL color tokens and typography presets" },
                    { title: "Dynamic Synthesis", description: "Constructs SVG charts, comparison tables, and checklists" },
                    { title: "Studio Exporter", description: "Renders MP4 and PNG assets into swag-output with metadata" },
                  ],
                },
                {
                  id: "sec-5",
                  section: "decision-graph",
                  title: "Decision Logic & Routing Flowchart",
                  narrationText: "The engine uses a fault-tolerant decision graph to route assets, handle missing files, and ensure fallback rendering seamlessly.",
                  estimatedDuration: 18,
                  lowerThird: "Decision Logic DAG",
                  nodes: [
                    { id: "start", label: "Incoming Request", type: "start" },
                    { id: "dec-cache", label: "Cache Valid?", type: "decision" },
                    { id: "proc-fast", label: "Serve from Cache", type: "process" },
                    { id: "proc-render", label: "Render 4K Assets", type: "process" },
                    { id: "end", label: "Deliver Bundle", type: "end" },
                  ],
                  edges: [
                    { from: "start", to: "dec-cache" },
                    { from: "dec-cache", to: "proc-fast", label: "YES" },
                    { from: "dec-cache", to: "proc-render", label: "NO" },
                    { from: "proc-fast", to: "end" },
                    { from: "proc-render", to: "end" },
                  ],
                },
                {
                  id: "sec-6",
                  section: "bullet-points",
                  title: "Core Architectural Advantages",
                  narrationText: "To summarize our key takeaways: rapid zero-configuration setup, full local privacy, and studio-grade media rendering.",
                  estimatedDuration: 18,
                  lowerThird: "Core Advantages",
                  items: [
                    "🚀 Instant Setup: Zero config needed; automatically discovers framework and routes",
                    "🎨 Studio Styling: Vibrant HSL color harmony, glassmorphism, and modern typography",
                    "📊 Dynamic Visualization: Rich comparison tables, animated checklists, and SVG DAG graphs",
                    "🔒 100% Local & Keyless: Runs entirely on your machine with zero external cloud dependencies",
                  ],
                },
                {
                  id: "sec-7",
                  section: "demo",
                  title: "Live Project Demonstration",
                  narrationText: `Here is the application in action. Notice how smoothly we can interact with the controls, perform key workflow actions, and receive immediate real-time feedback.`,
                  assetIds: videoAsset ? [videoAsset.id] : assets[1] ? [assets[1].id] : [],
                  estimatedDuration: 25,
                  lowerThird: "Live Project Walkthrough",
                },
                {
                  id: "sec-8",
                  section: "outro",
                  title: "Getting Started & Source Code",
                  narrationText: `Thank you for watching! All the source code, documentation, and installation instructions are available in the link in the description. Don't forget to like and subscribe for more developer deep-dives.`,
                  assetIds: [],
                  estimatedDuration: 15,
                  lowerThird: "Star on GitHub",
                },
              ],
              rawDemo: {
                enabled: true,
                title: "Raw Project Demo (Live Interface)",
                assetId: videoAsset?.id,
                duration: 25,
                audioVolume: 0.35,
              },
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
