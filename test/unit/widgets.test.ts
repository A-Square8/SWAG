import { describe, it, expect } from "vitest";
import {
  renderTerminal,
  renderCodeDiff,
  renderGitGraph,
  renderFileTree,
  renderApiEndpoints,
  renderBadgeWall,
} from "../../src/core/widgets/dev-widgets.js";
import {
  renderTestimonial,
  renderStarRating,
  renderTweetEmbed,
  renderFeatureMatrix,
} from "../../src/core/widgets/social-widgets.js";
import {
  renderQRCode,
  renderWatermark,
  renderGradientText,
} from "../../src/core/widgets/branding.js";

describe("Developer & Social Proof Widgets", () => {
  it("should render terminal window with prompt and output lines", () => {
    const html = renderTerminal([
      "$ npm test",
      "✓ 57 tests passed (0 failures)",
    ], { title: "zsh — 80x24" });

    expect(html).toContain("swag-terminal-window");
    expect(html).toContain("zsh — 80x24");
    expect(html).toContain("npm test");
    expect(html).toContain("57 tests passed");
  });

  it("should render code diff viewer with green additions and red deletions", () => {
    const diff = [
      { type: "del" as const, content: "const val = slowMath();" },
      { type: "add" as const, content: "const val = fastMath();" },
    ];
    const html = renderCodeDiff(diff, { filename: "math.ts" });

    expect(html).toContain("swag-code-diff");
    expect(html).toContain("math.ts");
    expect(html).toContain("diff-del");
    expect(html).toContain("diff-add");
  });

  it("should render git commit graph with branches and hashes", () => {
    const commits = [
      { hash: "f3a21bc99", message: "Initial release", tag: "v1.0" },
      { hash: "c89b41ef0", message: "Update documentation" },
    ];
    const svg = renderGitGraph(commits);

    expect(svg).toContain("<svg");
    expect(svg).toContain("swag-git-graph");
    expect(svg).toContain("f3a21bc");
    expect(svg).toContain("Initial release");
  });

  it("should render file tree with folders and files", () => {
    const tree = [
      {
        name: "src",
        type: "folder" as const,
        children: [
          { name: "index.ts", type: "file" as const, comment: "Entry point" },
        ],
      },
    ];
    const html = renderFileTree(tree);

    expect(html).toContain("swag-file-tree");
    expect(html).toContain("src");
    expect(html).toContain("index.ts");
    expect(html).toContain("// Entry point");
  });

  it("should render API endpoint method badges", () => {
    const endpoints = [
      { method: "GET" as const, path: "/api/v1/posts", description: "List posts" },
      { method: "POST" as const, path: "/api/v1/posts", status: 201 },
    ];
    const html = renderApiEndpoints(endpoints);

    expect(html).toContain("GET");
    expect(html).toContain("POST");
    expect(html).toContain("/api/v1/posts");
  });

  it("should render Shields.io-style status badge wall", () => {
    const badges = [
      { label: "build", value: "passing", color: "green" },
      { label: "coverage", value: "99%", color: "blue" },
    ];
    const html = renderBadgeWall(badges);

    expect(html).toContain("swag-badge-wall");
    expect(html).toContain("build");
    expect(html).toContain("passing");
  });

  it("should render testimonial card with author and quote", () => {
    const html = renderTestimonial({
      quote: "This is a masterpiece.",
      author: "Sarah Connor",
      role: "Lead Engineer",
      company: "Cyberdyne Systems",
    });

    expect(html).toContain("swag-testimonial-card");
    expect(html).toContain("This is a masterpiece.");
    expect(html).toContain("Sarah Connor");
    expect(html).toContain("Cyberdyne Systems");
  });

  it("should render star rating with review count", () => {
    const html = renderStarRating({ rating: 4.9, reviewCount: "350" });
    expect(html).toContain("swag-star-rating");
    expect(html).toContain("4.9");
    expect(html).toContain("(350 reviews)");
  });

  it("should render tweet/post card embed", () => {
    const html = renderTweetEmbed({
      authorName: "Dan Abramov",
      handle: "@dan_abramov",
      content: "This project is fantastic.",
      verified: true,
      likes: "1.2K",
    });

    expect(html).toContain("swag-tweet-card");
    expect(html).toContain("Dan Abramov");
    expect(html).toContain("@dan_abramov");
    expect(html).toContain("1.2K");
  });

  it("should render feature matrix comparison table with checkmarks and crosses", () => {
    const items = [
      { feature: "Zero Dependencies", us: true, competitor1: false },
      { feature: "High Performance", us: true, competitor1: true },
    ];
    const html = renderFeatureMatrix(items, { ourName: "SWAG", competitor1Name: "Other" });

    expect(html).toContain("swag-feature-matrix");
    expect(html).toContain("Zero Dependencies");
    expect(html).toContain("SWAG");
    expect(html).toContain("Other");
    expect(html).toContain("val-check");
    expect(html).toContain("val-cross");
  });

  it("should render valid SVG QR code without external dependencies", () => {
    const svg = renderQRCode("https://github.com/swag/project", { label: "SCAN TO VIEW" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("swag-qr-card");
    expect(svg).toContain("SCAN TO VIEW");
    expect(svg).toContain("<rect");
  });

  it("should render watermark overlay and gradient text", () => {
    const wm = renderWatermark({ text: "SWAG MCP" });
    expect(wm).toContain("swag-watermark-overlay");
    expect(wm).toContain("SWAG MCP");

    const gt = renderGradientText("Hyper Speed", { tag: "h1" });
    expect(gt).toContain("<h1");
    expect(gt).toContain("swag-gradient-text");
    expect(gt).toContain("Hyper Speed");
  });
});
