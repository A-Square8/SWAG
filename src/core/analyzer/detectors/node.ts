/**
 * Node.js / JavaScript / TypeScript stack detector.
 *
 * Detects: React, Next.js, Nuxt, Vue, Angular, Svelte, SvelteKit,
 * Astro, Remix, Vite, Express, etc.
 */

import type { StackDetector, DetectorResult } from "./base.js";
import type { TechStackItem, Route } from "../../../types/index.js";
import { safeReadJson, pathExists, join } from "../../../utils/fs.js";
import { logger } from "../../../utils/logger.js";

const log = logger.child("detector:node");

interface PackageJson {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

// ---------------------------------------------------------------------------
// Framework detection rules
// ---------------------------------------------------------------------------

interface FrameworkRule {
  /** npm package name to look for */
  package: string;
  /** What to call it in the tech stack */
  name: string;
  category: TechStackItem["category"];
  /** Default dev command if this framework is detected */
  defaultRunCommand?: string;
  /** Default port */
  defaultPort?: number;
  /** Priority (higher = more specific, overrides less specific detections) */
  priority: number;
  /** Optional: how to detect routes */
  routeDetector?: (projectPath: string) => Promise<Route[]>;
}

const FRAMEWORK_RULES: FrameworkRule[] = [
  // Meta-frameworks (highest priority)
  {
    package: "next",
    name: "Next.js",
    category: "framework",
    defaultRunCommand: "npx next dev",
    defaultPort: 3000,
    priority: 100,
    routeDetector: detectNextRoutes,
  },
  {
    package: "nuxt",
    name: "Nuxt",
    category: "framework",
    defaultRunCommand: "npx nuxi dev",
    defaultPort: 3000,
    priority: 100,
  },
  {
    package: "@sveltejs/kit",
    name: "SvelteKit",
    category: "framework",
    defaultRunCommand: "npm run dev",
    defaultPort: 5173,
    priority: 100,
  },
  {
    package: "@remix-run/dev",
    name: "Remix",
    category: "framework",
    defaultRunCommand: "npm run dev",
    defaultPort: 5173,
    priority: 100,
  },
  {
    package: "astro",
    name: "Astro",
    category: "framework",
    defaultRunCommand: "npx astro dev",
    defaultPort: 4321,
    priority: 100,
  },
  {
    package: "gatsby",
    name: "Gatsby",
    category: "framework",
    defaultRunCommand: "npx gatsby develop",
    defaultPort: 8000,
    priority: 100,
  },

  // Frontend frameworks
  {
    package: "react",
    name: "React",
    category: "framework",
    defaultRunCommand: "npm run dev",
    defaultPort: 5173,
    priority: 50,
  },
  {
    package: "react-dom",
    name: "React",
    category: "framework",
    defaultRunCommand: "npm run dev",
    defaultPort: 5173,
    priority: 50,
  },
  {
    package: "vue",
    name: "Vue.js",
    category: "framework",
    defaultRunCommand: "npm run dev",
    defaultPort: 5173,
    priority: 50,
  },
  {
    package: "svelte",
    name: "Svelte",
    category: "framework",
    defaultRunCommand: "npm run dev",
    defaultPort: 5173,
    priority: 50,
  },
  {
    package: "@angular/core",
    name: "Angular",
    category: "framework",
    defaultRunCommand: "npx ng serve",
    defaultPort: 4200,
    priority: 50,
  },
  {
    package: "solid-js",
    name: "SolidJS",
    category: "framework",
    defaultRunCommand: "npm run dev",
    defaultPort: 3000,
    priority: 50,
  },

  // Build tools
  {
    package: "vite",
    name: "Vite",
    category: "tooling",
    defaultRunCommand: "npx vite",
    defaultPort: 5173,
    priority: 30,
  },
  {
    package: "webpack",
    name: "Webpack",
    category: "tooling",
    priority: 20,
  },
  {
    package: "turbo",
    name: "Turborepo",
    category: "tooling",
    priority: 20,
  },

  // Styling
  { package: "tailwindcss", name: "Tailwind CSS", category: "styling", priority: 10 },
  { package: "sass", name: "Sass", category: "styling", priority: 10 },
  { package: "@chakra-ui/react", name: "Chakra UI", category: "styling", priority: 10 },
  { package: "@mui/material", name: "Material UI", category: "styling", priority: 10 },
  { package: "styled-components", name: "Styled Components", category: "styling", priority: 10 },
  { package: "shadcn-ui", name: "shadcn/ui", category: "styling", priority: 10 },

  // Backend
  { package: "express", name: "Express", category: "framework", priority: 40 },
  { package: "fastify", name: "Fastify", category: "framework", priority: 40 },
  { package: "hono", name: "Hono", category: "framework", priority: 40 },

  // Databases
  { package: "prisma", name: "Prisma", category: "database", priority: 10 },
  { package: "drizzle-orm", name: "Drizzle", category: "database", priority: 10 },
  { package: "mongoose", name: "MongoDB (Mongoose)", category: "database", priority: 10 },
  { package: "@supabase/supabase-js", name: "Supabase", category: "database", priority: 10 },
  { package: "firebase", name: "Firebase", category: "database", priority: 10 },

  // Auth
  { package: "next-auth", name: "NextAuth.js", category: "other", priority: 10 },
  { package: "@clerk/nextjs", name: "Clerk", category: "other", priority: 10 },
  { package: "@auth/core", name: "Auth.js", category: "other", priority: 10 },
];

// Deduplicate by name (e.g., react + react-dom both map to "React")
function deduplicateTechStack(items: TechStackItem[]): TechStackItem[] {
  const seen = new Map<string, TechStackItem>();
  for (const item of items) {
    if (!seen.has(item.name)) {
      seen.set(item.name, item);
    }
  }
  return Array.from(seen.values());
}

// ---------------------------------------------------------------------------
// Route detection for Next.js
// ---------------------------------------------------------------------------

async function detectNextRoutes(projectPath: string): Promise<Route[]> {
  const routes: Route[] = [];

  // Check app router (app/) or pages router (pages/)
  const appDir = join(projectPath, "app");
  const srcAppDir = join(projectPath, "src", "app");
  const pagesDir = join(projectPath, "pages");
  const srcPagesDir = join(projectPath, "src", "pages");

  const routeDir = (await pathExists(appDir))
    ? appDir
    : (await pathExists(srcAppDir))
      ? srcAppDir
      : (await pathExists(pagesDir))
        ? pagesDir
        : (await pathExists(srcPagesDir))
          ? srcPagesDir
          : null;

  if (routeDir) {
    routes.push({ path: "/", label: "Home", isProtected: false, capturable: true });

    // Scan for route segments (basic detection)
    const { readdir } = await import("node:fs/promises");
    try {
      const entries = await readdir(routeDir, { withFileTypes: true });
      for (const entry of entries) {
        if (
          entry.isDirectory() &&
          !entry.name.startsWith("_") &&
          !entry.name.startsWith("(") &&
          !entry.name.startsWith("api") &&
          !entry.name.startsWith("[")
        ) {
          routes.push({
            path: `/${entry.name}`,
            label: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
            isProtected: false,
            capturable: true,
          });
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  return routes;
}

// ---------------------------------------------------------------------------
// Detector
// ---------------------------------------------------------------------------

export class NodeDetector implements StackDetector {
  readonly name = "node";

  async applies(projectPath: string): Promise<boolean> {
    return await pathExists(join(projectPath, "package.json"));
  }

  async detect(projectPath: string): Promise<DetectorResult> {
    const pkg = await safeReadJson<PackageJson>(
      join(projectPath, "package.json"),
    );

    if (!pkg) {
      return {
        techStack: [],
        routes: [],
        confidence: 0,
        summary: "package.json found but could not be parsed",
      };
    }

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    // Detect tech stack
    const techStack: TechStackItem[] = [];
    let bestFramework: FrameworkRule | null = null;

    for (const rule of FRAMEWORK_RULES) {
      if (allDeps[rule.package]) {
        techStack.push({
          name: rule.name,
          category: rule.category,
          version: allDeps[rule.package]?.replace(/^[\^~]/, ""),
        });

        if (
          rule.category === "framework" &&
          (!bestFramework || rule.priority > bestFramework.priority)
        ) {
          bestFramework = rule;
        }
      }
    }

    // Detect TypeScript
    if (
      allDeps["typescript"] ||
      (await pathExists(join(projectPath, "tsconfig.json")))
    ) {
      techStack.push({
        name: "TypeScript",
        category: "language",
        version: allDeps["typescript"]?.replace(/^[\^~]/, ""),
      });
    } else {
      techStack.push({ name: "JavaScript", category: "language" });
    }

    // Detect run command
    let runCommand = bestFramework?.defaultRunCommand ?? "npm run dev";
    const port = bestFramework?.defaultPort ?? 3000;

    // Prefer scripts.dev if it exists
    if (pkg.scripts?.dev) {
      runCommand = "npm run dev";
    } else if (pkg.scripts?.start) {
      runCommand = "npm start";
    } else if (pkg.scripts?.serve) {
      runCommand = "npm run serve";
    }

    // Detect package manager
    let packageManager: DetectorResult["packageManager"] = "npm";
    if (await pathExists(join(projectPath, "bun.lockb"))) {
      packageManager = "bun";
      runCommand = runCommand.replace(/^npm /, "bun ");
      runCommand = runCommand.replace(/^npx /, "bunx ");
    } else if (await pathExists(join(projectPath, "pnpm-lock.yaml"))) {
      packageManager = "pnpm";
      runCommand = runCommand.replace(/^npm /, "pnpm ");
      runCommand = runCommand.replace(/^npx /, "pnpm exec ");
    } else if (await pathExists(join(projectPath, "yarn.lock"))) {
      packageManager = "yarn";
      runCommand = runCommand.replace(/^npm /, "yarn ");
      runCommand = runCommand.replace(/^npx /, "yarn ");
    } else if (pkg.packageManager?.startsWith("pnpm")) {
      packageManager = "pnpm";
      runCommand = runCommand.replace(/^npm /, "pnpm ");
      runCommand = runCommand.replace(/^npx /, "pnpm exec ");
    }

    // Detect routes
    let routes: Route[] = [];
    if (bestFramework?.routeDetector) {
      routes = await bestFramework.routeDetector(projectPath);
    }

    // Detect entry points
    const entryPoints: string[] = [];
    const possibleEntries = [
      "src/App.tsx",
      "src/App.jsx",
      "src/App.vue",
      "src/main.tsx",
      "src/main.ts",
      "src/main.js",
      "src/index.tsx",
      "src/index.ts",
      "src/index.js",
      "app/page.tsx",
      "app/page.jsx",
      "pages/index.tsx",
      "pages/index.jsx",
      "pages/index.vue",
    ];
    for (const entry of possibleEntries) {
      if (await pathExists(join(projectPath, entry))) {
        entryPoints.push(entry);
      }
    }

    // Detect auth
    const AUTH_PACKAGES = [
      "next-auth",
      "@clerk/nextjs",
      "@auth/core",
      "passport",
      "@supabase/auth-helpers-nextjs",
      "firebase",
    ];
    const hasAuth = AUTH_PACKAGES.some((pkg) => allDeps[pkg]);

    // Confidence
    const confidence = bestFramework ? 0.85 : techStack.length > 0 ? 0.6 : 0.3;

    const frameworkNames = deduplicateTechStack(
      techStack.filter((t) => t.category === "framework"),
    ).map((t) => t.name);

    log.info(
      `Detected Node.js project: ${frameworkNames.join(", ") || "plain Node.js"}`,
    );

    return {
      techStack: deduplicateTechStack(techStack),
      routes,
      runCommand,
      port,
      entryPoints,
      hasAuth,
      packageManager,
      confidence,
      summary: `Node.js project using ${frameworkNames.join(", ") || "no specific framework"}`,
    };
  }
}
