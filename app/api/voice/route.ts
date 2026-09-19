import { NextRequest, NextResponse } from "next/server";
import {
  SAHARA_VOICE_PROFILES,
  EDGE_VOICE_MAP,
  SupportedLang,
  VoiceGender,
  cleanTextForSpeech,
  getEdgeRateString,
} from "@/lib/voice-config";

const GOOGLE_TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";

async function synthesizeWithEdge(text: string, voiceName: string, rate: string = "-10%"): Promise<string> {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate });
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    audioStream.on("end", () => {
      const fullBuffer = Buffer.concat(chunks);
      resolve(fullBuffer.toString("base64"));
    });
    audioStream.on("error", (err: any) => reject(err));
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language = "hi", gender = "female", speed = 0.9 } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text string is required for speech synthesis." }, { status: 400 });
    }

    // Strip visual emojis (like 📝 which TTS reads as "Memo") and truncate to 800 chars
    const sanitizedText = cleanTextForSpeech(text).substring(0, 800);
    const targetLang: SupportedLang = ["hi", "en", "hinglish"].includes(language) ? language : "hi";
    const targetGender: VoiceGender = gender === "male" ? "male" : "female";
    const parsedSpeed = speed === 0.75 ? 0.75 : speed === 1.0 ? 1.0 : 0.9;
    const edgeRate = getEdgeRateString(parsedSpeed);

    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY || process.env.GEMINI_API_KEY;

    // 1. If Google Cloud API Key is explicitly provided, attempt Google Cloud TTS
    if (apiKey) {
      try {
        const selectedVoice = SAHARA_VOICE_PROFILES[targetLang][targetGender];
        const requestPayload = {
          input: { text: sanitizedText },
          voice: {
            languageCode: selectedVoice.languageCode,
            name: selectedVoice.name,
            ssmlGender: selectedVoice.ssmlGender,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: parsedSpeed,
            pitch: targetGender === "male" ? -2.0 : 0.0,
          },
        };

        const ttsResponse = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });

        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          if (ttsData.audioContent) {
            return NextResponse.json({
              audioContent: ttsData.audioContent,
              voiceUsed: selectedVoice.name,
            });
          }
        }
      } catch (cloudErr) {
        console.warn("Google Cloud TTS failed, falling back to natural neural voice engine...", cloudErr);
      }
    }

    // 2. High-Fidelity Natural Voice Engine (Madhur for Indian Hindi Male, Swara for Hindi Female)
    const edgeVoice = EDGE_VOICE_MAP[targetLang][targetGender];
    const base64Audio = await synthesizeWithEdge(sanitizedText, edgeVoice, edgeRate);

    return NextResponse.json({
      audioContent: base64Audio,
      voiceUsed: edgeVoice,
    });
  } catch (error: any) {
    console.error("Voice Generation Route Error:", error);
    return NextResponse.json(
      { error: "Could not generate natural voice.", details: error.message },
      { status: 500 }
    );
  }
}
