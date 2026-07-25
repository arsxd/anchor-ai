import { STORAGE_KEYS } from "@/lib/constants";
import type { ChatMessage, MoodEntry, UserProfile } from "@/lib/types";

/**
 * Typed localStorage wrapper for persistent user data.
 * All operations are safe — returns null/empty on failure.
 */

export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch {
    console.error("Failed to save user profile");
  }
}

export function getMoodHistory(): MoodEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOOD_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as MoodEntry[];
  } catch {
    return [];
  }
}

export function addMoodEntry(entry: MoodEntry): void {
  try {
    const history = getMoodHistory();
    history.push(entry);
    localStorage.setItem(STORAGE_KEYS.MOOD_HISTORY, JSON.stringify(history));
  } catch {
    console.error("Failed to save mood entry");
  }
}

export function getChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

export function addChatMessage(message: ChatMessage): void {
  try {
    const history = getChatHistory();
    history.push(message);
    // Keep only last 50 messages to prevent storage overflow
    const trimmed = history.slice(-50);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(trimmed));
  } catch {
    console.error("Failed to save chat message");
  }
}

export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch {
    console.error("Failed to clear data");
  }
}
