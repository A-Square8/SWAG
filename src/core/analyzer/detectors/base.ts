/**
 * Base stack detector interface.
 *
 * Each detector inspects the project filesystem and returns partial
 * ProjectProfile data for the stacks it recognizes.
 */

import type { TechStackItem, Route } from "../../../types/index.js";

export interface DetectorResult {
  /** Detected tech stack items */
  techStack: TechStackItem[];
  /** Detected routes */
  routes: Route[];
  /** Suggested run command */
  runCommand?: string;
  /** Suggested port */
  port?: number;
  /** Suggested entry points */
  entryPoints?: string[];
  /** Whether auth was detected */
  hasAuth?: boolean;
  /** Package manager detected */
  packageManager?: "npm" | "yarn" | "pnpm" | "bun";
  /** Detection confidence (0-1) */
  confidence: number;
  /** Human-readable summary of what was detected */
  summary: string;
}

export interface StackDetector {
  /** Unique name for this detector */
  readonly name: string;

  /**
   * Return true if this detector applies to the given project.
   * Called before detect() to skip irrelevant detectors quickly.
   */
  applies(projectPath: string): Promise<boolean>;

  /**
   * Analyze the project and return detection results.
   */
  detect(projectPath: string): Promise<DetectorResult>;
}
