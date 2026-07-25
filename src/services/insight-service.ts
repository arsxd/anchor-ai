import type { MoodEntry, RiskAssessment } from "@/lib/types";

/**
 * Analyzes mood history to detect risk patterns and determine if proactive intervention is needed.
 * This is the "prevention" engine — identifies declining trends before crisis hits.
 */
export function detectRiskPattern(moodHistory: MoodEntry[]): RiskAssessment {
  if (moodHistory.length === 0) {
    return {
      riskLevel: "low",
      shouldIntervene: false,
      patternDescription: "No mood data available yet.",
      recentTrend: "stable",
    };
  }

  const recent = moodHistory.slice(-5);
  const negativeCount = recent.filter((m) => m.score <= 3).length;
  const avgScore = recent.reduce((sum, m) => sum + m.score, 0) / recent.length;
  const trend = calculateTrend(recent);

  let riskLevel: RiskAssessment["riskLevel"] = "low";
  let shouldIntervene = false;

  if (negativeCount >= 4 || avgScore <= 2.5) {
    riskLevel = "high";
    shouldIntervene = true;
  } else if (negativeCount >= 3 || avgScore <= 3.5 || trend === "declining") {
    riskLevel = "elevated";
    shouldIntervene = true;
  }

  const patternDescription = buildPatternDescription(recent, negativeCount, avgScore, trend);

  return {
    riskLevel,
    shouldIntervene,
    patternDescription,
    recentTrend: trend,
  };
}

/**
 * Calculates the mood trend from recent entries.
 */
export function calculateTrend(
  entries: MoodEntry[]
): "improving" | "stable" | "declining" {
  if (entries.length < 2) return "stable";

  const firstHalf = entries.slice(0, Math.ceil(entries.length / 2));
  const secondHalf = entries.slice(Math.ceil(entries.length / 2));

  const firstAvg = firstHalf.reduce((sum, m) => sum + m.score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, m) => sum + m.score, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 1) return "improving";
  if (diff < -1) return "declining";
  return "stable";
}

/**
 * Generates a human-readable description of the detected pattern.
 * This is fed to Gemini for personalized prevention messaging.
 */
function buildPatternDescription(
  entries: MoodEntry[],
  negativeCount: number,
  avgScore: number,
  trend: "improving" | "stable" | "declining"
): string {
  const parts: string[] = [];

  if (trend === "declining") {
    parts.push("Mood has been declining over recent check-ins.");
  }

  if (negativeCount >= 3) {
    parts.push(`${negativeCount} out of last ${entries.length} check-ins were in distress range.`);
  }

  const moods = entries.map((e) => e.mood);
  const cravingCount = moods.filter((m) => m === "craving").length;
  if (cravingCount >= 2) {
    parts.push("Multiple craving episodes detected recently.");
  }

  const anxiousCount = moods.filter((m) => m === "anxious").length;
  if (anxiousCount >= 2) {
    parts.push("Recurring anxiety noted.");
  }

  if (parts.length === 0) {
    parts.push(`Average mood score: ${avgScore.toFixed(1)}/10. Trend: ${trend}.`);
  }

  return parts.join(" ");
}
