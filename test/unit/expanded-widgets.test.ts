import { describe, it, expect } from "vitest";
import {
  parseComparisonTableData,
  renderComparisonTable,
  parseChecklistItems,
  renderChecklist,
  parseBulletItems,
  renderBulletPoints,
} from "../../src/core/widgets/social-widgets.js";
import {
  parsePipelineSteps,
  renderPipeline,
  parseFlowchartData,
  renderFlowchart,
} from "../../src/core/diagrams/index.js";
import { generateYouTubeSectionHtml } from "../../src/core/renderer/video/youtube-templates.js";
import { generateReelSceneHtml } from "../../src/core/renderer/video/templates.js";
import { generateSlideHtml } from "../../src/core/renderer/image/templates.js";
import { DARK_THEME } from "../../src/core/theme/presets/dark.js";
import type { YouTubeVideoSection, ReelScene, PostSlide } from "../../src/types/content.js";

const testTheme = DARK_THEME;

describe("Dynamic Comparison Table Widget", () => {
  it("should parse Markdown table format into structured headers and rows", () => {
    const mdTable = `
| Metric | SWAG | Old Tool | Cloud Script |
| --- | --- | --- | --- |
| Cold Start | <10ms | 450ms | 1200ms |
| Privacy | 100% Local | Tracking | Telemetry |
| Free Tier | Unlimited | 5 uses/mo | Paid Only |
    `.trim();

    const data = parseComparisonTableData(mdTable);
    expect(data.headers).toEqual(["Metric", "SWAG", "Old Tool", "Cloud Script"]);
    expect(data.rows.length).toBe(3);
    expect(data.rows[0].feature).toBe("Cold Start");
    expect(data.rows[0].values).toEqual(["<10ms", "450ms", "1200ms"]);
    expect(data.rows[1].feature).toBe("Privacy");
  });

  it("should parse colon-separated comparison strings", () => {
    const rawItems = [
      "Throughput: 10,000 req/s vs 1,200 req/s",
      "Memory: 45MB vs 320MB",
      "Config: Zero setup vs Complex YAML",
    ];

    const data = parseComparisonTableData(rawItems);
    expect(data.rows.length).toBe(3);
    expect(data.rows[0].feature).toBe("Throughput");
    expect(data.rows[0].values).toEqual(["10,000 req/s", "1,200 req/s"]);
  });

  it("should render comparison table with custom columns, check/cross styling, and highlight class", () => {
    const html = renderComparisonTable(
      {
        headers: ["Feature", "Our App", "Competitor"],
        highlightColumnIndex: 1,
        rows: [
          { feature: "Offline Support", values: ["✓ Instant", "✗ None"] },
          { feature: "Open Source", values: ["✓ MIT", "✗ Proprietary"] },
          { feature: "Price", values: ["$0 Free", "$99 / mo"] },
        ],
      },
      { title: "Direct Showdown" },
    );

    expect(html).toContain("swag-comparison-table");
    expect(html).toContain("Direct Showdown");
    expect(html).toContain("Our App");
    expect(html).toContain("Competitor");
    expect(html).toContain("col-our");
    expect(html).toContain("val-check");
    expect(html).toContain("val-cross");
    expect(html).toContain("density-roomy");
  });

  it("should apply compact density class when row count exceeds 6", () => {
    const rows = Array.from({ length: 8 }, (_, i) => ({
      feature: `Requirement ${i + 1}`,
      values: ["✓ Yes", "✗ No"],
    }));
    const html = renderComparisonTable({ rows });
    expect(html).toContain("density-compact");
  });
});

describe("Animated Checklist Widget", () => {
  it("should parse Markdown checklist items with check status, badges, and details", () => {
    const rawLines = [
      "- [x] Strict TypeScript [VERIFIED]: 0 any types across whole codebase",
      "- [x] High Speed [OPTIMIZED]: Sub-50ms execution",
      "- [ ] Distributed Mode [PLANNED]: In active development",
    ];

    const items = parseChecklistItems(rawLines);
    expect(items.length).toBe(3);
    expect(items[0].checked).toBe(true);
    expect(items[0].label).toBe("Strict TypeScript");
    expect(items[0].badge).toBe("VERIFIED");
    expect(items[0].details).toBe("0 any types across whole codebase");

    expect(items[2].checked).toBe(false);
    expect(items[2].badge).toBe("PLANNED");
  });

  it("should parse unicode tick and cross prefixes", () => {
    const raw = [
      "✓ Zero MCP sampling violations [PASSED]",
      "✗ No secrets logged [FAIL]",
    ];
    const items = parseChecklistItems(raw);
    expect(items[0].checked).toBe(true);
    expect(items[0].badge).toBe("PASSED");
    expect(items[1].checked).toBe(false);
  });

  it("should render checklist with keyframe animations, checkmark draw, and badges", () => {
    const html = renderChecklist([
      { label: "Deterministic Rendering", checked: true, badge: "VERIFIED", details: "Zero dropped frames" },
      { label: "Safe Redaction", checked: true, badge: "SECURITY" },
    ]);

    expect(html).toContain("swag-checklist-container");
    expect(html).toContain("swag-tick-glow");
    expect(html).toContain("swag-check-draw");
    expect(html).toContain("Deterministic Rendering");
    expect(html).toContain("VERIFIED");
    expect(html).toContain("Zero dropped frames");
  });
});

describe("Dynamic Bullet Points Widget", () => {
  it("should parse numbered and bullet strings with icons", () => {
    const raw = [
      "1. Speed: Blazing fast asynchronous runner",
      "2. Security: Automatic token redaction",
      "⚡ Performance: 60 FPS video pipeline",
    ];

    const items = parseBulletItems(raw);
    expect(items.length).toBe(3);
    expect(items[0].title).toBe("Speed");
    expect(items[0].description).toBe("Blazing fast asynchronous runner");
    expect(items[2].title).toBe("Performance");
  });

  it("should render bullet points with official SVG vector icons and responsive layout", () => {
    const html = renderBulletPoints([
      { title: "React Architecture", description: "Composable component model", icon: "react" },
      { title: "Database Layer", description: "PostgreSQL with connection pooling", icon: "database" },
      { title: "Security Shield", description: "Full secret redaction", icon: "security" },
    ]);

    expect(html).toContain("swag-bullets-grid");
    expect(html).toContain("React Architecture");
    expect(html).toContain("bullet-icon-box");
    expect(html).toContain("<svg");
  });
});

describe("Dynamic Pipeline Workflow Diagram", () => {
  it("should parse custom string items into pipeline steps", () => {
    const raw = [
      "1. Ingestion: Scan package.json and workspace",
      "2. Discovery: Find routes and components",
      "3. Synthesis: Generate SVG diagrams",
      "4. Video: Render 16:9 4K presentation",
      "5. Packaging: Bundle publish-ready assets",
    ];

    const steps = parsePipelineSteps(raw);
    expect(steps.length).toBe(5);
    expect(steps[0].label).toBe("Ingestion");
    expect(steps[0].duration).toBe("Scan package.json and workspace");
    expect(steps[4].label).toBe("Packaging");
  });

  it("should render arbitrary step counts (e.g. 5 steps) with dynamic widths and arrows", () => {
    const steps = [
      { label: "Step A", status: "completed" as const },
      { label: "Step B", status: "completed" as const },
      { label: "Step C", status: "running" as const },
      { label: "Step D", status: "pending" as const },
      { label: "Step E", status: "pending" as const },
    ];

    const svg = renderPipeline(steps, { title: "Custom 5-Stage Pipeline", width: 900 });
    expect(svg).toContain("Custom 5-Stage Pipeline");
    expect(svg).toContain("Step A");
    expect(svg).toContain("Step E");
    expect(svg).toContain("pipeline-arrow");
  });
});

describe("Dynamic Decision Graph Flowchart", () => {
  it("should parse text strings with decision diamonds and YES/NO branches", () => {
    const textFlow = [
      "Start: Incoming Webhook",
      "Decision: Signature Valid? -> YES: Process Payload, NO: Reject 401",
      "Process: Process Payload",
      "Process: Reject 401",
      "End: Send Response",
    ];

    const data = parseFlowchartData(textFlow);
    expect(data.nodes.length).toBe(5);
    expect(data.nodes.find((n) => n.type === "decision")?.type).toBe("decision");
    expect(data.edges.some((e) => e.label === "YES")).toBe(true);
    expect(data.edges.some((e) => e.label === "NO")).toBe(true);
  });

  it("should render flowchart with SVG diamond polygons and directed arrowhead markers", () => {
    const nodes = [
      { id: "start", label: "Start Task", type: "start" as const },
      { id: "check", label: "Check Cache", type: "decision" as const },
      { id: "fast", label: "Fast Cache Hit", type: "process" as const },
      { id: "slow", label: "Heavy Recompute", type: "process" as const },
      { id: "end", label: "Complete", type: "end" as const },
    ];
    const edges = [
      { from: "start", to: "check" },
      { from: "check", to: "fast", label: "YES" },
      { from: "check", to: "slow", label: "NO" },
      { from: "fast", to: "end" },
      { from: "slow", to: "end" },
    ];

    const svg = renderFlowchart(nodes, edges, { title: "Cache Flowchart", width: 850, height: 400 });
    expect(svg).toContain("Cache Flowchart");
    expect(svg).toContain("<polygon"); // Diamond
    expect(svg).toContain("id=\"flowchart-arrow-yes\"");
    expect(svg).toContain("id=\"flowchart-arrow-no\"");
    expect(svg).toContain("Check Cache");
    expect(svg).toContain("Fast Cache Hit");
  });
});

const dummyBrand = {
  brandName: "Acme Tech",
  defaultCTA: "Star on GitHub",
  socials: [
    { platform: "github" as const, handle: "acmetech" },
    { platform: "website" as const, handle: "https://acme.tech" },
  ],
};

describe("Template Integration (YouTube, Reels, Posts)", () => {
  it("should render comparison-table section in YouTube without hardcoded defaults", () => {
    const section: YouTubeVideoSection = {
      id: "sec-comp",
      section: "comparison-table",
      title: "Custom Benchmark Showdown",
      narrationText: "Here is our direct comparison against competing toolsets.",
      estimatedDuration: 15,
      tableData: {
        headers: ["Benchmark", "Our Engine", "Legacy System"],
        rows: [
          { feature: "Latency", values: ["✓ 4ms", "✗ 250ms"] },
          { feature: "Memory", values: ["✓ 12MB", "✗ 480MB"] },
        ],
      },
    };

    const html = generateYouTubeSectionHtml({
      section,
      sectionIndex: 0,
      totalSections: 1,
      theme: testTheme,
      brandKit: dummyBrand,
    });
    expect(html).toContain("Custom Benchmark Showdown");
    expect(html).toContain("Our Engine");
    expect(html).toContain("Legacy System");
    expect(html).toContain("swag-comparison-table");
    expect(html).toContain("4ms");
  });

  it("should render checklist section in YouTube with animated ticks and badges", () => {
    const section: YouTubeVideoSection = {
      id: "sec-check",
      section: "checklist",
      title: "Compliance Verification",
      narrationText: "All critical checks passed.",
      estimatedDuration: 15,
      items: [
        "- [x] Zero Memory Leaks [PASSED]: Valgrind verified",
        "- [x] 100% Offline Capable [OFFLINE]: No cloud keys needed",
      ],
    };

    const html = generateYouTubeSectionHtml({
      section,
      sectionIndex: 0,
      totalSections: 1,
      theme: testTheme,
      brandKit: dummyBrand,
    });
    expect(html).toContain("Compliance Verification");
    expect(html).toContain("swag-checklist-container");
    expect(html).toContain("Zero Memory Leaks");
    expect(html).toContain("PASSED");
  });

  it("should render decision-graph section in YouTube with custom nodes and edges", () => {
    const section: YouTubeVideoSection = {
      id: "sec-dag",
      section: "decision-graph",
      title: "Fault Tolerant Routing",
      narrationText: "How requests are routed seamlessly.",
      estimatedDuration: 15,
      nodes: [
        { id: "req", label: "Request In", type: "start" },
        { id: "valid", label: "Token Valid?", type: "decision" },
        { id: "exec", label: "Execute Pipeline", type: "process" },
      ],
      edges: [
        { from: "req", to: "valid" },
        { from: "valid", to: "exec", label: "YES" },
      ],
    };

    const html = generateYouTubeSectionHtml({
      section,
      sectionIndex: 0,
      totalSections: 1,
      theme: testTheme,
      brandKit: dummyBrand,
    });
    expect(html).toContain("Fault Tolerant Routing");
    expect(html).toContain("<polygon");
    expect(html).toContain("Token Valid?");
  });

  it("should render dynamic workflow section in YouTube with 5 custom steps", () => {
    const section: YouTubeVideoSection = {
      id: "sec-wf",
      section: "workflow",
      title: "Data Processing Pipeline",
      narrationText: "Here are the five distinct processing steps.",
      estimatedDuration: 20,
      steps: [
        { title: "Stage 1: Fetch", description: "Pull raw streams" },
        { title: "Stage 2: Filter", description: "Strip duplicates" },
        { title: "Stage 3: Enrich", description: "Add geo tags" },
        { title: "Stage 4: Aggregate", description: "Compute rollups" },
        { title: "Stage 5: Persist", description: "Write to disk" },
      ],
    };

    const html = generateYouTubeSectionHtml({
      section,
      sectionIndex: 0,
      totalSections: 1,
      theme: testTheme,
      brandKit: dummyBrand,
    });
    expect(html).toContain("Data Processing Pipeline");
    expect(html).toContain("Stage 1: Fetch");
    expect(html).toContain("Stage 5: Persist");
  });

  it("should render comparison-table, checklist, and decision-graph in Reels", () => {
    const compScene: ReelScene = {
      id: "sc-comp",
      type: "comparison-table",
      duration: 4,
      content: {
        text: "Direct Comparison",
        narrationText: "See why our project leads the pack.",
        tableData: {
          headers: ["Attribute", "SWAG", "Other"],
          rows: [{ feature: "Speed", values: ["✓ Instant", "✗ Laggy"] }],
        },
      },
    };
    const compHtml = generateReelSceneHtml({
      scene: compScene,
      sceneIndex: 0,
      totalScenes: 3,
      theme: testTheme,
      brandKit: dummyBrand,
    });
    expect(compHtml).toContain("swag-comparison-table");
    expect(compHtml).toContain("Direct Comparison");

    const checkScene: ReelScene = {
      id: "sc-check",
      type: "checklist",
      duration: 4,
      content: {
        text: "Launch Checklist",
        narrationText: "Everything ready for launch.",
        items: ["- [x] Production Ready [VERIFIED]"],
      },
    };
    const checkHtml = generateReelSceneHtml({
      scene: checkScene,
      sceneIndex: 1,
      totalScenes: 3,
      theme: testTheme,
      brandKit: dummyBrand,
    });
    expect(checkHtml).toContain("swag-checklist-container");
    expect(checkHtml).toContain("Production Ready");

    const flowScene: ReelScene = {
      id: "sc-flow",
      type: "decision-graph",
      duration: 4,
      content: {
        text: "Flow Logic",
        narrationText: "Decision branching.",
        items: [
          "Start: Begin",
          "Decision: Ready? -> YES: Go, NO: Wait",
          "Process: Go",
          "Process: Wait",
          "End: Done",
        ],
      },
    };
    const flowHtml = generateReelSceneHtml({
      scene: flowScene,
      sceneIndex: 2,
      totalScenes: 3,
      theme: testTheme,
      brandKit: dummyBrand,
    });
    expect(flowHtml).toContain("<svg");
    expect(flowHtml).toContain("<polygon");
  });

  it("should render comparison-table, checklist, bullet-points, and decision-graph in Instagram Posts", () => {
    const tableSlide: PostSlide = {
      id: "slide-tbl",
      type: "comparison-table",
      content: {
        heading: "Full Feature Comparison",
        subtitle: "How we compare",
        tableData: {
          headers: ["Feature", "SWAG", "Legacy"],
          rows: [{ feature: "Local First", values: ["✓ Yes", "✗ No"] }],
        },
      },
    };
    const tableHtml = generateSlideHtml({
      slide: tableSlide,
      slideNumber: 1,
      totalSlides: 4,
      theme: testTheme,
      brandKit: dummyBrand,
      aspectRatio: "4:5",
    });
    expect(tableHtml).toContain("Full Feature Comparison");
    expect(tableHtml).toContain("swag-comparison-table");

    const checkSlide: PostSlide = {
      id: "slide-chk",
      type: "checklist",
      content: {
        heading: "Audit Checklist",
        items: ["- [x] Security Hardened [VERIFIED]"],
      },
    };
    const checkHtml = generateSlideHtml({
      slide: checkSlide,
      slideNumber: 2,
      totalSlides: 4,
      theme: testTheme,
      brandKit: dummyBrand,
      aspectRatio: "4:5",
    });
    expect(checkHtml).toContain("swag-checklist-container");
    expect(checkHtml).toContain("Security Hardened");

    const bulletSlide: PostSlide = {
      id: "slide-bp",
      type: "bullet-points",
      content: {
        heading: "Core Architectural Pillars",
        items: ["⚡ Instant: Zero compilation delay", "🔒 Private: Completely offline"],
      },
    };
    const bulletHtml = generateSlideHtml({
      slide: bulletSlide,
      slideNumber: 3,
      totalSlides: 4,
      theme: testTheme,
      brandKit: dummyBrand,
      aspectRatio: "4:5",
    });
    expect(bulletHtml).toContain("swag-bullets-grid");
    expect(bulletHtml).toContain("Core Architectural Pillars");
  });
});
