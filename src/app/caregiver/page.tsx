"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { detectRiskPattern } from "@/services/insight-service";
import { MOOD_CONFIG } from "@/lib/types";
import type { MoodEntry, RiskAssessment, UserProfile } from "@/lib/types";

export default function CaregiverPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<{ id: string; text: string; mood?: string; timestamp: string }[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [aiGuidance, setAiGuidance] = useState("");
  const [aiStatus, setAiStatus] = useState("");
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    const storedProfile = localStorage.getItem("anchor_user_profile");
    const storedMoods = localStorage.getItem("anchor_mood_history");
    const storedJournal = localStorage.getItem("anchor_journal");

    if (storedProfile) setProfile(JSON.parse(storedProfile));

    if (storedMoods) {
      const moods: MoodEntry[] = JSON.parse(storedMoods);
      setMoodHistory(moods);
      setRiskAssessment(detectRiskPattern(moods));
    } else {
      setRiskAssessment(detectRiskPattern([]));
    }

    if (storedJournal) {
      try { setJournalEntries(JSON.parse(storedJournal)); } catch { /* silent */ }
    }
  }, []);

  async function fetchStatus() {
    setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/caregiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodHistory,
          profile,
          requestType: "guidance",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data.success) setAiStatus(data.data.guidance);
    } catch {
      setAiStatus("");
    } finally {
      setIsLoadingStatus(false);
    }
  }

  // Generate AI status summary on load when data exists
  useEffect(() => {
    if (moodHistory.length > 0 && !aiStatus) {
      fetchStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moodHistory]);

  const fetchGuidance = useCallback(
    async (requestType: "guidance" | "deescalation") => {
      setIsLoadingGuidance(true);
      setAiGuidance("");
      try {
        const res = await fetch("/api/caregiver", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moodHistory, profile, requestType }),
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (data.success) setAiGuidance(data.data.guidance);
      } catch {
        setAiGuidance("Unable to generate guidance right now.");
      } finally {
        setIsLoadingGuidance(false);
      }
    },
    [moodHistory, profile]
  );

  const patientName = profile?.name || "Your loved one";
  const latestMood = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1] : null;

  return (
    <main className="min-h-screen bg-background p-4">
      <a href="#caregiver-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to content
      </a>

      <div className="max-w-3xl mx-auto space-y-6" id="caregiver-content">
        <header className="text-center">
          <h1 className="text-2xl font-bold">Caregiver Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Supporting {patientName}&apos;s recovery journey
          </p>
        </header>

        {/* Current Status Banner */}
        <Card className={
          riskAssessment?.riskLevel === "high" ? "border-red-500/30 bg-red-500/5" :
          riskAssessment?.riskLevel === "elevated" ? "border-yellow-500/30 bg-yellow-500/5" :
          "border-green-500/30 bg-green-500/5"
        }>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Status</span>
              {riskAssessment && (
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
              )}
            </div>
            {latestMood ? (
              <p className="text-sm text-muted-foreground">
                <span className="text-lg mr-1">{MOOD_CONFIG[latestMood.mood]?.emoji}</span>
                {patientName} last checked in feeling <strong className="text-foreground">{latestMood.mood}</strong>
                {" · "}
                {formatTimeAgo(latestMood.timestamp)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No check-in data yet</p>
            )}
            {journalEntries.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2 italic border-l-2 border-primary/30 pl-2">
                &ldquo;{journalEntries[journalEntries.length - 1].text}&rdquo;
                <span className="text-xs ml-1">· {formatTimeAgo(journalEntries[journalEntries.length - 1].timestamp)}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Severity-Based Notifications */}
        {riskAssessment && riskAssessment.riskLevel !== "low" && (
          <Card className={riskAssessment.riskLevel === "high" ? "border-red-500/50 bg-red-500/10" : "border-yellow-500/40 bg-yellow-500/10"} role="alert">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0" aria-hidden="true">
                  {riskAssessment.riskLevel === "high" ? "🚨" : "⚠️"}
                </span>
                <div>
                  <p className="font-semibold text-sm">
                    {riskAssessment.riskLevel === "high"
                      ? "Immediate attention recommended"
                      : "Elevated concern — stay attentive"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {riskAssessment.patternDescription}
                  </p>
                  <div className="mt-3 space-y-2">
                    {riskAssessment.riskLevel === "high" ? (
                      <>
                        <SuggestedAction icon="📞" text={`Call ${patientName} now — a check-in call can interrupt a crisis`} priority="high" />
                        <SuggestedAction icon="🏥" text="Consider contacting their therapist or counselor" priority="high" />
                        <SuggestedAction icon="🏠" text="If possible, be physically present with them" priority="medium" />
                      </>
                    ) : (
                      <>
                        <SuggestedAction icon="💬" text={`Send ${patientName} a supportive text — "thinking of you"`} priority="medium" />
                        <SuggestedAction icon="📅" text="Plan a low-pressure activity together this week" priority="low" />
                        <SuggestedAction icon="👁️" text="Monitor check-ins more closely for the next 48 hours" priority="medium" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* When things are good — positive reinforcement */}
        {riskAssessment?.riskLevel === "low" && moodHistory.length >= 3 && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0" aria-hidden="true">✅</span>
                <div>
                  <p className="font-semibold text-sm">Things are looking stable</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {patientName}&apos;s mood trend is {riskAssessment.recentTrend}. Keep doing what you&apos;re doing.
                  </p>
                  <div className="mt-3 space-y-2">
                    <SuggestedAction icon="🎉" text={`Acknowledge ${patientName}'s progress — recognition matters`} priority="low" />
                    <SuggestedAction icon="💚" text="Take time for YOUR self-care today" priority="medium" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Status Summary */}
        {(aiStatus || isLoadingStatus) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">🧠 AI Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStatus ? (
                <div className="h-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-sm leading-relaxed" role="status" aria-live="polite">{aiStatus}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📋 Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {moodHistory.length === 0 && journalEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activity yet. When {patientName} uses AnchorAI, their check-ins will appear here.
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {buildTimeline(moodHistory, journalEntries).slice(0, 20).map((item) => (
                  item.type === 'mood' ? (
                    <TimelineEntry key={item.id} entry={item.data as MoodEntry} />
                  ) : (
                    <JournalTimelineEntry key={item.id} entry={item.data as { text: string; timestamp: string; mood?: string }} />
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guidance Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💙 What Should I Do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => fetchGuidance("guidance")}
                disabled={isLoadingGuidance || moodHistory.length === 0}
                aria-label="Get AI guidance on what to say"
              >
                What to say right now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchGuidance("deescalation")}
                disabled={isLoadingGuidance || moodHistory.length === 0}
                aria-label="Get de-escalation script"
              >
                De-escalation script
              </Button>
            </div>
            {isLoadingGuidance && (
              <div className="h-20 bg-muted animate-pulse rounded" />
            )}
            {aiGuidance && !isLoadingGuidance && (
              <div className="p-4 rounded-lg bg-muted space-y-4" role="status" aria-live="polite">
                {parseGuidanceSections(aiGuidance).map((section, i) => (
                  <div key={i} className="space-y-1.5">
                    <p className="font-semibold text-sm text-foreground">{section.header}</p>
                    {section.lines.map((line, j) => (
                      <p
                        key={j}
                        className={`text-sm leading-relaxed ${
                          line.trim().startsWith('•') || line.trim().startsWith('-')
                            ? 'pl-3 text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Wellbeing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💚 Your Wellbeing Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Caregiver burnout is real. You can&apos;t pour from an empty cup.
            </p>
            <Link href="/chat?mode=caregiver">
              <Button variant="outline" className="w-full" aria-label="Start caregiver check-in chat">
                Start My Check-In →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function TimelineEntry({ entry }: { entry: MoodEntry }) {
  const moodConfig = MOOD_CONFIG[entry.mood];
  const score = entry.score;
  const isDistress = score <= 3;

  return (
    <div className={`flex gap-3 items-start p-3 rounded-lg ${isDistress ? "bg-red-500/5 border border-red-500/10" : "bg-muted/30"}`}>
      <div className="text-2xl shrink-0" aria-hidden="true">
        {moodConfig?.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium capitalize">{entry.mood}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTimeAgo(entry.timestamp)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${score >= 7 ? "bg-green-500" : score >= 4 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${score * 10}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{score}/10</span>
        </div>
        {entry.aiInsight && (
          <p className="text-xs text-muted-foreground mt-1 italic">{entry.aiInsight}</p>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SuggestedAction({ icon, text, priority }: { icon: string; text: string; priority: "high" | "medium" | "low" }) {
  return (
    <div className={`flex items-center gap-2 text-sm p-2 rounded ${
      priority === "high" ? "bg-red-500/10" :
      priority === "medium" ? "bg-muted/50" : "bg-muted/30"
    }`}>
      <span aria-hidden="true">{icon}</span>
      <span className={priority === "high" ? "font-medium" : ""}>{text}</span>
    </div>
  );
}

/**
 * Parses AI guidance text into structured sections by emoji headers.
 * Handles both newline-separated and single-line responses.
 */
function parseGuidanceSections(text: string): { header: string; lines: string[] }[] {
  // Split by emoji headers (🫂 ✅ 🚫 💡 ⚠️)
  const headerPattern = /([🫂✅🚫💡⚠️]\s*[^🫂✅🚫💡⚠️]*)/g;
  const matches = text.match(headerPattern);

  if (!matches || matches.length === 0) {
    // Fallback: just show as plain text
    return [{ header: '', lines: [text] }];
  }

  return matches.map((section) => {
    const trimmed = section.trim();
    // Split into header (first line/sentence before : or first bullet) and content
    const colonIdx = trimmed.indexOf(':');
    let header: string;
    let content: string;

    if (colonIdx > 0 && colonIdx < 40) {
      header = trimmed.substring(0, colonIdx + 1).trim();
      content = trimmed.substring(colonIdx + 1).trim();
    } else {
      // No colon — first sentence is header
      const firstDot = trimmed.indexOf('.');
      if (firstDot > 0 && firstDot < 60) {
        header = trimmed.substring(0, firstDot + 1).trim();
        content = trimmed.substring(firstDot + 1).trim();
      } else {
        header = trimmed;
        content = '';
      }
    }

    // Split content into lines by bullet points or newlines
    const lines: string[] = [];
    if (content) {
      // Split by bullet points
      const parts = content.split(/(?=•)|(?=-\s)/);
      for (const part of parts) {
        const cleaned = part.trim();
        if (cleaned) lines.push(cleaned);
      }
    }

    return { header, lines };
  });
}

function buildTimeline(
  moods: MoodEntry[],
  journals: { id: string; text: string; timestamp: string; mood?: string }[]
): { id: string; type: 'mood' | 'journal'; timestamp: string; data: MoodEntry | { text: string; timestamp: string; mood?: string } }[] {
  const items = [
    ...moods.map((m) => ({ id: m.id, type: 'mood' as const, timestamp: m.timestamp, data: m })),
    ...journals.map((j) => ({ id: j.id, type: 'journal' as const, timestamp: j.timestamp, data: j })),
  ];
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function JournalTimelineEntry({ entry }: { entry: { text: string; timestamp: string; mood?: string } }) {
  return (
    <div className="flex gap-3 items-start p-3 rounded-lg bg-primary/5 border border-primary/10">
      <div className="text-lg shrink-0" aria-hidden="true">📝</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Shared a thought</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTimeAgo(entry.timestamp)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 italic">&ldquo;{entry.text}&rdquo;</p>
      </div>
    </div>
  );
}
