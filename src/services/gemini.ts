import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL } from "@/lib/constants";

let genAIInstance: GoogleGenerativeAI | null = null;

/**
 * Returns a singleton instance of the Gemini client.
 * Only usable server-side (API routes).
 */
function getGenAI(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

/**
 * Generates a streaming response from Gemini.
 * Returns a ReadableStream for use with Next.js streaming responses.
 */
export async function streamGeminiResponse(
  userMessage: string,
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Generates a complete (non-streaming) response from Gemini.
 * Use for shorter outputs like mood insights or caregiver tips.
 */
export async function generateGeminiResponse(
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
  });

  return result.response.text();
}
