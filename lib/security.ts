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
  { type: "Plain Password Token", regex: /(?:password|pin|passcode)\s*[:=]?\s*([^\s,]+)/gi },
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

const FORBIDDEN_OUTPUT_PATTERNS = [
  /share\s+(your\s+)?otp/i,
  /send\s+(your\s+)?password/i,
  /share\s+(your\s+)?pin/i,
  /share\s+(your\s+)?cvv/i,
  /give\s+(your\s+)?card\s+number/i,
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
