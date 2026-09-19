"use client";

import React, { useState } from "react";
import { PhoneOff, Volume2, ShieldAlert, Share2, X, AlertOctagon } from "lucide-react";
import { Language } from "@/lib/types";
import { audioManager } from "@/lib/audio-client";

interface Props {
  language: Language;
  onClose: () => void;
  onAskFamily: (scriptText: string) => void;
}

interface Scenario {
  id: string;
  icon: string;
  label: { hi: string; hinglish: string; en: string };
  callerClaims: { hi: string; hinglish: string; en: string };
  verdict: { hi: string; hinglish: string; en: string };
  safeScript: { hi: string; hinglish: string; en: string };
}

const SCENARIOS: Scenario[] = [
  {
    id: "power_cut",
    icon: "⚡",
    label: {
      hi: "बिजली काटने की धमकी",
      hinglish: "Electricity Cut Threat",
      en: "Power Disconnection Threat",
    },
    callerClaims: {
      hi: "कॉलर कह रहा है: 'आपका पिछला बिल नहीं भरा, आज रात 9:30 बजे बिजली काट देंगे। तुरंत इस नंबर पर पैसे भेजो या ऐप डाउनलोड करो।'",
      hinglish: "Caller claims: 'Bill nahi bhara, aaj raat bijli cut hogi. Turant is number par payment karo ya app download karo.'",
      en: "Caller claims: 'Bill unpaid, power will be disconnected tonight. Pay immediately or download an app.'",
    },
    verdict: {
      hi: "🚨 100% फर्जी कॉल (SCAM)! बिजली विभाग कभी भी निजी मोबाइल से धमकी नहीं देता।",
      hinglish: "🚨 100% FAKE SCAM CALL! Electricity board private phone par call karke dhamki nahi deta.",
      en: "🚨 100% FRAUDULENT CALL! Utility discoms never call from personal mobile numbers threatening immediate blackout.",
    },
    safeScript: {
      hi: "कॉलर को यह बोलें: 'मेरा बेटा बिजली विभाग का काम देखता है। मैं कल स्वयं उप-केंद्र (Sub-station) जाकर रसीद दिखाऊंगा। आप फोन काटिए।' — और तुरंत लाल बटन दबाकर फोन काट दें!",
      hinglish: "Caller ko yeh bolein: 'Mera beta electricity board ka kaam dekhta hai. Main kal sub-station ja kar receipt dikhaunga. Phone kaat raha hoon.' — Aur turant call disconnect karein!",
      en: "Tell the caller firmly: 'My family manages my utility payments. I will visit the local discom office in person tomorrow. Do not call again.' — and hang up immediately!",
    },
  },
  {
    id: "bank_otp",
    icon: "🏦",
    label: {
      hi: "बैंक खाता / KYC / OTP मांग",
      hinglish: "Bank / YONO / KYC OTP",
      en: "Bank KYC & OTP Demand",
    },
    callerClaims: {
      hi: "कॉलर कह रहा है: 'मैं SBI/बैंक हेड ऑफिस से बोल रहा हूँ, आपका खाता या YONO ब्लॉक हो गया है। अपना आधार/पैन और OTP बताओ।'",
      hinglish: "Caller claims: 'Main SBI branch manager bol raha hoon, account block ho gaya hai. OTP aur PAN number bataiye.'",
      en: "Caller claims: 'I am the bank manager. Your account is locked. Verify your PAN and share the OTP.'",
    },
    verdict: {
      hi: "🚨 गंभीर साइबर धोखाधड़ी! बैंक कभी भी फोन पर OTP, पासवर्ड या पिन नहीं मांगते।",
      hinglish: "🚨 DANGEROUS FRAUD! Bank kabhi bhi phone par OTP ya PIN verify karne ko nahi bolte.",
      en: "🚨 CRITICAL CYBER FRAUD! Banks NEVER request OTPs, passwords, or PINs over the phone.",
    },
    safeScript: {
      hi: "कॉलर को यह बोलें: 'मैं फोन पर कोई OTP नहीं देता। मेरी बैंक शाखा मेरे घर के पास है, मैं वहां जाकर स्वयं बात करूंगा।' — और तुरंत फोन काट दें!",
      hinglish: "Caller ko bolein: 'Main phone par OTP share nahi karta. Main branch ja kar baat karunga.' — Aur turant call kaat dein!",
      en: "Tell the caller: 'I never share OTPs or passwords over the phone. I will visit my local bank branch in person.' — then hang up!",
    },
  },
  {
    id: "digital_arrest",
    icon: "👮",
    label: {
      hi: "पुलिस / कस्टम्स / पार्सल डर (डिजिटल अरेस्ट)",
      hinglish: "Police / Customs / Parcel Scam",
      en: "Police / Parcel / Digital Arrest Scam",
    },
    callerClaims: {
      hi: "कॉलर कह रहा है: 'कस्टम्स या क्राइम ब्रांच से बोल रहा हूँ। आपके आधार से भेजे गए पार्सल में गैरकानूनी सामान मिला है। फोन मत काटना नहीं तो पुलिस आएगी।'",
      hinglish: "Caller claims: 'Customs/Police bol raha hoon. Aapke parcel mein illegal samaan mila hai. Phone mat kaatna.'",
      en: "Caller claims: 'This is Police/Customs. An illegal parcel was found in your name. Stay on the call or police will arrive.'",
    },
    verdict: {
      hi: "🚨 फर्जी 'डिजिटल अरेस्ट' गिरोह! भारत में कोई 'डिजिटल अरेस्ट' कानून नहीं है। पुलिस कभी फोन या वीडियो कॉल पर केस नहीं सुलझाती।",
      hinglish: "🚨 FAKE DIGITAL ARREST SCAM! Police kabhi bhi video call ya phone par arrest nahi karti.",
      en: "🚨 FAKE DIGITAL ARREST EXTORTION! 'Digital arrest' does not legally exist in India. Law enforcement never settles cases via phone/video calls.",
    },
    safeScript: {
      hi: "कॉलर को यह बोलें: 'मेरा परिवार वकील और पुलिस के साथ स्थानीय थाने में आकर औपचारिक नोटिस लेगा। फोन काट रहा हूँ।' — और तुरंत फोन काट दें। बिल्कुल न डरें!",
      hinglish: "Bolein: 'Mera pariwar police station aakar written notice lega. Main call cut kar raha hoon.' — Aur turant call kaatein. Darna bilkul nahi hai!",
      en: "Tell the caller: 'My family will visit the local police station to receive any official written summons.' — then hang up immediately. You are safe!",
    },
  },
  {
    id: "lottery_prize",
    icon: "🎁",
    label: {
      hi: "लॉटरी / लकी ड्रा / इनाम शुल्क",
      hinglish: "Lottery / Prize Money Scam",
      en: "Lottery / Prize Claim Fee",
    },
    callerClaims: {
      hi: "कॉलर कह रहा है: 'आपको 25 लाख की लॉटरी या लकी ड्रा लगा है। इनाम का पैसा खाते में पाने के लिए ₹5,000 टैक्स या प्रोसेसिंग फीस तुरंत भेजें।'",
      hinglish: "Caller claims: 'Aapko 25 lakh ka prize mila hai. Processing fees ke ₹5,000 pehle transfer karein.'",
      en: "Caller claims: 'You won a lottery of 25 lakhs. Pay ₹5,000 processing fee to release the funds.'",
    },
    verdict: {
      hi: "🚨 100% लॉटरी फ्रॉड! कोई भी वैध लॉटरी कभी अग्रिम पैसे या टैक्स ट्रांसफर की मांग नहीं करती।",
      hinglish: "🚨 100% LOTTERY FRAUD! Asli lottery kabhi advance paise transfer karne ko nahi kehti.",
      en: "🚨 100% ADVANCE-FEE SCAM! Legitimate lotteries never ask winners to transfer money upfront.",
    },
    safeScript: {
      hi: "कॉलर को बोलें: 'मुझे कोई लॉटरी नहीं चाहिए। आप टैक्स काटकर बाकी पैसा अपने पास रख लीजिए।' — और तुरंत फोन काट दें!",
      hinglish: "Bolein: 'Mujhe koi lottery nahi chahiye. Aap hi rakh lein.' — Aur turant phone kaat dein!",
      en: "Tell the caller: 'Deduct whatever fee you want from the prize and keep it. I am hanging up.' — and hang up!",
    },
  },
];

export const CallerQuickCheckModal: React.FC<Props> = ({ language, onClose, onAskFamily }) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) {
      audioManager.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const textToSpeak = `${selectedScenario.verdict[language]}. ${selectedScenario.safeScript[language]}`;
    await audioManager.playText(textToSpeak, language, "male", 0.9);
    setIsSpeaking(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="caller-check-title"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white max-w-2xl w-full rounded-3xl p-6 border-4 border-red-500 shadow-2xl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <PhoneOff className="w-7 h-7" />
            </div>
            <div>
              <h3 id="caller-check-title" className="font-black text-2xl md:text-3xl text-red-950">
                {language === "hi"
                  ? "फोन पर कोई दबाव बना रहा है?"
                  : language === "hinglish"
                  ? "Phone Call Pressure Quick-Check"
                  : "Live Caller Pressure Quick-Check"}
              </h3>
              <p className="text-slate-600 text-xs md:text-sm font-bold">
                {language === "hi"
                  ? "शांत रहें! कॉलर क्या कह रहा है, नीचे चुनें और तुरंत सुरक्षित जवाब पाएं:"
                  : "Select what the caller is demanding to get an instant verdict and safe words to say:"}
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
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                audioManager.stop();
                setIsSpeaking(false);
                setSelectedScenario(s);
              }}
              className={`p-3.5 rounded-2xl border-2 font-bold text-left transition flex items-center gap-2.5 min-h-[56px] cursor-pointer ${
                selectedScenario.id === s.id
                  ? "bg-red-50 border-red-600 text-red-950 shadow-sm"
                  : "bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-800"
              }`}
            >
              <span className="text-2xl flex-shrink-0">{s.icon}</span>
              <span className="text-xs md:text-sm font-black leading-tight">
                {language === "hi" ? s.label.hi : language === "hinglish" ? s.label.hinglish : s.label.en}
              </span>
            </button>
          ))}
        </div>

        {/* What Caller is Saying */}
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-1">
          <span className="text-xs font-bold uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-amber-700" />
            {language === "hi" ? "कॉलर का दावा (What Caller Claims):" : "Caller's Claim:"}
          </span>
          <p className="text-slate-900 text-sm font-semibold">
            {language === "hi"
              ? selectedScenario.callerClaims.hi
              : language === "hinglish"
              ? selectedScenario.callerClaims.hinglish
              : selectedScenario.callerClaims.en}
          </p>
        </div>

        {/* Verdict Badge */}
        <div className="p-4 bg-red-100 border-2 border-red-500 rounded-2xl text-red-950 font-black text-base md:text-lg flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600 flex-shrink-0" />
          <span>
            {language === "hi"
              ? selectedScenario.verdict.hi
              : language === "hinglish"
              ? selectedScenario.verdict.hinglish
              : selectedScenario.verdict.en}
          </span>
        </div>

        {/* Safe Script to Say */}
        <div className="p-5 bg-emerald-50 border-3 border-emerald-500 rounded-3xl space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-black uppercase text-emerald-950 tracking-wider">
              🗣️ {language === "hi" ? "कॉलर को यह बोलें (Speak this to caller):" : "Say this to the caller:"}
            </span>
            <button
              type="button"
              onClick={handleSpeak}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Volume2 className="w-4 h-4" />
              {isSpeaking ? (language === "hi" ? "रोकें" : "Stop") : (language === "hi" ? "सुनें" : "Listen")}
            </button>
          </div>
          <p className="text-slate-950 text-base md:text-lg font-black leading-relaxed bg-white p-4 rounded-2xl border-2 border-emerald-300">
            "{language === "hi"
              ? selectedScenario.safeScript.hi
              : language === "hinglish"
              ? selectedScenario.safeScript.hinglish
              : selectedScenario.safeScript.en}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2 border-t">
          {/* Giant Hang Up Button */}
          <button
            type="button"
            onClick={() => {
              audioManager.stop();
              alert(
                language === "hi"
                  ? "शाबाश! आपने फोन काट दिया। आपका बैंक खाता और व्यक्तिगत जानकारी पूरी तरह सुरक्षित है।"
                  : "Great job! You hung up safely. Your bank account and personal data remain 100% secure."
              );
              onClose();
            }}
            className="w-full min-h-[60px] bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg transition cursor-pointer"
          >
            <PhoneOff className="w-7 h-7" />
            <span>{language === "hi" ? "🔴 तुरंत फोन काटें (Hang Up Now)" : "🔴 Hang Up Phone Immediately"}</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                audioManager.stop();
                const scenarioTitle = language === "hi" ? selectedScenario.label.hi : selectedScenario.label.en;
                const callerClaim = language === "hi" ? selectedScenario.callerClaims.hi : selectedScenario.callerClaims.en;
                const textToSend = language === "hi"
                  ? `नमस्ते, मुझे "${scenarioTitle}" को लेकर एक संदिग्ध कॉल आया है। कॉलर का दावा: "${callerClaim}"। सहारा ने इसे संभावित फ्रॉड कॉल बताया है। कृपया मुझे देखकर सलाह दें।`
                  : `Help / Alert: Someone just called me regarding "${selectedScenario.label.en}". Caller claimed: "${selectedScenario.callerClaims.en}". Sahara alerted me that this is a potential scam. Please advise.`;
                onAskFamily(textToSend);
              }}
              className="flex-1 min-h-[50px] bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              {language === "hi" ? "परिवार को सूचित करें" : "Alert Family via WhatsApp"}
            </button>
            <button
              type="button"
              onClick={() => {
                audioManager.stop();
                onClose();
              }}
              className="min-h-[50px] px-6 border-2 border-slate-300 font-bold rounded-2xl hover:bg-slate-100 text-slate-800 transition"
            >
              {language === "hi" ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
