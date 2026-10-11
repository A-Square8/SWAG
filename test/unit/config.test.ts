import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "../../src/core/config/index.js";
import { SwagError } from "../../src/utils/errors.js";

describe("Config Loader", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-config-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should return default config when swag.config.json is absent", async () => {
    const config = await loadConfig(tempDir);
    expect(config.output?.directory).toBe("swag-output");
    expect(config.tts?.provider).toBe("edge-tts");
    expect(config.content?.hashtagCount).toBe(15);
  });

  it("should deep merge custom config over defaults", async () => {
    const customConfig = {
      defaultStyle: "artistic",
      output: {
        directory: "custom-export",
      },
      content: {
        hashtagCount: 20,
        fixedHashtags: ["#webdev", "#opensource"],
      },
    };

    await writeFile(
      join(tempDir, "swag.config.json"),
      JSON.stringify(customConfig),
    );

    const config = await loadConfig(tempDir);
    expect(config.defaultStyle).toBe("artistic");
    expect(config.output?.directory).toBe("custom-export");
    expect(config.content?.hashtagCount).toBe(20);
    expect(config.content?.deviceFrame).toBe("browser"); // preserved default
    expect(config.content?.fixedHashtags).toEqual(["#webdev", "#opensource"]);
  });

  it("should throw actionable SwagError on invalid config JSON", async () => {
    await writeFile(join(tempDir, "swag.config.json"), "{ invalid json ");

    await expect(loadConfig(tempDir)).rejects.toThrow(SwagError);
  });
});
