"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessageList } from "@/components/ChatMessageList";
import { ChatModeSelector } from "@/components/ChatModeSelector";
import type { ChatMessage, ChatMode } from "@/lib/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("calm");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ReturnType<typeof Object> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get("mode");
    if (urlMode && ["calm", "crisis", "journal", "caregiver"].includes(urlMode)) {
      setMode(urlMode as ChatMode);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

    try {
      const profile = localStorage.getItem("anchor_user_profile");
      const moods = localStorage.getItem("anchor_mood_history");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode,
          profile: profile ? JSON.parse(profile) : null,
          recentMoods: moods ? JSON.parse(moods).slice(-5) : [],
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

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

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullText,
        timestamp: new Date().toISOString(),
        mode,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setStreamingText("");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again.",
          timestamp: new Date().toISOString(),
          mode,
        },
      ]);
      setStreamingText("");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, mode]);

  function toggleVoice() {
    if (isListening) {
      if (recognitionRef.current) {
        (recognitionRef.current as { stop: () => void }).stop();
      }
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setInput("Voice not supported in this browser");
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }

  function speakText(text: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <a href="#chat-input" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to chat input
      </a>

      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">⚓ AnchorAI</span>
          <span className="text-xs text-muted-foreground">Companion</span>
        </div>
        <ChatModeSelector currentMode={mode} onModeChange={setMode} />
      </header>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <ChatMessageList
          messages={messages}
          streamingText={streamingText}
          isLoading={isLoading}
          onSpeakMessage={speakText}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 max-w-3xl mx-auto w-full">
        <div className="flex gap-2 items-end" id="chat-input">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message, or tap the mic to speak..."
            className="min-h-[44px] max-h-32 resize-none"
            aria-label="Chat message input"
            disabled={isLoading}
          />
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleVoice}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            className="h-11 w-11 shrink-0"
          >
            {isListening ? "⏹️" : "🎙️"}
          </Button>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            aria-label="Send message"
            className="h-11 w-11 shrink-0"
          >
            →
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Zero-typing: tap 🎙️ to speak · AI reads responses aloud · Powered by Google Gemini
        </p>
      </div>
    </main>
  );
}
