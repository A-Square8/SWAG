import { describe, it, expect } from "vitest";
import {
  renderMacBookFrame,
  renderIPhoneFrame,
  renderIPadFrame,
  renderMultiDeviceFrame,
} from "../../src/core/frames/index.js";
import {
  renderDotGrid,
  renderCircuitBoard,
  renderMeshGradient,
  renderNoiseTexture,
  renderTopographic,
} from "../../src/core/patterns/index.js";

describe("Device Frames & Background Patterns", () => {
  it("should render a MacBook frame with lid and camera notch", () => {
    const html = renderMacBookFrame("<img src='screen.png' />", { urlBar: "myproject.dev" });
    expect(html).toContain("macbook-screen-lid");
    expect(html).toContain("macbook-camera-notch");
    expect(html).toContain("myproject.dev");
    expect(html).toContain("macbook-base");
  });

  it("should render an iPhone frame with Dynamic Island", () => {
    const html = renderIPhoneFrame("<img src='mobile.png' />");
    expect(html).toContain("iphone-body");
    expect(html).toContain("iphone-island");
    expect(html).toContain("iphone-home-indicator");
  });

  it("should render an iPad frame", () => {
    const html = renderIPadFrame("<img src='tablet.png' />");
    expect(html).toContain("ipad-body");
    expect(html).toContain("ipad-screen");
  });

  it("should render multi-device laptop and mobile composition", () => {
    const html = renderMultiDeviceFrame({
      laptopContent: "<img src='desk.png' />",
      phoneContent: "<img src='mob.png' />",
      laptopUrl: "app.acme.com",
    });
    expect(html).toContain("swag-multi-device-stage");
    expect(html).toContain("stage-laptop");
    expect(html).toContain("stage-phone");
  });

  it("should render dot grid background pattern", () => {
    const pattern = renderDotGrid();
    expect(pattern).toContain("swag-pattern-dotgrid");
    expect(pattern).toContain("<pattern id=\"dotGridPattern\"");
  });

  it("should render circuit board pattern with traces and nodes", () => {
    const pattern = renderCircuitBoard();
    expect(pattern).toContain("swag-pattern-circuit");
    expect(pattern).toContain("<pattern id=\"circuitPattern\"");
    expect(pattern).toContain("<circle cx=\"50\" cy=\"30\"");
  });

  it("should render mesh gradient blobs", () => {
    const pattern = renderMeshGradient();
    expect(pattern).toContain("swag-pattern-mesh");
    expect(pattern).toContain("mesh-blob");
    expect(pattern).toContain("radial-gradient");
  });

  it("should render noise texture SVG filter", () => {
    const pattern = renderNoiseTexture();
    expect(pattern).toContain("swag-pattern-noise");
    expect(pattern).toContain("<filter id=\"noiseFilter\"");
    expect(pattern).toContain("feTurbulence");
  });

  it("should render topographic contour pattern", () => {
    const pattern = renderTopographic();
    expect(pattern).toContain("swag-pattern-topographic");
    expect(pattern).toContain("<pattern id=\"topoPattern\"");
  });
});
