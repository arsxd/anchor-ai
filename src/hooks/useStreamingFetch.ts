import { useState, useCallback } from "react";

interface UseStreamingFetchOptions {
  url: string;
}

interface UseStreamingFetchReturn {
  streamingText: string;
  isLoading: boolean;
  error: string | null;
  fetchStream: (body: Record<string, unknown>) => Promise<string>;
  reset: () => void;
}

/**
 * Custom hook for streaming fetch requests to Gemini API routes.
 * Handles loading state, streaming text accumulation, and error handling.
 */
export function useStreamingFetch({ url }: UseStreamingFetchOptions): UseStreamingFetchReturn {
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStream = useCallback(async (body: Record<string, unknown>): Promise<string> => {
    setIsLoading(true);
    setStreamingText("");
    setError(null);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setStreamingText(fullText);
        }
      }

      return fullText;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      return "";
    } finally {
      setIsLoading(false);
      setStreamingText("");
    }
  }, [url]);

  const reset = useCallback(() => {
    setStreamingText("");
    setIsLoading(false);
    setError(null);
  }, []);

  return { streamingText, isLoading, error, fetchStream, reset };
}
