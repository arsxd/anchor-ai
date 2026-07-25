import { describe, it, expect } from 'vitest';
import { detectRiskPattern, calculateTrend } from '../services/insight-service';
import type { MoodEntry } from '../lib/types';

function makeMood(mood: string, score: number, daysAgo: number = 0): MoodEntry {
  return {
    id: crypto.randomUUID(),
    mood: mood as MoodEntry["mood"],
    score,
    timestamp: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  };
}

describe('detectRiskPattern', () => {
  it('returns low risk for empty history', () => {
    const result = detectRiskPattern([]);
    expect(result.riskLevel).toBe('low');
    expect(result.shouldIntervene).toBe(false);
  });

  it('returns low risk for positive moods', () => {
    const moods = [makeMood('happy', 9), makeMood('calm', 7), makeMood('determined', 8)];
    const result = detectRiskPattern(moods);
    expect(result.riskLevel).toBe('low');
    expect(result.shouldIntervene).toBe(false);
  });

  it('detects elevated risk when 3+ negative moods', () => {
    const moods = [makeMood('anxious', 3), makeMood('craving', 2), makeMood('sad', 3), makeMood('calm', 7)];
    const result = detectRiskPattern(moods);
    expect(result.riskLevel).toBe('elevated');
    expect(result.shouldIntervene).toBe(true);
  });

  it('detects high risk when 4+ negative moods', () => {
    const moods = [makeMood('craving', 2), makeMood('anxious', 2), makeMood('sad', 3), makeMood('craving', 1), makeMood('frustrated', 3)];
    const result = detectRiskPattern(moods);
    expect(result.riskLevel).toBe('high');
    expect(result.shouldIntervene).toBe(true);
  });
});

describe('calculateTrend', () => {
  it('returns stable for single entry', () => {
    expect(calculateTrend([makeMood('calm', 7)])).toBe('stable');
  });

  it('detects improving trend', () => {
    const moods = [makeMood('sad', 3), makeMood('anxious', 3), makeMood('calm', 7), makeMood('happy', 9)];
    expect(calculateTrend(moods)).toBe('improving');
  });

  it('detects declining trend', () => {
    const moods = [makeMood('happy', 9), makeMood('calm', 7), makeMood('anxious', 3), makeMood('craving', 2)];
    expect(calculateTrend(moods)).toBe('declining');
  });
});
