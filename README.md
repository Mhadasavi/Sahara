# SAHARA – Your Simple Digital Companion
### Built for Senior Citizens • Live Multimodal Architecture • PromptWars Hackathon

SAHARA is an intelligent, accessible, and protective digital companion designed specifically for senior citizens in India. It demystifies confusing SMS, WhatsApp alerts, utility notices, and digital tasks while strictly protecting users from financial scams, phishing, and coercion.

---

## 🌟 Key Capabilities

- **Senior-First Accessibility**:
  - $56\text{px}+$ touch targets accommodating motor impairments and tremors.
  - Scalable typography with 1-click toggles: `A` ($18\text{px}$), `A+` ($20\text{px}$), `A++` ($24\text{px}$).
  - High-contrast visual cards with WCAG 2.1 AAA compliance and prominent focus rings.
- **Natural Voice Readout**:
  - Powered by Google Cloud Text-to-Speech (Chirp 3 HD for Hindi and Neural2 for English/Hinglish).
  - Voice gender toggles: **👩 Didi / Female** and **👨 Bhaiya / Male**.
  - Seamless fallback to native browser `SpeechSynthesis` if offline or unauthenticated.
- **Multilingual Support**:
  - English, simple Hindi (Devanagari script), and colloquial Hinglish (Roman script).
- **Defensive Security & Privacy**:
  - Pre-LLM regex scrubbing redacting OTPs, PAN cards, Aadhaar, CVVs, Passwords, and 16-digit card numbers locally before server transit.
  - Post-LLM deterministic safety gates rejecting instructions to share sensitive tokens.
- **Zero-Mock Multimodal AI**:
  - Real Google GenAI multimodal integration (`@google/genai`) analyzing both text and screenshots.
  - Fallback rule-driven triage engine ensures uninterrupted local testing when API key is pending.
- **Step-by-Step Guided Stepper & Family Sharing**:
  - Linear task progression with completion checks.
  - 1-click "Ask Family for Help" modal with pre-drafted message for WhatsApp/SMS.
- **Dynamic Attention Feed**:
  - Persisted locally in `localStorage` with real-time triage indicators (🔴 IMPORTANT, 🟡 CHECK, 🟢 CAUGHT UP).

---

## 🚀 Quick Start

### 1. Install Dependencies
```cmd
cd sahara
npm install
```

### 2. Configure Environment (Optional for Live Gemini)
```cmd
copy .env.example .env.local
```
Set your `GEMINI_API_KEY` (Free in 30 seconds at [Google AI Studio](https://aistudio.google.com/)).

### 3. Run Security Unit Tests
```cmd
npm test
```

### 4. Start Development Server
```cmd
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Production Build Check
```cmd
npm run build
```

---

## 📋 Evaluation & Demo Guide
See [`DEMO_PROMPTS_GUIDE.txt`](./DEMO_PROMPTS_GUIDE.txt) for ready-to-copy prompts testing:
1. Urgent Electricity Disconnection Scam
2. Bank KYC Expiry with Sensitive OTP (PII masking demonstration)
3. Hindi Power Notice (Chirp 3 HD voice narration)
4. Safe IRCTC Railway Booking
5. Hinglish Pension / Life Certificate Scam
