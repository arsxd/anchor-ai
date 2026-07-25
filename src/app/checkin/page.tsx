'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, PenLine, Sparkles } from 'lucide-react'
import { MOOD_CONFIG, type MoodType, type MoodEntry, type RiskAssessment } from '@/lib/types'

interface InsightResponse {
  insight: string
  riskAssessment: RiskAssessment
}

export default function CheckInPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [insight, setInsight] = useState<InsightResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentHistory, setRecentHistory] = useState<MoodEntry[]>([])
  const [showInsight, setShowInsight] = useState(false)
  const [journalInput, setJournalInput] = useState('')
  const [journalInsight, setJournalInsight] = useState<string | null>(null)
  const [journalLoading, setJournalLoading] = useState(false)

  function loadRecentHistory() {
    try {
      const stored = localStorage.getItem('anchor_mood_history')
      if (stored) {
        const history: MoodEntry[] = JSON.parse(stored)
        setRecentHistory(history.slice(-5).reverse())
      }
    } catch {
      // Silently handle parse errors
    }
  }

  useEffect(() => {
    loadRecentHistory()
  }, [])

  async function handleMoodSelect(mood: MoodType) {
    setSelectedMood(mood)
    setError(null)
    setShowInsight(false)
    setLoading(true)

    const config = MOOD_CONFIG[mood]
    const newEntry: MoodEntry = {
      id: crypto.randomUUID(),
      mood,
      score: config.score,
      timestamp: new Date().toISOString(),
    }

    // Store to localStorage
    let moodHistory: MoodEntry[] = []
    try {
      const stored = localStorage.getItem('anchor_mood_history')
      if (stored) {
        moodHistory = JSON.parse(stored)
      }
    } catch {
      moodHistory = []
    }

    moodHistory.push(newEntry)
    localStorage.setItem('anchor_mood_history', JSON.stringify(moodHistory))

    // Update recent history display
    setRecentHistory(moodHistory.slice(-5).reverse())

    // Get user profile
    let profile = null
    try {
      const profileStr = localStorage.getItem('anchor_user_profile')
      if (profileStr) {
        profile = JSON.parse(profileStr)
      }
    } catch {
      // No profile available
    }

    // Call insight API
    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMood: mood,
          currentScore: config.score,
          moodHistory,
          profile,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get insight. Please try again.')
      }

      const data = await response.json()
      setInsight(data.data ?? data)
      setShowInsight(true)

      // Save AI insight back into the mood entry for caregiver visibility
      const insightText = data.data?.insight || data.insight || "";
      if (insightText) {
        const updatedHistory = [...moodHistory];
        const lastEntry = updatedHistory[updatedHistory.length - 1];
        if (lastEntry) {
          lastEntry.aiInsight = insightText;
          localStorage.setItem('anchor_mood_history', JSON.stringify(updatedHistory));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getRiskBadgeClasses(level: string) {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'elevated':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return ''
    }
  }

  async function handleJournalSubmit() {
    if (!journalInput.trim() || journalLoading) return
    setJournalLoading(true)
    setJournalInsight(null)

    // Save to journal
    try {
      const existing = JSON.parse(localStorage.getItem('anchor_journal') || '[]')
      existing.push({
        id: crypto.randomUUID(),
        text: journalInput.trim(),
        mood: selectedMood || undefined,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('anchor_journal', JSON.stringify(existing.slice(-50)))
    } catch { /* silent */ }

    // Get AI response
    try {
      const profileRaw = localStorage.getItem('anchor_user_profile')
      const profile = profileRaw ? JSON.parse(profileRaw) : null

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `User just logged during check-in: "${journalInput}"${selectedMood ? ` (mood: ${selectedMood})` : ''}. Respond in ONE sentence (max 15 words) — validate their feeling and give one tiny suggestion. No questions.`,
          mode: 'journal',
          profile,
          recentMoods: [],
        }),
      })

      if (response.ok) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let text = ''
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            text += decoder.decode(value, { stream: true })
          }
        }
        setJournalInsight(text)
      }
    } catch { /* silent */ }

    setJournalInput('')
    setJournalLoading(false)
  }

  function formatDate(timestamp: string) {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const moodKeys = Object.keys(MOOD_CONFIG) as MoodType[]

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Daily Check-in</h1>
          <p className="text-muted-foreground">How are you feeling right now?</p>
        </div>

        {/* Mood Grid */}
        <Card className="p-6">
          <div
            className="grid grid-cols-4 gap-3"
            role="group"
            aria-label="Mood selection"
          >
            {moodKeys.map((mood) => {
              const config = MOOD_CONFIG[mood]
              return (
                <Button
                  key={mood}
                  variant={selectedMood === mood ? 'default' : 'outline'}
                  className="flex h-auto flex-col gap-1 py-3 text-center"
                  aria-label={`Select mood: ${mood}`}
                  aria-pressed={selectedMood === mood}
                  onClick={() => handleMoodSelect(mood)}
                  disabled={loading}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {config.emoji}
                  </span>
                  <span className="text-xs capitalize">{config.label}</span>
                </Button>
              )
            })}
          </div>
        </Card>

        {/* Quick Journal Log */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <PenLine className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Want to say more? Log what&apos;s on your mind.</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={journalInput}
              onChange={(e) => setJournalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJournalSubmit()}
              placeholder="What's triggering this feeling..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
              disabled={journalLoading}
            />
            <Button
              size="sm"
              onClick={handleJournalSubmit}
              disabled={!journalInput.trim() || journalLoading}
              aria-label="Log feeling"
              className="shrink-0"
            >
              {journalLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {journalInsight && (
            <p className="mt-2.5 text-sm text-primary flex items-start gap-1.5">
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              {journalInsight}
            </p>
          )}
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-6">
            <div className="flex items-center justify-center gap-3" role="status" aria-live="polite">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Analyzing your mood pattern...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 p-6" role="alert">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Insight Display */}
        {insight && showInsight && (
          <div
            className="space-y-4 animate-in fade-in duration-500"
            aria-live="polite"
          >
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  AI Insight
                </h2>
                <Badge className={getRiskBadgeClasses(insight.riskAssessment.riskLevel)}>
                  {insight.riskAssessment.riskLevel} risk
                </Badge>
              </div>
              <p className="text-sm leading-relaxed">{insight.insight}</p>
            </Card>

            {/* Intervention Link */}
            {insight.riskAssessment.shouldIntervene && (
              <Card className="border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                <Link
                  href="/chat"
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  aria-label="AI detected a pattern - Talk to AnchorAI"
                >
                  <span aria-hidden="true">🚨</span>
                  AI detected a pattern – Talk to AnchorAI
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* Recent Mood History */}
        {recentHistory.length > 0 && (
          <Card className="p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Check-ins
            </h2>
            <ul className="space-y-2" aria-label="Recent mood history">
              {recentHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true">{MOOD_CONFIG[entry.mood]?.emoji ?? '❓'}</span>
                    <span className="capitalize">{entry.mood}</span>
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(entry.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </main>
  )
}
