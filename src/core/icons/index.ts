/**
 * Professional Official Icons Engine for SWAG.
 * Resolves 120+ official brand and tech stack icons with fuzzy alias normalization.
 */

import { ICON_CATALOG, type IconDefinition } from "./catalog.js";

const ALIAS_MAP: Record<string, string> = {
  // Platforms & Socials
  yt: "youtube",
  youtube: "youtube",
  gh: "github",
  github: "github",
  ig: "instagram",
  insta: "instagram",
  instagram: "instagram",
  twitter: "x",
  x: "x",
  li: "linkedin",
  linkedin: "linkedin",
  dc: "discord",
  discord: "discord",
  web: "globe",
  website: "globe",
  url: "globe",
  globe: "globe",
  email: "mail",
  mail: "mail",
  package: "npm",
  npm: "npm",

  // Languages
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  py: "python",
  python: "python",
  python3: "python",
  rs: "rust",
  rust: "rust",
  go: "go",
  golang: "go",
  java: "java",
  cpp: "cpp",
  "c++": "cpp",
  cplusplus: "cpp",
  cs: "csharp",
  "c#": "csharp",
  csharp: "csharp",
  php: "php",
  rb: "ruby",
  ruby: "ruby",
  swift: "swift",
  kt: "kotlin",
  kotlin: "kotlin",
  html: "html5",
  html5: "html5",
  css: "css3",
  css3: "css3",
  sh: "bash",
  bash: "bash",
  shell: "bash",
  terminal: "terminal",

  // Frontend
  react: "react",
  reactjs: "react",
  "react.js": "react",
  next: "nextjs",
  nextjs: "nextjs",
  "next.js": "nextjs",
  vue: "vue",
  vuejs: "vue",
  "vue.js": "vue",
  nuxt: "nuxt",
  nuxtjs: "nuxt",
  "nuxt.js": "nuxt",
  svelte: "svelte",
  sveltekit: "svelte",
  angular: "angular",
  angularjs: "angular",
  solid: "solidjs",
  solidjs: "solidjs",
  astro: "astro",
  remix: "remix",
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",
  bootstrap: "bootstrap",
  sass: "sass",
  scss: "sass",
  vite: "vite",
  webpack: "webpack",
  redux: "redux",
  three: "threejs",
  threejs: "threejs",
  electron: "electron",
  flutter: "flutter",

  // Backend
  node: "nodejs",
  nodejs: "nodejs",
  "node.js": "nodejs",
  express: "express",
  expressjs: "express",
  fastapi: "fastapi",
  django: "django",
  flask: "flask",
  nest: "nestjs",
  nestjs: "nestjs",
  deno: "deno",
  bun: "bun",
  gql: "graphql",
  graphql: "graphql",
  springboot: "springboot",
  "spring boot": "springboot",
  spring: "springboot",
  laravel: "laravel",

  // Database
  postgres: "postgresql",
  postgresql: "postgresql",
  psql: "postgresql",
  mysql: "mysql",
  sqlite: "sqlite",
  mongo: "mongodb",
  mongodb: "mongodb",
  redis: "redis",
  supabase: "supabase",
  firebase: "firebase",
  prisma: "prisma",
  db: "database",
  database: "database",

  // DevOps & Cloud
  docker: "docker",
  k8s: "kubernetes",
  kubernetes: "kubernetes",
  aws: "aws",
  gcp: "gcp",
  googlecloud: "gcp",
  "google cloud": "gcp",
  azure: "azure",
  vercel: "vercel",
  netlify: "netlify",
  cloudflare: "cloudflare",
  linux: "linux",
  actions: "githubactions",
  "github actions": "githubactions",
  githubactions: "githubactions",
  nginx: "nginx",
  terraform: "terraform",
  playwright: "playwright",
  cypress: "cypress",
  jest: "jest",
  vitest: "vitest",
  wasm: "webassembly",
  webassembly: "webassembly",

  // UI & General
  check: "checkmark",
  checkmark: "checkmark",
  done: "checkmark",
  bolt: "zap",
  zap: "zap",
  lightning: "zap",
  speed: "zap",
  sparkles: "sparkles",
  magic: "sparkles",
  star: "star",
  server: "server",
  shield: "shield",
  security: "shield",
  play: "play",
  video: "video",
  camera: "camera",
  screenshot: "camera",
  layers: "layers",
  code: "code",

  // AI & Architecture
  ai: "sparkles",
  gemini: "sparkles",
  gradio: "layers",
  llm: "sparkles",
  adversarial: "shield",
  decision: "sparkles",
  debate: "sparkles",
  pipeline: "layers",
  architecture: "layers",
    // AI & Architecture
    secret: "shield",
    privacy: "shield",
    auth: "shield",
    concurrent: "zap",
    concurrency: "zap",
    reasoning: "sparkles",
};

export interface SvgRenderOptions {
  size?: number;
  width?: number;
  height?: number;
  color?: string; // CSS color string or 'currentColor'
  className?: string;
  style?: string;
}

export class IconEngine {
  /**
   * Normalize an arbitrary tech stack name or platform into catalog key.
   */
  public static resolveKey(query: string): string | undefined {
    if (!query) return undefined;
    const raw = query.toLowerCase().trim().replace(/^@/, "");

    // 1. Exact match on raw clean string
    const clean = raw.replace(/[\s\-_]+/g, "");
    if (ICON_CATALOG[clean]) return clean;
    if (ALIAS_MAP[clean]) return ALIAS_MAP[clean];

    // 2. Exact match on alpha-only (e.g. "python3.11" -> "python")
    const alphaOnly = clean.replace(/[^a-z]/g, "");
    if (ICON_CATALOG[alphaOnly]) return alphaOnly;
    if (ALIAS_MAP[alphaOnly]) return ALIAS_MAP[alphaOnly];

    // 3. Tokenize by words/punctuation and match individual tokens
    // e.g. "Gemini 1.5 Flash (Concurrent Reasoning)" -> ["gemini", "1.5", "flash", "concurrent", "reasoning"]
    const tokens = raw.split(/[\s,/:;()\[\]{}+&|\\_-]+/).filter(Boolean);
    for (const token of tokens) {
      const cleanToken = token.replace(/[^a-z0-9]/g, "");
      if (cleanToken) {
        if (ICON_CATALOG[cleanToken]) return cleanToken;
        if (ALIAS_MAP[cleanToken]) return ALIAS_MAP[cleanToken];

        const alphaToken = cleanToken.replace(/[^a-z]/g, "");
        if (alphaToken) {
          if (ICON_CATALOG[alphaToken]) return alphaToken;
          if (ALIAS_MAP[alphaToken]) return ALIAS_MAP[alphaToken];
        }
      }
    }

    // 4. Safe fuzzy substring match (strictly for length >= 4 to avoid 1-2 char false positives like "r")
    const candidateKeys = Object.keys(ICON_CATALOG).sort((a, b) => b.length - a.length);
    for (const key of candidateKeys) {
      if (key.length >= 4 && clean.includes(key)) {
        return key;
      }
    }

    // 5. Safe alias substring match for length >= 4
    const candidateAliases = Object.keys(ALIAS_MAP).sort((a, b) => b.length - a.length);
    for (const alias of candidateAliases) {
      if (alias.length >= 4 && clean.includes(alias)) {
        return ALIAS_MAP[alias];
      }
    }

    return undefined;
  }

  /**
   * Check if an icon exists for given name or query.
   */
  public static hasIcon(nameOrQuery: string): boolean {
    return this.resolveKey(nameOrQuery) !== undefined;
  }

  /**
   * Get raw IconDefinition.
   */
  public static getDefinition(nameOrQuery: string): IconDefinition | undefined {
    const key = this.resolveKey(nameOrQuery);
    return key ? ICON_CATALOG[key] : undefined;
  }

  /**
   * Get a complete, crisp inline SVG element for the icon.
   * If not found, falls back to a clean code/sparkles icon.
   */
  public static getSvg(nameOrQuery: string, options: SvgRenderOptions = {}): string {
    const def = this.getDefinition(nameOrQuery) || ICON_CATALOG.code;
    const width = options.width || options.size || 24;
    const height = options.height || options.size || 24;
    const color = options.color || def.defaultColor || "currentColor";
    const classAttr = options.className ? ` class="${options.className}"` : "";
    const styleAttr = options.style ? ` style="${options.style}"` : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.viewBox}" width="${width}" height="${height}" fill="none"${classAttr}${styleAttr} style="color: ${color}; display: inline-block; vertical-align: middle;">${def.body}</svg>`;
  }

  /**
   * Generate a base64 Data URL for the SVG (great for CSS background or img src).
   */
  public static getDataUrl(nameOrQuery: string, options: SvgRenderOptions = {}): string {
    const svg = this.getSvg(nameOrQuery, options);
    const base64 = Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Returns list of all official icon keys available.
   */
  public static listAvailableIcons(): string[] {
    return Object.keys(ICON_CATALOG);
  }
}
