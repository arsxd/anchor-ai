import { NextRequest } from "next/server";
import { generateGeminiResponse } from "@/services/gemini";
import { buildInsightSystemPrompt } from "@/lib/prompts";
import { validateMoodScore, validateMoodType } from "@/lib/validators";
import { containsInjection } from "@/lib/sanitize";
import { detectRiskPattern } from "@/services/insight-service";
import type { MoodEntry, UserProfile } from "@/lib/types";

/**
 * POST /api/insight
 * Generates personalized mood insight + prevention detection.
 * Non-streaming — returns full insight text for shorter responses.
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { currentMood, currentScore, moodHistory, profile } = body as {
      currentMood: unknown;
      currentScore: unknown;
      moodHistory: MoodEntry[];
      profile: UserProfile | null;
    };

    // Validate current mood
    const moodValidation = validateMoodType(currentMood);
    if (!moodValidation.valid) {
      return Response.json(
        { success: false, error: moodValidation.error },
        { status: 400 }
      );
    }

    // Check currentMood for injection attempts
    if (containsInjection(currentMood as string)) {
      return Response.json(
        { success: false, error: "Input contains disallowed content" },
        { status: 400 }
      );
    }

    // Validate score
    const scoreValidation = validateMoodScore(currentScore);
    if (!scoreValidation.valid) {
      return Response.json(
        { success: false, error: scoreValidation.error },
        { status: 400 }
      );
    }

    // Check for injection in profile fields
    if (profile?.name && containsInjection(profile.name)) {
      return Response.json(
        { success: false, error: "Input contains disallowed content" },
        { status: 400 }
      );
    }

    // Run prevention engine
    const riskAssessment = detectRiskPattern(moodHistory ?? []);

    // Build context for Gemini
    const userMessage = buildInsightMessage(
      currentMood as string,
      currentScore as number,
      riskAssessment.patternDescription,
      riskAssessment.shouldIntervene
    );

    // Build system prompt with profile
    const systemPrompt = buildInsightSystemPrompt(profile ?? null);

    // Generate insight (non-streaming for short response)
    const insight = await generateGeminiResponse(userMessage, systemPrompt);

    return Response.json({
      success: true,
      data: {
        insight,
        riskAssessment,
      },
    });
  } catch (error) {
    console.error("[/api/insight] Error:", error);
    return Response.json(
      { success: false, error: "Failed to generate insight" },
      { status: 500 }
    );
  }
}

function buildInsightMessage(
  mood: string,
  score: number,
  patternDescription: string,
  shouldIntervene: boolean
): string {
  let message = `Current check-in: feeling ${mood} (score: ${score}/10).`;

  if (patternDescription) {
    message += ` Recent pattern: ${patternDescription}`;
  }

  if (shouldIntervene) {
    message += ` IMPORTANT: Risk pattern detected. Include a gentle, proactive prevention suggestion.`;
  }

  return message;
}
