import { describe, it, expect } from "vitest";
import { BrandKitManager } from "../../src/core/brand/index.js";
import { BrandKitSchema } from "../../src/types/brand.js";

describe("BrandKitManager & BrandKitSchema", () => {
  it("should normalize string logo paths cleanly into LogoConfig", () => {
    const raw = {
      brandName: "Dirt Cheap Projects",
      logo: "/path/to/DCP_logo.png",
      socials: [{ platform: "instagram", handle: "@dirt_cheap_projects" }],
    };

    const parsed = BrandKitSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.logo?.filePath).toBe("/path/to/DCP_logo.png");
      expect(parsed.data.brandName).toBe("Dirt Cheap Projects");
    }
  });

  it("should support logoPath alias key", () => {
    const raw = {
      brandName: "Acme Corp",
      logoPath: "assets/logo.png",
    };

    const parsed = BrandKitSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.logo?.filePath).toBe("assets/logo.png");
    }
  });

  it("should preserve full LogoConfig objects intact", () => {
    const raw = {
      brandName: "Acme Corp",
      logo: {
        filePath: "custom/logo.svg",
        position: "top-left",
        size: 64,
        opacity: 0.8,
      },
    };

    const parsed = BrandKitSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.logo?.filePath).toBe("custom/logo.svg");
      expect(parsed.data.logo?.position).toBe("top-left");
      expect(parsed.data.logo?.size).toBe(64);
    }
  });
});
