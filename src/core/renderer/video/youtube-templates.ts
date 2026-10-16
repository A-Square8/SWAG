/**
 * 16:9 (1920x1080) Widescreen YouTube Video Section HTML templates.
 * Includes split layouts, lower thirds, tech badges, and responsive browser mockups.
 * Uses official SVG tech and platform icons and guarantees uncropped contain scaling.
 */

import type { VideoSection, Theme, BrandKit } from "../../../types/index.js";
import { tokensToCssVars } from "../../theme/tokens.js";
import { IconEngine } from "../../icons/index.js";
import {
  renderBarChart,
  renderPieChart,
  renderProgressRing,
  renderSparkline,
  type BarChartItem,
} from "../../charts/index.js";
import {
  renderPipeline,
  parsePipelineSteps,
  renderFlowchart,
  parseFlowchartData,
  renderArchitectureDiagram,
  type PipelineStep,
  type FlowchartNode,
  type FlowchartEdge,
  type ArchitectureService,
  type ArchitectureConnection,
} from "../../diagrams/index.js";
import {
  renderTerminal,
  renderCodeDiff,
  renderGitGraph,
  type DiffLine,
  type GitCommit,
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

export interface RenderYouTubeSectionHtmlOptions {
  section: VideoSection;
  sectionIndex: number;
  totalSections: number;
  theme: Theme;
  brandKit: BrandKit;
  assetDataUrl?: string;
  hasVideoAsset?: boolean;
  logoDataUrl?: string;
  nextSectionTitle?: string;
  projectTechStack?: string[];
  isMobileAsset?: boolean;
}

export function generateYouTubeSectionHtml(
  options: RenderYouTubeSectionHtmlOptions,
): string {
  const {
    section,
    sectionIndex,
    totalSections,
    theme,
    brandKit,
    assetDataUrl,
    hasVideoAsset = false,
    logoDataUrl,
    nextSectionTitle,
    projectTechStack,
    isMobileAsset = false,
  } = options;

  const cssVars = tokensToCssVars(theme.tokens);

  const websiteSocial = brandKit.socials.find((s) => s.platform === "website");
  const githubSocial = brandKit.socials.find((s) => s.platform === "github");
  const displayUrl = websiteSocial?.handle
    ? websiteSocial.handle.replace(/^https?:\/\//, "")
    : githubSocial?.handle
      ? `github.com/${githubSocial.handle.replace(/^@/, "")}`
      : brandKit.brandName
        ? `${brandKit.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "")}.dev`
        : "localhost:3000";

  let sectionBodyHtml = "";

  switch (section.section) {
    case "intro":
      sectionBodyHtml = `
        <div class="yt-intro-grid">
          <div class="yt-intro-text">
            <div class="yt-badge">
              <span class="pulsing-dot"></span>
              <span>${brandKit.brandName || "DEVELOPER SHOWCASE"}</span>
            </div>
            <h1 class="yt-hero-title">${escapeHtml(section.title)}</h1>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
          </div>
          ${
            assetDataUrl || hasVideoAsset
              ? renderMockupHtml(hasVideoAsset, assetDataUrl, isMobileAsset, displayUrl)
              : `
            <div class="yt-intro-highlights">
              ${
                section.metrics && section.metrics.length > 0
                  ? (section.metrics as Array<{ label: string; value: string | number }>)
                      .map(
                        (m) => `
                <div class="intro-metric-card">
                  <div class="metric-num">${escapeHtml(String(m.value))}</div>
                  <div class="metric-label">${escapeHtml(m.label)}</div>
                </div>
              `,
                      )
                      .join("")
                  : `
                <div class="intro-metric-card">
                  <div class="metric-num">${escapeHtml(String(projectTechStack?.length || 4))}</div>
                  <div class="metric-label">Core Technologies</div>
                </div>
                <div class="intro-metric-card">
                  <div class="metric-num">100%</div>
                  <div class="metric-label">Automated Architecture</div>
                </div>
                <div class="intro-metric-card">
                  <div class="metric-num">v1.0</div>
                  <div class="metric-label">Production Ready</div>
                </div>
              `
              }
            </div>
          `
          }
        </div>
      `;
      break;

    case "tech-stack":
      const rawItems =
        section.items && section.items.length > 0
          ? section.items
          : projectTechStack && projectTechStack.length > 0
            ? projectTechStack
            : [
                "Core Engine: High-performance scalable application architecture",
                "Type Contracts: End-to-end validated schemas and type safety",
                "Automated Pipeline: Deterministic build and task execution",
                "Modular Design: Clean domain separation and extensible components",
              ];

      const stackItems = rawItems.slice(0, 4).map((it) => {
        if (typeof it === "string") {
          const colonIdx = it.indexOf(":");
          if (colonIdx > 0) {
            return {
              name: it.slice(0, colonIdx).trim(),
              desc: it.slice(colonIdx + 1).trim(),
            };
          }
          const parenMatch = it.match(/^(.*?)\s*\((.*?)\)$/);
          if (parenMatch) {
            return {
              name: parenMatch[1].trim(),
              desc: parenMatch[2].trim(),
            };
          }
          return {
            name: it,
            desc: "Core system architecture and operational technology",
          };
        }
        return it;
      });

      sectionBodyHtml = `
        <div class="yt-section-header">
          <div class="yt-badge">ENGINEERING & ARCHITECTURE</div>
          <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
        </div>
        <div class="yt-tech-grid">
          ${stackItems
            .map(
              (item) => `
            <div class="yt-tech-card">
              <div class="tech-icon-box">${IconEngine.getSvg(item.name.split(/[\s(&:]+/)[0], { size: 36 })}</div>
              <div class="tech-info">
                <h3>${escapeHtml(item.name)}</h3>
                <p>${escapeHtml(item.desc)}</p>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
      break;

    case "problem":
      if (assetDataUrl || hasVideoAsset) {
        sectionBodyHtml = `
          <div class="yt-split-view">
            <div class="yt-left-panel">
              <div class="yt-badge">CRITICAL PROBLEM</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 220) + "...")}</p>
            </div>
            <div class="yt-right-panel">
              ${renderMockupHtml(hasVideoAsset, assetDataUrl, isMobileAsset, displayUrl)}
            </div>
          </div>
        `;
      } else {
        const problemItems =
          section.items && section.items.length > 0
            ? section.items.slice(0, 3)
            : [
                "Operational Overhead: Manual workflows and repetitive maintenance consume engineering time",
                "Integration Complexity: Connecting fragmented tools causes fragile pipelines and high failure rates",
                "Lack of Standardization: Inconsistent architectures lead to slow iteration cycles and technical debt",
              ];
        const parsed = parseInsightItems(problemItems, ["alert-triangle", "layers", "shield"]);
        sectionBodyHtml = `
          <div class="yt-editorial-layout">
            <div class="yt-editorial-header">
              <div class="yt-badge">CRITICAL CHALLENGES</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 240) + "...")}</p>
            </div>
            <div class="yt-insights-grid">
              ${parsed
                .map(
                  (item) => `
                <div class="yt-insight-card">
                  <div class="yt-insight-icon">${IconEngine.getSvg(item.icon, { size: 32, color: "var(--swag-primary, #6366f1)" })}</div>
                  <div class="yt-insight-title">${escapeHtml(item.title)}</div>
                  <div class="yt-insight-desc">${escapeHtml(item.desc)}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `;
      }
      break;

    case "how-it-works":
      if (assetDataUrl || hasVideoAsset) {
        sectionBodyHtml = `
          <div class="yt-split-view">
            <div class="yt-left-panel">
              <div class="yt-badge">SYSTEM WORKFLOW</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 220) + "...")}</p>
            </div>
            <div class="yt-right-panel">
              ${renderMockupHtml(hasVideoAsset, assetDataUrl, isMobileAsset, displayUrl)}
            </div>
          </div>
        `;
      } else {
        const workflowItems =
          section.items && section.items.length > 0
            ? section.items
            : [
                "01 Ingestion: Ingests configuration specifications and maps constraints",
                "02 Validation: Validates contracts, dependencies, and execution state",
                "03 Processing: Runs core pipeline routines with high efficiency",
                "04 Delivery: Compiles verified, production-ready deliverables",
              ];
        const parsedSteps = parseStepItems(workflowItems, ["terminal", "cpu", "zap", "check-circle", "layers", "database"]);
        const gridCols = parsedSteps.length <= 4 ? parsedSteps.length : parsedSteps.length <= 6 ? 3 : 4;
        sectionBodyHtml = `
          <div class="yt-editorial-layout">
            <div class="yt-editorial-header">
              <div class="yt-badge">EXECUTION WORKFLOW</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 240) + "...")}</p>
            </div>
            <div class="yt-pipeline-grid" style="grid-template-columns: repeat(${gridCols}, 1fr);">
              ${parsedSteps
                .map(
                  (step) => `
                <div class="yt-pipeline-card">
                  <div class="yt-step-badge">${escapeHtml(step.badge)}</div>
                  <div class="yt-pipeline-icon">${IconEngine.getSvg(step.icon, { size: 28, color: "var(--swag-primary, #6366f1)" })}</div>
                  <div class="yt-pipeline-title">${escapeHtml(step.title)}</div>
                  <div class="yt-pipeline-desc">${escapeHtml(step.desc)}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `;
      }
      break;

    case "challenges":
      if (assetDataUrl || hasVideoAsset) {
        sectionBodyHtml = `
          <div class="yt-split-view">
            <div class="yt-left-panel">
              <div class="yt-badge">ENGINEERING CHALLENGES</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 220) + "...")}</p>
            </div>
            <div class="yt-right-panel">
              ${renderMockupHtml(hasVideoAsset, assetDataUrl, isMobileAsset, displayUrl)}
            </div>
          </div>
        `;
      } else {
        const challengeItems =
          section.items && section.items.length > 0
            ? section.items.slice(0, 3)
            : [
                "Concurrency & Scale: Managing high-throughput pipelines while guaranteeing low latency",
                "State Isolation: Preventing cross-module bleed with strict encapsulation boundaries",
                "Deterministic Output: Ensuring reproducible executions across diverse runtime environments",
              ];
        const parsedChallenges = parseInsightItems(challengeItems, ["git-branch", "layers", "code"]);
        sectionBodyHtml = `
          <div class="yt-editorial-layout">
            <div class="yt-editorial-header">
              <div class="yt-badge">ENGINEERING CHALLENGES & RESOLUTION</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 240) + "...")}</p>
            </div>
            <div class="yt-insights-grid">
              ${parsedChallenges
                .map(
                  (item) => `
                <div class="yt-insight-card">
                  <div class="yt-insight-icon">${IconEngine.getSvg(item.icon, { size: 32, color: "var(--swag-primary, #6366f1)" })}</div>
                  <div class="yt-insight-title">${escapeHtml(item.title)}</div>
                  <div class="yt-insight-desc">${escapeHtml(item.desc)}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `;
      }
      break;

    case "future":
      if (assetDataUrl || hasVideoAsset) {
        sectionBodyHtml = `
          <div class="yt-split-view">
            <div class="yt-left-panel">
              <div class="yt-badge">FUTURE ROADMAP</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 220) + "...")}</p>
            </div>
            <div class="yt-right-panel">
              ${renderMockupHtml(hasVideoAsset, assetDataUrl, isMobileAsset, displayUrl)}
            </div>
          </div>
        `;
      } else {
        const futureItems =
          section.items && section.items.length > 0
            ? section.items.slice(0, 3)
            : [
                "Ecosystem Expansion: Developing pluggable adapters for additional platforms and workflows",
                "Performance Optimization: Profiling and caching to further reduce execution overhead",
                "Community & Extensibility: Expanding documentation, examples, and contribution templates",
              ];
        const parsedFuture = parseInsightItems(futureItems, ["users", "globe", "database"]);
        sectionBodyHtml = `
          <div class="yt-editorial-layout">
            <div class="yt-editorial-header">
              <div class="yt-badge">FUTURE OUTLOOK & EXTENSIBILITY</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 240) + "...")}</p>
            </div>
            <div class="yt-insights-grid">
              ${parsedFuture
                .map(
                  (item) => `
                <div class="yt-insight-card">
                  <div class="yt-insight-icon">${IconEngine.getSvg(item.icon, { size: 32, color: "var(--swag-primary, #6366f1)" })}</div>
                  <div class="yt-insight-title">${escapeHtml(item.title)}</div>
                  <div class="yt-insight-desc">${escapeHtml(item.desc)}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `;
      }
      break;

    case "features":
      if (assetDataUrl || hasVideoAsset) {
        sectionBodyHtml = `
          <div class="yt-split-view">
            <div class="yt-left-panel">
              <div class="yt-badge">CORE CAPABILITIES</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 220) + "...")}</p>
            </div>
            <div class="yt-right-panel">
              ${renderMockupHtml(hasVideoAsset, assetDataUrl, isMobileAsset, displayUrl)}
            </div>
          </div>
        `;
      } else {
        const featureItems =
          section.items && section.items.length > 0
            ? section.items.slice(0, 4)
            : [
                "High Performance: Optimized execution paths delivering instant feedback loops",
                "Modular Design: Decoupled components that integrate cleanly with existing tooling",
                "Zero Configuration: Sensible defaults that work seamlessly out of the box",
                "Strict Reliability: Fully validated inputs and resilient error handling throughout",
              ];
        const parsedFeatures = parseInsightItems(featureItems, ["trending-up", "shield", "zap", "eye"]);
        sectionBodyHtml = `
          <div class="yt-editorial-layout">
            <div class="yt-editorial-header">
              <div class="yt-badge">CORE CAPABILITIES</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 240) + "...")}</p>
            </div>
            <div class="yt-features-grid">
              ${parsedFeatures
                .map(
                  (item) => `
                <div class="yt-feature-card">
                  <div class="yt-feature-icon">${IconEngine.getSvg(item.icon, { size: 30, color: "var(--swag-primary, #6366f1)" })}</div>
                  <div class="yt-feature-title">${escapeHtml(item.title)}</div>
                  <div class="yt-feature-desc">${escapeHtml(item.desc)}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `;
      }
      break;

    // --- 10 New YouTube Section Archetypes ---

    case "metrics": {
      const metricList = (section.metrics as Array<{ label: string; value: string | number }>) || [
        { label: "Active Nodes", value: "12,500+" },
        { label: "Avg Request Latency", value: "<8.2ms" },
        { label: "Throughput / Sec", value: "85,000" },
        { label: "WCAG Compliance", value: "100% AAA" },
      ];
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">QUANTIFIED IMPACT</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
            <div style="margin-top: 20px;">
              ${renderProgressRing(98, { size: 130, label: "98%", sublabel: "HEALTH" })}
            </div>
          </div>
          <div class="yt-right-panel">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; width: 100%;">
              ${metricList
                .map(
                  (m) => `
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--swag-border); border-radius: 16px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                  <div style="font-size: 42px; font-weight: 800; color: #38bdf8;">${escapeHtml(String(m.value))}</div>
                  <div style="font-size: 16px; font-weight: 600; color: var(--swag-muted-fg); margin-top: 6px;">${escapeHtml(m.label)}</div>
                  <div style="margin-top: 12px;">${renderSparkline([15, 30, 45, 60, 80, 95], { width: 140, height: 35, color: "#38bdf8" })}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      `;
      break;
    }

    case "comparison":
    case "comparison-table": {
      const rawTable =
        section.tableData ||
        section.data?.table ||
        section.data?.items ||
        section.data?.matrix ||
        section.data?.rows ||
        section.items;
      const compTableData = parseComparisonTableData(rawTable, brandKit.brandName || "This Project");
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">FEATURE COMPARISON</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
          </div>
          <div class="yt-right-panel">
            ${renderComparisonTable(compTableData, { ourName: brandKit.brandName || "This Project" })}
          </div>
        </div>
      `;
      break;
    }

    case "code-walkthrough": {
      const diffLines: DiffLine[] = (section.data?.diffLines as DiffLine[]) || [
        { type: "normal", content: "export async function executePipeline(config) {" },
        { type: "del", content: "-   const result = await legacySynchronousProcess(config);" },
        { type: "add", content: "+   const result = await optimizedAsyncEngine(config);" },
        { type: "add", content: "+   await cacheStore.set(result.id, result.payload);" },
        { type: "normal", content: "    return { success: true, data: result };" },
        { type: "normal", content: "}" },
      ];
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">CODE WALKTHROUGH</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
            ${
              section.items && section.items.length > 0
                ? `<div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                     ${section.items.map((it) => `<div style="font-size: 16px; color: var(--swag-fg);">• ${escapeHtml(it)}</div>`).join("")}
                   </div>`
                : ""
            }
          </div>
          <div class="yt-right-panel">
            ${renderCodeDiff(diffLines, { filename: (section.data?.filename as string) || "src/pipeline.ts" })}
          </div>
        </div>
      `;
      break;
    }

    case "architecture": {
      const services: ArchitectureService[] = (section.diagramData?.services as ArchitectureService[]) || [
        { id: "client", name: "Client / User", category: "client", x: 40, y: 150 },
        { id: "gateway", name: brandKit.brandName ? `${brandKit.brandName} API` : "Core Gateway", category: "gateway", x: 260, y: 150 },
        { id: "engine", name: "Processing Engine", category: "service", x: 480, y: 80 },
        { id: "storage", name: "State & Output", category: "service", x: 480, y: 220 },
      ];
      const connections: ArchitectureConnection[] = (section.diagramData?.connections as ArchitectureConnection[]) || [
        { from: "client", to: "gateway", label: "Request" },
        { from: "gateway", to: "engine", label: "Process" },
        { from: "gateway", to: "storage", label: "Persist" },
      ];
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">SYSTEM TOPOLOGY</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
          </div>
          <div class="yt-right-panel">
            ${renderArchitectureDiagram(services, connections, { width: 780, height: 380 })}
          </div>
        </div>
      `;
      break;
    }

    case "workflow": {
      const diagramObj = section.diagramData as Record<string, unknown> | undefined;
      const rawNodes = section.nodes || diagramObj?.nodes;
      if (rawNodes && Array.isArray(rawNodes) && rawNodes.length > 0) {
        const flowchartData = parseFlowchartData(
          diagramObj ?? { nodes: rawNodes, edges: section.edges },
        );
        sectionBodyHtml = `
          <div class="yt-split-view">
            <div class="yt-left-panel">
              <div class="yt-badge">DECISION FLOWCHART</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
            </div>
            <div class="yt-right-panel">
              ${renderFlowchart(flowchartData.nodes, flowchartData.edges, { width: 800, height: 380, title: section.title })}
            </div>
          </div>
        `;
        break;
      }

      const rawSteps =
        section.steps ||
        section.diagramData?.steps ||
        section.data?.steps ||
        section.items;
      const steps: PipelineStep[] = parsePipelineSteps(rawSteps);
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">WORKFLOW PIPELINE</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
          </div>
          <div class="yt-right-panel">
            ${renderPipeline(steps, { width: 820, height: 260 })}
          </div>
        </div>
      `;
      break;
    }

    case "decision-graph":
    case "flowchart": {
      const flowchartData = parseFlowchartData(
        section.diagramData ||
        section.data ||
        (section.nodes ? { nodes: section.nodes, edges: section.edges } : section.items),
      );
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">DECISION ARCHITECTURE</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
          </div>
          <div class="yt-right-panel">
            ${renderFlowchart(flowchartData.nodes, flowchartData.edges, { width: 820, height: 380, title: section.title })}
          </div>
        </div>
      `;
      break;
    }

    case "checklist": {
      const checkItems = parseChecklistItems(
        section.checklistData ||
        section.data?.checklist ||
        section.items,
      );
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">VERIFIED SPECIFICATION</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
          </div>
          <div class="yt-right-panel">
            ${renderChecklist(checkItems, { columns: checkItems.length > 5 ? 2 : 1 })}
          </div>
        </div>
      `;
      break;
    }

    case "bullet-points": {
      const bulletItems = parseBulletItems(
        section.items ||
        section.data?.bullets ||
        section.data?.items,
      );
      sectionBodyHtml = `
        <div class="yt-editorial-layout">
          <div class="yt-editorial-header">
            <div class="yt-badge">KEY HIGHLIGHTS</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 220) + "...")}</p>
          </div>
          <div style="width: 100%; max-width: 1200px; margin: 0 auto;">
            ${renderBulletPoints(bulletItems, { columns: bulletItems.length > 4 ? 2 : 1 })}
          </div>
        </div>
      `;
      break;
    }

    case "testimonials": {
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">ENGINEERING PRAISE</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
            <div style="margin-top: 20px;">
              ${renderStarRating({ rating: 5.0, reviewCount: "2,400+" })}
            </div>
          </div>
          <div class="yt-right-panel">
            ${renderTestimonial({
              quote: (section.data?.quote as string) || "Exceptional architecture and seamless developer experience. It solved our pipeline bottlenecks immediately.",
              author: (section.data?.author as string) || "Verified Engineer",
              role: (section.data?.role as string) || "Staff Systems Architect",
              company: (section.data?.company as string) || "Engineering Community",
            })}
          </div>
        </div>
      `;
      break;
    }

    case "timeline": {
      const items = section.items && section.items.length > 0 ? section.items : [
        "Phase 1: Architecture Planning & Core Engine",
        "Phase 2: High-Throughput Processing Pipeline",
        "Phase 3: Automated Validation & Strict Testing",
        "Phase 4: Production Release & Ecosystem Integration",
      ];
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">ROADMAP & MILESTONES</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
          </div>
          <div class="yt-right-panel">
            <div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
              ${items
                .map(
                  (it, idx) => `
                <div style="display: flex; align-items: center; gap: 18px; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--swag-border); border-radius: 12px; padding: 18px 24px;">
                  <span style="font-size: 13px; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 4px 10px; border-radius: 6px;">0${idx + 1}</span>
                  <span style="font-size: 18px; font-weight: 600; color: #f8fafc;">${escapeHtml(it)}</span>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      `;
      break;
    }

    case "benchmarks": {
      const benchData: BarChartItem[] = (section.chartData as unknown as BarChartItem[]) || [
        { label: brandKit.brandName || "Optimized Build", value: 380, formattedValue: "380 ops/s" },
        { label: "Baseline Engine", value: 95, formattedValue: "95 ops/s" },
        { label: "Legacy Setup", value: 18, formattedValue: "18 ops/s" },
      ];
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">BENCHMARK AUDIT</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
          </div>
          <div class="yt-right-panel">
            ${renderBarChart(benchData, { width: 780, height: 380, layout: "horizontal", title: "Throughput (Operations / sec)" })}
          </div>
        </div>
      `;
      break;
    }

    case "git-history": {
      const commits: GitCommit[] = (section.data?.commits as GitCommit[]) || [
        { hash: "a8f3c12", message: "feat: core architecture & modular pipeline", tag: "v1.0.0" },
        { hash: "7b10e45", message: "perf: concurrent task processing & caching", branch: "main" },
        { hash: "2c94d67", message: "fix: strict contract validation & error handling", branch: "main" },
      ];
      sectionBodyHtml = `
        <div class="yt-split-view">
          <div class="yt-left-panel">
            <div class="yt-badge">OPEN SOURCE EVOLUTION</div>
            <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
            <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 180) + "...")}</p>
          </div>
          <div class="yt-right-panel">
            ${renderGitGraph(commits, { width: 760, height: 260 })}
          </div>
        </div>
      `;
      break;
    }

    case "call-to-action": {
      sectionBodyHtml = `
        <div class="yt-outro-card">
          <div class="yt-badge">GET STARTED NOW</div>
          <h1 class="yt-hero-title">${escapeHtml(section.title || "Star & Fork on GitHub")}</h1>
          <p class="yt-desc">${escapeHtml(section.onScreenText || "Scan the QR code or visit the repository link below to get started.")}</p>
          <div style="margin-top: 24px;">
            ${renderQRCode(displayUrl, { size: 180, label: "SCAN TO VIEW CODE" })}
          </div>
        </div>
      `;
      break;
    }

    case "demo":
    default:
      if (assetDataUrl || hasVideoAsset) {
        sectionBodyHtml = `
          <div class="yt-split-view">
            <div class="yt-left-panel">
              <div class="yt-badge">${escapeHtml(section.section.toUpperCase())}</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              ${
                section.onScreenText
                  ? `<p class="yt-desc">${escapeHtml(section.onScreenText)}</p>`
                  : `<p class="yt-desc">${escapeHtml(section.narrationText.slice(0, 200))}...</p>`
              }
            </div>
            <div class="yt-right-panel">
              ${renderMockupHtml(hasVideoAsset, assetDataUrl, isMobileAsset, displayUrl)}
            </div>
          </div>
        `;
      } else {
        const fallbackItems =
          section.items && section.items.length > 0
            ? section.items.slice(0, 3)
            : [
                "High-Throughput Processing: Engineered for real-time responsiveness and scale",
                "Contract Enforcement: Strict runtime verification ensuring predictable results",
                "Extensible Tooling: Seamless integration with modern development workflows",
              ];
        const parsed = parseInsightItems(fallbackItems, ["zap", "cpu", "check-circle"]);
        sectionBodyHtml = `
          <div class="yt-editorial-layout">
            <div class="yt-editorial-header">
              <div class="yt-badge">${escapeHtml(section.section.toUpperCase())}</div>
              <h2 class="yt-section-title">${escapeHtml(section.title)}</h2>
              <p class="yt-desc">${escapeHtml(section.onScreenText || section.narrationText.slice(0, 240) + "...")}</p>
            </div>
            <div class="yt-insights-grid">
              ${parsed
                .map(
                  (item) => `
                <div class="yt-insight-card">
                  <div class="yt-insight-icon">${IconEngine.getSvg(item.icon, { size: 32, color: "var(--swag-primary, #6366f1)" })}</div>
                  <div class="yt-insight-title">${escapeHtml(item.title)}</div>
                  <div class="yt-insight-desc">${escapeHtml(item.desc)}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `;
      }
      break;

    case "outro":
      sectionBodyHtml = `
        <div class="yt-outro-card">
          ${logoDataUrl ? `<img src="${logoDataUrl}" class="yt-outro-logo" />` : `<div class="yt-outro-symbol">${IconEngine.getSvg("zap", { size: 84, color: "var(--swag-primary, #6366f1)" })}</div>`}
          <h1 class="yt-hero-title">${escapeHtml(section.title || "Thanks for Watching!")}</h1>
          <p class="yt-desc">${escapeHtml(section.onScreenText || brandKit.defaultCTA || "Find all source code in the description below.")}</p>
          <div class="yt-social-row">
            ${brandKit.socials
              .map(
                (s) => `
              <div class="yt-social-chip">
                <span class="social-icon">${IconEngine.getSvg(s.platform, { size: 22 })}</span>
                <span class="platform-label">${s.platform}</span>
                <span class="handle-label">${escapeHtml(s.handle)}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
      break;
  }

  // Lower third overlay (suppressed on outro to avoid overlapping outro card)
  const lowerThirdHtml =
    section.lowerThird && section.section !== "outro"
      ? `
    <div class="yt-lower-third">
      <div class="lt-bar"></div>
      <div class="lt-text">${escapeHtml(section.lowerThird)}</div>
    </div>
  `
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Section ${sectionIndex + 1}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

    ${cssVars}

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background-color: var(--swag-bg);
      color: var(--swag-fg);
      font-family: var(--swag-font-body);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px 100px;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient atmospheric background glow */
    body::before {
      content: "";
      position: absolute;
      top: -10%;
      right: -10%;
      width: 900px;
      height: 900px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--swag-primary) 0%, transparent 70%);
      opacity: 0.16;
      filter: blur(100px);
      z-index: 0;
    }

    body::after {
      content: "";
      position: absolute;
      bottom: -15%;
      left: -10%;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--swag-secondary) 0%, transparent 70%);
      opacity: 0.14;
      filter: blur(100px);
      z-index: 0;
    }

    /* Header */
    .yt-header {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .yt-brand-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .yt-header-logo {
      height: 48px;
      max-width: 140px;
      object-fit: contain;
    }

    .yt-brand-logo {
      font-size: 24px;
      font-weight: 800;
      color: var(--swag-fg);
      letter-spacing: -0.02em;
    }

    .yt-section-indicator {
      font-size: 18px;
      font-weight: 600;
      color: var(--swag-muted-fg);
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      padding: 8px 20px;
      border-radius: 30px;
    }

    /* Content Area */
    .yt-content {
      position: relative;
      z-index: 10;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 40px 0;
    }

    .yt-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: var(--swag-primary);
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      width: fit-content;
      margin-bottom: 16px;
    }

    .pulsing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--swag-primary);
      box-shadow: 0 0 10px var(--swag-primary);
    }

    .yt-hero-title {
      font-size: 64px;
      font-weight: 850;
      line-height: 1.15;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .yt-section-title {
      font-size: 48px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    .yt-desc {
      font-size: 26px;
      color: var(--swag-muted-fg);
      line-height: 1.5;
      max-width: 750px;
      margin-top: 16px;
    }

    /* Intro Grid */
    .yt-intro-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 60px;
    }

    /* Split View */
    .yt-split-view {
      display: grid;
      grid-template-columns: 45% 55%;
      align-items: center;
      gap: 60px;
    }

    /* Browser Mockup */
    .yt-browser-mockup {
      width: 100%;
      border-radius: 20px;
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .mockup-header {
      height: 48px;
      background: rgba(15, 23, 42, 0.85);
      border-bottom: 1px solid var(--swag-border);
      display: flex;
      align-items: center;
      padding: 0 18px;
      gap: 10px;
      flex-shrink: 0;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #f59e0b; }
    .dot.green { background: #10b981; }

    .mockup-url {
      margin-left: 12px;
      font-size: 14px;
      color: var(--swag-muted-fg);
      font-family: var(--swag-font-code);
    }

    .mockup-viewport {
      width: 100%;
      height: 520px;
      background: #060911;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    .mockup-viewport img {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      object-position: center;
      display: block;
    }

    .mockup-video-target {
      width: 100%;
      height: 100%;
      background: #000;
    }

    /* Phone Mockup (for portrait mobile assets) */
    .yt-phone-frame {
      width: 320px;
      height: 560px;
      margin: 0 auto;
      border-radius: 40px;
      background: #090d16;
      border: 4px solid rgba(255, 255, 255, 0.16);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .yt-phone-island {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 90px;
      height: 22px;
      background: #000;
      border-radius: 12px;
      z-index: 10;
    }

    .yt-phone-viewport {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }

    .yt-phone-viewport img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    /* Editorial & Insights Layout */
    .yt-editorial-layout {
      display: flex;
      flex-direction: column;
      gap: 32px;
      width: 100%;
      max-width: 1650px;
      margin: 0 auto;
    }

    .yt-editorial-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .yt-insights-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
      margin-top: 12px;
    }

    .yt-insight-card {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 20px;
      padding: 36px 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    }

    .yt-insight-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 20px 20px 0 0;
      background: linear-gradient(90deg, var(--swag-primary), var(--swag-accent, #8b5cf6));
      opacity: 0.85;
    }

    .yt-insight-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: rgba(99, 102, 241, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .yt-insight-title {
      font-size: 26px;
      font-weight: 750;
      color: var(--swag-fg);
      line-height: 1.25;
    }

    .yt-insight-desc {
      font-size: 20px;
      color: var(--swag-muted-fg);
      line-height: 1.5;
    }

    /* Pipeline Step Grid */
    .yt-pipeline-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-top: 16px;
    }

    .yt-pipeline-card {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 20px;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
    }

    .yt-pipeline-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 20px 20px 0 0;
      background: linear-gradient(90deg, var(--swag-primary), var(--swag-secondary, #f59e0b));
      opacity: 0.8;
    }

    .yt-step-badge {
      font-size: 14px;
      font-weight: 800;
      font-family: var(--swag-font-code);
      color: var(--swag-primary);
      background: rgba(99, 102, 241, 0.12);
      padding: 4px 12px;
      border-radius: 8px;
      width: fit-content;
      letter-spacing: 0.05em;
    }

    .yt-pipeline-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .yt-pipeline-title {
      font-size: 22px;
      font-weight: 750;
      color: var(--swag-fg);
      line-height: 1.3;
    }

    .yt-pipeline-desc {
      font-size: 18px;
      color: var(--swag-muted-fg);
      line-height: 1.45;
    }

    /* Features Grid */
    .yt-features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-top: 14px;
    }

    .yt-feature-card {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 20px;
      padding: 30px 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
    }

    .yt-feature-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 20px 20px 0 0;
      background: linear-gradient(90deg, var(--swag-primary), var(--swag-secondary, #f59e0b));
      opacity: 0.8;
    }

    .yt-feature-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .yt-feature-title {
      font-size: 24px;
      font-weight: 750;
      color: var(--swag-fg);
    }

    .yt-feature-desc {
      font-size: 19px;
      color: var(--swag-muted-fg);
      line-height: 1.45;
    }

    /* Intro Highlight Cards */
    .yt-intro-highlights {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .intro-metric-card {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 18px;
      padding: 26px 32px;
      display: flex;
      align-items: center;
      gap: 24px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
    }

    .metric-num {
      font-size: 40px;
      font-weight: 850;
      color: var(--swag-primary);
      font-family: var(--swag-font-code);
      min-width: 90px;
    }

    .metric-label {
      font-size: 22px;
      font-weight: 600;
      color: var(--swag-fg);
    }

    /* Tech Grid */
    .yt-tech-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
      margin-top: 36px;
    }

    .yt-tech-card {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 18px;
      padding: 32px 36px;
      display: flex;
      align-items: flex-start;
      gap: 24px;
    }

    .tech-icon-box {
      font-family: var(--swag-font-code);
      background: rgba(99, 102, 241, 0.15);
      padding: 16px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tech-info h3 {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .tech-info p {
      font-size: 20px;
      color: var(--swag-muted-fg);
      line-height: 1.4;
    }

    /* Outro */
    .yt-outro-card {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      border-radius: 28px;
      padding: 70px 80px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
    }

    .yt-outro-symbol {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .yt-outro-logo {
      height: 90px;
      width: auto;
      object-fit: contain;
    }

    .yt-social-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      margin-top: 16px;
    }

    .yt-social-chip {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--swag-border);
      padding: 12px 28px;
      border-radius: 40px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
    }

    .social-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .platform-label {
      color: var(--swag-primary);
      font-weight: 700;
      text-transform: capitalize;
    }

    .handle-label {
      color: var(--swag-fg);
      font-weight: 600;
    }

    /* Lower Third */
    .yt-lower-third {
      position: absolute;
      bottom: 140px;
      left: 100px;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid var(--swag-border);
      padding: 14px 28px;
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
    }

    .lt-bar {
      width: 4px;
      height: 28px;
      background: var(--swag-primary);
      border-radius: 2px;
    }

    .lt-text {
      font-size: 20px;
      font-weight: 600;
      color: var(--swag-fg);
    }

    /* Footer */
    .yt-footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      color: var(--swag-muted-fg);
      font-size: 18px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="yt-header">
    <div class="yt-brand-header">
      ${logoDataUrl ? `<img src="${logoDataUrl}" class="yt-header-logo" alt="Logo" />` : ""}
      <div class="yt-brand-logo">${brandKit.brandName ? escapeHtml(brandKit.brandName) : "PROJECT SHOWCASE"}</div>
    </div>
    <div class="yt-section-indicator">Part ${sectionIndex + 1} of ${totalSections}</div>
  </div>

  <!-- Content -->
  <div class="yt-content">
    ${sectionBodyHtml}
  </div>

  <!-- Lower Third -->
  ${lowerThirdHtml}

  <!-- Footer -->
  <div class="yt-footer">
    <div>${!lowerThirdHtml && section.section !== "outro" && brandKit.socials[0]?.handle ? escapeHtml(brandKit.socials[0].handle) : ""}</div>
    <div>${nextSectionTitle ? "Next: " + escapeHtml(nextSectionTitle) : section.section !== "outro" ? escapeHtml(brandKit.defaultCTA) : ""}</div>
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

function renderMockupHtml(
  hasVideoAsset: boolean,
  assetDataUrl: string | undefined,
  isMobileAsset: boolean,
  displayUrl: string,
): string {
  if (isMobileAsset && assetDataUrl && !hasVideoAsset) {
    return `
      <div class="yt-phone-frame">
        <div class="yt-phone-island"></div>
        <div class="yt-phone-viewport">
          <img src="${assetDataUrl}" alt="Display" />
        </div>
      </div>
    `;
  }
  return `
    <div class="yt-browser-mockup">
      <div class="mockup-header">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="mockup-url">${escapeHtml(displayUrl)}</span>
      </div>
      <div class="mockup-viewport">
        ${
          hasVideoAsset
            ? `<div class="mockup-video-target"></div>`
            : `<img src="${assetDataUrl}" alt="Display" />`
        }
      </div>
    </div>
  `;
}

function parseInsightItems(
  items: (string | { name: string; desc: string })[],
  defaultIcons: string[],
): { title: string; desc: string; icon: string }[] {
  return items.map((it, idx) => {
    let title = "";
    let desc = "";
    if (typeof it === "string") {
      const colonIdx = it.indexOf(":");
      if (colonIdx > 0) {
        title = it.slice(0, colonIdx).trim();
        desc = it.slice(colonIdx + 1).trim();
      } else {
        const parenMatch = it.match(/^(.*?)\s*\((.*?)\)$/);
        if (parenMatch) {
          title = parenMatch[1].trim();
          desc = parenMatch[2].trim();
        } else {
          title = it.trim();
          desc = "Core architectural insight and operational capability";
        }
      }
    } else {
      title = it.name;
      desc = it.desc;
    }
    const icon = defaultIcons[idx % defaultIcons.length];
    return { title, desc, icon };
  });
}

function parseStepItems(
  items: (string | { name: string; desc: string })[],
  defaultIcons: string[],
): { badge: string; title: string; desc: string; icon: string }[] {
  return items.map((it, idx) => {
    let rawTitle = "";
    let desc = "";
    if (typeof it === "string") {
      const colonIdx = it.indexOf(":");
      if (colonIdx > 0) {
        rawTitle = it.slice(0, colonIdx).trim();
        desc = it.slice(colonIdx + 1).trim();
      } else {
        rawTitle = it.trim();
        desc = "Operational pipeline execution stage";
      }
    } else {
      rawTitle = it.name;
      desc = it.desc;
    }
    let badge = `STEP 0${idx + 1}`;
    let title = rawTitle;
    const match = rawTitle.match(/^(\d+[\s\w]*)\s*[:\-]\s*(.*)$/);
    if (match) {
      badge = match[1].trim().toUpperCase();
      title = match[2].trim();
    }
    const icon = defaultIcons[idx % defaultIcons.length];
    return { badge, title, desc, icon };
  });
}
