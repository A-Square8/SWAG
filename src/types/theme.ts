import { z } from "zod";

// ---------------------------------------------------------------------------
// DesignTokens
// ---------------------------------------------------------------------------
export const DesignTokensSchema = z.object({
  colors: z.object({
    background: z.string(),
    foreground: z.string(),
    primary: z.string(),
    secondary: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
    border: z.string(),
    card: z.string(),
    cardForeground: z.string(),
    destructive: z.string(),
    success: z.string(),
    codeBackground: z.string(),
    codeForeground: z.string(),
  }),
  typography: z.object({
    headingFamily: z.string().default("Inter"),
    bodyFamily: z.string().default("Inter"),
    codeFamily: z.string().default("JetBrains Mono"),
    baseFontSize: z.number().default(16),
    headingSizes: z.object({
      h1: z.number().default(48),
      h2: z.number().default(36),
      h3: z.number().default(24),
    }),
    lineHeight: z.number().default(1.5),
    fontWeight: z.object({
      normal: z.number().default(400),
      medium: z.number().default(500),
      bold: z.number().default(700),
    }),
  }),
  spacing: z.object({
    unit: z.number().default(8),
    borderRadius: z.number().default(12),
    containerPadding: z.number().default(48),
  }),
  effects: z.object({
    shadow: z.string().default("0 4px 24px rgba(0,0,0,0.12)"),
    blur: z.string().default("blur(12px)"),
    overlay: z.string().default("rgba(0,0,0,0.5)"),
  }),
});
export type DesignTokens = z.infer<typeof DesignTokensSchema>;

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
export const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.enum(["auto-detected", "preset", "custom"]),
  tokens: DesignTokensSchema,
});
export type Theme = z.infer<typeof ThemeSchema>;
