import { describe, it, expect } from "vitest";
import { detectRiskPattern, calculateTrend } from "@/services/insight-service";
import type { MoodEntry } from "@/lib/types";

function createMoodEntry(overrides: Partial<MoodEntry> = {}): MoodEntry {
  return {
    id: `mood-${Math.random().toString(36).slice(2)}`,
    mood: "calm",
    score: 7,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe("detectRiskPattern", () => {
  it("returns low risk for empty mood history", () => {
    const result = detectRiskPattern([]);
    expect(result.riskLevel).toBe("low");
    expect(result.shouldIntervene).toBe(false);
  });

  it("returns low risk for positive mood entries", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 7, mood: "calm" }),
      createMoodEntry({ score: 8, mood: "happy" }),
      createMoodEntry({ score: 9, mood: "determined" }),
    ];
    const result = detectRiskPattern(entries);
    expect(result.riskLevel).toBe("low");
    expect(result.shouldIntervene).toBe(false);
  });

  it("detects elevated risk when 3+ negative moods in last 5", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 2, mood: "sad" }),
      createMoodEntry({ score: 3, mood: "anxious" }),
      createMoodEntry({ score: 2, mood: "craving" }),
      createMoodEntry({ score: 7, mood: "calm" }),
      createMoodEntry({ score: 6, mood: "determined" }),
    ];
    const result = detectRiskPattern(entries);
    expect(result.riskLevel).toBe("elevated");
    expect(result.shouldIntervene).toBe(true);
  });

  it("detects high risk when 4+ negative moods in last 5", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 2, mood: "sad" }),
      createMoodEntry({ score: 1, mood: "craving" }),
      createMoodEntry({ score: 3, mood: "anxious" }),
      createMoodEntry({ score: 2, mood: "frustrated" }),
      createMoodEntry({ score: 5, mood: "tired" }),
    ];
    const result = detectRiskPattern(entries);
    expect(result.riskLevel).toBe("high");
    expect(result.shouldIntervene).toBe(true);
  });

  it("detects high risk when average score <= 2.5", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 2 }),
      createMoodEntry({ score: 3 }),
      createMoodEntry({ score: 2 }),
      createMoodEntry({ score: 2 }),
      createMoodEntry({ score: 3 }),
    ];
    const result = detectRiskPattern(entries);
    expect(result.riskLevel).toBe("high");
    expect(result.shouldIntervene).toBe(true);
  });

  it("only considers last 5 entries", () => {
    // 10 entries: first 5 bad, last 5 good
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 1 }),
      createMoodEntry({ score: 1 }),
      createMoodEntry({ score: 1 }),
      createMoodEntry({ score: 1 }),
      createMoodEntry({ score: 1 }),
      createMoodEntry({ score: 8 }),
      createMoodEntry({ score: 9 }),
      createMoodEntry({ score: 8 }),
      createMoodEntry({ score: 9 }),
      createMoodEntry({ score: 8 }),
    ];
    const result = detectRiskPattern(entries);
    expect(result.riskLevel).toBe("low");
    expect(result.shouldIntervene).toBe(false);
  });

  it("includes pattern description", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 2, mood: "craving" }),
      createMoodEntry({ score: 3, mood: "craving" }),
      createMoodEntry({ score: 2, mood: "anxious" }),
    ];
    const result = detectRiskPattern(entries);
    expect(result.patternDescription).toBeTruthy();
    expect(typeof result.patternDescription).toBe("string");
  });

  it("detects recurring craving in pattern description", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 2, mood: "craving" }),
      createMoodEntry({ score: 3, mood: "craving" }),
      createMoodEntry({ score: 4, mood: "tired" }),
      createMoodEntry({ score: 5, mood: "calm" }),
      createMoodEntry({ score: 6, mood: "calm" }),
    ];
    const result = detectRiskPattern(entries);
    expect(result.patternDescription).toContain("craving");
  });

  it("includes recentTrend in result", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 8 }),
      createMoodEntry({ score: 7 }),
      createMoodEntry({ score: 3 }),
      createMoodEntry({ score: 2 }),
    ];
    const result = detectRiskPattern(entries);
    expect(result.recentTrend).toBeDefined();
    expect(["improving", "stable", "declining"]).toContain(result.recentTrend);
  });
});

describe("calculateTrend", () => {
  it("returns stable for single entry", () => {
    expect(calculateTrend([createMoodEntry({ score: 5 })])).toBe("stable");
  });

  it("returns improving when second half scores higher", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 3 }),
      createMoodEntry({ score: 3 }),
      createMoodEntry({ score: 7 }),
      createMoodEntry({ score: 8 }),
    ];
    expect(calculateTrend(entries)).toBe("improving");
  });

  it("returns declining when second half scores lower", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 8 }),
      createMoodEntry({ score: 7 }),
      createMoodEntry({ score: 3 }),
      createMoodEntry({ score: 2 }),
    ];
    expect(calculateTrend(entries)).toBe("declining");
  });

  it("returns stable when scores are consistent", () => {
    const entries: MoodEntry[] = [
      createMoodEntry({ score: 5 }),
      createMoodEntry({ score: 6 }),
      createMoodEntry({ score: 5 }),
      createMoodEntry({ score: 6 }),
    ];
    expect(calculateTrend(entries)).toBe("stable");
  });

  it("returns stable for empty array", () => {
    expect(calculateTrend([])).toBe("stable");
  });
});
