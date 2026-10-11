/**
 * Privacy Blur — automatically detects sensitive information (API keys, tokens, emails)
 * and calculates bounding boxes or applies CSS blurring.
 */

import type { Page } from "playwright";
import type { BlurRegion } from "../../types/index.js";
import { logger } from "../../utils/logger.js";

const log = logger.child("capturer:privacy");

export interface PrivacyRule {
  name: string;
  pattern: RegExp;
}

export const SENSITIVE_PATTERNS: PrivacyRule[] = [
  {
    name: "API Key (OpenAI / generic sk- / pk_)",
    pattern: /\b(?:sk-[a-zA-Z0-9_-]{16,}|pk_[a-zA-Z0-9_-]{16,})\b/,
  },
  {
    name: "AWS Access Key",
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    name: "GitHub Token",
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}\b/,
  },
  {
    name: "JWT Token",
    pattern: /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/,
  },
  {
    name: "Bearer Token",
    pattern: /\bBearer\s+[a-zA-Z0-9_\-\.]{20,}\b/i,
  },
  {
    name: "Database Connection String",
    pattern: /\b(?:postgres|postgresql|mysql|mongodb|redis):\/\/[^:\s]+:[^@\s]+@[^\s]+\b/i,
  },
  {
    name: "Email Address",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  },
  {
    name: "Private Key Header",
    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/,
  },
];

/**
 * Scan the live Playwright page for sensitive text, calculate bounding boxes,
 * and optionally apply CSS blur in-place.
 */
export async function detectAndBlurSensitiveData(
  page: Page,
  shouldBlurInPlace = true,
): Promise<BlurRegion[]> {
  try {
    const serializedRules = SENSITIVE_PATTERNS.map((r) => ({
      name: r.name,
      source: r.pattern.source,
      flags: r.pattern.flags,
    }));

    const regions: BlurRegion[] = await page.evaluate(
      ({ rules, applyBlur }) => {
        const foundRegions: Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          label: string;
          autoDetected: boolean;
        }> = [];

        const compiledRules = rules.map((r) => ({
          name: r.name,
          regex: new RegExp(r.source, r.flags),
        }));

        // Walk all visible text nodes
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode(node) {
              const text = node.nodeValue?.trim();
              if (!text) return NodeFilter.FILTER_REJECT;
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const style = window.getComputedStyle(parent);
              if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                style.opacity === "0"
              ) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            },
          },
        );

        let node: Node | null = walker.nextNode();
        while (node) {
          const text = node.nodeValue || "";
          for (const rule of compiledRules) {
            if (rule.regex.test(text)) {
              const el = node.parentElement;
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  foundRegions.push({
                    x: Math.round(rect.x + window.scrollX),
                    y: Math.round(rect.y + window.scrollY),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                    label: rule.name,
                    autoDetected: true,
                  });

                  if (applyBlur) {
                    el.style.filter = "blur(8px)";
                    el.style.transition = "none";
                    el.setAttribute("data-swag-blurred", "true");
                  }
                }
              }
              break; // Don't check other rules on same node
            }
          }
          node = walker.nextNode();
        }

        return foundRegions;
      },
      { rules: serializedRules, applyBlur: shouldBlurInPlace },
    );

    if (regions.length > 0) {
      log.info(`Detected ${regions.length} sensitive text regions on page`);
    }

    return regions;
  } catch (err) {
    log.warn(`Privacy scanning encountered an issue: ${err}`);
    return [];
  }
}
