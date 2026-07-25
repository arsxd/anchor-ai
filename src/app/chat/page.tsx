"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessageList } from "@/components/ChatMessageList";
import { ChatModeSelector } from "@/components/ChatModeSelector";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Mic, MicOff, Send, Anchor } from "lucide-react";
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

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) {
      setInput("");
    }
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
          language: localStorage.getItem("anchor_language") || "en",
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

  const handleSend = useCallback(() => {
    sendMessage();
  }, [sendMessage]);

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
    const langCode = localStorage.getItem("anchor_language") || "en";
    const sttLangMap: Record<string, string> = {
      en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN",
    };
    recognition.lang = sttLangMap[langCode] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
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
      utterance.rate = 0.85;
      utterance.pitch = 1.1;

      const langCode = localStorage.getItem("anchor_language") || "en";
      const langMap: Record<string, string> = {
        en: "en-IN",
        hi: "hi-IN",
        ta: "ta-IN",
        te: "te-IN",
        kn: "kn-IN",
        ml: "ml-IN",
      };
      utterance.lang = langMap[langCode] || "en-IN";

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang === utterance.lang)
        || voices.find(v => v.lang.startsWith(langCode))
        || voices.find(v => v.lang.startsWith("en"));
      if (matchingVoice) utterance.voice = matchingVoice;

      window.speechSynthesis.speak(utterance);
    }
  }

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant") {
        speakText(lastMsg.content);
      }
    }
  }, [messages]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <a href="#chat-input" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to chat input
      </a>

      <header className="border-b px-4 py-3 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold flex items-center gap-2"><Anchor className="h-5 w-5 text-primary" /> AnchorAI</span>
          </div>
          <LanguageSwitcher />
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
        <div className="flex flex-col items-center gap-3" id="chat-input">
          <button
            onClick={toggleVoice}
            aria-label={isListening ? "Stop listening" : "Tap to speak"}
            className={`relative flex items-center justify-center rounded-full transition-all ${
              isListening
                ? "w-20 h-20 bg-destructive text-white voice-active shadow-lg shadow-destructive/30"
                : "w-20 h-20 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
            }`}
          >
            {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            {isListening && (
              <span className="absolute -bottom-6 text-xs font-medium text-destructive">Listening...</span>
            )}
            {!isListening && !input && (
              <span className="absolute -bottom-6 text-xs font-medium text-muted-foreground">Tap to speak</span>
            )}
          </button>

          <div className="flex w-full gap-2 items-end mt-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Or type here..."
              className="min-h-[44px] max-h-24 resize-none text-sm"
              aria-label="Chat message input"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              aria-label="Send message"
              className="h-11 w-11 shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Voice-first · AI reads responses aloud · Powered by Google Gemini
        </p>
      </div>
    </main>
  );
}
