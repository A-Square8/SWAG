/**
 * Template Style Variants Engine.
 * Modulates the aesthetic mood between modern, glassmorphism, retro, and cyberpunk.
 */

export type TemplateVariant = "modern" | "glassmorphism" | "retro" | "cyber";

export function getVariantStyles(variant: TemplateVariant = "modern"): string {
  switch (variant) {
    case "glassmorphism":
      return `
        .swag-card, .slide-content, .feature-card, .term-window, .swag-feature-matrix {
          background: rgba(15, 23, 42, 0.65) !important;
          backdrop-filter: blur(24px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
        }
      `;
    case "retro":
      return `
        * {
          font-family: "Courier New", Courier, monospace !important;
          border-radius: 0 !important;
        }
        .swag-card, .slide-content, .feature-card {
          background: #000000 !important;
          border: 2px solid #00ff66 !important;
          box-shadow: 4px 4px 0 #00ff66 !important;
        }
        h1, h2, h3, p, span {
          color: #00ff66 !important;
          text-shadow: 0 0 4px rgba(0, 255, 102, 0.6);
        }
      `;
    case "cyber":
      return `
        .swag-card, .slide-content, .feature-card {
          background: #090a0f !important;
          border: 1px solid #00fff5 !important;
          box-shadow: 0 0 25px rgba(0, 255, 245, 0.25), inset 0 0 15px rgba(255, 0, 127, 0.15) !important;
        }
        h1, h2, h3 {
          text-shadow: 0 0 10px rgba(0, 255, 245, 0.7);
        }
      `;
    case "modern":
    default:
      return `
        .swag-card, .slide-content, .feature-card {
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
        }
      `;
  }
}
