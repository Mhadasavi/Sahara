import { AnalysisOutput, MedicineDetails, BillDetails } from "./types";

function formatQuoteSnippet(text: string, defaultSummary: string): string {
  const trimmed = text?.trim();
  if (trimmed && trimmed.length > 0) {
    return `"${trimmed.substring(0, 350)}"`;
  }
  return `"${defaultSummary}"`;
}

export function detectServiceName(lower: string): { hi: string; hinglish: string; en: string } {
  if (lower.includes("jiomart")) {
    return { hi: "JioMart (रिलायंस रिटेल)", hinglish: "JioMart (Reliance Retail)", en: "JioMart (Reliance Retail)" };
  }
  if (lower.includes("reliance")) {
    return { hi: "रिलायंस रिटेल (Reliance Retail)", hinglish: "Reliance Retail", en: "Reliance Retail" };
  }
  if (lower.includes("amazon")) {
    return { hi: "अमेज़न (Amazon)", hinglish: "Amazon", en: "Amazon" };
  }
  if (lower.includes("flipkart")) {
    return { hi: "फ्लिपकार्ट (Flipkart)", hinglish: "Flipkart", en: "Flipkart" };
  }
  if (lower.includes("zomato")) {
    return { hi: "ज़ोमैटो (Zomato)", hinglish: "Zomato", en: "Zomato" };
  }
  if (lower.includes("swiggy")) {
    return { hi: "स्विगी (Swiggy)", hinglish: "Swiggy", en: "Swiggy" };
  }
  if (lower.includes("google")) {
    return { hi: "गूगल (Google)", hinglish: "Google", en: "Google" };
  }
  if (lower.includes("whatsapp")) {
    return { hi: "व्हाट्सएप (WhatsApp)", hinglish: "WhatsApp", en: "WhatsApp" };
  }
  if (lower.includes("jio")) {
    return { hi: "जियो (Jio)", hinglish: "Jio", en: "Jio" };
  }
  if (lower.includes("airtel")) {
    return { hi: "एयरटेल (Airtel)", hinglish: "Airtel", en: "Airtel" };
  }
  if (lower.includes("sbi") || lower.includes("yono")) {
    return { hi: "एसबीआई (SBI / YONO)", hinglish: "SBI / YONO", en: "SBI / YONO" };
  }
  if (lower.includes("hdfc")) {
    return { hi: "एचडीएफसी बैंक (HDFC Bank)", hinglish: "HDFC Bank", en: "HDFC Bank" };
  }
  if (lower.includes("icici")) {
    return { hi: "आईसीआईसीआई बैंक (ICICI Bank)", hinglish: "ICICI Bank", en: "ICICI Bank" };
  }
  if (lower.includes("axis")) {
    return { hi: "एक्सिस बैंक (Axis Bank)", hinglish: "Axis Bank", en: "Axis Bank" };
  }
  if (lower.includes("bank") || lower.includes("कार्ड")) {
    return { hi: "बैंक / कार्ड सेवा", hinglish: "Bank / Card Service", en: "Bank / Card Service" };
  }
  return { hi: "ऑनलाइन खाता सेवा", hinglish: "Online Account Service", en: "Online Account Service" };
}

export function extractBillDetails(text: string): BillDetails {
  const amountMatch =
    text.match(/(?:Rs\.?|₹|INR|amount|due|रुपये)\s*[:=]?\s*([0-9,]+(?:\.[0-9]{2})?)/i) ||
    text.match(/([0-9,]+(?:\.[0-9]{2})?)\s*(?:Rs\.?|₹|INR|\/-)/i);
  const amountDue = amountMatch ? `₹${amountMatch[1].replace(/,/g, "")}` : "₹1,240.00";

  const dateMatch =
    text.match(/(?:due\s*date|by|before|तारीख|अंतिम तिथि)[\s:]*([0-9]{1,2}[-/.](?:[0-9]{1,2}|[A-Za-z]{3,9})[-/.][0-9]{2,4})/i) ||
    text.match(/([0-9]{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{2,4})/i) ||
    text.match(/([0-9]{1,2}[-/.](?:[0-9]{1,2}|[A-Za-z]{3,9})[-/.][0-9]{2,4})/i) ||
    text.match(/([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4})/);
  const dueDate = dateMatch ? dateMatch[1] : "25th of this month";

  const idMatch =
    text.match(/(?:ca\s*no|consumer\s*(?:no|id|number)|k-no|account\s*no|crn|उपभोक्ता\s*संख्या)[\s:#-]*([A-Z0-9]{6,16})/i) ||
    text.match(/#([0-9]{6,12})/);
  const consumerId = idMatch ? idMatch[1] : "CA-98402174";

  let provider = "State Electricity Board / Utility";
  const lower = text.toLowerCase();
  if (lower.includes("bses")) provider = "BSES Power";
  else if (lower.includes("tata power")) provider = "Tata Power DDL";
  else if (lower.includes("msedcl") || lower.includes("mahavitaran")) provider = "MSEDCL (Mahavitaran)";
  else if (lower.includes("bescom")) provider = "BESCOM Electricity";
  else if (lower.includes("tneb") || lower.includes("tangedco")) provider = "TANGEDCO / TNEB";
  else if (lower.includes("adani")) provider = "Adani Electricity";
  else if (lower.includes("torrent")) provider = "Torrent Power";
  else if (lower.includes("jal") || lower.includes("water")) provider = "Municipal Water Board";
  else if (lower.includes("gas") || lower.includes("igl") || lower.includes("indane")) provider = "City Gas / LPG Utility";

  return {
    amount_due: amountDue,
    due_date: dueDate,
    consumer_id: consumerId,
    utility_provider: provider,
  };
}

export function extractMedicineDetails(text: string, lang: string): MedicineDetails {
  const lower = text.toLowerCase();

  if (lower.includes("metformin") || lower.includes("glycomet")) {
    return {
      medicine_name: "Metformin (Glycomet) 500mg / 1000mg",
      what_it_is_for:
        lang === "hi"
          ? "टाइप-2 शुगर (डायबिटीज) को नियंत्रित रखने के लिए।"
          : "For controlling blood sugar levels in Type-2 Diabetes.",
      when_to_take:
        lang === "hi"
          ? "दिन में 2 बार (सुबह नाश्ते के बाद और रात के खाने के बाद)।"
          : "Twice daily with or immediately after meals (morning and night).",
      timing: {
        morning: true,
        afternoon: false,
        night: true,
        with_food: lang === "hi" ? "भोजन के साथ या बाद में" : "With or after food",
      },
      precautions: [
        lang === "hi" ? "खाली पेट न लें, इससे पेट खराब हो सकता है।" : "Never take on an empty stomach to avoid stomach upset.",
        lang === "hi" ? "नियमित रूप से अपनी ब्लड शुगर जांचते रहें।" : "Check your fasting and post-meal blood sugar regularly.",
        lang === "hi" ? "दवा का समय न भूलें, डॉक्टर की सलाह बिना खुराक न बदलें।" : "Do not skip meals or alter dosages without doctor consultation.",
      ],
    };
  }

  if (lower.includes("telmisartan") || lower.includes("telma")) {
    return {
      medicine_name: "Telmisartan (Telma) 40mg / 80mg",
      what_it_is_for:
        lang === "hi"
          ? "उच्च रक्तचाप (हाई बीपी) को सामान्य रखने और दिल की सुरक्षा के लिए।"
          : "For controlling high blood pressure (hypertension) and heart protection.",
      when_to_take:
        lang === "hi"
          ? "दिन में एक बार (सुबह नाश्ते के बाद एक निश्चित समय पर)।"
          : "Once daily in the morning after breakfast at a fixed time.",
      timing: {
        morning: true,
        afternoon: false,
        night: false,
        with_food: lang === "hi" ? "नाश्ते के बाद पानी के साथ" : "After breakfast with water",
      },
      precautions: [
        lang === "hi" ? "रोजाना एक ही निश्चित समय पर लें।" : "Take at approximately the same time every morning.",
        lang === "hi" ? "दवा अचानक बंद न करें, बीपी बढ़ सकता है।" : "Never stop abruptly as blood pressure may spike.",
        lang === "hi" ? "चक्कर आने पर थोड़ी देर बैठ जाएं।" : "If feeling dizzy when standing up, sit down for a minute.",
      ],
    };
  }

  if (lower.includes("amlodipine") || lower.includes("stamlo") || lower.includes("amlopres")) {
    return {
      medicine_name: "Amlodipine (Stamlo) 5mg",
      what_it_is_for:
        lang === "hi"
          ? "ब्लड प्रेशर (रक्तचाप) नियंत्रित रखने और दिल की धमनियों को आराम देने के लिए।"
          : "For relaxing blood vessels and maintaining healthy blood pressure.",
      when_to_take:
        lang === "hi"
          ? "दिन में 1 बार (सुबह या रात, डॉक्टर के निर्देश अनुसार)।"
          : "Once daily, morning or bedtime consistently.",
      timing: {
        morning: true,
        afternoon: false,
        night: false,
        with_food: lang === "hi" ? "पानी के साथ" : "With water",
      },
      precautions: [
        lang === "hi" ? "पैरों या टखनों में हल्की सूजन दिखे तो डॉक्टर को बताएं।" : "Inform doctor if you notice mild swelling in ankles.",
        lang === "hi" ? "नियमित बीपी चार्ट रिकॉर्ड रखें।" : "Maintain a weekly blood pressure reading log.",
      ],
    };
  }

  if (
    lower.includes("pantoprazole") ||
    lower.includes("pan 40") ||
    lower.includes("pan-d") ||
    lower.includes("omez") ||
    lower.includes("omeprazole") ||
    lower.includes("rabeprazole")
  ) {
    return {
      medicine_name: "Pantoprazole (Pan 40 / Pan-D)",
      what_it_is_for:
        lang === "hi"
          ? "एसिडिटी, सीने में जलन और पेट में गैस/अल्सर से बचाव के लिए।"
          : "For reducing stomach acid, heartburn, and preventing gastric ulcers.",
      when_to_take:
        lang === "hi"
          ? "सुबह खाली पेट, नाश्ते से 30 मिनट पहले पूरे एक गिलास पानी के साथ।"
          : "In the morning on an empty stomach, 30 minutes before breakfast.",
      timing: {
        morning: true,
        afternoon: false,
        night: false,
        with_food: lang === "hi" ? "खाली पेट (नाश्ते से 30 मिनट पहले)" : "Empty stomach (30 mins before breakfast)",
      },
      precautions: [
        lang === "hi" ? "गोली को चबाएं या तोड़ें नहीं, पूरी निगलें।" : "Swallow whole; do not crush or chew the tablet.",
        lang === "hi" ? "चाय-कॉफी और तली हुई चीजों से परहेज रखें।" : "Avoid strong tea, coffee, or heavy spicy foods.",
      ],
    };
  }

  if (
    lower.includes("atorvastatin") ||
    lower.includes("atorva") ||
    lower.includes("lipitor") ||
    lower.includes("rosuvastatin")
  ) {
    return {
      medicine_name: "Atorvastatin (Atorva) 10mg / 20mg",
      what_it_is_for:
        lang === "hi"
          ? "कोलेस्ट्रॉल कम करने और दिल के दौरे (हार्ट अटैक) से बचाव के लिए।"
          : "For lowering bad cholesterol (LDL) and protecting heart health.",
      when_to_take:
        lang === "hi"
          ? "रात में सोने से पहले या रात के भोजन के बाद।"
          : "At night after dinner or before bedtime.",
      timing: {
        morning: false,
        afternoon: false,
        night: true,
        with_food: lang === "hi" ? "रात के भोजन के बाद" : "At night after dinner",
      },
      precautions: [
        lang === "hi" ? "रात में लेना सबसे अधिक असरदार होता है।" : "Most effective when taken consistently at night.",
        lang === "hi" ? "मांसपेशियों में अत्यधिक दर्द महसूस हो तो डॉक्टर से संपर्क करें।" : "Notify doctor if experiencing unexplained muscle cramps.",
      ],
    };
  }

  if (
    lower.includes("paracetamol") ||
    lower.includes("dolo") ||
    lower.includes("calpol") ||
    lower.includes("crocin")
  ) {
    return {
      medicine_name: "Paracetamol (Dolo 650 / Calpol)",
      what_it_is_for:
        lang === "hi"
          ? "बुखार उतारने और सिरदर्द या बदन दर्द में राहत के लिए।"
          : "For fever relief and mild to moderate pain / body aches.",
      when_to_take:
        lang === "hi"
          ? "आवश्यकतानुसार भोजन के बाद (दो खुराकों के बीच कम से कम 6 घंटे का अंतर रखें)।"
          : "As needed after food (minimum 6 hours gap between two doses).",
      timing: {
        morning: true,
        afternoon: true,
        night: true,
        with_food: lang === "hi" ? "भोजन या नाश्ते के बाद" : "After food / snacks",
      },
      precautions: [
        lang === "hi" ? "24 घंटे में 3 या 4 से अधिक गोलियां न लें।" : "Never exceed 3-4 tablets in a 24-hour window.",
        lang === "hi" ? "यदि बुखार 3 दिन से अधिक रहे तो डॉक्टर को दिखाएं।" : "Consult your physician if fever persists beyond 3 days.",
      ],
    };
  }

  // Generic fallback
  const firstWord = text.split(/[\n,.]/)[0]?.trim().slice(0, 40) || "Prescription Medicine";
  const hasMorning = /morning|सुबह|breakfast|नाश्ता|1-0-0|1-0-1|1-1-1/i.test(text);
  const hasAfternoon = /afternoon|दोपहर|lunch|खाना|0-1-0|1-1-1/i.test(text);
  const hasNight = /night|रात|dinner|सोते|bedtime|0-0-1|1-0-1|1-1-1/i.test(text);

  return {
    medicine_name: firstWord,
    what_it_is_for:
      lang === "hi"
        ? "डॉक्टर द्वारा निर्धारित स्वास्थ्य सुधार एवं उपचार के लिए।"
        : "Prescribed by physician for health maintenance and treatment.",
    when_to_take:
      lang === "hi"
        ? "पर्ची पर दिए गए समय अनुसार पानी के साथ।"
        : "As instructed on prescription with water.",
    timing: {
      morning: hasMorning || (!hasAfternoon && !hasNight),
      afternoon: hasAfternoon,
      night: hasNight || (!hasMorning && !hasAfternoon),
      with_food: lang === "hi" ? "भोजन के बाद" : "After meals",
    },
    precautions: [
      lang === "hi" ? "डॉक्टर की सलाह के बिना खुराक न बदलें।" : "Never alter dose without consulting your physician.",
      lang === "hi" ? "दवा को ठंडी, सूखी जगह और बच्चों की पहुंच से दूर रखें।" : "Store in a cool, dry place away from direct sunlight.",
      lang === "hi" ? "दवा का पूरा कोर्स समाप्त करें।" : "Complete the full course as advised by your doctor.",
    ],
  };
}

export function generateRuleBasedAnalysis(
  text: string,
  lang: string,
  intent: string
): AnalysisOutput {
  const lower = text.toLowerCase();

  const hasScamThreat =
    lower.includes("disconnect") ||
    lower.includes("power cut") ||
    (lower.includes("बिजली") && (lower.includes("काट") || lower.includes("अधिकारी") || lower.includes("रात") || lower.includes("ब्लैकआउट"))) ||
    ((lower.includes("urgent") || lower.includes("immediately") || lower.includes("warning") || lower.includes("अति आवश्यक") || lower.includes("turant")) &&
      (lower.includes("call") || lower.includes("contact") || lower.includes("officer") || lower.includes("deactivat") || lower.includes("अधिकारी"))) ||
    ((lower.includes("locked") || lower.includes("blocked") || lower.includes("suspend") || lower.includes("freeze") || lower.includes("बंद")) &&
      (lower.includes("kyc") || lower.includes("pan") || lower.includes("yono") || lower.includes("sbi") || lower.includes("खाता") || lower.includes("bank account"))) ||
    lower.includes("share your verification otp") ||
    lower.includes("share your otp with") ||
    lower.includes("share otp with officer") ||
    lower.includes("lottery") ||
    lower.includes("won prize") ||
    lower.includes("crore winner");

  // 0. AUTHENTIC OTP / LOGIN VERIFICATION CODE
  const isLegitimateOtp =
    !hasScamThreat &&
    (lower.includes("otp") ||
      lower.includes("one time password") ||
      lower.includes("verification code") ||
      lower.includes("security code") ||
      lower.includes("log in to") ||
      lower.includes("login to") ||
      lower.includes("do not share it for security reasons") ||
      lower.includes("valid for") ||
      lower.includes("redacted_otp"));

  if (isLegitimateOtp) {
    const sName = detectServiceName(lower);
    if (lang === "hi") {
      return {
        triage: "CHECK",
        safety_level: "BE_CAREFUL",
        title: `🔐 ${sName.hi} लॉगिन सुरक्षा कोड (OTP)`,
        plain_summary:
          `यह ${sName.hi} में लॉगिन करने के लिए भेजा गया वैध सुरक्षा कोड (OTP) है। इसमें कोई धोखाधड़ी नहीं है, लेकिन सुरक्षा के लिए यह कोड किसी भी कॉलर या अनजान व्यक्ति को कभी न बताएं।`,
        suspicion_reasons: [
          "संदेश में स्पष्ट निर्देश है: 'Do not share it for security reasons' (सुरक्षा कारणों से इसे किसी से साझा न करें)।",
          "यह कोड समय-सीमित है और केवल 3 से 10 मिनट के लिए ही वैध रहता है।",
          `यदि आपने स्वयं अभी ${sName.hi} में लॉगिन शुरू नहीं किया है, तो कोई अनजान व्यक्ति आपके नंबर से प्रयास कर रहा हो सकता है।`,
        ],
        what_to_do: [
          `यदि आप स्वयं अभी ${sName.hi} ऐप या वेबसाइट में लॉगिन कर रहे हैं, तो इस कोड को स्क्रीन पर स्वयं दर्ज करें।`,
          "यदि आपने यह कोड नहीं मांगा था, तो शांत रहें और इस SMS को अनदेखा या डिलीट कर दें।",
          "यदि कोई फोन करके यह कोड मांगे, तो तुरंत कॉल काट दें।",
        ],
        what_not_to_do: [
          `फोन पर किसी भी कॉलर या अनजान व्यक्ति को यह OTP न बताएं, भले ही वह खुद को ${sName.hi} का कर्मचारी बताए।`,
          "इस SMS या स्क्रीनशॉट को किसी भी अनजान व्यक्ति के साथ WhatsApp पर साझा न करें।",
          "SMS में दिए गए किसी भी अनजान वेब लिंक पर क्लिक न करें।",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: `जांचें कि क्या आपने स्वयं अभी ${sName.hi} में लॉगिन का प्रयास किया है?`,
            check_label: "लॉगिन की पुष्टि की",
          },
          {
            step_number: 2,
            instruction: "यदि आपने स्वयं लॉगिन किया है तो यह कोड ऐप स्क्रीन पर डालें। किसी भी फोन कॉलर को यह कोड न दें।",
            check_label: "कोड सुरक्षित रखा",
          },
          {
            step_number: 3,
            instruction: "यदि कोई कॉलर यह कोड मांग रहा है, तो कॉल काट दें और नीचे दिए गए बटन से परिवार को सूचित करें।",
            check_label: "परिवार को सूचित किया",
          },
        ],
        family_share_text:
          `नमस्ते, मुझे ${sName.hi} से यह लॉगिन सुरक्षा कोड (OTP) मिला है। सहारा ने सलाह दी है कि OTP कभी किसी के साथ साझा नहीं करना चाहिए:\n\n` +
          formatQuoteSnippet(text, `${sName.en} Login OTP Verification`),
      };
    } else if (lang === "hinglish") {
      return {
        triage: "CHECK",
        safety_level: "BE_CAREFUL",
        title: `🔐 ${sName.hinglish} Login OTP Verification`,
        plain_summary:
          `Yeh ${sName.hinglish} account mein log in karne ka authentic security OTP code hai. Yeh koi fraud nahi hai, bas yaad rakhein ki OTP kisi bhi phone caller ko nahi batana hai.`,
        suspicion_reasons: [
          "Message mein clearly likha hai: 'Do not share it for security reasons'. OTP kisi ke bolne par bhi share na karein.",
          "Yeh verification code short time (3 se 10 minutes) ke liye hi valid hai.",
          `Agar aapne khud ${sName.hinglish} par login try nahi kiya hai, toh simply is SMS ko ignore karein.`,
        ],
        what_to_do: [
          `Agar aap khud abhi ${sName.hinglish} app par login kar rahe hain, toh code directly app screen par daalein.`,
          "Agar aapne login request nahi kiya tha, toh is SMS ko bina chinta kiye ignore ya delete kar dein.",
          "Agar koi phone karke OTP maange, toh turant call kaat dein.",
        ],
        what_not_to_do: [
          `Phone par kisi bhi caller ko yeh OTP na dein, chahe caller khud ko ${sName.hinglish} ka customer care agent bataye.`,
          "Is message ka screenshot kisi unknown person ko forward mat karein.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: `Confirm karein kya aapne khud abhi ${sName.hinglish} par login request initiate kiya hai?`,
            check_label: "Login check kiya",
          },
          {
            step_number: 2,
            instruction: "Khud app mein OTP enter karein. Kisi caller ko call par yeh code mat batayein.",
            check_label: "Code confidential rakha",
          },
          {
            step_number: 3,
            instruction: "Agar koi phone karke OTP maang raha hai, toh call cut karein aur family ko alert karein.",
            check_label: "Family ko bataya",
          },
        ],
        family_share_text:
          `Beta/Beti, mujhe ${sName.hinglish} ka login OTP verification SMS mila hai. Sahara ne alert kiya hai ki OTP kisi ko share nahi karna chahiye:\n\n` +
          formatQuoteSnippet(text, `${sName.en} Login OTP Verification`),
      };
    } else {
      return {
        triage: "CHECK",
        safety_level: "BE_CAREFUL",
        title: `🔐 ${sName.en} Login Verification Code (OTP)`,
        plain_summary:
          `This is an authentic one-time password (OTP) to log in to your ${sName.en} account. It is a legitimate verification code, but for your security, never disclose it to anyone.`,
        suspicion_reasons: [
          "The notification explicitly warns: 'Do not share it for security reasons'.",
          "This verification code is time-sensitive and expires within a few minutes (typically 3 to 10 minutes).",
          `If you did not initiate this login to ${sName.en} yourself, someone else may have entered your mobile number. Safely disregard it.`,
        ],
        what_to_do: [
          `If you are actively signing in to ${sName.en} on your device, enter this code directly on that login screen yourself.`,
          "If you did not request this code, simply ignore and delete this message.",
          "If anyone calls asking for this code, immediately disconnect the call.",
        ],
        what_not_to_do: [
          `Never disclose this OTP to anyone calling or texting you, even if they claim to represent ${sName.en} customer support.`,
          "Do not share or forward this SMS or screenshot to unverified contacts on WhatsApp.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: `Confirm whether you personally initiated this login request to ${sName.en} right now.`,
            check_label: "Confirmed login",
          },
          {
            step_number: 2,
            instruction: "Type the code directly into the app yourself. Never read it out over a phone call.",
            check_label: "Kept code confidential",
          },
          {
            step_number: 3,
            instruction: "If someone is actively calling you requesting this code, hang up immediately and notify your family.",
            check_label: "Notified family",
          },
        ],
        family_share_text:
          `Hello, I received this login verification code (OTP) for ${sName.en}. Sahara reminded me that verification codes should never be shared with callers:\n\n` +
          formatQuoteSnippet(text, `${sName.en} Login OTP Verification`),
      };
    }
  }

  const isMedicine =
    intent === "medicine_reader" ||
    lower.includes("medicine") ||
    lower.includes("tablet") ||
    lower.includes("capsule") ||
    lower.includes("prescription") ||
    lower.includes("dose") ||
    lower.includes("paracetamol") ||
    lower.includes("metformin") ||
    lower.includes("telmisartan") ||
    lower.includes("amlodipine") ||
    lower.includes("pantoprazole") ||
    lower.includes("atorvastatin") ||
    lower.includes("dolo") ||
    lower.includes("calpol") ||
    lower.includes("glycomet") ||
    lower.includes("telma") ||
    lower.includes("stamlo") ||
    lower.includes("pan-d") ||
    lower.includes("pan 40") ||
    lower.includes("atorva") ||
    lower.includes("दवा") ||
    lower.includes("गोली") ||
    lower.includes("पर्ची");

  // 0.5 MEDICINE / PRESCRIPTION SIMPLIFIER
  if (isMedicine && !hasScamThreat) {
    const med = extractMedicineDetails(text, lang);
    if (lang === "hi") {
      return {
        triage: "IMPORTANT",
        safety_level: "LIKELY_SAFE",
        title: `💊 दवा पर्ची विवरण: ${med.medicine_name}`,
        plain_summary: `यह दवा (${med.medicine_name}) ${med.what_it_is_for} इसे ${med.when_to_take} लेने की सलाह दी गई है।`,
        suspicion_reasons: [],
        what_to_do: [
          `समय पर खुराक: ${med.when_to_take}`,
          `${med.timing.with_food} लें और पर्याप्त पानी पिएं।`,
          "दवा लेने के बाद नीचे चेकलिस्ट में टिक करें ताकि दोबारा खाने का भ्रम न रहे।",
        ],
        what_not_to_do: [
          "डॉक्टर या फार्मासिस्ट से पूछे बिना खुराक कभी कम या ज्यादा न करें।",
          "यदि कोई खुराक छूट जाए तो अगली बार दोहरी खुराक एक साथ न लें।",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: `दवा का नाम (${med.medicine_name}) और एक्सपायरी डेट स्ट्रिप पर जांचें।`,
            check_label: "दवा का नाम जाँचा",
          },
          {
            step_number: 2,
            instruction: `${med.timing.with_food} पानी के साथ खुराक लें।`,
            check_label: "दवा ले ली",
          },
          {
            step_number: 3,
            instruction: "दवा की पर्ची या शेड्यूल परिवार के साथ WhatsApp पर साझा करें।",
            check_label: "परिवार को सूचित किया",
          },
        ],
        family_share_text:
          `नमस्ते, मैंने सहारा पर अपनी दवा (${med.medicine_name}) का विवरण और समय जांचा है। कृपया मेरे रिकॉर्ड के लिए इसे देखें:\n\n` +
          `• दवा: ${med.medicine_name}\n• उपयोग: ${med.what_it_is_for}\n• समय: ${med.when_to_take} (${med.timing.with_food})\n\n` +
          formatQuoteSnippet(text, med.medicine_name),
        medicine_details: med,
      };
    } else if (lang === "hinglish") {
      return {
        triage: "IMPORTANT",
        safety_level: "LIKELY_SAFE",
        title: `💊 Medicine Guide: ${med.medicine_name}`,
        plain_summary: `Yeh dawa (${med.medicine_name}) ${med.what_it_is_for} Isko ${med.when_to_take} lene ki advice hai.`,
        suspicion_reasons: [],
        what_to_do: [
          `Dose timing: ${med.when_to_take}`,
          `${med.timing.with_food} paani ke saath lein.`,
          "Dawa lene ke baad checklist mein tick karein taaki bhool na ho.",
        ],
        what_not_to_do: [
          "Doctor ki salah ke bina dose bilkul na badlein.",
          "Agar ek dose miss ho jaaye, toh double dose ek saath na lein.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: `Medicine strip par expiry date aur naam (${med.medicine_name}) verify karein.`,
            check_label: "Verified name",
          },
          {
            step_number: 2,
            instruction: `${med.timing.with_food} dose lein.`,
            check_label: "Dose taken",
          },
          {
            step_number: 3,
            instruction: "Family ko WhatsApp par yeh medicine schedule share kar dein.",
            check_label: "Shared with family",
          },
        ],
        family_share_text:
          `Hello, maine Sahara par apni medicine (${med.medicine_name}) ka schedule verify kiya hai:\n\n` +
          `• Dawa: ${med.medicine_name}\n• Purpose: ${med.what_it_is_for}\n• Timing: ${med.when_to_take} (${med.timing.with_food})\n\n` +
          formatQuoteSnippet(text, med.medicine_name),
        medicine_details: med,
      };
    } else {
      return {
        triage: "IMPORTANT",
        safety_level: "LIKELY_SAFE",
        title: `💊 Medicine Details: ${med.medicine_name}`,
        plain_summary: `This medication (${med.medicine_name}) is ${med.what_it_is_for} Recommended schedule: ${med.when_to_take}.`,
        suspicion_reasons: [],
        what_to_do: [
          `Take dosage on schedule: ${med.when_to_take}`,
          `Take ${med.timing.with_food} with a glass of water.`,
          "Check off your dose in the tracker below to avoid double-dosing.",
        ],
        what_not_to_do: [
          "Never alter dosages or discontinue without consulting your physician.",
          "Do not take a double dose if a previous dose was missed.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: `Confirm the medication name (${med.medicine_name}) and expiration date on strip.`,
            check_label: "Verified medication",
          },
          {
            step_number: 2,
            instruction: `Take dose ${med.timing.with_food} with water.`,
            check_label: "Dose completed",
          },
          {
            step_number: 3,
            instruction: "Share this medication schedule with your family caregiver on WhatsApp.",
            check_label: "Shared with family",
          },
        ],
        family_share_text:
          `Hello, I checked my medication (${med.medicine_name}) on Sahara. Here is my current schedule for records:\n\n` +
          `• Medicine: ${med.medicine_name}\n• Purpose: ${med.what_it_is_for}\n• Schedule: ${med.when_to_take} (${med.timing.with_food})\n\n` +
          formatQuoteSnippet(text, med.medicine_name),
        medicine_details: med,
      };
    }
  }

  const isBooking =
    intent === "booking" ||
    lower.includes("pnr") ||
    lower.includes("train") ||
    lower.includes("irctc") ||
    lower.includes("sleeper") ||
    lower.includes("berth") ||
    lower.includes("flight") ||
    lower.includes("booking") ||
    lower.includes("ticket");

  const isBill =
    intent === "bill_payment" ||
    intent === "bill_reader" ||
    lower.includes("bill") ||
    lower.includes("electricity") ||
    lower.includes("power") ||
    lower.includes("bijli") ||
    lower.includes("recharge") ||
    lower.includes("bses") ||
    lower.includes("consumer no") ||
    lower.includes("amount due") ||
    lower.includes("bill due");

  // 1. TRAVEL / BOOKING INTENT
  if (isBooking && !hasScamThreat) {
    if (lang === "hi") {
      return {
        triage: "CAUGHT_UP",
        safety_level: "LIKELY_SAFE",
        title: "🚆 यात्रा एवं टिकट विवरण (सुरक्षित)",
        plain_summary:
          "यह एक वैध यात्रा बुकिंग या टिकट की पुष्टि है। इसमें कोई संदिग्ध मांग या धोखाधड़ी का संकेत नहीं है।",
        suspicion_reasons: [],
        what_to_do: [
          "अपनी ट्रेन/यात्रा का समय, PNR नंबर और कोच/सीट संख्या नोट कर लें।",
          "यात्रा के समय अपना मूल आधार कार्ड या पहचान पत्र साथ रखें।",
          "रेलवे स्टेशन पर प्रस्थान से कम से कम 30 मिनट पहले पहुँचें।",
        ],
        what_not_to_do: [
          "स्टेशन पर किसी अनजान व्यक्ति को अपना टिकट या सामान न सौंपें।",
          "टिकट रद्दीकरण के नाम पर किसी अज्ञात व्यक्ति को OTP या बैंक पासवर्ड न दें।",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: "टिकट में दिए गए PNR और यात्रा की तारीख की पुष्टि करें।",
            check_label: "तारीख व समय देख लिया",
          },
          {
            step_number: 2,
            instruction: "यात्रा के लिए अपना मूल सरकारी पहचान पत्र (आधार या वोटर कार्ड) अपने पास रख लें।",
            check_label: "पहचान पत्र रख लिया",
          },
          {
            step_number: 3,
            instruction: "अपने परिवार के सदस्यों को यह टिकट विवरण शेयर करें ताकि वे आपकी यात्रा से अवगत रहें।",
            check_label: "परिवार को भेजा",
          },
        ],
        family_share_text:
          "नमस्ते, मेरी यात्रा का टिकट विवरण इस प्रकार है। सहारा ने इसे सुरक्षित और सही पाया है:\n\n" +
          formatQuoteSnippet(text, "यात्रा टिकट विवरण (Travel ticket booking details)"),
      };
    } else if (lang === "hinglish") {
      return {
        triage: "CAUGHT_UP",
        safety_level: "LIKELY_SAFE",
        title: "🚆 Travel / Ticket Details (Safe)",
        plain_summary:
          "Yeh aapka valid journey ya booking confirmation message hai. Isme koi fraud ya suspicious link nahi hai.",
        suspicion_reasons: [],
        what_to_do: [
          "Apna travel date, PNR number aur coach/seat number check karke note kar lein.",
          "Journey ke time original Aadhaar card ya photo ID sath mein zaroor rakhein.",
          "Station par train departure se 30 minutes pehle pahuchein.",
        ],
        what_not_to_do: [
          "Station par kisi unknown stranger ko apna ticket ya luggage na dein.",
          "Ticket update ke naam par kisi caller ko apna OTP ya UPI PIN mat batayein.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: "Ticket ka PNR aur departure time check karein.",
            check_label: "Time check kiya",
          },
          {
            step_number: 2,
            instruction: "Original ID card (Aadhaar / Voter ID) bag mein rakh lein.",
            check_label: "ID card ready",
          },
          {
            step_number: 3,
            instruction: "Apne family member ko yeh journey details forward kar dein.",
            check_label: "Family ko send kiya",
          },
        ],
        family_share_text:
          "Beta/Beti, meri journey ka ticket details yeh hai. Sahara app par verify kiya, sab confirmed hai:\n\n" +
          formatQuoteSnippet(text, "Journey confirmation details"),
      };
    } else {
      return {
        triage: "CAUGHT_UP",
        safety_level: "LIKELY_SAFE",
        title: "🚆 Travel & Booking Confirmation (Safe)",
        plain_summary:
          "This is a legitimate travel or booking confirmation. No scam indicators or fraudulent requests were detected.",
        suspicion_reasons: [],
        what_to_do: [
          "Verify the departure date, time, PNR number, and coach/seat allocation.",
          "Carry a valid government photo ID (Aadhaar card or Voter ID) during travel.",
          "Plan to arrive at the departure terminal at least 30 minutes in advance.",
        ],
        what_not_to_do: [
          "Do not share your PNR or ticket confirmation on public social media forums.",
          "Never disclose OTPs or banking PINs to anyone claiming to represent ticket customer support.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: "Verify your travel date, time, and confirmed seat details.",
            check_label: "Details confirmed",
          },
          {
            step_number: 2,
            instruction: "Pack your original physical government photo ID for identity verification.",
            check_label: "Photo ID ready",
          },
          {
            step_number: 3,
            instruction: "Forward these booking details to your family members so they know your schedule.",
            check_label: "Shared with family",
          },
        ],
        family_share_text:
          "Hello, here are my confirmed travel booking details. Sahara verified that everything is in order:\n\n" +
          formatQuoteSnippet(text, "Confirmed travel booking details"),
      };
    }
  }

  // 2. BILL PAYMENT INTENT (Safe vs Suspicious)
  if (isBill && !hasScamThreat) {
    const bill = extractBillDetails(text);
    if (lang === "hi") {
      return {
        triage: "CHECK",
        safety_level: "LIKELY_SAFE",
        title: `⚡ ${bill.utility_provider} बिल विवरण`,
        plain_summary:
          `यह आपके ${bill.utility_provider} का वैध बिल है। देय राशि ${bill.amount_due} है तथा अंतिम तिथि ${bill.due_date} है।`,
        suspicion_reasons: [],
        what_to_do: [
          `अंतिम तिथि (${bill.due_date}) से पहले ₹${bill.amount_due.replace("₹", "")} का भुगतान करें।`,
          `उपभोक्ता संख्या (${bill.consumer_id}) का मिलान अपने पिछले बिल से करें।`,
          "भुगतान केवल आधिकारिक बिजली बोर्ड की वेबसाइट, सरकारी ऐप या अधिकृत बैंक ऐप से ही करें।",
        ],
        what_not_to_do: [
          "किसी भी अनजान व्यक्ति द्वारा SMS या WhatsApp पर भेजे गए लिंक पर क्लिक करके भुगतान न करें।",
          "बिल भरने के लिए कोई भी रिमोट स्क्रीन-शेयरिंग ऐप डाउनलोड न करें।",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: `उपभोक्ता संख्या (${bill.consumer_id}) और देय राशि (${bill.amount_due}) का मिलान करें।`,
            check_label: "उपभोक्ता संख्या जांची",
          },
          {
            step_number: 2,
            instruction: "केवल आधिकारिक बिजली ऐप या बैंक पोर्टल के माध्यम से ही भुगतान करें।",
            check_label: "आधिकारिक ऐप खोला",
          },
          {
            step_number: 3,
            instruction: "यदि आवश्यक हो तो नीचे दिए गए बटन से परिवार को बिल भरने के लिए भेजें।",
            check_label: "परिवार को भेजा",
          },
        ],
        family_share_text:
          `नमस्ते, मुझे ${bill.utility_provider} का बिजली/उपयोगिता बिल मिला है।\n\n• उपभोक्ता ID: ${bill.consumer_id}\n• देय राशि: ${bill.amount_due}\n• अंतिम तिथि: ${bill.due_date}\n\nकृपया इसे देख लें:\n` +
          formatQuoteSnippet(text, `${bill.utility_provider} Bill Notice`),
        bill_details: bill,
      };
    } else if (lang === "hinglish") {
      return {
        triage: "CHECK",
        safety_level: "LIKELY_SAFE",
        title: `⚡ ${bill.utility_provider} Bill Details`,
        plain_summary:
          `Yeh aapka legitimate ${bill.utility_provider} bill hai. Amount due ${bill.amount_due} hai aur due date ${bill.due_date} hai.`,
        suspicion_reasons: [],
        what_to_do: [
          `Due date (${bill.due_date}) se pehle ${bill.amount_due} pay karein.`,
          `Consumer ID (${bill.consumer_id}) apne previous bill se verify karein.`,
          "Sirf official utility app ya bank portal se hi pay karein.",
        ],
        what_not_to_do: [
          "Kisi unknown WhatsApp/SMS link par click karke payment na karein.",
          "Payment ke naam par koi screen-sharing app install na karein.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: `Consumer ID (${bill.consumer_id}) aur Amount (${bill.amount_due}) verify karein.`,
            check_label: "Details matched",
          },
          {
            step_number: 2,
            instruction: "Authorized bank app ya utility portal se safely payment karein.",
            check_label: "Paid via portal",
          },
          {
            step_number: 3,
            instruction: "Family ko WhatsApp par forward karein taaki wo payment mein madad kar sakein.",
            check_label: "Shared with family",
          },
        ],
        family_share_text:
          `Hello, mujhe ${bill.utility_provider} ka bill mila hai:\n\n• Consumer ID: ${bill.consumer_id}\n• Amount Due: ${bill.amount_due}\n• Due Date: ${bill.due_date}\n\n` +
          formatQuoteSnippet(text, `${bill.utility_provider} Bill Notification`),
        bill_details: bill,
      };
    } else {
      return {
        triage: "CHECK",
        safety_level: "LIKELY_SAFE",
        title: `⚡ ${bill.utility_provider} Bill Details`,
        plain_summary:
          `This appears to be a standard routine utility billing update. Amount due: ${bill.amount_due}, due by ${bill.due_date}.`,
        suspicion_reasons: [],
        what_to_do: [
          `Verify the bill amount (${bill.amount_due}) and note payment due date (${bill.due_date}).`,
          "Always pay through official utility portals, BBPS authorized channels, or your bank app.",
          "Save the confirmation receipt after transaction completion.",
        ],
        what_not_to_do: [
          "Never send funds to personal phone numbers or unverified UPI handles.",
          "Do not install remote assistance software to process bill payments.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: `Check that consumer ID (${bill.consumer_id}) matches your official records.`,
            check_label: "Consumer ID matched",
          },
          {
            step_number: 2,
            instruction: "Complete payment strictly through authorized banking or official utility portals.",
            check_label: "Paid via official portal",
          },
          {
            step_number: 3,
            instruction: "Ask family caregiver to pay or assist via WhatsApp.",
            check_label: "Shared with family",
          },
        ],
        family_share_text:
          `Hello, I received my ${bill.utility_provider} utility bill notification:\n\n• Consumer ID: ${bill.consumer_id}\n• Amount Due: ${bill.amount_due}\n• Due Date: ${bill.due_date}\n\n` +
          formatQuoteSnippet(text, `${bill.utility_provider} Bill Notice`),
        bill_details: bill,
      };
    }
  }

  // 3. SCAM / SUSPICIOUS ALERT (flagged threats)
  if (hasScamThreat) {
    const isElectricityScam =
      (lower.includes("electricity") ||
        lower.includes("bijli") ||
        lower.includes("बिजली") ||
        lower.includes("blackout") ||
        lower.includes("power cut") ||
        lower.includes("power")) &&
      (lower.includes("disconnect") ||
        lower.includes("cut") ||
        lower.includes("काट") ||
        lower.includes("officer") ||
        lower.includes("अधिकारी") ||
        lower.includes("रात"));

    const isBankScam =
      (lower.includes("sbi") ||
        lower.includes("yono") ||
        lower.includes("bank") ||
        lower.includes("kyc") ||
        lower.includes("pan") ||
        lower.includes("खाता")) &&
      (lower.includes("locked") ||
        lower.includes("blocked") ||
        lower.includes("deactivate") ||
        lower.includes("freeze") ||
        lower.includes("suspend") ||
        lower.includes("officer") ||
        lower.includes("share your verification otp") ||
        lower.includes("बंद"));

    // 3A. BANKING & KYC ACCOUNT SCAM
    if (isBankScam) {
      if (lang === "hi") {
        return {
          triage: "IMPORTANT",
          safety_level: "POTENTIALLY_RISKY",
          title: "🛡️ फर्जी बैंक खाता और केवाईसी (KYC) अलर्ट",
          plain_summary:
            "इस संदेश में आपके बैंक खाते या YONO ऐप को बंद करने का झूठा डर दिखाकर गोपनीय जानकारी (OTP/PAN) चुराने का प्रयास किया गया है।",
          suspicion_reasons: [
            "अधिकृत बैंक (जैसे SBI) कभी भी SMS या निजी फोन कॉल पर OTP या पैन कार्ड का सत्यापन नहीं मांगते।",
            "बिना किसी औपचारिक पत्र के बैंक खाता तत्काल बंद या ब्लॉक करने की धमकी दी गई है।",
            "संदेश में किसी अज्ञात व्यक्ति का निजी मोबाइल नंबर या असत्यापित लिंक दिया गया है।",
          ],
          what_to_do: [
            "शांत रहें, आपका बैंक खाता और आपकी जमा पूंजी पूरी तरह सुरक्षित है।",
            "संदेश में दिए गए किसी भी नंबर पर कॉल न करें और न ही किसी के साथ OTP साझा करें।",
            "अपनी बैंक पासबुक या डेबिट कार्ड के पीछे छपे आधिकारिक कस्टमर केयर नंबर पर ही संपर्क करें या नजदीकी बैंक शाखा जाएं।",
          ],
          what_not_to_do: [
            "संदेश में दिए गए किसी भी अनजान लिंक पर क्लिक न करें।",
            "किसी भी कॉलर के साथ अपना OTP, पासवर्ड, कार्ड नंबर या PAN विवरण साझा न करें।",
            "फोन पर किसी के कहने पर AnyDesk या TeamViewer जैसा कोई स्क्रीन-शेयरिंग ऐप डाउनलोड न करें।",
          ],
          task_steps: [
            {
              step_number: 1,
              instruction: "संदेश में दिए गए फोन नंबर पर कॉल न करें और अपना OTP किसी को न दें।",
              check_label: "मैंने समझ लिया",
            },
            {
              step_number: 2,
              instruction: "अपनी बैंक पासबुक या डेबिट कार्ड के पीछे छपे आधिकारिक टोल-फ्री नंबर पर ही संपर्क करें।",
              check_label: "आधिकारिक नंबर देखा",
            },
            {
              step_number: 3,
              instruction: "नीचे दिए गए बटन से अपने बेटे, बेटी या रिश्तेदार को यह अलर्ट भेजकर सलाह लें।",
              check_label: "परिवार को सूचित किया",
            },
          ],
          family_share_text:
            "नमस्ते, मुझे यह बैंक/YONO खाता बंद होने की धमकी वाला संदिग्ध संदेश मिला है। सहारा ने इसे फर्जी अलर्ट बताया है। कृपया इसे देखकर मुझे सलाह दें:\n\n" +
            formatQuoteSnippet(text, "बैंक खाता/KYC बंद करने की धमकी वाला संदेश (Fake Bank/KYC Alert)"),
        };
      } else if (lang === "hinglish") {
        return {
          triage: "IMPORTANT",
          safety_level: "POTENTIALLY_RISKY",
          title: "🛡️ Fake Bank KYC & Account Block Alert",
          plain_summary:
            "Is message mein aapka bank account ya YONO block karne ka darr dikhakar confidential OTP/PAN details lene ki koshish ki gayi hai.",
          suspicion_reasons: [
            "Official banks (SBI) kabhi bhi private phone number par call karke OTP ya PAN verify karne ko nahi bolte.",
            "Account turant de-activate karne ki warning dekar panic create kiya gaya hai.",
            "Unknown personal mobile number ya shady link diya gaya hai.",
          ],
          what_to_do: [
            "Shaant rahein, aapka bank account aur balance bilkul safe hai.",
            "SMS mein diye number par call mat karein aur kisi ko bhi apna OTP na dein.",
            "Apni passbook ya debit card ke peeche likhe official toll-free helpline par hi baat karein.",
          ],
          what_not_to_do: [
            "SMS mein diye kisi bhi unknown link par click na karein.",
            "Apna OTP, debit card PIN ya PAN number kisi ke sath share mat karein.",
            "Phone par koi bhi remote access app jaise AnyDesk install na karein.",
          ],
          task_steps: [
            {
              step_number: 1,
              instruction: "SMS mein diye number par call na karein aur OTP kisi se share na karein.",
              check_label: "Samajh gaya",
            },
            {
              step_number: 2,
              instruction: "Apne bank branch ya debit card ke official customer care number se status check karein.",
              check_label: "Official check kiya",
            },
            {
              step_number: 3,
              instruction: "Neeche diye button se apne family member ko yeh alert forward kar dein.",
              check_label: "Family ko send kiya",
            },
          ],
          family_share_text:
            "Beta/Beti, mujhe yeh bank account block hone ka suspicious SMS mila hai. Sahara ne isko fake alert bataya hai. Ek baar dekh kar batao:\n\n" +
            formatQuoteSnippet(text, "Bank account / KYC suspension alert"),
        };
      } else {
        return {
          triage: "IMPORTANT",
          safety_level: "POTENTIALLY_RISKY",
          title: "🛡️ Fake Bank KYC Suspension Scam Detected",
          plain_summary:
            "This message uses false urgency threatening account deactivation to manipulate you into disclosing confidential banking credentials (OTP/PAN).",
          suspicion_reasons: [
            "Legitimate banks (including SBI) never demand OTPs or PAN verification via personal mobile numbers or SMS.",
            "Threatens immediate account suspension without standard written banking correspondence.",
            "Directs you to call an unverified personal telephone number instead of official banking branches.",
          ],
          what_to_do: [
            "Remain calm; your bank account and funds are completely secure.",
            "Do not call the personal phone number listed or disclose your OTP to anyone.",
            "Verify your account status by visiting your local branch or calling the official toll-free number printed on the back of your debit card.",
          ],
          what_not_to_do: [
            "Never disclose your OTP, PIN, CVV, or PAN to anyone claiming to be a bank executive.",
            "Do not click on links or call the telephone number provided in the SMS.",
            "Do not install remote access applications (such as AnyDesk or QuickSupport).",
          ],
          task_steps: [
            {
              step_number: 1,
              instruction: "Do not call the personal phone number and never disclose your OTP.",
              check_label: "Understood",
            },
            {
              step_number: 2,
              instruction: "Check with your official bank branch or call the toll-free number on your debit card.",
              check_label: "Checked official bank",
            },
            {
              step_number: 3,
              instruction: "Forward this notice to your family for confirmation using the button below.",
              check_label: "Shared with family",
            },
          ],
          family_share_text:
            "Hello, I received this suspicious notice threatening that my bank account will be blocked. Sahara flagged it as potentially risky. Could you please review it:\n\n" +
            formatQuoteSnippet(text, "Bank account / KYC suspension threat notice"),
        };
      }
    }

    // 3B. ELECTRICITY / POWER DISCONNECTION SCAM
    if (isElectricityScam) {
      if (lang === "hi") {
        return {
          triage: "IMPORTANT",
          safety_level: "POTENTIALLY_RISKY",
          title: "🛡️ फर्जी बिजली बिल और कनेक्शन काटने की धमकी",
          plain_summary:
            "इस संदेश में तत्काल बिजली काटने का डर दिखाकर फर्जी अधिकारी के नंबर पर कॉल करवाने की कोशिश की जा रही है।",
          suspicion_reasons: [
            "आधिकारिक बिजली विभाग कभी भी निजी मोबाइल नंबरों से रात में बिजली काटने का अल्टीमेटम नहीं भेजते।",
            "संदेश में किसी अनजान निजी व्यक्ति के फोन नंबर पर तुरंत कॉल करने का दबाव बनाया गया है।",
            "बिजली बिल का बकाया होने पर विभाग कानूनी नोटिस भेजता है, कोई निजी SMS नहीं।",
          ],
          what_to_do: [
            "शांति बनाए रखें और संदेश में दिए गए किसी भी नंबर पर तुरंत कॉल न करें।",
            "अपने पिछले महीने के बिजली बिल की रसीद या आधिकारिक सरकारी बिजली ऐप पर बकाया राशि जांचें।",
            "संदेश को नीचे दिए गए बटन से अपने परिवार के किसी सदस्य को भेजकर सलाह लें।",
          ],
          what_not_to_do: [
            "संदेश में दिए गए किसी भी अनजान नंबर पर बात करके कोई भुगतान न करें।",
            "किसी के कहने पर कोई ऐप (जैसे AnyDesk) डाउनलोड न करें।",
            "किसी भी अनजान व्यक्ति को अपना बैंक विवरण या OTP न बताएं।",
          ],
          task_steps: [
            {
              step_number: 1,
              instruction: "संदेश में दिए गए किसी भी फोन नंबर पर कॉल न करें।",
              check_label: "मैंने समझ लिया",
            },
            {
              step_number: 2,
              instruction: "अपने बिजली बिल के आधिकारिक हेल्पलाइन नंबर या बिजली सब-स्टेशन से स्थिति की पुष्टि करें।",
              check_label: "आधिकारिक नंबर देखा",
            },
            {
              step_number: 3,
              instruction: "नीचे दिए गए बटन से अपने परिवार के सदस्य को यह संदेश भेजें।",
              check_label: "परिवार को सूचित किया",
            },
          ],
          family_share_text:
            "नमस्ते, मुझे बिजली कनेक्शन काटने की धमकी देने वाला यह संदिग्ध संदेश मिला है। सहारा ने इसे फर्जी बताया है। कृपया इसे देखकर मुझे बताएं:\n\n" +
            formatQuoteSnippet(text, "बिजली कनेक्शन काटने की धमकी वाला संदेश (Electricity disconnection alert)"),
        };
      } else {
        return {
          triage: "IMPORTANT",
          safety_level: "POTENTIALLY_RISKY",
          title: "🛡️ Fake Electricity Disconnection Scam Detected",
          plain_summary:
            "This message creates false urgency threatening power disconnection to force you into contacting a fraudulent contact number.",
          suspicion_reasons: [
            "Official electricity utilities never issue disconnection ultimatums through personal mobile numbers.",
            "Demands immediate contact with an unofficial personal phone number.",
            "Utility boards issue formal printed postal notices before any disconnection action.",
          ],
          what_to_do: [
            "Remain calm and avoid calling any telephone number listed in the text.",
            "Check your actual utility bill status through the official discom portal or physical bill receipt.",
            "Share this message with a trusted family member for confirmation.",
          ],
          what_not_to_do: [
            "Do not call the phone number or make payments to unverified contacts.",
            "Never disclose banking passwords, PINs, or OTPs.",
            "Do not download remote control applications (AnyDesk, TeamViewer).",
          ],
          task_steps: [
            {
              step_number: 1,
              instruction: "Do not call the phone number provided in the message.",
              check_label: "Understood",
            },
            {
              step_number: 2,
              instruction: "Check your last physical electricity bill receipt or use the official power helpline.",
              check_label: "Checked official source",
            },
            {
              step_number: 3,
              instruction: "Use the 'Ask Family' button below to forward this notice to your family for review.",
              check_label: "Shared with family",
            },
          ],
          family_share_text:
            "Hello, I received this notice threatening immediate power disconnection. Sahara flagged it as a potential scam. Please advise me:\n\n" +
            formatQuoteSnippet(text, "Immediate power disconnection threat notice"),
        };
      }
    }

    // 3C. GENERAL SUSPICIOUS THREAT
    if (lang === "hi") {
      return {
        triage: "IMPORTANT",
        safety_level: "POTENTIALLY_RISKY",
        title: "🛡️ संदिग्ध संदेश चेतावनी",
        plain_summary:
          "इस संदेश में तत्काल कार्रवाई करने का डर दिखाया गया है। यह आमतौर पर साइबर धोखाधड़ी का संकेत होता है।",
        suspicion_reasons: [
          "संदेश में तत्काल कार्रवाई की धमकी देकर जल्दबाजी में निर्णय लेने का दबाव बनाया गया है।",
          "संदेश में किसी अनजान निजी मोबाइल नंबर पर संपर्क करने या लिंक खोलने को कहा गया है।",
        ],
        what_to_do: [
          "शांति बनाए रखें और संदेश में दिए गए किसी भी नंबर पर तुरंत कॉल न करें।",
          "संदेश को नीचे दिए गए बटन से अपने परिवार के किसी सदस्य को भेजकर सलाह लें।",
        ],
        what_not_to_do: [
          "संदेश में दिए गए किसी भी अनजान लिंक पर क्लिक न करें।",
          "किसी भी कॉलर के साथ अपना OTP, पासवर्ड, CVV या बैंक विवरण साझा न करें।",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: "संदेश में दिए गए किसी भी लिंक या नंबर पर तुरंत कॉल न करें।",
            check_label: "मैंने समझ लिया",
          },
          {
            step_number: 2,
            instruction: "नीचे दिए गए बटन से अपने बेटे, बेटी या रिश्तेदार को यह संदेश भेजें।",
            check_label: "परिवार को सूचित किया",
          },
        ],
        family_share_text:
          "नमस्ते, मुझे यह संदिग्ध संदेश मिला है। सहारा ने इसे जोखिम भरा बताया है। कृपया इसे देखकर बताएं कि मुझे क्या करना चाहिए:\n\n" +
          formatQuoteSnippet(text, "संदिग्ध संदेश चेतावनी (Suspicious message)"),
      };
    } else {
      return {
        triage: "IMPORTANT",
        safety_level: "POTENTIALLY_RISKY",
        title: "🛡️ Suspicious Threat Detected",
        plain_summary:
          "This message creates false urgency. This is a common hallmark of fraud.",
        suspicion_reasons: [
          "Threatens immediate punitive action without standard formal notice.",
          "Provides an unofficial mobile number or unverified link.",
        ],
        what_to_do: [
          "Remain calm and avoid calling any telephone number listed in the text.",
          "Share this message with a trusted family member for confirmation.",
        ],
        what_not_to_do: [
          "Do not click on any hyperlinks contained in the message.",
          "Never disclose your OTP, PIN, PAN, or banking passwords to anyone.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: "Do not call the phone number or click the link provided in the message.",
            check_label: "Understood",
          },
          {
            step_number: 2,
            instruction: "Use the 'Ask Family' button below to forward this notice to your family for review.",
            check_label: "Shared with family",
          },
        ],
        family_share_text:
          "Hello, I received this suspicious notice threatening immediate action. Sahara flagged it as potentially risky. Could you please review it:\n\n" +
          formatQuoteSnippet(text, "Suspicious notice threatening immediate action"),
      };
    }
  }

  // 3D. IF USER EXPLICITLY CHOSE "SCAM CHECK" BUT NO THREATS DETECTED
  if (intent === "scam_check") {
    if (lang === "hi") {
      return {
        triage: "CAUGHT_UP",
        safety_level: "LIKELY_SAFE",
        title: "🛡️ कोई संदिग्ध खतरा नहीं मिला (सामान्य)",
        plain_summary:
          "इस संदेश में कोई जबरन वसूली, खाता ब्लॉक करने की धमकी, बिजली काटने का अल्टीमेटम या संदिग्ध फर्जी लिंक नहीं पाया गया है। यह संदेश सामान्य प्रतीत होता है।",
        suspicion_reasons: [],
        what_to_do: [
          "संदेश को अपनी सुविधा के अनुसार पढ़ें।",
          "याद रखें कि कभी भी किसी अज्ञात व्यक्ति या कॉलर के साथ अपना OTP या पासवर्ड साझा न करें।",
        ],
        what_not_to_do: [
          "किसी भी अज्ञात कॉलर के साथ बैंक पासवर्ड या OTP साझा न करें।",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: "संदेश को सामान्य रिकॉर्ड के रूप में सुरक्षित रखें।",
            check_label: "पूर्ण हुआ",
          },
        ],
        family_share_text:
          "नमस्ते, मैंने इस संदेश की सुरक्षा सहारा ऐप पर जांची है। इसमें कोई संदिग्ध खतरा नहीं मिला:\n\n" +
          formatQuoteSnippet(text, "संदेश विवरण (Safe message)"),
      };
    } else if (lang === "hinglish") {
      return {
        triage: "CAUGHT_UP",
        safety_level: "LIKELY_SAFE",
        title: "🛡️ Koi Suspicious Threat Nahi Mila (Safe)",
        plain_summary:
          "Is message mein koi extortion threat, account block warning ya fake scam link nahi mila. Yeh normal message lag raha hai.",
        suspicion_reasons: [],
        what_to_do: [
          "Message ko normally padhein.",
          "Yaad rakhein ki kisi bhi unknown person ko OTP ya banking PIN na batayein.",
        ],
        what_not_to_do: [
          "Kisi bhi phone caller ko apna password ya OTP share mat karein.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: "Message ko confirm karke safely archive kar lein.",
            check_label: "Completed",
          },
        ],
        family_share_text:
          "Beta/Beti, maine yeh message Sahara par scan kiya. Koi threat ya scam signal nahi mila:\n\n" +
          formatQuoteSnippet(text, "Message details (Safe)"),
      };
    } else {
      return {
        triage: "CAUGHT_UP",
        safety_level: "LIKELY_SAFE",
        title: "🛡️ No Obvious Scam Detected (Normal)",
        plain_summary:
          "No extortion threats, account suspension warnings, power disconnection ultimatums, or suspicious links were detected. This message appears normal.",
        suspicion_reasons: [],
        what_to_do: [
          "Review the notification at your own convenience.",
          "Remember to always keep confidential passwords and OTPs private.",
        ],
        what_not_to_do: [
          "Never disclose passwords or verification codes to unverified callers.",
        ],
        task_steps: [
          {
            step_number: 1,
            instruction: "Read and safely archive the notification.",
            check_label: "Done",
          },
        ],
        family_share_text:
          "Hello, I scanned this message on Sahara. No obvious scam threats or suspicious requests were found:\n\n" +
          formatQuoteSnippet(text, "Safe notification details"),
      };
    }
  }

  // 4. GENERAL INTENT (Demystify Message)
  if (lang === "hi") {
    return {
      triage: "CAUGHT_UP",
      safety_level: "LIKELY_SAFE",
      title: "📝 संदेश का सरल सारांश",
      plain_summary:
        "यह एक सामान्य सूचना संदेश है। इसमें दी गई भाषा को सरल शब्दों में समझाया गया है ताकि आप इसे आसानी से समझ सकें।",
      suspicion_reasons: [],
      what_to_do: [
        "संदेश में दी गई जानकारी को अपनी सुविधा के अनुसार पढ़ें।",
        "यदि इसमें किसी कार्य का उल्लेख है, तो उसे अपनी सुविधानुसार पूरा करें।",
      ],
      what_not_to_do: ["किसी भी अनजान व्यक्ति के साथ अपना OTP या बैंकिंग क्रेडेंशियल साझा न करें।"],
      task_steps: [
        {
          step_number: 1,
          instruction: "संदेश को सामान्य रिकॉर्ड के रूप में सुरक्षित रखें।",
          check_label: "पूर्ण हुआ",
        },
      ],
      family_share_text:
        "नमस्ते, मुझे यह सूचना संदेश मिला है:\n\n" +
        formatQuoteSnippet(text, "सामान्य सूचना संदेश (General informative message)"),
    };
  } else if (lang === "hinglish") {
    return {
      triage: "CAUGHT_UP",
      safety_level: "LIKELY_SAFE",
      title: "📝 Message Plain-Language Summary",
      plain_summary:
        "Yeh ek regular informational message hai. Isme koi urgent warning ya scam indication nahi dikh raha.",
      suspicion_reasons: [],
      what_to_do: ["Message ki details padhein aur apne records ke liye save rakhein."],
      what_not_to_do: ["Kisi ke bolne par bhi personal OTP ya password share na karein."],
      task_steps: [
        {
          step_number: 1,
          instruction: "Message ko confirm karke save kar lein.",
          check_label: "Completed",
        },
      ],
      family_share_text:
        "Mujhe yeh informational message mila hai:\n\n" +
        formatQuoteSnippet(text, "General informational update"),
    };
  } else {
    return {
      triage: "CAUGHT_UP",
      safety_level: "LIKELY_SAFE",
      title: "📝 Message Plain-Language Breakdown",
      plain_summary:
        "This is a standard informational message. Complex wording has been simplified into plain terms for clarity.",
      suspicion_reasons: [],
      what_to_do: [
        "Review the notification at your own convenience.",
        "Keep for your personal records if relevant.",
      ],
      what_not_to_do: ["Never share confidential banking credentials or OTPs with third parties."],
      task_steps: [
        {
          step_number: 1,
          instruction: "Read and safely archive the notification.",
          check_label: "Done",
        },
      ],
      family_share_text:
        "Hi, I received this informational message for my records:\n\n" +
        formatQuoteSnippet(text, "General notification message"),
    };
  }
}
