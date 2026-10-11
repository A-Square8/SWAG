/**
 * Project Analyzer — orchestrator.
 *
 * Runs all applicable stack detectors, parses README, reads config,
 * and merges everything into a ProjectProfile.
 */

import { randomUUID } from "node:crypto";

import type {
  ProjectProfile,
  Feature,
  TechStackItem,
  Route,
} from "../../types/index.js";
import { createDetectors } from "./detectors/index.js";
import type { DetectorResult } from "./detectors/index.js";
import { parseReadme } from "./readme-parser.js";
import { safeReadJson, buildFolderStructure, pathExists, join } from "../../utils/fs.js";
import { SwagError } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

const log = logger.child("analyzer");

export interface AnalyzeOptions {
  /** Absolute path to the project root */
  projectPath: string;
  /** Optional hints from the user/agent to override or supplement detection */
  hints?: {
    runCommand?: string;
    port?: number;
    techStack?: string[];
    projectName?: string;
  };
}

export interface AnalyzeResult {
  success: true;
  profile: ProjectProfile;
  confidence: number;
  warnings: string[];
}

/**
 * Analyze a project directory and produce a ProjectProfile.
 */
export async function analyzeProject(
  options: AnalyzeOptions,
): Promise<AnalyzeResult> {
  const { projectPath, hints } = options;

  log.info(`Analyzing project at: ${projectPath}`);

  // Validate project path exists
  if (!(await pathExists(projectPath))) {
    throw new SwagError(
      "PROJECT_NOT_FOUND",
      `Project path does not exist: ${projectPath}`,
      "Check the path and try again. The path must be an absolute path to an existing directory.",
    );
  }

  const warnings: string[] = [];

  // 1. Run all applicable detectors
  const detectors = createDetectors();
  const detectorResults: DetectorResult[] = [];

  for (const detector of detectors) {
    try {
      if (await detector.applies(projectPath)) {
        log.debug(`Running detector: ${detector.name}`);
        const result = await detector.detect(projectPath);
        detectorResults.push(result);
        log.debug(
          `Detector ${detector.name}: confidence=${result.confidence}, summary="${result.summary}"`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(`Detector ${detector.name} failed: ${msg}`);
      warnings.push(`${detector.name} detector failed: ${msg}`);
    }
  }

  if (detectorResults.length === 0) {
    throw new SwagError(
      "PROJECT_NOT_WEB",
      "No web project detected. SWAG v1 supports web projects only.",
      "Make sure the path points to a web project with a package.json, requirements.txt, or index.html. If this is a web project, provide hints with the runCommand and port.",
    );
  }

  // 2. Pick the best detector result (highest confidence) for primary settings
  const bestResult = detectorResults.reduce((a, b) =>
    b.confidence > a.confidence ? b : a,
  );

  // 3. Merge tech stacks from all detectors
  const allTechStack: TechStackItem[] = [];
  const seenTech = new Set<string>();
  for (const result of detectorResults) {
    for (const item of result.techStack) {
      if (!seenTech.has(item.name)) {
        seenTech.add(item.name);
        allTechStack.push(item);
      }
    }
  }

  // 4. Merge routes (deduplicate by path)
  const allRoutes: Route[] = [];
  const seenRoutes = new Set<string>();
  for (const result of detectorResults) {
    for (const route of result.routes) {
      if (!seenRoutes.has(route.path)) {
        seenRoutes.add(route.path);
        allRoutes.push(route);
      }
    }
  }

  // 5. Parse README for name, description, features
  const readmeHints = await parseReadme(projectPath);

  // 6. Build features from README
  const features: Feature[] = (readmeHints?.features ?? []).map(
    (f, i) => ({
      id: randomUUID(),
      name: f.length > 60 ? f.slice(0, 57) + "..." : f,
      description: f,
      priority: i < 3 ? "high" : i < 6 ? "medium" : "low",
      include: true,
    }),
  );

  // 7. Read package.json for raw data
  const packageJson = await safeReadJson(join(projectPath, "package.json"));

  // 8. Build folder structure
  const folderStructure = await buildFolderStructure(projectPath);

  // 9. Determine project name
  const projectName =
    hints?.projectName ??
    readmeHints?.name ??
    (packageJson as Record<string, unknown>)?.name as string ??
    projectPath.split("/").pop() ??
    "unknown-project";

  // 10. Build merge entry points
  const entryPoints: string[] = [];
  const seenEntries = new Set<string>();
  for (const result of detectorResults) {
    for (const ep of result.entryPoints ?? []) {
      if (!seenEntries.has(ep)) {
        seenEntries.add(ep);
        entryPoints.push(ep);
      }
    }
  }

  // 11. Apply user hints (overrides)
  const runCommand = hints?.runCommand ?? bestResult.runCommand ?? "npm run dev";
  const port = hints?.port ?? bestResult.port ?? 3000;

  if (hints?.techStack) {
    for (const name of hints.techStack) {
      if (!seenTech.has(name)) {
        seenTech.add(name);
        allTechStack.push({ name, category: "other" });
      }
    }
  }

  // 12. Assemble profile
  const profile: ProjectProfile = {
    name: projectName,
    tagline: "",
    description: readmeHints?.description ?? "",
    features,
    techStack: allTechStack,
    architecture: "",
    routes: allRoutes,
    runCommand,
    port,
    entryPoints,
    projectType: "web",
    packageManager: bestResult.packageManager ?? null,
    hasAuth: detectorResults.some((r) => r.hasAuth) ?? false,
    detectedAt: new Date().toISOString(),
    confidence: bestResult.confidence,
    raw: {
      readme: readmeHints?.raw,
      packageJson: packageJson as Record<string, unknown> | undefined,
      folderStructure,
    },
  };

  // 13. Generate warnings
  if (profile.confidence < 0.5) {
    warnings.push(
      "Low confidence detection. Please review the profile and provide corrections.",
    );
  }
  if (profile.routes.length === 0) {
    warnings.push(
      "No routes detected. You may want to specify routes manually for better captures.",
    );
  }
  if (profile.features.length === 0) {
    warnings.push(
      "No features extracted from README. Consider adding a 'Features' section to your README, or describe the features to the agent.",
    );
  }
  if (!readmeHints) {
    warnings.push("No README found. Consider adding one for better project understanding.");
  }

  log.info(
    `Analysis complete: "${profile.name}" — ${allTechStack.length} tech items, ${allRoutes.length} routes, ${features.length} features, confidence=${profile.confidence}`,
  );

  return {
    success: true,
    profile,
    confidence: profile.confidence,
    warnings,
  };
}
