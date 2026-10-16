/**
 * Platform Analytics & Publishing Best Practices Metadata.
 * Provides character limits, optimal hashtag counts, posting windows, and engagement guidelines.
 */

export interface PlatformMetadata {
  platform: "instagram-post" | "instagram-reel" | "youtube" | "twitter" | "linkedin" | "github";
  maxCaptionLength: number;
  recommendedCaptionLength: number;
  maxHashtags: number;
  optimalHashtagCount: number;
  idealAspectRatios: string[];
  bestPostingTimes: string[];
  tips: string[];
}

export const PLATFORM_GUIDELINES: Record<string, PlatformMetadata> = {
  "instagram-post": {
    platform: "instagram-post",
    maxCaptionLength: 2200,
    recommendedCaptionLength: 150,
    maxHashtags: 30,
    optimalHashtagCount: 5,
    idealAspectRatios: ["4:5", "1:1"],
    bestPostingTimes: ["09:00-11:00 EST", "18:00-20:00 EST"],
    tips: [
      "Use carousels for higher save & share rates.",
      "Lead with a strong hook in the first 125 characters before the 'more' cut.",
      "Put hashtags in the caption or first comment.",
    ],
  },
  "instagram-reel": {
    platform: "instagram-reel",
    maxCaptionLength: 2200,
    recommendedCaptionLength: 120,
    maxHashtags: 30,
    optimalHashtagCount: 4,
    idealAspectRatios: ["9:16"],
    bestPostingTimes: ["11:00-13:00 EST", "19:00-21:00 EST"],
    tips: [
      "Hook viewers within the first 3 seconds.",
      "Keep text within Reels safe zones (avoid bottom 20% and right 15%).",
      "Always include on-screen captions for silent viewing.",
    ],
  },
  youtube: {
    platform: "youtube",
    maxCaptionLength: 5000,
    recommendedCaptionLength: 400,
    maxHashtags: 15,
    optimalHashtagCount: 3,
    idealAspectRatios: ["16:9"],
    bestPostingTimes: ["14:00-16:00 EST (Thurs/Fri)"],
    tips: [
      "Include timestamps / chapters in description.",
      "Front-load search keywords in first 2 lines of description.",
      "Add repository links and social links in description.",
    ],
  },
  twitter: {
    platform: "twitter",
    maxCaptionLength: 280,
    recommendedCaptionLength: 220,
    maxHashtags: 4,
    optimalHashtagCount: 2,
    idealAspectRatios: ["16:9", "1:1"],
    bestPostingTimes: ["08:00-10:00 EST", "12:00-13:00 EST"],
    tips: [
      "Keep text punchy and direct.",
      "Include media image/video to double impression rate.",
      "Leave room for RT commentary.",
    ],
  },
  linkedin: {
    platform: "linkedin",
    maxCaptionLength: 3000,
    recommendedCaptionLength: 600,
    maxHashtags: 5,
    optimalHashtagCount: 3,
    idealAspectRatios: ["1:1", "4:5"],
    bestPostingTimes: ["07:30-08:30 EST (Tue/Wed/Thu)"],
    tips: [
      "Structure with clear line breaks.",
      "Share business and architectural learnings.",
      "Tag collaborators and tools used.",
    ],
  },
  github: {
    platform: "github",
    maxCaptionLength: 1000,
    recommendedCaptionLength: 200,
    maxHashtags: 0,
    optimalHashtagCount: 0,
    idealAspectRatios: ["2:1 (1280x640)"],
    bestPostingTimes: ["Anytime"],
    tips: [
      "Use 1280x640 social preview image with high contrast title and logo.",
    ],
  },
};

export function getPlatformMetadata(platform: string): PlatformMetadata {
  return PLATFORM_GUIDELINES[platform] || PLATFORM_GUIDELINES["instagram-post"];
}
