"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Share2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Home,
  AlertTriangle,
  ArrowLeft,
  Copy,
  Image as ImageIcon,
  Send,
  Trash2,
  MessageCircle,
  PhoneCall,
  Pill,
  Receipt,
  Smartphone,
  Users,
} from "lucide-react";
import {
  TextSize,
  Language,
  AnalysisOutput,
  FeedItem,
  ThemeMode,
  CaregiverContact,
} from "@/lib/types";
import { audioManager } from "@/lib/audio-client";
import SaharaVoicePlayer from "@/components/SaharaVoicePlayer";
import { CaregiverSetupModal } from "@/components/CaregiverSetupModal";
import { WhatsAppShareModal } from "@/components/WhatsAppShareModal";
import { EmergencyDirectoryModal } from "@/components/EmergencyDirectoryModal";
import { CallerQuickCheckModal } from "@/components/CallerQuickCheckModal";
import { MedicinePillChecklist } from "@/components/MedicinePillChecklist";
import { SpeechInputButton } from "@/components/SpeechInputButton";
import { GuidedSmartphoneWalkthroughs } from "@/components/GuidedSmartphoneWalkthroughs";

export default function SaharaLiveApp() {
  const [textSize, setTextSize] = useState<TextSize>("large");
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [familyContacts, setFamilyContacts] = useState<CaregiverContact[]>([]);
  const [showWhatsAppShareModal, setShowWhatsAppShareModal] = useState(false);
  const [pendingShareText, setPendingShareText] = useState("");
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [taskIntent, setTaskIntent] = useState<string>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisOutput | null>(null);
  const [activePayload, setActivePayload] = useState<{
    content: string;
    imageBase64: string | null;
    imageMimeType: string | null;
    taskIntent: string;
  } | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCaregiverModal, setShowCaregiverModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showCallerCheckModal, setShowCallerCheckModal] = useState(false);
  const [showSmartphoneGuides, setShowSmartphoneGuides] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load feed, theme, and caregiver from local storage on client mount
  useEffect(() => {
    const saved = localStorage.getItem("sahara_feed");
    if (saved) {
      try {
        setFeedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Could not parse saved feed items:", e);
      }
    }

    const savedTheme = localStorage.getItem("sahara_theme") as ThemeMode | null;
    if (savedTheme && ["day", "midnight", "amber", "yellow_black"].includes(savedTheme)) {
      setTheme(savedTheme);
    }

    const savedFamily = localStorage.getItem("sahara_family_contacts");
    if (savedFamily) {
      try {
        const parsed = JSON.parse(savedFamily);
        if (Array.isArray(parsed)) {
          setFamilyContacts(parsed);
        }
      } catch (e) {
        console.error("Could not parse family contacts:", e);
      }
    } else {
      const savedCaregiver = localStorage.getItem("sahara_caregiver");
      if (savedCaregiver) {
        try {
          const parsed = JSON.parse(savedCaregiver);
          if (parsed?.name && parsed?.phone) {
            const migrated: CaregiverContact[] = [
              {
                id: "fam_legacy",
                name: parsed.name,
                phone: parsed.phone,
                relation: "Family / परिवार",
                isDefault: true,
              },
            ];
            setFamilyContacts(migrated);
            localStorage.setItem("sahara_family_contacts", JSON.stringify(migrated));
          }
        } catch (e) {
          console.error("Could not parse legacy caregiver contact:", e);
        }
      }
    }
  }, []);

  // Keyboard accessibility: Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowShareModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const compressAndResizeImage = (
    file: File,
    maxDim = 1280,
    quality = 0.82
  ): Promise<{ base64: string; mimeType: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Failed to decode image."));
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            const rawBase64 = (reader.result as string).split(",")[1];
            resolve({ base64: rawBase64, mimeType: file.type || "image/jpeg", name: file.name });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          const base64 = dataUrl.split(",")[1];
          resolve({
            base64,
            mimeType: "image/jpeg",
            name: file.name,
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressAndResizeImage(file);
      setSelectedImage(compressed);
    } catch (err) {
      console.warn("Image downscaling fallback to raw reader:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        setSelectedImage({
          base64: base64String,
          mimeType: file.type || "image/jpeg",
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const executeLiveAnalysis = async () => {
    if (!inputContent.trim() && !selectedImage) {
      alert("Please enter a message, question, or attach an image.");
      return;
    }

    audioManager.stop();
    setIsLoading(true);
    setWarnings([]);

    const payload = {
      content: inputContent,
      imageBase64: selectedImage?.base64 || null,
      imageMimeType: selectedImage?.mimeType || null,
      taskIntent,
    };
    setActivePayload(payload);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: payload.content,
          imageBase64: payload.imageBase64,
          imageMimeType: payload.imageMimeType,
          language,
          taskIntent: payload.taskIntent,
        }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Analysis request failed.");

      const output: AnalysisOutput = resData.data;
      setActiveAnalysis(output);
      setCurrentStepIdx(0);

      if (resData.detectedSensitives?.length > 0) {
        setWarnings(resData.detectedSensitives);
      }

      // Add to dynamic dashboard feed
      const newItem: FeedItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        analysis: output,
        sourceContent: payload.content,
        imageBase64: payload.imageBase64,
        imageMimeType: payload.imageMimeType,
        taskIntent: payload.taskIntent,
      };

      const updatedFeed = [newItem, ...feedItems];
      setFeedItems(updatedFeed);
      try {
        // Strip heavy imageBase64 when persisting to localStorage to avoid QuotaExceededError
        const storageFeed = updatedFeed.map((item) => ({
          ...item,
          imageBase64: null,
        }));
        localStorage.setItem("sahara_feed", JSON.stringify(storageFeed));
      } catch (storageErr) {
        console.warn("Could not persist feed to localStorage:", storageErr);
      }

      // Reset inputs
      setInputContent("");
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (language === newLang) return;
    setLanguage(newLang);
    audioManager.stop();

    // If an analysis is currently open, dynamically re-analyze in the newly selected language!
    if (activeAnalysis) {
      const payload = activePayload || {
        content: activeAnalysis.title + ". " + activeAnalysis.plain_summary,
        imageBase64: null,
        imageMimeType: null,
        taskIntent: "general",
      };

      setIsLoading(true);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: payload.content,
            imageBase64: payload.imageBase64,
            imageMimeType: payload.imageMimeType,
            language: newLang,
            taskIntent: payload.taskIntent,
          }),
        });

        const resData = await response.json();
        if (response.ok && resData.data) {
          setActiveAnalysis(resData.data);
          setCurrentStepIdx(0);
        }
      } catch (err) {
        console.error("Language re-analysis error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearFeed = () => {
    localStorage.removeItem("sahara_feed");
    setFeedItems([]);
  };

  const primaryContact = familyContacts.find((c) => c.isDefault) || familyContacts[0] || null;

  const shareOnWhatsApp = (text: string) => {
    if (!text) return;
    setPendingShareText(text);
    setShowWhatsAppShareModal(true);
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("sahara_theme", newTheme);
    } catch {
      // ignore
    }
  };

  const fontClasses = {
    normal: "text-base md:text-lg",
    large: "text-lg md:text-xl",
    xlarge: "text-xl md:text-2xl",
  };

  const themeStyles = {
    day: {
      wrapper: "bg-slate-50 text-slate-900",
      header: "bg-white border-b-2 border-slate-200",
      card: "bg-white border-2 border-slate-300 shadow-sm",
      cardSubtle: "bg-slate-50 border-2 border-slate-300",
      mutedText: "text-slate-600",
      heading: "text-slate-900",
      input: "bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus:border-blue-600",
      toggleBg: "bg-slate-100 border border-slate-300",
      toggleActive: "bg-amber-600 text-white shadow-sm",
      toggleInactive: "text-slate-700 hover:bg-slate-200",
    },
    midnight: {
      wrapper: "bg-[#0B0F19] text-[#F1F5F9]",
      header: "bg-[#111827] border-b-2 border-slate-800",
      card: "bg-[#161F30] border-2 border-slate-700 shadow-sm",
      cardSubtle: "bg-[#1E293B] border-2 border-slate-700",
      mutedText: "text-slate-400",
      heading: "text-white",
      input: "bg-[#1E293B] text-white border-slate-700 placeholder:text-slate-500 focus:border-blue-400",
      toggleBg: "bg-[#1E293B] border border-slate-700",
      toggleActive: "bg-blue-600 text-white shadow-sm",
      toggleInactive: "text-slate-300 hover:bg-slate-700",
    },
    amber: {
      wrapper: "bg-[#FFFBEB] text-[#451A03]",
      header: "bg-[#FEF3C7] border-b-2 border-amber-300",
      card: "bg-[#FFFDF7] border-2 border-amber-300 shadow-sm",
      cardSubtle: "bg-[#FEF9E7] border-2 border-amber-300",
      mutedText: "text-amber-800",
      heading: "text-[#451A03]",
      input: "bg-white text-[#451A03] border-amber-300 placeholder:text-amber-700/60 focus:border-amber-700",
      toggleBg: "bg-amber-100 border border-amber-300",
      toggleActive: "bg-amber-700 text-white shadow-sm",
      toggleInactive: "text-amber-900 hover:bg-amber-200",
    },
    yellow_black: {
      wrapper: "bg-black text-[#FDE047]",
      header: "bg-black border-b-2 border-[#FDE047]",
      card: "bg-black border-3 border-[#FDE047] shadow-sm",
      cardSubtle: "bg-black border-2 border-[#FDE047]",
      mutedText: "text-[#FEF08A]",
      heading: "text-[#FDE047]",
      input: "bg-black text-[#FDE047] border-2 border-[#FDE047] placeholder:text-[#FDE047]/60 focus:border-white",
      toggleBg: "bg-black border-2 border-[#FDE047]",
      toggleActive: "bg-[#FDE047] text-black font-black shadow-sm",
      toggleInactive: "text-[#FDE047] hover:bg-neutral-900",
    },
  };
  const tStyle = themeStyles[theme];

  return (
    <div className={`min-h-screen ${tStyle.wrapper} ${fontClasses[textSize]} pb-20 transition-colors duration-200`}>
      {/* Top Header & Senior Accessibility Bar */}
      <header className={`sticky top-0 z-40 ${tStyle.header} px-4 py-3 shadow-sm transition-colors duration-200`}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              setActiveAnalysis(null);
              setActivePayload(null);
              audioManager.stop();
            }}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black min-h-[56px] min-w-[56px] shadow-sm transition"
            aria-label="Sahara Home"
          >
            <Home className="w-7 h-7" />
            <span className="tracking-wide text-xl">SAHARA</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Caregiver Setup / Family Contacts Button */}
            <button
              type="button"
              onClick={() => setShowCaregiverModal(true)}
              className="min-h-[46px] px-3.5 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition text-xs md:text-sm bg-purple-100 hover:bg-purple-200 text-purple-950 border-purple-300 cursor-pointer"
              title="View, Add, Edit or Delete Family Contacts"
            >
              <Users className="w-4 h-4 text-purple-700" />
              <span>
                {familyContacts.length > 0
                  ? `👨‍👧 परिवार (${familyContacts.length})`
                  : language === "hi"
                  ? "👨‍👧 परिवार जोड़ें"
                  : "👨‍👧 Family Setup"}
              </span>
            </button>

            {/* Emergency Directory Button */}
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="min-h-[46px] px-3.5 py-1.5 rounded-xl border-2 font-black flex items-center gap-1.5 transition text-xs md:text-sm bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-sm cursor-pointer"
              title="Verified 1930 Cyber Helpline & 14567 Elderline"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
              <span>🚨 {language === "hi" ? "हेल्पलाइन 1930" : "Helplines 1930"}</span>
            </button>

            {/* Eye-Care & Contrast Themes */}
            <div
              className={`flex ${tStyle.toggleBg} rounded-2xl p-1`}
              role="group"
              aria-label="Eye Care Theme Mode"
            >
              {(
                [
                  { id: "day", icon: "☀️", title: "Day" },
                  { id: "midnight", icon: "🌙", title: "Dark" },
                  { id: "amber", icon: "📜", title: "Warm Amber" },
                  { id: "yellow_black", icon: "🟨", title: "High Contrast" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeChange(t.id)}
                  aria-label={`${t.title} Theme`}
                  title={`${t.title} Theme`}
                  className={`min-h-[44px] px-2.5 py-1 text-sm font-bold rounded-xl transition ${
                    theme === t.id ? tStyle.toggleActive : tStyle.toggleInactive
                  }`}
                >
                  {t.icon}
                </button>
              ))}
            </div>

            {/* Font Scaler */}
            <div
              className={`flex ${tStyle.toggleBg} rounded-2xl p-1`}
              role="group"
              aria-label="Text Size Controls"
            >
              {(["normal", "large", "xlarge"] as TextSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setTextSize(sz)}
                  aria-label={`Set text size ${sz}`}
                  className={`min-h-[44px] px-3 py-1 font-extrabold rounded-xl transition ${
                    textSize === sz
                      ? "bg-amber-600 text-white shadow-sm"
                      : tStyle.toggleInactive
                  }`}
                >
                  {sz === "normal" ? "A" : sz === "large" ? "A+" : "A++"}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div
              className={`flex ${tStyle.toggleBg} rounded-2xl p-1`}
              role="group"
              aria-label="Language Selection"
            >
              {(
                [
                  { id: "en", label: "EN" },
                  { id: "hi", label: "हिंदी" },
                  { id: "hinglish", label: "Hinglish" },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`min-h-[44px] px-2.5 py-1 font-bold rounded-xl transition ${
                    language === lang.id
                      ? "bg-blue-700 text-white shadow-sm"
                      : tStyle.toggleInactive
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Sensitive Information Banner */}
        {warnings.length > 0 && (
          <div className="mb-6 p-4 bg-amber-100 border-2 border-amber-600 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-7 h-7 text-amber-800 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg text-amber-950">Security Notice: Confidential Data Masked</p>
              <p className="text-amber-900 text-sm">
                Sensitive details ({warnings.join(", ")}) were automatically removed locally before transmission to protect your privacy.
              </p>
            </div>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="bg-white p-10 rounded-3xl border-2 border-slate-300 text-center my-8 shadow-sm">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Sahara is reviewing this for you...</h2>
            <p className="text-slate-600 mt-2">Checking safety rules and generating step-by-step guidance.</p>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {!activeAnalysis && !isLoading && (
          <div className="space-y-6">
            <div>
              <h1 className={`text-3xl md:text-4xl font-black ${tStyle.heading}`}>
                {language === "hi" ? "नमस्ते 🙏" : "Good Day 👋"}
              </h1>
              <p className={`${tStyle.mutedText} font-medium`}>
                {language === "hi"
                  ? "आपका सरल, सुरक्षित और सहयोगी डिजिटल साथी।"
                  : language === "hinglish"
                  ? "Aapka personal digital companion dashboard."
                  : "Your personal, protective digital companion."}
              </p>
            </div>

            {/* 📞 CALLER QUICK-CHECK BANNER */}
            <div
              onClick={() => setShowCallerCheckModal(true)}
              className="cursor-pointer p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md hover:shadow-lg transition flex items-center justify-between gap-4 border-2 border-red-400 group"
              role="button"
              tabIndex={0}
              aria-label="Caller Quick Check"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <PhoneCall className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider bg-yellow-400 text-black px-2.5 py-0.5 rounded-full inline-block mb-1">
                    {language === "hi" ? "त्वरित कॉल जांच" : "Instant Caller Check"}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black">
                    {language === "hi"
                      ? "📞 फोन पर कोई मांग रहा है? (Caller Quick-Check)"
                      : language === "hinglish"
                      ? "📞 Phone par koi maang raha hai? (Caller Check)"
                      : "📞 Someone on phone asking for OTP / Money?"}
                  </h2>
                  <p className="text-sm md:text-base text-red-50 font-medium">
                    {language === "hi"
                      ? "बिजली कट, बैंक KYC या पार्सल की धमकी? तुरंत जांचें और फोन काटने का सुरक्षित जवाब पाएं।"
                      : "Electricity cut threat, bank KYC, or digital arrest call? Immediate scam verdict & canned script to hang up."}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </div>

            {/* QUICK FEATURE TILES GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Tile 1: Scam Check */}
              <button
                type="button"
                onClick={() => setTaskIntent("scam_check")}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-2 shadow-sm min-h-[110px] cursor-pointer ${
                  taskIntent === "scam_check" ? "ring-2 ring-blue-600 " + tStyle.card : tStyle.card
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl">
                  🛡️
                </div>
                <div>
                  <h3 className={`font-bold text-sm md:text-base ${tStyle.heading}`}>
                    {language === "hi" ? "फ्रॉड जांच" : "Scam Check"}
                  </h3>
                  <p className={`text-xs ${tStyle.mutedText}`}>
                    {language === "hi" ? "संदेश व कॉल परखें" : "Verify threats & links"}
                  </p>
                </div>
              </button>

              {/* Tile 2: Medicine Reader */}
              <button
                type="button"
                onClick={() => setTaskIntent("medicine_reader")}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-2 shadow-sm min-h-[110px] cursor-pointer ${
                  taskIntent === "medicine_reader" ? "ring-2 ring-emerald-600 " + tStyle.card : tStyle.card
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Pill className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm md:text-base ${tStyle.heading}`}>
                    {language === "hi" ? "दवा पर्ची सरलक" : "Medicine Reader"}
                  </h3>
                  <p className={`text-xs ${tStyle.mutedText}`}>
                    {language === "hi" ? "3 तथ्य व खुराक चेकलिस्ट" : "3 facts & pill tracker"}
                  </p>
                </div>
              </button>

              {/* Tile 3: Bill Reader */}
              <button
                type="button"
                onClick={() => setTaskIntent("bill_reader")}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-2 shadow-sm min-h-[110px] cursor-pointer ${
                  taskIntent === "bill_reader" ? "ring-2 ring-amber-600 " + tStyle.card : tStyle.card
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm md:text-base ${tStyle.heading}`}>
                    {language === "hi" ? "बिल सरलक" : "Bill Reader"}
                  </h3>
                  <p className={`text-xs ${tStyle.mutedText}`}>
                    {language === "hi" ? "राशि, तारीख व 1-टैप मदद" : "Due date & family pay"}
                  </p>
                </div>
              </button>

              {/* Tile 4: Smartphone Guides */}
              <button
                type="button"
                onClick={() => setShowSmartphoneGuides(true)}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-2 shadow-sm min-h-[110px] cursor-pointer ${tStyle.card} hover:border-purple-400`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm md:text-base ${tStyle.heading}`}>
                    {language === "hi" ? "स्मार्टफोन सीखें" : "Phone Guides"}
                  </h3>
                  <p className={`text-xs ${tStyle.mutedText}`}>
                    {language === "hi" ? "लोकेशन, बैलेंस, स्पैम ब्लॉक" : "Visual step guides"}
                  </p>
                </div>
              </button>
            </div>

            {/* Input & Upload Workspace */}
            <div className={`${tStyle.card} p-6 rounded-3xl shadow-sm space-y-4`}>
              <h2 className={`font-bold text-xl ${tStyle.heading}`}>
                {language === "hi"
                  ? "सहारा से क्या जांच करवाना चाहते हैं?"
                  : language === "hinglish"
                  ? "Sahara se kya check karwana chahte hain?"
                  : "What would you like Sahara to check?"}
              </h2>

              {/* Task Intent Selector */}
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: "general",
                    label:
                      language === "hi"
                        ? "📝 संदेश समझें"
                        : language === "hinglish"
                        ? "📝 Message Samjhein"
                        : "📝 Understand Message",
                  },
                  {
                    id: "scam_check",
                    label:
                      language === "hi"
                        ? "🛡️ फ्रॉड व सुरक्षा जांच"
                        : language === "hinglish"
                        ? "🛡️ Scam & Safety Check"
                        : "🛡️ Scam Check",
                  },
                  {
                    id: "medicine_reader",
                    label:
                      language === "hi"
                        ? "💊 दवा पर्ची सरलक"
                        : language === "hinglish"
                        ? "💊 Medicine Reader"
                        : "💊 Medicine Reader",
                  },
                  {
                    id: "bill_reader",
                    label:
                      language === "hi"
                        ? "⚡ बिजली / पानी बिल"
                        : language === "hinglish"
                        ? "⚡ Utility Bill Reader"
                        : "⚡ Bill Reader",
                  },
                  {
                    id: "booking",
                    label:
                      language === "hi"
                        ? "🚆 यात्रा / टिकट"
                        : language === "hinglish"
                        ? "🚆 Travel / Ticket"
                        : "🚆 Travel / Booking",
                  },
                ].map((intent) => (
                  <button
                    key={intent.id}
                    onClick={() => setTaskIntent(intent.id)}
                    className={`min-h-[46px] px-3.5 py-2 text-sm font-bold rounded-xl border transition cursor-pointer ${
                      taskIntent === intent.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {intent.label}
                  </button>
                ))}
              </div>

              {/* Content Textarea */}
              <textarea
                rows={4}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={
                  taskIntent === "medicine_reader"
                    ? language === "hi"
                      ? "दवा का नाम, पर्ची का विवरण यहाँ लिखें, या नीचे से फोटो जोड़ें / माइक से बोलें..."
                      : "Type medication name, prescription text, or attach a photo of the strip / speak..."
                    : taskIntent === "bill_reader"
                    ? language === "hi"
                      ? "बिजली / पानी बिल SMS, उपभोक्ता संख्या यहाँ लिखें या बिल की फोटो जोड़ें..."
                      : "Type bill notification SMS, consumer number, or attach a bill screenshot..."
                    : language === "hi"
                    ? "संदेश (SMS), व्हाट्सएप मैसेज, या सवाल यहाँ लिखें, बोलें या पेस्ट करें..."
                    : language === "hinglish"
                    ? "SMS, WhatsApp message, ya koi sawaal yahan likhein ya bol kar batayein..."
                    : "Paste an SMS, WhatsApp message, speak with microphone, or enter your question here..."
                }
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none ${tStyle.input}`}
              />

              {/* File Attachment, Speech Mic & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="cursor-pointer min-h-[52px] flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold border border-slate-300 text-sm transition"
                  >
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    {selectedImage
                      ? selectedImage.name
                      : language === "hi"
                      ? "फोटो या स्क्रीनशॉट जोड़ें"
                      : "Attach Screenshot / Photo"}
                  </label>

                  {/* Speech-to-Text Microphone Input */}
                  <SpeechInputButton
                    language={language}
                    onTranscript={(spoken) => {
                      setInputContent((prev) => (prev ? `${prev} ${spoken}` : spoken));
                    }}
                  />

                  {selectedImage && (
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-xs text-red-600 font-bold hover:underline px-2 cursor-pointer"
                    >
                      {language === "hi" ? "हटाएं" : "Remove"}
                    </button>
                  )}
                </div>

                <button
                  onClick={executeLiveAnalysis}
                  className="min-h-[52px] px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                  {language === "hi" ? "जांचें (Analyze)" : "Analyze Now"}
                </button>
              </div>
            </div>

            {/* DYNAMIC ATTENTION FEED */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {language === "hi" ? "हालिया अलर्ट और संदेश (Attention Feed)" : "Your Attention Feed"}
                </h2>
                {feedItems.length > 0 && (
                  <button
                    onClick={clearFeed}
                    className="flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="w-4 h-4" /> {language === "hi" ? "सब हटाएं" : "Clear All"}
                  </button>
                )}
              </div>

              {feedItems.length === 0 ? (
                <div className="p-8 bg-white border-2 border-dashed border-slate-300 rounded-3xl text-center text-slate-500">
                  <p className="font-semibold text-lg">
                    {language === "hi"
                      ? "अभी कोई सक्रिय संदेश या अलर्ट नहीं है।"
                      : "No active messages or alerts yet."}
                  </p>
                  <p className="text-sm mt-1">
                    {language === "hi"
                      ? "जांच करने के लिए ऊपर कोई संदेश पेस्ट करें या स्क्रीनशॉट जोड़ें।"
                      : "Paste a message or attach a screenshot above to run a live analysis."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {feedItems.map((item) => {
                    const isRisky = item.analysis.safety_level === "POTENTIALLY_RISKY";
                    const isCareful = item.analysis.safety_level === "BE_CAREFUL";

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          audioManager.stop();
                          setActiveAnalysis(item.analysis);
                          setActivePayload({
                            content: item.sourceContent || item.analysis.title,
                            imageBase64: item.imageBase64 || null,
                            imageMimeType: item.imageMimeType || null,
                            taskIntent: item.taskIntent || "general",
                          });
                          setCurrentStepIdx(0);
                        }}
                        className={`cursor-pointer p-5 rounded-2xl border-2 transition shadow-sm flex items-center justify-between gap-4 ${
                          isRisky
                            ? "bg-red-50 border-red-300 hover:bg-red-100"
                            : isCareful
                            ? "bg-amber-50 border-amber-300 hover:bg-amber-100"
                            : "bg-emerald-50 border-emerald-300 hover:bg-emerald-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-4 h-4 rounded-full mt-1.5 flex-shrink-0 ${
                              isRisky ? "bg-red-600" : isCareful ? "bg-amber-500" : "bg-emerald-600"
                            }`}
                          />
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              {item.timestamp} • {item.analysis.triage}
                            </span>
                            <h3 className="font-bold text-slate-900 text-lg">{item.analysis.title}</h3>
                            <p className="text-sm text-slate-700 font-medium line-clamp-1">
                              {item.analysis.plain_summary}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-slate-600 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DETAILED ANALYSIS VIEW */}
        {activeAnalysis && !isLoading && (
          <div className="space-y-6">
            {/* Top Navigation & Audio Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
              <button
                onClick={() => {
                  audioManager.stop();
                  setActiveAnalysis(null);
                  setActivePayload(null);
                }}
                className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 min-h-[52px] transition"
              >
                <ArrowLeft className="w-5 h-5" />
                {language === "hi"
                  ? "मुख्य पृष्ठ (Dashboard)"
                  : language === "hinglish"
                  ? "Wapas Dashboard"
                  : "Dashboard"}
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Sahara Voice Player (Natural Voice & Speech Fallback) */}
                <SaharaVoicePlayer
                  language={language}
                  textToSpeak={`${activeAnalysis.title}. ${activeAnalysis.plain_summary}. ${activeAnalysis.what_to_do.join(". ")}`}
                />

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 bg-purple-100 text-purple-900 border border-purple-300 font-bold px-4 py-3 rounded-2xl hover:bg-purple-200 min-h-[52px] transition shadow-sm"
                >
                  <Share2 className="w-5 h-5" />
                  {language === "hi" ? "परिवार से सलाह" : language === "hinglish" ? "Ask Family" : "Ask Family"}
                </button>
              </div>
            </div>

            {/* Extracted Message Card (Displays text read from screenshot/message) */}
            {activeAnalysis.extracted_message && (
              <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-300 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    📄 {language === "hi"
                      ? "स्क्रीनशॉट या संदेश से पढ़ा गया टेक्स्ट (Extracted Text):"
                      : language === "hinglish"
                      ? "Screenshot / Message se padha gaya text:"
                      : "Extracted Text from Screenshot / Message:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeAnalysis.extracted_message || "");
                      setCopiedNotification(true);
                      setTimeout(() => setCopiedNotification(false), 2500);
                    }}
                    className="text-xs text-blue-700 hover:underline font-bold flex items-center gap-1 min-h-[32px] px-2 rounded-lg hover:bg-slate-200 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedNotification
                      ? (language === "hi" ? "कॉपी हुआ!" : "Copied!")
                      : (language === "hi" ? "टेक्स्ट कॉपी करें" : "Copy Text")}
                  </button>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-slate-800 text-sm md:text-base font-medium whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {activeAnalysis.extracted_message}
                </div>
              </div>
            )}

            {/* Medicine 3-Plain-Facts & Pill Checklist */}
            {activeAnalysis.medicine_details && (
              <MedicinePillChecklist
                language={language}
                medicine={activeAnalysis.medicine_details}
              />
            )}

            {/* Utility Bill High-Contrast Reader Card */}
            {activeAnalysis.bill_details && (
              <div className="bg-amber-50 border-3 border-amber-500 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                        {language === "hi" ? "उपयोगिता बिल सरलक" : "Utility Bill Simplifier"}
                      </span>
                      <h3 className="text-2xl font-black text-amber-950">
                        {activeAnalysis.bill_details.utility_provider}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">
                      {language === "hi" ? "उपभोक्ता संख्या (Consumer ID):" : "Consumer ID:"}
                    </span>
                    <span className="text-base font-black px-3 py-1 bg-amber-200 text-amber-900 rounded-xl inline-block mt-0.5">
                      {activeAnalysis.bill_details.consumer_id}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-1">
                    <span className="text-xs font-black uppercase text-slate-500">
                      {language === "hi" ? "कुल देय राशि (Amount Due):" : "Total Amount Due:"}
                    </span>
                    <div className="text-3xl md:text-4xl font-black text-slate-900">
                      {activeAnalysis.bill_details.amount_due}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-1">
                    <span className="text-xs font-black uppercase text-slate-500">
                      {language === "hi" ? "अंतिम भुगतान तिथि (Due Date):" : "Payment Due Date:"}
                    </span>
                    <div className="text-2xl md:text-3xl font-black text-amber-700">
                      {activeAnalysis.bill_details.due_date}
                    </div>
                  </div>
                </div>

                {/* 1-Tap Ask Family to Pay via WhatsApp */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const shareBillText =
                        language === "hi"
                          ? `नमस्ते, मुझे ${activeAnalysis.bill_details?.utility_provider} का बिल मिला है।\n• उपभोक्ता संख्या (Consumer ID): ${activeAnalysis.bill_details?.consumer_id}\n• देय राशि: ${activeAnalysis.bill_details?.amount_due}\n• अंतिम तिथि: ${activeAnalysis.bill_details?.due_date}\n\nकृपया इसे अपने फोन से भर दें या देखकर सलाह दें। धन्यवाद!`
                          : `Hello, I received my ${activeAnalysis.bill_details?.utility_provider} utility bill:\n• Consumer ID: ${activeAnalysis.bill_details?.consumer_id}\n• Amount Due: ${activeAnalysis.bill_details?.amount_due}\n• Due Date: ${activeAnalysis.bill_details?.due_date}\n\nPlease help pay this through your banking/UPI app or verify it for me. Thank you!`;
                      shareOnWhatsApp(shareBillText);
                    }}
                    className="w-full min-h-[56px] px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <MessageCircle className="w-6 h-6 fill-white" />
                    <span>
                      {primaryContact?.name
                        ? language === "hi"
                          ? `📲 ${primaryContact.name} को बिल भरने के लिए भेजें`
                          : `📲 Ask ${primaryContact.name} to Pay on WhatsApp`
                        : language === "hi"
                        ? "📲 परिवार से बिल भरने को कहें (WhatsApp)"
                        : "📲 Ask Family to Pay on WhatsApp"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Safety Rating Card */}
            <div
              className={`p-6 rounded-3xl border-2 ${
                activeAnalysis.safety_level === "POTENTIALLY_RISKY"
                  ? "bg-red-50 border-red-500 text-red-950"
                  : activeAnalysis.safety_level === "BE_CAREFUL"
                  ? "bg-amber-50 border-amber-500 text-amber-950"
                  : "bg-emerald-50 border-emerald-500 text-emerald-950"
              }`}
            >
              <div className="flex items-center gap-3">
                {activeAnalysis.safety_level === "LIKELY_SAFE" ? (
                  <ShieldCheck className="w-9 h-9 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="w-9 h-9 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {language === "hi"
                      ? "सुरक्षा मूल्यांकन (Safety Evaluation)"
                      : language === "hinglish"
                      ? "Safety Evaluation"
                      : "Safety Evaluation"}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black">
                    {activeAnalysis.safety_level === "LIKELY_SAFE"
                      ? language === "hi"
                        ? "🟢 सब सामान्य लग रहा है"
                        : language === "hinglish"
                        ? "🟢 Normal Lag Raha Hai"
                        : "🟢 Looks Normal"
                      : activeAnalysis.safety_level === "BE_CAREFUL"
                      ? language === "hi"
                        ? "🟡 सावधानी बरतें"
                        : language === "hinglish"
                        ? "🟡 Dhyan Se Dekhein (Be Careful)"
                        : "🟡 Be Careful"
                      : language === "hi"
                      ? "🔴 संभावित जोखिम / सतर्क रहें"
                      : language === "hinglish"
                      ? "🔴 Risky / Suspicious Alert"
                      : "🔴 Potentially Risky"}
                  </h2>
                </div>
              </div>
              <p className="mt-3 text-lg font-semibold">{activeAnalysis.plain_summary}</p>
            </div>

            {/* Red Flags / Suspicion Reasons */}
            {activeAnalysis.suspicion_reasons && activeAnalysis.suspicion_reasons.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border-2 border-red-200 shadow-sm">
                <h3 className="font-bold text-lg text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  {language === "hi"
                    ? "सावधानी क्यों जरूरी है (कारण):"
                    : language === "hinglish"
                    ? "Savdhani kyu zaroori hai (Reasons):"
                    : "Why caution is recommended:"}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-800 font-medium">
                  {activeAnalysis.suspicion_reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions: DO vs DO NOT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-300 shadow-sm">
                <h3 className="font-bold text-lg text-emerald-950 mb-3">
                  {language === "hi"
                    ? "✅ आपको क्या करना चाहिए:"
                    : language === "hinglish"
                    ? "✅ Aapko kya karna chahiye:"
                    : "✅ What You Should Do:"}
                </h3>
                <ul className="space-y-2 text-slate-800 font-medium">
                  {activeAnalysis.what_to_do.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700">{i + 1}.</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-300 shadow-sm">
                <h3 className="font-bold text-lg text-red-950 mb-3">
                  {language === "hi"
                    ? "❌ आपको क्या नहीं करना चाहिए:"
                    : language === "hinglish"
                    ? "❌ Aapko kya NAHI karna chahiye:"
                    : "❌ What You Should NOT Do:"}
                </h3>
                <ul className="space-y-2 text-slate-800 font-medium">
                  {activeAnalysis.what_not_to_do.map((dont, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-red-700">✕</span>
                      <span>{dont}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step-by-Step Task Guide */}
            {activeAnalysis.task_steps && activeAnalysis.task_steps.length > 0 && (() => {
              const currentStep = activeAnalysis.task_steps[currentStepIdx];
              const isFamilyShareStep =
                Boolean(activeAnalysis.family_share_text) &&
                (currentStepIdx === activeAnalysis.task_steps.length - 1 ||
                  /परिवार|रिश्तेदार|बेटे|बेटी|family|share|whatsapp|forward|सलाह|बटन/i.test(
                    currentStep?.instruction || ""
                  ) ||
                  /परिवार|family|whatsapp/i.test(currentStep?.check_label || ""));

              return (
                <div className="bg-white p-6 rounded-3xl border-2 border-blue-300 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xl text-blue-950">
                      {language === "hi"
                        ? "निर्देशित कदम (Guided Steps)"
                        : language === "hinglish"
                        ? "Guided Steps"
                        : "Guided Steps"}
                    </h3>
                    <span className="text-sm font-bold bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
                      {language === "hi"
                        ? `चरण ${currentStepIdx + 1} / ${activeAnalysis.task_steps.length}`
                        : `Step ${currentStepIdx + 1} of ${activeAnalysis.task_steps.length}`}
                    </span>
                  </div>

                  <div className="p-5 bg-slate-50 border-2 border-slate-300 rounded-2xl space-y-4">
                    <p className="text-xl font-bold text-slate-900">
                      {currentStep?.instruction}
                    </p>

                    {/* INLINE 1-CLICK WHATSAPP SHARE BUTTON FOR SENIORS */}
                    {isFamilyShareStep && activeAnalysis.family_share_text && (
                      <div className="pt-2 space-y-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => shareOnWhatsApp(activeAnalysis.family_share_text)}
                          className="w-full min-h-[58px] px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition cursor-pointer"
                        >
                          <MessageCircle className="w-6 h-6 fill-white" />
                          <span>
                            {language === "hi"
                              ? "📲 परिवार को WhatsApp पर भेजें"
                              : language === "hinglish"
                              ? "📲 Family ko WhatsApp par bhejo"
                              : "📲 Send Alert to Family on WhatsApp"}
                          </span>
                        </button>

                        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-600 font-semibold">
                          <span>
                            {language === "hi"
                              ? "व्हाट्सएप खुलने पर अपने बेटे, बेटी या रिश्तेदार को चुनें"
                              : language === "hinglish"
                              ? "WhatsApp khulne par family member select karein"
                              : "Select your family member when WhatsApp opens"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(activeAnalysis.family_share_text);
                              setCopiedNotification(true);
                              setTimeout(() => setCopiedNotification(false), 2500);
                            }}
                            className="text-blue-700 hover:underline font-bold"
                          >
                            {copiedNotification
                              ? (language === "hi" ? "✓ कॉपी हो गया!" : "✓ Copied!")
                              : (language === "hi" ? "📋 टेक्स्ट कॉपी करें" : "📋 Copy Text")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      disabled={currentStepIdx === 0}
                      onClick={() => setCurrentStepIdx((p) => Math.max(0, p - 1))}
                      className="min-h-[52px] px-5 py-2.5 rounded-xl border-2 border-slate-300 font-bold disabled:opacity-30 transition"
                    >
                      {language === "hi" ? "पिछला (Previous)" : "Previous"}
                    </button>

                    {currentStepIdx < activeAnalysis.task_steps.length - 1 ? (
                      <button
                        onClick={() => setCurrentStepIdx((p) => p + 1)}
                        className="min-h-[52px] px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition"
                      >
                        {currentStep?.check_label || "Completed Step"}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          alert(
                            language === "hi"
                              ? "कार्य पूर्ण! आपने सभी सुरक्षा निर्देश पूरे कर लिए हैं।"
                              : language === "hinglish"
                              ? "Kaam complete! Aapne saare safety steps follow kar liye."
                              : "Task complete! You have completed all safety steps."
                          )
                        }
                        className="min-h-[52px] px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition"
                      >
                        <CheckCircle2 className="w-5 h-5" />{" "}
                        {language === "hi" ? "सुरक्षित संपन्न (Finished)" : "Finished Safely"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* FAMILY SHARING MODAL */}
        {showShareModal && activeAnalysis && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-help-title"
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-white max-w-lg w-full rounded-3xl p-6 border-2 border-slate-300 shadow-2xl space-y-4">
              <div>
                <h3 id="family-help-title" className="font-bold text-2xl text-slate-900 mb-1">
                  {language === "hi"
                    ? "परिवार से सलाह लें"
                    : language === "hinglish"
                    ? "Family se Salah Lein"
                    : "Ask Family for Help"}
                </h3>
                <p className="text-slate-600 text-sm font-medium">
                  {language === "hi"
                    ? "यह संदेश सीधे व्हाट्सएप पर भेजें या कॉपी करके किसी भी ऐप में भेजें:"
                    : language === "hinglish"
                    ? "Yeh message seedhe WhatsApp par bhejein ya copy karein:"
                    : "Send this message to your family or trusted contacts for advice:"}
                </p>
              </div>

              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 text-slate-900 font-medium whitespace-pre-wrap text-sm max-h-60 overflow-y-auto">
                {activeAnalysis.family_share_text}
              </div>

              {copiedNotification && (
                <p className="text-emerald-700 font-bold text-center text-sm">
                  ✓ {language === "hi" ? "क्लिपबोर्ड पर कॉपी किया गया!" : "Copied to clipboard!"}
                </p>
              )}

              <div className="space-y-2.5">
                {/* 1-Click WhatsApp Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    shareOnWhatsApp(activeAnalysis.family_share_text);
                  }}
                  className="w-full min-h-[54px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-md transition cursor-pointer"
                >
                  <MessageCircle className="w-6 h-6 fill-white" />
                  <span>
                    {language === "hi"
                      ? "📲 WhatsApp पर भेजें"
                      : language === "hinglish"
                      ? "📲 WhatsApp par Bhejein"
                      : "📲 Send on WhatsApp"}
                  </span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeAnalysis.family_share_text);
                      setCopiedNotification(true);
                      setTimeout(() => setCopiedNotification(false), 2500);
                    }}
                    className="flex-1 min-h-[50px] py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition"
                  >
                    <Copy className="w-4 h-4" /> {language === "hi" ? "संदेश कॉपी करें" : "Copy Message"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="min-h-[50px] px-6 py-2.5 border-2 border-slate-300 font-bold rounded-xl hover:bg-slate-100 text-sm transition"
                  >
                    {language === "hi" ? "बंद करें" : "Close"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAREGIVER SETUP / FAMILY MANAGEMENT MODAL */}
        {showCaregiverModal && (
          <CaregiverSetupModal
            language={language}
            contacts={familyContacts}
            onSaveContacts={(updated) => {
              setFamilyContacts(updated);
              try {
                localStorage.setItem("sahara_family_contacts", JSON.stringify(updated));
                const primary = updated.find((c) => c.isDefault) || updated[0];
                if (primary) {
                  localStorage.setItem("sahara_caregiver", JSON.stringify(primary));
                } else {
                  localStorage.removeItem("sahara_caregiver");
                }
              } catch (e) {
                console.error("Storage error:", e);
              }
            }}
            onClose={() => setShowCaregiverModal(false)}
          />
        )}

        {/* WHATSAPP RECIPIENT SELECTOR MODAL */}
        {showWhatsAppShareModal && (
          <WhatsAppShareModal
            language={language}
            text={pendingShareText}
            contacts={familyContacts}
            onOpenContactManager={() => {
              setShowWhatsAppShareModal(false);
              setShowCaregiverModal(true);
            }}
            onClose={() => setShowWhatsAppShareModal(false)}
          />
        )}

        {/* EMERGENCY HELPLINES MODAL */}
        {showEmergencyModal && (
          <EmergencyDirectoryModal
            language={language}
            onClose={() => setShowEmergencyModal(false)}
          />
        )}

        {/* CALLER QUICK CHECK MODAL */}
        {showCallerCheckModal && (
          <CallerQuickCheckModal
            language={language}
            onClose={() => setShowCallerCheckModal(false)}
            onAskFamily={(text) => {
              setShowCallerCheckModal(false);
              shareOnWhatsApp(text);
            }}
          />
        )}

        {/* SMARTPHONE HOW-TO GUIDES */}
        {showSmartphoneGuides && (
          <GuidedSmartphoneWalkthroughs
            language={language}
            onClose={() => setShowSmartphoneGuides(false)}
          />
        )}
      </main>
    </div>
  );
}
