'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, Calendar, Heart } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';
import { detectRiskPattern } from '@/services/insight-service';
import type { MoodEntry, UserProfile } from '@/lib/types';

/**
 * PersonalizedInsight — appears on homepage for returning users.
 * Uses their profile + mood history to show AI-generated motivational content.
 * The user doesn't realize AI is working behind the scenes — it just feels personal.
 */
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

  useEffect(() => {
    // Load user data
    try {
      const profileRaw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const moodRaw = localStorage.getItem(STORAGE_KEYS.MOOD_HISTORY);

      if (!profileRaw) {
        setLoading(false);
        return; // New user, don't show
      }

      const userProfile: UserProfile = JSON.parse(profileRaw);
      setProfile(userProfile);

      const moodHistory: MoodEntry[] = moodRaw ? JSON.parse(moodRaw) : [];

      // Calculate stats
      const daysInRecovery = Math.floor(
        (Date.now() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalCheckins = moodHistory.length;
      const streak = calculateStreak(moodHistory);
      const risk = detectRiskPattern(moodHistory);

      setStats({
        streak,
        totalCheckins,
        trend: risk.recentTrend,
        daysInRecovery: Math.max(1, daysInRecovery),
      });

      // Fetch AI insight based on their data
      if (moodHistory.length > 0) {
        fetchInsight(userProfile, moodHistory);
      } else {
        setInsight(`Welcome back, ${userProfile.name}. Remember: "${userProfile.myWhy}" — that's your anchor.`);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
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
        setInsight(data.data?.insight || data.insight || `Keep going, ${userProfile.name}. You're stronger than you know.`);
      } else {
        setInsight(`Welcome back, ${userProfile.name}. Your "why" matters: "${userProfile.myWhy}"`);
      }
    } catch {
      setInsight(`Welcome back, ${userProfile.name}. Every day you choose recovery is a victory.`);
    } finally {
      setLoading(false);
    }
  }

  // Don't render for new users
  if (!profile && !loading) return null;
  if (loading && !profile) return null;

  return (
    <section className="relative container mx-auto px-4 pb-8" aria-label="Your personalized insight">
      <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
        <CardContent className="p-5">
          {/* Stats row */}
          {stats && (
            <div className="flex items-center gap-4 mb-4 text-sm">
              {stats.daysInRecovery > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span><strong className="text-foreground">{stats.daysInRecovery}</strong> days</span>
                </div>
              )}
              {stats.totalCheckins > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Heart className="h-3.5 w-3.5 text-primary" />
                  <span><strong className="text-foreground">{stats.totalCheckins}</strong> check-ins</span>
                </div>
              )}
              {stats.streak > 1 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span><strong className="text-foreground">{stats.streak}</strong> day streak</span>
                </div>
              )}
            </div>
          )}

          {/* AI Insight */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              {loading ? (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Preparing your personalized insight...
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-foreground">
                  {insight}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
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
    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
