"use client";

import React, { useState } from "react";
import {
  X,
  MessageCircle,
  Users,
  Copy,
  Check,
  UserPlus,
  Send,
  Star,
  ExternalLink,
} from "lucide-react";
import { CaregiverContact, Language } from "@/lib/types";

interface Props {
  language: Language;
  text: string;
  contacts: CaregiverContact[];
  onOpenContactManager: () => void;
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<Props> = ({
  language,
  text,
  contacts,
  onOpenContactManager,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const openWhatsAppTarget = (phone?: string) => {
    if (!text) return;
    const encoded = encodeURIComponent(text);
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    let phoneParam = "";
    if (phone) {
      const cleanDigits = phone.replace(/[^0-9]/g, "");
      const formatted = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
      if (formatted.length >= 10) {
        phoneParam = `phone=${formatted}&`;
      }
    }

    const url = isMobile
      ? `https://api.whatsapp.com/send?${phoneParam}text=${encoded}`
      : `https://web.whatsapp.com/send?${phoneParam}text=${encoded}`;

    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  const formatDisplayPhone = (p: string) => {
    const digits = p.replace(/[^0-9]/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return p;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-share-title"
      className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white max-w-lg w-full rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <MessageCircle className="w-7 h-7 fill-emerald-600 text-white" />
            </div>
            <div>
              <h3 id="whatsapp-share-title" className="font-black text-2xl text-slate-900">
                {language === "hi"
                  ? "किसको भेजना चाहते हैं?"
                  : language === "hinglish"
                  ? "Kisko share karna chahte hain?"
                  : "Whom to Share With?"}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                {language === "hi"
                  ? "नीचे से चुनें कि आप यह संदेश किसे भेजना चाहते हैं"
                  : "Choose who should receive this WhatsApp message"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {/* Section: Saved Family Members */}
          {contacts.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-700" />
                  {language === "hi" ? "सहेजे गए परिवार सदस्य:" : "Saved Family Members:"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenContactManager();
                  }}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 underline"
                >
                  {language === "hi" ? "सूची बदलें / Manage" : "Manage List"}
                </button>
              </div>

              <div className="space-y-2">
                {contacts.map((contact, idx) => {
                  return (
                    <button
                      key={contact.id || contact.phone || idx}
                      type="button"
                      onClick={() => openWhatsAppTarget(contact.phone)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition cursor-pointer ${
                        contact.isDefault
                          ? "bg-emerald-50/80 border-emerald-400 hover:bg-emerald-100 hover:border-emerald-500 shadow-xs"
                          : "bg-white border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-emerald-200/80 text-emerald-900 font-black text-base flex items-center justify-center shrink-0">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-base sm:text-lg truncate">
                              {contact.name}
                            </span>
                            {contact.relation && (
                              <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-purple-100 text-purple-800">
                                {contact.relation}
                              </span>
                            )}
                            {contact.isDefault && (
                              <span className="px-2 py-0.5 text-xs font-black rounded-md bg-amber-100 text-amber-900 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {language === "hi" ? "मुख्य" : "Primary"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                            {formatDisplayPhone(contact.phone)}
                          </p>
                        </div>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Send className="w-5 h-5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Pick Anyone in WhatsApp */}
          <div className="pt-1">
            <span className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider block mb-2">
              {contacts.length > 0
                ? language === "hi"
                  ? "या व्हाट्सएप में किसी और को भेजें:"
                  : "Or send to anyone else on WhatsApp:"
                : language === "hi"
                ? "व्हाट्सएप पर भेजें:"
                : "Send via WhatsApp:"}
            </span>

            <button
              type="button"
              onClick={() => openWhatsAppTarget()}
              className="w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 flex items-center justify-between gap-3 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {language === "hi"
                      ? "💬 व्हाट्सएप में खुद चैट चुनें"
                      : "💬 Pick from WhatsApp Chat List"}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {language === "hi"
                      ? "व्हाट्सएप खुलेगा ताकि आप किसी भी ग्रुप या रिश्तेदार को चुन सकें"
                      : "Opens WhatsApp so you can pick any friend, relative, or group"}
                  </p>
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Add family contact prompt if no contacts */}
          {contacts.length === 0 && (
            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-purple-950 font-medium">
                {language === "hi"
                  ? "भविष्य के लिए परिवार का नंबर सहेजें ताकि 1-टैप में सीधे उन्हें भेज सकें।"
                  : "Save family contacts for direct 1-tap sharing in the future."}
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenContactManager();
                }}
                className="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "+ जोड़ें" : "+ Add"}</span>
              </button>
            </div>
          )}

          {/* Fallback Copy Text */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleCopyText}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">
                    {language === "hi" ? "टेक्स्ट कॉपी हो गया!" : "Text Copied to Clipboard!"}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>
                    {language === "hi" ? "📋 संदेश कॉपी करें (Copy Message Text)" : "📋 Copy Message Text"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t pt-3 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition"
          >
            {language === "hi" ? "रद्द करें (Cancel)" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};
