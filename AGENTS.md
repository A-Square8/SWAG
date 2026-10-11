# SWAG — Agent Conventions

## Project Overview
SWAG is an MCP server (stdio, TypeScript) that turns a portfolio project into publishable social media content (Instagram posts, Reels, YouTube videos). It works with any MCP client.

## Hard Rules
1. **No LLM calls inside SWAG.** All creative reasoning is done by the host agent's LLM. SWAG returns structured schemas, the agent fills them, SWAG validates and renders.
2. **No MCP sampling.** Many clients don't support it. Never use `sampling/createMessage`.
3. **No secrets in logs.** Use the safe logger (`src/utils/logger.ts`) everywhere.
4. **No API keys required.** Default TTS is keyless (edge-tts). Cloud TTS providers read keys from env vars only if the user opts in.

## Tech Stack
- **Language:** TypeScript (strict mode), ESM modules
- **Runtime:** Node.js ≥ 18
- **MCP SDK:** `@modelcontextprotocol/sdk` (stdio transport)
- **Validation:** Zod (runtime + static types)
- **Browser:** Playwright (capture + image rendering)
- **Video:** Remotion (primary) / FFmpeg (fallback)
- **TTS:** edge-tts (default, keyless)
- **Build:** tsup
- **Test:** Vitest

## Code Conventions

### File naming
- Lowercase kebab-case: `analyze-project.ts`, `port-utils.ts`
- One tool per file in `src/tools/`
- Types in `src/types/` (one file per domain: `project.ts`, `asset.ts`, etc.)

### Imports
- ESM only (`import` / `export`), no CommonJS
- Use `.js` extensions in relative imports (required for ESM)
- Group: node builtins → external packages → internal (with blank lines between)

### Types
- Prefer `interface` over `type` for object shapes
- Export all types from `src/types/index.ts` barrel
- Zod schemas live next to their type definitions, named `{TypeName}Schema`
- Derive TypeScript types from Zod when possible: `type Foo = z.infer<typeof FooSchema>`

### Error Handling
- All tool handlers must catch errors and return structured error responses (never throw into MCP transport)
- Use `SwagError` class hierarchy (`src/utils/errors.ts`) with error codes
- Error messages must be actionable — tell the agent what to fix

### Tool Registration
- Each tool file exports a `register(server: McpServer)` function
- Tool names use `snake_case`: `analyze_project`, `capture_project`
- All tool inputs validated with Zod before processing
- All tool outputs include a `success: boolean` field

### Logging
- Use `logger` from `src/utils/logger.ts`
- Levels: `debug`, `info`, `warn`, `error`
- Never log secrets, API keys, tokens, passwords, or full file contents

### Testing
- Unit tests: `test/unit/{module}.test.ts`
- E2E tests: `test/e2e/{flow}.test.ts`
- Test fixtures: `test/fixtures/`
- Use descriptive test names: `it("should detect Next.js from package.json dependencies")`

### Config
- Project config: `swag.config.json` in project root
- Global brand: `~/.swag/brand.json`
- Project state: `.swag/` directory in project root
- Always provide sensible defaults when config is absent

### Output
- All outputs go to `swag-output/` (configurable)
- Never overwrite — version number increments
- Every output gets a `metadata.json`

## File Structure Quick Reference
```
src/
  index.ts          — Entry point
  server.ts         — MCP server setup
  tools/            — One file per MCP tool
  core/             — Shared business logic (GUI + tools)
    analyzer/       — Project analysis
    runner/         — Dev server management
    capturer/       — Playwright capture
    assets/         — Asset catalog
    theme/          — Theme engine
    brand/          — Brand kit
    styles/         — Style presets
    renderer/       — Render pipeline
    tts/            — TTS providers
    output/         — Output management
    config/         — Config loading
  types/            — TypeScript interfaces + Zod schemas
  utils/            — Shared utilities
  gui/              — Web dashboard
```

## Milestone Status
- [x] M0: Architecture plan approved
- [x] M1: MCP skeleton + analyze_project
- [x] M2: Run + capture + assets + privacy blur
- [x] M3: Theming + styles + brand kit + Instagram posts
- [x] M4: Reels + outro
- [x] M5: YouTube pipeline
- [x] M6: GUI
- [x] M7: Tests, docs, packaging — COMPLETE
