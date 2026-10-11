import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyzeProject } from "../../src/core/analyzer/index.js";
import { NodeDetector } from "../../src/core/analyzer/detectors/node.js";
import { PythonDetector } from "../../src/core/analyzer/detectors/python.js";
import { StaticDetector } from "../../src/core/analyzer/detectors/static.js";

describe("Analyzer Detectors", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-analyzer-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("NodeDetector", () => {
    const detector = new NodeDetector();

    it("should detect Next.js from package.json dependencies", async () => {
      await writeFile(
        join(tempDir, "package.json"),
        JSON.stringify({
          name: "my-next-app",
          dependencies: {
            next: "^14.0.0",
            react: "^18.2.0",
            "react-dom": "^18.2.0",
            tailwindcss: "^3.3.0",
          },
          scripts: {
            dev: "next dev",
          },
        }),
      );

      const applies = await detector.applies(tempDir);
      expect(applies).toBe(true);

      const result = await detector.detect(tempDir);
      expect(result.techStack.some((t) => t.name === "Next.js")).toBe(true);
      expect(result.techStack.some((t) => t.name === "React")).toBe(true);
      expect(result.techStack.some((t) => t.name === "Tailwind CSS")).toBe(true);
      expect(result.runCommand).toBe("npm run dev");
      expect(result.port).toBe(3000);
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it("should detect Vite React TypeScript project", async () => {
      await writeFile(
        join(tempDir, "package.json"),
        JSON.stringify({
          name: "vite-react-app",
          devDependencies: {
            vite: "^5.0.0",
            typescript: "^5.0.0",
          },
          dependencies: {
            react: "^18.2.0",
          },
          scripts: {
            dev: "vite",
          },
        }),
      );
      await writeFile(join(tempDir, "tsconfig.json"), "{}");

      const result = await detector.detect(tempDir);
      expect(result.techStack.some((t) => t.name === "Vite")).toBe(true);
      expect(result.techStack.some((t) => t.name === "TypeScript")).toBe(true);
      expect(result.runCommand).toBe("npm run dev");
      expect(result.port).toBe(5173);
    });

    it("should detect pnpm package manager if pnpm-lock.yaml is present", async () => {
      await writeFile(
        join(tempDir, "package.json"),
        JSON.stringify({
          name: "pnpm-app",
          dependencies: {
            react: "^18.0.0",
          },
          scripts: {
            dev: "react-scripts start",
          },
        }),
      );
      await writeFile(join(tempDir, "pnpm-lock.yaml"), "");

      const result = await detector.detect(tempDir);
      expect(result.packageManager).toBe("pnpm");
      expect(result.runCommand).toBe("pnpm run dev");
    });
  });

  describe("PythonDetector", () => {
    const detector = new PythonDetector();

    it("should detect FastAPI from requirements.txt", async () => {
      await writeFile(
        join(tempDir, "requirements.txt"),
        "fastapi==0.109.0\nuvicorn>=0.27.0\nsqlalchemy\n",
      );

      const applies = await detector.applies(tempDir);
      expect(applies).toBe(true);

      const result = await detector.detect(tempDir);
      expect(result.techStack.some((t) => t.name === "FastAPI")).toBe(true);
      expect(result.techStack.some((t) => t.name === "SQLAlchemy")).toBe(true);
      expect(result.techStack.some((t) => t.name === "Python")).toBe(true);
      expect(result.runCommand).toBe("uvicorn main:app --reload");
      expect(result.port).toBe(8000);
    });

    it("should detect Streamlit from requirements.txt", async () => {
      await writeFile(
        join(tempDir, "requirements.txt"),
        "streamlit>=1.30.0\n",
      );

      const result = await detector.detect(tempDir);
      expect(result.techStack.some((t) => t.name === "Streamlit")).toBe(true);
      expect(result.runCommand).toBe("streamlit run app.py");
      expect(result.port).toBe(8501);
    });
  });

  describe("StaticDetector", () => {
    const detector = new StaticDetector();

    it("should detect static index.html", async () => {
      await writeFile(join(tempDir, "index.html"), "<!DOCTYPE html><html><body>Hello</body></html>");

      const applies = await detector.applies(tempDir);
      expect(applies).toBe(true);

      const result = await detector.detect(tempDir);
      expect(result.techStack.some((t) => t.name === "HTML")).toBe(true);
      expect(result.routes[0].path).toBe("/");
    });
  });

  describe("analyzeProject orchestrator", () => {
    it("should analyze a full project including README features", async () => {
      await writeFile(
        join(tempDir, "package.json"),
        JSON.stringify({
          name: "portfolio-showcase",
          dependencies: {
            next: "^14.0.0",
            react: "^18.0.0",
          },
        }),
      );

      await writeFile(
        join(tempDir, "README.md"),
        `# Portfolio Showcase
A stunning developer portfolio built with Next.js and React.

## Features
- Real-time project previews
- Interactive dark mode toggle
- One-click contact modal
`,
      );

      const result = await analyzeProject({ projectPath: tempDir });
      expect(result.success).toBe(true);
      expect(result.profile.name).toBe("Portfolio Showcase");
      expect(result.profile.description).toContain("portfolio built with Next.js");
      expect(result.profile.features.length).toBe(3);
      expect(result.profile.features[0].name).toBe("Real-time project previews");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it("should allow hints to override run command and port", async () => {
      await writeFile(
        join(tempDir, "index.html"),
        "<html><body>Static</body></html>",
      );

      const result = await analyzeProject({
        projectPath: tempDir,
        hints: {
          runCommand: "python -m http.server 8080",
          port: 8080,
          projectName: "Custom Static Project",
        },
      });

      expect(result.profile.name).toBe("Custom Static Project");
      expect(result.profile.runCommand).toBe("python -m http.server 8080");
      expect(result.profile.port).toBe(8080);
    });
  });
});
