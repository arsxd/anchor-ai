/**
 * GET /api/health
 * Health check endpoint to verify deployment and env vars.
 */
export async function GET(): Promise<Response> {
  const hasKey = !!process.env.GEMINI_API_KEY;
  const keyPreview = hasKey
    ? `${process.env.GEMINI_API_KEY?.slice(0, 4)}...${process.env.GEMINI_API_KEY?.slice(-4)}`
    : "NOT SET";

  return Response.json({
    status: "ok",
    geminiKeyConfigured: hasKey,
    keyPreview,
    timestamp: new Date().toISOString(),
  });
}
