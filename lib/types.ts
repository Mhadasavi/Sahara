export type TextSize = "normal" | "large" | "xlarge";
export type Language = "en" | "hi" | "hinglish";
export type TriageCategory = "IMPORTANT" | "CHECK" | "CAUGHT_UP";
export type SafetyRating = "LIKELY_SAFE" | "BE_CAREFUL" | "POTENTIALLY_RISKY";

export interface TaskStep {
  step_number: number;
  instruction: string;
  check_label: string;
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
}

export interface FeedItem {
  id: string;
  timestamp: string;
  analysis: AnalysisOutput;
}
