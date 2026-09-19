import { SupportedLang, VoiceGender } from "./voice-config";

export function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[🛡⚡🚆📝✅❌🟢🟡🔴⚠️🙏👋📌📞🔍]/g, "")
    .replace(/^[\s\-–—:.,]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

class SaharaAudioManager {
  private activeAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>(); // Key: Hash -> Data URI
  private isSpeakingSpeechSynth = false;

  constructor() {
    // Pre-load voices if in browser
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  public async playNaturalVoice(
    text: string,
    language: SupportedLang,
    gender: VoiceGender = "female",
    onStateChange?: (isPlaying: boolean, isLoading: boolean) => void
  ): Promise<void> {
    this.stop();

    const spokenText = cleanTextForSpeech(text);
    const cacheKey = `${language}_${gender}_${spokenText}`;

    // Step 1: Check memory cache to avoid redundant API calls
    if (this.audioCache.has(cacheKey)) {
      this.playBase64(this.audioCache.get(cacheKey)!, onStateChange);
      return;
    }

    onStateChange?.(false, true);

    try {
      // Step 2: Fetch natural Chirp 3 / Neural2 audio from API
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: spokenText, language, gender }),
      });

      if (!res.ok) throw new Error("API voice generation unsuccessful");

      const data = await res.json();
      if (!data.audioContent) throw new Error("No audio payload returned");

      const audioUri = `data:audio/mp3;base64,${data.audioContent}`;
      this.audioCache.set(cacheKey, audioUri);
      this.playBase64(audioUri, onStateChange);
    } catch (err) {
      console.warn("Natural voice API unavailable. Engaging native browser speech fallback.", err);
      onStateChange?.(false, false);
      this.playBrowserFallback(text, language, gender, onStateChange);
    }
  }

  private playBase64(
    audioUri: string,
    onStateChange?: (isPlaying: boolean, isLoading: boolean) => void
  ) {
    this.activeAudio = new Audio(audioUri);
    onStateChange?.(true, false);

    this.activeAudio.onended = () => {
      onStateChange?.(false, false);
      this.activeAudio = null;
    };

    this.activeAudio.onerror = () => {
      onStateChange?.(false, false);
      this.activeAudio = null;
    };

    this.activeAudio.play().catch((e) => {
      console.error("Playback error:", e);
      onStateChange?.(false, false);
    });
  }

  private getMatchingVoice(isHindi: boolean, gender: VoiceGender): SpeechSynthesisVoice | null {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Filter candidate voices by language
    let langCandidates = voices.filter((v) => {
      const l = v.lang.toLowerCase().replace("_", "-");
      const name = v.name.toLowerCase();
      if (isHindi) {
        return l.startsWith("hi") || name.includes("hindi") || name.includes("devanagari");
      } else {
        return l.startsWith("en-in") || name.includes("india") || name.includes("indian");
      }
    });

    // If no specific Indian voice found, fallback to any English or all voices
    if (langCandidates.length === 0) {
      langCandidates = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
    }
    if (langCandidates.length === 0) {
      langCandidates = voices;
    }

    // Gender keywords
    const maleKeywords = [
      "male",
      "man",
      "guy",
      "boy",
      "madhur",
      "ravi",
      "prabhat",
      "hemant",
      "david",
      "mark",
      "george",
    ];
    const femaleKeywords = [
      "female",
      "woman",
      "girl",
      "swara",
      "heera",
      "neerja",
      "kalpana",
      "zira",
      "susan",
      "hazel",
      "priya",
      "aditi",
    ];

    if (gender === "male") {
      const maleVoice = langCandidates.find((v) => {
        const n = v.name.toLowerCase();
        return maleKeywords.some((k) => n.includes(k));
      });
      if (maleVoice) return maleVoice;
    } else {
      const femaleVoice = langCandidates.find((v) => {
        const n = v.name.toLowerCase();
        return femaleKeywords.some((k) => n.includes(k));
      });
      if (femaleVoice) return femaleVoice;
    }

    return langCandidates[0] || null;
  }

  private playBrowserFallback(
    text: string,
    language: SupportedLang,
    gender: VoiceGender = "female",
    onStateChange?: (isPlaying: boolean, isLoading: boolean) => void
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onStateChange?.(false, false);
      return;
    }

    window.speechSynthesis.cancel();

    const spokenText = cleanTextForSpeech(text);

    // Check if text contains Devanagari script
    const hasDevanagari = /[\u0900-\u097F]/.test(spokenText);
    const isHindi = hasDevanagari || language === "hi";

    const utterance = new SpeechSynthesisUtterance(spokenText);
    const voice = this.getMatchingVoice(isHindi, gender);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = isHindi ? "hi-IN" : "en-IN";
    }

    // Explicit pitch differential guarantees distinct gender tone even on single-voice machines
    if (gender === "male") {
      utterance.pitch = 0.80; // Deep, calm masculine cadence (Bhaiya)
      utterance.rate = 0.85;
    } else {
      utterance.pitch = 1.15; // Bright, gentle feminine cadence (Didi)
      utterance.rate = 0.88;
    }

    this.isSpeakingSpeechSynth = true;

    utterance.onstart = () => {
      this.isSpeakingSpeechSynth = true;
      onStateChange?.(true, false);
    };

    utterance.onend = () => {
      this.isSpeakingSpeechSynth = false;
      onStateChange?.(false, false);
    };

    utterance.onerror = (e) => {
      this.isSpeakingSpeechSynth = false;
      onStateChange?.(false, false);
      console.warn("SpeechSynthesis error:", e);
    };

    // Small delay ensures previous cancel() is fully flushed in Chromium
    setTimeout(() => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      }
    }, 40);
  }

  public stop(): void {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.isSpeakingSpeechSynth = false;
      window.speechSynthesis.cancel();
    }
  }
}

export const audioManager = new SaharaAudioManager();
