"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { audioManager } from "@/lib/audio-client";
import { SupportedLang, VoiceGender } from "@/lib/voice-config";

interface VoicePlayerProps {
  textToSpeak: string;
  language: SupportedLang;
}

export default function SaharaVoicePlayer({ textToSpeak, language }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioManager.stop();
      setIsPlaying(false);
    } else {
      audioManager.playNaturalVoice(textToSpeak, language, voiceGender, (playing, loading) => {
        setIsPlaying(playing);
        setIsLoading(loading);
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Primary Listen Action */}
      <button
        onClick={handleTogglePlay}
        disabled={isLoading || !textToSpeak.trim()}
        aria-label={isPlaying ? "Stop Voice Narration" : "Listen in natural voice"}
        className={`min-h-[52px] px-5 py-3 rounded-2xl font-bold flex items-center gap-2 border-2 transition shadow-sm ${
          isPlaying
            ? "bg-amber-600 text-white border-amber-700 animate-pulse"
            : "bg-blue-600 hover:bg-blue-700 text-white border-blue-800"
        } disabled:opacity-50`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Preparing Voice...</span>
          </>
        ) : isPlaying ? (
          <>
            <VolumeX className="w-6 h-6" />
            <span>Stop Speaking</span>
          </>
        ) : (
          <>
            <Volume2 className="w-6 h-6" />
            <span>{language === "hi" ? "सुनें (Listen)" : "Listen"}</span>
          </>
        )}
      </button>

      {/* Voice Gender Toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-300" role="group" aria-label="Voice Selection">
        <button
          type="button"
          onClick={() => {
            audioManager.stop();
            setIsPlaying(false);
            setVoiceGender("female");
          }}
          className={`px-3 py-2 text-sm font-bold rounded-lg transition ${
            voiceGender === "female" ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          👩 Didi / Female
        </button>
        <button
          type="button"
          onClick={() => {
            audioManager.stop();
            setIsPlaying(false);
            setVoiceGender("male");
          }}
          className={`px-3 py-2 text-sm font-bold rounded-lg transition ${
            voiceGender === "male" ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          👨 Bhaiya / Male
        </button>
      </div>
    </div>
  );
}
