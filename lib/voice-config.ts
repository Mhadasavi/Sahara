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
