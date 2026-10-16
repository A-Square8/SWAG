/**
 * Modern HTML/CSS slide templates for Instagram post and carousel rendering.
 * Features glassmorphism, vibrant gradients, typography, browser/device frames,
 * charts, diagrams, developer widgets, and social proof.
 */

import type { PostSlide, Theme, BrandKit } from "../../../types/index.js";
import { tokensToCssVars } from "../../theme/tokens.js";
import { IconEngine } from "../../icons/index.js";
import {
  renderBarChart,
  renderPieChart,
  renderRadarChart,
  renderSparkline,
  type BarChartItem,
  type PieChartItem,
  type RadarChartItem,
} from "../../charts/index.js";
import {
  renderPipeline,
  parsePipelineSteps,
  renderFlowchart,
  parseFlowchartData,
  renderArchitectureDiagram,
  type PipelineStep,
  type ArchitectureService,
  type ArchitectureConnection,
} from "../../diagrams/index.js";
import {
  renderMacBookFrame,
  renderIPhoneFrame,
} from "../../frames/index.js";
import {
  renderDotGrid,
  renderCircuitBoard,
  renderNoiseTexture,
} from "../../patterns/index.js";
import {
  renderTerminal,
  renderCodeDiff,
  type DiffLine,
} from "../../widgets/dev-widgets.js";
import {
  renderTestimonial,
  renderStarRating,
  renderFeatureMatrix,
  renderComparisonTable,
  parseComparisonTableData,
  renderChecklist,
  parseChecklistItems,
  renderBulletPoints,
  parseBulletItems,
  type FeatureMatrixItem,
} from "../../widgets/social-widgets.js";
import { renderQRCode } from "../../widgets/branding.js";

export interface RenderSlideHtmlOptions {
  slide: PostSlide;
  slideNumber: number;
  totalSlides: number;
  theme: Theme;
  brandKit: BrandKit;
  aspectRatio: "4:5" | "1:1";
  assetDataUrl?: string; // base64 or file URL for embedded screenshot
  logoDataUrl?: string;
}

export function generateSlideHtml(options: RenderSlideHtmlOptions): string {
  const {
    slide,
    slideNumber,
    totalSlides,
    theme,
    brandKit,
    aspectRatio,
    assetDataUrl,
    logoDataUrl,
  } = options;

  const width = 1080;
  const height = aspectRatio === "4:5" ? 1350 : 1080;
  const cssVars = tokensToCssVars(theme.tokens);

  const websiteSocial = brandKit.socials.find((s) => s.platform === "website");
  const githubSocial = brandKit.socials.find((s) => s.platform === "github");
  const instagramSocial = brandKit.socials.find((s) => s.platform === "instagram");
  const displayUrl = websiteSocial?.handle
    ? websiteSocial.handle.replace(/^https?:\/\//, "")
    : githubSocial?.handle
      ? `github.com/${githubSocial.handle.replace(/^@/, "")}`
      : brandKit.brandName
        ? `${brandKit.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "")}.dev`
        : "localhost:3000";
  const primaryHandle =
    instagramSocial?.handle ||
    brandKit.socials[0]?.handle ||
    (brandKit.brandName ? `@${brandKit.brandName.toLowerCase().replace(/\s+/g, "_")}` : "@developer");

  // Slide body content based on archetype
  let slideBodyHtml = "";

  switch (slide.type) {
    case "title":
      slideBodyHtml = `
        <div class="slide-content title-slide">
          <div class="badge-pill">
            <span class="pulsing-dot"></span>
            <span>${slide.content.tagline || brandKit.brandName || "Featured Project"}</span>
          </div>
          <h1 class="main-title">${escapeHtml(slide.content.heading || "Project Showcase")}</h1>
          ${slide.content.subtitle ? `<p class="subtitle">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          ${
            assetDataUrl
              ? slide.content.deviceFrame === "macbook"
                ? renderMacBookFrame(`<img src="${assetDataUrl}" alt="Preview" />`, { urlBar: displayUrl })
                : `
              <div class="browser-mockup">
                <div class="browser-header">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                  <div class="browser-url-bar">${escapeHtml(displayUrl)}</div>
                </div>
                <div class="browser-viewport">
                  <img src="${assetDataUrl}" alt="Preview" />
                </div>
              </div>
            `
              : ""
          }
          ${
            slide.content.items && slide.content.items.length > 0
              ? `
            <div class="tag-cloud">
              ${slide.content.items.map((it) => `<span class="tech-tag">${escapeHtml(it)}</span>`).join("")}
            </div>
          `
              : ""
          }
        </div>
      `;
      break;

    case "screenshot":
      slideBodyHtml = `
        <div class="slide-content screenshot-slide">
          ${slide.content.heading ? `<h2 class="section-title">${escapeHtml(slide.content.heading)}</h2>` : ""}
          ${slide.content.body ? `<p class="section-desc">${escapeHtml(slide.content.body)}</p>` : ""}
          ${
            slide.content.deviceFrame === "iphone"
              ? renderIPhoneFrame(assetDataUrl ? `<img src="${assetDataUrl}" alt="Feature" />` : `<div class="placeholder-view">Screenshot Display</div>`)
              : `
            <div class="browser-mockup large-frame">
              <div class="browser-header">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <div class="browser-url-bar">${escapeHtml(displayUrl)}</div>
              </div>
              <div class="browser-viewport">
                ${assetDataUrl ? `<img src="${assetDataUrl}" alt="Feature" />` : `<div class="placeholder-view">Screenshot Display</div>`}
              </div>
            </div>
          `
          }
        </div>
      `;
      break;

    case "tech-stack":
      slideBodyHtml = `
        <div class="slide-content tech-slide">
          <div class="badge-pill">Architecture & Stack</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Built with Modern Technologies")}</h2>
          ${slide.content.body ? `<p class="section-desc">${escapeHtml(slide.content.body)}</p>` : ""}
          <div class="tech-grid">
            ${(slide.content.items || ["React", "TypeScript", "Node.js", "Tailwind CSS"])
              .map(
                (tech) => `
              <div class="tech-card">
                <div class="tech-card-icon">${IconEngine.getSvg(tech, { size: 30 })}</div>
                <div class="tech-card-title">${escapeHtml(tech)}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
      break;

    case "feature":
      slideBodyHtml = `
        <div class="slide-content feature-slide">
          <div class="badge-pill">Key Feature</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Key Capability")}</h2>
          ${slide.content.body ? `<p class="section-desc">${escapeHtml(slide.content.body)}</p>` : ""}
          ${
            slide.content.items && slide.content.items.length > 0
              ? `
            <div class="feature-list">
              ${slide.content.items
                .map(
                  (item) => `
                <div class="feature-item">
                  <div class="check-icon">${IconEngine.getSvg("checkmark", { size: 18, color: "var(--swag-primary, #6366f1)" })}</div>
                  <div class="feature-text">${escapeHtml(item)}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }
          ${
            assetDataUrl
              ? `
            <div class="browser-mockup compact-frame">
              <div class="browser-header">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="browser-viewport">
                <img src="${assetDataUrl}" alt="Feature" />
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;
      break;

    // --- 12 New Archetypes ---

    case "metrics":
    case "stats": {
      const metricsList = (slide.content.metrics as Array<{ label: string; value: string | number; change?: string }>) || [
        { label: "Active Users", value: "10,000+", change: "+45%" },
        { label: "Lighthouse Score", value: "99/100", change: "Perf" },
        { label: "Response Latency", value: "<15ms", change: "-70%" },
        { label: "Test Coverage", value: "98.5%", change: "Full" },
      ];
      slideBodyHtml = `
        <div class="slide-content metrics-slide">
          <div class="badge-pill">Key Performance Indicators</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Impact & Metrics")}</h2>
          ${slide.content.subtitle ? `<p class="section-desc">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          <div class="metrics-grid">
            ${metricsList
              .map(
                (m) => `
              <div class="metric-card">
                <div class="metric-val">${escapeHtml(String(m.value))}</div>
                <div class="metric-lbl">${escapeHtml(m.label)}</div>
                <div class="metric-sparkline">${renderSparkline([10, 25, 40, 55, 75, 95], { width: 120, height: 35, color: "var(--swag-primary, #6366f1)" })}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
      break;
    }

    case "bar-chart": {
      const items = (slide.content.chartData as unknown as BarChartItem[]) || [
        { label: "Current System", value: 320, formattedValue: "320 req/s" },
        { label: "Legacy System", value: 85, formattedValue: "85 req/s" },
        { label: "Industry Average", value: 120, formattedValue: "120 req/s" },
      ];
      slideBodyHtml = `
        <div class="slide-content chart-slide">
          <div class="badge-pill">Benchmark Analysis</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Performance Comparison")}</h2>
          ${slide.content.subtitle ? `<p class="section-desc">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          <div class="chart-container">
            ${renderBarChart(items, { width: 880, height: 480, layout: "horizontal", title: slide.content.heading })}
          </div>
        </div>
      `;
      break;
    }

    case "pie-chart": {
      const items = (slide.content.chartData as unknown as PieChartItem[]) || [
        { label: "TypeScript", value: 65, color: "#3178c6" },
        { label: "Rust Core", value: 20, color: "#dea584" },
        { label: "CSS / Design", value: 10, color: "#38bdf8" },
        { label: "Tests & Docs", value: 5, color: "#10b981" },
      ];
      slideBodyHtml = `
        <div class="slide-content chart-slide">
          <div class="badge-pill">Distribution Breakdown</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Architecture Breakdown")}</h2>
          ${slide.content.subtitle ? `<p class="section-desc">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          <div class="chart-container">
            ${renderPieChart(items, { width: 880, height: 440, donut: true, showLegend: true })}
          </div>
        </div>
      `;
      break;
    }

    case "radar-chart": {
      const items = (slide.content.chartData as unknown as RadarChartItem[]) || [
        { axis: "Developer DX", value: 95 },
        { axis: "Throughput", value: 90 },
        { axis: "Test Coverage", value: 88 },
        { axis: "Documentation", value: 92 },
        { axis: "Reliability", value: 96 },
      ];
      slideBodyHtml = `
        <div class="slide-content chart-slide">
          <div class="badge-pill">Strengths Radar</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Core Capabilities")}</h2>
          <div class="chart-container">
            ${renderRadarChart(items, { width: 720, height: 500, color: "var(--swag-primary, #6366f1)" })}
          </div>
        </div>
      `;
      break;
    }

    case "comparison": {
      slideBodyHtml = `
        <div class="slide-content comparison-slide">
          <div class="badge-pill">Transformation</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Before vs After")}</h2>
          ${slide.content.subtitle ? `<p class="section-desc">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          <div class="comparison-split">
            <div class="comparison-col before">
              <div class="comparison-tag red">BEFORE</div>
              <h3 class="col-head">Manual & Slow</h3>
              <ul class="col-list">
                <li>3+ days to deploy updates</li>
                <li>Brittle configuration files</li>
                <li>Zero automated visual tests</li>
                <li>High latency bottlenecks</li>
              </ul>
            </div>
            <div class="comparison-divider">VS</div>
            <div class="comparison-col after">
              <div class="comparison-tag green">WITH THIS PROJECT</div>
              <h3 class="col-head">Automated & Instant</h3>
              <ul class="col-list">
                <li>Sub-second live builds</li>
                <li>Zero-config defaults</li>
                <li>Fully automated validation</li>
                <li>Continuous visual verification</li>
              </ul>
            </div>
          </div>
        </div>
      `;
      break;
    }

    case "feature-matrix":
    case "comparison-table": {
      const rawTable =
        slide.content.tableData ||
        slide.content.matrix?.items ||
        slide.content.data?.items ||
        slide.content.data?.table ||
        slide.content.items;
      const compTableData = parseComparisonTableData(rawTable, brandKit.brandName || "This Project");
      slideBodyHtml = `
        <div class="slide-content matrix-slide">
          <div class="badge-pill">Market Comparison</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Why We Stand Out")}</h2>
          <div class="matrix-container" style="margin-top: 24px;">
            ${renderComparisonTable(compTableData, { ourName: brandKit.brandName || "This Project" })}
          </div>
        </div>
      `;
      break;
    }

    case "pipeline":
    case "workflow": {
      const rawSteps =
        slide.content.steps ||
        slide.content.diagramData?.steps ||
        slide.content.data?.steps ||
        slide.content.items;
      const steps: PipelineStep[] = parsePipelineSteps(rawSteps);
      slideBodyHtml = `
        <div class="slide-content pipeline-slide">
          <div class="badge-pill">Execution Workflow</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "End-to-End Pipeline")}</h2>
          ${slide.content.subtitle ? `<p class="section-desc">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          <div class="diagram-wrap" style="margin-top: 24px;">
            ${renderPipeline(steps, { width: 920, height: 240, accentColor: "var(--swag-primary, #6366f1)" })}
          </div>
        </div>
      `;
      break;
    }

    case "checklist": {
      const checkItems = parseChecklistItems(
        slide.content.checklistData ||
        slide.content.data?.checklist ||
        slide.content.items,
      );
      slideBodyHtml = `
        <div class="slide-content checklist-slide">
          <div class="badge-pill">Verified Checklist</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Verified Capabilities")}</h2>
          ${slide.content.subtitle ? `<p class="section-desc">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          <div class="checklist-wrap" style="margin-top: 24px; width: 100%;">
            ${renderChecklist(checkItems, { columns: checkItems.length > 5 ? 2 : 1 })}
          </div>
        </div>
      `;
      break;
    }

    case "bullet-points": {
      const bulletItems = parseBulletItems(
        slide.content.items ||
        slide.content.data?.bullets ||
        slide.content.data?.items,
      );
      slideBodyHtml = `
        <div class="slide-content bullets-slide">
          <div class="badge-pill">Key Takeaways</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Core Highlights")}</h2>
          ${slide.content.subtitle ? `<p class="section-desc">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          <div class="bullets-wrap" style="margin-top: 24px; width: 100%;">
            ${renderBulletPoints(bulletItems, { columns: bulletItems.length > 4 ? 2 : 1 })}
          </div>
        </div>
      `;
      break;
    }

    case "decision-graph":
    case "flowchart": {
      const flowchartData = parseFlowchartData(
        slide.content.diagramData ||
        slide.content.data ||
        (slide.content.nodes ? { nodes: slide.content.nodes, edges: slide.content.edges } : slide.content.items),
      );
      slideBodyHtml = `
        <div class="slide-content flowchart-slide">
          <div class="badge-pill">Decision Architecture</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Execution Logic")}</h2>
          ${slide.content.subtitle ? `<p class="section-desc">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          <div class="diagram-wrap" style="margin-top: 24px;">
            ${renderFlowchart(flowchartData.nodes, flowchartData.edges, { width: 920, height: 420, title: slide.content.heading })}
          </div>
        </div>
      `;
      break;
    }

    case "architecture": {
      const services: ArchitectureService[] = (slide.content.diagramData?.services as ArchitectureService[]) || [
        { id: "client", name: "Client / User", category: "client", x: 40, y: 160 },
        { id: "gateway", name: brandKit.brandName ? `${brandKit.brandName} API` : "Core Gateway", category: "gateway", x: 260, y: 160 },
        { id: "engine", name: "Processing Engine", category: "service", x: 500, y: 80 },
        { id: "storage", name: "Storage & Cache", category: "service", x: 500, y: 240 },
      ];
      const connections: ArchitectureConnection[] = (slide.content.diagramData?.connections as ArchitectureConnection[]) || [
        { from: "client", to: "gateway", label: "Request" },
        { from: "gateway", to: "engine", label: "Execute" },
        { from: "gateway", to: "storage", label: "Persist" },
      ];
      slideBodyHtml = `
        <div class="slide-content architecture-slide">
          <div class="badge-pill">System Architecture</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Topology & Design")}</h2>
          <div class="diagram-wrap">
            ${renderArchitectureDiagram(services, connections, { width: 880, height: 420 })}
          </div>
        </div>
      `;
      break;
    }

    case "terminal":
    case "code": {
      const termLines = (slide.content.terminalLines as string[]) || (slide.content.command ? [slide.content.command] : null) || [
        "$ npm install",
        "✓ Dependencies resolved and verified (0.4s)",
        "$ npm run build",
        "✓ Production bundle compiled in 1.2s",
        "✓ All tests passing (100%)",
      ];
      slideBodyHtml = `
        <div class="slide-content terminal-slide">
          <div class="badge-pill">Developer Experience</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Quick Setup")}</h2>
          ${slide.content.subtitle ? `<p class="section-desc">${escapeHtml(slide.content.subtitle)}</p>` : ""}
          <div class="terminal-container">
            ${renderTerminal(termLines, { title: slide.content.heading || "Terminal — Quickstart" })}
          </div>
        </div>
      `;
      break;
    }

    case "code-diff": {
      const diffLines: DiffLine[] = [
        { type: "normal", content: "export async function handleRequest() {" },
        { type: "del", content: "-   const res = await legacySlowFetch(url);" },
        { type: "add", content: "+   const res = await optimizedVectorPipeline(url);" },
        { type: "add", content: "+   const cached = await memoryCache.get(res.key);" },
        { type: "normal", content: "    return cached ?? res.data;" },
        { type: "normal", content: "}" },
      ];
      slideBodyHtml = `
        <div class="slide-content diff-slide">
          <div class="badge-pill">Code Refactor</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Zero-Cost Optimization")}</h2>
          <div class="diff-container">
            ${renderCodeDiff(diffLines, { filename: "src/engine/pipeline.ts" })}
          </div>
        </div>
      `;
      break;
    }

    case "testimonial": {
      slideBodyHtml = `
        <div class="slide-content testimonial-slide">
          <div class="badge-pill">Social Proof</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "What Engineers Say")}</h2>
          <div class="testimonial-wrap">
            ${renderTestimonial({
              quote: slide.content.quote || slide.content.body || "This completely transformed our portfolio showcase. The charts and diagrams look like a Fortune 500 product launch.",
              author: slide.content.author || "Alex Chen",
              role: slide.content.role || "Principal Staff Architect",
              company: slide.content.company || "HyperScale Labs",
            })}
            <div class="stars-row">${renderStarRating({ rating: 5.0, reviewCount: "1,200+" })}</div>
          </div>
        </div>
      `;
      break;
    }

    case "timeline": {
      const timelineItems = slide.content.items || [
        "v0.1: Initial Prototype & Stdio MCP Server",
        "v0.5: Playwright Screen Capture & Brand Kits",
        "v1.0: Vector Chart Engine & Architecture Diagrams",
        "v2.0: Multi-Platform One-Click Social Pipeline",
      ];
      slideBodyHtml = `
        <div class="slide-content timeline-slide">
          <div class="badge-pill">Milestones</div>
          <h2 class="section-title">${escapeHtml(slide.content.heading || "Project Roadmap")}</h2>
          <div class="vertical-timeline">
            ${timelineItems
              .map(
                (item, idx) => `
              <div class="timeline-row">
                <div class="timeline-dot"></div>
                <div class="timeline-card">
                  <span class="timeline-step">PHASE 0${idx + 1}</span>
                  <p class="timeline-text">${escapeHtml(item)}</p>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
      break;
    }

    case "outro":
      slideBodyHtml = `
        <div class="slide-content outro-slide">
          <div class="outro-card">
            ${logoDataUrl ? `<img src="${logoDataUrl}" class="outro-logo" alt="Logo" />` : `<div class="outro-symbol">${IconEngine.getSvg("zap", { size: 68, color: "var(--swag-primary, #6366f1)" })}</div>`}
            <h2 class="section-title">${escapeHtml(slide.content.heading || brandKit.brandName || "Ready to Explore?")}</h2>
            <p class="section-desc">${escapeHtml(slide.content.body || slide.content.ctaText || brandKit.defaultCTA)}</p>
            <div class="social-handles">
              ${brandKit.socials
                .map(
                  (s) => `
                <div class="social-pill">
                  <span class="social-platform-icon">${IconEngine.getSvg(s.platform, { size: 20 })}</span>
                  <span class="social-platform">${s.platform}</span>
                  <span class="social-handle">${escapeHtml(s.handle)}</span>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      `;
      break;

    default: // custom
      slideBodyHtml = `
        <div class="slide-content custom-slide">
          ${slide.content.heading ? `<h2 class="section-title">${escapeHtml(slide.content.heading)}</h2>` : ""}
          ${slide.content.body ? `<p class="section-desc">${escapeHtml(slide.content.body)}</p>` : ""}
          ${
            slide.content.items && slide.content.items.length > 0
              ? `
            <div class="tag-cloud">
              ${slide.content.items.map((it) => `<span class="tech-tag">${escapeHtml(it)}</span>`).join("")}
            </div>
          `
              : ""
          }
          ${assetDataUrl ? `<div class="browser-mockup"><img src="${assetDataUrl}" alt="Preview" /></div>` : ""}
        </div>
      `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Slide ${slideNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

    ${cssVars}

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background-color: var(--swag-bg);
      color: var(--swag-fg);
      font-family: var(--swag-font-body);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 64px 72px;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient atmospheric background gradient */
    body::before {
      content: "";
      position: absolute;
      top: -20%;
      right: -20%;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--swag-primary) 0%, transparent 70%);
      opacity: 0.18;
      filter: blur(80px);
      z-index: 0;
      pointer-events: none;
    }

    body::after {
      content: "";
      position: absolute;
      bottom: -15%;
      left: -15%;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--swag-secondary) 0%, transparent 70%);
      opacity: 0.14;
      filter: blur(80px);
      z-index: 0;
      pointer-events: none;
    }

    /* Slide Header */
    .slide-header {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .brand-mark {
      font-weight: 700;
      font-size: 22px;
      letter-spacing: -0.02em;
      color: var(--swag-fg);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo-img {
      height: 38px;
      max-width: 140px;
      object-fit: contain;
    }

    .carousel-indicator {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .indicator-pill {
      font-size: 16px;
      font-weight: 600;
      color: var(--swag-muted-fg);
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      padding: 6px 14px;
      border-radius: 20px;
    }

    /* Slide Content */
    .slide-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: auto 0;
      width: 100%;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: var(--swag-primary);
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 600;
      width: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pulsing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--swag-primary);
      box-shadow: 0 0 10px var(--swag-primary);
    }

    .main-title {
      font-size: 58px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: var(--swag-fg);
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .section-title {
      font-size: 44px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .subtitle, .section-desc {
      font-size: 24px;
      line-height: 1.5;
      color: var(--swag-muted-fg);
      max-width: 900px;
    }

    /* Browser Mockup */
    .browser-mockup {
      width: 100%;
      border-radius: 16px;
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
      overflow: hidden;
      margin-top: 10px;
    }

    .browser-header {
      height: 44px;
      background: rgba(15, 23, 42, 0.8);
      border-bottom: 1px solid var(--swag-border);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
    }

    .browser-header .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #f59e0b; }
    .dot.green { background: #10b981; }

    .browser-url-bar {
      margin-left: 12px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      padding: 4px 16px;
      font-size: 13px;
      color: var(--swag-muted-fg);
      font-family: var(--swag-font-code);
    }

    .browser-viewport {
      width: 100%;
      height: 520px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #060911;
      position: relative;
    }

    .large-frame .browser-viewport { height: 800px; }
    .compact-frame .browser-viewport { height: 440px; }

    .browser-viewport img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    /* Tech grid */
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 16px;
    }

    .tech-card {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 16px;
      padding: 28px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .tech-card-icon {
      font-family: var(--swag-font-code);
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tech-card-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--swag-fg);
    }

    /* Tag Cloud */
    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
    }

    .tech-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--swag-border);
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 500;
      color: var(--swag-fg);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-top: 12px;
    }

    .metric-card {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 18px;
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    }

    .metric-val {
      font-size: 48px;
      font-weight: 800;
      color: var(--swag-fg);
      letter-spacing: -0.02em;
    }

    .metric-lbl {
      font-size: 18px;
      font-weight: 600;
      color: var(--swag-muted-fg);
    }

    .metric-sparkline {
      margin-top: 6px;
    }

    /* Charts & Diagrams container */
    .chart-container, .diagram-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--swag-border);
      border-radius: 18px;
      padding: 24px;
      overflow: hidden;
    }

    /* Comparison Split */
    .comparison-split {
      display: flex;
      align-items: stretch;
      gap: 20px;
      margin-top: 12px;
    }

    .comparison-col {
      flex: 1;
      padding: 32px 28px;
      border-radius: 18px;
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .comparison-col.before {
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(239, 68, 68, 0.04);
    }

    .comparison-col.after {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.04);
    }

    .comparison-tag {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 6px;
      width: fit-content;
    }
    .comparison-tag.red { background: #ef4444; color: #fff; }
    .comparison-tag.green { background: #10b981; color: #fff; }

    .col-head {
      font-size: 24px;
      font-weight: 700;
      color: var(--swag-fg);
    }

    .col-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      font-size: 17px;
      color: var(--swag-muted-fg);
    }

    .comparison-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      color: var(--swag-primary);
    }

    /* Vertical Timeline */
    .vertical-timeline {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 10px;
    }

    .timeline-row {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .timeline-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--swag-primary);
      box-shadow: 0 0 10px var(--swag-primary);
    }

    .timeline-card {
      flex: 1;
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 12px;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .timeline-step {
      font-size: 12px;
      font-weight: 800;
      color: var(--swag-primary);
      background: rgba(99, 102, 241, 0.12);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .timeline-text {
      font-size: 18px;
      font-weight: 500;
      color: var(--swag-fg);
    }

    /* Feature List */
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 12px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 18px;
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 14px;
      padding: 18px 24px;
    }

    .check-icon {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      font-weight: 800;
      font-size: 18px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .feature-text {
      font-size: 22px;
      font-weight: 500;
      color: var(--swag-fg);
    }

    /* Outro Slide */
    .outro-card {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 24px;
      padding: 64px 48px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
    }

    .outro-symbol { font-size: 64px; }
    .outro-logo { height: 80px; width: auto; object-fit: contain; }

    .social-handles {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin-top: 12px;
    }

    .social-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--swag-border);
      border-radius: 30px;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
    }

    .social-platform {
      color: var(--swag-primary);
      font-weight: 600;
      text-transform: capitalize;
    }

    .social-handle {
      color: var(--swag-fg);
      font-weight: 500;
    }

    /* Slide Footer */
    .slide-footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      color: var(--swag-muted-fg);
      font-size: 16px;
      font-weight: 500;
    }

    .footer-cta {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--swag-primary);
      font-weight: 600;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="slide-header">
    <div class="brand-mark">
      ${logoDataUrl ? `<img src="${logoDataUrl}" class="brand-logo-img" alt="Logo" />` : ""}
      ${brandKit.brandName ? `<span>${escapeHtml(brandKit.brandName)}</span>` : ""}
    </div>
    <div class="carousel-indicator">
      <span class="indicator-pill">${slideNumber} / ${totalSlides}</span>
    </div>
  </div>

  <!-- Body -->
  ${slideBodyHtml}

  <!-- Footer -->
  <div class="slide-footer">
    <div class="footer-handle">${escapeHtml(primaryHandle)}</div>
    <div class="footer-cta">${slideNumber < totalSlides ? "Swipe Next →" : escapeHtml(slide.content.ctaText || brandKit.defaultCTA)}</div>
  </div>
</body>
</html>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
