"use client";

import React, { useState } from "react";
import {
  UserCheck,
  UserPlus,
  Phone,
  Check,
  X,
  HeartHandshake,
  Trash2,
  Edit2,
  Star,
  Users,
  AlertTriangle,
} from "lucide-react";
import { CaregiverContact, Language } from "@/lib/types";

interface Props {
  language: Language;
  contacts: CaregiverContact[];
  onSaveContacts: (contacts: CaregiverContact[]) => void;
  onClose: () => void;
}

export const CaregiverSetupModal: React.FC<Props> = ({
  language,
  contacts,
  onSaveContacts,
  onClose,
}) => {
  const [contactList, setContactList] = useState<CaregiverContact[]>(contacts || []);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(contacts.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Son / बेटा");
  const [isDefault, setIsDefault] = useState(contacts.length === 0);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const relationPresets = [
    { label: language === "hi" ? "बेटा" : "Son", val: "Son / बेटा" },
    { label: language === "hi" ? "बेटी" : "Daughter", val: "Daughter / बेटी" },
    { label: language === "hi" ? "पोता / पोती" : "Grandchild", val: "Grandchild / पोता-पोती" },
    { label: language === "hi" ? "रिश्तेदार" : "Relative", val: "Relative / रिश्तेदार" },
    { label: language === "hi" ? "पड़ोसी / मित्र" : "Neighbor/Friend", val: "Neighbor / पड़ोसी" },
  ];

  const resetForm = () => {
    setName("");
    setPhone("");
    setRelation("Son / बेटा");
    setIsDefault(false);
    setEditingId(null);
    setIsAddingOrEditing(false);
    setDeleteConfirmId(null);
  };

  const handleStartAdd = () => {
    setName("");
    setPhone("");
    setRelation("Son / बेटा");
    setIsDefault(contactList.length === 0);
    setEditingId(null);
    setIsAddingOrEditing(true);
  };

  const handleStartEdit = (contact: CaregiverContact) => {
    setName(contact.name);
    const raw = contact.phone.startsWith("91") && contact.phone.length > 10 ? contact.phone.slice(2) : contact.phone;
    setPhone(raw);
    setRelation(contact.relation || "Son / बेटा");
    setIsDefault(Boolean(contact.isDefault));
    setEditingId(contact.id || contact.phone);
    setIsAddingOrEditing(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned;
    }

    let updated: CaregiverContact[];

    if (editingId) {
      // Update existing contact
      updated = contactList.map((c) => {
        if ((c.id && c.id === editingId) || (!c.id && c.phone === editingId)) {
          return {
            ...c,
            name: name.trim(),
            phone: cleaned,
            relation,
            isDefault: isDefault ? true : c.isDefault,
          };
        }
        return isDefault ? { ...c, isDefault: false } : c;
      });
    } else {
      // Create new contact
      const newContact: CaregiverContact = {
        id: "fam_" + Date.now(),
        name: name.trim(),
        phone: cleaned,
        relation,
        isDefault: isDefault || contactList.length === 0,
      };

      if (isDefault) {
        updated = [...contactList.map((c) => ({ ...c, isDefault: false })), newContact];
      } else {
        updated = [...contactList, newContact];
      }
    }

    setContactList(updated);
    onSaveContacts(updated);
    setSavedMessage(language === "hi" ? "सफलतापूर्वक सुरक्षित हुआ!" : "Contact saved successfully!");
    setTimeout(() => {
      setSavedMessage(null);
      resetForm();
    }, 1000);
  };

  const handleDelete = (targetId: string) => {
    const updated = contactList.filter((c) => (c.id ? c.id !== targetId : c.phone !== targetId));
    // If we deleted the default contact, designate the first remaining as default
    if (updated.length > 0 && !updated.some((c) => c.isDefault)) {
      updated[0].isDefault = true;
    }
    setContactList(updated);
    onSaveContacts(updated);
    setDeleteConfirmId(null);
  };

  const handleSetDefault = (targetId: string) => {
    const updated = contactList.map((c) => ({
      ...c,
      isDefault: (c.id && c.id === targetId) || (!c.id && c.phone === targetId),
    }));
    setContactList(updated);
    onSaveContacts(updated);
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
      aria-labelledby="caregiver-modal-title"
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white max-w-xl w-full rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <h3 id="caregiver-modal-title" className="font-black text-2xl text-slate-900">
                {language === "hi"
                  ? "विश्वस्त परिवार संपर्क (Family)"
                  : language === "hinglish"
                  ? "Family & Caregiver Contacts"
                  : "Family & Caregiver Contacts"}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                {language === "hi"
                  ? "WhatsApp अलर्ट या सलाह के लिए अपने परिवार को जोड़ें"
                  : "Saved family members for 1-tap WhatsApp alerts"}
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

        {/* Modal Body: Scrollable */}
        <div className="overflow-y-auto flex-1 space-y-5 pr-1">
          {savedMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 font-bold text-sm flex items-center justify-center gap-2 animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-600" />
              {savedMessage}
            </div>
          )}

          {/* Contact List View */}
          {!isAddingOrEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-700" />
                  <span className="font-bold text-base text-slate-800">
                    {language === "hi" ? "सहेजे गए सदस्य:" : "Saved Family Members:"} ({contactList.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{language === "hi" ? "+ नया सदस्य जोड़ें" : "+ Add Member"}</span>
                </button>
              </div>

              {contactList.length === 0 ? (
                <div className="text-center p-8 bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200 space-y-3">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800">
                    {language === "hi" ? "अभी कोई परिवार संपर्क नहीं है" : "No Family Contacts Saved Yet"}
                  </h4>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto">
                    {language === "hi"
                      ? "अपने बेटे, बेटी या किसी रिश्तेदार का नंबर जोड़ें ताकि जरूरत पड़ने पर 1-क्लिक में WhatsApp पर सलाह ले सकें।"
                      : "Add your son, daughter, or trusted relative so you can consult them via WhatsApp with one tap."}
                  </p>
                  <button
                    type="button"
                    onClick={handleStartAdd}
                    className="mt-2 px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl inline-flex items-center gap-2 shadow-md transition"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>{language === "hi" ? "पहला संपर्क जोड़ें" : "Add First Contact"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {contactList.map((contact, index) => {
                    const idKey = contact.id || contact.phone || String(index);
                    const isDeleting = deleteConfirmId === idKey;

                    return (
                      <div
                        key={idKey}
                        className={`p-4 rounded-2xl border-2 transition ${
                          contact.isDefault
                            ? "bg-purple-50/70 border-purple-300 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                        }`}
                      >
                        {isDeleting ? (
                          <div className="p-2 space-y-2 text-center">
                            <div className="flex items-center justify-center gap-2 text-amber-700 font-bold text-sm">
                              <AlertTriangle className="w-5 h-5" />
                              <span>
                                {language === "hi"
                                  ? `क्या आप ${contact.name} को हटाना चाहते हैं?`
                                  : `Remove ${contact.name} from family contacts?`}
                              </span>
                            </div>
                            <div className="flex justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleDelete(idKey)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition"
                              >
                                {language === "hi" ? "हाँ, हटाएं" : "Yes, Delete"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition"
                              >
                                {language === "hi" ? "रद्द करें" : "Cancel"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-purple-200/80 text-purple-900 font-black text-lg flex items-center justify-center shrink-0">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-black text-slate-900 text-lg truncate">
                                    {contact.name}
                                  </h4>
                                  {contact.relation && (
                                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-purple-100 text-purple-800">
                                      {contact.relation}
                                    </span>
                                  )}
                                  {contact.isDefault && (
                                    <span className="px-2 py-0.5 text-xs font-black rounded-md bg-amber-100 text-amber-900 flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                      {language === "hi" ? "मुख्य संपर्क" : "Primary"}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-sm mt-0.5">
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{formatDisplayPhone(contact.phone)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!contact.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefault(idKey)}
                                  title={language === "hi" ? "मुख्य संपर्क बनाएं" : "Set as primary default"}
                                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 flex items-center justify-center transition"
                                >
                                  <Star className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleStartEdit(contact)}
                                title={language === "hi" ? "संपादित करें / बदलें" : "Edit contact"}
                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 flex items-center justify-center transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(idKey)}
                                title={language === "hi" ? "हटाएं" : "Delete contact"}
                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 flex items-center justify-center transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Add or Edit Form */
            <form onSubmit={handleFormSubmit} className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-purple-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h4 className="font-black text-lg text-purple-950 flex items-center gap-2">
                  {editingId ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {editingId
                    ? language === "hi"
                      ? "सदस्य विवरण बदलें"
                      : "Edit Family Member"
                    : language === "hi"
                    ? "नया परिवार सदस्य जोड़ें"
                    : "Add New Family Member"}
                </h4>
                {contactList.length > 0 && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
                  >
                    {language === "hi" ? "सूची पर वापस जाएं" : "Back to list"}
                  </button>
                )}
              </div>

              {/* Name field */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  {language === "hi" ? "नाम (Name):" : "Name:"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === "hi" ? "जैसे: रोहन या पूजा" : "e.g. Rohan or Priya"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[50px] px-4 rounded-xl border-2 border-slate-300 focus:border-purple-600 focus:outline-none text-base font-semibold text-slate-900 bg-white"
                />
              </div>

              {/* Relation Presets */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {language === "hi" ? "रिश्ता (Relation):" : "Relation:"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {relationPresets.map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setRelation(r.val)}
                      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition ${
                        relation === r.val
                          ? "bg-purple-700 text-white border-purple-700 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  {language === "hi" ? "मोबाइल नंबर (10 अंक WhatsApp):" : "WhatsApp Mobile Number (10 digits):"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500 font-bold text-sm">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={13}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full min-h-[50px] pl-13 pr-4 rounded-xl border-2 border-slate-300 focus:border-purple-600 focus:outline-none text-base font-semibold text-slate-900 bg-white"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {language === "hi"
                    ? "यह नंबर पूरी तरह आपके फोन/ब्राउज़र में सुरक्षित रहेगा।"
                    : "Stored locally and securely on your device."}
                </p>
              </div>

              {/* Make Default Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <span className="text-sm font-bold text-slate-800">
                  {language === "hi"
                    ? "⭐ इसे मुख्य संपर्क (Primary Contact) बनाएं"
                    : "⭐ Set as primary contact"}
                </span>
              </label>

              {/* Form action buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 min-h-[52px] bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-black text-base rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <UserCheck className="w-5 h-5" />
                  {editingId
                    ? language === "hi"
                      ? "विवरण अपडेट करें"
                      : "Update Contact"
                    : language === "hi"
                    ? "संपर्क सुरक्षित करें"
                    : "Save Contact"}
                </button>
                {contactList.length > 0 && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="min-h-[52px] px-4 border-2 border-slate-300 font-bold rounded-xl hover:bg-slate-200 text-slate-700 transition"
                  >
                    {language === "hi" ? "रद्द करें" : "Cancel"}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t pt-3 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base rounded-xl transition"
          >
            {language === "hi" ? "पूर्ण (Done)" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
