/**
 * Static site detector.
 *
 * Detects projects that are plain HTML/CSS/JS with no build step.
 * This is the lowest-priority fallback detector.
 */

import type { StackDetector, DetectorResult } from "./base.js";
import { pathExists, join } from "../../../utils/fs.js";
import { logger } from "../../../utils/logger.js";

const log = logger.child("detector:static");

export class StaticDetector implements StackDetector {
  readonly name = "static";

  async applies(projectPath: string): Promise<boolean> {
    return (
      (await pathExists(join(projectPath, "index.html"))) ||
      (await pathExists(join(projectPath, "public", "index.html"))) ||
      (await pathExists(join(projectPath, "src", "index.html")))
    );
  }

  async detect(projectPath: string): Promise<DetectorResult> {
    const techStack = [
      { name: "HTML", category: "language" as const },
      { name: "CSS", category: "styling" as const },
      { name: "JavaScript", category: "language" as const },
    ];

    // Determine where index.html lives
    let servePath = projectPath;
    if (await pathExists(join(projectPath, "public", "index.html"))) {
      servePath = join(projectPath, "public");
    } else if (await pathExists(join(projectPath, "src", "index.html"))) {
      servePath = join(projectPath, "src");
    }

    log.info("Detected static HTML project");

    return {
      techStack,
      routes: [
        { path: "/", label: "Home", isProtected: false, capturable: true },
      ],
      runCommand: `npx serve ${servePath === projectPath ? "." : servePath.replace(projectPath + "/", "")}`,
      port: 3000,
      entryPoints: ["index.html"],
      confidence: 0.4,
      summary: "Static HTML/CSS/JS project",
    };
  }
}
