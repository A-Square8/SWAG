import { describe, it, expect } from "vitest";
import {
  renderPipeline,
  renderFlowchart,
  renderArchitectureDiagram,
  renderDependencyTree,
  renderLayerStack,
} from "../../src/core/diagrams/index.js";

describe("Diagram Engine (Pure inline SVG)", () => {
  it("should render a linear pipeline with steps and arrows", () => {
    const steps = [
      { label: "Lint", status: "completed" as const, duration: "100ms" },
      { label: "Build", status: "completed" as const, duration: "1.2s" },
      { label: "Test", status: "running" as const, duration: "Running" },
      { label: "Deploy", status: "pending" as const },
    ];
    const svg = renderPipeline(steps, { title: "CI/CD Deployment Flow" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("CI/CD Deployment Flow");
    expect(svg).toContain("Lint");
    expect(svg).toContain("Build");
    expect(svg).toContain("Test");
    expect(svg).toContain("pipeline-arrow");
    expect(svg).toContain("</svg>");
  });

  it("should render a flowchart with process and decision nodes", () => {
    const nodes = [
      { id: "start", label: "Start", type: "start" as const },
      { id: "auth", label: "Is Authenticated?", type: "decision" as const },
      { id: "dash", label: "Show Dashboard", type: "process" as const },
    ];
    const edges = [
      { from: "start", to: "auth" },
      { from: "auth", to: "dash", label: "YES" },
    ];
    const svg = renderFlowchart(nodes, edges, { title: "Auth Flowchart" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Auth Flowchart");
    expect(svg).toContain("Is Authenticated?");
    expect(svg).toContain("Show Dashboard");
    expect(svg).toContain("YES");
    expect(svg).toContain("<polygon"); // Diamond
  });

  it("should render an architecture diagram with services and connections", () => {
    const services = [
      { id: "client", name: "Next.js Web", category: "client" as const, x: 50, y: 150 },
      { id: "gateway", name: "Kong Gateway", category: "gateway" as const, x: 260, y: 150 },
      { id: "api", name: "FastAPI Core", category: "service" as const, x: 480, y: 100 },
      { id: "db", name: "PostgreSQL", category: "database" as const, x: 480, y: 220 },
    ];
    const connections = [
      { from: "client", to: "gateway", label: "HTTPS" },
      { from: "gateway", to: "api", label: "gRPC" },
      { from: "api", to: "db", label: "SQL" },
    ];
    const svg = renderArchitectureDiagram(services, connections, {
      title: "Microservices Architecture",
      subtitle: "High-throughput edge topology",
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Microservices Architecture");
    expect(svg).toContain("Next.js Web");
    expect(svg).toContain("Kong Gateway");
    expect(svg).toContain("PostgreSQL");
    expect(svg).toContain("HTTPS");
  });

  it("should render a dependency tree", () => {
    const tree = {
      name: "root-package",
      version: "1.0.0",
      children: [
        {
          name: "@modelcontextprotocol/sdk",
          version: "1.12.0",
        },
        {
          name: "playwright",
          version: "1.49.0",
          children: [
            { name: "playwright-core", version: "1.49.0" },
          ],
        },
      ],
    };
    const svg = renderDependencyTree(tree, { title: "Dependency Tree" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("root-package");
    expect(svg).toContain("@modelcontextprotocol/sdk");
    expect(svg).toContain("playwright-core");
  });

  it("should render a layer stack", () => {
    const layers = [
      { name: "Presentation Layer", description: "React / HTML5 Canvas", color: "#38bdf8" },
      { name: "Application Gateway", description: "Node.js ESM Stdio RPC", color: "#6366f1" },
      { name: "Persistence Layer", description: "Local Filesystem & Git", color: "#10b981" },
    ];
    const svg = renderLayerStack(layers, { title: "System Stack" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Presentation Layer");
    expect(svg).toContain("Application Gateway");
    expect(svg).toContain("Persistence Layer");
  });
});
