"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { MoodEntry, UserProfile } from "@/lib/types";
import { MOOD_CONFIG } from "@/lib/types";
import { detectRiskPattern } from "@/services/insight-service";

export default function ProgressPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const storedProfile = localStorage.getItem("anchor_user_profile");
    const storedMoods = localStorage.getItem("anchor_mood_history");
    if (storedProfile) setProfile(JSON.parse(storedProfile));
    if (storedMoods) setMoodHistory(JSON.parse(storedMoods));
  }, []);

  const riskAssessment = detectRiskPattern(moodHistory);
  const totalCheckins = moodHistory.length;
  const avgScore = totalCheckins > 0
    ? (moodHistory.reduce((sum, m) => sum + m.score, 0) / totalCheckins).toFixed(1)
    : "—";
  const mostFrequentMood = getMostFrequent(moodHistory);
  const streakDays = calculateStreak(moodHistory);

  async function generateAnalysis() {
    if (moodHistory.length === 0) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analyze my recovery progress. Here's my data:
- Total check-ins: ${totalCheckins}
- Average mood score: ${avgScore}/10
- Most frequent mood: ${mostFrequentMood}
- Current trend: ${riskAssessment.recentTrend}
- Risk level: ${riskAssessment.riskLevel}
- Pattern: ${riskAssessment.patternDescription}
- Check-in streak: ${streakDays} days

Give me a brief, personalized progress report (4-5 sentences). Highlight what's going well, what to watch for, and one specific action for this week. Be warm but honest.`,
          mode: "calm",
          profile,
          recentMoods: moodHistory.slice(-10),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setAiAnalysis(text);
        }
      }
    } catch {
      setAiAnalysis("Unable to generate analysis right now. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <a href="#progress-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to content
      </a>

      <div className="max-w-3xl mx-auto space-y-6" id="progress-content">
        <header className="text-center">
          <h1 className="text-2xl font-bold">Recovery Progress</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile ? `${profile.name}'s journey` : "Your journey"} · AI-powered insights
          </p>
        </header>

        {totalCheckins === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <p className="text-muted-foreground mb-4">No check-in data yet. Start tracking to see your progress.</p>
              <Link href="/checkin">
                <Button>Start First Check-In →</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Check-ins" value={String(totalCheckins)} icon="📊" />
              <StatCard label="Avg Mood" value={`${avgScore}/10`} icon="💭" />
              <StatCard label="Streak" value={`${streakDays}d`} icon="🔥" />
              <StatCard label="Trend" value={riskAssessment.recentTrend} icon={riskAssessment.recentTrend === "improving" ? "📈" : riskAssessment.recentTrend === "declining" ? "📉" : "➡️"} />
            </div>

            {/* Risk Assessment */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Current Assessment</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      riskAssessment.riskLevel === "low" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      riskAssessment.riskLevel === "elevated" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {riskAssessment.riskLevel} risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{riskAssessment.patternDescription}</p>
                {riskAssessment.shouldIntervene && (
                  <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-400 font-medium">⚠️ Pattern detected — consider reaching out to your support network</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mood Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Moods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {moodHistory.slice(-14).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 min-w-[48px]"
                      title={`${MOOD_CONFIG[entry.mood]?.label} — ${new Date(entry.timestamp).toLocaleDateString()}`}
                    >
                      <span className="text-lg">{MOOD_CONFIG[entry.mood]?.emoji}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">🧠 AI Progress Analysis</CardTitle>
                  <Button
                    size="sm"
                    onClick={generateAnalysis}
                    disabled={isAnalyzing}
                    aria-label="Generate AI progress analysis"
                  >
                    {isAnalyzing ? "Analyzing..." : "Generate Insight"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {aiAnalysis ? (
                  <div className="text-sm leading-relaxed" role="status" aria-live="polite">
                    <p className="whitespace-pre-wrap">{aiAnalysis}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tap &quot;Generate Insight&quot; for a personalized AI analysis of your recovery progress based on your check-in history.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/checkin">
                <Button variant="outline" className="w-full h-14">
                  📊 New Check-In
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" className="w-full h-14">
                  🤖 Talk to AI
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Card className="text-center p-4">
      <span className="text-xl" aria-hidden="true">{icon}</span>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function getMostFrequent(moods: MoodEntry[]): string {
  if (moods.length === 0) return "—";
  const counts: Record<string, number> = {};
  moods.forEach((m) => { counts[m.mood] = (counts[m.mood] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? `${MOOD_CONFIG[top[0] as keyof typeof MOOD_CONFIG]?.emoji || ""} ${top[0]}` : "—";
}

function calculateStreak(moods: MoodEntry[]): number {
  if (moods.length === 0) return 0;
  const sorted = [...moods].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].timestamp);
    const curr = new Date(sorted[i].timestamp);
    const diffDays = Math.floor((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays <= 1) streak++;
    else break;
  }
  return streak;
}
