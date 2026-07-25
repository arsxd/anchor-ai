'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Calendar, Heart, Send, PenLine } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';
import { detectRiskPattern } from '@/services/insight-service';
import type { MoodEntry, UserProfile } from '@/lib/types';

export function PersonalizedInsight() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    streak: number;
    totalCheckins: number;
    trend: string;
    daysInRecovery: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [journalInput, setJournalInput] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);
  const [journalInsight, setJournalInsight] = useState<string | null>(null);
  const [journalLoading, setJournalLoading] = useState(false);

  useEffect(() => {
    try {
      const profileRaw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const moodRaw = localStorage.getItem(STORAGE_KEYS.MOOD_HISTORY);

      if (!profileRaw) { setLoading(false); return; }

      const userProfile: UserProfile = JSON.parse(profileRaw);
      setProfile(userProfile);

      const moodHistory: MoodEntry[] = moodRaw ? JSON.parse(moodRaw) : [];

      const daysInRecovery = Math.max(1, Math.floor(
        (Date.now() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ));
      const totalCheckins = moodHistory.length;
      const streak = calculateStreak(moodHistory);
      const risk = detectRiskPattern(moodHistory);

      setStats({ streak, totalCheckins, trend: risk.recentTrend, daysInRecovery });

      if (moodHistory.length > 0) {
        fetchInsight(userProfile, moodHistory);
      } else {
        setInsight(`${userProfile.name}, your anchor: "${userProfile.myWhy}"`);
        setLoading(false);
      }
    } catch { setLoading(false); }
  }, []);

  async function fetchInsight(userProfile: UserProfile, moodHistory: MoodEntry[]) {
    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMood: moodHistory[moodHistory.length - 1]?.mood || 'calm',
          currentScore: moodHistory[moodHistory.length - 1]?.score || 5,
          moodHistory,
          profile: userProfile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsight(data.data?.insight || data.insight || `Keep going, ${userProfile.name}.`);
      } else {
        setInsight(`${userProfile.name}, remember: "${userProfile.myWhy}"`);
      }
    } catch {
      setInsight(`Every day is progress, ${userProfile?.name}.`);
    } finally { setLoading(false); }
  }

  async function handleJournalSubmit() {
    if (!journalInput.trim() || journalLoading) return;

    setJournalLoading(true);
    setJournalInsight(null);

    // Save to localStorage as a journal entry
    try {
      const existing = JSON.parse(localStorage.getItem('anchor_journal') || '[]');
      existing.push({
        id: crypto.randomUUID(),
        text: journalInput.trim(),
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('anchor_journal', JSON.stringify(existing.slice(-50)));
    } catch { /* silent */ }

    // Get AI response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `The user just logged this feeling: "${journalInput}". Respond in ONE short sentence (max 15 words) — acknowledge it warmly and give one tiny actionable nudge. No questions.`,
          mode: 'journal',
          profile,
          recentMoods: [],
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let text = '';
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
          }
        }
        setJournalInsight(text);
      }
    } catch { /* silent */ }

    setJournalSaved(true);
    setJournalInput('');
    setJournalLoading(false);
    setTimeout(() => setJournalSaved(false), 5000);
  }

  if (!profile && !loading) return null;
  if (loading && !profile) return null;

  return (
    <section className="relative container mx-auto px-4 pb-6" aria-label="Your personalized insight">
      <div className="max-w-2xl mx-auto space-y-3">
        {/* AI Insight Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            {/* Stats row */}
            {stats && (
              <div className="flex items-center gap-4 mb-3 text-xs">
                {stats.daysInRecovery > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3 text-primary" />
                    <strong className="text-foreground">{stats.daysInRecovery}</strong> days
                  </span>
                )}
                {stats.totalCheckins > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="h-3 w-3 text-primary" />
                    <strong className="text-foreground">{stats.totalCheckins}</strong> check-ins
                  </span>
                )}
                {stats.streak > 1 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <strong className="text-foreground">{stats.streak}</strong> streak
                  </span>
                )}
              </div>
            )}

            {/* Insight — displayed as two short lines */}
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              {loading ? (
                <p className="text-sm text-muted-foreground animate-pulse">...</p>
              ) : (
                <div className="text-sm leading-relaxed">
                  {insight?.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} className={i === 0 ? 'font-medium text-foreground' : 'text-muted-foreground mt-1'}>
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Journal Log */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PenLine className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Quick log — how are you right now?</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={journalInput}
                onChange={(e) => setJournalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJournalSubmit()}
                placeholder="Feeling anxious about tonight..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                disabled={journalLoading}
              />
              <Button
                size="sm"
                onClick={handleJournalSubmit}
                disabled={!journalInput.trim() || journalLoading}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* AI response to journal */}
            {journalInsight && (
              <p className="mt-2.5 text-sm text-primary flex items-start gap-1.5">
                <Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                {journalInsight}
              </p>
            )}
            {journalSaved && !journalInsight && (
              <p className="mt-2 text-xs text-muted-foreground">✓ Logged. AI is tracking your patterns.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function calculateStreak(moodHistory: MoodEntry[]): number {
  if (moodHistory.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const sorted = [...moodHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const seen = new Set<string>();
  for (const entry of sorted) {
    const date = new Date(entry.timestamp);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString();
    if (seen.has(key)) continue;
    seen.add(key);

    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === streak) { streak++; } else { break; }
  }
  return streak;
}
