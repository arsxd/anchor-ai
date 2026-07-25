import { buildScriptSystemPrompt } from "@/lib/prompts";
import { sanitizeForLLM } from "@/lib/sanitize";
import { SCRIPT_SCENARIOS } from "@/lib/constants";
import type { ScriptScenario, UserProfile } from "@/lib/types";

interface ScriptServiceInput {
  scenario: ScriptScenario;
  profile: UserProfile | null;
}

interface ScriptPromptResult {
  userMessage: string;
  systemPrompt: string;
}

/**
 * Prepares a script generation request by building the prompt from scenario and profile.
 * Pure function — no side effects, easily testable.
 */
export function prepareScriptPrompt(input: ScriptServiceInput): ScriptPromptResult {
  const scenarioLabel = SCRIPT_SCENARIOS[input.scenario].label;

  const userMessage = sanitizeForLLM(
    `Generate a personalized emergency script for this scenario: ${scenarioLabel}. ` +
    `The user is facing pressure related to "${scenarioLabel}". ` +
    `Write a first-person script they can say aloud or read to themselves.`
  );

  const systemPrompt = buildScriptSystemPrompt(input.profile);

  return { userMessage, systemPrompt };
}
