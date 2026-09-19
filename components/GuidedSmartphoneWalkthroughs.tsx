"use client";

import React, { useState } from "react";
import {
  Smartphone,
  MapPin,
  ShieldBan,
  Building2,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  Phone,
  Volume2,
  X,
} from "lucide-react";
import { Language } from "@/lib/types";
import { audioManager } from "@/lib/audio-client";

interface Props {
  language: Language;
  onClose: () => void;
}

interface Guide {
  id: string;
  icon: any;
  title: { hi: string; hinglish: string; en: string };
  summary: { hi: string; hinglish: string; en: string };
  steps: {
    number: number;
    title: { hi: string; en: string };
    desc: { hi: string; en: string };
    extraAction?: { label: string; href?: string; note?: string };
  }[];
  audioText: { hi: string; en: string };
}

const GUIDES: Guide[] = [
  {
    id: "whatsapp_location",
    icon: MapPin,
    title: {
      hi: "व्हाट्सएप पर अपनी लोकेशन कैसे भेजें",
      hinglish: "WhatsApp Par Location Kaise Bhejein",
      en: "How to Share Your Location on WhatsApp",
    },
    summary: {
      hi: "जब परिवार वाले पूछें कि आप कहाँ हैं, तो 3 आसान चरणों में अपनी सही जगह भेजें।",
      hinglish: "Jab family pooche aap kahan hain, toh 3 simple steps mein location bhejein.",
      en: "Send your current location to your children or relatives in 3 simple taps.",
    },
    steps: [
      {
        number: 1,
        title: { hi: "चैट खोलें और पेपरक्लिप (📎) पर टैप करें", en: "Open chat and tap Paperclip (📎) or Plus (+)" },
        desc: {
          hi: "जिस बच्चे या रिश्तेदार को लोकेशन भेजनी है, उनकी चैट खोलें और नीचे मैसेज टाइप करने की जगह के पास पेपरक्लिप (📎) आइकन दबाएं।",
          en: "Open the chat with your family member and tap the paperclip icon next to the typing area.",
        },
      },
      {
        number: 2,
        title: { hi: "हरा 'Location' (स्थान) बटन चुनें", en: "Select the green 'Location' button" },
        desc: {
          hi: "स्क्रीन पर गोल रंग-बिरंगे बटन दिखेंगे। इनमें से हरे रंग वाले 'Location' (स्थान) बटन पर टैप करें।",
          en: "From the menu of colored icons, tap the green circle labeled 'Location'.",
        },
      },
      {
        number: 3,
        title: { hi: "'Send Your Current Location' दबाएं", en: "Tap 'Send Your Current Location'" },
        desc: {
          hi: "नक्शा खुलेगा। नीचे लिखा होगा: 'Send your current location' (वर्तमान स्थान भेजें)। इसे दबाते ही आपकी सही जगह पहुंच जाएगी!",
          en: "The map will open. Tap 'Send your current location'. Your location will be sent immediately.",
        },
      },
    ],
    audioText: {
      hi: "व्हाट्सएप पर लोकेशन भेजने के लिए: पहले उस व्यक्ति की चैट खोलें। नीचे पेपरक्लिप आइकन दबाएं। फिर हरे रंग का लोकेशन बटन चुनें। और अंत में सेंड योर करंट लोकेशन पर टैप करें।",
      en: "To share location on WhatsApp: open the chat, tap the paperclip icon, choose the green Location button, and tap Send Your Current Location.",
    },
  },
  {
    id: "block_spam",
    icon: ShieldBan,
    title: {
      hi: "परेशान करने वाले नंबर को कैसे ब्लॉक करें",
      hinglish: "Spam Caller Ko Block Kaise Karein",
      en: "How to Block an Annoying or Spam Caller",
    },
    summary: {
      hi: "फर्जी कॉलर्स, बार-बार लोन या पॉलिसी बेचने वालों को हमेशा के लिए बंद करें।",
      hinglish: "Bar-bar aane wale fraud ya loan callers ko hamesha ke liye block karein.",
      en: "Permanently stop unwanted telemarketers and fraud callers from ringing your phone.",
    },
    steps: [
      {
        number: 1,
        title: { hi: "फोन ऐप खोलें और हालिया कॉल (Recents) देखें", en: "Open Phone app and find the number in Recents" },
        desc: {
          hi: "अपने फोन का डायलर (Phone) ऐप खोलें। जहां हालिया इनकमिंग कॉल दिखती हैं, वहां उस अनजान नंबर को ढूंढें।",
          en: "Open your standard Phone app and find the troublesome number in your recent call history.",
        },
      },
      {
        number: 2,
        title: { hi: "नंबर के पास (i) या 3 बिंदुओं पर टैप करें", en: "Tap the (i) icon or 3 dots next to the number" },
        desc: {
          hi: "नंबर के बगल में छोटा जानकारी (i) आइकन या दाएँ कोने में 3 बिंदु (⋮) होंगे, उसे दबाएं।",
          en: "Tap the small info (i) button beside the caller's number to open contact details.",
        },
      },
      {
        number: 3,
        title: { hi: "'Block Number' (ब्लॉक करें) चुनें", en: "Tap 'Block Number' and confirm" },
        desc: {
          hi: "नीचे 'Block Number' या 'Report Spam' विकल्प आएगा। उस पर टैप करें। अब यह नंबर कभी आपको परेशान नहीं कर पाएगा।",
          en: "Tap 'Block Number' or 'Report as Spam' and confirm. That caller will never ring your phone again.",
        },
      },
    ],
    audioText: {
      hi: "किसी नंबर को ब्लॉक करने के लिए: फोन ऐप खोलें। हालिया कॉल में नंबर के पास आई आइकन दबाएं। और नीचे ब्लॉक नंबर पर टैप करें।",
      en: "To block a number: open Phone app, tap the info icon next to the number in recents, and select Block Number.",
    },
  },
  {
    id: "bank_balance",
    icon: Building2,
    title: {
      hi: "बैंक बैलेंस सुरक्षित रूप से SMS से कैसे जांचें",
      hinglish: "Bank Balance Safely Check Kaise Karein",
      en: "How to Safely Check Bank Balance via Missed Call",
    },
    summary: {
      hi: "बिना किसी ऐप या इंटरनेट के, केवल आधिकारिक नंबर पर 1 मिस कॉल देकर सुरक्षित बैलेंस जानें।",
      hinglish: "Bina kisi fraud link ya internet ke, official bank missed-call se balance jaanein.",
      en: "Check your real balance safely without entering passwords or opening unverified apps.",
    },
    steps: [
      {
        number: 1,
        title: { hi: "अपने पंजीकृत मोबाइल नंबर से मिस कॉल दें", en: "Give a missed call from your registered mobile number" },
        desc: {
          hi: "नीचे अपने बैंक का आधिकारिक नंबर देखें और सीधे डायल करें। 1 रिंग के बाद फोन अपने आप कट जाएगा।",
          en: "Dial your bank's official toll-free balance number. It disconnects automatically after one ring.",
        },
        extraAction: {
          label: "SBI Balance: 09223766666",
          href: "tel:09223766666",
        },
      },
      {
        number: 2,
        title: { hi: "10 सेकंड में बैंक का आधिकारिक SMS प्राप्त होगा", en: "Receive official balance SMS within 10 seconds" },
        desc: {
          hi: "बैंक की तरफ से तुरंत SMS आएगा जिसमें आपका सही बैलेंस लिखा होगा। इसमें कोई पासवर्ड नहीं डालना पड़ता।",
          en: "Your bank sends a free official SMS showing your exact account balance. No passwords or PINs required.",
        },
      },
    ],
    audioText: {
      hi: "बैंक बैलेंस जांचने के लिए किसी ऐप में जाने की जरूरत नहीं है। अपने बैंक के आधिकारिक नंबर पर मिस कॉल दें। दस सेकंड में बैंक से सीधा सुरक्षित एसएमएस आ जाएगा।",
      en: "To check bank balance safely, simply give a missed call to your bank's verified number. The bank will SMS your balance immediately.",
    },
  },
  {
    id: "upi_rules",
    icon: CreditCard,
    title: {
      hi: "UPI पेमेंट का सबसे जरूरी सुरक्षा नियम",
      hinglish: "UPI Payment Golden Safety Rule",
      en: "Golden Rule of Safe UPI Payments",
    },
    summary: {
      hi: "धोखेबाजों की सबसे बड़ी चाल: 'पैसे पाने के लिए पिन डालें'। इसे हमेशा याद रखें।",
      hinglish: "Fraudsters ka sabse bada jhooth: 'Paise lene ke liye PIN daalo'. Hamesha yaad rakhein.",
      en: "The single most critical rule of Indian UPI to prevent online savings theft.",
    },
    steps: [
      {
        number: 1,
        title: { hi: "सुनहरा नियम: पैसे प्राप्त करने के लिए PIN नहीं चाहिए!", en: "Golden Rule: Never Enter PIN to RECEIVE Money!" },
        desc: {
          hi: "जब भी कोई कहे कि 'मैं आपके खाते में पैसे भेज रहा हूँ, आप अपना 4 या 6 अंकों का UPI PIN डालें' — वह 100% चोर है। पिन डालने से पैसे आपके खाते से कट जाते हैं!",
          en: "Whenever anyone asks you to enter your 4 or 6 digit UPI PIN to 'receive' money, they are stealing from you. PIN is ONLY used when sending money.",
        },
      },
      {
        number: 2,
        title: { hi: "QR कोड स्कैन करके कभी पैसे नहीं मिलते", en: "Scanning a QR Code sends money, never receives" },
        desc: {
          hi: "कोई अनजान व्यक्ति कहे कि 'यह QR कोड स्कैन करो, पैसे आ जाएंगे' — कभी न करें। QR कोड स्कैन करने का मतलब हमेशा पैसे देना होता है।",
          en: "Never scan a QR code sent on WhatsApp claiming it will transfer money into your account. Scanning always debits your funds.",
        },
      },
    ],
    audioText: {
      hi: "यूपीआई का सबसे बड़ा सुरक्षा नियम याद रखें: पैसे प्राप्त करने के लिए कभी भी यूपीआई पिन नहीं डाला जाता। पिन केवल पैसे भेजने के लिए होता है।",
      en: "Remember the golden rule of UPI: you never enter your UPI PIN to receive money. PIN is only for sending money.",
    },
  },
];

export const GuidedSmartphoneWalkthroughs: React.FC<Props> = ({ language, onClose }) => {
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async (guide: Guide) => {
    if (isSpeaking) {
      audioManager.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const text = language === "hi" ? guide.audioText.hi : guide.audioText.en;
    await audioManager.playText(text, language, "male", 0.9);
    setIsSpeaking(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthroughs-title"
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white max-w-2xl w-full rounded-3xl p-6 border-2 border-slate-300 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            {activeGuide && (
              <button
                type="button"
                onClick={() => {
                  audioManager.stop();
                  setIsSpeaking(false);
                  setActiveGuide(null);
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <h3 id="walkthroughs-title" className="font-black text-2xl text-slate-900">
                {language === "hi"
                  ? "स्मार्टफोन सीखें (आसान गाइड)"
                  : language === "hinglish"
                  ? "Smartphone Kaise Chalayein"
                  : "How Do I... Phone Guides"}
              </h3>
              <p className="text-slate-600 text-xs font-semibold">
                {language === "hi"
                  ? "रोज़मर्रा के काम बिना किसी की मदद के 3 चरणों में करें"
                  : "Master everyday phone tasks with large visual steps"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.stop();
              onClose();
            }}
            aria-label="Close"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View 1: Guide List */}
        {!activeGuide ? (
          <div className="space-y-3">
            {GUIDES.map((g) => {
              const Icon = g.icon;
              const title = language === "hi" ? g.title.hi : language === "hinglish" ? g.title.hinglish : g.title.en;
              const summary = language === "hi" ? g.summary.hi : language === "hinglish" ? g.summary.hinglish : g.summary.en;

              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveGuide(g)}
                  className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition flex items-center justify-between gap-3 shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-700 flex-shrink-0 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-base md:text-lg text-slate-900">{title}</h4>
                      <p className="text-slate-600 text-xs md:text-sm font-medium mt-0.5">{summary}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          /* View 2: Step-by-Step Detail */
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <h4 className="font-black text-lg md:text-xl text-blue-950">
                {language === "hi" ? activeGuide.title.hi : activeGuide.title.en}
              </h4>
              <button
                type="button"
                onClick={() => handleSpeak(activeGuide)}
                className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Volume2 className="w-4 h-4" />
                {isSpeaking ? (language === "hi" ? "रोकें" : "Stop") : (language === "hi" ? "निर्देश सुनें" : "Listen")}
              </button>
            </div>

            <div className="space-y-4">
              {activeGuide.steps.map((step) => (
                <div
                  key={step.number}
                  className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-2 shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-blue-700 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                      {step.number}
                    </span>
                    <h5 className="font-black text-base md:text-lg text-slate-900">
                      {language === "hi" ? step.title.hi : step.title.en}
                    </h5>
                  </div>
                  <p className="text-slate-800 text-sm md:text-base font-semibold pl-10.5 leading-relaxed">
                    {language === "hi" ? step.desc.hi : step.desc.en}
                  </p>

                  {step.extraAction && (
                    <div className="pl-10.5 pt-1">
                      <a
                        href={step.extraAction.href}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-sm transition"
                      >
                        <Phone className="w-4 h-4" />
                        {step.extraAction.label}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t flex justify-between">
              <button
                type="button"
                onClick={() => {
                  audioManager.stop();
                  setIsSpeaking(false);
                  setActiveGuide(null);
                }}
                className="min-h-[48px] px-5 border-2 border-slate-300 font-bold rounded-xl hover:bg-slate-100 text-slate-800 transition"
              >
                {language === "hi" ? "वापस सूची पर जाएं" : "Back to Guides"}
              </button>
              <button
                type="button"
                onClick={() => {
                  audioManager.stop();
                  onClose();
                }}
                className="min-h-[48px] px-5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition"
              >
                {language === "hi" ? "पूर्ण (Done)" : "Done"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
