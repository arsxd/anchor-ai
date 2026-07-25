"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { detectRiskPattern } from "@/services/insight-service";
import type { MoodEntry, RiskAssessment, UserProfile } from "@/lib/types";

const MOOD_EMOJI_MAP: Record<string, string> = {
  anxious: "😰",
  sad: "😔",
  frustrated: "😤",
  calm: "😌",
  happy: "🥳",
  determined: "💪",
  tired: "😴",
  craving: "🌊",
};

export default function CaregiverPage() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [guidanceText, setGuidanceText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRequest, setActiveRequest] = useState<"guidance" | "deescalation" | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("anchor_mood_history");
      if (stored) {
        const parsed: MoodEntry[] = JSON.parse(stored);
        setMoodHistory(parsed);
        const assessment = detectRiskPattern(parsed);
        setRiskAssessment(assessment);
      } else {
        setRiskAssessment(detectRiskPattern([]));
      }
    } catch {
      setError("Unable to load mood history data.");
      setRiskAssessment(detectRiskPattern([]));
    }
  }, []);

  const fetchCaregiverResponse = useCallback(
    async (requestType: "guidance" | "deescalation") => {
      setIsLoading(true);
      setError("");
      setGuidanceText("");
      setActiveRequest(requestType);

      try {
        const profileRaw = localStorage.getItem("anchor_user_profile");
        const profile: UserProfile | null = profileRaw ? JSON.parse(profileRaw) : null;

        const res = await fetch("/api/caregiver", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moodHistory,
            profile,
            requestType,
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        if (data.success && data.data) {
          setGuidanceText(data.data);
        } else if (data.error) {
          setError(data.error);
        } else {
          setGuidanceText(typeof data === "string" ? data : JSON.stringify(data));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setIsLoading(false);
        setActiveRequest(null);
      }
    },
    [moodHistory]
  );

  const last7Entries = moodHistory.slice(-7);
  const showAlert =
    riskAssessment?.riskLevel === "elevated" || riskAssessment?.riskLevel === "high";

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 max-w-4xl mx-auto">
      <a
        href="#guidance-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to guidance section
      </a>

      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">💙 Caregiver Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor wellbeing and get AI-powered support guidance
            </p>
          </div>
          <Link href="/" aria-label="Back to home">
            <Button variant="outline" size="sm">
              ⚓ Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Risk Alert Banner */}
      {showAlert && (
        <div
          role="alert"
          aria-live="assertive"
          className={`mb-6 p-4 rounded-lg border-l-4 ${
            riskAssessment?.riskLevel === "high"
              ? "bg-red-50 border-red-500 text-red-900 dark:bg-red-950 dark:text-red-100"
              : "bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950 dark:text-amber-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-lg">
              {riskAssessment?.riskLevel === "high" ? "🚨" : "⚠️"}
            </span>
            <strong>
              {riskAssessment?.riskLevel === "high"
                ? "High Risk Detected"
                : "Elevated Risk Detected"}
            </strong>
          </div>
          <p className="mt-1 text-sm">{riskAssessment?.patternDescription}</p>
          {riskAssessment?.riskLevel === "high" && (
            <p className="mt-2 text-sm font-medium">
              Consider reaching out directly or consulting professional resources.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mood Trend Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loved One&apos;s Mood Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {last7Entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No mood entries recorded yet. Encourage your loved one to check in.
              </p>
            ) : (
              <ul
                className="space-y-2"
                aria-label="Last 7 mood entries"
              >
                {last7Entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-lg">
                        {MOOD_EMOJI_MAP[entry.mood] || "❓"}
                      </span>
                      <span className="capitalize">{entry.mood}</span>
                    </span>
                    <time
                      dateTime={entry.timestamp}
                      className="text-muted-foreground text-xs"
                    >
                      {new Date(entry.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Risk Level Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            {riskAssessment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      riskAssessment.riskLevel === "high"
                        ? "destructive"
                        : riskAssessment.riskLevel === "elevated"
                          ? "secondary"
                          : "default"
                    }
                    aria-label={`Risk level: ${riskAssessment.riskLevel}`}
                    className="text-sm px-3 py-1"
                  >
                    {riskAssessment.riskLevel === "high" && "🔴 "}
                    {riskAssessment.riskLevel === "elevated" && "🟡 "}
                    {riskAssessment.riskLevel === "low" && "🟢 "}
                    {riskAssessment.riskLevel.charAt(0).toUpperCase() +
                      riskAssessment.riskLevel.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    aria-label={`Trend: ${riskAssessment.recentTrend}`}
                  >
                    {riskAssessment.recentTrend === "improving" && "📈 "}
                    {riskAssessment.recentTrend === "declining" && "📉 "}
                    {riskAssessment.recentTrend === "stable" && "➡️ "}
                    {riskAssessment.recentTrend.charAt(0).toUpperCase() +
                      riskAssessment.recentTrend.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {riskAssessment.patternDescription}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Analyzing...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guidance Section */}
      <section id="guidance-section" className="mt-6" aria-labelledby="guidance-heading">
        <Card>
          <CardHeader>
            <CardTitle id="guidance-heading" className="text-lg">
              AI-Powered Caregiver Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => fetchCaregiverResponse("guidance")}
                disabled={isLoading}
                aria-label="Get AI guidance for supporting your loved one"
              >
                {isLoading && activeRequest === "guidance" ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    Loading...
                  </span>
                ) : (
                  "💡 Get Guidance"
                )}
              </Button>
              <Button
                onClick={() => fetchCaregiverResponse("deescalation")}
                disabled={isLoading}
                variant="secondary"
                aria-label="Get a de-escalation script for difficult moments"
              >
                {isLoading && activeRequest === "deescalation" ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    Loading...
                  </span>
                ) : (
                  "🕊️ De-escalation Script"
                )}
              </Button>
            </div>

            {/* AI Response Area */}
            <div
              role="region"
              aria-live="polite"
              aria-atomic="true"
              aria-label="AI-generated guidance response"
              className="min-h-[60px]"
            >
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-md bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 text-sm"
                >
                  <p>
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}
              {guidanceText && (
                <div className="p-4 rounded-md bg-muted border text-sm whitespace-pre-wrap leading-relaxed">
                  {guidanceText}
                </div>
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
                  <span
                    className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  <span>Generating personalized guidance...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Your Wellbeing Section */}
      <section className="mt-6" aria-labelledby="wellbeing-heading">
        <Card>
          <CardHeader>
            <CardTitle id="wellbeing-heading" className="text-lg">
              Your Wellbeing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Caring for someone in recovery can be emotionally demanding. You deserve
              support too.
            </p>
            <Link href="/chat?mode=caregiver" aria-label="Open caregiver support chat">
              <Button variant="outline" className="w-full sm:w-auto">
                💬 Talk to AnchorAI (Caregiver Mode)
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
