/**
 * Modern HTML/CSS slide templates for Instagram post and carousel rendering.
 * Features glassmorphism, vibrant gradients, typography, and browser frames.
 */

import type { PostSlide, Theme, BrandKit } from "../../../types/index.js";
import { tokensToCssVars } from "../../theme/tokens.js";
import { IconEngine } from "../../icons/index.js";

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
      : "dirtcheapprojects.web.app";
  const primaryHandle =
    instagramSocial?.handle ||
    brandKit.socials[0]?.handle ||
    (brandKit.brandName ? `@${brandKit.brandName.toLowerCase().replace(/\s+/g, "_")}` : "@developer");

  // Logo overlay check
  let showLogo = false;
  if (brandKit.logo && logoDataUrl) {
    const rules = brandKit.logo.showOnSlides;
    if (rules === "all") showLogo = true;
    else if (rules === "first" && slideNumber === 1) showLogo = true;
    else if (rules === "last" && slideNumber === totalSlides) showLogo = true;
    else if (rules === "first-last" && (slideNumber === 1 || slideNumber === totalSlides)) showLogo = true;
    else if (Array.isArray(rules) && rules.includes(slideNumber)) showLogo = true;
  }

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
              ? `
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

    default: // custom or stats
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
          ${assetDataUrl ? `<div class="browser-mockup"><img src="${assetDataUrl}" /></div>` : ""}
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
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 24px;
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

    .large-frame .browser-viewport {
      height: 800px;
    }

    .compact-frame .browser-viewport {
      height: 440px;
    }

    .browser-viewport img {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      object-position: center;
      display: block;
    }

    /* Tag Cloud & Tech Grid */
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
      font-size: 20px;
      font-weight: 700;
      color: var(--swag-primary);
      background: rgba(99, 102, 241, 0.12);
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tech-card-title {
      font-size: 24px;
      font-weight: 600;
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

    .outro-symbol {
      font-size: 64px;
    }

    .outro-logo {
      height: 80px;
      width: auto;
      object-fit: contain;
    }

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

    .social-platform-icon {
      display: flex;
      align-items: center;
      justify-content: center;
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
