/**
 * Route Explorer — automatically discovers internal routes and interactive targets on a page.
 */

import type { Page } from "playwright";
import { logger } from "../../utils/logger.js";

const log = logger.child("capturer:explorer");

export interface DiscoveredRoute {
  path: string;
  label: string;
}

export interface DiscoveredInteraction {
  selector: string;
  type: "click" | "input";
  description: string;
}

/**
 * Scan a page for all local navigation links and return unique routes.
 */
export async function discoverRoutes(
  page: Page,
  baseUrl: string,
): Promise<DiscoveredRoute[]> {
  try {
    const rawLinks = await page.evaluate((origin) => {
      const anchors = Array.from(document.querySelectorAll("a[href]"));
      const routes: Array<{ path: string; label: string }> = [];

      for (const a of anchors) {
        const href = a.getAttribute("href");
        if (!href) continue;

        // Ignore anchors, protocols, javascript
        if (
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("javascript:")
        ) {
          continue;
        }

        try {
          const resolved = new URL(href, window.location.href);
          // Only same-origin links
          if (resolved.origin === origin || resolved.origin === window.location.origin) {
            const pathname = resolved.pathname;
            const text = (a.textContent || "").trim();
            routes.push({
              path: pathname,
              label: text || pathname,
            });
          }
        } catch {
          // Ignore invalid URLs
        }
      }

      return routes;
    }, new URL(baseUrl).origin);

    // Deduplicate by path
    const unique = new Map<string, string>();
    for (const r of rawLinks) {
      if (!unique.has(r.path)) {
        unique.set(r.path, r.label);
      }
    }

    const result: DiscoveredRoute[] = Array.from(unique.entries()).map(
      ([path, label]) => ({ path, label }),
    );

    log.debug(`Discovered ${result.length} internal routes on ${page.url()}`);
    return result;
  } catch (err) {
    log.warn(`Route discovery failed: ${err}`);
    return [];
  }
}

/**
 * Scan a page for key interactive elements (buttons, inputs, toggles).
 */
export async function discoverInteractiveElements(
  page: Page,
): Promise<DiscoveredInteraction[]> {
  try {
    return await page.evaluate(() => {
      const items: Array<{
        selector: string;
        type: "click" | "input";
        description: string;
      }> = [];

      // Find buttons
      const buttons = Array.from(document.querySelectorAll("button, [role='button']"));
      for (const btn of buttons.slice(0, 10)) {
        const text = (btn.textContent || "").trim();
        const id = btn.id ? `#${btn.id}` : "";
        const label = text || btn.getAttribute("aria-label") || "button";
        items.push({
          selector: id || `button:has-text("${text.slice(0, 20)}")`,
          type: "click",
          description: `Click "${label}"`,
        });
      }

      // Find inputs
      const inputs = Array.from(document.querySelectorAll("input:not([type='hidden'])"));
      for (const input of inputs.slice(0, 5)) {
        const placeholder = input.getAttribute("placeholder") || "";
        const name = input.getAttribute("name") || "";
        items.push({
          selector: input.id ? `#${input.id}` : `input[name="${name}"]`,
          type: "input",
          description: `Input in ${placeholder || name || "field"}`,
        });
      }

      return items;
    });
  } catch (err) {
    log.warn(`Interactive element discovery failed: ${err}`);
    return [];
  }
}
