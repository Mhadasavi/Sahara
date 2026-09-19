import { SupportedLang, VoiceGender } from "./voice-config";

class SaharaAudioManager {
  private activeAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>(); // Key: Hash -> Data URI

  public async playNaturalVoice(
    text: string,
    language: SupportedLang,
    gender: VoiceGender = "female",
    onStateChange?: (isPlaying: boolean, isLoading: boolean) => void
  ): Promise<void> {
    this.stop();

    const cacheKey = `${language}_${gender}_${text.trim()}`;

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
        body: JSON.stringify({ text, language, gender }),
      });

      if (!res.ok) throw new Error("API voice generation unsuccessful");

      const data = await res.json();
      if (!data.audioContent) throw new Error("No audio payload returned");

      const audioUri = `data:audio/mp3;base64,${data.audioContent}`;
      this.audioCache.set(cacheKey, audioUri);
      this.playBase64(audioUri, onStateChange);
    } catch (err) {
      console.warn("Natural voice unavailable. Engaging native browser fallback speech.", err);
      onStateChange?.(false, false);
      this.playBrowserFallback(text, language, onStateChange);
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

  private playBrowserFallback(
    text: string,
    language: SupportedLang,
    onStateChange?: (isPlaying: boolean, isLoading: boolean) => void
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onStateChange?.(false, false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";

    utterance.onstart = () => onStateChange?.(true, false);
    utterance.onend = () => {
      onStateChange?.(false, false);
    };
    utterance.onerror = () => {
      onStateChange?.(false, false);
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioManager = new SaharaAudioManager();
