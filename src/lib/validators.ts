import {
  MAX_CHAT_INPUT_LENGTH,
  MAX_CONTACTS_COUNT,
  MAX_PROFILE_FIELD_LENGTH,
  MAX_TRIGGERS_COUNT,
} from "./constants";
import type { ChatMode, MoodType, ScriptScenario } from "./types";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a user profile object has all required fields with proper types.
 */
export function validateProfile(profile: unknown): ValidationResult {
  if (!profile || typeof profile !== "object") {
    return { valid: false, error: "Profile must be an object" };
  }

  const p = profile as Record<string, unknown>;

  if (!p.name || typeof p.name !== "string" || p.name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }

  if (p.name.length > MAX_PROFILE_FIELD_LENGTH) {
    return { valid: false, error: `Name must be under ${MAX_PROFILE_FIELD_LENGTH} characters` };
  }

  if (!Array.isArray(p.triggers)) {
    return { valid: false, error: "Triggers must be an array" };
  }

  if (p.triggers.length > MAX_TRIGGERS_COUNT) {
    return { valid: false, error: `Maximum ${MAX_TRIGGERS_COUNT} triggers allowed` };
  }

  if (!p.myWhy || typeof p.myWhy !== "string" || p.myWhy.trim().length === 0) {
    return { valid: false, error: "Your 'why' is required" };
  }

  if (!isValidRecoveryStage(p.recoveryStage)) {
    return { valid: false, error: "Invalid recovery stage" };
  }

  if (Array.isArray(p.supportContacts) && p.supportContacts.length > MAX_CONTACTS_COUNT) {
    return { valid: false, error: `Maximum ${MAX_CONTACTS_COUNT} contacts allowed` };
  }

  return { valid: true };
}

/**
 * Validates chat input message.
 */
export function validateChatInput(message: unknown): ValidationResult {
  if (!message || typeof message !== "string") {
    return { valid: false, error: "Message must be a non-empty string" };
  }

  if (message.trim().length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (message.length > MAX_CHAT_INPUT_LENGTH) {
    return { valid: false, error: `Message must be under ${MAX_CHAT_INPUT_LENGTH} characters` };
  }

  return { valid: true };
}

/**
 * Validates mood score is within acceptable range (1-10).
 */
export function validateMoodScore(score: unknown): ValidationResult {
  if (typeof score !== "number" || !Number.isInteger(score)) {
    return { valid: false, error: "Mood score must be an integer" };
  }

  if (score < 1 || score > 10) {
    return { valid: false, error: "Mood score must be between 1 and 10" };
  }

  return { valid: true };
}

/**
 * Validates mood type is a recognized value.
 */
export function validateMoodType(mood: unknown): ValidationResult {
  const validMoods: MoodType[] = [
    "anxious",
    "sad",
    "frustrated",
    "calm",
    "happy",
    "determined",
    "tired",
    "craving",
  ];

  if (!mood || typeof mood !== "string") {
    return { valid: false, error: "Mood type must be a string" };
  }

  if (!validMoods.includes(mood as MoodType)) {
    return { valid: false, error: `Invalid mood type: ${mood}` };
  }

  return { valid: true };
}

/**
 * Validates chat mode.
 */
export function validateChatMode(mode: unknown): ValidationResult {
  const validModes: ChatMode[] = ["calm", "crisis", "journal", "caregiver"];

  if (!mode || typeof mode !== "string" || !validModes.includes(mode as ChatMode)) {
    return { valid: false, error: "Invalid chat mode" };
  }

  return { valid: true };
}

/**
 * Validates script scenario.
 */
export function validateScenario(scenario: unknown): ValidationResult {
  const validScenarios: ScriptScenario[] = [
    "party",
    "workplace",
    "family",
    "friend",
    "craving",
    "relapse",
  ];

  if (!scenario || typeof scenario !== "string" || !validScenarios.includes(scenario as ScriptScenario)) {
    return { valid: false, error: "Invalid scenario" };
  }

  return { valid: true };
}

function isValidRecoveryStage(stage: unknown): boolean {
  return typeof stage === "string" && ["early", "middle", "maintenance"].includes(stage);
}
