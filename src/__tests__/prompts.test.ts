import { describe, it, expect } from 'vitest';
import { buildChatSystemPrompt, buildScriptSystemPrompt, buildInsightSystemPrompt, buildCaregiverSystemPrompt } from '../lib/prompts';
import type { UserProfile, MoodEntry } from '../lib/types';

const mockProfile: UserProfile = {
  name: 'Alex',
  triggers: ['parties', 'work stress'],
  recoveryStage: 'early',
  supportContacts: [{ name: 'Sam', relationship: 'partner', phone: '555-0123' }],
  myWhy: 'For my daughter',
  copingPreferences: ['breathwork'],
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('buildChatSystemPrompt', () => {
  it('includes user name in prompt', () => {
    const prompt = buildChatSystemPrompt('calm', mockProfile, []);
    expect(prompt).toContain('Alex');
  });

  it('includes user triggers', () => {
    const prompt = buildChatSystemPrompt('calm', mockProfile, []);
    expect(prompt).toContain('parties');
    expect(prompt).toContain('work stress');
  });

  it('includes user why', () => {
    const prompt = buildChatSystemPrompt('crisis', mockProfile, []);
    expect(prompt).toContain('For my daughter');
  });

  it('includes mood history context when provided', () => {
    const moods: MoodEntry[] = [{ id: '1', mood: 'anxious', score: 3, timestamp: '2024-01-01T00:00:00.000Z' }];
    const prompt = buildChatSystemPrompt('calm', mockProfile, moods);
    expect(prompt).toContain('anxious');
  });

  it('works without profile', () => {
    const prompt = buildChatSystemPrompt('calm', null, []);
    expect(prompt).toContain('AnchorAI');
  });

  it('uses crisis prompt in crisis mode', () => {
    const prompt = buildChatSystemPrompt('crisis', mockProfile, []);
    expect(prompt).toContain('CRISIS');
  });
});

describe('buildScriptSystemPrompt', () => {
  it('includes personalization when profile provided', () => {
    const prompt = buildScriptSystemPrompt(mockProfile);
    expect(prompt).toContain('Alex');
    expect(prompt).toContain('For my daughter');
  });
});

describe('buildInsightSystemPrompt', () => {
  it('includes prevention instruction', () => {
    const prompt = buildInsightSystemPrompt(mockProfile);
    expect(prompt).toContain('prevention');
  });
});

describe('buildCaregiverSystemPrompt', () => {
  it('includes CRAFT method reference', () => {
    const prompt = buildCaregiverSystemPrompt(mockProfile);
    expect(prompt).toContain('CRAFT');
  });
});
