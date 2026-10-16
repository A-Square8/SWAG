import { describe, it, expect } from "vitest";
import {
  renderBarChart,
  renderPieChart,
  renderLineGraph,
  renderRadarChart,
  renderProgressRing,
  renderSparkline,
  renderHeatmap,
} from "../../src/core/charts/index.js";

describe("Chart Engine (Pure inline SVG)", () => {
  it("should render a horizontal bar chart with labels and values", () => {
    const data = [
      { label: "React", value: 85, formattedValue: "85%" },
      { label: "Vue", value: 65, formattedValue: "65%" },
      { label: "Svelte", value: 45, formattedValue: "45%" },
    ];
    const svg = renderBarChart(data, { title: "Framework Popularity", layout: "horizontal" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Framework Popularity");
    expect(svg).toContain("React");
    expect(svg).toContain("Vue");
    expect(svg).toContain("Svelte");
    expect(svg).toContain("85%");
    expect(svg).toContain("</svg>");
  });

  it("should render a vertical bar chart", () => {
    const data = [
      { label: "Q1", value: 120 },
      { label: "Q2", value: 240 },
    ];
    const svg = renderBarChart(data, { layout: "vertical" });
    expect(svg).toContain("<svg");
    expect(svg).toContain("Q1");
    expect(svg).toContain("Q2");
  });

  it("should handle empty data gracefully in bar chart", () => {
    const svg = renderBarChart([]);
    expect(svg).toContain("<svg");
    expect(svg).toContain("No data");
  });

  it("should render a donut pie chart with legend", () => {
    const data = [
      { label: "Frontend", value: 50, color: "#38bdf8" },
      { label: "Backend", value: 30, color: "#6366f1" },
      { label: "Database", value: 20, color: "#10b981" },
    ];
    const svg = renderPieChart(data, { title: "Code Distribution", donut: true, showLegend: true });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Code Distribution");
    expect(svg).toContain("Frontend");
    expect(svg).toContain("Backend");
    expect(svg).toContain("Database");
    expect(svg).toContain("<path");
  });

  it("should render a multi-series line graph with grid", () => {
    const series = [
      {
        name: "Stars",
        color: "#f59e0b",
        data: [
          { x: "Jan", y: 100 },
          { x: "Feb", y: 250 },
          { x: "Mar", y: 600 },
        ],
      },
    ];
    const svg = renderLineGraph(series, { title: "GitHub Stars Growth", showArea: true, showDots: true });

    expect(svg).toContain("<svg");
    expect(svg).toContain("GitHub Stars Growth");
    expect(svg).toContain("Jan");
    expect(svg).toContain("Mar");
    expect(svg).toContain("<line");
    expect(svg).toContain("<circle");
  });

  it("should render a radar chart with multiple dimensions", () => {
    const dimensions = [
      { axis: "Performance", value: 95 },
      { axis: "Security", value: 90 },
      { axis: "Scalability", value: 85 },
      { axis: "DX", value: 98 },
    ];
    const svg = renderRadarChart(dimensions, { title: "Architecture Strengths" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Architecture Strengths");
    expect(svg).toContain("Performance");
    expect(svg).toContain("DX");
    expect(svg).toContain("<polygon");
  });

  it("should render a circular progress ring", () => {
    const svg = renderProgressRing(92, { label: "92%", sublabel: "LIGHTHOUSE" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("92%");
    expect(svg).toContain("LIGHTHOUSE");
    expect(svg).toContain("stroke-dasharray");
    expect(svg).toContain("stroke-dashoffset");
  });

  it("should render a compact sparkline trend", () => {
    const values = [10, 25, 45, 30, 60, 85, 95];
    const svg = renderSparkline(values, { color: "#10b981" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("<path");
    expect(svg).toContain("#10b981");
  });

  it("should render a heatmap grid", () => {
    const items = [
      { row: 0, col: 0, value: 0.8 },
      { row: 1, col: 2, value: 0.5 },
      { row: 2, col: 3, value: 1.0 },
    ];
    const svg = renderHeatmap(items, { title: "Commit Activity", rows: 3, cols: 5 });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Commit Activity");
    expect(svg).toContain("<rect");
  });
});
