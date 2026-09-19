import { NextRequest, NextResponse } from "next/server";
import { SAHARA_VOICE_PROFILES, SupportedLang, VoiceGender } from "@/lib/voice-config";

const GOOGLE_TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language = "hi", gender = "female" } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text string is required for speech synthesis." }, { status: 400 });
    }

    // Protect token bandwidth: Truncate spoken narrative to 800 characters
    const sanitizedText = text.trim().substring(0, 800);

    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Google Cloud Text-to-Speech API key configuration. Falling back to browser speech." },
        { status: 503 }
      );
    }

    const targetLang: SupportedLang = ["hi", "en", "hinglish"].includes(language) ? language : "hi";
    const targetGender: VoiceGender = gender === "male" ? "male" : "female";
    const selectedVoice = SAHARA_VOICE_PROFILES[targetLang][targetGender];

    // Payload configuration for Google Cloud TTS API
    const requestPayload = {
      input: { text: sanitizedText },
      voice: {
        languageCode: selectedVoice.languageCode,
        name: selectedVoice.name,
        ssmlGender: selectedVoice.ssmlGender,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.9, // Slightly slower cadence tailored for elderly listeners
        pitch: 0.0,
      },
    };

    const ttsResponse = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!ttsResponse.ok) {
      const errDetails = await ttsResponse.text();
      console.warn("Chirp 3 HD failed or returned error, attempting fallback to Neural2...", errDetails);

      // Graceful fallback to Neural2 if Chirp 3 HD quota or access is restricted
      const fallbackPayload = {
        input: { text: sanitizedText },
        voice: {
          languageCode: targetLang === "hi" ? "hi-IN" : "en-IN",
          name: targetLang === "hi" ? "hi-IN-Neural2-A" : "en-IN-Neural2-A",
        },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.9 },
      };

      const fallbackRes = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallbackPayload),
      });

      if (!fallbackRes.ok) {
        throw new Error(`Google Cloud TTS failed: ${await fallbackRes.text()}`);
      }

      const fallbackData = await fallbackRes.json();
      return NextResponse.json({ audioContent: fallbackData.audioContent, voiceUsed: "Neural2 Fallback" });
    }

    const ttsData = await ttsResponse.json();
    return NextResponse.json({
      audioContent: ttsData.audioContent, // Base64 MP3 payload
      voiceUsed: selectedVoice.name,
    });
  } catch (error: any) {
    console.error("Voice Generation Route Error:", error);
    return NextResponse.json(
      { error: "Could not generate natural voice.", details: error.message },
      { status: 500 }
    );
  }
}
