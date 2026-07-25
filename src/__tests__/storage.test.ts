/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { UserProfile, MoodEntry, ChatMessage } from "@/lib/types";

// Mock localStorage since jsdom v29 doesn't provide it by default
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Import after mocking
const { getUserProfile, saveUserProfile, getMoodHistory, addMoodEntry, getChatHistory, addChatMessage, clearAllData } = await import("@/services/storage");

const mockProfile: UserProfile = {
  name: "Alex",
  triggers: ["stress", "social events"],
  recoveryStage: "early",
  supportContacts: [{ name: "Sam", relationship: "partner", phone: "555-1234" }],
  myWhy: "For my daughter's future",
  copingPreferences: ["meditation"],
  createdAt: "2024-01-01T00:00:00.000Z",
};

const mockMoodEntry: MoodEntry = {
  id: "mood-1",
  mood: "anxious",
  score: 3,
  timestamp: "2024-01-15T10:00:00.000Z",
};

const mockChatMessage: ChatMessage = {
  id: "msg-1",
  role: "user",
  content: "I need help today",
  timestamp: "2024-01-15T10:00:00.000Z",
  mode: "calm",
};

beforeEach(() => {
  localStorageMock.clear();
});

describe("getUserProfile / saveUserProfile", () => {
  it("returns null when no profile stored", () => {
    expect(getUserProfile()).toBeNull();
  });

  it("stores and retrieves user profile", () => {
    saveUserProfile(mockProfile);
    const retrieved = getUserProfile();
    expect(retrieved).toEqual(mockProfile);
  });

  it("overwrites existing profile", () => {
    saveUserProfile(mockProfile);
    const updated = { ...mockProfile, name: "Jordan" };
    saveUserProfile(updated);
    expect(getUserProfile()?.name).toBe("Jordan");
  });

  it("handles corrupted localStorage data gracefully", () => {
    localStorage.setItem("anchor_user_profile", "not-valid-json{{{");
    expect(getUserProfile()).toBeNull();
  });
});

describe("getMoodHistory / addMoodEntry", () => {
  it("returns empty array when no mood history", () => {
    expect(getMoodHistory()).toEqual([]);
  });

  it("adds a mood entry to history", () => {
    addMoodEntry(mockMoodEntry);
    const history = getMoodHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(mockMoodEntry);
  });

  it("appends multiple mood entries", () => {
    addMoodEntry(mockMoodEntry);
    addMoodEntry({ ...mockMoodEntry, id: "mood-2", mood: "calm", score: 7 });
    const history = getMoodHistory();
    expect(history).toHaveLength(2);
    expect(history[1].mood).toBe("calm");
  });

  it("preserves chronological order", () => {
    const entries: MoodEntry[] = [
      { ...mockMoodEntry, id: "1", timestamp: "2024-01-01T00:00:00Z" },
      { ...mockMoodEntry, id: "2", timestamp: "2024-01-02T00:00:00Z" },
      { ...mockMoodEntry, id: "3", timestamp: "2024-01-03T00:00:00Z" },
    ];
    entries.forEach(addMoodEntry);
    const history = getMoodHistory();
    expect(history[0].id).toBe("1");
    expect(history[2].id).toBe("3");
  });
});

describe("getChatHistory / addChatMessage", () => {
  it("returns empty array when no chat history", () => {
    expect(getChatHistory()).toEqual([]);
  });

  it("stores and retrieves chat messages", () => {
    addChatMessage(mockChatMessage);
    const history = getChatHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(mockChatMessage);
  });

  it("stores both user and assistant messages", () => {
    addChatMessage(mockChatMessage);
    addChatMessage({
      ...mockChatMessage,
      id: "msg-2",
      role: "assistant",
      content: "I'm here to help",
    });
    const history = getChatHistory();
    expect(history).toHaveLength(2);
    expect(history[0].role).toBe("user");
    expect(history[1].role).toBe("assistant");
  });

  it("trims history to last 50 messages", () => {
    for (let i = 0; i < 55; i++) {
      addChatMessage({ ...mockChatMessage, id: `msg-${i}`, content: `Message ${i}` });
    }
    const history = getChatHistory();
    expect(history).toHaveLength(50);
    // Should keep the most recent 50
    expect(history[0].content).toBe("Message 5");
    expect(history[49].content).toBe("Message 54");
  });
});

describe("clearAllData", () => {
  it("removes all stored data", () => {
    saveUserProfile(mockProfile);
    addMoodEntry(mockMoodEntry);
    addChatMessage(mockChatMessage);

    clearAllData();

    expect(getUserProfile()).toBeNull();
    expect(getMoodHistory()).toEqual([]);
    expect(getChatHistory()).toEqual([]);
  });
});
