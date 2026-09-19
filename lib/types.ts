export type TextSize = "normal" | "large" | "xlarge";
export type Language = "en" | "hi" | "hinglish";
export type TriageCategory = "IMPORTANT" | "CHECK" | "CAUGHT_UP";
export type SafetyRating = "LIKELY_SAFE" | "BE_CAREFUL" | "POTENTIALLY_RISKY";
export type ThemeMode = "day" | "midnight" | "amber" | "yellow_black";
export type SpeechSpeed = 0.75 | 0.9 | 1.0;

export interface CaregiverContact {
  id?: string;
  name: string;
  phone: string;
  relation?: string;
  isDefault?: boolean;
}

export interface TaskStep {
  step_number: number;
  instruction: string;
  check_label: string;
}

export interface MedicineDetails {
  medicine_name: string;
  what_it_is_for: string;
  when_to_take: string;
  timing: {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
    with_food: string;
  };
  precautions: string[];
}

export interface BillDetails {
  amount_due: string;
  due_date: string;
  consumer_id: string;
  utility_provider: string;
}

export interface AnalysisOutput {
  triage: TriageCategory;
  safety_level: SafetyRating;
  title: string;
  plain_summary: string;
  suspicion_reasons: string[];
  what_to_do: string[];
  what_not_to_do: string[];
  task_steps: TaskStep[];
  family_share_text: string;
  extracted_message?: string;
  medicine_details?: MedicineDetails;
  bill_details?: BillDetails;
}

export interface FeedItem {
  id: string;
  timestamp: string;
  analysis: AnalysisOutput;
  sourceContent?: string;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  taskIntent?: string;
}

