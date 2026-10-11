import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ThemeEngine } from "../../src/core/theme/index.js";

describe("ThemeEngine", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "swag-theme-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should return default dark theme when no settings exist", async () => {
    const result = await ThemeEngine.getTheme(tempDir);
    expect(result.theme.id).toBe("dark");
    expect(result.theme.tokens.colors.background).toBe("#090d16");
    expect(result.contrastWarnings.length).toBe(0);
  });

  it("should detect theme from project .vscode/settings.json", async () => {
    const vscodeDir = join(tempDir, ".vscode");
    await mkdir(vscodeDir, { recursive: true });
    await writeFile(
      join(vscodeDir, "settings.json"),
      JSON.stringify({ "workbench.colorTheme": "Tokyo Night" }),
    );

    const result = await ThemeEngine.getTheme(tempDir);
    expect(result.autoDetected).toBe(true);
    expect(result.theme.id).toBe("ide-tokyo");
    expect(result.theme.tokens.colors.primary).toBe("#7aa2f7");
  });

  it("should save and reload custom theme in .swag/theme.json", async () => {
    await ThemeEngine.setTheme(tempDir, {
      name: "Custom Brand Theme",
      tokens: {
        colors: {
          background: "#050505",
          foreground: "#ffffff",
          primary: "#10b981",
        } as any,
      } as any,
    });

    const result = await ThemeEngine.getTheme(tempDir);
    expect(result.theme.name).toBe("Custom Brand Theme");
    expect(result.theme.tokens.colors.primary).toBe("#10b981");
    expect(result.theme.tokens.colors.background).toBe("#050505");
  });

  it("should switch between light and dark presets", async () => {
    const lightResult = await ThemeEngine.setTheme(tempDir, undefined, "light");
    expect(lightResult.theme.id).toBe("preset-light");
    expect(lightResult.theme.tokens.colors.background).toBe("#ffffff");

    const darkResult = await ThemeEngine.setTheme(tempDir, undefined, "dark");
    expect(darkResult.theme.id).toBe("preset-dark");
    expect(darkResult.theme.tokens.colors.background).toBe("#090d16");
  });
});
