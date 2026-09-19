"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Language } from "@/lib/types";

interface Props {
  language: Language;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const SpeechInputButton: React.FC<Props> = ({
  language,
  onTranscript,
  disabled = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set recognition language
    recognition.lang = language === "hi" ? "hi-IN" : language === "hinglish" ? "hi-IN" : "en-IN";

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      if (speechResult) {
        onTranscript(speechResult);
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang =
          language === "hi" ? "hi-IN" : language === "hinglish" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={toggleListening}
      title={
        isListening
          ? language === "hi"
            ? "सुनना बंद करें"
            : "Stop listening"
          : language === "hi"
          ? "बोलकर बताएं (आवाज इनपुट)"
          : "Press and speak (Voice input)"
      }
      className={`min-h-[52px] px-4 rounded-2xl font-black flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
        isListening
          ? "bg-red-600 text-white animate-pulse shadow-red-300 ring-4 ring-red-300"
          : "bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300"
      }`}
    >
      {isListening ? (
        <>
          <MicOff className="w-5 h-5 text-white animate-spin" />
          <span className="text-sm font-black">
            {language === "hi" ? "सुन रहा हूँ... बोलिए" : "Listening..."}
          </span>
        </>
      ) : (
        <>
          <Mic className="w-5 h-5 text-blue-700" />
          <span className="text-sm font-bold">
            {language === "hi" ? "बोलकर बताएं" : "Speak (Mic)"}
          </span>
        </>
      )}
    </button>
  );
};
