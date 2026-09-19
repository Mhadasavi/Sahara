# SAHARA – Task Intents & Testing Guide
### Comprehensive Specification, Intent Capabilities, and Step-by-Step Test Scenarios

This document explains the four core task intents in **SAHARA (Your Simple Digital Companion)**, detailing what each function accomplishes for senior citizens, why it was designed that way, and how to verify and demo each one with ready-to-use test prompts.

---

## 🧭 Overview of the 4 Core Intents

| Icon & Name | Intent ID | Primary Purpose for Senior Citizens | Primary Output State |
| :--- | :--- | :--- | :--- |
| **📝 Understand Message** | `general` | Demystifies confusing, bureaucratic, legal, or policy notices into 4th-grade plain language. | 🟢 CAUGHT UP / 🟡 CHECK |
| **🛡️ Scam & Safety Check** | `scam_check` | Scrutinizes threats, artificial urgency, unverified numbers, and credential phishing. | 🔴 POTENTIALLY RISKY |
| **⚡ Pay / Check Bill** | `bill_payment` | Defends against fake power disconnection fraud; teaches safe verification via BBPS. | 🔴 RISKY / 🟡 CHECK |
| **🚆 Travel / Booking** | `booking` | Extracts journey essentials (Date, Time, PNR, Coach, Seat) & builds a travel checklist. | 🟢 CAUGHT UP (Safe) |

---

## 1. 📝 Understand Message (`general`)

### Why It Exists for Seniors:
Senior citizens frequently receive complex notifications from banks, government departments, telecom providers, and healthcare facilities written in dense legalistic jargon. This creates anxiety and hesitation. **Understand Message** strips away bureaucratic ambiguity and produces a calm, crystal-clear 1-to-2 sentence explanation.

### What Sahara Does:
- Replaces legal and banking jargon with everyday vocabulary.
- Clearly states whether the senior actually needs to do anything or if it is purely informational.
- Recommends calm, non-urgent next steps (e.g. visiting their familiar home branch at their convenience).

### Test Scenarios:

#### English Test Prompt:
> *"Notice: Pursuant to RBI master direction Section 12B, dormant deposit accounts exceeding 10 years duration are subject to statutory transfer to the Depositor Education and Awareness (DEA) fund ledger. Account holders may present KYC documentation to claim balance."*

#### Hindi Test Prompt:
> *"सूचना: भारतीय रिज़र्व बैंक के मास्टर निर्देश के तहत, 10 वर्षों से निष्क्रिय पड़े बैंक खातों की राशि डीईए फंड में स्थानांतरित की जा रही है। खाताधारक अपनी शाखा में पहचान पत्र प्रस्तुत कर शेष राशि प्राप्त कर सकते हैं।"*

#### What to Observe:
- **Triage**: 🟢 CAUGHT UP / Looks Normal.
- **Plain Summary**: Explains simply: *"Your bank account has been inactive for a long time. Your money is completely safe; you just need to visit your bank branch with your ID whenever convenient."*
- **Guided Steps**: Gives a peaceful 1-step confirmation without any panic or rush.

---

## 2. 🛡️ Scam & Safety Check (`scam_check`)

### Why It Exists for Seniors:
Seniors are prime targets for cyber criminals who exploit fear and panic. Scams typically employ **false urgency** ("account blocked in 2 hours", "connection cut tonight"), **impersonation** ("calling from electricity office/SBI"), and **demands for credentials** (OTPs, PAN, Aadhaar, CVVs).

### What Sahara Does:
- Detects coercive language, urgency triggers, and personal mobile numbers posing as official desks.
- Rates safety strictly as **🔴 Potentially Risky**.
- Formulates distinct, high-contrast **✅ What You Should Do** vs **❌ What You Should NOT Do** cards.
- Prepares a pre-formatted **Ask Family for Help** message ready for 1-click clipboard export to WhatsApp or SMS.
- Automatically and locally masks sensitive OTPs, PAN numbers, and credit cards before transmission.

### Test Scenarios:

#### English Test Prompt (Tests Scam Detection + OTP/PAN Redaction):
> *"URGENT ALERT: SBI customer your YONO account is locked today due to incomplete KYC. Verify PAN ABCDE1234F and share your verification OTP is 748291 with officer at 9812345678 to prevent permanent deactivation."*

#### Hinglish Test Prompt:
> *"Aapka bank account aaj raat 8 baje block ho jayega KYC update na hone ke karan. Turant 9823412345 par call karein aur apna OTP bata kar account unlock karein."*

#### What to Observe:
- **Client-side PII Scrubbing**: An amber banner alerts: *"Security Notice: Confidential Data Masked (OTP Code, Indian PAN)"*. The numbers are masked locally before transit.
- **Safety Rating**: **🔴 Potentially Risky** (Triage: **IMPORTANT**).
- **Red Flags Highlighted**:
  1. Threatens immediate deactivation without formal banking letter.
  2. Demands contact through an unofficial personal mobile number.
  3. Demands confidential OTP verification.
- **Directives**: Explicitly tells the senior **NOT** to call, **NOT** to disclose OTPs, and to seek family assistance.

---

## 3. ⚡ Pay / Check Bill (`bill_payment`)

### Why It Exists for Seniors:
The *"Electricity power will be disconnected tonight"* SMS is currently the most widespread cyber extortion tactic targeting Indian households. Frauds convince seniors to call a fake "officer number" and install screen-sharing software (AnyDesk/TeamViewer). **Pay / Check Bill** trains seniors to identify legitimate utility bills and pay exclusively through authorized BBPS channels.

### What Sahara Does:
- **Scam Detection Mode**: Flags messages with private contact numbers threatening imminent blackout as **🔴 Potentially Risky**.
- **Legitimate Utility Mode**: If given a genuine bill message, categorizes it as **🟡 Check / Routine**, extracts the Due Date and Consumer ID, and directs payment to official government portals.

### Test Scenarios:

#### Test A: Dangerous Power Disconnection Scam (Hindi)
> *"प्रिय उपभोक्ता, आपका बिजली कनेक्शन आज रात 9:30 बजे काट दिया जाएगा क्योंकि पिछले महीने का बिल अपडेट नहीं हुआ है। तुरंत बिजली अधिकारी से 9876543210 पर संपर्क करें।"*

- **Result**: **🔴 Potentially Risky**.
- **Sahara Guidance**: *"Official electricity boards never send disconnection notices via personal mobile numbers or cut power at night without legal paper notice. Do not call this number."*

#### Test B: Legitimate Monthly Utility Bill (English)
> *"BSES Yamuna: Electricity Bill for CA No. 10029384 for month Sep-2026 is Rs. 1,450. Due date: 28-Sep-2026. Pay safely via official website bsesdelhi.com or authorized BBPS."*

- **Result**: **🟡 Check / Looks Normal**.
- **Sahara Guidance**: Verifies consumer account number, confirms due date, and provides safe payment checklist via official banking app.

---

## 4. 🚆 Travel / Booking (`booking`)

### Why It Exists for Seniors:
Travel confirmations from IRCTC, state bus corporations, or diagnostic labs contain cryptic alphanumeric codes, multiple timestamps, and abbreviations (e.g., `WL/RAC`, `NDLS`, `CNF`, `PNR`, `SL`). Seniors find it challenging to confirm whether their journey is confirmed and what they need to carry.

### What Sahara Does:
- Extracts the core essentials: **Travel Date**, **Departure Time**, **Train / Flight Number**, and **Coach & Seat / Berth**.
- Reassures the senior that their seat is confirmed.
- Generates a linear travel readiness checklist: packing physical photo ID (Aadhaar/Voter ID), reaching 30 minutes early, and saving railway helpline `139`.

### Test Scenarios:

#### English Test Prompt:
> *"PNR: 2849102938, Train 12951 NDLS TEJAS RAJ, Date: 24-Sep-2026, Sleeper: B3-42 (Confirmed). Total Fare: Rs. 1420. Have a safe journey. - IRCTC"*

#### Hindi Test Prompt:
> *"पीएनआर: 2849102938, ट्रेन 12951 तेजस राजधानी, दिनांक: 24-सितंबर-2026, कोच B3, सीट 42 (पुष्ट/कन्फर्म)। सुखद यात्रा की शुभकामनाएं - आईआरसीटीसी"*

#### What to Observe:
- **Triage**: 🟢 CAUGHT UP / Looks Normal.
- **Title**: 🚆 Travel & Booking Confirmation (Safe).
- **Guided Steps**:
  - Step 1: Confirm travel date (24-Sep-2026) and coach/seat (B3-42).
  - Step 2: Pack original physical photo ID card in handbag.
  - Step 3: Forward journey details to family members for tracking.

---

## 🔊 Testing Multilingual & Natural Voice Readout

Sahara supports dynamic, multi-lingual natural voice narration:

1. **Dynamic Language Switcher**:
   - In the top header, click between **`EN`**, **`हिंदी`**, and **`Hinglish`**.
   - **Real-time translation**: Notice how the on-screen analysis, reasons, DO/DON'T guidance, and step labels immediately re-triage into the selected language.
   - When you click **"सुनें (Listen)"**, it reads out in that exact language.

2. **Live Voice Gender Switcher (`👩 Didi` vs `👨 Bhaiya`)**:
   - Click **"सुनें (Listen)"** to start playback.
   - While speech is actively playing, click **"👨 Bhaiya / Male"** or **"👩 Didi / Female"**.
   - **Immediate Live Tone Switch**: The voice immediately switches live mid-speech:
     - **👨 Bhaiya / Male**: Deep, calm, gentle masculine cadence ($0.80\times$ acoustic pitch).
     - **👩 Didi / Female**: Bright, warm, clear feminine cadence ($1.15\times$ acoustic pitch).
   - No need to refresh the page or return to the dashboard!

---

## ⏱️ 30-Second Judge / Evaluator Demo Script

1. **00:00 – 00:05**: Open `http://localhost:3000`. Show the empty, dynamic dashboard and the senior-friendly accessibility controls (Font Scaler `A | A+ | A++` and `56px` touch targets).
2. **00:05 – 00:12**: Select **🛡️ Scam & Safety Check**. Paste the SBI KYC SMS with an OTP and PAN. Point out the instant local PII redaction banner.
3. **00:12 – 00:18**: Click **Analyze Now**. View the live assessment: 🔴 **Potentially Risky** with explicit reasons and DO / DO NOT cards.
4. **00:18 – 00:24**: Click **`हिंदी`** at the top. Observe the entire analysis immediately re-translating to Hindi. Click **"सुनें (Listen)"** to hear the Hindi audio narration. Toggle **"👨 Bhaiya"** to demonstrate instant voice gender switching.
5. **00:24 – 00:30**: Open **Ask Family for Help** to show the pre-drafted WhatsApp summary ready for 1-click clipboard export. Return to the dashboard and highlight the item persisted in the **Attention Feed**.
