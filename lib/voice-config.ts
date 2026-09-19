export type VoiceGender = "female" | "male";
export type SupportedLang = "hi" | "en" | "hinglish";

export interface VoiceProfile {
  languageCode: string;
  name: string;
  description: string;
  ssmlGender: "FEMALE" | "MALE";
}

export const SAHARA_VOICE_PROFILES: Record<SupportedLang, Record<VoiceGender, VoiceProfile>> = {
  hi: {
    female: {
      languageCode: "hi-IN",
      name: "hi-IN-Chirp3-HD-Achernar",
      description: "Natural, warm Indian Hindi (Female)",
      ssmlGender: "FEMALE",
    },
    male: {
      languageCode: "hi-IN",
      name: "hi-IN-Chirp3-HD-Puck",
      description: "Gentle, authoritative Indian Hindi (Male)",
      ssmlGender: "MALE",
    },
  },
  hinglish: {
    female: {
      languageCode: "en-IN",
      name: "en-IN-Neural2-A",
      description: "Clear conversational Indian English/Hinglish (Female)",
      ssmlGender: "FEMALE",
    },
    male: {
      languageCode: "en-IN",
      name: "en-IN-Neural2-B",
      description: "Friendly Indian English/Hinglish (Male)",
      ssmlGender: "MALE",
    },
  },
  en: {
    female: {
      languageCode: "en-IN",
      name: "en-IN-Neural2-A",
      description: "Clear Indian English (Female)",
      ssmlGender: "FEMALE",
    },
    male: {
      languageCode: "en-IN",
      name: "en-IN-Neural2-B",
      description: "Clear Indian English (Male)",
      ssmlGender: "MALE",
    },
  },
};

export const EDGE_VOICE_MAP: Record<SupportedLang, Record<VoiceGender, string>> = {
  hi: {
    male: "hi-IN-MadhurNeural",
    female: "hi-IN-SwaraNeural",
  },
  hinglish: {
    male: "en-IN-PrabhatNeural",
    female: "en-IN-NeerjaNeural",
  },
  en: {
    male: "en-IN-PrabhatNeural",
    female: "en-IN-NeerjaNeural",
  },
};

export function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[🛡⚡🚆📝✅❌🟢🟡🔴⚠️🙏👋📌📞🔍]/g, "")
    .replace(/^[\s\-–—:.,]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getEdgeRateString(speed: number): string {
  if (speed === 0.75) return "-25%";
  if (speed === 1.0) return "+0%";
  return "-10%"; // default 0.9x comfortable senior speed
}

