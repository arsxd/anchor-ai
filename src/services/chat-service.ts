import { buildChatSystemPrompt } from "@/lib/prompts";
import { sanitizeForLLM } from "@/lib/sanitize";
import type { ChatMode, MoodEntry, UserProfile } from "@/lib/types";

interface ChatServiceInput {
  message: string;
  mode: ChatMode;
  profile: UserProfile | null;
  recentMoods: MoodEntry[];
}

interface ChatPromptResult {
  sanitizedMessage: string;
  systemPrompt: string;
}

/**
 * Prepares a chat request by sanitizing input and building the system prompt.
 * Pure function — no side effects, easily testable.
 */
export function prepareChatPrompt(input: ChatServiceInput): ChatPromptResult {
  const sanitizedMessage = sanitizeForLLM(input.message);
  const systemPrompt = buildChatSystemPrompt(
    input.mode,
    input.profile,
    input.recentMoods
  );

  return { sanitizedMessage, systemPrompt };
}
