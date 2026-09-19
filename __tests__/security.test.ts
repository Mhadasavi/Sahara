import { sanitizeInputText, validateLLMOutputSafety } from "../lib/security";

describe("Sahara Defensive Security Engine", () => {
  test("Redacts OTP when 'OTP' appears before digits", () => {
    const input = "Your verification OTP is 482910. Do not share.";
    const res = sanitizeInputText(input);
    expect(res.cleanedText).toContain("[REDACTED_OTP_CODE]");
    expect(res.cleanedText).not.toContain("482910");
    expect(res.detectedSensitives).toContain("OTP Code");
  });

  test("Redacts OTP when digits appear before 'OTP'", () => {
    const input = "Use 938102 as your one-time password to sign in.";
    const res = sanitizeInputText(input);
    expect(res.cleanedText).toContain("[REDACTED_OTP_CODE]");
    expect(res.cleanedText).not.toContain("938102");
    expect(res.detectedSensitives).toContain("OTP Code");
  });

  test("Redacts 16-digit credit and debit card numbers", () => {
    const input = "Verify payment using card 4532-8912-3456-9812 right now.";
    const res = sanitizeInputText(input);
    expect(res.cleanedText).toContain("[REDACTED_CREDIT/DEBIT_CARD]");
    expect(res.cleanedText).not.toContain("4532-8912-3456-9812");
  });

  test("Redacts Indian PAN cards", () => {
    const input = "Submit your PAN card ABCDE1234F for verification.";
    const res = sanitizeInputText(input);
    expect(res.cleanedText).toContain("[REDACTED_INDIAN_PAN]");
    expect(res.cleanedText).not.toContain("ABCDE1234F");
  });

  test("Blocks post-LLM responses that instruct user to disclose confidential credentials", () => {
    const unsafeOutput = {
      title: "Quick Check",
      what_to_do: ["Please share your OTP with the executive to proceed."],
    };
    const isSafe = validateLLMOutputSafety(unsafeOutput);
    expect(isSafe).toBe(false);
  });
});
