"use client";

import React, { useState, useEffect } from "react";
import { Pill, Sun, Sunset, Moon, CheckCircle2, AlertCircle } from "lucide-react";
import { Language, MedicineDetails } from "@/lib/types";

interface Props {
  language: Language;
  medicine: MedicineDetails;
}

export const MedicinePillChecklist: React.FC<Props> = ({ language, medicine }) => {
  const todayKey = `sahara_pill_${new Date().toISOString().slice(0, 10)}_${medicine.medicine_name.toLowerCase().replace(/\s+/g, "_")}`;

  const [taken, setTaken] = useState<{ morning: boolean; afternoon: boolean; night: boolean }>({
    morning: false,
    afternoon: false,
    night: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      if (saved) {
        setTaken(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [todayKey]);

  const toggleDose = (slot: "morning" | "afternoon" | "night") => {
    const updated = { ...taken, [slot]: !taken[slot] };
    setTaken(updated);
    try {
      localStorage.setItem(todayKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-emerald-50 border-3 border-emerald-500 rounded-3xl p-6 shadow-md space-y-6">
      <div className="flex items-center gap-3 border-b border-emerald-200 pb-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
          <Pill className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
            {language === "hi" ? "दवा पर्ची सरलक" : "Medicine Simplifier"}
          </span>
          <h3 className="text-2xl font-black text-emerald-950">{medicine.medicine_name}</h3>
        </div>
      </div>

      {/* 3 Plain Facts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fact 1: What It's For */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 space-y-1.5 shadow-sm">
          <span className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1">
            🩺 {language === "hi" ? "1. यह दवा किस काम आती है?" : "1. What is this medicine for?"}
          </span>
          <p className="text-slate-900 font-bold text-base">{medicine.what_it_is_for}</p>
        </div>

        {/* Fact 2: When & How to take */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 space-y-1.5 shadow-sm">
          <span className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1">
            ⏰ {language === "hi" ? "2. कब और कैसे लेना है?" : "2. When & how to take?"}
          </span>
          <p className="text-slate-900 font-bold text-base">{medicine.when_to_take}</p>
          <span className="inline-block text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
            {medicine.timing.with_food}
          </span>
        </div>

        {/* Fact 3: Key Precautions */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 space-y-1.5 shadow-sm">
          <span className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1">
            ⚠️ {language === "hi" ? "3. जरूरी सावधानी" : "3. Key Precautions"}
          </span>
          <ul className="text-slate-800 text-xs md:text-sm font-semibold space-y-1 list-disc list-inside">
            {medicine.precautions.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Daily Pill Checklist */}
      <div className="bg-white p-5 rounded-2xl border-2 border-emerald-300 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {language === "hi" ? "आज की खुराक चेकलिस्ट (Daily Pill Tracker):" : "Today's Pill Checklist:"}
          </h4>
          <span className="text-xs font-bold text-slate-500">
            {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        <p className="text-xs text-slate-600 font-semibold">
          {language === "hi"
            ? "गोली खाने के बाद नीचे टिक करें ताकि दोबारा खाने का भ्रम न रहे:"
            : "Tap each slot after taking your dose so you don't accidentally forget or double-dose:"}
        </p>

        <div className="grid grid-cols-3 gap-3 pt-1">
          {/* Morning Slot */}
          {medicine.timing.morning && (
            <button
              type="button"
              onClick={() => toggleDose("morning")}
              className={`p-3.5 rounded-2xl border-2 font-black transition flex flex-col items-center gap-2 min-h-[75px] cursor-pointer ${
                taken.morning
                  ? "bg-emerald-600 border-emerald-700 text-white shadow-md"
                  : "bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100"
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-sm">{language === "hi" ? "सुबह ☀️" : "Morning ☀️"}</span>
              <span className="text-xs underline">{taken.morning ? (language === "hi" ? "✓ ले लिया" : "✓ Taken") : (language === "hi" ? "टैप करें" : "Take now")}</span>
            </button>
          )}

          {/* Afternoon Slot */}
          {medicine.timing.afternoon && (
            <button
              type="button"
              onClick={() => toggleDose("afternoon")}
              className={`p-3.5 rounded-2xl border-2 font-black transition flex flex-col items-center gap-2 min-h-[75px] cursor-pointer ${
                taken.afternoon
                  ? "bg-emerald-600 border-emerald-700 text-white shadow-md"
                  : "bg-sky-50 border-sky-300 text-sky-950 hover:bg-sky-100"
              }`}
            >
              <Sunset className="w-6 h-6" />
              <span className="text-sm">{language === "hi" ? "दोपहर 🌤️" : "Afternoon 🌤️"}</span>
              <span className="text-xs underline">{taken.afternoon ? (language === "hi" ? "✓ ले लिया" : "✓ Taken") : (language === "hi" ? "टैप करें" : "Take now")}</span>
            </button>
          )}

          {/* Night Slot */}
          {medicine.timing.night && (
            <button
              type="button"
              onClick={() => toggleDose("night")}
              className={`p-3.5 rounded-2xl border-2 font-black transition flex flex-col items-center gap-2 min-h-[75px] cursor-pointer ${
                taken.night
                  ? "bg-emerald-600 border-emerald-700 text-white shadow-md"
                  : "bg-indigo-50 border-indigo-300 text-indigo-950 hover:bg-indigo-100"
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-sm">{language === "hi" ? "रात 🌙" : "Night 🌙"}</span>
              <span className="text-xs underline">{taken.night ? (language === "hi" ? "✓ ले लिया" : "✓ Taken") : (language === "hi" ? "टैप करें" : "Take now")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Doctor confirmation banner */}
      <div className="p-3 bg-amber-100 border border-amber-300 rounded-xl text-amber-950 text-xs font-semibold flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <span>
          {language === "hi"
            ? "नोट: सहारा केवल लेबल को आसान भाषा में समझाता है। कोई भी नया कोर्स शुरू करने से पहले अपने डॉक्टर या फार्मासिस्ट से सलाह लें।"
            : "Note: Sahara simplifies print labels. Always follow the specific dosage advised on your doctor's prescription."}
        </span>
      </div>
    </div>
  );
};
