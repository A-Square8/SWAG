/**
 * Watermark Engine.
 * Injects brand watermarks and attribution tags into rendered documents.
 */

import { renderWatermark, type WatermarkOptions } from "../widgets/branding.js";

export interface WatermarkConfig {
  enabled: boolean;
  text?: string;
  logoUrl?: string;
  opacity?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "center";
}

export function injectWatermark(
  html: string,
  config: WatermarkConfig = { enabled: true },
): string {
  if (!config.enabled) return html;

  const watermarkHtml = renderWatermark({
    text: config.text,
    logoUrl: config.logoUrl,
    opacity: config.opacity,
    position: config.position,
  });

  if (html.includes("</body>")) {
    return html.replace("</body>", `${watermarkHtml}</body>`);
  }
  return html + watermarkHtml;
}
