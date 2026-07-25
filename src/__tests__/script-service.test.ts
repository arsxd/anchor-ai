import { describe, it, expect } from "vitest";
import { prepareScriptPrompt } from "@/services/script-service";
import type { UserProfile } from "@/lib/types";

const mockProfile: UserProfile = {
  name: "Alex",
  triggers: ["stress", "social events"],
  recoveryStage: "early",
  supportContacts: [{ name: "Sam", relationship: "partner", phone: "555-1234" }],
  myWhy: "For my daughter's future",
  copingPreferences: ["meditation"],
  createdAt: "2024-01-01T00:00:00.000Z",
};

describe("prepareScriptPrompt", () => {
  it("returns userMessage and systemPrompt", () => {
    const result = prepareScriptPrompt({ scenario: "party", profile: mockProfile });
    expect(result).toHaveProperty("userMessage");
    expect(result).toHaveProperty("systemPrompt");
  });

  it("includes scenario label in user message", () => {
    const result = prepareScriptPrompt({ scenario: "party", profile: mockProfile });
    expect(result.userMessage).toContain("Party Pressure");
  });

  it("includes profile context in system prompt", () => {
    const result = prepareScriptPrompt({ scenario: "workplace", profile: mockProfile });
    expect(result.systemPrompt).toContain("Alex");
    expect(result.systemPrompt).toContain("daughter");
  });

  it("works without profile (null)", () => {
    const result = prepareScriptPrompt({ scenario: "craving", profile: null });
    expect(result.userMessage).toContain("Intense Craving");
    expect(result.systemPrompt).toBeTruthy();
  });

  it("handles all valid scenarios", () => {
    const scenarios = ["party", "workplace", "family", "friend", "craving", "relapse"] as const;
    scenarios.forEach((scenario) => {
      const result = prepareScriptPrompt({ scenario, profile: mockProfile });
      expect(result.userMessage).toBeTruthy();
      expect(result.systemPrompt).toBeTruthy();
    });
  });

  it("sanitizes the generated user message", () => {
    const result = prepareScriptPrompt({ scenario: "party", profile: mockProfile });
    // Should not contain any HTML
    expect(result.userMessage).not.toContain("<");
    expect(result.userMessage).not.toContain(">");
  });

  it("includes instructions for first-person script", () => {
    const result = prepareScriptPrompt({ scenario: "family", profile: mockProfile });
    expect(result.userMessage).toContain("first-person");
  });

  it("includes support network in system prompt when profile has contacts", () => {
    const result = prepareScriptPrompt({ scenario: "party", profile: mockProfile });
    expect(result.systemPrompt).toContain("Sam");
  });

  it("includes recovery stage in system prompt", () => {
    const result = prepareScriptPrompt({ scenario: "party", profile: mockProfile });
    expect(result.systemPrompt).toContain("early");
  });
});
