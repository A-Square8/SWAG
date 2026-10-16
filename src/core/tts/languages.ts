/**
 * Multi-Language TTS Voice Directory for Edge TTS.
 * Maps language codes to natural sounding neural voices.
 */

export interface VoiceProfile {
  code: string;
  language: string;
  voice: string;
  gender: "male" | "female";
}

export const SUPPORTED_LANGUAGES: Record<string, VoiceProfile> = {
  en: {
    code: "en-US",
    language: "English (US)",
    voice: "en-US-ChristopherNeural",
    gender: "male",
  },
  "en-gb": {
    code: "en-GB",
    language: "English (UK)",
    voice: "en-GB-RyanNeural",
    gender: "male",
  },
  es: {
    code: "es-ES",
    language: "Spanish (Spain)",
    voice: "es-ES-AlvaroNeural",
    gender: "male",
  },
  fr: {
    code: "fr-FR",
    language: "French (France)",
    voice: "fr-FR-HenriNeural",
    gender: "male",
  },
  de: {
    code: "de-DE",
    language: "German (Germany)",
    voice: "de-DE-KillianNeural",
    gender: "male",
  },
  ja: {
    code: "ja-JP",
    language: "Japanese (Japan)",
    voice: "ja-JP-KeitaNeural",
    gender: "male",
  },
  ko: {
    code: "ko-KR",
    language: "Korean (Korea)",
    voice: "ko-KR-InJoonNeural",
    gender: "male",
  },
  zh: {
    code: "zh-CN",
    language: "Chinese (Mandarin)",
    voice: "zh-CN-YunxiNeural",
    gender: "male",
  },
  pt: {
    code: "pt-BR",
    language: "Portuguese (Brazil)",
    voice: "pt-BR-AntonioNeural",
    gender: "male",
  },
  hi: {
    code: "hi-IN",
    language: "Hindi (India)",
    voice: "hi-IN-MadhurNeural",
    gender: "male",
  },
  it: {
    code: "it-IT",
    language: "Italian (Italy)",
    voice: "it-IT-DiegoNeural",
    gender: "male",
  },
};

export function getVoiceForLanguage(langCode: string): string {
  const normalized = langCode.toLowerCase().trim();
  const entry = SUPPORTED_LANGUAGES[normalized] || SUPPORTED_LANGUAGES[normalized.split("-")[0]];
  return entry ? entry.voice : SUPPORTED_LANGUAGES.en.voice;
}
