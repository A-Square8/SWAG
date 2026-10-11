/**
 * Detector registry — runs all applicable detectors and merges results.
 */

export { NodeDetector } from "./node.js";
export { PythonDetector } from "./python.js";
export { StaticDetector } from "./static.js";
export type { StackDetector, DetectorResult } from "./base.js";

import { NodeDetector } from "./node.js";
import { PythonDetector } from "./python.js";
import { StaticDetector } from "./static.js";
import type { StackDetector } from "./base.js";

/**
 * All registered detectors, ordered from most-specific to least-specific.
 * The first detector with the highest confidence wins for run command / port.
 * Tech stack items from all applicable detectors are merged.
 */
export function createDetectors(): StackDetector[] {
  return [new NodeDetector(), new PythonDetector(), new StaticDetector()];
}
