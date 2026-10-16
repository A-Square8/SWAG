/**
 * Style Presets — provides guidance, tone, vocabulary, and visual pacing
 * for the host agent's LLM to generate content.
 */

import type { StylePreset } from "../../types/index.js";

export const PROFESSIONAL_STYLE: StylePreset = {
  id: "professional",
  name: "Professional",
  builtIn: true,
  tone: {
    voice: "Authoritative, clear, engineering-focused, and concise.",
    vocabulary: "Architecture, scalability, performance, modularity, type-safety, resilience.",
    emojiUsage: "minimal",
    hashtagStyle: "Technical keywords and tech stack tags (#webdev #typescript #softwarearchitecture)",
    hookStyle: "Highlighting a concrete engineering challenge, solution, or architecture decision.",
    exampleHook: "How we achieved zero-runtime overhead with our new reactive pipeline.",
  },
  visual: {
    templateSet: "professional",
    motionIntensity: "subtle",
    transitionSet: ["fade", "slide-right"],
    pacingBPM: 90,
    captionStyle: "boxed",
  },
  defaults: {
    slideCount: { min: 4, max: 7 },
    reelDuration: { min: 25, max: 45 },
    videoDuration: { min: 180, max: 240 },
    hashtagCount: 5,
  },
};

export const CASUAL_STYLE: StylePreset = {
  id: "casual",
  name: "Casual",
  builtIn: true,
  tone: {
    voice: "Approachable, conversational, engaging, friendly developer peer.",
    vocabulary: "Built, shipped, smooth, fast, clean, simple, check it out.",
    emojiUsage: "moderate",
    hashtagStyle: "Popular dev tags (#buildinpublic #devlife #indiehackers #coding)",
    hookStyle: "Sharing a relatable story or showing the immediate 'aha' moment.",
    exampleHook: "I was tired of slow builds, so I spent the weekend fixing it.",
  },
  visual: {
    templateSet: "casual",
    motionIntensity: "moderate",
    transitionSet: ["slide-up", "fade"],
    pacingBPM: 110,
    captionStyle: "highlight",
  },
  defaults: {
    slideCount: { min: 4, max: 6 },
    reelDuration: { min: 20, max: 40 },
    videoDuration: { min: 150, max: 210 },
    hashtagCount: 7,
  },
};

export const MINIMALIST_STYLE: StylePreset = {
  id: "minimalist",
  name: "Minimalist",
  builtIn: true,
  tone: {
    voice: "Understated, direct, zero fluff, typography-focused.",
    vocabulary: "Essential, pure, distilled, refined, uncompromised.",
    emojiUsage: "none",
    hashtagStyle: "Minimal, niche curation (#minimalism #designengineering #cleanui)",
    hookStyle: "A single bold statement or thought-provoking observation.",
    exampleHook: "Simplicity is the ultimate sophistication.",
  },
  visual: {
    templateSet: "minimalist",
    motionIntensity: "subtle",
    transitionSet: ["fade"],
    pacingBPM: 80,
    captionStyle: "minimal",
  },
  defaults: {
    slideCount: { min: 3, max: 5 },
    reelDuration: { min: 15, max: 30 },
    videoDuration: { min: 120, max: 180 },
    hashtagCount: 3,
  },
};

export const ARTISTIC_STYLE: StylePreset = {
  id: "artistic",
  name: "Artistic",
  builtIn: true,
  tone: {
    voice: "Expressive, creative, design-centric, imaginative.",
    vocabulary: "Craft, aesthetic, visual rhythm, tactile, polished, vibrant.",
    emojiUsage: "moderate",
    hashtagStyle: "Creative and UI inspiration tags (#uiux #creativecoding #designsystem #generativeart)",
    hookStyle: "Focusing on the craft, beauty, and interaction design of the interface.",
    exampleHook: "Crafting digital experiences that feel tangible.",
  },
  visual: {
    templateSet: "artistic",
    motionIntensity: "dynamic",
    transitionSet: ["scale", "slide-up"],
    pacingBPM: 120,
    captionStyle: "karaoke",
  },
  defaults: {
    slideCount: { min: 5, max: 8 },
    reelDuration: { min: 30, max: 60 },
    videoDuration: { min: 180, max: 240 },
    hashtagCount: 8,
  },
};

export const HUMOROUS_STYLE: StylePreset = {
  id: "humorous",
  name: "Humorous",
  builtIn: true,
  tone: {
    voice: "Witty, tongue-in-cheek, self-deprecating developer humor.",
    vocabulary: "Bugs, features, coffee, git push --force, stacks, stack overflow.",
    emojiUsage: "heavy",
    hashtagStyle: "Meme and dev humor hashtags (#programmerhumor #codingmemes #100daysofcode)",
    hookStyle: "Punchy joke, ironic statement, or relatable pain point.",
    exampleHook: "Works on my machine™ — and now on yours too.",
  },
  visual: {
    templateSet: "humorous",
    motionIntensity: "dynamic",
    transitionSet: ["pop", "slide-right"],
    pacingBPM: 125,
    captionStyle: "highlight",
  },
  defaults: {
    slideCount: { min: 4, max: 6 },
    reelDuration: { min: 15, max: 35 },
    videoDuration: { min: 120, max: 180 },
    hashtagCount: 8,
  },
};

export const STORYTELLER_STYLE: StylePreset = {
  id: "storyteller",
  name: "Storyteller",
  builtIn: true,
  tone: {
    voice: "Compelling narrative arc, dramatic tension, problem-to-breakthrough journey.",
    vocabulary: "Journey, discovery, bottleneck, turning point, breakthrough, resolution.",
    emojiUsage: "minimal",
    hashtagStyle: "Narrative & tech journey tags (#devstory #buildjourney #techjourney)",
    hookStyle: "Narrative tension or personal struggle that led to a solution.",
    exampleHook: "We had a problem that cost us 3 days of downtime — here's how we solved it.",
  },
  visual: {
    templateSet: "storyteller",
    motionIntensity: "moderate",
    transitionSet: ["fade", "slide-up"],
    pacingBPM: 95,
    captionStyle: "highlight",
  },
  defaults: {
    slideCount: { min: 5, max: 8 },
    reelDuration: { min: 35, max: 60 },
    videoDuration: { min: 180, max: 300 },
    hashtagCount: 6,
  },
};

export const TUTORIAL_STYLE: StylePreset = {
  id: "tutorial",
  name: "Tutorial",
  builtIn: true,
  tone: {
    voice: "Pedagogical, clear step-by-step guidance, encouraging, structured.",
    vocabulary: "Step, configure, install, execute, verify, prerequisite, output.",
    emojiUsage: "moderate",
    hashtagStyle: "Educational tech tags (#learntocode #webdevtips #codingtutorial)",
    hookStyle: "Direct promise of a practical skill acquired in minutes.",
    exampleHook: "Build and deploy a full-stack MCP server in under 5 minutes.",
  },
  visual: {
    templateSet: "tutorial",
    motionIntensity: "subtle",
    transitionSet: ["slide-right", "fade"],
    pacingBPM: 100,
    captionStyle: "boxed",
  },
  defaults: {
    slideCount: { min: 5, max: 9 },
    reelDuration: { min: 30, max: 55 },
    videoDuration: { min: 240, max: 360 },
    hashtagCount: 6,
  },
};

export const HYPE_STYLE: StylePreset = {
  id: "hype",
  name: "Hype Beast",
  builtIn: true,
  tone: {
    voice: "High-octane, punchy, trend-aware, breathless excitement.",
    vocabulary: "Insane, 10x, game-changer, revolutionary, unreal, unlock, supercharged.",
    emojiUsage: "heavy",
    hashtagStyle: "Trending dev and AI tags (#technews #nextlevel #devhype #viral)",
    hookStyle: "Jaw-dropping claim or bold superlatives that stop the scroll immediately.",
    exampleHook: "This tool is INSANE 🔥 Let me show you what it does in 30 seconds.",
  },
  visual: {
    templateSet: "hype",
    motionIntensity: "dynamic",
    transitionSet: ["pop", "scale"],
    pacingBPM: 135,
    captionStyle: "karaoke",
  },
  defaults: {
    slideCount: { min: 4, max: 6 },
    reelDuration: { min: 15, max: 30 },
    videoDuration: { min: 120, max: 180 },
    hashtagCount: 10,
  },
};

export const CORPORATE_STYLE: StylePreset = {
  id: "corporate",
  name: "Corporate",
  builtIn: true,
  tone: {
    voice: "Executive-ready, enterprise-safe, polished, metric-driven, formal.",
    vocabulary: "ROI, operational efficiency, compliance, throughput, enterprise, stakeholders.",
    emojiUsage: "none",
    hashtagStyle: "B2B and enterprise hashtags (#enterprisetech #cloudnative #b2b #fintech)",
    hookStyle: "Stating business impact, cost reduction, or compliance enhancement.",
    exampleHook: "Introducing a solution that reduces cloud infrastructure costs by 42%.",
  },
  visual: {
    templateSet: "corporate",
    motionIntensity: "subtle",
    transitionSet: ["fade"],
    pacingBPM: 85,
    captionStyle: "minimal",
  },
  defaults: {
    slideCount: { min: 4, max: 6 },
    reelDuration: { min: 20, max: 40 },
    videoDuration: { min: 150, max: 210 },
    hashtagCount: 4,
  },
};

export const INDIE_STYLE: StylePreset = {
  id: "indie",
  name: "Indie Hacker",
  builtIn: true,
  tone: {
    voice: "Authentic, raw, build-in-public, humble yet ambitious, transparent.",
    vocabulary: "Shipped, MRR, solo dev, weekend project, customer feedback, bootstrap.",
    emojiUsage: "moderate",
    hashtagStyle: "Indie hacker community (#buildinpublic #indiehackers #solodev #bootstrap)",
    hookStyle: "Sharing unfiltered numbers, timeline, or honest retrospective.",
    exampleHook: "Month 3 of building this in public as a solo developer: here is what I shipped.",
  },
  visual: {
    templateSet: "indie",
    motionIntensity: "moderate",
    transitionSet: ["slide-up", "fade"],
    pacingBPM: 105,
    captionStyle: "highlight",
  },
  defaults: {
    slideCount: { min: 4, max: 7 },
    reelDuration: { min: 25, max: 45 },
    videoDuration: { min: 150, max: 240 },
    hashtagCount: 7,
  },
};

export const ALL_STYLE_PRESETS: StylePreset[] = [
  PROFESSIONAL_STYLE,
  CASUAL_STYLE,
  MINIMALIST_STYLE,
  ARTISTIC_STYLE,
  HUMOROUS_STYLE,
  STORYTELLER_STYLE,
  TUTORIAL_STYLE,
  HYPE_STYLE,
  CORPORATE_STYLE,
  INDIE_STYLE,
];
