import { NextRequest } from "next/server";
import { streamGeminiResponse } from "@/services/gemini";
import { prepareScriptPrompt } from "@/services/script-service";
import { containsInjection } from "@/lib/sanitize";
import { validateScenario } from "@/lib/validators";
import type { ScriptScenario, UserProfile } from "@/lib/types";

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

    // Check scenario for injection attempts
    if (containsInjection(scenario as string)) {
      return Response.json(
        { success: false, error: "Input contains disallowed content" },
        { status: 400 }
      );
    }

    // Check profile fields for injection attempts
    if (profile?.name && containsInjection(profile.name)) {
      return Response.json(
        { success: false, error: "Input contains disallowed content" },
        { status: 400 }
      );
    }

    const validScenario = scenario as ScriptScenario;

    // Build prompt via service
    const { userMessage, systemPrompt } = prepareScriptPrompt({
      scenario: validScenario,
      profile: profile ?? null,
    });

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
