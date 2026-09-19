export function speakText(text: string, language: "en" | "hi" | "hinglish") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Audio readout is not supported on this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85; // Slower cadence for elder comprehension
  utterance.pitch = 1.0;

  if (language === "hi") {
    utterance.lang = "hi-IN";
  } else {
    utterance.lang = "en-IN";
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
