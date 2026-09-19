import {
  generateRuleBasedAnalysis,
  extractBillDetails,
  extractMedicineDetails,
  detectServiceName,
} from "../lib/analysis-rules";

describe("Sahara AI Analysis & Triage Engine", () => {
  describe("Scam & Fraud Threat Detection", () => {
    test("Identifies electricity disconnection extortion threat as POTENTIALLY_RISKY", () => {
      const threatMsg =
        "Dear consumer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately at 9876543210.";
      const result = generateRuleBasedAnalysis(threatMsg, "en", "scam_check");

      expect(result.safety_level).toBe("POTENTIALLY_RISKY");
      expect(result.triage).toBe("IMPORTANT");
      expect(result.suspicion_reasons.length).toBeGreaterThan(0);
      expect(result.what_not_to_do.length).toBeGreaterThan(0);
    });

    test("Identifies bank KYC account lockout scam as POTENTIALLY_RISKY", () => {
      const kycScam =
        "URGENT: SBI customer your YONO account is blocked today due to pending KYC. Call 9812345678 to verify PAN.";
      const result = generateRuleBasedAnalysis(kycScam, "en", "scam_check");

      expect(result.safety_level).toBe("POTENTIALLY_RISKY");
      expect(result.triage).toBe("IMPORTANT");
    });

    test("Detects Hindi electricity threat and returns high-contrast Hindi directives", () => {
      const hindiScam =
        "प्रिय उपभोक्ता, आपका बिजली कनेक्शन आज रात 9:30 बजे काट दिया जाएगा। तुरंत 9876543210 पर संपर्क करें।";
      const result = generateRuleBasedAnalysis(hindiScam, "hi", "scam_check");

      expect(result.safety_level).toBe("POTENTIALLY_RISKY");
      expect(result.triage).toBe("IMPORTANT");
      expect(result.what_not_to_do.some((item: string) => item.includes("फोन न करें") || item.includes("कॉल न करें") || item.includes("OTP"))).toBe(true);
    });
  });

  describe("Legitimate Transactional OTP & Verification Handling", () => {
    test("Recognizes legitimate JioMart / Reliance login OTP as authentic code (CHECK)", () => {
      const jioOtp =
        "849201 is your OTP to log in to Jiomart with your Reliance Retail Account (valid for 3 mins). Do not share it for security reasons.";
      const result = generateRuleBasedAnalysis(jioOtp, "en", "general");

      expect(result.safety_level).toBe("BE_CAREFUL");
      expect(result.triage).toBe("CHECK");
      expect(result.plain_summary).toContain("authentic");
      expect(result.plain_summary).toContain("legitimate verification code");
      expect(result.what_not_to_do.some((item: string) => item.toLowerCase().includes("otp"))).toBe(true);
    });

    test("Detects correct service name for Amazon OTP", () => {
      const names = detectServiceName("your amazon verification code is 492019");
      expect(names.en).toContain("Amazon");
    });
  });

  describe("Medicine & Prescription Simplifier", () => {
    test("Extracts dosage, food timing, and precautions for Metformin (Diabetes)", () => {
      const details = extractMedicineDetails("Take Tab Metformin 500mg daily", "en");

      expect(details.medicine_name).toContain("Metformin");
      expect(details.timing.morning).toBe(true);
      expect(details.timing.night).toBe(true);
      expect(details.precautions.length).toBeGreaterThan(0);
    });

    test("Extracts dosage and timing for Telmisartan (High Blood Pressure) in Hindi", () => {
      const details = extractMedicineDetails("Telma 40mg once daily in morning", "hi");

      expect(details.medicine_name).toContain("Telmisartan");
      expect(details.timing.morning).toBe(true);
      expect(details.what_it_is_for).toContain("रक्तचाप");
    });

    test("Provides safe guidance for acidity medication Pan-D / Pantoprazole", () => {
      const details = extractMedicineDetails("Pan-D before breakfast", "en");

      expect(details.medicine_name).toContain("Pantoprazole");
      expect(details.timing.morning).toBe(true);
      expect(details.timing.with_food.toLowerCase()).toContain("empty stomach");
    });
  });

  describe("Utility Bill Reader", () => {
    test("Extracts bill amount, due date, and provider for BSES Electricity", () => {
      const billText = "BSES Power: Electricity bill for CA No 10029384 is Rs. 1450. Due date: 28-Sep-2026.";
      const details = extractBillDetails(billText);

      expect(details.amount_due).toBe("₹1450");
      expect(details.due_date).toBe("28-Sep-2026");
      expect(details.consumer_id).toBe("10029384");
      expect(details.utility_provider).toContain("BSES");
    });

    test("Extracts Tata Power bill details accurately", () => {
      const billText = "Tata Power DDL: Consumer #9841203 bill of ₹ 2,350 due on 15-Oct-2026.";
      const details = extractBillDetails(billText);

      expect(details.amount_due).toBe("₹2350");
      expect(details.utility_provider).toContain("Tata Power");
    });
  });
});
