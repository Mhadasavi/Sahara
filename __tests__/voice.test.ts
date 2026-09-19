import {
  cleanTextForSpeech,
  getEdgeRateString,
  EDGE_VOICE_MAP,
  SAHARA_VOICE_PROFILES,
} from "../lib/voice-config";

describe("Sahara Voice Engine Configuration & Utilities", () => {
  describe("Speed Rate Conversions", () => {
    test("Maps 0.75x speed to -25% SSML playback rate for slow, clear speech", () => {
      expect(getEdgeRateString(0.75)).toBe("-25%");
    });

    test("Maps 1.0x speed to +0% SSML playback rate for standard speech", () => {
      expect(getEdgeRateString(1.0)).toBe("+0%");
    });

    test("Maps 0.9x speed to -10% SSML playback rate as senior comfortable default", () => {
      expect(getEdgeRateString(0.9)).toBe("-10%");
      expect(getEdgeRateString(0.85)).toBe("-10%");
    });
  });

  describe("Text Sanitization for Speech Synthesis", () => {
    test("Strips visual emojis that cause TTS engines to speak artifact labels like 'Memo'", () => {
      const rawText = "📝 Message Summary: Your bill is paid.";
      const cleaned = cleanTextForSpeech(rawText);
      expect(cleaned).toBe("Message Summary: Your bill is paid.");
      expect(cleaned).not.toContain("📝");
    });

    test("Strips protective badges and alert emojis", () => {
      const rawText = "🛡️ Alert: 🔴 Potentially Risky message detected. ⚠️ Please verify.";
      const cleaned = cleanTextForSpeech(rawText);
      expect(cleaned).not.toContain("🛡️");
      expect(cleaned).not.toContain("🔴");
      expect(cleaned).not.toContain("⚠️");
      expect(cleaned).toContain("Alert: Potentially Risky message detected. Please verify.");
    });

    test("Handles empty or null string gracefully", () => {
      expect(cleanTextForSpeech("")).toBe("");
      expect(cleanTextForSpeech("   ")).toBe("");
    });
  });

  describe("Voice Profiles and Locale Mapping", () => {
    test("Provides high-fidelity Indian Hindi voices (Swara Female, Madhur Male)", () => {
      expect(EDGE_VOICE_MAP.hi.female).toBe("hi-IN-SwaraNeural");
      expect(EDGE_VOICE_MAP.hi.male).toBe("hi-IN-MadhurNeural");
    });

    test("Provides Indian English and Hinglish voices (Neerja Female, Prabhat Male)", () => {
      expect(EDGE_VOICE_MAP.hinglish.female).toBe("en-IN-NeerjaNeural");
      expect(EDGE_VOICE_MAP.hinglish.male).toBe("en-IN-PrabhatNeural");
      expect(EDGE_VOICE_MAP.en.female).toBe("en-IN-NeerjaNeural");
      expect(EDGE_VOICE_MAP.en.male).toBe("en-IN-PrabhatNeural");
    });

    test("Contains valid Google Cloud TTS profiles for all supported languages", () => {
      expect(SAHARA_VOICE_PROFILES.hi.female.languageCode).toBe("hi-IN");
      expect(SAHARA_VOICE_PROFILES.hi.female.ssmlGender).toBe("FEMALE");
      expect(SAHARA_VOICE_PROFILES.hi.male.ssmlGender).toBe("MALE");
      expect(SAHARA_VOICE_PROFILES.en.female.languageCode).toBe("en-IN");
      expect(SAHARA_VOICE_PROFILES.hinglish.male.languageCode).toBe("en-IN");
    });
  });
});
