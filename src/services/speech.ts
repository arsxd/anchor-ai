/**
 * Speech service abstraction for voice input (STT) and voice output (TTS).
 * Uses browser-native Web Speech API — no external dependencies.
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

/**
 * Checks if speech recognition is available in the current browser.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

/**
 * Checks if speech synthesis (TTS) is available in the current browser.
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window;
}

/**
 * Starts speech recognition and returns the transcript via callback.
 * Returns a stop function to end recognition manually.
 */
export function startListening(
  onResult: (result: SpeechRecognitionResult) => void,
  onError: (error: string) => void,
  onEnd: () => void
): () => void {
  const SpeechRecognition =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser");
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string; confidence: number } } } }) => {
    const result = event.results[0][0];
    onResult({
      transcript: result.transcript,
      confidence: result.confidence,
    });
  };

  recognition.onerror = (event: { error: string }) => {
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();

  return () => {
    recognition.stop();
  };
}

/**
 * Speaks text aloud using browser TTS.
 * Returns a stop function to cancel speech.
 */
export function speakText(
  text: string,
  options?: { rate?: number; pitch?: number }
): () => void {
  if (!isSpeechSynthesisSupported()) return () => {};

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options?.rate ?? 0.9;
  utterance.pitch = options?.pitch ?? 1;
  utterance.lang = "en-US";

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

/**
 * Stops any currently active speech synthesis.
 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
