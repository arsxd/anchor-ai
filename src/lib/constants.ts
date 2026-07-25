export const APP_NAME = "AnchorAI";
export const APP_DESCRIPTION =
  "A multi-modal GenAI-powered recovery and prevention platform for individuals navigating substance use disorders and their caregivers.";

export const MAX_CHAT_INPUT_LENGTH = 500;
export const MAX_PROFILE_FIELD_LENGTH = 200;
export const MAX_TRIGGERS_COUNT = 10;
export const MAX_CONTACTS_COUNT = 5;

export const GEMINI_MODEL = "gemini-flash-latest";

export const CRISIS_HOTLINES = [
  { name: "SAMHSA Helpline", number: "1-800-662-4357", available: "24/7" },
  { name: "988 Suicide & Crisis Lifeline", number: "988", available: "24/7" },
  { name: "Emergency Services", number: "911", available: "24/7" },
] as const;

export const SCRIPT_SCENARIOS = {
  party: { label: "Party Pressure", emoji: "🎉" },
  workplace: { label: "Workplace Event", emoji: "💼" },
  family: { label: "Family Gathering", emoji: "👨‍👩‍👧" },
  friend: { label: "Friend's Offer", emoji: "🤝" },
  craving: { label: "Intense Craving", emoji: "🌊" },
  relapse: { label: "Near-Relapse", emoji: "💔" },
} as const;

export const STORAGE_KEYS = {
  USER_PROFILE: "anchor_user_profile",
  MOOD_HISTORY: "anchor_mood_history",
  CHAT_HISTORY: "anchor_chat_history",
} as const;
