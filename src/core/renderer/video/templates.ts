/**
 * Vertical 9:16 (1080x1920) Reel scene HTML templates.
 * Respects Instagram Reels UI safe zones while ensuring screenshots
 * occupy at least 60% of the screen height without cropping.
 */

import type { ReelScene, Theme, BrandKit } from "../../../types/index.js";
import { tokensToCssVars } from "../../theme/tokens.js";
import { IconEngine } from "../../icons/index.js";

export interface RenderReelSceneHtmlOptions {
  scene: ReelScene;
  sceneIndex: number;
  totalScenes: number;
  theme: Theme;
  brandKit: BrandKit;
  assetDataUrl?: string;
  logoDataUrl?: string;
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
  } = options;

  const cssVars = tokensToCssVars(theme.tokens);

  let sceneBodyHtml = "";

  switch (scene.type) {
    case "hook":
      sceneBodyHtml = `
        <div class="reel-hook">
          <div class="reel-header-block">
            <div class="reel-badge">
              <span class="pulsing-dot"></span>
              <span>${brandKit.brandName || "DEV SHOWCASE"}</span>
            </div>
            <h1 class="reel-hero-title">${escapeHtml(scene.content.text || "Wait Until You See This...")}</h1>
          </div>
          ${
            assetDataUrl
              ? `
            <div class="reel-mockup">
              <div class="mockup-header">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="mockup-url">localhost:3000</span>
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
            <div class="reel-badge">FEATURE WALKTHROUGH</div>
            <h2 class="reel-sub-title">${escapeHtml(scene.content.text || "Built for Pure Speed")}</h2>
          </div>
          <div class="reel-mockup">
            <div class="mockup-header">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
              <span class="mockup-url">localhost:3000</span>
            </div>
            <div class="mockup-viewport">
              ${
                assetDataUrl
                  ? `<img src="${assetDataUrl}" alt="Demo" />`
                  : `<div class="placeholder-box">Live Interactive Demo</div>`
              }
            </div>
          </div>
        </div>
      `;
      break;

    case "tech":
      sceneBodyHtml = `
        <div class="reel-tech">
          <div class="reel-header-block">
            <div class="reel-badge">TECH STACK</div>
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
                <span class="mockup-url">localhost:3000</span>
              </div>
              <div class="mockup-viewport">
                <img src="${assetDataUrl}" alt="Stack" />
              </div>
            </div>
          `
              : `
            <div class="tech-pill-list">
              ${["TypeScript", "React", "Next.js", "Tailwind CSS", "PostgreSQL"]
                .map(
                  (tech) => `
                <div class="tech-pill">
                  <span class="tech-pill-icon">${IconEngine.getSvg(tech, { size: 36 })}</span>
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

    case "outro":
      sceneBodyHtml = `
        <div class="reel-outro">
          ${logoDataUrl ? `<img src="${logoDataUrl}" class="outro-logo" />` : `<div class="outro-icon">${IconEngine.getSvg("zap", { size: 96, color: "var(--swag-primary, #6366f1)" })}</div>`}
          <h1 class="reel-hero-title">${escapeHtml(scene.content.text || "Build Yours Today")}</h1>
          <p class="reel-desc">${escapeHtml(brandKit.defaultCTA || "Link in bio to view project")}</p>
          <div class="reel-handle">
            <span class="handle-icon">${IconEngine.getSvg(brandKit.socials[0]?.platform || "github", { size: 28 })}</span>
            <span>${brandKit.socials[0]?.handle ? escapeHtml(brandKit.socials[0].handle) : "@developer"}</span>
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
      justify-content: center;
      align-items: center;
      /* Balanced Instagram Reels UI Safe Zones: 100px top, 140px bottom */
      padding: 100px 48px 140px 48px;
      -webkit-font-smoothing: antialiased;
    }

    /* Ambient atmospheric glow */
    body::before {
      content: "";
      position: absolute;
      top: 10%;
      right: -25%;
      width: 900px;
      height: 900px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--swag-primary) 0%, transparent 65%);
      opacity: 0.25;
      filter: blur(100px);
      z-index: 0;
    }

    body::after {
      content: "";
      position: absolute;
      bottom: 15%;
      left: -20%;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--swag-secondary) 0%, transparent 65%);
      opacity: 0.20;
      filter: blur(100px);
      z-index: 0;
    }

    .safe-zone-content {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
    }

    .reel-hook, .reel-feature, .reel-tech {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .reel-header-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      max-width: 960px;
    }

    .reel-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: rgba(99, 102, 241, 0.16);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: var(--swag-primary);
      padding: 10px 24px;
      border-radius: 40px;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
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
      letter-spacing: -0.04em;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .reel-sub-title {
      font-size: 48px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.03em;
    }

    .reel-desc {
      font-size: 28px;
      color: var(--swag-muted-fg);
      line-height: 1.4;
      max-width: 800px;
    }

    /* Mockup covers 1180px (> 61% of total 1920px screen) */
    .reel-mockup {
      width: 100%;
      max-width: 984px;
      height: 1180px;
      border-radius: 24px;
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      box-shadow: 0 35px 80px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .mockup-header {
      height: 48px;
      background: rgba(15, 23, 42, 0.9);
      border-bottom: 1px solid var(--swag-border);
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 10px;
      flex-shrink: 0;
    }

    .dot {
      width: 14px;
      height: 14px;
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
      height: calc(100% - 48px);
      background: #060911;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    .reel-mockup img {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      object-position: center;
      display: block;
    }

    .placeholder-box {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: var(--swag-muted-fg);
    }

    .tech-pill-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      max-width: 640px;
      margin: auto 0;
    }

    .tech-pill {
      background: var(--swag-card);
      border: 1px solid var(--swag-border);
      padding: 20px 32px;
      border-radius: 20px;
      font-size: 28px;
      font-weight: 700;
      color: var(--swag-fg);
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .tech-pill-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reel-outro {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 36px;
    }

    .outro-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .outro-logo {
      height: 120px;
      width: auto;
      object-fit: contain;
    }

    .reel-handle {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--swag-border);
      padding: 16px 36px;
      border-radius: 40px;
      font-size: 24px;
      font-weight: 700;
      color: var(--swag-primary);
      display: inline-flex;
      align-items: center;
      gap: 14px;
    }

    .handle-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="safe-zone-content">
    ${sceneBodyHtml}
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
