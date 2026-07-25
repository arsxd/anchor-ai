import { NextRequest } from "next/server";
import { streamGeminiResponse } from "@/services/gemini";
import { prepareChatPrompt } from "@/services/chat-service";
import { containsInjection } from "@/lib/sanitize";
import { validateChatInput, validateChatMode } from "@/lib/validators";
import type { ChatMode, MoodEntry, UserProfile } from "@/lib/types";

/**
 * POST /api/chat
 * Streaming AI companion endpoint.
 * Accepts user message + context, returns Gemini streaming response.
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { message, mode, profile, recentMoods, language } = body as {
      message: unknown;
      mode: unknown;
      profile: UserProfile | null;
      recentMoods: MoodEntry[];
      language?: string;
    };

    // Validate message
    const messageValidation = validateChatInput(message);
    if (!messageValidation.valid) {
      return Response.json(
        { success: false, error: messageValidation.error },
        { status: 400 }
      );
    }

    // Validate chat mode
    const modeValidation = validateChatMode(mode);
    if (!modeValidation.valid) {
      return Response.json(
        { success: false, error: modeValidation.error },
        { status: 400 }
      );
    }

    // Check for injection attempts
    if (containsInjection(message as string)) {
      return Response.json(
        { success: false, error: "Message contains disallowed content" },
        { status: 400 }
      );
    }

    // Sanitize and build prompt via service
    const { sanitizedMessage, systemPrompt } = prepareChatPrompt({
      message: message as string,
      mode: mode as ChatMode,
      profile: profile ?? null,
      recentMoods: recentMoods ?? [],
      language: language ?? "en",
    });

    // Stream Gemini response
    const stream = await streamGeminiResponse(sanitizedMessage, systemPrompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[/api/chat] Error:", error);
    return Response.json(
      { success: false, error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
