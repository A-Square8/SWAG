// Barrel export for all SWAG types
export type {
  Feature,
  TechStackItem,
  Route,
  ProjectProfile,
} from "./project.js";
export {
  FeatureSchema,
  TechStackItemSchema,
  RouteSchema,
  ProjectProfileSchema,
} from "./project.js";

export type { BlurRegion, Asset, AssetCatalog } from "./asset.js";
export {
  BlurRegionSchema,
  AssetSchema,
  AssetCatalogSchema,
} from "./asset.js";

export type { DesignTokens, Theme } from "./theme.js";
export { DesignTokensSchema, ThemeSchema } from "./theme.js";

export type {
  PlatformFilter,
  LogoConfig,
  SocialLink,
  OutroConfig,
  BrandKit,
} from "./brand.js";
export {
  PlatformFilterSchema,
  LogoConfigSchema,
  SocialLinkSchema,
  OutroConfigSchema,
  BrandKitSchema,
} from "./brand.js";

export type { StylePreset } from "./style.js";
export { StylePresetSchema } from "./style.js";

export type {
  PostSlide,
  PostPlan,
  ReelScene,
  CaptionConfig,
  ReelPlan,
  VideoSection,
  RawDemoConfig,
  YouTubeVideoPlan,
  PlatformPlan,
} from "./content.js";
export {
  PostSlideSchema,
  PostPlanSchema,
  ReelSceneSchema,
  CaptionConfigSchema,
  ReelPlanSchema,
  VideoSectionSchema,
  RawDemoConfigSchema,
  YouTubeVideoPlanSchema,
} from "./content.js";

export type {
  OutputEntry,
  PostRenderResult,
  ReelRenderResult,
  YouTubeRenderResult,
} from "./render.js";
export {
  OutputEntrySchema,
  PostRenderResultSchema,
  ReelRenderResultSchema,
  YouTubeRenderResultSchema,
} from "./render.js";

export type { TTSOptions, TTSResult } from "./tts.js";
export { TTSOptionsSchema, TTSResultSchema } from "./tts.js";

export type { SwagConfig } from "./config.js";
export { SwagConfigSchema } from "./config.js";
