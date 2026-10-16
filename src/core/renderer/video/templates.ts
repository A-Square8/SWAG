/**
 * Vertical 9:16 (1080x1920) Reel scene HTML templates.
 * Respects Instagram Reels UI safe zones while ensuring screenshots,
 * charts, code terminals, and diagrams occupy prime visual attention.
 */

import type { ReelScene, Theme, BrandKit } from "../../../types/index.js";
import { tokensToCssVars } from "../../theme/tokens.js";
import { IconEngine } from "../../icons/index.js";
import {
  renderBarChart,
  renderPieChart,
  renderRadarChart,
  renderProgressRing,
  type BarChartItem,
  type PieChartItem,
} from "../../charts/index.js";
import {
  renderPipeline,
  parsePipelineSteps,
  renderFlowchart,
  parseFlowchartData,
  type PipelineStep,
} from "../../diagrams/index.js";
import {
  renderTerminal,
} from "../../widgets/dev-widgets.js";
import {
  renderTestimonial,
  renderStarRating,
  renderComparisonTable,
  parseComparisonTableData,
  renderChecklist,
  parseChecklistItems,
  renderBulletPoints,
  parseBulletItems,
} from "../../widgets/social-widgets.js";

export interface RenderReelSceneHtmlOptions {
  scene: ReelScene;
  sceneIndex: number;
  totalScenes: number;
  theme: Theme;
  brandKit: BrandKit;
  assetDataUrl?: string;
  logoDataUrl?: string;
  isMobileAsset?: boolean;
  projectTechStack?: string[];
}

export function generateReelSceneHtml(options: RenderReelSceneHtmlOptions): string {
  const {
    scene,
    sceneIndex,
    totalScenes,
    theme,
    brandKit,
    assetDataUrl,
    logoDataUrl,
    isMobileAsset = false,
    projectTechStack,
  } = options;

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

  let sceneBodyHtml = "";

  switch (scene.type) {
    case "hook":
      sceneBodyHtml = `
        <div class="reel-hook">
          <div class="reel-header-block">
            <div class="reel-badge">
              <span class="pulsing-dot"></span>
              <span>${brandKit.brandName ? escapeHtml(brandKit.brandName) : "DEV SHOWCASE"}</span>
            </div>
            <h1 class="reel-hero-title">${escapeHtml(scene.content.text || "Wait Until You See This...")}</h1>
          </div>
          ${
            assetDataUrl
              ? isMobileAsset
                ? `
            <div class="reel-mobile-mockup">
              <div class="mobile-island"><span class="mobile-camera"></span></div>
              <div class="mobile-viewport">
                <img src="${assetDataUrl}" alt="Preview" />
              </div>
            </div>
          `
                : `
            <div class="reel-mockup">
              <div class="mockup-header">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="mockup-url">${escapeHtml(displayUrl)}</span>
              </div>
              <div class="mockup-viewport">
                <img src="${assetDataUrl}" alt="Preview" />
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;
      break;

    case "feature":
    case "demo":
      sceneBodyHtml = `
        <div class="reel-feature">
          <div class="reel-header-block">
            <div class="reel-badge">${scene.type === "demo" ? "LIVE DEMO" : "FEATURE SPOTLIGHT"}</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Built for Pure Speed")}</h2>
          </div>
          ${
            isMobileAsset && assetDataUrl
              ? `
            <div class="reel-mobile-mockup">
              <div class="mobile-island"><span class="mobile-camera"></span></div>
              <div class="mobile-viewport">
                <img src="${assetDataUrl}" alt="Demo" />
              </div>
            </div>
          `
              : `
            <div class="reel-mockup">
              <div class="mockup-header">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="mockup-url">${escapeHtml(displayUrl)}</span>
              </div>
              <div class="mockup-viewport">
                ${
                  assetDataUrl
                    ? `<img src="${assetDataUrl}" alt="Demo" />`
                    : `<div class="placeholder-box">Live Interactive Demo</div>`
                }
              </div>
            </div>
          `
          }
        </div>
      `;
      break;

    case "tech": {
      const rawTechItems =
        scene.content.items && scene.content.items.length > 0
          ? scene.content.items
          : projectTechStack && projectTechStack.length > 0
            ? projectTechStack
            : ["TypeScript", "Node.js", "Playwright", "FastAPI", "Vector Engine"];

      sceneBodyHtml = `
        <div class="reel-tech">
          <div class="reel-header-block">
            <div class="reel-badge">TECH STACK & ARCHITECTURE</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "The Engineering Behind It")}</h2>
          </div>
          ${
            assetDataUrl
              ? `
            <div class="reel-mockup">
              <div class="mockup-header">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="mockup-url">${escapeHtml(displayUrl)}</span>
              </div>
              <div class="mockup-viewport">
                <img src="${assetDataUrl}" alt="Stack" />
              </div>
            </div>
          `
              : `
            <div class="tech-pill-list">
              ${rawTechItems
                .slice(0, 5)
                .map(
                  (tech) => `
                <div class="tech-pill">
                  <span class="tech-pill-icon">${IconEngine.getSvg(tech.split(/[\s(&:]+/)[0], { size: 36 })}</span>
                  <span>${escapeHtml(tech)}</span>
                </div>
              `,
                )
                .join("")}
            </div>
          `
          }
        </div>
      `;
      break;
    }

    // --- 7 New Reel Scene Archetypes ---

    case "problem":
      sceneBodyHtml = `
        <div class="reel-problem">
          <div class="reel-header-block">
            <div class="reel-badge problem-badge">⚠️ CRITICAL BOTTLENECK</div>
            <h1 class="reel-hero-title">${escapeHtml(scene.content.text || "The Problem We Had To Solve")}</h1>
          </div>
          <div class="problem-card">
            <div class="problem-icon">🛑</div>
            <p class="problem-statement">
              ${escapeHtml(scene.content.narrationText || "Traditional setups take hours to configure and break constantly under high loads.")}
            </p>
          </div>
        </div>
      `;
      break;

    case "stats": {
      const metricsList = (scene.content.metrics as Array<{ label: string; value: string | number }>) || [
        { label: "Throughput", value: "10,000 req/s" },
        { label: "Latency", value: "<12ms" },
        { label: "Efficiency", value: "+400%" },
      ];
      sceneBodyHtml = `
        <div class="reel-stats">
          <div class="reel-header-block">
            <div class="reel-badge">MEASURED RESULTS</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Unmatched Performance")}</h2>
          </div>
          <div class="reel-stats-cards">
            ${metricsList
              .map(
                (m) => `
              <div class="stat-card">
                <div class="stat-big-val">${escapeHtml(String(m.value))}</div>
                <div class="stat-lbl">${escapeHtml(m.label)}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          <div class="gauge-wrap">
            ${renderProgressRing(99, { size: 140, label: "99%", sublabel: "HEALTH" })}
          </div>
        </div>
      `;
      break;
    }

    case "before-after":
      sceneBodyHtml = `
        <div class="reel-before-after">
          <div class="reel-header-block">
            <div class="reel-badge">TRANSFORMATION</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Before vs After")}</h2>
          </div>
          <div class="reel-split-cards">
            <div class="reel-half-card before">
              <span class="half-badge red">BEFORE</span>
              <p class="half-desc">${escapeHtml(scene.content.beforeText || "Hours of manual configuration and fragile brittle scripts.")}</p>
            </div>
            <div class="reel-half-card after">
              <span class="half-badge green">AFTER</span>
              <p class="half-desc">${escapeHtml(scene.content.afterText || "One command automation with instant verified output.")}</p>
            </div>
          </div>
        </div>
      `;
      break;

    case "pipeline": {
      const rawSteps =
        scene.content.steps ||
        scene.content.diagramData?.steps ||
        scene.content.items ||
        scene.content.data?.steps;
      const steps: PipelineStep[] = parsePipelineSteps(rawSteps);
      sceneBodyHtml = `
        <div class="reel-pipeline">
          <div class="reel-header-block">
            <div class="reel-badge">AUTOMATED FLOW</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "How The Pipeline Works")}</h2>
          </div>
          <div class="reel-pipeline-container">
            ${renderPipeline(steps, { width: 900, height: 220 })}
          </div>
        </div>
      `;
      break;
    }

    case "comparison":
    case "comparison-table": {
      const rawTable =
        scene.content.tableData ||
        scene.content.data?.table ||
        scene.content.data?.items ||
        scene.content.data?.matrix ||
        scene.content.items;
      const compTableData = parseComparisonTableData(rawTable, brandKit.brandName || "This Project");
      sceneBodyHtml = `
        <div class="reel-comparison">
          <div class="reel-header-block">
            <div class="reel-badge">FEATURE COMPARISON</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Why We Stand Out")}</h2>
          </div>
          <div class="reel-comp-container" style="padding: 0 40px; margin-top: 30px;">
            ${renderComparisonTable(compTableData, { ourName: brandKit.brandName || "This Project" })}
          </div>
        </div>
      `;
      break;
    }

    case "checklist": {
      const checkItems = parseChecklistItems(
        scene.content.checklistData ||
        scene.content.data?.checklist ||
        scene.content.items,
      );
      sceneBodyHtml = `
        <div class="reel-checklist">
          <div class="reel-header-block">
            <div class="reel-badge">VERIFIED SPECIFICATION</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Core Capabilities")}</h2>
          </div>
          <div class="reel-checklist-container" style="padding: 0 40px; margin-top: 30px;">
            ${renderChecklist(checkItems, { columns: 1 })}
          </div>
        </div>
      `;
      break;
    }

    case "bullet-points": {
      const bulletItems = parseBulletItems(
        scene.content.items ||
        scene.content.data?.bullets ||
        scene.content.data?.items,
      );
      sceneBodyHtml = `
        <div class="reel-bullets">
          <div class="reel-header-block">
            <div class="reel-badge">KEY HIGHLIGHTS</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Architecture Highlights")}</h2>
          </div>
          <div class="reel-bullets-container" style="padding: 0 40px; margin-top: 30px;">
            ${renderBulletPoints(bulletItems, { columns: 1 })}
          </div>
        </div>
      `;
      break;
    }

    case "decision-graph":
    case "flowchart": {
      const flowchartData = parseFlowchartData(
        scene.content.diagramData ||
        scene.content.data ||
        (scene.content.nodes ? { nodes: scene.content.nodes, edges: scene.content.edges } : scene.content.items),
      );
      sceneBodyHtml = `
        <div class="reel-flowchart">
          <div class="reel-header-block">
            <div class="reel-badge">DECISION FLOW</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Execution Logic")}</h2>
          </div>
          <div class="reel-flowchart-container" style="padding: 0 20px; margin-top: 30px;">
            ${renderFlowchart(flowchartData.nodes, flowchartData.edges, { width: 920, height: 420, title: scene.content.text })}
          </div>
        </div>
      `;
      break;
    }

    case "code": {
      const termLines = (scene.content.command ? [scene.content.command] : null) || [
        "$ npm run build",
        "✓ Modules compiled and verified (0.4s)",
        "✓ Optimized bundle generated",
        "✓ Ready for production",
      ];
      sceneBodyHtml = `
        <div class="reel-code">
          <div class="reel-header-block">
            <div class="reel-badge">LIVE TERMINAL</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "One-Line Execution")}</h2>
          </div>
          <div class="reel-term-container">
            ${renderTerminal(termLines, { title: scene.content.text || "terminal — production" })}
          </div>
        </div>
      `;
      break;
    }

    case "testimonial":
      sceneBodyHtml = `
        <div class="reel-testimonial">
          <div class="reel-header-block">
            <div class="reel-badge">COMMUNITY REACTION</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Loved by Developers")}</h2>
          </div>
          <div class="reel-quote-wrap">
            ${renderTestimonial({
              quote: scene.content.quote || "The fastest and most visually stunning content workflow I've ever used.",
              author: scene.content.author || "Dev Community",
              role: scene.content.role || "Lead Architect",
            })}
            <div class="reel-stars-row">
              ${renderStarRating({ rating: 5.0, reviewCount: "500+" })}
            </div>
          </div>
        </div>
      `;
      break;

    case "chart": {
      const chartItems: BarChartItem[] = (scene.content.chartData as unknown as BarChartItem[]) || [
        { label: brandKit.brandName || "Optimized", value: 95 },
        { label: "Alternative B", value: 35 },
        { label: "Manual Method", value: 20 },
      ];
      sceneBodyHtml = `
        <div class="reel-chart">
          <div class="reel-header-block">
            <div class="reel-badge">BENCHMARK DATA</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Performance Surge")}</h2>
          </div>
          <div class="reel-chart-box">
            ${renderBarChart(chartItems, { width: 860, height: 420, layout: "horizontal" })}
          </div>
        </div>
      `;
      break;
    }

    case "outro":
      sceneBodyHtml = `
        <div class="reel-outro">
          ${logoDataUrl ? `<img src="${logoDataUrl}" class="outro-logo" alt="Logo" />` : `<div class="outro-icon">${IconEngine.getSvg("zap", { size: 96, color: "var(--swag-primary, #6366f1)" })}</div>`}
          <h1 class="reel-hero-title">${escapeHtml(scene.content.text || (brandKit.brandName ? `Explore ${brandKit.brandName}` : "Build Yours Today"))}</h1>
          <p class="reel-desc">${escapeHtml(brandKit.defaultCTA || "Link in bio to view full code & documentation")}</p>
          <div class="reel-socials-row">
            ${brandKit.socials.slice(0, 3).map((s) => `
              <div class="reel-handle">
                <span class="handle-icon">${IconEngine.getSvg(s.platform, { size: 24 })}</span>
                <span>${escapeHtml(s.handle)}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
      break;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reel Scene ${sceneIndex + 1}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

    ${cssVars}

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background-color: var(--swag-bg);
      color: var(--swag-fg);
      font-family: var(--swag-font-body);
      position: relative;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient glow elements */
    body::before {
      content: "";
      position: absolute;
      top: 5%;
      right: -20%;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--swag-primary) 0%, transparent 70%);
      opacity: 0.22;
      filter: blur(90px);
      z-index: 0;
      pointer-events: none;
    }

    body::after {
      content: "";
      position: absolute;
      bottom: 10%;
      left: -20%;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--swag-secondary) 0%, transparent 70%);
      opacity: 0.18;
      filter: blur(90px);
      z-index: 0;
      pointer-events: none;
    }

    /* Safe zone layout */
    .safe-zone-content {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      padding-top: 220px;
      padding-bottom: 380px;
      padding-left: 54px;
      padding-right: 54px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 32px;
    }

    .reel-header-block {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .reel-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: var(--swag-primary);
      padding: 10px 22px;
      border-radius: 30px;
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .problem-badge {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      color: #ef4444;
    }

    .pulsing-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--swag-primary);
      box-shadow: 0 0 12px var(--swag-primary);
    }

    .reel-hero-title {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: var(--swag-fg);
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .reel-sub-title {
      font-size: 52px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: var(--swag-fg);
    }

    /* Mockup */
    .reel-mockup {
      width: 100%;
      height: 1180px;
      border-radius: 24px;
      background: var(--swag-card);
      border: 1.5px solid var(--swag-border);
      box-shadow: 0 35px 80px rgba(0, 0, 0, 0.55);
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
      padding: 0 20px;
      gap: 10px;
    }

    .mockup-header .dot {
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
      flex: 1;
      width: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #020617;
    }

    .mockup-viewport img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    /* Mobile Mockup */
    .reel-mobile-mockup {
      width: 440px;
      height: 940px;
      margin: 0 auto;
      border-radius: 54px;
      background: #000;
      border: 12px solid #1e293b;
      box-shadow: 0 35px 80px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      position: relative;
    }

    .mobile-island {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      width: 110px;
      height: 28px;
      background: #000;
      border-radius: 20px;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 14px;
    }

    .mobile-camera {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #0284c7;
    }

    .mobile-viewport {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #020617;
    }

    .mobile-viewport img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Tech pills */
    .tech-pill-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;
    }

    .tech-pill {
      background: var(--swag-card);
      border: 1.5px solid var(--swag-border);
      border-radius: 20px;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      gap: 24px;
      font-size: 30px;
      font-weight: 700;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
    }

    /* Problem Card */
    .problem-card {
      background: rgba(239, 68, 68, 0.08);
      border: 1.5px solid rgba(239, 68, 68, 0.35);
      border-radius: 24px;
      padding: 48px 36px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      margin-top: 40px;
    }

    .problem-icon { font-size: 72px; }
    .problem-statement { font-size: 34px; line-height: 1.5; color: #f8fafc; font-weight: 600; }

    /* Stats Grid */
    .reel-stats-cards {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 10px;
    }

    .stat-card {
      background: var(--swag-card);
      border: 1.5px solid var(--swag-border);
      border-radius: 20px;
      padding: 28px 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-big-val { font-size: 48px; font-weight: 900; color: #38bdf8; }
    .stat-lbl { font-size: 24px; font-weight: 600; color: var(--swag-muted-fg); }
    .gauge-wrap { display: flex; justify-content: center; margin-top: 20px; }

    /* Before-After Split */
    .reel-split-cards {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 20px;
    }

    .reel-half-card {
      padding: 36px 32px;
      border-radius: 20px;
      background: var(--swag-card);
      border: 1.5px solid var(--swag-border);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .reel-half-card.before { border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); }
    .reel-half-card.after { border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.05); }

    .half-badge { font-size: 14px; font-weight: 800; padding: 4px 12px; border-radius: 6px; width: fit-content; }
    .half-badge.red { background: #ef4444; color: #fff; }
    .half-badge.green { background: #10b981; color: #fff; }
    .half-desc { font-size: 24px; line-height: 1.4; color: var(--swag-fg); font-weight: 600; }

    /* Containers for widgets/charts in reel */
    .reel-pipeline-container, .reel-term-container, .reel-quote-wrap, .reel-chart-box {
      margin-top: 20px;
    }

    .reel-stars-row {
      margin-top: 16px;
      display: flex;
      justify-content: center;
    }

    /* Outro */
    .reel-outro {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 28px;
      height: 100%;
    }

    .outro-icon {
      margin-bottom: 8px;
    }

    .outro-logo {
      height: 120px;
      width: auto;
      object-fit: contain;
    }

    .reel-desc {
      font-size: 28px;
      line-height: 1.5;
      color: var(--swag-muted-fg);
      max-width: 800px;
    }

    .reel-socials-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      max-width: 600px;
      margin-top: 24px;
    }

    .reel-handle {
      background: var(--swag-card);
      border: 1.5px solid var(--swag-border);
      border-radius: 20px;
      padding: 18px 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      font-size: 24px;
      font-weight: 600;
    }

    /* Caption Overlay */
    .reel-caption-overlay {
      position: absolute;
      bottom: 220px;
      left: 48px;
      right: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 80;
      pointer-events: none;
    }

    .reel-caption-box {
      background: rgba(10, 15, 29, 0.88);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      padding: 18px 32px;
      border-radius: 24px;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.4;
      color: #ffffff;
      text-align: center;
      max-width: 920px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
    }
  </style>
</head>
<body>
  <div class="safe-zone-content">
    ${sceneBodyHtml}
  </div>

  ${
    scene.content.narrationText && scene.type !== "outro"
      ? `
    <div class="reel-caption-overlay">
      <div class="reel-caption-box">
        ${escapeHtml(scene.content.narrationText)}
      </div>
    </div>
  `
      : ""
  }
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
