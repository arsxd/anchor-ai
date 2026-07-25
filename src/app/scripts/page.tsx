'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Volume2,
  VolumeX,
  RefreshCw,
  Copy,
  Share2,
  Check,
  PartyPopper,
  Briefcase,
  Users,
  Handshake,
  Waves,
  HeartCrack,
  PenLine,
  Send,
} from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';
import type { UserProfile, ScriptScenario } from '@/lib/types';

// Rich scenario data with icons and context
const SCENARIOS: {
  key: ScriptScenario;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  example: string;
}[] = [
  {
    key: 'party',
    label: 'Party Pressure',
    icon: PartyPopper,
    description: 'Someone offers you a drink or substance at a social event',
    example: '"Come on, one won\'t hurt..."',
  },
  {
    key: 'workplace',
    label: 'Work Event',
    icon: Briefcase,
    description: 'Happy hour, client dinner, or office celebration with alcohol',
    example: '"Why aren\'t you drinking?"',
  },
  {
    key: 'family',
    label: 'Family Gathering',
    icon: Users,
    description: 'Holiday dinner or reunion where substances are present',
    example: '"Everyone else is having some..."',
  },
  {
    key: 'friend',
    label: "Friend's Offer",
    icon: Handshake,
    description: 'A close friend pressures you or doesn\'t understand your boundaries',
    example: '"I thought you were over that phase"',
  },
  {
    key: 'craving',
    label: 'Intense Craving',
    icon: Waves,
    description: 'A powerful urge hits when you\'re alone — words to say to yourself',
    example: 'That voice in your head saying "just this once"',
  },
  {
    key: 'relapse',
    label: 'Near-Relapse',
    icon: HeartCrack,
    description: 'You\'re on the edge — this script talks you back from the brink',
    example: 'When your hand is already reaching...',
  },
];

export default function ScriptsPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScriptScenario | null>(null);
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [customScenario, setCustomScenario] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const scriptRef = useRef<HTMLDivElement>(null);

  const getProfile = (): UserProfile | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Auto-read aloud when script is complete
  useEffect(() => {
    if (script && !isLoading && autoSpeak && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [script, isLoading, autoSpeak]);

  const generateScript = useCallback(async (scenario: ScriptScenario) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Stop any current speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSelectedScenario(scenario);
    setScript('');
    setError(null);
    setIsLoading(true);
    setCopied(false);
    setShared(false);

    try {
      const profile = getProfile();
      const response = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, profile }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setScript(fullText);
      }

      // Scroll to script
      setTimeout(() => {
        scriptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateCustomScript = useCallback(async () => {
    if (!customScenario.trim() || isLoading) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSelectedScenario(null);
    setScript('');
    setError(null);
    setIsLoading(true);
    setCopied(false);
    setShared(false);

    try {
      const profile = getProfile();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a first-person emergency script for this specific situation: "${customScenario}". Write it as words I can say aloud to refuse, cope, or protect myself. Be concise, personal, and actionable. No headers or formatting — just the script.`,
          mode: 'calm',
          profile,
          recentMoods: [],
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Failed to generate script');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setScript(fullText);
      }

      setTimeout(() => scriptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [customScenario, isLoading]);

  const handleReadAloud = () => {
    if (!script) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async () => {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  const handleShare = async () => {
    if (!script) return;
    const scenarioLabel = selectedScenario ? SCENARIOS.find(s => s.key === selectedScenario)?.label : 'Emergency';
    const shareText = `[AnchorAI Script — ${scenarioLabel}]\n\n${script}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Emergency Script: ${scenarioLabel}`, text: shareText });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch { /* cancelled */ }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <main id="main-content" className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Emergency Scripts
          </h1>
          <p className="mt-1 text-muted-foreground">
            AI generates words for when you can&apos;t think. Tap a scenario — your script is read aloud automatically.
          </p>
        </div>

        {/* Auto-speak toggle */}
        <div className="mb-5 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Auto-read aloud</span>
          </label>
        </div>

        {/* Scenario Cards */}
        <section aria-label="Choose your scenario">
          <div className="grid gap-3 sm:grid-cols-2">
            {SCENARIOS.map(({ key, label, icon: Icon, description, example }) => (
              <button
                key={key}
                onClick={() => generateScript(key)}
                disabled={isLoading}
                aria-label={`Generate script for: ${label}`}
                aria-pressed={selectedScenario === key}
                className={`group text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                  selectedScenario === key
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                } ${isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 rounded-lg p-2 ${
                    selectedScenario === key ? 'bg-primary/10' : 'bg-secondary'
                  }`}>
                    <Icon className={`h-5 w-5 ${selectedScenario === key ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    <p className="text-xs italic text-muted-foreground/70 mt-1">{example}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Scenario */}
          <div className="mt-4 rounded-xl border-2 border-dashed border-border p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-lg p-2 bg-secondary">
                <PenLine className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-2">Custom Scenario</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customScenario}
                    onChange={(e) => setCustomScenario(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generateCustomScript()}
                    placeholder="Describe your situation..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    aria-label="Describe your custom scenario"
                    disabled={isLoading}
                  />
                  <Button
                    size="sm"
                    onClick={generateCustomScript}
                    disabled={!customScenario.trim() || isLoading}
                    aria-label="Generate script for custom scenario"
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  E.g. &quot;My ex texted me&quot; or &quot;I&apos;m alone on a Friday night&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Script Output */}
        {(script || isLoading || error) && (
          <div ref={scriptRef} className="mt-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Your Script</CardTitle>
                  {isSpeaking && (
                    <span className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                      Speaking...
                    </span>
                  )}
                </div>
                {selectedScenario && (
                  <p className="text-xs text-muted-foreground">
                    Say this out loud — or let AnchorAI read it for you.
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div
                  role="region"
                  aria-label="Your personalized emergency script"
                  aria-live="polite"
                  aria-busy={isLoading}
                  className="min-h-[100px] rounded-lg bg-secondary/50 p-5 border"
                >
                  {error ? (
                    <p className="text-destructive text-sm" role="alert">{error}</p>
                  ) : isLoading && !script ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Writing your personalized script...
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{script}</p>
                  )}
                </div>

                {/* Actions */}
                {script && !isLoading && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant={isSpeaking ? "default" : "outline"}
                      size="sm"
                      onClick={handleReadAloud}
                      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
                    >
                      {isSpeaking ? <><VolumeX className="h-4 w-4 mr-1.5" /> Stop</> : <><Volume2 className="h-4 w-4 mr-1.5" /> Read Aloud</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateScript(selectedScenario!)}>
                      <RefreshCw className="h-4 w-4 mr-1.5" /> New Version
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <><Check className="h-4 w-4 mr-1.5" /> Copied!</> : <><Copy className="h-4 w-4 mr-1.5" /> Copy</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      {shared ? <><Check className="h-4 w-4 mr-1.5" /> Shared!</> : <><Share2 className="h-4 w-4 mr-1.5" /> Share</>}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty state - before any scenario is selected */}
        {!script && !isLoading && !error && (
          <div className="mt-8 text-center py-8">
            <p className="text-sm text-muted-foreground">
              ↑ Tap a scenario above. Your personalized script will appear here and be read aloud automatically.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
