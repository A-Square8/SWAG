/**
 * Design Token CSS generator for HTML rendering templates.
 */

import type { DesignTokens } from "../../types/index.js";

/**
 * Format design tokens into CSS custom properties.
 */
export function tokensToCssVars(tokens: DesignTokens): string {
  const { colors, typography, spacing, effects } = tokens;

  return `
    :root {
      --swag-bg: ${colors.background};
      --swag-fg: ${colors.foreground};
      --swag-primary: ${colors.primary};
      --swag-secondary: ${colors.secondary};
      --swag-muted: ${colors.muted};
      --swag-muted-fg: ${colors.mutedForeground};
      --swag-border: ${colors.border};
      --swag-card: ${colors.card};
      --swag-card-fg: ${colors.cardForeground};
      --swag-destructive: ${colors.destructive};
      --swag-success: ${colors.success};
      --swag-code-bg: ${colors.codeBackground};
      --swag-code-fg: ${colors.codeForeground};

      --swag-font-heading: ${typography.headingFamily};
      --swag-font-body: ${typography.bodyFamily};
      --swag-font-code: ${typography.codeFamily};

      --swag-h1-size: ${typography.headingSizes.h1}px;
      --swag-h2-size: ${typography.headingSizes.h2}px;
      --swag-h3-size: ${typography.headingSizes.h3}px;
      --swag-base-font-size: ${typography.baseFontSize}px;
      --swag-line-height: ${typography.lineHeight};

      --swag-radius: ${spacing.borderRadius}px;
      --swag-padding: ${spacing.containerPadding}px;
      --swag-unit: ${spacing.unit}px;

      --swag-shadow: ${effects.shadow};
      --swag-blur: ${effects.blur};
      --swag-overlay: ${effects.overlay};
    }
  `;
}
