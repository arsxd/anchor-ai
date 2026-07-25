import { NextRequest } from "next/server";
import { streamGeminiResponse } from "@/services/gemini";
import { buildScriptSystemPrompt } from "@/lib/prompts";
import { sanitizeForLLM } from "@/lib/sanitize";
import { validateScenario } from "@/lib/validators";
import type { ScriptScenario, UserProfile } from "@/lib/types";
import { SCRIPT_SCENARIOS } from "@/lib/constants";

/**
 * POST /api/script
 * Personalized emergency script generator.
 * Takes scenario + profile, returns Gemini-generated script via streaming.
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { scenario, profile } = body as {
      scenario: unknown;
      profile: UserProfile | null;
    };

    // Validate scenario
    const scenarioValidation = validateScenario(scenario);
    if (!scenarioValidation.valid) {
      return Response.json(
        { success: false, error: scenarioValidation.error },
        { status: 400 }
      );
    }

    const validScenario = scenario as ScriptScenario;
    const scenarioLabel = SCRIPT_SCENARIOS[validScenario].label;

    // Build user message for Gemini
    const userMessage = sanitizeForLLM(
      `Generate a personalized emergency script for this scenario: ${scenarioLabel}. ` +
        `The user is facing pressure related to "${scenarioLabel}". ` +
        `Write a first-person script they can say aloud or read to themselves.`
    );

    // Build system prompt with profile context
    const systemPrompt = buildScriptSystemPrompt(profile ?? null);

    // Stream Gemini response
    const stream = await streamGeminiResponse(userMessage, systemPrompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[/api/script] Error:", error);
    return Response.json(
      { success: false, error: "Failed to generate script" },
      { status: 500 }
    );
  }
}
