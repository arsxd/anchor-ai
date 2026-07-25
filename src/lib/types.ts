export interface UserProfile {
  name: string;
  triggers: string[];
  recoveryStage: "early" | "middle" | "maintenance";
  supportContacts: SupportContact[];
  myWhy: string;
  copingPreferences: string[];
  createdAt: string;
}

export interface SupportContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface MoodEntry {
  id: string;
  mood: MoodType;
  score: number;
  timestamp: string;
  aiInsight?: string;
}

export type MoodType =
  | "anxious"
  | "sad"
  | "frustrated"
  | "calm"
  | "happy"
  | "determined"
  | "tired"
  | "craving";

export const MOOD_CONFIG: Record<MoodType, { emoji: string; label: string; score: number }> = {
  anxious: { emoji: "😰", label: "Anxious", score: 3 },
  sad: { emoji: "😔", label: "Sad", score: 3 },
  frustrated: { emoji: "😤", label: "Frustrated", score: 4 },
  calm: { emoji: "😌", label: "Calm", score: 7 },
  happy: { emoji: "🥳", label: "Happy", score: 9 },
  determined: { emoji: "💪", label: "Determined", score: 8 },
  tired: { emoji: "😴", label: "Tired", score: 4 },
  craving: { emoji: "🌊", label: "Craving", score: 2 },
};

export type ChatMode = "calm" | "crisis" | "journal" | "caregiver";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  mode: ChatMode;
}

export type ScriptScenario =
  | "party"
  | "workplace"
  | "family"
  | "friend"
  | "craving"
  | "relapse";

export interface RiskAssessment {
  riskLevel: "low" | "elevated" | "high";
  shouldIntervene: boolean;
  patternDescription: string;
  recentTrend: "improving" | "stable" | "declining";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
