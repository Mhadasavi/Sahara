export interface SanitizationResult {
  cleanedText: string;
  detectedSensitives: string[];
  hasCriticalLeak: boolean;
}

const SENSITIVE_PATTERNS: { type: string; regex: RegExp }[] = [
  // Captures "OTP is 482910", "OTP: 482910", etc.
  {
    type: "OTP Code",
    regex: /\b(?:otp|one[\s-]?time[\s-]?password|verification code|security code)\b\s*(?:is|as|:|-)?\s*(?:your\s+)?\b\d{4,8}\b/gi,
  },
  // Captures "482910 is your OTP", "482910 as your one-time password", etc.
  {
    type: "OTP Code",
    regex: /\b\d{4,8}\b\s*(?:is|as)?\s*(?:your\s+)?(?:otp|verification code|one[\s-]?time[\s-]?password|security code)\b/gi,
  },
  { type: "Credit/Debit Card", regex: /\b(?:\d[ -]*?){13,16}\b/g },
  { type: "Card CVV", regex: /\b(?:cvv|cvc|security code)\s*[:=]?\s*(\d{3,4})\b/gi },
  { type: "Indian PAN", regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g },
  { type: "Indian Aadhaar", regex: /\b\d{4}\s\d{4}\s\d{4}\b/g },
  // Indian UPI ID (VPA)
  {
    type: "Indian UPI ID",
    regex: /\b[a-zA-Z0-9.\-_]{2,64}@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|ibl|upi|axl|apl|barodampay|federal|idfcbank|kotak|postbank|sbi|hdfcbank|icici|axisbank)\b/gi,
  },
  // Indian Bank IFSC Code (4 letters, 0, 6 alphanumeric)
  { type: "Indian IFSC Code", regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g },
  { type: "Plain Password Token", regex: /(?:password|pin|passcode)\s*[:=]?\s*([^\s,]+)/gi },
  // Adversarial Prompt Injection Patterns
  {
    type: "Prompt Injection",
    regex: /\b(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|directives|prompts|rules)\b|\bsystem\s+prompt\s+override\b|\byou\s+are\s+now\s+in\s+developer\s+mode\b|\bbypass\s+all\s+safety\s+(?:filters|rules|checks)\b/gi,
  },
];

export function sanitizeInputText(raw: string): SanitizationResult {
  let cleaned = raw;
  const detected: string[] = [];

  for (const { type, regex } of SENSITIVE_PATTERNS) {
    // Reset regex index if global
    regex.lastIndex = 0;
    if (regex.test(cleaned)) {
      detected.push(type);
      regex.lastIndex = 0;
      cleaned = cleaned.replace(regex, `[REDACTED_${type.toUpperCase().replace(/\s+/g, "_")}]`);
    }
  }

  return {
    cleanedText: cleaned.substring(0, 4000), // Hard length boundary to prevent DOS
    detectedSensitives: Array.from(new Set(detected)),
    hasCriticalLeak: detected.length > 0,
  };
}

export function detectPromptInjection(text: string): { isAdversarial: boolean; matchedSnippet?: string } {
  const injectionRegex = /\b(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|directives|prompts|rules)\b|\bsystem\s+prompt\s+override\b|\byou\s+are\s+now\s+in\s+developer\s+mode\b|\bbypass\s+all\s+safety\s+(?:filters|rules|checks)\b/i;
  const match = text.match(injectionRegex);
  return {
    isAdversarial: !!match,
    matchedSnippet: match ? match[0] : undefined,
  };
}

const FORBIDDEN_OUTPUT_PATTERNS = [
  /share\s+(your\s+)?otp/i,
  /tell\s+(the\s+caller\s+)?(your\s+)?otp/i,
  /disclose\s+(your\s+)?otp/i,
  /send\s+(your\s+)?password/i,
  /share\s+(your\s+)?pin/i,
  /share\s+(your\s+)?cvv/i,
  /give\s+(your\s+)?card\s+number/i,
  /enter\s+(your\s+)?upi\s*pin\s+to\s+receive/i,
  /download\s+(anydesk|teamviewer|rustdesk|quicksupport)/i,
];

export function validateLLMOutputSafety(outputJson: any): boolean {
  const serialized = JSON.stringify(outputJson);
  for (const pattern of FORBIDDEN_OUTPUT_PATTERNS) {
    if (pattern.test(serialized)) {
      return false;
    }
  }
  return true;
}
