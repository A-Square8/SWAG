/**
 * 16:9 (1920x1080) Widescreen YouTube Video Section HTML templates.
 * Includes split layouts, lower thirds, tech badges, and responsive browser mockups.
 * Uses official SVG tech and platform icons and guarantees uncropped contain scaling.
 */

import type { VideoSection, Theme, BrandKit } from "../../../types/index.js";
import { tokensToCssVars } from "../../theme/tokens.js";
import { IconEngine } from "../../icons/index.js";

export interface RenderYouTubeSectionHtmlOptions {
  section: VideoSection;
  sectionIndex: number;
  totalSections: number;
  theme: Theme;
  brandKit: BrandKit;
  assetDataUrl?: string;
  hasVideoAsset?: boolean;
  logoDataUrl?: string;
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
  } = options;

  const cssVars = tokensToCssVars(theme.tokens);

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
              ? `
            <div class="yt-browser-mockup">
              <div class="mockup-header">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="mockup-url">localhost:3000</span>
              </div>
              <div class="mockup-viewport">
                ${
                  hasVideoAsset
                    ? `<div class="mockup-video-target"></div>`
                    : `<img src="${assetDataUrl}" alt="Preview" />`
                }
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;
      break;

    case "tech-stack":
      const stackItems = [
        { name: "React & Next.js", desc: "Server components, edge routing, and instant hydration" },
        { name: "TypeScript", desc: "Strict end-to-end typing with Zod schema validation" },
        { name: "Tailwind CSS", desc: "Design system tokens, responsive glassmorphism, and dark mode" },
        { name: "Node.js & Modular APIs", desc: "High-performance clean architecture and scalable services" },
      ];

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
              <div class="tech-icon-box">${IconEngine.getSvg(item.name.split(" ")[0], { size: 36 })}</div>
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

    case "demo":
    case "features":
    default:
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
            <div class="yt-browser-mockup">
              <div class="mockup-header">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="mockup-url">localhost:3000</span>
              </div>
              <div class="mockup-viewport">
                ${
                  hasVideoAsset
                    ? `<div class="mockup-video-target"></div>`
                    : assetDataUrl
                      ? `<img src="${assetDataUrl}" alt="Display" />`
                      : `<div class="mockup-placeholder"><span>UI Demonstration</span></div>`
                }
              </div>
            </div>
          </div>
        </div>
      `;
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

  // Lower third overlay
  const lowerThirdHtml = section.lowerThird
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

    .mockup-placeholder {
      height: 520px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: var(--swag-muted-fg);
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
      bottom: 80px;
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
    <div class="yt-brand-logo">${brandKit.brandName ? escapeHtml(brandKit.brandName) : "PROJECT SHOWCASE"}</div>
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
    <div>${brandKit.socials[0]?.handle ? escapeHtml(brandKit.socials[0].handle) : ""}</div>
    <div>${sectionIndex + 1 < totalSections ? "Next: " + escapeHtml(section.title) : escapeHtml(brandKit.defaultCTA)}</div>
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
