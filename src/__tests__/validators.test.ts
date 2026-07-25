import { describe, it, expect } from "vitest";
import {
  validateProfile,
  validateChatInput,
  validateMoodScore,
  validateMoodType,
  validateChatMode,
  validateScenario,
} from "@/lib/validators";

describe("validateProfile", () => {
  const validProfile = {
    name: "Alex",
    triggers: ["stress", "social pressure"],
    recoveryStage: "early",
    supportContacts: [{ name: "Sam", relationship: "partner", phone: "555-1234" }],
    myWhy: "For my daughter's future",
    copingPreferences: ["meditation", "walking"],
    createdAt: new Date().toISOString(),
  };

  it("validates a complete valid profile", () => {
    expect(validateProfile(validProfile)).toEqual({ valid: true });
  });

  it("rejects null/undefined profile", () => {
    expect(validateProfile(null)).toEqual({ valid: false, error: "Profile must be an object" });
    expect(validateProfile(undefined)).toEqual({ valid: false, error: "Profile must be an object" });
  });

  it("rejects profile with missing name", () => {
    const { name, ...noName } = validProfile;
    expect(validateProfile(noName).valid).toBe(false);
    expect(validateProfile(noName).error).toContain("Name");
  });

  it("rejects profile with empty name", () => {
    expect(validateProfile({ ...validProfile, name: "" }).valid).toBe(false);
    expect(validateProfile({ ...validProfile, name: "   " }).valid).toBe(false);
  });

  it("rejects name exceeding max length", () => {
    const result = validateProfile({ ...validProfile, name: "a".repeat(201) });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("200");
  });

  it("rejects profile with non-array triggers", () => {
    expect(validateProfile({ ...validProfile, triggers: "stress" }).valid).toBe(false);
  });

  it("rejects profile with too many triggers", () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => `trigger-${i}`);
    const result = validateProfile({ ...validProfile, triggers: tooMany });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10");
  });

  it("rejects profile with missing myWhy", () => {
    const { myWhy, ...noWhy } = validProfile;
    expect(validateProfile(noWhy).valid).toBe(false);
    expect(validateProfile(noWhy).error).toContain("why");
  });

  it("rejects invalid recovery stage", () => {
    expect(validateProfile({ ...validProfile, recoveryStage: "unknown" }).valid).toBe(false);
  });

  it("accepts all valid recovery stages", () => {
    expect(validateProfile({ ...validProfile, recoveryStage: "early" }).valid).toBe(true);
    expect(validateProfile({ ...validProfile, recoveryStage: "middle" }).valid).toBe(true);
    expect(validateProfile({ ...validProfile, recoveryStage: "maintenance" }).valid).toBe(true);
  });

  it("rejects too many support contacts", () => {
    const tooMany = Array.from({ length: 6 }, (_, i) => ({
      name: `Contact ${i}`,
      relationship: "friend",
      phone: "555-0000",
    }));
    const result = validateProfile({ ...validProfile, supportContacts: tooMany });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("5");
  });
});

describe("validateChatInput", () => {
  it("validates non-empty string message", () => {
    expect(validateChatInput("Hello, I need help")).toEqual({ valid: true });
  });

  it("rejects null/undefined message", () => {
    expect(validateChatInput(null).valid).toBe(false);
    expect(validateChatInput(undefined).valid).toBe(false);
  });

  it("rejects non-string message", () => {
    expect(validateChatInput(123).valid).toBe(false);
    expect(validateChatInput({}).valid).toBe(false);
  });

  it("rejects empty/whitespace-only message", () => {
    expect(validateChatInput("").valid).toBe(false);
    expect(validateChatInput("   ").valid).toBe(false);
  });

  it("rejects message exceeding 500 characters", () => {
    const longMessage = "a".repeat(501);
    const result = validateChatInput(longMessage);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("500");
  });

  it("accepts message at exactly 500 characters", () => {
    expect(validateChatInput("a".repeat(500)).valid).toBe(true);
  });
});

describe("validateMoodScore", () => {
  it("validates scores between 1 and 10", () => {
    expect(validateMoodScore(1).valid).toBe(true);
    expect(validateMoodScore(5).valid).toBe(true);
    expect(validateMoodScore(10).valid).toBe(true);
  });

  it("rejects scores below 1", () => {
    expect(validateMoodScore(0).valid).toBe(false);
    expect(validateMoodScore(-1).valid).toBe(false);
  });

  it("rejects scores above 10", () => {
    expect(validateMoodScore(11).valid).toBe(false);
  });

  it("rejects non-integer scores", () => {
    expect(validateMoodScore(5.5).valid).toBe(false);
    expect(validateMoodScore(3.14).valid).toBe(false);
  });

  it("rejects non-number types", () => {
    expect(validateMoodScore("5").valid).toBe(false);
    expect(validateMoodScore(null).valid).toBe(false);
    expect(validateMoodScore(undefined).valid).toBe(false);
  });
});

describe("validateMoodType", () => {
  it("validates all recognized mood types", () => {
    const validMoods = ["anxious", "sad", "frustrated", "calm", "happy", "determined", "tired", "craving"];
    validMoods.forEach((mood) => {
      expect(validateMoodType(mood).valid).toBe(true);
    });
  });

  it("rejects invalid mood types", () => {
    expect(validateMoodType("angry").valid).toBe(false);
    expect(validateMoodType("excited").valid).toBe(false);
    expect(validateMoodType("").valid).toBe(false);
  });

  it("rejects non-string types", () => {
    expect(validateMoodType(null).valid).toBe(false);
    expect(validateMoodType(123).valid).toBe(false);
  });
});

describe("validateChatMode", () => {
  it("validates all chat modes", () => {
    const validModes = ["calm", "crisis", "journal", "caregiver"];
    validModes.forEach((mode) => {
      expect(validateChatMode(mode).valid).toBe(true);
    });
  });

  it("rejects invalid modes", () => {
    expect(validateChatMode("panic").valid).toBe(false);
    expect(validateChatMode("").valid).toBe(false);
    expect(validateChatMode(null).valid).toBe(false);
  });
});

describe("validateScenario", () => {
  it("validates all script scenarios", () => {
    const validScenarios = ["party", "workplace", "family", "friend", "craving", "relapse"];
    validScenarios.forEach((scenario) => {
      expect(validateScenario(scenario).valid).toBe(true);
    });
  });

  it("rejects invalid scenarios", () => {
    expect(validateScenario("school").valid).toBe(false);
    expect(validateScenario("").valid).toBe(false);
    expect(validateScenario(null).valid).toBe(false);
  });
});
