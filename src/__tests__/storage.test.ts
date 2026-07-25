import { describe, it, expect, beforeEach } from "vitest";
import { getUserProfile, saveUserProfile, getMoodHistory, addMoodEntry, clearAllData } from "../services/storage";
import type { UserProfile, MoodEntry } from "../lib/types";

const mockProfile: UserProfile = {
  name: "Alex",
  triggers: ["stress", "social events"],
  recoveryStage: "early",
  supportContacts: [{ name: "Sam", relationship: "partner", phone: "555-0123" }],
  myWhy: "For my daughter",
  copingPreferences: ["breathwork", "journaling"],
  createdAt: "2024-01-01T00:00:00.000Z",
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe("getUserProfile", () => {
  it("returns null when no profile exists", () => {
    expect(getUserProfile()).toBeNull();
  });

  it("returns stored profile", () => {
    saveUserProfile(mockProfile);
    expect(getUserProfile()).toEqual(mockProfile);
  });
});

describe("getMoodHistory", () => {
  it("returns empty array when no history", () => {
    expect(getMoodHistory()).toEqual([]);
  });

  it("stores and retrieves mood entries", () => {
    const entry: MoodEntry = { id: "1", mood: "calm", score: 7, timestamp: "2024-01-01T00:00:00.000Z" };
    addMoodEntry(entry);
    expect(getMoodHistory()).toEqual([entry]);
  });
});

describe("clearAllData", () => {
  it("removes all stored data", () => {
    saveUserProfile(mockProfile);
    clearAllData();
    expect(getUserProfile()).toBeNull();
    expect(getMoodHistory()).toEqual([]);
  });
});
