/**
 * README parser — extract project name, description, and features from README.
 *
 * Returns structured hints that supplement detector results.
 */

import { safeReadFile, join } from "../../utils/fs.js";
import { logger } from "../../utils/logger.js";

const log = logger.child("readme-parser");

export interface ReadmeHints {
  /** Project name from first heading */
  name?: string;
  /** Description from first paragraph */
  description?: string;
  /** Features extracted from "Features" section bullets */
  features?: string[];
  /** Raw content */
  raw: string;
}

/**
 * Look for a README file (case-insensitive) and parse it.
 */
export async function parseReadme(projectPath: string): Promise<ReadmeHints | null> {
  const candidates = [
    "README.md",
    "readme.md",
    "Readme.md",
    "README.MD",
    "README",
    "README.txt",
    "README.rst",
  ];

  let content: string | null = null;
  for (const candidate of candidates) {
    content = await safeReadFile(join(projectPath, candidate));
    if (content) break;
  }

  if (!content) {
    log.debug("No README found");
    return null;
  }

  log.info("Parsing README");

  const hints: ReadmeHints = { raw: content };

  // Extract project name from first H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    hints.name = h1Match[1]
      .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Extract description from first paragraph after H1
  const lines = content.split("\n");
  let foundH1 = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!foundH1) {
      if (trimmed.startsWith("# ")) foundH1 = true;
      continue;
    }
    // Skip badges, blank lines, and shields.io images
    if (
      trimmed === "" ||
      trimmed.startsWith("![") ||
      trimmed.startsWith("[![") ||
      trimmed.startsWith("<")
    ) {
      continue;
    }
    // First real paragraph after H1
    if (!trimmed.startsWith("#") && !trimmed.startsWith("-") && !trimmed.startsWith("*")) {
      hints.description = trimmed;
      break;
    }
    break; // Stop at any heading or list
  }

  // Extract features from "Features" section
  const featuresMatch = content.match(
    /##\s+(?:Features|Key Features|Highlights|What it does)\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
  );
  if (featuresMatch) {
    const featureLines = featuresMatch[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- ") || l.startsWith("* ") || l.match(/^\d+\./))
      .map((l) =>
        l
          .replace(/^[-*]\s+/, "")
          .replace(/^\d+\.\s+/, "")
          .replace(/\*\*/g, "")
          .trim(),
      )
      .filter((l) => l.length > 0);

    if (featureLines.length > 0) {
      hints.features = featureLines;
    }
  }

  return hints;
}
