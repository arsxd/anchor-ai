'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CRISIS_HOTLINES } from '@/lib/constants';

const GROUNDING_STEPS = [
  { step: 1, instruction: 'Take a slow, deep breath in… hold… and out.', emoji: '🌬️' },
  { step: 2, instruction: 'Name 5 things you can see right now.', emoji: '👁️' },
  { step: 3, instruction: 'Touch something nearby. Focus on how it feels.', emoji: '✋' },
  { step: 4, instruction: 'Listen. Name 3 sounds you hear.', emoji: '👂' },
  { step: 5, instruction: 'You are here. You are safe. This will pass.', emoji: '⚓' },
];

export default function CrisisPage() {
  const [aiResponse, setAiResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function fetchCrisisGuidance() {
      setIsStreaming(true);

      try {
        let profile = null;
        try {
          const stored = localStorage.getItem('anchor_user_profile');
          if (stored) profile = JSON.parse(stored);
        } catch {
          // localStorage may not be available
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'I am in crisis and need immediate help. Guide me through grounding.',
            mode: 'crisis',
            profile,
            recentMoods: [],
          }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Failed to get crisis response');

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setAiResponse(fullText);
          }
        }

        // Auto-speak the full response when streaming completes
        if (fullText && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(fullText);
          utterance.rate = 0.85;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setAiResponse(
          'You are safe. Breathe slowly. If you need immediate help, please call one of the numbers below.'
        );
      } finally {
        setIsStreaming(false);
      }
    }

    fetchCrisisGuidance();
  }, []);

  // Focus the AI response area when it starts streaming
  useEffect(() => {
    if (aiResponse && responseRef.current) {
      responseRef.current.focus();
    }
  }, [aiResponse]);

  function replayAudio() {
    if (aiResponse && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(aiResponse);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <main
      className="min-h-screen bg-background flex flex-col items-center px-4 py-6"
      aria-label="Crisis support page"
    >
      {/* Skip link */}
      <a
        href="#crisis-hotlines"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to emergency contacts
      </a>

      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            🆘 You Are Not Alone
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Help is here. Follow these steps.
          </p>
        </header>

        {/* Grounding Steps - immediately visible */}
        <Card className="p-6 border-2 border-primary/30">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Grounding — Do This Now:
          </h2>
          <ol className="space-y-4" aria-label="Grounding steps">
            {GROUNDING_STEPS.map(({ step, instruction, emoji }) => (
              <li
                key={step}
                className="flex items-start gap-3 text-lg leading-relaxed text-foreground"
              >
                <span
                  className="text-2xl shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  {emoji}
                </span>
                <span>
                  <strong className="text-primary">{step}.</strong>{' '}
                  {instruction}
                </span>
              </li>
            ))}
          </ol>
        </Card>

        {/* AI Response */}
        {(aiResponse || isStreaming) && (
          <Card
            ref={responseRef}
            className="p-6 border-2 border-primary bg-primary/5"
            role="alert"
            aria-live="assertive"
            aria-atomic="false"
            tabIndex={-1}
            aria-label="AI crisis guidance response"
          >
            <h2 className="text-lg font-bold mb-3 text-foreground">
              ⚓ AnchorAI is with you:
            </h2>
            <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
              {aiResponse}
              {isStreaming && (
                <span
                  className="inline-block w-2 h-5 bg-primary animate-pulse ml-1 align-middle"
                  aria-hidden="true"
                />
              )}
            </p>
            {!isStreaming && aiResponse && (
              <Button
                variant="outline"
                className="mt-4 min-h-[48px] text-base"
                onClick={replayAudio}
                aria-label="Replay voice guidance"
              >
                🔊 Replay Voice Guidance
              </Button>
            )}
          </Card>
        )}

        {/* Crisis Hotlines */}
        <section
          id="crisis-hotlines"
          className="space-y-3"
          aria-label="Emergency crisis hotlines"
        >
          <h2 className="text-xl font-bold text-foreground text-center">
            📞 Call For Help Now
          </h2>
          <div className="space-y-3">
            {CRISIS_HOTLINES.map((hotline) => (
              <a
                key={hotline.number}
                href={`tel:${hotline.number.replace(/-/g, '')}`}
                className="block"
                aria-label={`Call ${hotline.name} at ${hotline.number}, available ${hotline.available}`}
              >
                <Button
                  variant="destructive"
                  className="w-full min-h-[56px] text-lg font-bold px-6"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  📞 {hotline.name} — {hotline.number}
                </Button>
              </a>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            All hotlines available 24/7. Tap to call immediately.
          </p>
        </section>

        {/* Feeling better button */}
        <div className="pt-4 pb-8">
          <Link href="/chat" className="block">
            <Button
              variant="outline"
              className="w-full min-h-[56px] text-lg font-medium border-2"
              aria-label="I'm feeling better, return to chat"
            >
              ✅ I&apos;m Feeling Better — Go to Chat
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
