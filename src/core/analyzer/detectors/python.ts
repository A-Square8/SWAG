/**
 * Python web project detector.
 *
 * Detects: Django, Flask, FastAPI, Streamlit, Gradio, etc.
 */

import type { StackDetector, DetectorResult } from "./base.js";
import type { TechStackItem } from "../../../types/index.js";
import { safeReadFile, pathExists, join } from "../../../utils/fs.js";
import { logger } from "../../../utils/logger.js";

const log = logger.child("detector:python");

interface PythonFrameworkRule {
  /** Python import or package name */
  package: string;
  /** Display name */
  name: string;
  category: TechStackItem["category"];
  /** Default run command */
  defaultRunCommand?: string;
  /** Default port */
  defaultPort?: number;
  priority: number;
}

const PYTHON_RULES: PythonFrameworkRule[] = [
  {
    package: "django",
    name: "Django",
    category: "framework",
    defaultRunCommand: "python manage.py runserver",
    defaultPort: 8000,
    priority: 100,
  },
  {
    package: "flask",
    name: "Flask",
    category: "framework",
    defaultRunCommand: "flask run",
    defaultPort: 5000,
    priority: 90,
  },
  {
    package: "fastapi",
    name: "FastAPI",
    category: "framework",
    defaultRunCommand: "uvicorn main:app --reload",
    defaultPort: 8000,
    priority: 90,
  },
  {
    package: "streamlit",
    name: "Streamlit",
    category: "framework",
    defaultRunCommand: "streamlit run app.py",
    defaultPort: 8501,
    priority: 80,
  },
  {
    package: "gradio",
    name: "Gradio",
    category: "framework",
    defaultRunCommand: "python app.py",
    defaultPort: 7860,
    priority: 80,
  },
  {
    package: "reflex",
    name: "Reflex",
    category: "framework",
    defaultRunCommand: "reflex run",
    defaultPort: 3000,
    priority: 80,
  },
  { package: "sqlalchemy", name: "SQLAlchemy", category: "database", priority: 10 },
  { package: "celery", name: "Celery", category: "other", priority: 10 },
  { package: "redis", name: "Redis", category: "database", priority: 10 },
  { package: "jinja2", name: "Jinja2", category: "other", priority: 10 },
];

/**
 * Parse dependencies from requirements.txt, pyproject.toml, or Pipfile.
 */
async function parsePythonDeps(projectPath: string): Promise<Set<string>> {
  const deps = new Set<string>();

  // requirements.txt
  const reqTxt = await safeReadFile(join(projectPath, "requirements.txt"));
  if (reqTxt) {
    for (const line of reqTxt.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("-")) {
        // Extract package name (before ==, >=, <=, ~=, etc.)
        const match = trimmed.match(/^([a-zA-Z0-9_-]+)/);
        if (match) {
          deps.add(match[1].toLowerCase().replace(/-/g, "_"));
        }
      }
    }
  }

  // pyproject.toml — basic parsing for dependencies
  const pyproject = await safeReadFile(join(projectPath, "pyproject.toml"));
  if (pyproject) {
    // Look for dependencies = [...] or [project.dependencies]
    const depMatches = pyproject.matchAll(
      /["']([a-zA-Z0-9_-]+)(?:\[.*?\])?(?:[><=~!]+.*?)?["']/g,
    );
    for (const match of depMatches) {
      deps.add(match[1].toLowerCase().replace(/-/g, "_"));
    }
  }

  // Pipfile — basic parsing
  const pipfile = await safeReadFile(join(projectPath, "Pipfile"));
  if (pipfile) {
    const packageMatches = pipfile.matchAll(
      /^([a-zA-Z0-9_-]+)\s*=/gm,
    );
    for (const match of packageMatches) {
      deps.add(match[1].toLowerCase().replace(/-/g, "_"));
    }
  }

  return deps;
}

export class PythonDetector implements StackDetector {
  readonly name = "python";

  async applies(projectPath: string): Promise<boolean> {
    return (
      (await pathExists(join(projectPath, "requirements.txt"))) ||
      (await pathExists(join(projectPath, "pyproject.toml"))) ||
      (await pathExists(join(projectPath, "Pipfile"))) ||
      (await pathExists(join(projectPath, "setup.py"))) ||
      (await pathExists(join(projectPath, "manage.py")))
    );
  }

  async detect(projectPath: string): Promise<DetectorResult> {
    const deps = await parsePythonDeps(projectPath);
    const techStack: TechStackItem[] = [
      { name: "Python", category: "language" },
    ];

    let bestFramework: PythonFrameworkRule | null = null;

    for (const rule of PYTHON_RULES) {
      const normalizedPkg = rule.package.toLowerCase().replace(/-/g, "_");
      if (deps.has(normalizedPkg)) {
        techStack.push({
          name: rule.name,
          category: rule.category,
        });
        if (
          rule.category === "framework" &&
          (!bestFramework || rule.priority > bestFramework.priority)
        ) {
          bestFramework = rule;
        }
      }
    }

    // Django-specific: detect manage.py even without requirements.txt
    if (
      !bestFramework &&
      (await pathExists(join(projectPath, "manage.py")))
    ) {
      techStack.push({ name: "Django", category: "framework" });
      bestFramework = PYTHON_RULES.find((r) => r.package === "django")!;
    }

    const runCommand =
      bestFramework?.defaultRunCommand ?? "python app.py";
    const port = bestFramework?.defaultPort ?? 8000;

    const confidence = bestFramework ? 0.8 : deps.size > 0 ? 0.5 : 0.2;

    const frameworkNames = techStack
      .filter((t) => t.category === "framework")
      .map((t) => t.name);

    log.info(
      `Detected Python project: ${frameworkNames.join(", ") || "plain Python"}`,
    );

    return {
      techStack,
      routes: [],
      runCommand,
      port,
      hasAuth: deps.has("django_allauth") || deps.has("flask_login"),
      confidence,
      summary: `Python project using ${frameworkNames.join(", ") || "no specific framework"}`,
    };
  }
}
