import { NextRequest } from "next/server";
import { generateGeminiResponse } from "@/services/gemini";
import { buildCaregiverSystemPrompt } from "@/lib/prompts";
import { containsInjection } from "@/lib/sanitize";
import { detectRiskPattern } from "@/services/insight-service";
import type { MoodEntry, UserProfile } from "@/lib/types";

/**
 * POST /api/caregiver
 * Generates AI guidance for caregivers based on loved one's state.
 * Non-streaming — returns actionable caregiver advice.
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { moodHistory, profile, requestType } = body as {
      moodHistory: MoodEntry[];
      profile: UserProfile | null;
      requestType?: "guidance" | "deescalation";
    };

    if (!moodHistory || !Array.isArray(moodHistory)) {
      return Response.json(
        { success: false, error: "Mood history must be an array" },
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

    // Analyze risk for caregiver context
    const riskAssessment = detectRiskPattern(moodHistory);

    // Build context for Gemini
    const userMessage = buildCaregiverMessage(
      moodHistory,
      riskAssessment.patternDescription,
      riskAssessment.riskLevel,
      requestType ?? "guidance"
    );

    // Build system prompt
    const systemPrompt = buildCaregiverSystemPrompt(profile ?? null);

    // Generate caregiver guidance (non-streaming)
    const guidance = await generateGeminiResponse(userMessage, systemPrompt);

    return Response.json({
      success: true,
      data: {
        guidance,
        riskAssessment,
      },
    });
  } catch (error) {
    console.error("[/api/caregiver] Error:", error);
    return Response.json(
      { success: false, error: "Failed to generate caregiver guidance" },
      { status: 500 }
    );
  }
}

function buildCaregiverMessage(
  moodHistory: MoodEntry[],
  patternDescription: string,
  riskLevel: string,
  requestType: "guidance" | "deescalation"
): string {
  const recentMood = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1] : null;

  let message = "";

  if (requestType === "deescalation") {
    message = `Generate a de-escalation script for the caregiver. `;
  } else {
    message = `Generate "what to say right now" guidance for the caregiver. `;
  }

  if (recentMood) {
    message += `Their loved one's current mood: ${recentMood.mood} (score: ${recentMood.score}/10). `;
  }

  message += `Pattern: ${patternDescription} Risk level: ${riskLevel}.`;

  if (riskLevel === "high") {
    message += ` Alert: High risk detected. Include advice about professional intervention.`;
  }

  return message;
}
