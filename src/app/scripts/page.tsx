'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SCRIPT_SCENARIOS, STORAGE_KEYS } from '@/lib/constants';
import type { UserProfile, ScriptScenario } from '@/lib/types';

export default function ScriptsPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScriptScenario | null>(null);
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getProfile = (): UserProfile | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const generateScript = useCallback(async (scenario: ScriptScenario) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSelectedScenario(scenario);
    setScript('');
    setError(null);
    setIsLoading(true);

    try {
      const profile = getProfile();
      const response = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, profile }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to generate script (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Display word-by-word from buffer
        const words = buffer.split(/(\s+)/);
        // Keep last partial word in buffer if chunk didn't end with space
        if (!chunk.endsWith(' ') && !chunk.endsWith('\n')) {
          buffer = words.pop() || '';
        } else {
          buffer = '';
        }

        const displayText = words.join('');
        if (displayText) {
          setScript((prev) => prev + displayText);
        }
      }

      // Flush remaining buffer
      if (buffer) {
        setScript((prev) => prev + buffer);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegenerate = () => {
    if (selectedScenario) {
      generateScript(selectedScenario);
    }
  };

  const handleReadAloud = () => {
    if (!script) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async () => {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script);
    } catch {
      // Fallback: select text for manual copy
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Emergency Script Generator
        </h1>
        <p className="mb-8 text-muted-foreground">
          Choose a scenario to generate a personalized script for handling difficult situations.
        </p>

        {/* Scenario Selection */}
        <section aria-label="Scenario selection">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Select a scenario
          </h2>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(Object.entries(SCRIPT_SCENARIOS) as [ScriptScenario, { label: string; emoji: string }][]).map(
              ([key, { label, emoji }]) => (
                <Button
                  key={key}
                  variant={selectedScenario === key ? 'default' : 'outline'}
                  size="lg"
                  className="h-auto flex-col gap-1 py-3"
                  onClick={() => generateScript(key)}
                  aria-label={`Generate script for ${label} scenario`}
                  aria-pressed={selectedScenario === key}
                  disabled={isLoading}
                >
                  <span className="text-xl" aria-hidden="true">
                    {emoji}
                  </span>
                  <span className="text-xs">{label}</span>
                </Button>
              )
            )}
          </div>
        </section>

        {/* Script Output */}
        {(script || isLoading || error) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedScenario && (
                  <span aria-hidden="true">
                    {SCRIPT_SCENARIOS[selectedScenario].emoji}
                  </span>
                )}
                {selectedScenario
                  ? SCRIPT_SCENARIOS[selectedScenario].label
                  : 'Generated Script'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                role="region"
                aria-label="Generated script output"
                aria-live="polite"
                aria-atomic="false"
                aria-busy={isLoading}
                className="min-h-[120px] rounded-lg bg-muted/50 p-4"
              >
                {error ? (
                  <p className="text-destructive" role="alert">
                    {error}
                  </p>
                ) : isLoading && !script ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                    <span>Generating your script…</span>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{script}</p>
                )}
              </div>

              {/* Action Buttons */}
              {script && !isLoading && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReadAloud}
                    aria-label={isSpeaking ? 'Stop reading aloud' : 'Read script aloud'}
                  >
                    {isSpeaking ? '⏹ Stop' : '🔊 Read Aloud'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    aria-label="Regenerate script"
                  >
                    🔄 Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    aria-label="Copy script to clipboard"
                  >
                    📋 Copy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
