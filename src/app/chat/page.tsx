"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage, ChatMode } from "@/lib/types";

const MODES: { value: ChatMode; label: string; emoji: string }[] = [
  { value: "calm", label: "Calm", emoji: "🌊" },
  { value: "crisis", label: "Crisis", emoji: "🆘" },
  { value: "journal", label: "Journal", emoji: "📓" },
  { value: "caregiver", label: "Caregiver", emoji: "💙" },
];

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  async function handleSend() {
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

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
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
  }

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

      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">⚓ AnchorAI</span>
          <span className="text-xs text-muted-foreground">Companion</span>
        </div>
        <nav className="flex gap-1" aria-label="Chat mode selection">
          {MODES.map((m) => (
            <Button
              key={m.value}
              variant={mode === m.value ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(m.value)}
              aria-pressed={mode === m.value}
              aria-label={`Switch to ${m.label} mode`}
            >
              <span aria-hidden="true">{m.emoji}</span>
              <span className="hidden sm:inline ml-1">{m.label}</span>
            </Button>
          ))}
        </nav>
      </header>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 && !streamingText && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg font-medium mb-2">Hello. I&apos;m AnchorAI.</p>
            <p className="text-sm">Your recovery companion. Talk, type, or use voice — I&apos;m here 24/7.</p>
            <p className="text-xs mt-4">Try saying: &quot;I&apos;m feeling anxious about tonight&quot;</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card
              className={`max-w-[80%] p-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-6 text-xs"
                  onClick={() => speakText(msg.content)}
                  aria-label="Read message aloud"
                >
                  🔊 Read Aloud
                </Button>
              )}
            </Card>
          </div>
        ))}

        {streamingText && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-3 bg-muted">
              <p className="text-sm whitespace-pre-wrap">{streamingText}</p>
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" aria-hidden="true" />
            </Card>
          </div>
        )}

        {isLoading && !streamingText && (
          <div className="flex justify-start">
            <Card className="p-3 bg-muted">
              <div className="flex gap-1" aria-label="AI is thinking">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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
