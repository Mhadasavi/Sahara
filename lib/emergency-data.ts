export interface EmergencyContact {
  id: string;
  name: {
    hi: string;
    hinglish: string;
    en: string;
  };
  number: string;
  category: "cyber" | "senior" | "police" | "medical" | "bank";
  badge: {
    hi: string;
    en: string;
  };
  description: {
    hi: string;
    hinglish: string;
    en: string;
  };
  icon: string;
}

export const VERIFIED_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "cyber-1930",
    name: {
      hi: "राष्ट्रीय साइबर क्राइम हेल्पलाइन (वित्तीय धोखाधड़ी)",
      hinglish: "National Cyber Crime Helpline (1930)",
      en: "National Cyber Crime Reporting Helpline",
    },
    number: "1930",
    category: "cyber",
    badge: {
      hi: "गृह मंत्रालय, भारत सरकार",
      en: "Govt of India (MHA)",
    },
    description: {
      hi: "ऑनलाइन वित्तीय धोखाधड़ी या बैंक खाते से पैसे कटने पर तुरंत (गोल्डन आवर में) 1930 पर कॉल करें ताकि लेन-देन रोका जा सके।",
      hinglish: "Agar bank account ya UPI se unauthorized paise kat gaye hain, toh turant 1930 par call karein taaki transaction freeze ho sake.",
      en: "Immediate financial fraud reporting. Call immediately within the golden hour to freeze fraudulent bank transfers.",
    },
    icon: "🚨",
  },
  {
    id: "elderline-14567",
    name: {
      hi: "एल्डरलाइन - वरिष्ठ नागरिक राष्ट्रीय हेल्पलाइन",
      hinglish: "Elderline Senior Citizen Helpline (14567)",
      en: "Elderline National Senior Citizen Helpline",
    },
    number: "14567",
    category: "senior",
    badge: {
      hi: "सामाजिक न्याय मंत्रालय, भारत सरकार",
      en: "Ministry of Social Justice",
    },
    description: {
      hi: "बुजुर्गों के लिए निःशुल्क सहायता: कानूनी सलाह, पेंशन सहायता, भावनात्मक सहारा और उत्पीड़न के खिलाफ सुरक्षा।",
      hinglish: "Senior citizens ke liye free toll-free support: legal guidance, pension help aur emotional support.",
      en: "Toll-free national support for seniors: guidance, pension assistance, care, and protection against abuse.",
    },
    icon: "🧓",
  },
  {
    id: "national-emergency-112",
    name: {
      hi: "राष्ट्रीय आपातकालीन नंबर (पुलिस, दमकल, आपदा)",
      hinglish: "All-in-One Emergency Helpline (112)",
      en: "National Emergency Response Support (112)",
    },
    number: "112",
    category: "police",
    badge: {
      hi: "अखिल भारतीय आपात सेवा",
      en: "Pan-India Emergency",
    },
    description: {
      hi: "किसी भी आपात स्थिति में तुरंत सहायता के लिए (100, 101 की जगह एकीकृत नंबर)।",
      hinglish: "Kisi bhi emergency situation mein police ya relief support ke liye 24/7 active.",
      en: "Single emergency response number across India for immediate police or disaster assistance.",
    },
    icon: "🚓",
  },
  {
    id: "ambulance-108",
    name: {
      hi: "राष्ट्रीय एम्बुलेंस आपातकालीन सेवा",
      hinglish: "National Ambulance Service (108 / 102)",
      en: "National Medical Ambulance Service",
    },
    number: "108",
    category: "medical",
    badge: {
      hi: "राष्ट्रीय स्वास्थ्य मिशन",
      en: "National Health Mission",
    },
    description: {
      hi: "आपातकालीन चिकित्सा सहायता और नजदीकी अस्पताल में एम्बुलेंस पहुंचाने के लिए।",
      hinglish: "Medical emergency ya doctor/hospital transport ke liye turant call karein.",
      en: "Emergency medical assistance and hospital ambulance dispatch.",
    },
    icon: "🚑",
  },
  {
    id: "sbi-official",
    name: {
      hi: "एसबीआई (SBI) आधिकारिक बैंक हेल्पलाइन",
      hinglish: "SBI Official Banking Helpline",
      en: "State Bank of India Official Helpline",
    },
    number: "18001234",
    category: "bank",
    badge: {
      hi: "आरबीआई / एसबीआई सत्यापित",
      en: "RBI / SBI Verified",
    },
    description: {
      hi: "कार्ड ब्लॉक करने, खाता फ्रीज करने या फर्जीवाड़े की बैंक में सीधी शिकायत दर्ज कराने के लिए।",
      hinglish: "Debit card block karne ya account inquiry ke liye official toll-free number.",
      en: "Official toll-free line to block cards, freeze compromised accounts, or report unauthorized charges.",
    },
    icon: "🏦",
  },
];
