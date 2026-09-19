"use client";

import React from "react";
import { Phone, ShieldCheck, X } from "lucide-react";
import { VERIFIED_EMERGENCY_CONTACTS } from "@/lib/emergency-data";
import { Language } from "@/lib/types";

interface Props {
  language: Language;
  onClose: () => void;
}

export const EmergencyDirectoryModal: React.FC<Props> = ({ language, onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white max-w-2xl w-full rounded-3xl p-6 border-2 border-slate-300 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              <h3 id="emergency-modal-title" className="font-black text-2xl md:text-3xl text-slate-900">
                {language === "hi"
                  ? "सत्यापित आपातकालीन डायरेक्टरी"
                  : language === "hinglish"
                  ? "Verified Emergency Directory"
                  : "Verified Emergency Directory"}
              </h3>
            </div>
            <p className="text-slate-600 text-sm mt-1 font-semibold">
              {language === "hi"
                ? "भारत सरकार द्वारा प्रमाणित नंबर। इंटरनेट पर फर्जी नंबर खोजने से बचें।"
                : language === "hinglish"
                ? "Govt of India verified helplines. Google search ke fake numbers se bachein."
                : "Official Government of India helplines. Safe from web search spoofing."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {VERIFIED_EMERGENCY_CONTACTS.map((c) => {
            const name = language === "hi" ? c.name.hi : language === "hinglish" ? c.name.hinglish : c.name.en;
            const desc = language === "hi" ? c.description.hi : language === "hinglish" ? c.description.hinglish : c.description.en;
            const badge = language === "hi" ? c.badge.hi : c.badge.en;

            return (
              <div
                key={c.id}
                className="p-4 md:p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xl">{c.icon}</span>
                    <h4 className="font-black text-lg md:text-xl text-slate-900">{name}</h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {badge}
                  </span>
                  <p className="text-slate-700 text-sm font-medium leading-relaxed">{desc}</p>
                </div>

                <a
                  href={`tel:${c.number}`}
                  className="min-h-[54px] px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition flex-shrink-0 cursor-pointer text-center"
                >
                  <Phone className="w-5 h-5 fill-white" />
                  <span>
                    {language === "hi" ? "कॉल करें" : "Call"} {c.number}
                  </span>
                </a>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[50px] px-6 py-2.5 border-2 border-slate-300 font-bold rounded-xl hover:bg-slate-100 text-slate-800 transition"
          >
            {language === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
